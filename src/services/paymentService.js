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
        key: process.env.REACT_APP_RAZORPAY_KEY_ID, // Your Razorpay key
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
        enabled: process.env.NODE_ENV === 'development'
      }
    ];
  }

  // Rs.1 token payment for student seat booking
  static async initBookingTokenPayment({ library_id, subscription_plan_id, seat_id }) {
    const base = import.meta?.env?.VITE_API_BASE_URL || 'http://localhost:8000'
    const res = await fetch(`${base}/api/v1/booking/student-seat-booking/payment-init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
      },
      body: JSON.stringify({ library_id, subscription_plan_id, seat_id })
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  }

  static async verifyBookingTokenPayment({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    library_id,
    subscription_plan_id,
    seat_id,
    date,
    start_time,
    end_time,
    purpose,
    amount
  }) {
    const base = import.meta?.env?.VITE_API_BASE_URL || 'http://localhost:8000'
    const res = await fetch(`${base}/api/v1/booking/student-seat-booking/payment-verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
      },
      body: JSON.stringify({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        library_id,
        subscription_plan_id,
        seat_id,
        date,
        start_time,
        end_time,
        purpose,
        amount
      })
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  }

  // Rs.1 token payment for anonymous booking (no auth)
  static async initAnonymousBookingTokenPayment({ library_id, subscription_plan_id, seat_id, name, email, mobile }) {
    const base = import.meta?.env?.VITE_API_BASE_URL || 'http://localhost:8000'
    const res = await fetch(`${base}/api/v1/booking/anonymous-seat-booking/payment-init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ library_id, subscription_plan_id, seat_id, name, email, mobile })
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  }

  static async verifyAnonymousBookingTokenPayment(payload) {
    const base = import.meta?.env?.VITE_API_BASE_URL || 'http://localhost:8000'
    const res = await fetch(`${base}/api/v1/booking/anonymous-seat-booking/payment-verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  }
}

export default PaymentService;
