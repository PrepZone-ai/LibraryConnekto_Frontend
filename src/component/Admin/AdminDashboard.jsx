import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import { 
  PieChartComponent, 
  DonutChartComponent, 
  BarChartComponent, 
  ProgressRing,
  StatCardWithChart 
} from '../common/Charts';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, userType, logout, setUser } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalSeats: 0,
    occupiedSeats: 0,
    pendingBookings: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [removalRequestsPreview, setRemovalRequestsPreview] = useState([]);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [topPanelPercent, setTopPanelPercent] = useState(25); // pending bookings height percent in right column (1/4 = 25%)
  const [panelOrderTop, setPanelOrderTop] = useState('bookings'); // 'bookings' | 'messages'
  const sidebarRef = useRef(null);

  useEffect(() => {
    if (userType !== 'admin') {
      navigate('/admin/auth');
      return;
    }
    
    // Check if admin details are complete
    checkAdminDetails();
  }, [userType, navigate]);

  const checkAdminDetails = async () => {
    try {
      const adminDetails = await apiClient.get('/admin/details');
      if (!adminDetails.is_complete) {
        navigate('/admin/details');
        return;
      }
      // Update user context with library name
      if (adminDetails.library_name) {
        setUser(prev => ({
          ...prev,
          library_name: adminDetails.library_name
        }));
      }
      fetchDashboardData();
    } catch (error) {
      console.error('Error checking admin details:', error);
      if ((error?.message || '').toLowerCase().includes('not authenticated')) {
        navigate('/admin/auth');
      } else {
        navigate('/admin/details');
      }
    }
  };

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, bookingsResponse, pendingListResponse, messagesResponse, activitiesResponse, removalPreviewResponse] = await Promise.all([
        apiClient.get('/admin/stats'),
        apiClient.get('/admin/analytics/dashboard'),
        // Some backends do not allow GET with this route; ignore 405 gracefully
        apiClient.get('/booking/seat-bookings?status=pending').catch(() => []),
        apiClient.get('/messaging/admin/messages').catch(() => []),
        apiClient.get('/admin/recent-activities?limit=5').catch(() => []),
        apiClient.get('/student-removal/requests?status=pending&limit=5&offset=0').catch(() => ({ requests: [] }))
      ]);
      
      
      setStats({
        totalStudents: statsResponse.total_students || 0,
        activeStudents: statsResponse.present_students || 0,
        totalSeats: statsResponse.total_seats || 0,
        // Treat each registered student as occupying a seat; cap by total seats
        occupiedSeats: Math.min(statsResponse.total_students || 0, statsResponse.total_seats || 0),
        pendingBookings: (bookingsResponse?.library_stats?.pending_bookings) || 0,
        totalRevenue: statsResponse.total_revenue || 0
      });

      if (Array.isArray(pendingListResponse)) {
        setPendingBookings(pendingListResponse);
      }
      if (Array.isArray(messagesResponse)) {
        // Show only messages received from students
        const fromStudents = messagesResponse.filter(m => (m?.sender_type || '').toLowerCase() === 'student');
        const sorted = [...fromStudents].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setRecentMessages(sorted);
      }
      if (Array.isArray(activitiesResponse)) {
        setRecentActivities(activitiesResponse);
      }
      if (removalPreviewResponse && Array.isArray(removalPreviewResponse.requests)) {
        setRemovalRequestsPreview(removalPreviewResponse.requests);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleBookingApproval = async (bookingId, status) => {
    try {
      await apiClient.put(`/booking/seat-bookings/${bookingId}`, { status });
      alert(`Booking ${status} successfully!`);
      setSelectedBooking(null);
      fetchDashboardData(); // Refresh the data
    } catch (error) {
      console.error(`Error ${status} booking:`, error);
      alert(`Failed to ${status} booking. Please try again.`);
    }
  };

  const getBookingStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'accepted':
        return 'border-l-4 border-l-green-400 bg-green-500/10';
      case 'rejected':
        return 'border-l-4 border-l-red-400 bg-red-500/10';
      case 'pending':
      default:
        return 'border-l-4 border-l-yellow-400 bg-yellow-500/10';
    }
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - activityTime) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  const getActivityColor = (color) => {
    const colorMap = {
      'emerald': 'from-emerald-400 to-green-500 shadow-emerald-500/50',
      'blue': 'from-blue-400 to-cyan-500 shadow-blue-500/50',
      'purple': 'from-purple-400 to-pink-500 shadow-purple-500/50',
      'green': 'from-green-400 to-emerald-500 shadow-green-500/50',
      'red': 'from-red-400 to-rose-500 shadow-red-500/50',
      'yellow': 'from-yellow-400 to-orange-500 shadow-yellow-500/50'
    };
    return colorMap[color] || 'from-gray-400 to-gray-500 shadow-gray-500/50';
  };

  // Handle vertical resizing by dragging divider
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !sidebarRef.current) return;
      const rect = sidebarRef.current.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;
      const percent = Math.max(15, Math.min(40, (relativeY / rect.height) * 100)); // Allow 15% to 40% for bookings (keeping messages 60% to 85%)
      setTopPanelPercent(percent);
    };
    const handleMouseUp = () => setIsDragging(false);
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Drag-and-drop reorder between top/bottom panels
  const onPanelDragStart = (e, which) => {
    try { e.dataTransfer.setData('text/plain', which); } catch (_) {}
  };
  const onPanelDragOver = (e) => {
    e.preventDefault();
  };
  const onPanelDrop = (e, target) => {
    e.preventDefault();
    let source = null;
    try { source = e.dataTransfer.getData('text/plain'); } catch (_) {}
    if (!source || source === target) return;
    // Swap only if source and target differ
    setPanelOrderTop(source);
  };

  const StatCard = ({ title, value, icon, color = 'blue', gradient = 'from-blue-500 to-cyan-500' }) => (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white/70 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-purple-200 group-hover:bg-clip-text transition-all duration-300">{value}</p>
        </div>
        <div className={`p-4 rounded-2xl bg-gradient-to-r ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <span className="text-white text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );

  const RatioStatCard = ({ title, numerator, denominator, icon, gradient = 'from-blue-500 to-cyan-500' }) => {
    const safeDen = denominator || 0;
    const percent = safeDen > 0 ? Math.min(100, Math.round((numerator / safeDen) * 100)) : 0;
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white/70 mb-1">{title}</p>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-purple-200 group-hover:bg-clip-text transition-all duration-300">{numerator}</span>
              <span className="text-white/60">/</span>
              <span className="text-xl font-semibold text-white/80">{denominator}</span>
            </div>
            <div className="mt-3 h-2 w-full bg-white/10 rounded-full overflow-hidden">
              <div className={`h-full bg-gradient-to-r ${gradient}`} style={{ width: `${percent}%` }}></div>
            </div>
            <p className="mt-1 text-xs text-white/60">{percent}%</p>
          </div>
          <div className={`p-4 rounded-2xl bg-gradient-to-r ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <span className="text-white text-2xl">{icon}</span>
          </div>
        </div>
      </div>
    );
  };

  const QuickActionCard = ({ title, description, icon, onClick, gradient = 'from-purple-500 to-pink-500' }) => (
    <div 
      className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-105 group border border-white/20"
      onClick={onClick}
    >
      <div className="flex items-center space-x-4">
        <div className={`p-4 rounded-2xl bg-gradient-to-r ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <span className="text-white text-2xl">{icon}</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-purple-200 group-hover:bg-clip-text transition-all duration-300">{title}</h3>
          <p className="text-sm text-white/70">{description}</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/30 border-t-white"></div>
            <p className="text-white/70 mt-4">Loading dashboard...</p>
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
          {/* Compact Header with Action */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Dashboard{user?.library_name ? <span className="text-white/60"> · {user.library_name}</span> : null}
            </h2>
            <button
              onClick={() => setShowAddStudentModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-semibold shadow-lg shadow-blue-500/25 hover:from-indigo-700 hover:to-blue-700 transition-all"
              title="Add single student or import in bulk"
            >
              <span>➕</span>
              <span>Add Students</span>
            </button>
          </div>

          {/* Welcome Section for Empty State */}
          {stats.totalStudents === 0 && stats.totalSeats === 0 && (
            <div className="mb-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-xl">
              <div className="text-center">
                <div className="text-6xl mb-4">🎓</div>
                <h3 className="text-2xl font-bold text-white mb-2">Welcome to Your Library Dashboard!</h3>
                <p className="text-white/70 mb-6 max-w-2xl mx-auto">
                  Get started by adding students and configuring your library settings. Your dashboard will show beautiful charts and analytics once you have some data.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => setShowAddStudentModal(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:from-emerald-700 hover:to-green-700 transition-all"
                  >
                    <span>👥</span>
                    <span>Add Your First Students</span>
                  </button>
                  <button
                    onClick={() => navigate('/admin/details')}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-semibold border border-white/20 hover:bg-white/20 transition-all"
                  >
                    <span>⚙️</span>
                    <span>Configure Library</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Top row: Enhanced Stats with Charts (3/4) + Right sidebar (1/4) */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8 items-stretch">
            <div className="lg:col-span-3">
              {/* Enhanced Stats Cards with Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div 
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group cursor-pointer relative"
                  onClick={() => navigate('/admin/attendance-details')}
                  title="Click to view detailed attendance records"
                >
                  {/* Enhanced Hover Tooltip */}
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-20">
                    <div className="bg-gradient-to-br from-emerald-600 to-green-700 border border-emerald-400/30 rounded-lg p-2 shadow-lg text-center whitespace-nowrap backdrop-blur-sm">
                      <div className="flex items-center justify-center gap-1.5 mb-0.5">
                        <span className="text-emerald-200 text-base">📊</span>
                        <p className="text-white text-xs font-semibold">View Attendance Details</p>
                      </div>
                      <p className="text-emerald-100/80 text-[10px]">Click to see daily attendance records</p>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-3 border-r-3 border-t-3 border-transparent border-t-emerald-600"></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium text-white/70 mb-1">Students (Active / Total)</p>
                      <p className="text-3xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-purple-200 group-hover:bg-clip-text transition-all duration-300">
                        {stats.activeStudents}/{stats.totalStudents}
                      </p>
                      <p className="text-xs text-white/60 mt-1">
                        {stats.totalStudents > 0 ? `${Math.round((stats.activeStudents / stats.totalStudents) * 100)}% Active` : 'No students yet'}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white text-2xl">👥</span>
                    </div>
                  </div>
                  {stats.totalStudents > 0 && (
                    <div className="h-16 w-full">
                      <div className="flex items-center justify-between text-xs text-white/60 mb-2">
                        <span>Active: {stats.activeStudents}</span>
                        <span>Inactive: {stats.totalStudents - stats.activeStudents}</span>
                      </div>
                      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all duration-1000" 
                          style={{ width: `${(stats.activeStudents / stats.totalStudents) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                <div 
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group cursor-pointer relative"
                  onClick={() => navigate('/admin/seat-management')}
                  title="Click to manage library seats"
                >
                  {/* Enhanced Hover Tooltip */}
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-20">
                    <div className="bg-gradient-to-br from-purple-600 to-pink-700 border border-purple-400/30 rounded-lg p-2 shadow-lg text-center whitespace-nowrap backdrop-blur-sm">
                      <div className="flex items-center justify-center gap-1.5 mb-0.5">
                        <span className="text-purple-200 text-base">🪑</span>
                        <p className="text-white text-xs font-semibold">Manage Library Seats</p>
                      </div>
                      <p className="text-purple-100/80 text-[10px]">Click to view seat layout and assignments</p>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-3 border-r-3 border-t-3 border-transparent border-t-purple-600"></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium text-white/70 mb-1">Seats (Occupied / Total)</p>
                      <p className="text-3xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-purple-200 group-hover:bg-clip-text transition-all duration-300">
                        {stats.occupiedSeats}/{stats.totalSeats}
                      </p>
                      <p className="text-xs text-white/60 mt-1">
                        {stats.totalSeats > 0 ? `${Math.round((stats.occupiedSeats / stats.totalSeats) * 100)}% Occupied` : 'No seats configured'}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white text-2xl">🪑</span>
                    </div>
                  </div>
                  {stats.totalSeats > 0 && (
                    <div className="h-16 w-full">
                      <div className="flex items-center justify-between text-xs text-white/60 mb-2">
                        <span>Occupied: {stats.occupiedSeats}</span>
                        <span>Available: {stats.totalSeats - stats.occupiedSeats}</span>
                      </div>
                      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-400 to-pink-500 transition-all duration-1000" 
                          style={{ width: `${(stats.occupiedSeats / stats.totalSeats) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                <div 
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group cursor-pointer relative"
                  onClick={() => navigate('/admin/revenue-details')}
                  title="Click to view detailed revenue information"
                >
                  {/* Enhanced Hover Tooltip */}
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-20">
                    <div className="bg-gradient-to-br from-amber-600 to-orange-700 border border-amber-400/30 rounded-lg p-2 shadow-lg text-center whitespace-nowrap backdrop-blur-sm">
                      <div className="flex items-center justify-center gap-1.5 mb-0.5">
                        <span className="text-amber-200 text-base">💰</span>
                        <p className="text-white text-xs font-semibold">View Revenue Details</p>
                      </div>
                      <p className="text-amber-100/80 text-[10px]">Click to see complete transaction history</p>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-3 border-r-3 border-t-3 border-transparent border-t-amber-600"></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium text-white/70 mb-1">Total Revenue</p>
                      <p className="text-3xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-purple-200 group-hover:bg-clip-text transition-all duration-300">
                        ₹{stats.totalRevenue.toLocaleString()}
                      </p>
                      <p className="text-xs text-white/60 mt-1">
                        {stats.totalRevenue > 0 ? 'Revenue generated' : 'No revenue yet'}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white text-2xl">💰</span>
                    </div>
                  </div>
                  {stats.totalRevenue > 0 && (
                    <div className="h-16 w-full">
                      <div className="flex items-center justify-between text-xs text-white/60 mb-2">
                        <span>Monthly: ₹{Math.floor(stats.totalRevenue * 0.1).toLocaleString()}</span>
                        <span>Growth: +12%</span>
                      </div>
                      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-1000" 
                          style={{ width: '75%' }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Chart Visualizations Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Students Distribution Pie Chart */}
                <PieChartComponent
                  title="Student Distribution"
                  data={stats.totalStudents > 0 ? [
                    { name: 'Active Students', value: stats.activeStudents },
                    { name: 'Inactive Students', value: Math.max(0, stats.totalStudents - stats.activeStudents) }
                  ] : [
                    { name: 'No Students Yet', value: 1 }
                  ]}
                  colors={stats.totalStudents > 0 ? ['#10B981', '#EF4444'] : ['#6B7280']}
                  height={250}
                />

                {/* Seat Utilization Donut Chart */}
                <DonutChartComponent
                  title="Seat Utilization"
                  data={stats.totalSeats > 0 ? [
                    { name: 'Occupied Seats', value: stats.occupiedSeats },
                    { name: 'Available Seats', value: Math.max(0, stats.totalSeats - stats.occupiedSeats) }
                  ] : [
                    { name: 'No Seats Configured', value: 1 }
                  ]}
                  colors={stats.totalSeats > 0 ? ['#8B5CF6', '#6B7280'] : ['#6B7280']}
                  height={250}
                />
              </div>

              {/* Progress Rings Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl text-center">
                  <div className="relative inline-flex items-center justify-center mb-4">
                    <svg width={120} height={120} className="transform -rotate-90">
                      <circle
                        cx={60}
                        cy={60}
                        r={50}
                        stroke="#374151"
                        strokeWidth={8}
                        fill="transparent"
                      />
                      <circle
                        cx={60}
                        cy={60}
                        r={50}
                        stroke="#10B981"
                        strokeWidth={8}
                        fill="transparent"
                        strokeDasharray={314}
                        strokeDashoffset={314 - (stats.totalStudents > 0 ? (stats.activeStudents / stats.totalStudents) * 314 : 0)}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-in-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">
                          {stats.totalStudents > 0 ? Math.round((stats.activeStudents / stats.totalStudents) * 100) : 0}%
                        </div>
                        <div className="text-xs text-white/70">Active Rate</div>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Student Activity</h3>
                  <p className="text-sm text-white/60 mt-2">
                    {stats.totalStudents > 0 ? `${stats.activeStudents} of ${stats.totalStudents} students active` : 'No students registered yet'}
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl text-center">
                  <div className="relative inline-flex items-center justify-center mb-4">
                    <svg width={120} height={120} className="transform -rotate-90">
                      <circle
                        cx={60}
                        cy={60}
                        r={50}
                        stroke="#374151"
                        strokeWidth={8}
                        fill="transparent"
                      />
                      <circle
                        cx={60}
                        cy={60}
                        r={50}
                        stroke="#8B5CF6"
                        strokeWidth={8}
                        fill="transparent"
                        strokeDasharray={314}
                        strokeDashoffset={314 - (stats.totalSeats > 0 ? (stats.occupiedSeats / stats.totalSeats) * 314 : 0)}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-in-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">
                          {stats.totalSeats > 0 ? Math.round((stats.occupiedSeats / stats.totalSeats) * 100) : 0}%
                        </div>
                        <div className="text-xs text-white/70">Utilization</div>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Seat Occupancy</h3>
                  <p className="text-sm text-white/60 mt-2">
                    {stats.totalSeats > 0 ? `${stats.occupiedSeats} of ${stats.totalSeats} seats occupied` : 'No seats configured yet'}
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl text-center">
                  <div className="relative inline-flex items-center justify-center mb-4">
                    <svg width={120} height={120} className="transform -rotate-90">
                      <circle
                        cx={60}
                        cy={60}
                        r={50}
                        stroke="#374151"
                        strokeWidth={8}
                        fill="transparent"
                      />
                      <circle
                        cx={60}
                        cy={60}
                        r={50}
                        stroke="#F59E0B"
                        strokeWidth={8}
                        fill="transparent"
                        strokeDasharray={314}
                        strokeDashoffset={314 - (stats.pendingBookings > 0 ? Math.min(100, (stats.pendingBookings / 10) * 100) * 3.14 : 0)}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-in-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{stats.pendingBookings}</div>
                        <div className="text-xs text-white/70">Pending</div>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Booking Load</h3>
                  <p className="text-sm text-white/60 mt-2">
                    {stats.pendingBookings > 0 ? `${stats.pendingBookings} bookings awaiting approval` : 'No pending bookings'}
                  </p>
                </div>
              </div>

              {/* Quick Actions directly below stats */}
              <div className="mt-8">
                <h2 className="text-3xl font-bold text-white mb-8 text-center">
                  <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">Quick Actions</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <QuickActionCard
                    title="Student Management"
                    description="Add, edit, or view student information"
                    icon="👨‍🎓"
                    gradient="from-blue-500 to-cyan-500"
                    onClick={() => navigate('/admin/students')}
                  />
                  <QuickActionCard
                    title="Seat Management"
                    description="Manage library seating arrangements"
                    icon="🪑"
                    gradient="from-purple-500 to-pink-500"
                    onClick={() => navigate('/admin/seats')}
                  />
                  <QuickActionCard
                    title="Chat with Students"
                    description="Communicate and send messages to students"
                    icon="💬"
                    gradient="from-orange-500 to-red-500"
                    onClick={() => navigate('/admin/messages')}
                  />
                  <QuickActionCard
                    title="Removal Requests"
                    description="Review and process student removal requests"
                    icon="🗑️"
                    gradient="from-red-500 to-rose-500"
                    onClick={() => navigate('/admin/student-removal-requests')}
                  />
                  <QuickActionCard
                    title="Analytics"
                    description="View detailed reports and insights"
                    icon="📊"
                    gradient="from-emerald-500 to-green-500"
                    onClick={() => navigate('/admin/analytics')}
                  />
                  <QuickActionCard
                    title="Booking Management"
                    description="Manage all booking requests and approvals"
                    icon="📋"
                    gradient="from-orange-500 to-yellow-500"
                    onClick={() => navigate('/admin/booking-management')}
                  />
                </div>
              </div>
              {/* Recent Activity inside 3/4 column */}
              <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-xl">
                <h2 className="text-3xl font-bold text-white mb-6 text-center">
                  <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">Recent Activity</span>
                </h2>
                <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent space-y-4">
                  {recentActivities && recentActivities.length > 0 ? (
                    recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10">
                          <span className="text-lg">{activity.icon}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{activity.title}</p>
                          <p className="text-white/80 text-sm">{activity.description}</p>
                          <p className="text-white/60 text-xs mt-1">{getTimeAgo(activity.timestamp)}</p>
                        </div>
                        <div className={`w-3 h-3 bg-gradient-to-r ${getActivityColor(activity.color)} rounded-full shadow-lg`}></div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-white/60">No recent activities</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <div ref={sidebarRef} className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl h-full flex flex-col relative">
                {/* Top/Bottom panels with drag-and-drop reorder */}
                {(panelOrderTop === 'bookings') ? (
                  <div className="flex-1 flex flex-col" style={{ flexBasis: `${topPanelPercent}%` }}
                       draggable onDragStart={(e)=>onPanelDragStart(e,'bookings')}
                       onDragOver={onPanelDragOver} onDrop={(e)=>onPanelDrop(e,'bookings')}>
                    <div className="p-4 border-b border-white/10">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-semibold">Pending Bookings</h3>
                        <button
                          onClick={() => navigate('/admin/booking-management')}
                          className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30 transition-colors"
                        >
                          View All
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-64 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="text-white/70">
                            <th className="px-4 py-2 text-left">Name</th>
                            <th className="px-4 py-2 text-left">Mobile</th>
                            <th className="px-4 py-2 text-left">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pendingBookings && pendingBookings.length > 0 ? (
                            pendingBookings.slice(0, 5).map((b) => (
                              <tr key={b.id} className={`border-t border-white/10 text-white/90 hover:bg-white/5 cursor-pointer transition-colors ${getBookingStatusColor(b.status)}`} onClick={() => setSelectedBooking(b)}>
                                <td className="px-4 py-2">{b.name || '—'}</td>
                                <td className="px-4 py-2">{b.mobile || '—'}</td>
                                <td className="px-4 py-2">{b.created_at ? new Date(b.created_at).toLocaleDateString() : '—'}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="3" className="px-4 py-6 text-center text-white/60">No pending bookings</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col" style={{ flexBasis: `${topPanelPercent}%` }}
                       draggable onDragStart={(e)=>onPanelDragStart(e,'messages')}
                       onDragOver={onPanelDragOver} onDrop={(e)=>onPanelDrop(e,'messages')}>
                    <div className="p-4 border-b border-white/10">
                      <h3 className="text-white font-semibold">Messages from Students</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-96 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                      {recentMessages && recentMessages.length > 0 ? (
                        <ul className="divide-y divide-white/10">
                          {recentMessages.slice(0,5).map((m) => (
                            <li 
                              key={m.id} 
                              className="px-4 py-3 text-white/90 hover:bg-white/10 cursor-pointer transition-all duration-200 hover:shadow-md"
                              onClick={() => navigate('/admin/messages', { 
                                state: { 
                                  selectedStudent: {
                                    student_id: m.student_id,
                                    student_name: m.student_name || m.sender_email || 'Student'
                                  }
                                }
                              })}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{m.student_name || m.sender_email || 'Student'}</span>
                                <span className="text-xs text-white/60">{m.created_at ? new Date(m.created_at).toLocaleString() : ''}</span>
                              </div>
                              <p className="text-white/80 text-sm line-clamp-2 mt-1">{m.message}</p>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <p className="text-white/60">No messages</p>
                        </div>
                      )}
                    </div>
                    {/* Removal Requests preview directly under Messages (when messages are on top) */}
                    <div className="p-4 border-t border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white font-semibold">Removal Requests</h3>
                        <button
                          onClick={() => navigate('/admin/student-removal-requests')}
                          className="text-xs px-2 py-1 bg-red-500/20 text-red-300 rounded hover:bg-red-500/30 transition-colors"
                        >
                          View All
                        </button>
                      </div>
                      <div className="max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                        {removalRequestsPreview && removalRequestsPreview.length > 0 ? (
                          <ul className="divide-y divide-white/10">
                            {removalRequestsPreview.map((r) => (
                              <li key={r.id} className="py-2 text-white/90">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm truncate pr-2">{r.student_name || 'Student'}</span>
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 whitespace-nowrap">
                                    {r.status || 'pending'}
                                  </span>
                                </div>
                                <div className="text-[11px] text-white/60">Overdue: {r.days_overdue}</div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-center text-white/60 text-sm">No removal requests</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Drag handle */}
                <div
                  className="h-3 cursor-row-resize bg-white/5 hover:bg-white/10 transition-colors"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                ></div>

                {/* Bottom panel, opposite of top */}
                {(panelOrderTop === 'bookings') ? (
                  <div className="flex-1 flex flex-col" style={{ flexBasis: `${100 - topPanelPercent}%` }}
                       draggable onDragStart={(e)=>onPanelDragStart(e,'messages')}
                       onDragOver={onPanelDragOver} onDrop={(e)=>onPanelDrop(e,'messages')}>
                    <div className="p-4 border-b border-white/10">
                      <h3 className="text-white font-semibold">Messages from Students</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-96 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                      {recentMessages && recentMessages.length > 0 ? (
                        <ul className="divide-y divide-white/10">
                          {recentMessages.slice(0,5).map((m) => (
                            <li 
                              key={m.id} 
                              className="px-4 py-3 text-white/90 hover:bg-white/10 cursor-pointer transition-all duration-200 hover:shadow-md"
                              onClick={() => navigate('/admin/messages', { 
                                state: { 
                                  selectedStudent: {
                                    student_id: m.student_id,
                                    student_name: m.student_name || m.sender_email || 'Student'
                                  }
                                }
                              })}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{m.student_name || m.sender_email || 'Student'}</span>
                                <span className="text-xs text-white/60">{m.created_at ? new Date(m.created_at).toLocaleString() : ''}</span>
                              </div>
                              <p className="text-white/80 text-sm line-clamp-2 mt-1">{m.message}</p>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <p className="text-white/60">No messages</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col" style={{ flexBasis: `${100 - topPanelPercent}%` }}
                       draggable onDragStart={(e)=>onPanelDragStart(e,'bookings')}
                       onDragOver={onPanelDragOver} onDrop={(e)=>onPanelDrop(e,'bookings')}>
                    <div className="p-4 border-b border-white/10">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-semibold">Pending Bookings</h3>
                        <button
                          onClick={() => navigate('/admin/booking-management')}
                          className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30 transition-colors"
                        >
                          View All
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-64 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="text-white/70">
                            <th className="px-4 py-2 text-left">Name</th>
                            <th className="px-4 py-2 text-left">Mobile</th>
                            <th className="px-4 py-2 text-left">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pendingBookings && pendingBookings.length > 0 ? (
                            pendingBookings.slice(0, 5).map((b) => (
                              <tr key={b.id} className={`border-t border-white/10 text-white/90 hover:bg-white/5 cursor-pointer transition-colors ${getBookingStatusColor(b.status)}`} onClick={() => setSelectedBooking(b)}>
                                <td className="px-4 py-2">{b.name || '—'}</td>
                                <td className="px-4 py-2">{b.mobile || '—'}</td>
                                <td className="px-4 py-2">{b.created_at ? new Date(b.created_at).toLocaleDateString() : '—'}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="3" className="px-4 py-6 text-center text-white/60">No pending bookings</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    {/* New: Removal Requests preview below messages within sidebar (when messages are on bottom) */}
                    <div className="p-4 border-t border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white font-semibold">Removal Requests</h3>
                        <button
                          onClick={() => navigate('/admin/student-removal-requests')}
                          className="text-xs px-2 py-1 bg-red-500/20 text-red-300 rounded hover:bg-red-500/30 transition-colors"
                        >
                          View All
                        </button>
                      </div>
                      <div className="max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                        {removalRequestsPreview && removalRequestsPreview.length > 0 ? (
                          <ul className="divide-y divide-white/10">
                            {removalRequestsPreview.map((r) => (
                              <li key={r.id} className="py-2 text-white/90">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm truncate pr-2">{r.student_name || 'Student'}</span>
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 whitespace-nowrap">
                                    {r.status || 'pending'}
                                  </span>
                                </div>
                                <div className="text-[11px] text-white/60">Overdue: {r.days_overdue}</div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-center text-white/60 text-sm">No removal requests</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity moved above inside left column */}

          {/* (Removed duplicates of Quick Actions and Recent Activity here) */}
        </div>
      </main>

      {/* Add Student Method Selection Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-24 mx-auto p-6 w-96 shadow-2xl rounded-2xl bg-slate-800 border border-white/20">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Add Students</h3>
              <button
                onClick={() => setShowAddStudentModal(false)}
                className="text-white/60 hover:text-white"
                aria-label="Close"
              >
                ✖
              </button>
            </div>
            <p className="text-white/70 mb-6">Choose how you want to add students.</p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowAddStudentModal(false);
                  navigate('/admin/students', { state: { addStudentMode: 'single' } });
                }}
                className="w-full px-4 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all duration-200 shadow-lg shadow-emerald-500/25"
              >
                Add Single Student
              </button>
              <button
                onClick={() => {
                  setShowAddStudentModal(false);
                  navigate('/admin/students', { state: { addStudentMode: 'bulk' } });
                }}
                className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 shadow-lg shadow-blue-500/25"
              >
                Bulk Import (CSV)
              </button>
              <button
                onClick={() => setShowAddStudentModal(false)}
                className="w-full px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/20"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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

              {/* Student-specific booking details */}
              {(selectedBooking.date || selectedBooking.start_time || selectedBooking.end_time || selectedBooking.purpose) && (
                <div className="bg-slate-700/50 rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-white mb-3">Additional Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedBooking.date && (
                      <div>
                        <label className="text-sm text-white/70">Preferred Date</label>
                        <p className="text-white font-medium">{selectedBooking.date}</p>
                      </div>
                    )}
                    {selectedBooking.start_time && (
                      <div>
                        <label className="text-sm text-white/70">Start Time</label>
                        <p className="text-white font-medium">{selectedBooking.start_time}</p>
                      </div>
                    )}
                    {selectedBooking.end_time && (
                      <div>
                        <label className="text-sm text-white/70">End Time</label>
                        <p className="text-white font-medium">{selectedBooking.end_time}</p>
                      </div>
                    )}
                    {selectedBooking.purpose && (
                      <div className="md:col-span-2">
                        <label className="text-sm text-white/70">Purpose</label>
                        <p className="text-white font-medium">{selectedBooking.purpose}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
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
            </div>
          </div>
        </div>
      )}


      <Footer />
    </div>
  );
};

export default AdminDashboard;
