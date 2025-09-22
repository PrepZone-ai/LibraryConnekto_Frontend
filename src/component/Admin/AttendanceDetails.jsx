import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';

// Icons
const CalendarIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ClockIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const UserIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const CheckIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Calendar Component
const CalendarComponent = ({ selectedDate, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };
  
  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };
  
  const isSelectedDate = (date) => {
    if (!date) return false;
    return date.toISOString().split('T')[0] === selectedDate;
  };
  
  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };
  
  const days = getDaysInMonth(currentMonth);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div className="bg-slate-800/50 rounded-lg p-3">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-1 hover:bg-slate-700/50 rounded transition-colors"
        >
          <span className="text-white text-sm">‹</span>
        </button>
        <h3 className="text-white font-medium text-sm">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button
          onClick={() => navigateMonth(1)}
          className="p-1 hover:bg-slate-700/50 rounded transition-colors"
        >
          <span className="text-white text-sm">›</span>
        </button>
      </div>
      
      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs text-white/70 font-medium py-1">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (!day) {
            return <div key={index} className="h-6"></div>;
          }
          
          const isSelected = isSelectedDate(day);
          const isTodayDate = isToday(day);
          
          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateSelect(day.toISOString().split('T')[0])}
              className={`
                h-6 w-6 rounded text-xs font-medium transition-all duration-200
                ${isSelected 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md' 
                  : isTodayDate
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                    : 'text-white/80 hover:bg-slate-700/50 hover:text-white'
                }
              `}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const AttendanceDetails = () => {
  const navigate = useNavigate();
  const { userType } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalPresent: 0,
    totalStudents: 0,
    checkIns: 0,
    checkOuts: 0
  });

  useEffect(() => {
    if (userType !== 'admin') {
      navigate('/admin/auth');
      return;
    }
    fetchAttendanceData();
  }, [userType, navigate, selectedDate]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      console.log('Fetching attendance data for date:', selectedDate);
      
      // Fetch attendance data for the selected date
      const response = await apiClient.get(`/admin/attendance?date=${selectedDate}`);
      console.log('API Response:', response);
      
      // Handle both direct array response and nested data response
      let attendanceData = [];
      if (Array.isArray(response)) {
        attendanceData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        attendanceData = response.data;
      } else if (response && Array.isArray(response.data)) {
        attendanceData = response.data;
      }
      
      console.log('Raw attendance data:', attendanceData);
      
      console.log('Processed attendance data:', attendanceData);
      
      // Sort by student_id for consistent display
      attendanceData.sort((a, b) => {
        const idA = a.student_id || '';
        const idB = b.student_id || '';
        return idA.localeCompare(idB);
      });
      
      setAttendanceData(attendanceData);
      
      // Calculate stats
      const totalPresent = attendanceData.filter(record => record.entry_time && !record.exit_time).length;
      const totalStudents = attendanceData.length;
      const checkIns = attendanceData.filter(record => record.entry_time).length;
      const checkOuts = attendanceData.filter(record => record.exit_time).length;
      
      setStats({
        totalPresent,
        totalStudents,
        checkIns,
        checkOuts
      });
      
      console.log('Stats calculated:', { totalPresent, totalStudents, checkIns, checkOuts });
      
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      setAttendanceData([]);
      setStats({ totalPresent: 0, totalStudents: 0, checkIns: 0, checkOuts: 0 });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '—';
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getDuration = (entryTime, exitTime) => {
    if (!entryTime) return '—';
    if (!exitTime) return 'Present';
    
    const entry = new Date(entryTime);
    const exit = new Date(exitTime);
    const diffMs = exit - entry;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHours}h ${diffMinutes}m`;
  };

  const getStatusColor = (entryTime, exitTime) => {
    if (!entryTime) return 'bg-gray-100 text-gray-800';
    if (!exitTime) return 'bg-green-100 text-green-800';
    return 'bg-blue-100 text-blue-800';
  };

  const getStatusText = (entryTime, exitTime) => {
    if (!entryTime) return 'Not Present';
    if (!exitTime) return 'Present';
    return 'Completed';
  };

  const StatCard = ({ title, value, icon: Icon, gradient = 'from-blue-500 to-cyan-500', subtitle }) => (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-3 border border-white/20 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/70 text-xs font-medium mb-1">{title}</p>
          <p className="text-lg font-bold text-white">{value}</p>
          {subtitle && <p className="text-white/60 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className={`p-2 rounded-lg bg-gradient-to-r ${gradient} shadow-md`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
    </div>
  );

  const AttendanceCard = ({ record }) => (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">
                {record.student_name ? record.student_name.charAt(0).toUpperCase() : 'S'}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white group-hover:text-purple-200 transition-colors">
                {record.student_name || 'Unknown Student'}
              </h3>
              <p className="text-white/70 text-sm">{record.student_id || 'No ID'}</p>
            </div>
          </div>
          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(record.entry_time, record.exit_time)} border border-white/20`}>
            {getStatusText(record.entry_time, record.exit_time)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center space-x-2 mb-2">
              <ClockIcon className="w-4 h-4 text-green-400" />
              <p className="text-white/70 text-sm font-medium">Check In</p>
            </div>
            <p className="text-white font-semibold">{formatTime(record.entry_time)}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center space-x-2 mb-2">
              <ClockIcon className="w-4 h-4 text-red-400" />
              <p className="text-white/70 text-sm font-medium">Check Out</p>
            </div>
            <p className="text-white font-semibold">{formatTime(record.exit_time)}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center space-x-2 mb-2">
              <ClockIcon className="w-4 h-4 text-blue-400" />
              <p className="text-white/70 text-sm font-medium">Duration</p>
            </div>
            <p className="text-white font-semibold">{getDuration(record.entry_time, record.exit_time)}</p>
          </div>
        </div>

        {record.seat_number && (
          <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-4 border border-blue-500/30">
            <div className="flex items-center space-x-2">
              <UserIcon className="w-4 h-4 text-blue-400" />
              <p className="text-white/70 text-sm font-medium">Assigned Seat</p>
            </div>
            <p className="text-blue-300 font-bold text-lg">Seat {record.seat_number}</p>
          </div>
        )}
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
            <p className="text-white/70 mt-4">Loading attendance data...</p>
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
          {/* Dynamic Header */}
          <div className="mb-4">
            <h1 className="text-xl font-semibold text-white mb-1">
              <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Attendance Details - {new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </h1>
            <p className="text-white/60 text-sm">View daily attendance records and student check-in/out times</p>
          </div>

          {/* Stats Cards at Top */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <StatCard
              title="Total Students"
              value={stats.totalStudents}
              icon={UserIcon}
              gradient="from-blue-500 to-cyan-500"
              subtitle="Registered students"
            />
            <StatCard
              title="Present Today"
              value={stats.totalPresent}
              icon={CheckIcon}
              gradient="from-green-500 to-emerald-500"
              subtitle="Currently in library"
            />
            <StatCard
              title="Check Ins"
              value={stats.checkIns}
              icon={ClockIcon}
              gradient="from-purple-500 to-pink-500"
              subtitle="Total entries today"
            />
            <StatCard
              title="Check Outs"
              value={stats.checkOuts}
              icon={XIcon}
              gradient="from-orange-500 to-red-500"
              subtitle="Total exits today"
            />
          </div>

          {/* Main Content: Calendar (Left) + Student List (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Side - Calendar */}
            <div className="lg:col-span-1">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 shadow-lg sticky top-24">
                <div className="flex items-center gap-2 mb-4">
                  <CalendarIcon className="w-4 h-4 text-white" />
                  <div>
                    <h3 className="text-sm font-semibold text-white">Select Date</h3>
                    <p className="text-white/70 text-xs">Choose a date to view attendance</p>
                  </div>
                </div>
                
                {/* Calendar Component */}
                <div className="mb-4">
                  <CalendarComponent 
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                  />
                </div>

                {/* Quick Date Navigation */}
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      const today = new Date();
                      setSelectedDate(today.toISOString().split('T')[0]);
                    }}
                    className="w-full px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all text-xs font-medium"
                  >
                    📅 Today
                  </button>
                  <button
                    onClick={() => {
                      const yesterday = new Date();
                      yesterday.setDate(yesterday.getDate() - 1);
                      setSelectedDate(yesterday.toISOString().split('T')[0]);
                    }}
                    className="w-full px-3 py-1.5 bg-slate-700/60 text-white rounded-lg hover:bg-slate-600/60 transition-all text-xs font-medium"
                  >
                    ⬅️ Yesterday
                  </button>
                  <button
                    onClick={fetchAttendanceData}
                    className="w-full px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all text-xs font-medium"
                  >
                    🔄 Refresh
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side - Student List */}
            <div className="lg:col-span-2">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg overflow-hidden">
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                          <UserIcon className="w-3 h-3 text-white" />
                        </div>
                        Attendance Records
                      </h3>
                      <p className="text-white/70 text-xs mt-1">
                        {new Date(selectedDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">{stats.totalPresent}</div>
                      <div className="text-white/70 text-xs">Present</div>
                    </div>
                  </div>
                </div>
                
                {attendanceData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-2 px-4 text-white/70 font-medium">Student</th>
                          <th className="text-left py-2 px-4 text-white/70 font-medium">Check In</th>
                          <th className="text-left py-2 px-4 text-white/70 font-medium">Check Out</th>
                          <th className="text-left py-2 px-4 text-white/70 font-medium">Duration</th>
                          <th className="text-left py-2 px-4 text-white/70 font-medium">Status</th>
                        </tr>
                      </thead>
                       <tbody>
                    {attendanceData.map((record, index) => (
                      <tr 
                        key={record.id || index} 
                        className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                        onClick={() => navigate(`/admin/student-attendance/${record.id}`)}
                        title="Click to view detailed attendance history"
                      >
                        <td className="py-3 px-4">
                          <div>
                            <div className="text-white font-medium text-sm">{record.student_name}</div>
                            <div className="text-white/60 text-xs">{record.student_id}</div>
                          </div>
                        </td>
                            <td className="py-3 px-4 text-white/80 text-sm">
                              {record.entry_time ? new Date(record.entry_time).toLocaleTimeString() : '-'}
                            </td>
                            <td className="py-3 px-4 text-white/80 text-sm">
                              {record.exit_time ? new Date(record.exit_time).toLocaleTimeString() : '-'}
                            </td>
                            <td className="py-3 px-4 text-white/80 text-sm">
                              {record.total_duration || '-'}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                record.status === 'Present' ? 'bg-green-500/20 text-green-300' :
                                record.status === 'Completed' ? 'bg-blue-500/20 text-blue-300' :
                                'bg-gray-500/20 text-gray-300'
                              }`}>
                                {record.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <div className="text-4xl mb-3">📅</div>
                    <h3 className="text-sm font-semibold text-white mb-1">No Records</h3>
                    <p className="text-white/70 text-xs">
                      No attendance data for {new Date(selectedDate).toLocaleDateString()}.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AttendanceDetails;
