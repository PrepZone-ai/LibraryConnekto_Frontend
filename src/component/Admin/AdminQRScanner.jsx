import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../lib/api';

const AdminQRScanner = () => {
  const { userType } = useAuth();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [transferResult, setTransferResult] = useState(null);

  useEffect(() => {
    if (userType !== 'admin') {
      navigate('/admin/auth');
      return;
    }
    const scanner = new Html5QrcodeScanner('admin-qr-reader', { fps: 10, qrbox: 220 }, false);
    scanner.render(
      (decodedText) => {
        setToken(decodedText);
      },
      () => {}
    );
    return () => {
      scanner.clear().catch(() => {});
    };
  }, [navigate, userType]);

  const handleScan = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const result = await apiClient.post('/admin/scan-student-qr', { qr_token: token });
      setScanResult(result);
      setTransferResult(null);
    } catch (err) {
      alert(err.message || 'Scan failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!scanResult?.student_uuid || !amount) return;
    setLoading(true);
    try {
      const result = await apiClient.post('/admin/transfers/initiate', {
        student_uuid: scanResult.student_uuid,
        amount: Number(amount),
      });
      setTransferResult(result);
    } catch (err) {
      alert(err.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 p-6 pt-24">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/90 rounded-2xl border border-slate-700/50 p-6">
          <h2 className="text-white text-xl font-semibold mb-4">Admin QR Scanner</h2>
          <div id="admin-qr-reader" className="rounded-xl overflow-hidden bg-white" />
          <textarea
            value={token}
            onChange={(e) => setToken(e.target.value)}
            rows={3}
            placeholder="Manual token paste"
            className="mt-4 w-full bg-slate-700/60 border border-slate-600 rounded-lg text-white p-3"
          />
          <button
            onClick={handleScan}
            disabled={loading}
            className="mt-3 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg"
          >
            Scan Student QR
          </button>
        </div>
        <div className="bg-slate-800/90 rounded-2xl border border-slate-700/50 p-6 text-white">
          <h3 className="text-lg font-semibold mb-4">Student Details</h3>
          {scanResult ? (
            <div className="space-y-2 text-sm">
              <p>Name: {scanResult.name}</p>
              <p>Email: {scanResult.email}</p>
              <p>Mobile: {scanResult.mobile_no}</p>
              <p>Student ID: {scanResult.student_id}</p>
              <p className="text-xs text-slate-300">UUID: {scanResult.student_uuid}</p>
              <p>Library: {scanResult.current_library_name}</p>
              <p>Tasks: {scanResult.task_summary?.completed}/{scanResult.task_summary?.total}</p>
              <p>Subscription: {scanResult.subscription_status}</p>
              {scanResult.can_transfer && (
                <>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Transfer amount"
                    className="mt-3 w-full bg-slate-700/60 border border-slate-600 rounded-lg text-white p-2"
                  />
                  <button
                    onClick={handleTransfer}
                    disabled={loading || !amount}
                    className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg"
                  >
                    Initiate Transfer and Send Payment Link
                  </button>
                </>
              )}
              {transferResult && (
                <div className="mt-3 p-3 bg-emerald-900/40 border border-emerald-700/40 rounded-lg">
                  <p>{transferResult.message}</p>
                  <p className="text-xs text-emerald-200 mt-1">Ref: {transferResult.payment_reference}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-slate-300 text-sm">Scan a student QR to view details and transfer options.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminQRScanner;
