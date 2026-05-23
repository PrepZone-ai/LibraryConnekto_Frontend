import { apiClient } from '../lib/api';

class PaymentService {
  // Initialize payment gateway (Razorpay example)
  static initializePaymentGateway() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        if (window.Razorpay) {
          resolve(window.Razorpay);
        } else {
          reject(new Error('Razorpay failed to load'));
        }
      };
      script.onerror = () => reject(new Error('Failed to load Razorpay script'));
      document.head.appendChild(script);
    });
  }

  // Create payment order
  static async createPaymentOrder(paymentData) {
    try {
      const response = await apiClient.post('/payment/create-order', paymentData);
      return response;
    } catch (error) {
      console.error('Error creating payment order:', error);
      throw error;
    }
  }

  // Process payment with Razorpay
  static async processPayment(paymentData, onSuccess, onError) {
    try {
      // Initialize Razorpay
      const Razorpay = await this.initializePaymentGateway();
      
      // Create payment order
      const orderData = await this.createPaymentOrder(paymentData);
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Public Razorpay key id
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Library Connekto',
        description: `Subscription Plan: ${paymentData.plan_name}`,
        order_id: orderData.id,
        handler: async (response) => {
          try {
            // Verify payment on server
            const verificationData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan_id: paymentData.plan_id,
              student_id: paymentData.student_id
            };
            
            const verificationResponse = await apiClient.post('/payment/verify', verificationData);
            
            if (verificationResponse.success) {
              onSuccess(verificationResponse);
            } else {
              onError(new Error('Payment verification failed'));
            }
          } catch (error) {
            onError(error);
          }
        },
        prefill: {
          name: paymentData.student_name || '',
          email: paymentData.student_email || '',
          contact: paymentData.student_phone || ''
        },
        theme: {
          color: '#667eea'
        },
        modal: {
          ondismiss: () => {
            onError(new Error('Payment cancelled by user'));
          }
        }
      };

      const razorpay = new Razorpay(options);
      razorpay.open();
      
    } catch (error) {
      onError(error);
    }
  }

  // Alternative: Simple payment simulation (for testing)
  static async simulatePayment(paymentData) {
    return new Promise((resolve, reject) => {
      // Simulate payment processing
      setTimeout(() => {
        // Simulate 90% success rate
        if (Math.random() > 0.1) {
          resolve({
            success: true,
            payment_id: `sim_${Date.now()}`,
            message: 'Payment successful'
          });
        } else {
          reject(new Error('Payment failed'));
        }
      }, 2000);
    });
  }

  // Get payment methods
  static getPaymentMethods() {
    return [
      {
        id: 'razorpay',
        name: 'Razorpay',
        description: 'Credit/Debit Cards, UPI, Net Banking',
        icon: '💳',
        enabled: true
      },
      {
        id: 'simulation',
        name: 'Test Payment',
        description: 'Simulated payment for testing',
        icon: '🧪',
        enabled: import.meta.env.DEV
      }
    ];
  }

  // Rs.1 token payment for student seat booking
  static async initBookingTokenPayment({ library_id, subscription_plan_id, seat_id }) {
    return await apiClient.post('/booking/student-seat-booking/payment-init', { library_id, subscription_plan_id, seat_id });
  }

  static async verifyBookingTokenPayment(payload) {
    return await apiClient.post('/booking/student-seat-booking/payment-verify', payload);
  }

  // Rs.1 token payment for anonymous booking (no auth)
  static async initAnonymousBookingTokenPayment(payload) {
    return await apiClient.postAnonymous('/booking/anonymous-seat-booking/payment-init', payload);
  }

  static async verifyAnonymousBookingTokenPayment(payload) {
    return await apiClient.postAnonymous('/booking/anonymous-seat-booking/payment-verify', payload);
  }

  static async getAnonymousOrderStatus(orderId) {
    return await apiClient.getAnonymous(
      `/booking/anonymous-seat-booking/order-status/${encodeURIComponent(orderId)}`,
    );
  }

  static async completeAnonymousBookingByOrder(payload) {
    return await apiClient.postAnonymous(
      '/booking/anonymous-seat-booking/payment-complete-by-order',
      payload,
    );
  }

  static delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Razorpay UPI/QR often completes payment without firing the JS handler.
   * Poll order status, then finalize the booking on the server.
   */
  static async pollAndCompleteAnonymousBooking(orderId, bookingPayload, options = {}) {
    const maxAttempts = options.maxAttempts ?? 40;
    const intervalMs = options.intervalMs ?? 3000;
    const onProgress = options.onProgress;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      if (onProgress) onProgress(attempt, maxAttempts);
      const status = await this.getAnonymousOrderStatus(orderId);
      if (status?.paid) {
        return await this.completeAnonymousBookingByOrder({
          ...bookingPayload,
          razorpay_order_id: orderId,
        });
      }
      if (attempt < maxAttempts) {
        await this.delay(intervalMs);
      }
    }
    throw new Error(
      'Payment not detected yet. If money was deducted, wait a minute and submit again — we will not charge twice.',
    );
  }

  /**
   * Open Rs.1 token checkout for anonymous booking with UPI-safe completion.
   */
  static async payAnonymousBookingToken({ order, bookingPayload, prefill = {} }) {
    const Razorpay = await this.initializePaymentGateway();
    let settled = false;

    const runOnce = async (task) => {
      if (settled) return;
      settled = true;
      await task();
    };

    return new Promise((resolve, reject) => {
      const succeed = () => {
        if (!settled) return;
        resolve();
      };
      const fail = (err) => {
        if (settled) {
          reject(err);
          return;
        }
        reject(err);
      };

      const completeWithHandler = async (response) => {
        await runOnce(() =>
          this.verifyAnonymousBookingTokenPayment({
            ...bookingPayload,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }),
        );
        succeed();
      };

      const completeByPolling = async (pollOptions) => {
        await runOnce(() =>
          this.pollAndCompleteAnonymousBooking(order.id, bookingPayload, pollOptions),
        );
        succeed();
      };

      const rzp = new Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Library Connekto',
        description: 'Seat booking token payment',
        order_id: order.id,
        prefill: {
          name: prefill.name || '',
          email: prefill.email || '',
          contact: prefill.mobile || '',
        },
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
        },
        upi: { flow: 'intent' },
        handler: async (response) => {
          try {
            await completeWithHandler(response);
          } catch (err) {
            fail(err);
          }
        },
        modal: {
          ondismiss: async () => {
            if (settled) return;
            try {
              await completeByPolling({ maxAttempts: 20, intervalMs: 2000 });
            } catch (err) {
              settled = false;
              fail(
                new Error(
                  'If you already paid via UPI, wait a few seconds and click Submit again to confirm your booking.',
                ),
              );
            }
          },
        },
      });

      rzp.on('payment.success', async (response) => {
        try {
          await completeWithHandler(response);
        } catch (err) {
          fail(err);
        }
      });

      rzp.on('payment.failed', (response) => {
        if (settled) return;
        settled = true;
        const reason =
          response?.error?.description || response?.error?.reason || 'Payment failed';
        fail(new Error(reason));
      });

      rzp.open();
    });
  }
}

export default PaymentService;
