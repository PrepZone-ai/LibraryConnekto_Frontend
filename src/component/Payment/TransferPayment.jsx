import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '../../lib/api';
import PaymentService from '../../services/paymentService';

const TransferPayment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [transfer, setTransfer] = useState(null);
  const paymentReference = searchParams.get('ref') || '';

  useEffect(() => {
    const fetchTransfer = async () => {
      if (!paymentReference) {
        setError('Invalid transfer payment link.');
        setLoading(false);
        return;
      }
      try {
        const data = await apiClient.getAnonymous(`/payment/transfer/${paymentReference}`);
        setTransfer(data);
      } catch (err) {
        setError(err.message || 'Unable to load transfer details.');
      } finally {
        setLoading(false);
      }
    };
    fetchTransfer();
  }, [paymentReference]);

  const confirmPayment = async () => {
    setProcessing(true);
    setError('');
    try {
      const order = await apiClient.postAnonymous('/payment/transfer/create-order', {
        payment_reference: paymentReference,
      });

      const Razorpay = await PaymentService.initializePaymentGateway();
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        throw new Error('Razorpay key is missing in frontend environment.');
      }

      const razorpay = new Razorpay({
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency || 'INR',
        order_id: order.id,
        name: 'Library Connekto',
        description: 'Library transfer payment',
        prefill: {
          name: transfer?.student_name || '',
          email: transfer?.student_email || '',
        },
        notes: {
          payment_reference: paymentReference,
        },
        handler: async (response) => {
          try {
            const result = await apiClient.postAnonymous('/payment/transfer/verify', {
              payment_reference: paymentReference,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            navigate('/payment/success', {
              state: {
                message: 'Transfer payment completed and your library transfer is now active.',
                booking: {
                  amount: transfer?.amount,
                  library_name: 'Transferred Library',
                  subscription_months: 1,
                  seat_number: 'N/A',
                  status: result?.status || 'completed',
                },
              },
            });
          } catch (verifyErr) {
            setError(verifyErr.message || 'Transfer verification failed.');
          } finally {
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
          },
        },
      });
      razorpay.open();
      return;
    } catch (err) {
      setError(err.message || 'Payment confirmation failed.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Loading transfer payment...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-slate-800/80 rounded-2xl border border-slate-700/50 p-8 text-white">
        <h1 className="text-3xl font-bold mb-3">Transfer Payment</h1>
        <p className="text-slate-300 mb-6">Pay this amount to complete your transfer to the new library.</p>
        {error && <div className="mb-4 p-3 rounded-lg bg-red-900/40 border border-red-700/50 text-red-200">{error}</div>}
        {transfer && (
          <div className="space-y-3 mb-6">
            <div className="flex justify-between"><span className="text-slate-300">Student</span><span>{transfer.student_name || '-'}</span></div>
            <div className="flex justify-between"><span className="text-slate-300">Email</span><span>{transfer.student_email || '-'}</span></div>
            <div className="flex justify-between"><span className="text-slate-300">Reference</span><span className="font-mono text-sm">{transfer.payment_reference}</span></div>
            <div className="flex justify-between text-xl font-semibold"><span>Amount</span><span>INR {transfer.amount}</span></div>
          </div>
        )}
        <button
          onClick={confirmPayment}
          disabled={processing || !transfer || transfer.status === 'completed'}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
        >
          {processing ? 'Opening Payment...' : transfer?.status === 'completed' ? 'Already Completed' : 'Pay Online with Razorpay'}
        </button>
      </div>
    </div>
  );
};

export default TransferPayment;
