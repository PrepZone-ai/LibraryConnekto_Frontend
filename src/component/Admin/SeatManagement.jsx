import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';

// Enhanced Icons with better styling
const SeatIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const UserIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const ClockIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const FilterIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

const SearchIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const CalendarIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const MoneyIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
  </svg>
);

const RefreshIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const SeatManagement = () => {
  const navigate = useNavigate();
  const { user, userType } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [libraryStats, setLibraryStats] = useState({
    total_seats: 0,
    total_students: 0,
    present_students: 0,
    available_seats: 0,
    pending_bookings: 0
  });
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [assignedSeats, setAssignedSeats] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [showSeatModal, setShowSeatModal] = useState(false);

  useEffect(() => {
    if (userType !== 'admin') {
      navigate('/admin/auth');
      return;
    }
    fetchData();
  }, [userType, navigate]);

  // Refresh data when component becomes visible (e.g., when navigating back from student management)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && userType === 'admin') {
        fetchData();
      }
    };

    const handleFocus = () => {
      if (userType === 'admin') {
        fetchData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [userType]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchLibraryStats(),
        fetchStudents()
      ]);
      // After fetching students and stats, compute assignments
      computeAssignedFromStudents();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await apiClient.get('/booking/seat-bookings');
      setBookings(response);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchLibraryStats = async () => {
    try {
      const response = await apiClient.get('/admin/stats');
      setLibraryStats(response);
    } catch (error) {
      console.error('Error fetching library stats:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await apiClient.get('/admin/students?order=created_at:asc&limit=1000');
      setStudents(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    }
  };

  const computeAssignedFromStudents = () => {
    try {
      const totalSeats = libraryStats.total_seats || 0;
      if (!totalSeats) {
        setAssignedSeats([]);
        return;
      }
      // Build deterministic assignment from student_id
      const taken = new Set();
      const assignments = [];
      const ordered = [...students].filter(s => !!s.student_id);
      // Sort by student_id for stable assignment
      ordered.sort((a, b) => String(a.student_id).localeCompare(String(b.student_id)));
      for (const s of ordered) {
        const preferred = getSeatFromStudentCode(s.student_id, totalSeats);
        let chosen = null;
        if (preferred && !taken.has(String(preferred))) {
          chosen = preferred;
        } else {
          const start = preferred && preferred >= 1 ? preferred : 1;
          for (let i = 0; i < totalSeats; i++) {
            const candidate = ((start - 1 + i) % totalSeats) + 1;
            if (!taken.has(String(candidate))) { chosen = candidate; break; }
          }
        }
        if (chosen) {
          taken.add(String(chosen));
          assignments.push({
            seat_number: String(chosen),
            name: s.name || 'Student',
            student_id: s.student_id,
            email: s.email,
            mobile: s.mobile_no,
            address: s.address,
            status: 'derived'
          });
        }
      }
      setAssignedSeats(assignments);
    } catch (e) {
      console.error('Error computing assignments from students:', e);
      setAssignedSeats([]);
    }
  };

  const fetchAssignedSeats = async () => {
    try {
      // Replaced by computeAssignedFromStudents based on students list
      return;
    } catch (error) {
      console.error('Error fetching assigned seats:', error);
    }
  };

  const handleBookingAction = async (bookingId, action, seatNumber = null) => {
    try {
      setActionLoading(true);
      const updateData = { status: action };
      
      if (action === 'approved' && seatNumber) {
        updateData.seat_number = String(seatNumber);
      }

      await apiClient.put(`/booking/seat-bookings/${bookingId}`, updateData);
      
      // Refresh data including assigned seats
      await fetchData();
      setShowBookingModal(false);
      setSelectedBooking(null);
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const openBookingModal = (booking) => {
    setSelectedBooking(booking);
    setShowBookingModal(true);
  };

  const closeBookingModal = () => {
    setSelectedBooking(null);
    setShowBookingModal(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <ClockIcon className="w-4 h-4" />;
      case 'approved': 
      case 'active': return <CheckIcon className="w-4 h-4" />;
      case 'rejected': return <XIcon className="w-4 h-4" />;
      default: return null;
    }
  };

  // Auto-assign helpers
  const extractStudentCode = (booking) => {
    // Prefer backend field name student_id from SeatBookingResponse
    return (
      booking?.student_id ||
      booking?.student_code ||
      booking?.student_unique_id ||
      booking?.studentId ||
      booking?.code ||
      ''
    );
  };

  const getSeatFromStudentCode = (studentCode, totalSeats) => {
    if (!studentCode || !totalSeats || totalSeats <= 0) return null;
    const digits = String(studentCode).match(/(\d+)/g);
    if (!digits || digits.length === 0) return null;
    const lastDigits = digits[digits.length - 1];
    // Use last 3 digits as requested (e.g., LUCK25001 -> 001 -> 1)
    const lastThree = lastDigits.slice(-3);
    let preferred = parseInt(lastThree, 10);
    if (Number.isNaN(preferred) || preferred <= 0) return null;
    // Clamp within totalSeats range by wrapping around
    while (preferred > totalSeats) {
      preferred = preferred - totalSeats;
    }
    return preferred;
  };

  const isSeatTaken = (seatNumber) => {
    const num = Number(seatNumber);
    return assignedSeats.some(seat => Number(seat.seat_number) === num);
  };

  const findAvailableSeat = (preferredSeat, totalSeats) => {
    if (!totalSeats || totalSeats <= 0) return null;
    if (preferredSeat && preferredSeat >= 1 && preferredSeat <= totalSeats && !isSeatTaken(preferredSeat)) {
      return preferredSeat;
    }
    // Scan forward then wrap to find next free
    const start = preferredSeat && preferredSeat >= 1 ? preferredSeat : 1;
    for (let i = 0; i < totalSeats; i++) {
      const candidate = ((start - 1 + i) % totalSeats) + 1;
      if (!isSeatTaken(candidate)) return candidate;
    }
    return null; // No free seats
  };

  const approveWithAutoSeat = async (booking) => {
    const totalSeats = libraryStats.total_seats || 0;
    const code = extractStudentCode(booking);
    const preferred = getSeatFromStudentCode(code, totalSeats);
    const finalSeat = findAvailableSeat(preferred, totalSeats);

    if (!finalSeat) {
      const seatInput = prompt('Enter seat number:');
      if (seatInput) {
        return handleBookingAction(booking.id, 'approved', String(seatInput));
      }
      return;
    }

    return handleBookingAction(booking.id, 'approved', String(finalSeat));
  };

  const autoAssignAllByStudentId = async () => {
    if (!libraryStats.total_seats) return;
    setActionLoading(true);
    try {
      // Work on a local copy of taken seats to avoid collisions during iteration
      const taken = new Set(assignedSeats.map(b => String(b.seat_number)));
      const totalSeats = libraryStats.total_seats;

      // Consider bookings that don't have a seat yet and are pending/approved/active
      const targets = bookings.filter(b => !b.seat_number && ['pending', 'approved', 'active'].includes(b.status));

      // Stable order by student_id to keep deterministic assignment
      targets.sort((a, b) => String(extractStudentCode(a)).localeCompare(String(extractStudentCode(b))));

      for (const booking of targets) {
        const code = extractStudentCode(booking);
        const preferred = getSeatFromStudentCode(code, totalSeats);

        // Find next available using the current taken set
        let chosen = null;
        if (preferred && preferred >= 1 && preferred <= totalSeats && !taken.has(String(preferred))) {
          chosen = preferred;
        } else {
          // scan
          const start = preferred && preferred >= 1 ? preferred : 1;
          for (let i = 0; i < totalSeats; i++) {
            const candidate = ((start - 1 + i) % totalSeats) + 1;
            if (!taken.has(String(candidate))) {
              chosen = candidate;
              break;
            }
          }
        }

        if (chosen) {
          // Reserve locally to avoid duplicates, then update backend
          taken.add(String(chosen));
          try {
            await apiClient.put(`/booking/seat-bookings/${booking.id}`, {
              status: booking.status === 'pending' ? 'approved' : booking.status,
              seat_number: String(chosen)
            });
          } catch (e) {
            console.error('Auto-assign failed for booking', booking.id, e);
            // free reservation if API failed
            taken.delete(String(chosen));
          }
        }
      }

      await fetchData();
    } finally {
      setActionLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = selectedStatus === 'all' || booking.status === selectedStatus;
    const matchesSearch = searchTerm === '' || 
      booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.mobile.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  // Create seat grid data
  const createSeatGrid = () => {
    const totalSeats = libraryStats.total_seats || 50; // Default to 50 if not available
    const seatsPerRow = 10; // 10 seats per row
    const totalRows = Math.ceil(totalSeats / seatsPerRow);
    const seatGrid = [];

    for (let row = 0; row < totalRows; row++) {
      const rowSeats = [];
      for (let col = 0; col < seatsPerRow; col++) {
        const seatNumber = row * seatsPerRow + col + 1;
        if (seatNumber <= totalSeats) {
          const assignedSeat = assignedSeats.find(seat => Number(seat.seat_number) === seatNumber);
          rowSeats.push({
            number: seatNumber,
            isAssigned: !!assignedSeat,
            studentName: assignedSeat ? assignedSeat.name : null,
            status: assignedSeat ? assignedSeat.status : 'available'
          });
        }
      }
      if (rowSeats.length > 0) {
        seatGrid.push(rowSeats);
      }
    }
    return seatGrid;
  };

  const SeatGrid = () => {
    const seatGrid = createSeatGrid();

    const openSeatModal = (seatNumber) => {
      const assignment = assignedSeats.find(s => Number(s.seat_number) === Number(seatNumber));
      setSelectedSeat({ number: Number(seatNumber), assignment: assignment || null });
      setShowSeatModal(true);
    };
    
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-white flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <SeatIcon className="w-4 h-4 text-white" />
            </div>
            <span>Library Seat Layout</span>
          </h2>
          <div className="flex items-center space-x-4 text-sm">
            <button
              onClick={autoAssignAllByStudentId}
              disabled={actionLoading}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:from-green-400 disabled:to-emerald-500 transition-all duration-200 font-semibold shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30"
            >
              {actionLoading ? 'Assigning…' : 'Auto-Assign by Student ID'}
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-white/70">Assigned</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-white/70">Available</span>
            </div>
          </div>
        </div>
        {assignedSeats.length === 0 && (
          <div className="mb-4 text-sm text-white/70">No seats assigned yet. Use "Auto-Assign by Student ID" to assign automatically.</div>
        )}
        
        <div className="space-y-4">
          {seatGrid.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center space-x-2">
              {row.map((seat) => (
                <div
                  key={seat.number}
                  onClick={() => openSeatModal(seat.number)}
                  className={`w-12 h-12 rounded-lg flex items-center justify-center text-sm font-semibold transition-all duration-200 hover:scale-110 cursor-pointer ${
                    seat.isAssigned
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25'
                      : 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25'
                  }`}
                  title={seat.isAssigned ? `Assigned to: ${seat.studentName}` : 'Available seat'}
                >
                  {seat.number}
                </div>
              ))}
            </div>
          ))}
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-white/70 text-sm mb-1">Total Seats</p>
            <p className="text-2xl font-bold text-white">{libraryStats.total_seats}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-white/70 text-sm mb-1">Assigned Seats</p>
            <p className="text-2xl font-bold text-green-400">{assignedSeats.length}</p>
          </div>
        </div>
      </div>
    );
  };

  const StatCard = ({ title, value, icon: Icon, gradient = 'from-blue-500 to-cyan-500', subtitle, delay = 0 }) => (
    <div 
      className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/70 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-purple-200 group-hover:bg-clip-text transition-all duration-300">{value}</p>
          {subtitle && <p className="text-white/60 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className={`p-4 rounded-2xl bg-gradient-to-r ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  );

  const BookingCard = ({ booking }) => (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group">
      <div className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">
                  {booking.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white group-hover:text-purple-200 transition-colors">{booking.name}</h3>
                <p className="text-white/70 text-sm">{booking.email}</p>
              </div>
            </div>
            <p className="text-white/60 text-sm font-mono">{booking.mobile}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(booking.status)} border border-white/20`}>
              {getStatusIcon(booking.status)}
              <span className="ml-1 capitalize">{booking.status}</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center space-x-2 mb-2">
              <CalendarIcon className="w-4 h-4 text-purple-400" />
              <p className="text-white/70 text-sm font-medium">Subscription</p>
            </div>
            <p className="text-white font-semibold text-lg">{booking.subscription_months} months</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center space-x-2 mb-2">
              <MoneyIcon className="w-4 h-4 text-green-400" />
              <p className="text-white/70 text-sm font-medium">Amount</p>
            </div>
            <p className="text-white font-semibold text-lg">₹{booking.amount}</p>
          </div>
        </div>

        {booking.seat_number && (
          <div className="mb-6 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-4 border border-blue-500/30">
            <div className="flex items-center space-x-2 mb-2">
              <SeatIcon className="w-4 h-4 text-blue-400" />
              <p className="text-white/70 text-sm font-medium">Assigned Seat</p>
            </div>
            <p className="text-blue-300 font-bold text-lg">Seat {booking.seat_number}</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-sm text-white/60 flex items-center space-x-2">
            <CalendarIcon className="w-4 h-4" />
            <span>Applied: {new Date(booking.created_at).toLocaleDateString()}</span>
          </div>
          <button
            onClick={() => openBookingModal(booking)}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 text-sm font-semibold shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transform hover:scale-105"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );

  const BookingModal = () => {
    if (!selectedBooking) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">Booking Details</h2>
              <button
                onClick={closeBookingModal}
                className="text-white/60 hover:text-white transition-colors duration-200 p-2 hover:bg-white/10 rounded-lg"
              >
                <XIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-8">
              {/* Student Information */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-white" />
                  </div>
                  <span>Student Information</span>
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-white/70 mb-2">Name</p>
                    <p className="font-semibold text-white">{selectedBooking.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/70 mb-2">Email</p>
                    <p className="font-semibold text-white">{selectedBooking.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/70 mb-2">Mobile</p>
                    <p className="font-semibold text-white font-mono">{selectedBooking.mobile}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/70 mb-2">Status</p>
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(selectedBooking.status)} border border-white/20`}>
                      {getStatusIcon(selectedBooking.status)}
                      <span className="ml-1 capitalize">{selectedBooking.status}</span>
                    </span>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-white/70 mb-2">Student ID</p>
                    <p className="font-semibold text-white font-mono break-all">{extractStudentCode(selectedBooking) || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/70 mb-2">Suggested Seat</p>
                    <p className="font-semibold text-white">{
                      (() => {
                        const code = extractStudentCode(selectedBooking);
                        const preferred = getSeatFromStudentCode(code, libraryStats.total_seats || 0);
                        const finalSeat = findAvailableSeat(preferred, libraryStats.total_seats || 0);
                        return finalSeat ? `Seat ${String(finalSeat).padStart(3, '0')}` : 'No seat available';
                      })()
                    }</p>
                  </div>
                </div>
                <div className="mt-6">
                  <p className="text-sm text-white/70 mb-2">Address</p>
                  <p className="font-semibold text-white">{selectedBooking.address}</p>
                </div>
              </div>

              {/* Booking Information */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <SeatIcon className="w-4 h-4 text-white" />
                  </div>
                  <span>Booking Information</span>
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-white/70 mb-2">Subscription Duration</p>
                    <p className="font-semibold text-white text-lg">{selectedBooking.subscription_months} months</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/70 mb-2">Amount</p>
                    <p className="font-semibold text-white text-lg">₹{selectedBooking.amount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/70 mb-2">Applied Date</p>
                    <p className="font-semibold text-white">{new Date(selectedBooking.created_at).toLocaleDateString()}</p>
                  </div>
                  {selectedBooking.seat_number && (
                    <div>
                      <p className="text-sm text-white/70 mb-2">Seat Number</p>
                      <p className="font-semibold text-blue-300 text-lg">Seat {selectedBooking.seat_number}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {selectedBooking.status === 'pending' && (
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleBookingAction(selectedBooking.id, 'rejected')}
                    disabled={actionLoading}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-4 px-6 rounded-xl hover:from-red-700 hover:to-red-800 disabled:from-red-400 disabled:to-red-500 transition-all duration-200 font-semibold shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 transform hover:scale-105 disabled:transform-none"
                  >
                    {actionLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <XIcon className="w-4 h-4 mr-2" />
                        Reject
                      </div>
                    )}
                  </button>
                  <button
                    onClick={() => approveWithAutoSeat(selectedBooking)}
                    disabled={actionLoading}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:from-green-400 disabled:to-emerald-500 transition-all duration-200 font-semibold shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 transform hover:scale-105 disabled:transform-none"
                  >
                    {actionLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <CheckIcon className="w-4 h-4 mr-2" />
                        Approve & Auto-Assign
                      </div>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SeatDetailsModal = () => {
    if (!showSeatModal || !selectedSeat) return null;
    const assignment = selectedSeat.assignment;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Seat {String(selectedSeat.number).padStart(3, '0')}
              </h2>
              <button
                onClick={() => { setShowSeatModal(false); setSelectedSeat(null); }}
                className="text-white/60 hover:text-white transition-colors duration-200 p-2 hover:bg-white/10 rounded-lg"
              >
                <XIcon className="w-6 h-6" />
              </button>
            </div>

            {assignment ? (
              <div className="space-y-6">
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Assigned Student</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-white/70 mb-1">Name</p>
                      <p className="font-semibold text-white">{assignment.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/70 mb-1">Student ID</p>
                      <p className="font-semibold text-white font-mono">{assignment.student_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/70 mb-1">Email</p>
                      <p className="font-semibold text-white break-all">{assignment.email || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/70 mb-1">Mobile</p>
                      <p className="font-semibold text-white">{assignment.mobile || '—'}</p>
                    </div>
                  </div>
                  {assignment.address && (
                    <div className="mt-4">
                      <p className="text-sm text-white/70 mb-1">Address</p>
                      <p className="font-semibold text-white">{assignment.address}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-white/80">This seat is currently unassigned.</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    // Recompute when students or stats change
    computeAssignedFromStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [students, libraryStats.total_seats]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/30 border-t-white"></div>
            <p className="text-white/70 mt-4">Loading seat management...</p>
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

           {/* Stats Cards */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
             <StatCard
               title="Registered / Total Seats"
               value={`${libraryStats.total_students} / ${libraryStats.total_seats}`}
               icon={SeatIcon}
               gradient="from-blue-500 to-cyan-500"
               subtitle="Library capacity"
               delay={0}
             />
             <StatCard
               title="Available Seats"
               value={libraryStats.available_seats}
               icon={SeatIcon}
               gradient="from-purple-500 to-pink-500"
               subtitle="Ready for booking"
               delay={100}
             />
             <StatCard
               title="Pending Bookings"
               value={libraryStats.pending_bookings}
               icon={ClockIcon}
               gradient="from-orange-500 to-red-500"
               subtitle="Awaiting approval"
               delay={200}
             />
           </div>

           {/* Seat Grid Layout */}
           <SeatGrid />

           {/* Filters and Search */}
           {/* Removed filters/search per request */}

          {/* Bookings List */}
          {/* Removed bookings list per request */}
        </div>
      </main>

      <Footer />

      {/* Booking Modal */}
      {showBookingModal && <BookingModal />}
      {/* Seat Details Modal */}
      {showSeatModal && <SeatDetailsModal />}
    </div>
  );
};

export default SeatManagement;
