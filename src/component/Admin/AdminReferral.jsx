import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';
import FrontImage from '../../assets/Front.png';
import TransformImage from '../../assets/Transform.png';

const AdminReferral = () => {
  const navigate = useNavigate();
  const { userType, isLoggedIn } = useAuth();

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [codes, setCodes] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [summary, setSummary] = useState({ total_points: 0, completed: 0, pending: 0, total_referrals: 0 });
  const [creatingCode, setCreatingCode] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '' });
  const [submittingInvite, setSubmittingInvite] = useState(false);

  useEffect(() => {
    if (userType !== 'admin') {
      navigate('/admin/auth');
      return;
    }
    loadData();
  }, [userType]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [codesRes, refsRes, summaryRes] = await Promise.all([
        apiClient.get('/referral/codes'),
        apiClient.get('/referral/referrals'),
        apiClient.get('/referral/summary')
      ]);
      setCodes(codesRes || []);
      setReferrals(refsRes || []);
      setSummary(summaryRes || { total_points: 0, completed: 0, pending: 0, total_referrals: 0 });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to load referrals' });
    } finally {
      setLoading(false);
    }
  };

  const ensureAdminCode = async () => {
    try {
      setCreatingCode(true);
      const created = await apiClient.post('/referral/codes', { type: 'admin' });
      // refresh
      await loadData();
      setMessage({ type: 'success', text: 'Referral code ready' });
      return created;
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to create referral code' });
    } finally {
      setCreatingCode(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    if (!inviteForm.name.trim()) {
      setMessage({ type: 'error', text: 'Please enter name' });
      return;
    }
    try {
      setSubmittingInvite(true);
      let adminCode = codes.find(c => c.type === 'admin');
      if (!adminCode) {
        adminCode = await ensureAdminCode();
        if (!adminCode) return;
      }

      await apiClient.post('/referral/referrals', {
        referral_code_id: adminCode.id,
        referrer_id: adminCode.user_id,
        referrer_type: 'admin',
        referred_name: inviteForm.name.trim(),
        referred_email: inviteForm.email.trim() || null,
        status: 'pending',
        points_awarded: '0',
        notes: null
      });
      setInviteForm({ name: '', email: '' });
      setMessage({ type: 'success', text: 'Referral created successfully' });
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to create referral' });
    } finally {
      setSubmittingInvite(false);
    }
  };

  const adminCode = codes.find(c => c.type === 'admin');
  const shareText = adminCode ? `Join my library using referral code ${adminCode.code}` : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />

      <main className="flex-grow container mx-auto px-4 pt-24 pb-8 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        </div>

        <div className="max-w-6xl mx-auto relative">
          {/* Transformation banner (not in a card) */}
          <section className="mb-8">
            <div className="w-full rounded-2xl overflow-hidden">
              <div className="px-4 md:px-6 py-6 md:py-8 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 border border-white/10">
                <h1 className="text-center text-3xl md:text-4xl font-extrabold text-white mb-3">Grow with Referrals</h1>
                <p className="text-center text-white/70 text-sm md:text-base mb-6">Share your code, invite friends, and track your rewards — all in one place.</p>
                <div className="flex items-center justify-center gap-5 md:gap-8">
                  <img src={FrontImage} alt="Before using software" className="h-24 md:h-32 object-contain drop-shadow-xl" />
                  <div className="flex flex-col items-center gap-2">
                    <svg width="40" height="40" viewBox="0 0 24 24" className="text-white/80"><path fill="currentColor" d="M13 5l7 7l-7 7v-4H4v-6h9V5z"/></svg>
                    <span className="text-white/70 text-xs md:text-sm">to connect with use of our software</span>
                  </div>
                  <img src={TransformImage} alt="After using software" className="h-24 md:h-32 object-contain drop-shadow-xl" />
                </div>
              </div>
            </div>
          </section>
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-500/20 border border-green-500/30 text-green-300' 
                : 'bg-red-500/20 border border-red-500/30 text-red-300'
            }`}>
              {message.text}
            </div>
          )}

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-xl mb-8">
            {/* Header + actions */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs mb-2">
                  <span>🚀</span>
                  <span>Referral Program</span>
                </div>
                <h2 className="text-2xl font-bold text-white leading-tight">Invite admins or students and track your referrals</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigator.clipboard.writeText(shareText)}
                  disabled={!adminCode}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white/20 disabled:opacity-50"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" className="text-white"><path fill="currentColor" d="M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1Zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm0 16H8V7h11v14Z"/></svg>
                  <span>Copy Share Text</span>
                </button>
                <button
                  onClick={() => adminCode ? window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank') : null}
                  disabled={!adminCode}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 disabled:opacity-50"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" className="text-white"><path fill="currentColor" d="M20.52 3.48A11.78 11.78 0 0 0 12 0C5.38 0 0 5.37 0 12c0 2.1.55 4.17 1.6 6L0 24l6.2-1.6A12 12 0 0 0 12 24c6.63 0 12-5.37 12-12c0-3.14-1.22-6.09-3.48-8.52ZM12 22a10 10 0 0 1-5.12-1.43l-.37-.22l-3.7.96l.99-3.62l-.24-.37A10 10 0 1 1 22 12c0 5.52-4.48 10-10 10Zm5.43-7.35c-.3-.15-1.78-.88-2.06-.98s-.48-.15-.68.15s-.78.98-.96 1.18s-.35.22-.65.07s-1.26-.46-2.4-1.47c-.89-.78-1.49-1.74-1.66-2.04s-.02-.46.13-.61c.14-.14.3-.35.45-.52c.15-.18.2-.3.3-.49c.1-.19.05-.37-.02-.52s-.68-1.64-.94-2.24c-.24-.58-.49-.5-.68-.51h-.58c-.2 0-.52.08-.79.37s-1.05 1.02-1.05 2.5s1.08 2.9 1.23 3.1c.15.2 2.13 3.25 5.16 4.56c.72.31 1.28.5 1.72.64c.72.23 1.38.2 1.9.12c.58-.09 1.78-.73 2.03-1.43c.25-.7.25-1.3.17-1.43c-.08-.12-.27-.2-.57-.35Z"/></svg>
                  <span>Share via WhatsApp</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="rounded-xl p-6 bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/20 border border-white/20">
                <h3 className="text-white/80 font-semibold mb-3">Your Referral Code</h3>
                {adminCode ? (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-3xl font-extrabold text-white tracking-widest">{adminCode.code}</div>
                      <div className="text-white/60 text-xs mt-1">Created on {new Date(adminCode.created_at).toLocaleString()}</div>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(adminCode.code)}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1Zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm0 16H8V7h11v14Z"/></svg>
                      <span>Copy Code</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-white/70">No code yet. Generate one to start referring.</p>
                    <button
                      onClick={ensureAdminCode}
                      disabled={creatingCode}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg disabled:opacity-50"
                    >
                      {creatingCode ? 'Creating...' : 'Generate Code'}
                    </button>
                  </div>
                )}
              </div>

              <form onSubmit={handleInvite} className="rounded-xl p-6 bg-white/5 border border-white/10">
                <h3 className="text-white font-semibold mb-4">Refer a Friend</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/70 text-xs mb-1">Name</label>
                    <input
                      type="text"
                      value={inviteForm.name}
                      onChange={(e) => setInviteForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Friend's name"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-xs mb-1">Email (optional)</label>
                    <input
                      type="email"
                      value={inviteForm.email}
                      onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="friend@email.com"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingInvite}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold hover:from-emerald-700 hover:to-green-700 disabled:opacity-50"
                  >
                    {submittingInvite ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M2 21L23 12L2 3v7l15 2l-15 2v7Z"/></svg>
                        <span>Send Referral</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
                <div className="text-white/70 text-sm">Total Points</div>
                <div className="text-3xl font-bold text-white mt-1">{summary.total_points}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
                <div className="text-white/70 text-sm">Completed</div>
                <div className="text-3xl font-bold text-white mt-1">{summary.completed}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
                <div className="text-white/70 text-sm">Pending</div>
                <div className="text-3xl font-bold text-white mt-1">{summary.pending}</div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-semibold text-white">Your Referrals</h3>
              <button onClick={loadData} className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20">Refresh</button>
            </div>
            {loading ? (
              <div className="text-white/70">Loading...</div>
            ) : referrals && referrals.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-white/70">
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Email</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Points</th>
                      <th className="px-4 py-2 text-left">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referrals.map(r => (
                      <tr key={r.id} className="border-t border-white/10 text-white/90">
                        <td className="px-4 py-2">{r.referred_name}</td>
                        <td className="px-4 py-2">{r.referred_email || '—'}</td>
                        <td className="px-4 py-2 capitalize">{r.status}</td>
                        <td className="px-4 py-2">{r.points_awarded || '0'}</td>
                        <td className="px-4 py-2">{r.created_at ? new Date(r.created_at).toLocaleString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-white/60">No referrals yet.</div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminReferral;


