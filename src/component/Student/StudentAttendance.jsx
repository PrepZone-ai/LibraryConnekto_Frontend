import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';

const StudentAttendance = () => {
  const navigate = useNavigate();
  const { user, userType } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentAttendance, setCurrentAttendance] = useState(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    if (userType !== 'student') {
      navigate('/student/login');
      return;
    }
    fetchAttendanceData();
  }, [userType, navigate]);

  const fetchAttendanceData = async () => {
    try {
      const [recordsResponse, statsResponse] = await Promise.all([
        apiClient.get('/student/attendance'),
        apiClient.get('/student/dashboard/stats')
      ]);
      
      setAttendanceRecords(recordsResponse);
      
      // Check if student is currently checked in
      const today = new Date().toISOString().split('T')[0];
      const todayRecord = recordsResponse.find(record => {
        const recordDate = new Date(record.entry_time).toISOString().split('T')[0];
        return recordDate === today && !record.exit_time;
      });
      
      setCurrentAttendance(todayRecord);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser. Please enable location services.');
      return;
    }

    setCheckingIn(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const attendanceData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          
          await apiClient.post('/student/attendance/checkin', attendanceData);
          fetchAttendanceData();
          alert('Successfully checked in!');
        } catch (error) {
          console.error('Error checking in:', error);
          alert(`Failed to check in: ${error.message}`);
        } finally {
          setCheckingIn(false);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Failed to get your location. Please enable location services and try again.');
        setCheckingIn(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleCheckOut = async () => {
    setCheckingOut(true);
    try {
      await apiClient.post('/student/attendance/checkout');
      fetchAttendanceData();
      alert('Successfully checked out!');
    } catch (error) {
      console.error('Error checking out:', error);
      alert(`Failed to check out: ${error.message}`);
    } finally {
      setCheckingOut(false);
    }
  };

  const formatDuration = (duration) => {
    if (!duration) return 'N/A';
    
    if (typeof duration === 'string' && duration.includes(':')) {
      return duration;
    }
    
    // Convert seconds to hours:minutes format
    const totalSeconds = typeof duration === 'number' ? duration : duration.total_seconds();
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    return `${hours}h ${minutes}m`;
  };

  const getTotalStudyTime = () => {
    return attendanceRecords.reduce((total, record) => {
      if (record.total_duration) {
        if (typeof record.total_duration === 'number') {
          return total + record.total_duration;
        } else if (record.total_duration.total_seconds) {
          return total + record.total_duration.total_seconds;
        }
      }
      return total;
    }, 0);
  };

  const getAttendanceStats = () => {
    const totalDays = attendanceRecords.length;
    const completedSessions = attendanceRecords.filter(record => record.exit_time).length;
    const totalStudyTime = getTotalStudyTime();
    
    return {
      totalDays,
      completedSessions,
      totalStudyTime: Math.round(totalStudyTime / 3600 * 10) / 10, // Convert to hours
      averageSessionTime: completedSessions > 0 ? Math.round((totalStudyTime / completedSessions) / 60) : 0 // in minutes
    };
  };

  const stats = getAttendanceStats();

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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Attendance</h1>
          <p className="text-slate-300">Track your study sessions and attendance</p>
        </div>

        {/* Current Status */}
        {currentAttendance ? (
          <div className="mb-8 bg-gradient-to-r from-emerald-900/80 to-green-900/80 border border-emerald-700/50 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-emerald-600 rounded-full">
                  <span className="text-emerald-100 text-2xl">✅</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-emerald-100">Currently Checked In</h3>
                  <p className="text-emerald-200">
                    Since: {new Date(currentAttendance.entry_time).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCheckOut}
                disabled={checkingOut}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {checkingOut ? 'Checking Out...' : 'Check Out'}
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-8 bg-gradient-to-r from-amber-900/80 to-orange-900/80 border border-amber-700/50 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-amber-600 rounded-full">
                  <span className="text-amber-100 text-2xl">⏰</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-amber-100">Not Checked In</h3>
                  <p className="text-amber-200">Start your study session by checking in</p>
                </div>
              </div>
              <button
                onClick={handleCheckIn}
                disabled={checkingIn}
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {checkingIn ? 'Checking In...' : 'Check In'}
              </button>
            </div>
          </div>
        )}

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
                <p className="text-sm font-medium text-slate-300 mb-1">Completed Sessions</p>
                <p className="text-3xl font-bold text-white">{stats.completedSessions}</p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 shadow-md">
                <span className="text-2xl text-emerald-600">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-slate-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-300 mb-1">Total Study Time</p>
                <p className="text-3xl font-bold text-white">{stats.totalStudyTime}h</p>
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
                <p className="text-3xl font-bold text-white">{stats.averageSessionTime}m</p>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50 shadow-md">
                <span className="text-2xl text-amber-600">📊</span>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance History */}
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-slate-700/50 p-6">
          <h2 className="text-xl font-bold text-white mb-6">Attendance History</h2>
          
          {attendanceRecords.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-white mb-2">No attendance records</h3>
              <p className="text-slate-400">Your attendance history will appear here once you start checking in.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {attendanceRecords.map((record) => (
                <div
                  key={record.id}
                  className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-3 h-3 rounded-full ${
                          record.exit_time ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}></div>
                        <h3 className="text-lg font-semibold text-white">
                          {new Date(record.entry_time).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          record.exit_time 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {record.exit_time ? 'Completed' : 'In Progress'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-300">
                        <div>
                          <span className="font-medium">Check In:</span> {new Date(record.entry_time).toLocaleTimeString()}
                        </div>
                        <div>
                          <span className="font-medium">Check Out:</span> {
                            record.exit_time 
                              ? new Date(record.exit_time).toLocaleTimeString()
                              : 'Not checked out'
                          }
                        </div>
                        <div>
                          <span className="font-medium">Duration:</span> {formatDuration(record.total_duration)}
                        </div>
                      </div>
                    </div>
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

export default StudentAttendance;
