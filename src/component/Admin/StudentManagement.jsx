import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';

const StudentManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userType, user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    mobile_no: '',
    address: '',
    subscription_start: '',
    subscription_end: '',
    is_shift_student: false,
    shift_time: ''
  });
  const [bulkCSVText, setBulkCSVText] = useState('');
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkError, setBulkError] = useState('');
  const [hasShiftSystem, setHasShiftSystem] = useState(false);
  const [shiftOptions, setShiftOptions] = useState([]); // array of { label, value }
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [autoDateMode, setAutoDateMode] = useState(true); // when true, end date auto-follows plan duration

  useEffect(() => {
    if (userType !== 'admin') {
      navigate('/admin/auth');
      return;
    }
    fetchAdminShiftConfig();
    fetchPlans();
    fetchStudents();
  }, [userType, navigate]);

  const fetchPlans = async () => {
    try {
      setLoadingPlans(true);
      const p = await apiClient.get('/admin/subscription-plans');
      setPlans(Array.isArray(p) ? p : []);
    } catch (_) {
      setPlans([]);
    } finally {
      setLoadingPlans(false);
    }
  };

  // Helpers
  const formatDateInput = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const addMonthsClamped = (dateStr, months) => {
    try {
      const [y, m, d] = String(dateStr).split('-').map((v) => parseInt(v, 10));
      const base = new Date(y, m - 1, d);
      const targetMonth = base.getMonth() + months;
      const target = new Date(base);
      target.setMonth(targetMonth);
      // Set to previous day to represent inclusive duration (e.g., 1-month plan ends previous day of next month)
      target.setDate(target.getDate() - 1);
      return formatDateInput(target);
    } catch (_) {
      return '';
    }
  };

  // When plan changes, set default dates (start=today, end=start + months - 1 day). Allow user to customize afterwards
  useEffect(() => {
    if (!selectedPlanId) return;
    const plan = plans.find((p) => String(p.id) === String(selectedPlanId));
    if (!plan) return;
    const today = new Date();
    const startStr = formatDateInput(today);
    const endStr = addMonthsClamped(startStr, parseInt(plan.months || 1, 10));
    setNewStudent((prev) => ({
      ...prev,
      subscription_start: startStr,
      subscription_end: endStr,
    }));
    setAutoDateMode(true);
  }, [selectedPlanId, plans]);

  const fetchAdminShiftConfig = async () => {
    try {
      const details = await apiClient.get('/admin/details');
      const enabled = !!details?.has_shift_system;
      setHasShiftSystem(enabled);
      let options = [];
      if (enabled && Array.isArray(details?.shift_timings)) {
        // Normalize: could be ["09:00 - 13:00", ...] or [{start,end}, ...]
        options = details.shift_timings.map((t, idx) => {
          if (typeof t === 'string') {
            const label = t.trim();
            return { label, value: label };
          }
          const start = t?.start || '';
          const end = t?.end || '';
          const label = `${start} - ${end}`.trim();
          return { label, value: label || `Shift ${idx + 1}` };
        });
      }
      setShiftOptions(options);
    } catch (e) {
      // Non-blocking; keep defaults
      setHasShiftSystem(false);
      setShiftOptions([]);
    }
  };

  // Auto-open modal based on navigation state from dashboard
  useEffect(() => {
    const mode = location?.state?.addStudentMode;
    if (mode === 'single') {
      setShowAddModal(true);
    } else if (mode === 'bulk') {
      setShowBulkModal(true);
    }
  }, [location?.state]);

  const fetchStudents = async () => {
    try {
      const response = await apiClient.get('/admin/students');
      setStudents(response);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      // Client-side validations to avoid 422
      if (!newStudent.name?.trim()) throw new Error('Name is required');
      if (!newStudent.email?.trim()) throw new Error('Email is required');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newStudent.email.trim())) throw new Error('Invalid email');
      if (!newStudent.mobile_no?.trim()) throw new Error('Mobile number is required');
      if (!/^\d{10}$/.test(newStudent.mobile_no.trim())) throw new Error('Mobile number must be 10 digits');
      if (!selectedPlanId) throw new Error('Subscription plan is required');
      if (!newStudent.subscription_start) throw new Error('Subscription start date is required');
      if (!newStudent.subscription_end) throw new Error('Subscription end date is required');
      if (new Date(newStudent.subscription_start) > new Date(newStudent.subscription_end)) throw new Error('Subscription end date must be after start date');
      if (newStudent.is_shift_student && !newStudent.shift_time?.trim()) throw new Error('Shift time is required for shift students');

      // Normalize and send only fields likely required by backend
      const toISODate = (val) => {
        if (!val) return undefined;
        // Expecting YYYY-MM-DD from input type=date already
        const day = String(val).slice(0, 10);
        return `${day}T00:00:00Z`;
      };

      const payload = {
        name: (newStudent.name || '').trim(),
        email: (newStudent.email || '').trim().toLowerCase(),
        mobile_no: (newStudent.mobile_no || '').trim(),
        phone: (newStudent.mobile_no || '').trim(), // alias for backends expecting `phone`
        address: (newStudent.address || '').trim() || undefined,
        residential_address: (newStudent.address || '').trim() || undefined,
        subscription_start: toISODate(newStudent.subscription_start),
        subscription_end: toISODate(newStudent.subscription_end),
        start_date: toISODate(newStudent.subscription_start), // aliases for alternate field names
        end_date: toISODate(newStudent.subscription_end),
        is_shift_student: !!newStudent.is_shift_student,
        shift_time: newStudent.is_shift_student ? (newStudent.shift_time || '').trim() : undefined,
        subscription_plan_id: selectedPlanId,
        plan_id: selectedPlanId,
        admin_id: user?.id,
        password: (newStudent.mobile_no || '').trim(),
        send_email: true,
      };

      // Remove undefined fields
      Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

      await apiClient.post('/admin/students', payload);
      setShowAddModal(false);
      setNewStudent({
        name: '',
        email: '',
        mobile_no: '',
        address: '',
        subscription_start: '',
        subscription_end: '',
        is_shift_student: false,
        shift_time: ''
      });
      setSelectedPlanId('');
      fetchStudents();
      alert('Student added successfully. Login credentials have been emailed.');
    } catch (error) {
      console.error('Error adding student:', error);
      alert(error.message || 'Failed to add student. Please check required fields.');
    }
  };

  const parseBoolean = (val) => {
    if (typeof val === 'boolean') return val;
    const s = String(val || '').trim().toLowerCase();
    return s === '1' || s === 'true' || s === 'yes' || s === 'y';
  };

  const parsedBulkRows = useMemo(() => {
    const text = bulkCSVText || '';
    if (!text.trim()) return [];
    const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.trim().length > 0);
    if (lines.length === 0) return [];
    const header = lines[0].split(',').map(h => h.trim());
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const raw = lines[i];
      // Simple CSV parsing that handles quoted values
      const cols = [];
      let current = '';
      let inQuotes = false;
      
      for (let j = 0; j < raw.length; j++) {
        const char = raw[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          cols.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      cols.push(current.trim()); // Add the last column
      
      const record = {};
      header.forEach((key, idx) => {
        let value = (cols[idx] || '').trim();
        // Remove surrounding quotes if present
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        record[key] = value;
      });
      const toISODateTime = (d) => {
        const s = (d || '').trim();
        if (!s) return undefined;
        if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
          // Convert YYYY-MM-DD to full ISO datetime
          return `${s}T00:00:00.000Z`;
        }
        // If it's already a full datetime, return as is
        return s;
      };
      const student = {
        name: record.name || record.full_name || '',
        email: record.email || '',
        mobile_no: record.mobile_no || record.mobile || record.phone || '',
        address: record.address || '',
        subscription_start: toISODateTime(record.subscription_start || record.start || ''),
        subscription_end: toISODateTime(record.subscription_end || record.end || ''),
        is_shift_student: parseBoolean(record.is_shift_student || record.shift || false),
        shift_time: record.shift_time || record.shift_hours || ''
      };
      
      // basic validation: must have at least name and email
      if ((student.name && student.email)) {
        rows.push(student);
      }
    }
    return rows;
  }, [bulkCSVText]);

  const handleBulkFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setBulkCSVText(text);
  };

  const downloadTemplate = () => {
    try {
      const headers = ['name', 'email', 'mobile_no', 'address', 'subscription_start', 'subscription_end', 'is_shift_student', 'shift_time'];
      const sampleData = [
        ['John Doe', 'john.doe@example.com', '9876543210', '123 Main St, City', '2024-01-01T00:00:00.000Z', '2024-12-31T23:59:59.000Z', 'false', ''],
        ['Jane Smith', 'jane.smith@example.com', '9876543211', '456 Oak Ave, Town', '2024-01-15T00:00:00.000Z', '2024-12-31T23:59:59.000Z', 'true', '09:00 - 13:00'],
        ['Mike Johnson', 'mike.johnson@example.com', '9876543212', '789 Pine Rd, Village', '2024-02-01T00:00:00.000Z', '2024-12-31T23:59:59.000Z', 'false', '']
      ];
      
      const csvContent = [
        headers.join(','),
        ...sampleData.map(row => row.map(cell => {
          // Escape cells that contain commas, quotes, or newlines
          if (typeof cell === 'string' && /[",\n]/.test(cell)) {
            return '"' + cell.replace(/"/g, '""') + '"';
          }
          return cell;
        }).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'student_template.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Failed to download template');
    }
  };

  const submitBulkImport = async (e) => {
    e.preventDefault();
    setBulkError('');
    if (parsedBulkRows.length === 0) {
      setBulkError('No valid rows parsed. Ensure CSV has a header and required columns.');
      return;
    }
    try {
      setBulkUploading(true);
      const normalizeDateTime = (s) => {
        if (!s) return undefined;
        const v = String(s).trim();
        
        if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
          // Convert YYYY-MM-DD to full ISO datetime
          return `${v}T00:00:00.000Z`;
        }
        // If it's already a full datetime, return as is
        return v;
      };
      
      let successCount = 0;
      let errorCount = 0;
      const errors = [];
      
      // Process each student individually using the existing endpoint
      for (let i = 0; i < parsedBulkRows.length; i++) {
        const student = parsedBulkRows[i];
        try {
          const payload = {
            name: student.name?.trim(),
            email: student.email?.trim().toLowerCase(),
            mobile_no: student.mobile_no?.trim(),
            address: student.address?.trim() || undefined,
            subscription_start: normalizeDateTime(student.subscription_start),
            subscription_end: normalizeDateTime(student.subscription_end),
            is_shift_student: student.is_shift_student || false,
            shift_time: student.is_shift_student ? (student.shift_time?.trim() || undefined) : undefined,
            password: student.mobile_no?.trim(), // Use mobile number as initial password
            admin_id: user?.id,
          };
          
          // Remove undefined fields
          Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);
          
          await apiClient.post('/admin/students', payload);
          successCount++;
        } catch (error) {
          errorCount++;
          errors.push(`Row ${i + 1} (${student.name || 'Unknown'}): ${error.message}`);
        }
      }
      
      setShowBulkModal(false);
      setBulkCSVText('');
      fetchStudents();
      
      if (errorCount === 0) {
        alert(`Successfully imported ${successCount} students.`);
      } else {
        alert(`Imported ${successCount} students successfully. ${errorCount} failed:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? '\n...' : ''}`);
      }
    } catch (error) {
      console.error('Bulk import failed:', error);
      setBulkError(error?.message || 'Bulk import failed.');
    } finally {
      setBulkUploading(false);
    }
  };

  const handleDeleteStudent = async (student) => {
    if (window.confirm(`Are you sure you want to delete ${student.name}? This action cannot be undone.`)) {
      try {
        await apiClient.del(`/admin/students/${student.id}`);
        fetchStudents(); // This will refresh the list and filter out the inactive student
        alert(`${student.name} has been deleted successfully.`);
      } catch (error) {
        console.error('Error deleting student:', error);
        alert('Failed to delete student. Please try again.');
      }
    }
  };

  const filteredStudents = students.filter(student => {
    // Filter out inactive/deleted students
    if (student.status === 'inactive') {
      return false;
    }
    
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.student_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || student.subscription_status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Expired': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/30 border-t-white"></div>
            <p className="text-white/70 mt-4">Loading students...</p>
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
          <div className="flex justify-end items-center mb-12">
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transform hover:scale-105"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Single
                </div>
              </button>
              <button
                onClick={() => setShowBulkModal(true)}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transform hover:scale-105"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
                  </svg>
                  Bulk Import
                </div>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-white/20 shadow-xl">
            <h3 className="text-xl font-semibold text-white mb-6">Search & Filter</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-3">Search Students</label>
                <input
                  type="text"
                  placeholder="Search by name, email, or student ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/90 mb-3">Filter by Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="all" className="bg-slate-800">All Students</option>
                  <option value="Active" className="bg-slate-800">Active</option>
                  <option value="Expired" className="bg-slate-800">Expired</option>
                  <option value="Pending" className="bg-slate-800">Pending</option>
                </select>
              </div>
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20 shadow-xl">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      Student ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      Subscription
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/5 divide-y divide-white/10">
                  {filteredStudents.map((student) => (
                    <tr key={student.student_id} className="hover:bg-white/10 transition-all duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                              <span className="text-white font-bold text-lg">
                                {student.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">{student.name}</div>
                            <div className="text-sm text-white/60">{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-mono">
                        {student.student_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {student.mobile_no}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        <div>
                          <div className="text-white/80">Start: {new Date(student.subscription_start).toLocaleDateString()}</div>
                          <div className="text-white/80">End: {new Date(student.subscription_end).toLocaleDateString()}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          student.subscription_status === 'Active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          student.subscription_status === 'Expired' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                          'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                        }`}>
                          {student.subscription_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigate(`/admin/students/${student.id}/edit`)}
                            className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all duration-200 border border-blue-500/30"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => navigate(`/admin/students/${student.id}/attendance`)}
                            className="px-3 py-1 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-all duration-200 border border-green-500/30"
                          >
                            Attendance
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student)}
                            className="px-3 py-1 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-all duration-200 border border-red-500/30"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
            </table>
          </div>
        </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <p className="text-white/70 text-lg">No students found matching your criteria.</p>
            </div>
          )}
        </div>
      </main>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 w-96 shadow-2xl rounded-2xl bg-slate-800 border border-white/20">
            <div className="mt-3">
              <h3 className="text-xl font-semibold text-white mb-6">Add New Student</h3>
              <form onSubmit={handleAddStudent} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Name</label>
                  <input
                    type="text"
                    required
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter student name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={newStudent.mobile_no}
                    onChange={(e) => setNewStudent({...newStudent, mobile_no: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter mobile number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Address</label>
                  <textarea
                    value={newStudent.address}
                    onChange={(e) => setNewStudent({...newStudent, address: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                    rows="3"
                    placeholder="Enter address"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Subscription Plan</label>
                    <select
                      required
                      value={selectedPlanId}
                      onChange={(e) => setSelectedPlanId(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="" className="bg-slate-800">{loadingPlans ? 'Loading plans...' : 'Select a plan'}</option>
                      {plans.map((plan) => (
                        <option key={plan.id} value={plan.id} className="bg-slate-800">
                          {plan.months} month{plan.months > 1 ? 's' : ''} - ₹{plan.discounted_amount || plan.amount}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Subscription Start</label>
                    <input
                      type="date"
                      required
                      value={newStudent.subscription_start}
                      onChange={(e) => {
                        const v = e.target.value;
                        setNewStudent((prev) => ({ ...prev, subscription_start: v }));
                        if (autoDateMode && selectedPlanId) {
                          const plan = plans.find((p) => String(p.id) === String(selectedPlanId));
                          if (plan) {
                            const nextEnd = addMonthsClamped(v, parseInt(plan.months || 1, 10));
                            setNewStudent((prev) => ({ ...prev, subscription_end: nextEnd }));
                          }
                        }
                      }}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Subscription End</label>
                    <input
                      type="date"
                      required
                      value={newStudent.subscription_end}
                      onChange={(e) => {
                        setAutoDateMode(false);
                        setNewStudent({...newStudent, subscription_end: e.target.value});
                      }}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="shift_student"
                    checked={newStudent.is_shift_student}
                    onChange={(e) => setNewStudent({...newStudent, is_shift_student: e.target.checked})}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-white/20 rounded bg-white/10"
                  />
                  <label htmlFor="shift_student" className="ml-2 block text-sm text-white/90">
                    Shift Student
                  </label>
                </div>
                {newStudent.is_shift_student && (
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Shift Time</label>
                    {hasShiftSystem && shiftOptions.length > 0 ? (
                      <select
                        value={newStudent.shift_time}
                        onChange={(e) => setNewStudent({ ...newStudent, shift_time: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="" className="bg-slate-800">Select a shift</option>
                        {shiftOptions.map((opt, i) => (
                          <option key={i} value={opt.value} className="bg-slate-800">{opt.label}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="e.g., 09:00 - 13:00"
                        value={newStudent.shift_time}
                        onChange={(e) => setNewStudent({...newStudent, shift_time: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      />
                    )}
                  </div>
                )}
                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-3 text-sm font-medium text-white/70 bg-white/10 rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/20"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg shadow-purple-500/25"
                  >
                    Add Student
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-16 mx-auto p-5 w-[40rem] max-w-[95vw] shadow-2xl rounded-2xl bg-slate-800 border border-white/20">
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-semibold text-white mb-4">Bulk Import Students (CSV)</h3>
              <button
                onClick={() => setShowBulkModal(false)}
                className="text-white/60 hover:text-white"
                aria-label="Close"
              >✖</button>
            </div>
            <div className="text-white/80 text-sm mb-4">
              Expected headers: <code className="font-mono">name,email,mobile_no,address,subscription_start,subscription_end,is_shift_student,shift_time</code>
            </div>
            <form onSubmit={submitBulkImport} className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <input type="file" accept=".csv,text/csv" onChange={handleBulkFile} className="text-white/80" />
                  <button
                    type="button"
                    onClick={downloadTemplate}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-lg shadow-blue-500/25 text-sm"
                    title="Download CSV template with sample data"
                  >
                    📥 Download Template
                  </button>
                </div>
                <div className="text-white/70 text-sm">Parsed rows: {parsedBulkRows.length}</div>
              </div>
              <textarea
                rows="10"
                value={bulkCSVText}
                onChange={(e) => setBulkCSVText(e.target.value)}
                placeholder="Paste CSV here..."
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-y"
              />
              {bulkError ? <div className="text-red-300 text-sm">{bulkError}</div> : null}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="px-6 py-3 text-sm font-medium text-white/80 bg-white/10 rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/20"
                >Cancel</button>
                <button
                  type="submit"
                  disabled={bulkUploading}
                  className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 shadow-lg shadow-blue-500/25 disabled:opacity-60"
                >{bulkUploading ? 'Importing...' : 'Import Students'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default StudentManagement;
