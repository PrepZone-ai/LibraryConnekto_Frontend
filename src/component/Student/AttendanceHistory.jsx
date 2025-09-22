import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';

const AttendanceHistory = () => {
  const navigate = useNavigate();
  const { user, userType } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDays: 0,
    totalHours: 0,
    averageSession: 0,
    currentStreak: 0
  });

  // Filter states - simplified to only date, month, year
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState('');
  const [filterType, setFilterType] = useState('month'); // 'all', 'year', 'month', 'date'

  useEffect(() => {
    if (userType !== 'student') {
      navigate('/student/login');
      return;
    }
    fetchAttendanceData();
  }, [userType, navigate]);

  useEffect(() => {
    if (filterType === 'all') {
      setFilteredRecords(attendanceRecords);
      calculateStats(attendanceRecords);
    } else {
      fetchFilteredData();
    }
  }, [filterType, selectedYear, selectedMonth, selectedDate]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/student/attendance');
      setAttendanceRecords(response);
      setFilteredRecords(response); // Initialize filtered records with all data
      calculateStats(response);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filterType === 'year' && selectedYear) {
        params.append('year', selectedYear);
      } else if (filterType === 'month' && selectedYear && selectedMonth) {
        params.append('year', selectedYear);
        params.append('month', selectedMonth);
      } else if (filterType === 'date' && selectedDate) {
        params.append('date', selectedDate);
      }
      
      const url = `/student/attendance/history${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiClient.get(url);
      setFilteredRecords(response);
      calculateStats(response); // Recalculate stats for filtered data
    } catch (error) {
      console.error('Error fetching filtered attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...attendanceRecords];

    switch (filterType) {
      case 'year':
        filtered = filtered.filter(record => {
          const recordYear = new Date(record.entry_time).getFullYear();
          return recordYear === selectedYear;
        });
        break;
      case 'month':
        filtered = filtered.filter(record => {
          const recordDate = new Date(record.entry_time);
          return recordDate.getFullYear() === selectedYear && 
                 recordDate.getMonth() + 1 === selectedMonth;
        });
        break;
      case 'date':
        if (selectedDate) {
          filtered = filtered.filter(record => {
            const recordDate = new Date(record.entry_time).toISOString().split('T')[0];
            return recordDate === selectedDate;
          });
        }
        break;
      default:
        // 'all' - no filtering
        break;
    }

    setFilteredRecords(filtered);
  };

  const calculateStats = (records) => {
    const totalDays = records.length;
    const totalHours = records.reduce((total, record) => {
      if (record.total_duration) {
        // Handle PostgreSQL Interval type (timedelta object)
        if (typeof record.total_duration === 'object' && record.total_duration.total_seconds) {
          return total + (record.total_duration.total_seconds / 3600);
        }
        // Handle string format like "2:30:00" (HH:MM:SS)
        else if (typeof record.total_duration === 'string' && record.total_duration.includes(':')) {
          const parts = record.total_duration.split(':');
          const hours = parseInt(parts[0]) || 0;
          const minutes = parseInt(parts[1]) || 0;
          const seconds = parseInt(parts[2]) || 0;
          return total + hours + (minutes / 60) + (seconds / 3600);
        }
        // Handle numeric seconds
        else if (typeof record.total_duration === 'number') {
          return total + (record.total_duration / 3600);
        }
        // Handle string representation of seconds
        else if (typeof record.total_duration === 'string' && !isNaN(record.total_duration)) {
          return total + (parseFloat(record.total_duration) / 3600);
        }
      }
      
      // Fallback: Calculate duration manually from entry_time and exit_time
      if (record.entry_time && record.exit_time) {
        const entry = new Date(record.entry_time);
        const exit = new Date(record.exit_time);
        const diffMs = exit - entry;
        const totalSeconds = Math.floor(diffMs / 1000);
        return total + (totalSeconds / 3600);
      }
      
      return total;
    }, 0);

    const completedSessions = records.filter(record => record.exit_time).length;
    const averageSession = completedSessions > 0 ? totalHours / completedSessions : 0;

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    const sortedRecords = [...records].sort((a, b) => new Date(b.entry_time) - new Date(a.entry_time));
    
    for (let i = 0; i < sortedRecords.length; i++) {
      const recordDate = new Date(sortedRecords[i].entry_time);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (recordDate.toDateString() === expectedDate.toDateString()) {
        currentStreak++;
      } else {
        break;
      }
    }

    setStats({
      totalDays,
      totalHours: Math.round(totalHours * 10) / 10,
      averageSession: Math.round(averageSession * 10) / 10,
      currentStreak
    });
  };

  const formatDuration = (duration, entryTime, exitTime) => {
    
    // Handle string format like "2:30:00" (HH:MM:SS)
    if (duration && typeof duration === 'string' && duration.includes(':')) {
      const parts = duration.split(':');
      const hours = parseInt(parts[0]) || 0;
      const minutes = parseInt(parts[1]) || 0;
      return `${hours}h ${minutes}m`;
    }
    
    // Handle PostgreSQL Interval type (timedelta object)
    if (duration && typeof duration === 'object' && duration.total_seconds) {
      const totalSeconds = duration.total_seconds();
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
    
    // Handle numeric seconds
    if (duration && typeof duration === 'number') {
      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
    
    // Handle case where duration might be a string representation of seconds
    if (duration && typeof duration === 'string' && !isNaN(duration)) {
      const totalSeconds = parseFloat(duration);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
    
    // Fallback: Calculate duration manually from entry_time and exit_time
    if (entryTime && exitTime) {
      const entry = new Date(entryTime);
      const exit = new Date(exitTime);
      const diffMs = exit - entry;
      const totalSeconds = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
    
    return 'N/A';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (record) => {
    if (record.exit_time) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
    return 'bg-amber-100 text-amber-800 border-amber-200';
  };

  const getStatusText = (record) => {
    return record.exit_time ? 'Completed' : 'In Progress';
  };

  const getStatusIcon = (record) => {
    return record.exit_time ? '✅' : '⏳';
  };

  // Generate year options (current year and previous 5 years)
  const yearOptions = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

  // Generate month options
  const monthOptions = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-slate-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-300 mb-1">Total Days</p>
                <p className="text-3xl font-bold text-white">{stats.totalDays}</p>
              </div>
              <div className="p-4 rounded-2xl bg-blue-50 shadow-md">
                <span className="text-2xl text-blue-600">📅</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-slate-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-300 mb-1">Total Hours</p>
                <p className="text-3xl font-bold text-white">{stats.totalHours}h</p>
              </div>
              <div className="p-4 rounded-2xl bg-purple-50 shadow-md">
                <span className="text-2xl text-purple-600">⏱️</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-slate-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-300 mb-1">Avg Session</p>
                <p className="text-3xl font-bold text-white">{stats.averageSession}h</p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 shadow-md">
                <span className="text-2xl text-emerald-600">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-slate-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-300 mb-1">Current Streak</p>
                <p className="text-3xl font-bold text-white">{stats.currentStreak}</p>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50 shadow-md">
                <span className="text-2xl text-amber-600">🔥</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls - Simple */}
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-slate-700/50 p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-white">Filter Records</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Showing</span>
              <span className="text-sm font-bold text-white">{filteredRecords.length} records</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Year Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(parseInt(e.target.value));
                  setFilterType('year');
                }}
                className="w-full p-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all duration-300 text-sm"
              >
                {yearOptions.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Month Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(parseInt(e.target.value));
                  setFilterType('month');
                }}
                className="w-full p-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all duration-300 text-sm"
              >
                {monthOptions.map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setFilterType('date');
                }}
                className="w-full p-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all duration-300 text-sm"
              />
            </div>

            {/* Show All Button */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Action</label>
              <button
                onClick={() => {
                  setFilterType('all');
                  setSelectedDate('');
                }}
                className="w-full p-2 bg-indigo-600 hover:bg-indigo-700 border border-indigo-500 rounded-lg text-white focus:ring-1 focus:ring-indigo-500/20 transition-all duration-300 text-sm font-medium"
              >
                Show All
              </button>
            </div>
          </div>

          {/* Filter Description */}
          <div className="mt-2 text-xs text-slate-400">
            {filterType === 'year' && `Records for ${selectedYear}`}
            {filterType === 'month' && `Records for ${monthOptions.find(m => m.value === selectedMonth)?.label} ${selectedYear}`}
            {filterType === 'date' && selectedDate && `Records for ${new Date(selectedDate).toLocaleDateString()}`}
            {filterType === 'all' && 'All attendance records'}
          </div>
        </div>

        {/* Attendance Records */}
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-slate-700/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Attendance Records</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Total:</span>
              <span className="text-lg font-bold text-white">{filteredRecords.length}</span>
            </div>
          </div>
          
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-white mb-2">No records found</h3>
              <p className="text-slate-400">
                {filterType === 'all' 
                  ? 'Your attendance history will appear here once you start checking in.'
                  : 'No attendance records found for the selected filter criteria.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRecords.map((record) => (
                <div
                  key={record.id}
                  className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50 hover:bg-slate-700/70 transition-all duration-300"
                >
                  {/* Header with date and status */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="text-lg">{getStatusIcon(record)}</div>
                      <div>
                        <h3 className="text-base font-semibold text-white">
                          {formatDate(record.entry_time)}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {record.exit_time ? 'Study session completed' : 'Study session in progress'}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(record)}`}>
                      {getStatusText(record)}
                    </span>
                  </div>
                  
                  {/* Time details in compact grid */}
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="bg-slate-600/30 rounded-lg p-3">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-emerald-400 text-sm">🟢</span>
                        <span className="text-xs font-medium text-slate-300">Check In</span>
                      </div>
                      <p className="text-sm font-bold text-white">{formatTime(record.entry_time)}</p>
                    </div>
                    
                    <div className="bg-slate-600/30 rounded-lg p-3">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-red-400 text-sm">🔴</span>
                        <span className="text-xs font-medium text-slate-300">Check Out</span>
                      </div>
                      <p className="text-sm font-bold text-white">
                        {record.exit_time ? formatTime(record.exit_time) : 'Not checked out'}
                      </p>
                    </div>
                    
                    <div className="bg-slate-600/30 rounded-lg p-3">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-blue-400 text-sm">⏱️</span>
                        <span className="text-xs font-medium text-slate-300">Duration</span>
                      </div>
                      <p className="text-sm font-bold text-white">{formatDuration(record.total_duration, record.entry_time, record.exit_time)}</p>
                    </div>
                  </div>

                  {/* Location in compact format */}
                  <div className="text-xs text-slate-400 pt-2 border-t border-slate-600/30">
                    <span className="font-medium">Location:</span> {
                      record.latitude && record.longitude 
                        ? `${record.latitude.toFixed(4)}, ${record.longitude.toFixed(4)}`
                        : 'Not available'
                    }
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AttendanceHistory;