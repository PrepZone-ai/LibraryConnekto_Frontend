import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../lib/api';

/* ─── icons (inline SVG – no external dep) ─── */
const IconCamera = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IconStop = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const IconScan = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M4 6h4M4 6V4h2M4 6v2M20 6h-4M20 6V4h-2M20 6v2M4 18h4M4 18v2h2M4 18v-2M20 18h-4M20 18v2h-2M20 18v-2M8 12h8" />
  </svg>
);

/* ─── QR viewport id – stable, no React state ─── */
const QR_ELEMENT_ID = 'admin-qr-viewport';

const AdminQRScanner = () => {
  const { userType } = useAuth();
  const navigate = useNavigate();

  /* scanner instance lives outside React render cycle */
  const scannerRef = useRef(null);
  const isScanningRef = useRef(false);

  const [cameraActive, setCameraActive] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [scannedToken, setScannedToken] = useState('');   // token that came from camera
  const [scanResult, setScanResult] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [transferResult, setTransferResult] = useState(null);
  const [error, setError] = useState('');
  const [cameraError, setCameraError] = useState('');

  /* ── guard: admin only ── */
  useEffect(() => {
    if (userType !== 'admin') navigate('/admin/auth');
  }, [userType, navigate]);

  /* ── stop camera helper ── */
  const stopCamera = useCallback(async () => {
    if (scannerRef.current && isScanningRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch (_) { /* ignore */ }
      isScanningRef.current = false;
    }
    setCameraActive(false);
  }, []);

  /* ── cleanup on unmount ── */
  useEffect(() => () => { stopCamera(); }, [stopCamera]);

  /* ── start camera ── */
  const startCamera = useCallback(async () => {
    setCameraError('');
    setError('');
    setScanResult(null);
    setTransferResult(null);
    setScannedToken('');
    setManualToken('');

    const qrcode = new Html5Qrcode(QR_ELEMENT_ID);
    scannerRef.current = qrcode;

    try {
      await qrcode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 }, aspectRatio: 1.0 },
        async (decodedText) => {
          /* decoded → stop camera, fill token, auto-scan */
          await stopCamera();
          setScannedToken(decodedText);
          handleApiScan(decodedText);
        },
        () => { /* qr error frame – ignore */ }
      );
      isScanningRef.current = true;
      setCameraActive(true);
    } catch (err) {
      setCameraError(
        err?.message?.includes('Permission')
          ? 'Camera permission denied. Please allow camera access and try again.'
          : `Camera error: ${err?.message || 'Could not start camera.'}`
      );
    }
  }, [stopCamera]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── API call ── */
  const handleApiScan = async (token) => {
    const t = (token ?? manualToken).trim();
    if (!t) { setError('Enter or scan a QR token first.'); return; }
    setLoading(true);
    setError('');
    setScanResult(null);
    setTransferResult(null);
    try {
      const result = await apiClient.post('/admin/scan-student-qr', { qr_token: t });
      setScanResult(result);
    } catch (err) {
      setError(err.message || 'Scan failed. Invalid or expired QR token.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualScan = () => handleApiScan(manualToken);

  /* ── transfer ── */
  const handleTransfer = async () => {
    if (!scanResult?.student_uuid || !amount) return;
    setLoading(true);
    setError('');
    try {
      const result = await apiClient.post('/admin/transfers/initiate', {
        student_uuid: scanResult.student_uuid,
        amount: Number(amount),
      });
      setTransferResult(result);
    } catch (err) {
      setError(err.message || 'Transfer failed.');
    } finally {
      setLoading(false);
    }
  };

  /* ── reset everything ── */
  const handleReset = () => {
    setScanResult(null);
    setTransferResult(null);
    setScannedToken('');
    setManualToken('');
    setAmount('');
    setError('');
  };

  /* ─────────── UI ─────────── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 p-6 pt-24">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Left: Scanner panel ── */}
        <div className="bg-slate-800/90 rounded-2xl border border-slate-700/50 p-6 flex flex-col gap-4">
          <h2 className="text-white text-xl font-semibold flex items-center gap-2">
            <IconScan /> Admin QR Scanner
          </h2>

          {/* camera viewport – always rendered so Html5Qrcode can find the element */}
          <div
            id={QR_ELEMENT_ID}
            className="rounded-xl overflow-hidden bg-slate-900"
            style={{ minHeight: cameraActive ? 260 : 0, display: cameraActive ? 'block' : 'none' }}
          />

          {/* camera toggle */}
          {!cameraActive ? (
            <button
              onClick={startCamera}
              className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-500 transition-colors text-white py-2.5 rounded-xl font-medium"
            >
              <IconCamera /> Start Camera Scanner
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="flex items-center justify-center gap-2 w-full bg-red-600/80 hover:bg-red-500 transition-colors text-white py-2.5 rounded-xl font-medium"
            >
              <IconStop /> Stop Camera
            </button>
          )}

          {cameraError && (
            <p className="text-red-400 text-sm bg-red-900/30 border border-red-700/40 rounded-lg px-3 py-2">
              {cameraError}
            </p>
          )}

          {/* scanned token display (read-only, from camera) */}
          {scannedToken && (
            <div className="bg-emerald-900/30 border border-emerald-700/40 rounded-lg px-3 py-2">
              <p className="text-xs text-emerald-400 mb-0.5">Scanned token:</p>
              <p className="text-emerald-200 text-xs font-mono break-all">{scannedToken}</p>
            </div>
          )}

          {/* divider */}
          <div className="flex items-center gap-3 text-slate-500 text-xs">
            <div className="flex-1 border-t border-slate-700" />
            or enter manually
            <div className="flex-1 border-t border-slate-700" />
          </div>

          {/* manual token input */}
          <textarea
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value)}
            rows={3}
            placeholder="Paste QR token here…"
            className="w-full bg-slate-700/60 border border-slate-600 focus:border-indigo-500 outline-none rounded-xl text-white text-sm p-3 resize-none transition-colors"
          />

          <button
            onClick={handleManualScan}
            disabled={loading || !manualToken.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-white py-2.5 rounded-xl font-medium flex items-center justify-center gap-2"
          >
            {loading ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : <IconScan />}
            {loading ? 'Scanning…' : 'Scan Student QR'}
          </button>

          {error && (
            <p className="text-red-400 text-sm bg-red-900/30 border border-red-700/40 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>

        {/* ── Right: Student Details panel ── */}
        <div className="bg-slate-800/90 rounded-2xl border border-slate-700/50 p-6 text-white">
          <h3 className="text-lg font-semibold mb-4">Student Details</h3>

          {!scanResult ? (
            <p className="text-slate-400 text-sm">
              Use the camera or paste a token on the left to view student details and transfer options.
            </p>
          ) : (
            <div className="space-y-3 text-sm">
              {/* student info rows */}
              {[
                ['Name', scanResult.name],
                ['Email', scanResult.email],
                ['Mobile', scanResult.mobile_no],
                ['Student ID', scanResult.student_id],
                ['Library', scanResult.current_library_name],
                ['Subscription', scanResult.subscription_status],
                ['Tasks', `${scanResult.task_summary?.completed ?? 0} / ${scanResult.task_summary?.total ?? 0} completed`],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between gap-2 border-b border-slate-700/40 pb-1.5">
                  <span className="text-slate-400 shrink-0">{label}</span>
                  <span className="text-white text-right truncate">{val || '—'}</span>
                </div>
              ))}

              {/* transfer section */}
              {scanResult.can_transfer ? (
                <div className="pt-2 space-y-3">
                  <p className="text-indigo-300 text-xs font-medium uppercase tracking-wider">Transfer student to your library</p>
                  <input
                    type="number"
                    min={0}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter transfer amount (₹)"
                    className="w-full bg-slate-700/60 border border-slate-600 focus:border-indigo-500 outline-none rounded-xl text-white p-2.5 text-sm transition-colors"
                  />
                  <button
                    onClick={handleTransfer}
                    disabled={loading || !amount}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-white py-2.5 rounded-xl font-medium"
                  >
                    {loading ? 'Processing…' : 'Initiate Transfer & Send Payment Link'}
                  </button>
                </div>
              ) : (
                <p className="text-slate-400 text-xs pt-2">
                  This student already belongs to your library. Transfer is not available.
                </p>
              )}

              {/* transfer success */}
              {transferResult && (
                <div className="mt-3 p-3 bg-emerald-900/40 border border-emerald-700/40 rounded-xl">
                  <p className="text-emerald-300 font-medium">{transferResult.message}</p>
                  <p className="text-xs text-emerald-400 mt-1">Ref: {transferResult.payment_reference}</p>
                </div>
              )}

              {/* reset */}
              <button
                onClick={handleReset}
                className="w-full mt-2 border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white py-2 rounded-xl text-sm transition-colors"
              >
                Scan Another Student
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminQRScanner;
