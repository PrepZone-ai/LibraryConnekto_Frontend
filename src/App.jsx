import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Home from './component/Home/Home'
import Services from './component/Services/Services'
import About from './component/About/About'
import Contact from './component/Contact/Contact'
import AdminAuth from './component/Auth/AdminAuth'
import StudentLogin from './component/Auth/StudentLogin'
import StudentSetPassword from './component/Auth/StudentSetPassword'
import EmailVerificationSuccess from './component/Auth/EmailVerificationSuccess'
import EmailVerificationError from './component/Auth/EmailVerificationError'

// Admin Components
import AdminDashboard from './component/Admin/AdminDashboard'
import AdminDetailsForm from './component/Admin/AdminDetailsForm'
import AdminProfile from './component/Admin/AdminProfile'
import StudentManagement from './component/Admin/StudentManagement'
import AdminMessages from './component/Admin/AdminMessages'
import SeatManagement from './component/Admin/SeatManagement'
import AdminAnalytics from './component/Admin/AdminAnalytics'
import AdminBookingManagement from './component/Admin/AdminBookingManagement'
import AttendanceDetails from './component/Admin/AttendanceDetails'
import RevenueDetails from './component/Admin/RevenueDetails'
import StudentAttendanceDetails from './component/Admin/StudentAttendanceDetails'
import StudentRemovalRequests from './component/Admin/StudentRemovalRequests'
import AdminReferral from './component/Admin/AdminReferral'

// Student Components
import StudentDashboard from './component/Student/StudentDashboard'
import BookSeat from './component/Student/BookSeat'
import StudentMessages from './component/Student/StudentMessages'
import StudentTasks from './component/Student/StudentTasks'
import StudentExams from './component/Student/StudentExams'
import StudentAttendance from './component/Student/StudentAttendance'
import AttendanceHistory from './component/Student/AttendanceHistory'
import StudentProfile from './component/Student/StudentProfile'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {/* Authentication Routes */}
          <Route path="/admin/auth" element={<AdminAuth />} />
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/student/set-password" element={<StudentSetPassword />} />
          
          {/* Email Verification Routes */}
          <Route path="/auth/verify-success" element={<EmailVerificationSuccess />} />
          <Route path="/auth/verify-error" element={<EmailVerificationError />} />

          {/* Admin Protected Routes */}
          <Route path="/admin/details" element={<AdminDetailsForm />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
          <Route path="/admin/students" element={<StudentManagement />} />
          <Route path="/admin/messages" element={<AdminMessages />} />
          <Route path="/admin/seats" element={<SeatManagement />} />
          <Route path="/admin/seat-management" element={<SeatManagement />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/booking-management" element={<AdminBookingManagement />} />
          <Route path="/admin/attendance-details" element={<AttendanceDetails />} />
          <Route path="/admin/revenue-details" element={<RevenueDetails />} />
          <Route path="/admin/student-attendance/:studentId" element={<StudentAttendanceDetails />} />
          <Route path="/admin/student-removal-requests" element={<StudentRemovalRequests />} />
          <Route path="/admin/referral" element={<AdminReferral />} />

          {/* Student Protected Routes */}
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/book-seat" element={<BookSeat />} />
          <Route path="/student/messages" element={<StudentMessages />} />
          <Route path="/student/tasks" element={<StudentTasks />} />
          <Route path="/student/exams" element={<StudentExams />} />
          <Route path="/student/attendance" element={<StudentAttendance />} />
          <Route path="/student/attendance-history" element={<AttendanceHistory />} />
          <Route path="/student/profile" element={<StudentProfile />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
