import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';

const AdminBookingManagement = () => {
  const navigate = useNavigate();
  const { userType } = useAuth();
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'approved', 'rejected'
  const [searchTerm, setSearchTerm] = useState('');
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  useEffect(() => {
    if (userType !== 'admin') {
      navigate('/admin/auth');
      return;
    }
    fetchAllBookings();
  }, [userType, navigate]);

  const fetchAllBookings = async () => {
    try {
      setLoading(true);
      // Fetch all bookings regardless of status
      const response = await apiClient.get('/booking/seat-bookings');
      setAllBookings(response || []);
    } catch (error) {
      console.error('Error fetching all bookings:', error);
      setAllBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingApproval = async (bookingId, status) => {
    try {
      await apiClient.put(`/booking/seat-bookings/${bookingId}`, { status });
      alert(`Booking ${status} successfully!`);
      setSelectedBooking(null);
      fetchAllBookings(); // Refresh the data
    } catch (error) {
      console.error(`Error ${status} booking:`, error);
      alert(`Failed to ${status} booking. Please try again.`);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedBookings.length === 0) {
      alert('Please select at least one booking to perform bulk action.');
      return;
    }

    const confirmMessage = action === 'approved' 
      ? `Are you sure you want to approve ${selectedBookings.length} booking(s)?`
      : `Are you sure you want to reject ${selectedBookings.length} booking(s)?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setBulkActionLoading(true);
    try {
      const promises = selectedBookings.map(bookingId => 
        apiClient.put(`/booking/seat-bookings/${bookingId}`, { status: action })
      );
      
      await Promise.all(promises);
      alert(`Successfully ${action} ${selectedBookings.length} booking(s)!`);
      setSelectedBookings([]);
      fetchAllBookings();
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
      alert(`Failed to ${action} bookings. Please try again.`);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleSelectAll = () => {
    const filteredBookings = getFilteredBookings();
    const pendingBookings = filteredBookings.filter(b => b.status === 'pending');
    
    if (selectedBookings.length === pendingBookings.length) {
      setSelectedBookings([]);
    } else {
      setSelectedBookings(pendingBookings.map(b => b.id));
    }
  };

  const handleSelectBooking = (bookingId) => {
    setSelectedBookings(prev => 
      prev.includes(bookingId) 
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId]
    );
  };

  const getBookingStatusColor = (booking) => {
    // Check payment status first, then booking status
    if (booking.payment_status === 'paid') {
      return 'border-l-4 border-l-green-400 bg-green-500/10';
    } else if (booking.status === 'rejected') {
      return 'border-l-4 border-l-red-400 bg-red-500/10';
    } else if (booking.status === 'approved') {
      return 'border-l-4 border-l-blue-400 bg-blue-500/10';
    } else {
      return 'border-l-4 border-l-yellow-400 bg-yellow-500/10';
    }
  };

  const getStatusDisplay = (booking) => {
    if (booking.payment_status === 'paid') {
      return { text: 'Paid', color: 'bg-green-500/20 text-green-300 border-green-500/30' };
    } else if (booking.status === 'rejected') {
      return { text: 'Rejected', color: 'bg-red-500/20 text-red-300 border-red-500/30' };
    } else if (booking.status === 'approved') {
      return { text: 'Approved (Unpaid)', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
    } else {
      return { text: 'Pending', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' };
    }
  };

  const getFilteredBookings = () => {
    let filtered = allBookings;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(booking => 
        booking.status?.toLowerCase() === filterStatus.toLowerCase()
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.mobile?.includes(searchTerm) ||
        booking.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredBookings = getFilteredBookings();
  const pendingBookings = filteredBookings.filter(b => b.status === 'pending');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/30 border-t-white"></div>
            <p className="text-white/70 mt-4">Loading bookings...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 pt-24 pb-8 relative">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Booking Management</h2>
              <p className="text-white/70">Manage all booking requests and their status</p>
            </div>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 text-white text-sm font-semibold shadow-lg hover:from-slate-700 hover:to-slate-800 transition-all"
            >
              ← Back to Dashboard
            </button>
          </div>

          {/* Filters and Search */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                {/* Status Filter */}
                <div className="flex items-center space-x-2">
                  <label className="text-white/70 text-sm">Filter by status:</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 bg-slate-700/60 border border-slate-600/50 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Bookings</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name, mobile, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-slate-700/60 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent w-64"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Bulk Actions */}
              {pendingBookings.length > 0 && (
                <div className="flex items-center space-x-3">
                  <span className="text-white/70 text-sm">
                    {selectedBookings.length} of {pendingBookings.length} pending selected
                  </span>
                  <button
                    onClick={() => handleSelectAll()}
                    className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30 transition-colors text-sm"
                  >
                    {selectedBookings.length === pendingBookings.length ? 'Deselect All' : 'Select All Pending'}
                  </button>
                  <button
                    onClick={() => handleBulkAction('approved')}
                    disabled={selectedBookings.length === 0 || bulkActionLoading}
                    className="px-4 py-2 bg-green-500/20 text-green-300 rounded hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-semibold"
                  >
                    {bulkActionLoading ? 'Processing...' : `Approve All (${selectedBookings.length})`}
                  </button>
                  <button
                    onClick={() => handleBulkAction('rejected')}
                    disabled={selectedBookings.length === 0 || bulkActionLoading}
                    className="px-4 py-2 bg-red-500/20 text-red-300 rounded hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-semibold"
                  >
                    {bulkActionLoading ? 'Processing...' : `Reject All (${selectedBookings.length})`}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bookings Table */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-white/5">
                  <tr className="text-white/70 border-b border-white/20">
                    <th className="px-4 py-4 text-left">
                      {pendingBookings.length > 0 && (
                        <input
                          type="checkbox"
                          checked={selectedBookings.length === pendingBookings.length && pendingBookings.length > 0}
                          onChange={handleSelectAll}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-slate-600 rounded bg-slate-700"
                        />
                      )}
                    </th>
                    <th className="px-4 py-4 text-left">Name</th>
                    <th className="px-4 py-4 text-left">Mobile</th>
                    <th className="px-4 py-4 text-left">Email</th>
                    <th className="px-4 py-4 text-left">Date</th>
                    <th className="px-4 py-4 text-left">Status</th>
                    <th className="px-4 py-4 text-left">Amount</th>
                    <th className="px-4 py-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking) => {
                      const statusDisplay = getStatusDisplay(booking);
                      return (
                        <tr key={booking.id} className={`border-b border-white/10 text-white/90 hover:bg-white/5 transition-colors ${getBookingStatusColor(booking)}`}>
                          <td className="px-4 py-4">
                            {booking.status === 'pending' && (
                              <input
                                type="checkbox"
                                checked={selectedBookings.includes(booking.id)}
                                onChange={() => handleSelectBooking(booking.id)}
                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-slate-600 rounded bg-slate-700"
                              />
                            )}
                          </td>
                          <td className="px-4 py-4 font-medium">{booking.name || '—'}</td>
                          <td className="px-4 py-4">{booking.mobile || '—'}</td>
                          <td className="px-4 py-4">{booking.email || '—'}</td>
                          <td className="px-4 py-4">{booking.created_at ? new Date(booking.created_at).toLocaleDateString() : '—'}</td>
                          <td className="px-4 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusDisplay.color}`}>
                              {statusDisplay.text}
                            </span>
                          </td>
                          <td className="px-4 py-4">₹{booking.amount || '—'}</td>
                          <td className="px-4 py-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setSelectedBooking(booking)}
                                className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30 transition-colors text-xs"
                              >
                                View
                              </button>
                              {booking.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleBookingApproval(booking.id, 'approved')}
                                    className="px-3 py-1 bg-green-500/20 text-green-300 rounded hover:bg-green-500/30 transition-colors text-xs"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleBookingApproval(booking.id, 'rejected')}
                                    className="px-3 py-1 bg-red-500/20 text-red-300 rounded hover:bg-red-500/30 transition-colors text-xs"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-4 py-8 text-center text-white/60">
                        {searchTerm || filterStatus !== 'all' 
                          ? 'No bookings found matching your criteria' 
                          : 'No bookings found'
                        }
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold text-white">{allBookings.length}</div>
              <div className="text-white/70 text-sm">Total Bookings</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold text-yellow-300">{allBookings.filter(b => b.status === 'pending').length}</div>
              <div className="text-white/70 text-sm">Pending</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold text-blue-300">{allBookings.filter(b => b.status === 'approved' && b.payment_status !== 'paid').length}</div>
              <div className="text-white/70 text-sm">Approved (Unpaid)</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold text-green-300">{allBookings.filter(b => b.payment_status === 'paid').length}</div>
              <div className="text-white/70 text-sm">Paid</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold text-red-300">{allBookings.filter(b => b.status === 'rejected').length}</div>
              <div className="text-white/70 text-sm">Rejected</div>
            </div>
          </div>
        </div>
      </main>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 w-full max-w-2xl shadow-2xl rounded-2xl bg-slate-800 border border-white/20">
            <div className="flex items-start justify-between mb-6">
              <h3 className="text-2xl font-semibold text-white">Booking Details</h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-white/60 hover:text-white text-2xl"
                aria-label="Close"
              >
                ✖
              </button>
            </div>

            <div className="space-y-6">
              {/* Personal Information */}
              <div className="bg-slate-700/50 rounded-xl p-4">
                <h4 className="text-lg font-semibold text-white mb-3">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-white/70">Name</label>
                    <p className="text-white font-medium">{selectedBooking.name || '—'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-white/70">Mobile</label>
                    <p className="text-white font-medium">{selectedBooking.mobile || '—'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-white/70">Email</label>
                    <p className="text-white font-medium">{selectedBooking.email || '—'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-white/70">Address</label>
                    <p className="text-white font-medium">{selectedBooking.address || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Booking Information */}
              <div className="bg-slate-700/50 rounded-xl p-4">
                <h4 className="text-lg font-semibold text-white mb-3">Booking Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-white/70">Subscription Duration</label>
                    <p className="text-white font-medium">
                      {selectedBooking.subscription_months ? `${selectedBooking.subscription_months} month${selectedBooking.subscription_months > 1 ? 's' : ''}` : '—'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-white/70">Amount</label>
                    <p className="text-white font-medium">₹{selectedBooking.amount || '—'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-white/70">Booking Date</label>
                    <p className="text-white font-medium">
                      {selectedBooking.created_at ? new Date(selectedBooking.created_at).toLocaleDateString() : '—'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-white/70">Status</label>
                    <p className="text-white font-medium capitalize">{selectedBooking.status || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedBooking.status === 'pending' && (
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => handleBookingApproval(selectedBooking.id, 'approved')}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all duration-200 shadow-lg shadow-emerald-500/25 font-semibold"
                  >
                    ✓ Approve Booking
                  </button>
                  <button
                    onClick={() => handleBookingApproval(selectedBooking.id, 'rejected')}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 transition-all duration-200 shadow-lg shadow-red-500/25 font-semibold"
                  >
                    ✗ Reject Booking
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AdminBookingManagement;
