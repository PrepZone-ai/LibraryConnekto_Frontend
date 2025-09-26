import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import SubscriptionExpiryModal from './SubscriptionExpiryModal';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, userType, logout } = useAuth();
  const [stats, setStats] = useState({
    attendanceToday: false,
    totalStudyHours: 0,
    tasksCompleted: 0,
    totalTasks: 0,
    upcomingExams: 0,
    messagesUnread: 0
  });
  const [loading, setLoading] = useState(true);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [studentProfile, setStudentProfile] = useState(null);
  const [recentMessages, setRecentMessages] = useState([]);
  const [todaysTasks, setTodaysTasks] = useState([]);
  const [adminMessages, setAdminMessages] = useState([]);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  useEffect(() => {
    if (userType !== 'student') {
      navigate('/student/login');
      return;
    }
    fetchDashboardData();
  }, [userType, navigate]);

  const fetchDashboardData = async () => {
    try {
      // Fetch all dashboard data in parallel
      const [profileResponse, statsResponse, messagesResponse, tasksResponse] = await Promise.all([
        apiClient.get('/student/profile'),
        apiClient.get('/student/dashboard/stats'),
        apiClient.get('/student/dashboard/messages?limit=3'),
        apiClient.get('/student/tasks')
      ]);
      
      // Set profile data
      if (profileResponse) {
        setStudentProfile(profileResponse);
        console.log('Student profile:', profileResponse);
      }
      
      // Set dashboard stats
      if (statsResponse) {
        setStats({
          attendanceToday: statsResponse.attendance_today,
          totalStudyHours: statsResponse.total_study_hours,
          tasksCompleted: statsResponse.tasks_completed,
          totalTasks: statsResponse.total_tasks,
          upcomingExams: statsResponse.upcoming_exams,
          messagesUnread: statsResponse.messages_unread,
          studyStreak: statsResponse.study_streak,
          subscriptionStatus: statsResponse.subscription_status,
          subscriptionEnd: statsResponse.subscription_end
        });
      }
      
      // Set recent messages
      if (messagesResponse) {
        setRecentMessages(messagesResponse);
        console.log('Recent messages:', messagesResponse);
      }

      // Process tasks for today's schedule
      if (tasksResponse) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Filter tasks for today
        const todaysTasksData = tasksResponse.filter(task => {
          if (!task.due_date) return false;
          const taskDate = new Date(task.due_date);
          return taskDate >= today && taskDate < tomorrow;
        });

        setTodaysTasks(todaysTasksData);
        console.log('Today\'s tasks:', todaysTasksData);
      }

      // Filter admin messages (messages sent by admin, not by student)
      if (messagesResponse) {
        const adminMessagesData = messagesResponse.filter(message => 
          message.sender_type === 'admin'
        );
        setAdminMessages(adminMessagesData);
        console.log('Admin messages:', adminMessagesData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default stats on error
      setStats({
        attendanceToday: false,
        totalStudyHours: 0,
        tasksCompleted: 0,
        totalTasks: 0,
        upcomingExams: 0,
        messagesUnread: 0,
        studyStreak: 0,
        subscriptionStatus: 'Unknown',
        subscriptionEnd: null
      });
      setRecentMessages([]);
      setTodaysTasks([]);
      setAdminMessages([]);
    } finally {
      setLoading(false);
    }
  };

  // Check subscription status and show modal if needed
  useEffect(() => {
    if (stats.subscription_end && !loading) {
      const today = new Date();
      const expiryDate = new Date(stats.subscription_end);
      const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
      
      // Show modal if subscription is expired or expires in 1 day
      if (stats.subscription_status === 'Expired' || daysLeft === 1) {
        setShowSubscriptionModal(true);
      }
    }
  }, [stats, loading]);

  const markAttendance = async () => {
    try {
      // Get user's current location
      if (!navigator.geolocation) {
        alert('Geolocation is not supported by this browser. Please enable location services.');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const attendanceData = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
            
            await apiClient.post('/student/attendance/checkin', attendanceData);
            setAttendanceMarked(true);
            setStats(prev => ({ ...prev, attendanceToday: true }));
            
            // Refresh dashboard data to get updated stats
            fetchDashboardData();
          } catch (error) {
            console.error('Error marking attendance:', error);
            alert(`Failed to mark attendance: ${error.message}`);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Failed to get your location. Please enable location services and try again.');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Failed to mark attendance. Please try again.');
    }
  };

  const checkoutAttendance = async () => {
    try {
      await apiClient.post('/student/attendance/checkout');
      setAttendanceMarked(false);
      setStats(prev => ({ ...prev, attendanceToday: false }));
      
      // Refresh dashboard data to get updated stats
      fetchDashboardData();
      
      alert('Successfully checked out! Your study session has been recorded.');
    } catch (error) {
      console.error('Error checking out:', error);
      alert(`Failed to checkout: ${error.message}`);
    }
  };

  const StatCard = ({ title, value, icon, color = 'indigo', onClick }) => {
    const colorClasses = {
      indigo: 'border-indigo-500 bg-indigo-50 text-indigo-600',
      emerald: 'border-emerald-500 bg-emerald-50 text-emerald-600',
      amber: 'border-amber-500 bg-amber-50 text-amber-600',
      sky: 'border-sky-500 bg-sky-50 text-sky-600',
      purple: 'border-purple-500 bg-purple-50 text-purple-600',
      rose: 'border-rose-500 bg-rose-50 text-rose-600'
    };

    return (
      <div 
        className={`bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl p-6 border-l-4 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 border border-slate-700/50 ${onClick ? 'hover:bg-slate-700/90' : ''}`}
        style={{ borderLeftColor: colorClasses[color]?.split(' ')[0]?.replace('border-', '').replace('-500', '') }}
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-300 mb-1">{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
          </div>
          <div className={`p-4 rounded-2xl ${colorClasses[color]?.split(' ')[1]} shadow-md`}>
            <span className={`text-2xl ${colorClasses[color]?.split(' ')[2]}`}>{icon}</span>
          </div>
        </div>
      </div>
    );
  };

  const QuickActionCard = ({ title, description, icon, onClick, color = 'indigo' }) => {
    const colorClasses = {
      indigo: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100',
      emerald: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
      amber: 'bg-amber-50 text-amber-600 hover:bg-amber-100',
      sky: 'bg-sky-50 text-sky-600 hover:bg-sky-100',
      purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
      slate: 'bg-slate-50 text-slate-600 hover:bg-slate-100'
    };

    return (
      <div 
        className="bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl p-6 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 border border-slate-700/50 hover:bg-slate-700/90"
        onClick={onClick}
      >
        <div className="flex items-center space-x-4">
          <div className={`p-4 rounded-2xl ${colorClasses[color]} transition-colors duration-200 shadow-md`}>
            <span className="text-2xl">{icon}</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
            <p className="text-sm text-slate-300">{description}</p>
          </div>
          <div className="text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - 3/4 width */}
          <div className="lg:col-span-3">
            {/* Welcome Section */}
            <div className="mt-8 mb-6">
              <h1 className="text-2xl font-bold text-white mb-1">
                Welcome back, {studentProfile?.name || user?.name || 'Student'}! 🎓
              </h1>
              <p className="text-slate-300 text-sm">
                {studentProfile?.library_name ? `Study at ${studentProfile.library_name}` : 'Track your progress and manage your study schedule with ease.'}
              </p>
              {studentProfile?.student_id && (
                <p className="text-slate-400 text-xs mt-1">
                  Student ID: {studentProfile.student_id}
                </p>
              )}
            </div>

            {/* Attendance Section */}
            {!stats.attendanceToday && !attendanceMarked && (
              <div className="mb-8 bg-gradient-to-r from-amber-900/80 to-orange-900/80 border border-amber-700/50 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-amber-100 flex items-center">
                      <span className="text-2xl mr-2">⏰</span>
                      Mark Your Attendance
                    </h3>
                    <p className="text-amber-200">Don't forget to check in for today's study session!</p>
                  </div>
                  <button
                    onClick={markAttendance}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-3 rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
                  >
                    Check In
                  </button>
                </div>
                
                {/* Subscription Status Bar */}
                {studentProfile?.subscription_end && (
                  <div className="mt-4 pt-4 border-t border-amber-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-amber-200 text-sm font-medium">📚 Library Subscription:</span>
                        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                          stats.subscriptionStatus === 'Active' 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}>
                          {stats.subscriptionStatus}
                        </span>
                      </div>
                      <div className="text-right">
                        {(() => {
                          const today = new Date();
                          const expiryDate = new Date(studentProfile.subscription_end);
                          const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
                          const isUrgent = daysLeft <= 5 && daysLeft > 0;
                          
                          return (
                            <>
                              <div className={`text-sm font-semibold ${isUrgent ? 'text-red-300 animate-pulse' : 'text-amber-200'}`}>
                                {daysLeft > 0 ? (
                                  <>
                                    {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                                    {isUrgent && <span className="ml-2">⚠️</span>}
                                  </>
                                ) : daysLeft === 0 ? (
                                  'Expires today'
                                ) : (
                                  `Expired ${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? 's' : ''} ago`
                                )}
                              </div>
                              <div className="text-amber-300/70 text-xs">
                                Expires: {new Date(studentProfile.subscription_end).toLocaleDateString()}
                              </div>
                              {isUrgent && (
                                <button 
                                  onClick={() => navigate('/student/subscription')}
                                  className="mt-1 text-xs bg-red-500/20 text-red-300 hover:bg-red-500/30 px-2 py-1 rounded-full border border-red-500/30 transition-colors"
                                >
                                  Renew Now
                                </button>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {stats.attendanceToday && (
              <div className="mb-8 bg-gradient-to-r from-emerald-900/80 to-green-900/80 border border-emerald-700/50 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-emerald-600 rounded-full">
                      <span className="text-emerald-100 text-2xl">✅</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-emerald-100">Checked In</h3>
                      <p className="text-emerald-200">Great! You're checked in for today's study session.</p>
                    </div>
                  </div>
                  <button
                    onClick={checkoutAttendance}
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Check Out
                  </button>
                </div>
                
                {/* Subscription Status Bar */}
                {studentProfile?.subscription_end && (
                  <div className="mt-4 pt-4 border-t border-emerald-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-emerald-200 text-sm font-medium">📚 Library Subscription:</span>
                        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                          stats.subscriptionStatus === 'Active' 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}>
                          {stats.subscriptionStatus}
                        </span>
                      </div>
                      <div className="text-right">
                        {(() => {
                          const today = new Date();
                          const expiryDate = new Date(studentProfile.subscription_end);
                          const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
                          const isUrgent = daysLeft <= 5 && daysLeft > 0;
                          
                          return (
                            <>
                              <div className={`text-sm font-semibold ${isUrgent ? 'text-red-300 animate-pulse' : 'text-emerald-200'}`}>
                                {daysLeft > 0 ? (
                                  <>
                                    {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                                    {isUrgent && <span className="ml-2">⚠️</span>}
                                  </>
                                ) : daysLeft === 0 ? (
                                  'Expires today'
                                ) : (
                                  `Expired ${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? 's' : ''} ago`
                                )}
                              </div>
                              <div className="text-emerald-300/70 text-xs">
                                Expires: {new Date(studentProfile.subscription_end).toLocaleDateString()}
                              </div>
                              {isUrgent && (
                                <button 
                                  onClick={() => navigate('/student/subscription')}
                                  className="mt-1 text-xs bg-red-500/20 text-red-300 hover:bg-red-500/30 px-2 py-1 rounded-full border border-red-500/30 transition-colors"
                                >
                                  Renew Now
                                </button>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Study Hours - Circular Progress */}
              <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700/50 p-4">
                <h3 className="text-lg font-bold text-white mb-3">Study Hours Today</h3>
                <div className="flex items-center justify-center">
                  <div className="relative w-24 h-24">
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-600"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-sky-500"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        fill="none"
                        strokeDasharray={`${(stats.totalStudyHours / 8) * 100}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-xl font-bold text-white">{stats.totalStudyHours}h</div>
                        <div className="text-xs text-slate-400">of 8h goal</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <div className="text-sm text-slate-300">⏰ Daily Progress</div>
                </div>
              </div>

              {/* Tasks Completed - Bar Chart */}
              <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700/50 p-4">
                <h3 className="text-lg font-bold text-white mb-3">Tasks Progress</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Completed</span>
                    <span className="text-sm font-bold text-emerald-400">{stats.tasksCompleted}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${stats.totalTasks > 0 ? (stats.tasksCompleted / stats.totalTasks) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Total Tasks</span>
                    <span className="text-sm font-bold text-white">{stats.totalTasks}</span>
                  </div>
                  <div className="text-center mt-3">
                    <div className="text-xl font-bold text-emerald-400">
                      {stats.totalTasks > 0 ? Math.round((stats.tasksCompleted / stats.totalTasks) * 100) : 0}%
                    </div>
                    <div className="text-xs text-slate-400">✅ Completion Rate</div>
                  </div>
                  {/* Additional task breakdown */}
                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="text-center">
                        <div className="text-slate-400">Today's Tasks</div>
                        <div className="text-white font-semibold">{todaysTasks.length}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-slate-400">Pending</div>
                        <div className="text-amber-400 font-semibold">{stats.totalTasks - stats.tasksCompleted}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Unread Messages - Notification Badge Style */}
              <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700/50 p-4">
                <h3 className="text-lg font-bold text-white mb-3">Messages</h3>
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-2xl">💬</span>
                    </div>
                    {adminMessages.filter(msg => !msg.read).length > 0 && (
                      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                        {adminMessages.filter(msg => !msg.read).length > 9 ? '9+' : adminMessages.filter(msg => !msg.read).length}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <div className="text-xl font-bold text-white">{adminMessages.filter(msg => !msg.read).length}</div>
                  <div className="text-sm text-slate-300">Unread Admin Messages</div>
                  <button 
                    onClick={() => navigate('/student/messages')}
                    className="mt-2 text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                  >
                    View Messages →
                  </button>
                </div>
              </div>

              {/* Study Streak - Fire Animation */}
              <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700/50 p-4">
                <h3 className="text-lg font-bold text-white mb-3">Study Streak</h3>
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2 animate-pulse">🔥</div>
                    <div className="text-2xl font-bold text-rose-400">{stats.studyStreak || 0}</div>
                    <div className="text-sm text-slate-300">
                      {stats.studyStreak === 1 ? 'Day in a row' : 'Days in a row'}
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-center space-x-1">
                    {Array.from({ length: Math.min(stats.studyStreak || 0, 7) }, (_, i) => (
                      <div key={i} className="w-2 h-2 bg-gradient-to-r from-rose-500 to-orange-500 rounded-full"></div>
                    ))}
                    {Array.from({ length: Math.max(0, 7 - (stats.studyStreak || 0)) }, (_, i) => (
                      <div key={i + (stats.studyStreak || 0)} className="w-2 h-2 bg-slate-600 rounded-full"></div>
                    ))}
                  </div>
                  <div className="text-center mt-2">
                    <div className="text-xs text-slate-400">
                      {stats.studyStreak > 0 ? "Keep it up! 🎯" : "Start your streak today! 🚀"}
                    </div>
                  </div>
                </div>
              </div>
             </div>
           </div>

          {/* Right Column - 1/4 width */}
          <div className="lg:col-span-1 space-y-6 mt-8">
            {/* Today's Schedule */}
            <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700/50 p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center">
                <span className="mr-3">📅</span>
                Today's Schedule
                {todaysTasks.length > 0 && (
                  <span className="ml-2 bg-blue-500 text-white text-xs font-bold rounded-full px-2 py-1">
                    {todaysTasks.length} tasks
                  </span>
                )}
              </h2>
              
              {/* Scrollable Tasks Container */}
              <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800 pr-2">
                <div className="space-y-3">
                  {todaysTasks.length > 0 ? (
                    todaysTasks.map((task, index) => {
                      const isCompleted = task.completed;
                      const dueTime = task.due_date ? new Date(task.due_date).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true 
                      }) : 'No time set';
                      
                      const priorityColors = {
                        'high': 'from-red-900/50 to-rose-900/50 border-red-700/50',
                        'medium': 'from-amber-900/50 to-orange-900/50 border-amber-700/50',
                        'low': 'from-emerald-900/50 to-green-900/50 border-emerald-700/50'
                      };
                      
                      const statusColors = {
                        'high': 'bg-red-600 text-red-100',
                        'medium': 'bg-amber-600 text-amber-100',
                        'low': 'bg-emerald-600 text-emerald-100'
                      };
                      
                      const dotColors = {
                        'high': 'bg-red-500',
                        'medium': 'bg-amber-500',
                        'low': 'bg-emerald-500'
                      };
                      
                      return (
                        <div 
                          key={task.id} 
                          className={`flex items-center space-x-3 p-3 bg-gradient-to-r ${priorityColors[task.priority] || priorityColors.medium} rounded-lg border ${isCompleted ? 'opacity-60' : ''} hover:scale-[1.02] transition-transform duration-200`}
                        >
                          <div className={`w-3 h-3 ${dotColors[task.priority] || dotColors.medium} rounded-full shadow-sm ${isCompleted ? 'opacity-50' : ''}`}></div>
                          <div className="flex-1">
                            <p className={`text-sm font-semibold ${isCompleted ? 'text-slate-400 line-through' : 'text-white'}`}>
                              {task.title}
                            </p>
                            <p className="text-xs text-slate-300">
                              Due: {dueTime}
                            </p>
                            {task.description && (
                              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                                {task.description}
                              </p>
                            )}
                          </div>
                          <span className={`text-xs ${statusColors[task.priority] || statusColors.medium} px-2 py-1 rounded-full font-medium`}>
                            {isCompleted ? 'Done' : task.priority}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-3">📅</div>
                      <p className="text-slate-400 text-sm">No tasks scheduled for today</p>
                      <p className="text-slate-500 text-xs mt-1">Add some tasks to see them here</p>
                      <button 
                        onClick={() => navigate('/student/tasks')}
                        className="mt-3 text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
                      >
                        Add Tasks →
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Task Summary */}
              {todaysTasks.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-700/50">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <span className="text-slate-400">
                        Completed: <span className="text-emerald-400 font-semibold">{todaysTasks.filter(t => t.completed).length}</span>
                      </span>
                      <span className="text-slate-400">
                        Pending: <span className="text-amber-400 font-semibold">{todaysTasks.filter(t => !t.completed).length}</span>
                      </span>
                    </div>
                    <button 
                      onClick={() => navigate('/student/tasks')}
                      className="text-indigo-400 hover:text-indigo-300 text-xs font-medium transition-colors"
                    >
                      View All Tasks →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Messages from Admin */}
            <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700/50 p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center">
                <span className="mr-3">📨</span>
                Messages from Admin
                {adminMessages.filter(msg => !msg.read).length > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1 animate-pulse">
                    {adminMessages.filter(msg => !msg.read).length}
                  </span>
                )}
              </h2>
              
              {/* Scrollable Messages Container */}
              <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800 pr-2">
                <div className="space-y-3">
                  {adminMessages.length > 0 ? (
                    adminMessages.slice(0, 5).map((message, index) => {
                      const isBroadcast = message.is_broadcast;
                      const isUnread = !message.read;
                      const gradientClass = isBroadcast 
                        ? "from-amber-900/50 to-orange-900/50 border-amber-700/50"
                        : "from-blue-900/50 to-indigo-900/50 border-blue-700/50";
                      const timeColor = isBroadcast ? "text-amber-300" : "text-blue-300";
                      
                      return (
                        <div 
                          key={message.id} 
                          className={`p-3 bg-gradient-to-r ${gradientClass} rounded-lg border ${isUnread ? 'ring-2 ring-red-500/30' : ''} hover:scale-[1.02] transition-transform duration-200`}
                        >
                          <div className="flex items-start justify-between mb-1">
                            <p className="text-sm font-semibold text-white">
                              {isBroadcast ? "📢 Broadcast" : message.admin_name || "Admin"}
                            </p>
                            <div className="flex items-center space-x-2">
                              {isUnread && (
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                              )}
                              <p className={`text-xs ${timeColor}`}>
                                {message.time_ago}
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-slate-300 mb-2 line-clamp-3">
                            {message.message}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-3">💬</div>
                      <p className="text-slate-400 text-sm">No messages from admin yet</p>
                      <p className="text-slate-500 text-xs mt-1">Your admin will send updates here</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Scroll Indicator */}
              {adminMessages.length > 5 && (
                <div className="mt-3 text-center">
                  <p className="text-xs text-slate-400">
                    Showing 5 of {adminMessages.length} messages • Scroll for more
                  </p>
                </div>
              )}
              
              <button 
                onClick={() => navigate('/student/messages')}
                className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 text-sm font-medium"
              >
                View All Messages
              </button>
            </div>
           </div>
         </div>

         {/* Quick Actions - Modern Design */}
         <div className="mt-8">
           <div className="mb-6">
             <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
               <span className="text-3xl mr-3">⚡</span>
               Quick Actions
             </h2>
             <p className="text-slate-300 text-sm">Access your most important features quickly</p>
           </div>
           
           {/* Modern Action Buttons */}
           <div className="space-y-4">
             {/* Tasks Row */}
             <div 
               className="group relative overflow-hidden bg-gradient-to-r from-emerald-900/40 to-green-900/40 backdrop-blur-sm rounded-2xl border border-emerald-700/30 hover:border-emerald-500/50 transition-all duration-300 cursor-pointer transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/20"
               onClick={() => navigate('/student/tasks')}
             >
               <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
               <div className="relative p-6 flex items-center justify-between">
                 <div className="flex items-center space-x-4">
                   <div className="p-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg group-hover:shadow-emerald-500/30 transition-all duration-300">
                     <span className="text-3xl">📋</span>
                   </div>
                   <div>
                     <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors duration-300">View Tasks</h3>
                     <p className="text-slate-300 group-hover:text-slate-200 transition-colors duration-300">Check your assignments and deadlines</p>
                   </div>
                 </div>
                 <div className="flex items-center space-x-3">
                   <div className="text-right">
                     <div className="text-sm text-emerald-400 font-semibold">Active Tasks</div>
                     <div className="text-2xl font-bold text-white">{stats.totalTasks}</div>
                   </div>
                   <div className="p-3 bg-emerald-500/20 rounded-xl group-hover:bg-emerald-500/30 transition-colors duration-300">
                     <svg className="w-6 h-6 text-emerald-400 group-hover:text-emerald-300 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                     </svg>
                   </div>
                 </div>
               </div>
             </div>

             {/* Exams Row */}
             <div 
               className="group relative overflow-hidden bg-gradient-to-r from-amber-900/40 to-orange-900/40 backdrop-blur-sm rounded-2xl border border-amber-700/30 hover:border-amber-500/50 transition-all duration-300 cursor-pointer transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-amber-500/20"
               onClick={() => navigate('/student/exams')}
             >
               <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
               <div className="relative p-6 flex items-center justify-between">
                 <div className="flex items-center space-x-4">
                   <div className="p-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg group-hover:shadow-amber-500/30 transition-all duration-300">
                     <span className="text-3xl">📅</span>
                   </div>
                   <div>
                     <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors duration-300">Exam Schedule</h3>
                     <p className="text-slate-300 group-hover:text-slate-200 transition-colors duration-300">View upcoming exams and dates</p>
                   </div>
                 </div>
                 <div className="flex items-center space-x-3">
                   <div className="text-right">
                     <div className="text-sm text-amber-400 font-semibold">Upcoming</div>
                     <div className="text-2xl font-bold text-white">{stats.upcomingExams}</div>
                   </div>
                   <div className="p-3 bg-amber-500/20 rounded-xl group-hover:bg-amber-500/30 transition-colors duration-300">
                     <svg className="w-6 h-6 text-amber-400 group-hover:text-amber-300 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                     </svg>
                   </div>
                 </div>
               </div>
             </div>

             {/* Messages Row */}
             <div 
               className="group relative overflow-hidden bg-gradient-to-r from-purple-900/40 to-indigo-900/40 backdrop-blur-sm rounded-2xl border border-purple-700/30 hover:border-purple-500/50 transition-all duration-300 cursor-pointer transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20"
               onClick={() => navigate('/student/messages')}
             >
               <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
               <div className="relative p-6 flex items-center justify-between">
                 <div className="flex items-center space-x-4">
                   <div className="p-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg group-hover:shadow-purple-500/30 transition-all duration-300">
                     <span className="text-3xl">💬</span>
                   </div>
                   <div>
                     <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors duration-300">Messages</h3>
                     <p className="text-slate-300 group-hover:text-slate-200 transition-colors duration-300">Communicate with admin</p>
                   </div>
                 </div>
                 <div className="flex items-center space-x-3">
                   <div className="text-right">
                     <div className="text-sm text-purple-400 font-semibold">Unread</div>
                     <div className="text-2xl font-bold text-white flex items-center">
                       {adminMessages.filter(msg => !msg.read).length}
                       {adminMessages.filter(msg => !msg.read).length > 0 && (
                         <span className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                       )}
                     </div>
                   </div>
                   <div className="p-3 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition-colors duration-300">
                     <svg className="w-6 h-6 text-purple-400 group-hover:text-purple-300 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                     </svg>
                   </div>
                 </div>
               </div>
             </div>

             {/* Attendance Row */}
             <div 
               className="group relative overflow-hidden bg-gradient-to-r from-sky-900/40 to-blue-900/40 backdrop-blur-sm rounded-2xl border border-sky-700/30 hover:border-sky-500/50 transition-all duration-300 cursor-pointer transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-sky-500/20"
               onClick={() => navigate('/student/attendance-history')}
             >
               <div className="absolute inset-0 bg-gradient-to-r from-sky-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
               <div className="relative p-6 flex items-center justify-between">
                 <div className="flex items-center space-x-4">
                   <div className="p-4 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl shadow-lg group-hover:shadow-sky-500/30 transition-all duration-300">
                     <span className="text-3xl">📊</span>
                   </div>
                   <div>
                     <h3 className="text-xl font-bold text-white group-hover:text-sky-300 transition-colors duration-300">Attendance History</h3>
                     <p className="text-slate-300 group-hover:text-slate-200 transition-colors duration-300">View your attendance records</p>
                   </div>
                 </div>
                 <div className="flex items-center space-x-3">
                   <div className="text-right">
                     <div className="text-sm text-sky-400 font-semibold">Study Hours</div>
                     <div className="text-2xl font-bold text-white">{stats.totalStudyHours}h</div>
                   </div>
                   <div className="p-3 bg-sky-500/20 rounded-xl group-hover:bg-sky-500/30 transition-colors duration-300">
                     <svg className="w-6 h-6 text-sky-400 group-hover:text-sky-300 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                     </svg>
                   </div>
                 </div>
               </div>
             </div>

           </div>
         </div>

         {/* Coming Soon Section */}
         <div className="mt-8">
           <div className="mb-6">
             <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
               <span className="text-3xl mr-3">🚀</span>
               Coming Soon
             </h2>
             <p className="text-slate-300 text-sm">Exciting new features coming to enhance your learning experience</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* E-Books Section */}
             <div className="group relative overflow-hidden bg-gradient-to-r from-purple-900/40 to-indigo-900/40 backdrop-blur-sm rounded-2xl border border-purple-700/30 hover:border-purple-500/50 transition-all duration-300 cursor-pointer transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20">
               <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
               <div className="relative p-6">
                 <div className="flex items-center space-x-4 mb-4">
                   <div className="p-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg group-hover:shadow-purple-500/30 transition-all duration-300">
                     <span className="text-3xl">📚</span>
                   </div>
                   <div>
                     <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors duration-300">E-Books Library</h3>
                     <p className="text-slate-300 group-hover:text-slate-200 transition-colors duration-300">Access thousands of digital books</p>
                   </div>
                 </div>
                 
                 <div className="space-y-3">
                   <div className="flex items-center space-x-3">
                     <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                     <span className="text-sm text-slate-300">Academic textbooks & reference materials</span>
                   </div>
                   <div className="flex items-center space-x-3">
                     <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                     <span className="text-sm text-slate-300">Offline reading capability</span>
                   </div>
                   <div className="flex items-center space-x-3">
                     <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                     <span className="text-sm text-slate-300">Search & bookmark features</span>
                   </div>
                 </div>
                 
                 <div className="mt-4 pt-4 border-t border-purple-700/30">
                   <div className="flex items-center justify-between">
                     <span className="text-sm text-purple-400 font-semibold">Coming Soon</span>
                     <div className="flex items-center space-x-1">
                       <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                       <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                       <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                     </div>
                   </div>
                 </div>
               </div>
             </div>

             {/* Test Series Section */}
             <div className="group relative overflow-hidden bg-gradient-to-r from-emerald-900/40 to-teal-900/40 backdrop-blur-sm rounded-2xl border border-emerald-700/30 hover:border-emerald-500/50 transition-all duration-300 cursor-pointer transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/20">
               <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
               <div className="relative p-6">
                 <div className="flex items-center space-x-4 mb-4">
                   <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg group-hover:shadow-emerald-500/30 transition-all duration-300">
                     <span className="text-3xl">📝</span>
                   </div>
                   <div>
                     <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors duration-300">Test Series</h3>
                     <p className="text-slate-300 group-hover:text-slate-200 transition-colors duration-300">Practice with mock tests & quizzes</p>
                   </div>
                 </div>
                 
                 <div className="space-y-3">
                   <div className="flex items-center space-x-3">
                     <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                     <span className="text-sm text-slate-300">Subject-wise practice tests</span>
                   </div>
                   <div className="flex items-center space-x-3">
                     <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                     <span className="text-sm text-slate-300">Instant results & analytics</span>
                   </div>
                   <div className="flex items-center space-x-3">
                     <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                     <span className="text-sm text-slate-300">Performance tracking & insights</span>
                   </div>
                 </div>
                 
                 <div className="mt-4 pt-4 border-t border-emerald-700/30">
                   <div className="flex items-center justify-between">
                     <span className="text-sm text-emerald-400 font-semibold">Coming Soon</span>
                     <div className="flex items-center space-x-1">
                       <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                       <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                       <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           </div>
           
           {/* Notification Signup */}
           <div className="mt-6 bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm rounded-2xl border border-slate-600/30 p-6">
             <div className="text-center">
               <h3 className="text-lg font-bold text-white mb-2">Stay Updated!</h3>
               <p className="text-slate-300 text-sm mb-4">Get notified when these exciting features are launched</p>
               <button 
                 onClick={() => {/* TODO: Implement notification signup */}}
                 className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 text-sm font-medium"
               >
                 Notify Me When Available
               </button>
             </div>
           </div>
         </div>
       </div>

       <Footer />

       {/* Subscription Expiry Modal */}
       <SubscriptionExpiryModal
         isOpen={showSubscriptionModal}
         onClose={() => setShowSubscriptionModal(false)}
         subscriptionStatus={stats.subscriptionStatus}
         daysLeft={(() => {
           if (!stats.subscription_end) return 0;
           const today = new Date();
           const expiryDate = new Date(stats.subscription_end);
           return Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
         })()}
         libraryName={studentProfile?.library_name || 'Library'}
       />
    </div>
  );
};

export default StudentDashboard;
