import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '../../lib/api';
import PaymentService from '../../services/paymentService';

const TransferPayment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
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

  const handleConfirmPending = async () => {
    setConfirmingPayment(true);
    setError('');
    try {
      const result = await PaymentService.resumePendingPayment('transfer');
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
    } catch (err) {
      setError(err?.message || 'Could not confirm payment yet.');
    } finally {
      setConfirmingPayment(false);
    }
  };

  const confirmPayment = async () => {
    setProcessing(true);
    setConfirmingPayment(true);
    setError('');
    try {
      const order = await apiClient.postAnonymous('/payment/transfer/create-order', {
        payment_reference: paymentReference,
      });

      const result = await PaymentService.payTransferAmount({
        order,
        finalizePayload: { payment_reference: paymentReference },
        prefill: {
          name: transfer?.student_name || '',
          email: transfer?.student_email || '',
        },
        onProgress: () => setConfirmingPayment(true),
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
    } catch (err) {
      setError(err.message || 'Payment confirmation failed.');
    } finally {
      setProcessing(false);
      setConfirmingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        Loading transfer payment...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-slate-800/80 rounded-2xl border border-slate-700/50 p-8 text-white">
        <h1 className="text-3xl font-bold mb-3">Transfer Payment</h1>
        <p className="text-slate-300 mb-6">Pay this amount to complete your transfer to the new library.</p>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-900/40 border border-red-700/50 text-red-200">
            {error}
            {PaymentService.loadPendingPayment('transfer') && (
              <button
                type="button"
                onClick={handleConfirmPending}
                disabled={confirmingPayment}
                className="mt-3 w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold disabled:opacity-50"
              >
                {confirmingPayment ? 'Confirming payment…' : 'I already paid — confirm transfer'}
              </button>
            )}
          </div>
        )}
        {confirmingPayment && !error && (
          <div className="mb-4 p-3 rounded-lg bg-blue-900/40 border border-blue-700/50 text-blue-200">
            Confirming your payment… Please wait.
          </div>
        )}
        {transfer && (
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-slate-300">Student</span>
              <span>{transfer.student_name || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Email</span>
              <span>{transfer.student_email || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Reference</span>
              <span className="font-mono text-sm">{transfer.payment_reference}</span>
            </div>
            <div className="flex justify-between text-xl font-semibold">
              <span>Amount</span>
              <span>INR {transfer.amount}</span>
            </div>
          </div>
        )}
        <button
          onClick={confirmPayment}
          disabled={processing || !transfer || transfer.status === 'completed'}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 font-semibold disabled:opacity-50"
        >
          {processing ? (confirmingPayment ? 'Confirming payment…' : 'Opening payment…') : 'Pay & Complete Transfer'}
        </button>
      </div>
    </div>
  );
};

export default TransferPayment;
