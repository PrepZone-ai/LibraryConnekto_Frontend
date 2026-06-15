import { apiClient } from '../lib/api';

/** Per-flow API endpoints for UPI-safe checkout. */
const FLOW_ENDPOINTS = {
  anonymous_token: {
    recoveryKey: 'lc_pending_anonymous_booking',
    pollStatus: (orderId) =>
      apiClient.getAnonymous(
        `/booking/anonymous-seat-booking/order-status/${encodeURIComponent(orderId)}`,
        true,
      ),
    completeByOrder: (payload) =>
      apiClient.postAnonymous(
        '/booking/anonymous-seat-booking/payment-complete-by-order',
        payload,
        true,
      ),
    verify: (payload) =>
      apiClient.postAnonymous('/booking/anonymous-seat-booking/payment-verify', payload, true),
  },
  student_token: {
    recoveryKey: 'lc_pending_student_booking',
    pollStatus: (orderId) =>
      apiClient.get(
        `/booking/student-seat-booking/order-status/${encodeURIComponent(orderId)}`,
        true,
        true,
      ),
    completeByOrder: (payload) =>
      apiClient.post('/booking/student-seat-booking/payment-complete-by-order', payload, true, true),
    verify: (payload) =>
      apiClient.post('/booking/student-seat-booking/payment-verify', payload, true, true),
  },
  booking_full: {
    recoveryKey: 'lc_pending_full_booking',
    pollStatus: (orderId) =>
      apiClient.getAnonymous(
        `/booking/full-payment/order-status/${encodeURIComponent(orderId)}`,
        true,
      ),
    completeByOrder: (payload) =>
      apiClient.postAnonymous('/booking/full-payment/complete-by-order', payload, true),
    verify: (payload) =>
      apiClient.postAnonymous('/booking/verify-razorpay-payment', payload, true),
  },
  subscription: {
    recoveryKey: 'lc_pending_subscription',
    pollStatus: (orderId) =>
      apiClient.get(`/payment/order-status/${encodeURIComponent(orderId)}`, true, true),
    completeByOrder: (payload) =>
      apiClient.post('/payment/complete-by-order', payload, true, true),
    verify: (payload) => apiClient.post('/payment/verify', payload, true, true),
  },
  transfer: {
    recoveryKey: 'lc_pending_transfer',
    pollStatus: (orderId) =>
      apiClient.getAnonymous(
        `/payment/transfer/order-status/${encodeURIComponent(orderId)}`,
        true,
      ),
    completeByOrder: (payload) =>
      apiClient.postAnonymous('/payment/transfer/complete-by-order', payload, true),
    verify: (payload) => apiClient.postAnonymous('/payment/transfer/verify', payload, true),
  },
};

class PaymentService {
  static initializePaymentGateway() {
    if (window.Razorpay) {
      return Promise.resolve(window.Razorpay);
    }
    return new Promise((resolve, reject) => {
      const existing = document.querySelector('script[src*="checkout.razorpay.com"]');
      if (existing) {
        existing.addEventListener('load', () =>
          window.Razorpay ? resolve(window.Razorpay) : reject(new Error('Razorpay failed to load')),
        );
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        if (window.Razorpay) resolve(window.Razorpay);
        else reject(new Error('Razorpay failed to load'));
      };
      script.onerror = () => reject(new Error('Failed to load Razorpay script'));
      document.head.appendChild(script);
    });
  }

  static delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static extractRazorpayPaymentIds(response, fallbackOrderId = '') {
    if (!response || typeof response !== 'object') {
      return {
        razorpay_order_id: fallbackOrderId || '',
        razorpay_payment_id: '',
        razorpay_signature: '',
      };
    }
    const nested = response.razorpay_payment_id
      ? response
      : response.data || response.payload || response.payment || response;
    return {
      razorpay_order_id:
        nested.razorpay_order_id ||
        nested.order_id ||
        response.razorpay_order_id ||
        fallbackOrderId ||
        '',
      razorpay_payment_id:
        nested.razorpay_payment_id || nested.payment_id || response.razorpay_payment_id || '',
      razorpay_signature:
        nested.razorpay_signature || nested.signature || response.razorpay_signature || '',
    };
  }

  static savePendingPayment(flowType, orderId, finalizePayload) {
    const cfg = FLOW_ENDPOINTS[flowType];
    if (!cfg) return;
    try {
      sessionStorage.setItem(
        cfg.recoveryKey,
        JSON.stringify({ orderId, finalizePayload, savedAt: Date.now() }),
      );
    } catch (_) {}
  }

