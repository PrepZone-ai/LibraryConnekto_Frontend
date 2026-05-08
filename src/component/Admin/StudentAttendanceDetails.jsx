import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
// Icons
const CalendarIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
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

const ArrowLeftIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const StudentAttendanceDetails = () => {
  const navigate = useNavigate();
  const { userType } = useAuth();
  const { studentId } = useParams();
  const [attendanceData, setAttendanceData] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const [libraryName, setLibraryName] = useState('Library Connekto');
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [stats, setStats] = useState({
    totalDays: 0,
    presentDays: 0,
    totalHours: 0,
    averageHours: 0
  });

  useEffect(() => {
    if (userType !== 'admin') {
      navigate('/admin/auth');
      return;
    }
    if (studentId) {
      fetchStudentAttendanceData();
    }
  }, [userType, navigate, studentId]);

  useEffect(() => {
    const fetchLibraryName = async () => {
      try {
        const details = await apiClient.get('/admin/details');
        if (details?.library_name) {
          setLibraryName(details.library_name);
        }
      } catch (error) {
        console.warn('Could not load library details for PDF header:', error);
      }
    };
    if (userType === 'admin') {
      fetchLibraryName();
    }
  }, [userType]);

  const fetchStudentAttendanceData = async () => {
    try {
      setLoading(true);
      console.log('Fetching attendance data for student:', studentId);
      
      // Fetch student attendance history
      const response = await apiClient.get(`/admin/students/${studentId}/attendance`);
      console.log('Student attendance response:', response);
      
      // Handle array and paginated response shapes
      let attendanceRecords = [];
      if (Array.isArray(response)) {
        attendanceRecords = response;
      } else if (response && Array.isArray(response.items)) {
        attendanceRecords = response.items;
      } else if (response && response.data && Array.isArray(response.data)) {
        attendanceRecords = response.data;
      }
      
      console.log('Processed attendance records:', attendanceRecords);
      if (attendanceRecords.length > 0) {
        console.log('First record structure:', attendanceRecords[0]);
      }
      
      // Sort by entry_time descending (most recent first)
      attendanceRecords.sort((a, b) => new Date(b.entry_time) - new Date(a.entry_time));
      
      setAttendanceData(attendanceRecords);
      
      // Extract student info from first record
      if (attendanceRecords.length > 0) {
        const firstRecord = attendanceRecords[0];
        console.log('First record for student info:', firstRecord);
        
        // The backend should already provide student_id, student_name, and email
        const studentInfo = {
          student_id: firstRecord.student_id || 'N/A',
          name: firstRecord.student_name || 'N/A',
          email: firstRecord.email || 'N/A'
        };
        
        console.log('Extracted student info:', studentInfo);
        setStudentInfo(studentInfo);
      } else {
        // If no attendance records, try to fetch student info separately
        try {
          console.log('No attendance records, fetching student info separately for studentId:', studentId);
          const studentResponse = await apiClient.get(`/admin/students/${studentId}`);
          console.log('Student response:', studentResponse);
          
          if (studentResponse) {
            setStudentInfo({
              student_id: studentResponse.student_id || 'N/A',
              name: studentResponse.name || 'N/A',
              email: studentResponse.email || 'N/A'
            });
          }
        } catch (error) {
          console.error('Error fetching student info separately:', error);
        }
      }
      
      // Calculate stats - count unique days, not total records
      const uniqueDays = new Set();
      attendanceRecords.forEach(record => {
        if (record.entry_time) {
          const date = new Date(record.entry_time).toDateString();
          uniqueDays.add(date);
        }
      });
      
      const totalDays = uniqueDays.size; // Count unique days
      const presentDays = attendanceRecords.filter(record => record.entry_time).length; // Total check-ins
      const totalHours = attendanceRecords.reduce((total, record) => {
        if (record.total_duration) {
          // Handle PostgreSQL interval format like "0:25:08"
          if (typeof record.total_duration === 'string' && record.total_duration.includes(':')) {
            const parts = record.total_duration.split(':');
            if (parts.length === 3) {
              const hours = parseInt(parts[0]);
              const minutes = parseInt(parts[1]);
              const seconds = parseInt(parts[2]);
              const totalHoursForRecord = hours + (minutes / 60) + (seconds / 3600);
              return total + totalHoursForRecord;
            }
          }
          // Handle numeric duration (seconds)
          const duration = typeof record.total_duration === 'string' 
            ? parseFloat(record.total_duration) 
            : record.total_duration;
          return total + (duration / 3600); // Convert to hours
        }
        return total;
      }, 0);
      const averageHours = totalDays > 0 ? totalHours / totalDays : 0;
      
      setStats({
        totalDays,
        presentDays,
        totalHours: Math.round(totalHours * 100) / 100,
        averageHours: Math.round(averageHours * 100) / 100
      });
      
      console.log('Stats calculated:', { 
        totalDays, 
        presentDays, 
        totalHours, 
        averageHours,
        uniqueDaysArray: Array.from(uniqueDays),
        totalRecords: attendanceRecords.length
      });
      
    } catch (error) {
      console.error('Error fetching student attendance data:', error);
      setAttendanceData([]);
      setStats({
        totalDays: 0,
        presentDays: 0,
        totalHours: 0,
        averageHours: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '—';
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (duration) => {
    if (!duration) return '—';
    
    // Handle different duration formats
    if (typeof duration === 'string') {
      // If it's already formatted with colons (HH:MM:SS), return as is
      if (duration.includes(':')) return duration;
      // If it's a PostgreSQL interval string like "0:25:08"
      if (duration.includes(':')) {
        const parts = duration.split(':');
        if (parts.length === 3) {
          const hours = parseInt(parts[0]);
          const minutes = parseInt(parts[1]);
          const seconds = parseInt(parts[2]);
          const totalHours = hours + (minutes / 60) + (seconds / 3600);
          return `${Math.round(totalHours * 100) / 100}h`;
        }
      }
      // If it's a number string (seconds), convert to hours
      const hours = parseFloat(duration) / 3600;
      return `${Math.round(hours * 100) / 100}h`;
    }
    
    // If it's a number (seconds), convert to hours
    const hours = duration / 3600;
    return `${Math.round(hours * 100) / 100}h`;
  };

  const getStatusColor = (record) => {
    if (!record.entry_time) return 'bg-gray-500/20 text-gray-300';
    if (!record.exit_time) return 'bg-green-500/20 text-green-300';
    return 'bg-blue-500/20 text-blue-300';
  };

  const getStatusText = (record) => {
    if (!record.entry_time) return 'Absent';
    if (!record.exit_time) return 'Present';
    return 'Completed';
  };

  const filteredAttendanceData = attendanceData.filter((record) => {
    if (!record.entry_time) return false;
    const recordDate = new Date(record.entry_time);
    if (Number.isNaN(recordDate.getTime())) return false;
    const onlyDate = new Date(
      recordDate.getFullYear(),
      recordDate.getMonth(),
      recordDate.getDate()
    );
    if (fromDate) {
      const from = new Date(`${fromDate}T00:00:00`);
      if (onlyDate < from) return false;
    }
    if (toDate) {
      const to = new Date(`${toDate}T00:00:00`);
      if (onlyDate > to) return false;
    }
    return true;
  });

  const filteredStats = (() => {
    const uniqueDays = new Set();
    filteredAttendanceData.forEach((record) => {
      if (record.entry_time) {
        uniqueDays.add(new Date(record.entry_time).toDateString());
      }
    });
    const totalDays = uniqueDays.size;
    const presentDays = filteredAttendanceData.filter((record) => record.entry_time).length;
    const totalHours = filteredAttendanceData.reduce((total, record) => {
      if (!record.total_duration) return total;
      if (typeof record.total_duration === 'string' && record.total_duration.includes(':')) {
        const parts = record.total_duration.split(':');
        if (parts.length === 3) {
          const hours = parseInt(parts[0], 10);
          const minutes = parseInt(parts[1], 10);
          const seconds = parseInt(parts[2], 10);
          return total + (hours + (minutes / 60) + (seconds / 3600));
        }
      }
      const duration = typeof record.total_duration === 'string'
        ? parseFloat(record.total_duration)
        : record.total_duration;
      return total + ((duration || 0) / 3600);
    }, 0);
    const averageHours = totalDays > 0 ? totalHours / totalDays : 0;
    return {
      totalDays,
      presentDays,
      totalHours: Math.round(totalHours * 100) / 100,
      averageHours: Math.round(averageHours * 100) / 100
    };
  })();

  const downloadAttendancePDF = () => {
    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const studentName = studentInfo?.name || 'Student';
      const generatedAt = new Date().toLocaleString();
      const dateRangeText = `${fromDate || 'All'} to ${toDate || 'All'}`;

      // Branding header (logo placeholder + library name)
      doc.setDrawColor(88, 28, 135);
      doc.setFillColor(88, 28, 135);
      doc.roundedRect(40, 24, 28, 28, 6, 6, 'FD');
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.text('LC', 47, 43);
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(libraryName || 'Library Connekto', 76, 42);
      doc.setFont(undefined, 'normal');

      doc.setFontSize(16);
      doc.text('Student Attendance Report', 40, 74);
      doc.setFontSize(10);
      doc.text(`Student: ${studentName}`, 40, 94);
      doc.text(`Student ID: ${studentInfo?.student_id || 'N/A'}`, 40, 109);
      doc.text(`Date Range: ${dateRangeText}`, 40, 124);
      doc.text(`Generated: ${generatedAt}`, 40, 139);

      const rows = filteredAttendanceData.map((record) => ([
          formatDate(record.entry_time),
          formatTime(record.entry_time),
          formatTime(record.exit_time),
          formatDuration(record.total_duration),
          getStatusText(record)
      ]));

      autoTable(doc, {
        startY: 154,
        head: [['Date', 'Check In', 'Check Out', 'Duration', 'Status']],
        body: rows,
        theme: 'grid',
        styles: {
          fontSize: 9,
          cellPadding: 6,
          lineColor: [200, 200, 200],
          lineWidth: 0.5,
          textColor: [35, 35, 35],
        },
        headStyles: {
          fillColor: [41, 56, 86],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        columnStyles: {
          0: { cellWidth: 140 }, // Date
          1: { cellWidth: 90 },  // Check In
          2: { cellWidth: 90 },  // Check Out
          3: { cellWidth: 90 },  // Duration
          4: { cellWidth: 90 },  // Status
        },
        margin: { left: 40, right: 40, top: 40, bottom: 38 },
        didDrawPage: (data) => {
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
          const pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth();
          const pageCurrent = doc.getNumberOfPages();
          doc.setFontSize(9);
          doc.setTextColor(90);
          doc.text(
            `Page ${pageCurrent}`,
            pageWidth - 70,
            pageHeight - 16
          );
          doc.text(
            `${libraryName || 'Library Connekto'} - Attendance Report`,
            40,
            pageHeight - 16
          );
        },
      });

      const safeName = String(studentName).replace(/[^a-z0-9]/gi, '_').toLowerCase();
      doc.save(`attendance_${safeName}_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('Failed to export attendance PDF:', err);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // StatCard Component
  const StatCard = ({ title, value, icon: Icon, gradient = 'from-blue-500 to-cyan-500', subtitle }) => (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-white/70 text-sm font-medium mb-2">{title}</p>
          <p className="text-2xl font-bold text-white mb-1">{value}</p>
          {subtitle && <p className="text-white/60 text-xs">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-r ${gradient} shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <main className="relative pt-24 pb-8">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
          <div className="absolute top-20 right-20 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate('/admin/students')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">
                <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  Student Attendance Details
                </span>
              </h1>
              {studentInfo && studentInfo.name !== 'N/A' && (
                <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-white/60 text-sm">Student:</span>
                    <span className="text-white font-medium text-sm">{studentInfo.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/60 text-sm">ID:</span>
                    <span className="text-white font-medium text-sm bg-white/10 px-2 py-1 rounded">{studentInfo.student_id}</span>
                  </div>
                  {studentInfo.email && studentInfo.email !== 'N/A' && (
                    <div className="flex items-center gap-2">
                      <span className="text-white/60 text-sm">Email:</span>
                      <span className="text-white/80 text-sm break-all">{studentInfo.email}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Unique Days"
              value={filteredStats.totalDays}
              icon={CalendarIcon}
              gradient="from-blue-500 to-cyan-500"
              subtitle="Different days attended"
            />
            <StatCard
              title="Total Sessions"
              value={filteredStats.presentDays}
              icon={CheckIcon}
              gradient="from-green-500 to-emerald-500"
              subtitle="Total check-ins"
            />
            <StatCard
              title="Total Hours"
              value={`${filteredStats.totalHours}h`}
              icon={ClockIcon}
              gradient="from-purple-500 to-pink-500"
              subtitle="Time spent"
            />
            <StatCard
              title="Average Hours"
              value={`${filteredStats.averageHours}h`}
              icon={ClockIcon}
              gradient="from-orange-500 to-red-500"
              subtitle="Per day average"
            />
          </div>

          {/* Attendance Records Table */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <CalendarIcon className="w-4 h-4 text-white" />
                    </div>
                    Attendance History
                  </h3>
                  <p className="text-white/70 text-sm">
                    Complete attendance records for {studentInfo?.name || 'Student'}
                  </p>
                </div>
                <div className="flex flex-col sm:items-end gap-3">
                  <div className="text-center sm:text-right">
                    <div className="text-2xl font-bold text-white">{filteredAttendanceData.length}</div>
                    <div className="text-white/70 text-sm">Filtered Records</div>
                  </div>
                  <button
                    onClick={downloadAttendancePDF}
                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 text-sm font-semibold"
                  >
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-b border-white/10 bg-white/5">
              <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                <div>
                  <label className="block text-xs text-white/70 mb-1">From Date</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/70 mb-1">To Date</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                  />
                </div>
                <button
                  onClick={() => { setFromDate(''); setToDate(''); }}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm hover:bg-white/20"
                >
                  Clear Filter
                </button>
              </div>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                <span className="ml-3 text-white/70 text-sm">Loading attendance records...</span>
              </div>
            ) : filteredAttendanceData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-4 px-4 sm:px-6 text-white/70 font-semibold text-sm">Date</th>
                      <th className="text-left py-4 px-4 sm:px-6 text-white/70 font-semibold text-sm">Check In</th>
                      <th className="text-left py-4 px-4 sm:px-6 text-white/70 font-semibold text-sm">Check Out</th>
                      <th className="text-left py-4 px-4 sm:px-6 text-white/70 font-semibold text-sm">Duration</th>
                      <th className="text-left py-4 px-4 sm:px-6 text-white/70 font-semibold text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttendanceData.map((record, index) => (
                      <tr key={record.id || index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-4 px-4 sm:px-6">
                          <div className="text-white font-medium text-sm">
                            {formatDate(record.entry_time)}
                          </div>
                        </td>
                        <td className="py-4 px-4 sm:px-6 text-white/80 text-sm">
                          {formatTime(record.entry_time)}
                        </td>
                        <td className="py-4 px-4 sm:px-6 text-white/80 text-sm">
                          {formatTime(record.exit_time)}
                        </td>
                        <td className="py-4 px-4 sm:px-6 text-white/80 text-sm">
                          {formatDuration(record.total_duration)}
                        </td>
                        <td className="py-4 px-4 sm:px-6">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(record)}`}>
                            {getStatusText(record)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-lg font-semibold text-white mb-2">No Records Found</h3>
                <p className="text-white/70 text-sm">
                  No attendance records found for this student in selected date range.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      </div>
  );
};

export default StudentAttendanceDetails;
