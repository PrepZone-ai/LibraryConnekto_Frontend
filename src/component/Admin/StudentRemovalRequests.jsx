import React, { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';

const StudentRemovalRequests = () => {
  const [removalRequests, setRemovalRequests] = useState([]);
  const [stats, setStats] = useState({
    total_requests: 0,
    pending_requests: 0,
    approved_requests: 0,
    rejected_requests: 0,
    overdue_students: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRemovalRequests();
    fetchStats();
  }, [selectedStatus]);

  const fetchRemovalRequests = async () => {
    try {
      setLoading(true);
      const params = selectedStatus !== 'all' ? { status: selectedStatus } : {};
      const response = await apiClient.get('/student-removal/requests', { params });
      setRemovalRequests(response.requests || []);
    } catch (error) {
      console.error('Error fetching removal requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/student-removal/stats');
      setStats(response);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleRequestAction = async (requestId, action) => {
    try {
      setProcessing(true);
      await apiClient.put(`/student-removal/requests/${requestId}`, {
        status: action,
        admin_notes: adminNotes
      });
      
      setShowModal(false);
      setAdminNotes('');
      setSelectedRequest(null);
      fetchRemovalRequests();
      fetchStats();
      
      alert(`Request ${action} successfully!`);
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      alert(`Failed to ${action} request. Please try again.`);
    } finally {
      setProcessing(false);
    }
  };

  const handleRestoreStudent = async (studentId) => {
    if (!confirm('Are you sure you want to restore this student? They will regain access to the library.')) {
      return;
    }

    try {
      setProcessing(true);
      await apiClient.post(`/student-removal/restore-student/${studentId}`);
      
      fetchRemovalRequests();
      fetchStats();
      
      alert('Student restored successfully!');
    } catch (error) {
      console.error('Error restoring student:', error);
      alert('Failed to restore student. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const openModal = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-red-100 text-red-800';
      case 'rejected': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'approved': return '✅';
      case 'rejected': return '❌';
      default: return '❓';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      <main className="flex-grow container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">🗑️ Student Removal Requests</h1>
            <p className="text-white/70">Manage students who haven't renewed their subscriptions</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/30 to-cyan-500/30">
                  <span className="text-2xl">📊</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-white/70">Total Requests</p>
                  <p className="text-2xl font-bold text-white">{stats.total_requests}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-gradient-to-r from-yellow-500/30 to-orange-500/30">
                  <span className="text-2xl">⏳</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-white/70">Pending</p>
                  <p className="text-2xl font-bold text-yellow-300">{stats.pending_requests}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-gradient-to-r from-red-500/30 to-rose-500/30">
                  <span className="text-2xl">✅</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-white/70">Approved</p>
                  <p className="text-2xl font-bold text-red-300">{stats.approved_requests}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-gradient-to-r from-green-500/30 to-emerald-500/30">
                  <span className="text-2xl">❌</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-white/70">Rejected</p>
                  <p className="text-2xl font-bold text-green-300">{stats.rejected_requests}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500/30 to-amber-500/30">
                  <span className="text-2xl">⚠️</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-white/70">Overdue Students</p>
                  <p className="text-2xl font-bold text-orange-300">{stats.overdue_students}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Removal Requests</h2>
              <div className="flex items-center space-x-4">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Requests</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <button
                  onClick={fetchRemovalRequests}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-colors"
                >
                  🔄 Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Requests Table */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/30 border-t-white mx-auto"></div>
                <p className="mt-4 text-white/70">Loading removal requests...</p>
              </div>
            ) : removalRequests.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-semibold text-white mb-2">No Removal Requests</h3>
                <p className="text-white/70">No students require removal at this time.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/10">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Subscription Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Request Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {removalRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-white/5">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-white">{request.student_name}</div>
                            <div className="text-sm text-white/70">{request.student_email}</div>
                            <div className="text-sm text-white/70">{request.student_phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-white">Expired: {new Date(request.subscription_end_date).toLocaleDateString()}</div>
                            <div className="text-sm text-white/70">{request.days_overdue}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {getStatusIcon(request.status)} {request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                          {new Date(request.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {request.status === 'pending' ? (
                            <div className="flex space-x-2">
                              <button onClick={() => openModal(request)} className="text-blue-300 hover:text-blue-200">Review</button>
                            </div>
                          ) : request.status === 'approved' ? (
                            <div className="flex space-x-2">
                              <span className="text-white/50">Removed</span>
                              <button
                                onClick={() => handleRestoreStudent(request.student_id)}
                                className="text-emerald-300 hover:text-emerald-200"
                                title="Restore student to library"
                              >
                                🔄 Restore
                              </button>
                            </div>
                          ) : (
                            <span className="text-white/50">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Action Modal */}
          {showModal && selectedRequest && (
            <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-slate-800 border border-white/20 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white">Review Removal Request</h3>
                    <button onClick={() => setShowModal(false)} className="text-white/60 hover:text-white">✕</button>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                      <h4 className="font-medium text-white mb-2">Student Information</h4>
                      <p className="text-white/80"><strong>Name:</strong> {selectedRequest.student_name}</p>
                      <p className="text-white/80"><strong>Email:</strong> {selectedRequest.student_email}</p>
                      <p className="text-white/80"><strong>Phone:</strong> {selectedRequest.student_phone}</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                      <h4 className="font-medium text-white mb-2">Subscription Details</h4>
                      <p className="text-white/80"><strong>Expired:</strong> {new Date(selectedRequest.subscription_end_date).toLocaleDateString()}</p>
                      <p className="text-white/80"><strong>Overdue:</strong> {selectedRequest.days_overdue}</p>
                      <p className="text-white/80"><strong>Reason:</strong> {selectedRequest.reason}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Admin Notes (Optional)</label>
                      <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 bg-white/10 text-white border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Add any notes about this decision..."
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-4 mt-6">
                    <button onClick={() => setShowModal(false)} className="px-4 py-2 text-white/70 hover:text-white transition-colors">Cancel</button>
                    <button
                      onClick={() => handleRequestAction(selectedRequest.id, 'rejected')}
                      disabled={processing}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    >
                      {processing ? 'Processing...' : '❌ Reject'}
                    </button>
                    <button
                      onClick={() => handleRequestAction(selectedRequest.id, 'approved')}
                      disabled={processing}
                      className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50"
                    >
                      {processing ? 'Processing...' : '✅ Approve Removal'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StudentRemovalRequests;