  static clearPendingPayment(flowType) {
    const cfg = FLOW_ENDPOINTS[flowType];
    if (!cfg) return;
    try {
      sessionStorage.removeItem(cfg.recoveryKey);
    } catch (_) {}
  }

  static loadPendingPayment(flowType) {
    const cfg = FLOW_ENDPOINTS[flowType];
    if (!cfg) return null;
    try {
      const raw = sessionStorage.getItem(cfg.recoveryKey);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  /** Poll order status then finalize on the server. */
  static async pollAndComplete(flowType, orderId, finalizePayload, options = {}) {
    const cfg = FLOW_ENDPOINTS[flowType];
    if (!cfg) throw new Error(`Unknown payment flow: ${flowType}`);

    const maxAttempts = options.maxAttempts ?? 30;
    const intervalMs = options.intervalMs ?? 3000;
    const onProgress = options.onProgress;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      if (onProgress) onProgress(attempt, maxAttempts);
      const status = await cfg.pollStatus(orderId);
      if (status?.paid) {
        const result = await cfg.completeByOrder({
          ...finalizePayload,
          razorpay_order_id: orderId,
        });
        PaymentService.clearPendingPayment(flowType);
        return result;
      }
      if (attempt < maxAttempts) await PaymentService.delay(intervalMs);
    }
    throw new Error(
      'Payment not detected yet. If money was deducted, tap "I already paid" to confirm — we will not charge twice.',
    );
  }

  /** Resume confirmation after page refresh (no re-charge). */
  static async resumePendingPayment(flowType) {
    const pending = PaymentService.loadPendingPayment(flowType);
    if (!pending?.orderId || !pending?.finalizePayload) return null;
    return PaymentService.pollAndComplete(flowType, pending.orderId, pending.finalizePayload, {
      maxAttempts: 15,
      intervalMs: 2000,
    });
  }

  /**
   * Unified Razorpay checkout with UPI/QR-safe completion for all payment flows.
   */
  static async openRazorpayCheckout({
    flowType,
    order,
    finalizePayload,
    prefill = {},
    description = 'Library Connekto payment',
    onProgress,
  }) {
    const cfg = FLOW_ENDPOINTS[flowType];
    if (!cfg) throw new Error(`Unknown payment flow: ${flowType}`);

    const Razorpay = await PaymentService.initializePaymentGateway();
    PaymentService.savePendingPayment(flowType, order.id, finalizePayload);

    let finished = false;
    let completing = false;
    let rzpInstance = null;
    let pollTimer = null;

    const stopBackgroundPoll = () => {
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
    };

    const closeModal = () => {
      try {
        rzpInstance?.close();
      } catch (_) {}
    };

    const runExclusive = async (task) => {
      if (finished || completing) return false;
      completing = true;
      try {
        const result = await task();
        finished = true;
        stopBackgroundPoll();
        closeModal();
        PaymentService.clearPendingPayment(flowType);
        return result;
      } finally {
        completing = false;
      }
    };

    const finalizePayment = async (response) => {
      const ids = PaymentService.extractRazorpayPaymentIds(response, order.id);
      const hasSignature =
        ids.razorpay_order_id && ids.razorpay_payment_id && ids.razorpay_signature;

      if (hasSignature) {
        return cfg.verify({ ...finalizePayload, ...ids });
      }
      return PaymentService.pollAndComplete(flowType, order.id, finalizePayload, {
        maxAttempts: 20,
        intervalMs: 2000,
        onProgress,
      });
    };

    return new Promise((resolve, reject) => {
      const succeed = (result) => resolve(result ?? { success: true });
      const fail = (err) => {
        if (finished) return;
        stopBackgroundPoll();
        reject(err);
      };

      const completeAfterPayment = async (response) => {
        try {
          const result = await runExclusive(() => finalizePayment(response));
          if (result !== false) succeed(result);
        } catch (err) {
          fail(err);
        }
      };

      const completeByPolling = async (pollOptions, { silent = false } = {}) => {
        try {
          const result = await runExclusive(() =>
            PaymentService.pollAndComplete(flowType, order.id, finalizePayload, pollOptions),
          );
          if (result !== false) succeed(result);
        } catch (err) {
          if (silent) return;
          fail(
            err?.message?.includes('not detected')
              ? err
              : new Error(
                  'If you already paid via UPI, wait a few seconds and tap "I already paid" to confirm.',
                ),
          );
        }
      };

      rzpInstance = new Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'Library Connekto',
        description,
        order_id: order.id,
        prefill: {
          name: prefill.name || '',
          email: prefill.email || '',
          contact: prefill.contact || prefill.mobile || '',
        },
        method: { upi: true, card: true, netbanking: true, wallet: true },
        upi: { flow: 'intent' },
        handler: (response) => {
          void completeAfterPayment(response);
        },
        modal: {
          ondismiss: () => {
            if (finished || completing) return;
            void completeByPolling({ maxAttempts: 20, intervalMs: 2000, onProgress }, { silent: false });
          },
        },
      });

      rzpInstance.on('payment.success', (response) => {
        void completeAfterPayment(response);
      });

      rzpInstance.on('payment.failed', (response) => {
        if (finished || completing) return;
        stopBackgroundPoll();
        const reason =
          response?.error?.description || response?.error?.reason || 'Payment failed';
        fail(new Error(reason));
      });

      // Background poll while modal is open (UPI QR often skips handler)
      pollTimer = setInterval(() => {
        if (finished || completing) {
          stopBackgroundPoll();
          return;
        }
        void completeByPolling({ maxAttempts: 1, intervalMs: 0, onProgress }, { silent: true });
      }, 3000);

      rzpInstance.open();
    });
  }

  // --- Flow-specific helpers ---

  static async createPaymentOrder(paymentData) {
    return apiClient.post('/payment/create-order', paymentData);
  }

  static async processPayment(paymentData, onSuccess, onError) {
    try {
      const orderData = await PaymentService.createPaymentOrder(paymentData);
      const order = {
        id: orderData.order_id,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
      };
      const result = await PaymentService.openRazorpayCheckout({
        flowType: 'subscription',
        order,
        finalizePayload: {
          plan_id: paymentData.plan_id,
          student_id: paymentData.student_id,
        },
        prefill: {
          name: paymentData.student_name,
          email: paymentData.student_email,
          contact: paymentData.student_phone,
        },
        description: `Subscription: ${paymentData.plan_name || 'Plan'}`,
      });
      onSuccess(result);
    } catch (error) {
      onError(error);
    }
  }

  static getPaymentMethods() {
    return [
      { id: 'razorpay', name: 'Razorpay', description: 'Cards, UPI, Net Banking', icon: '💳', enabled: true },
    ];
  }

  static async initBookingTokenPayment({ library_id, subscription_plan_id, seat_id }) {
    return apiClient.post('/booking/student-seat-booking/payment-init', {
      library_id,
      subscription_plan_id,
      seat_id,
    });
  }

  static async initAnonymousBookingTokenPayment(payload) {
    return apiClient.postAnonymous('/booking/anonymous-seat-booking/payment-init', payload);
  }

  static async payAnonymousBookingToken({ order, bookingPayload, prefill = {}, onProgress }) {
    return PaymentService.openRazorpayCheckout({
      flowType: 'anonymous_token',
      order,
      finalizePayload: bookingPayload,
      prefill: { name: prefill.name, email: prefill.email, contact: prefill.mobile },
      description: 'Seat booking token payment',
      onProgress,
    });
  }

  static async payStudentBookingToken({ order, bookingPayload, prefill = {}, onProgress }) {
    return PaymentService.openRazorpayCheckout({
      flowType: 'student_token',
      order,
      finalizePayload: bookingPayload,
      prefill,
      description: 'Seat booking token payment',
      onProgress,
    });
  }

  static async payFullBookingAmount({ order, finalizePayload, prefill = {}, onProgress }) {
    return PaymentService.openRazorpayCheckout({
      flowType: 'booking_full',
      order,
      finalizePayload,
      prefill,
      description: 'Seat booking payment',
      onProgress,
    });
  }

  static async payTransferAmount({ order, finalizePayload, prefill = {}, onProgress }) {
    return PaymentService.openRazorpayCheckout({
      flowType: 'transfer',
      order,
      finalizePayload,
      prefill,
      description: 'Library transfer payment',
      onProgress,
    });
  }

  /** Plan amount in paise from API plan object (months/amount/discounted_amount). */
  static planAmountPaise(plan) {
    const raw = plan?.discounted_amount ?? plan?.amount ?? plan?.price ?? 0;
    return Math.round(parseFloat(raw) * 100);
  }

  static planDisplayName(plan) {
    if (plan?.plan_name) return plan.plan_name;
    const months = plan?.months ?? 1;
    return `${months} month${months === 1 ? '' : 's'}`;
  }
}

export default PaymentService;
