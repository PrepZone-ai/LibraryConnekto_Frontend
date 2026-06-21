import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import './App.css'
import About from './component/About/About'
import AdminAuth from './component/Auth/AdminAuth'
import AdminResetPassword from './component/Auth/AdminResetPassword'
import EmailVerificationError from './component/Auth/EmailVerificationError'
import EmailVerificationSuccess from './component/Auth/EmailVerificationSuccess'
import StudentForgotPassword from './component/Auth/StudentForgotPassword'
import StudentLogin from './component/Auth/StudentLogin'
import StudentSetPassword from './component/Auth/StudentSetPassword'
import AnonymousBookingPage from './component/Booking/AnonymousBookingPage'
import Contact from './component/Contact/Contact'
import HomeRoute from './component/Home/HomeRoute'
import AdminDetailsGate from './component/Admin/AdminDetailsGate'
import AdminPlatformSubscriptionGate from './component/Admin/AdminPlatformSubscriptionGate'
import AppLayout from './component/Layout/AppLayout'
import LibraryDetails from './component/Library/LibraryDetails'
import LibraryList from './component/Library/LibraryList'
import Services from './component/Services/Services'
import { AuthProvider } from './contexts/AuthContext'

// Admin Components
import AdminAnalytics from './component/Admin/AdminAnalytics'
import AdminBookingManagement from './component/Admin/AdminBookingManagement'
import AdminDashboard from './component/Admin/AdminDashboard'
import AdminDetailsForm from './component/Admin/AdminDetailsForm'
import AdminMessages from './component/Admin/AdminMessages'
import AdminProfile from './component/Admin/AdminProfile'
import AdminPlatformSubscription from './component/Admin/AdminPlatformSubscription'
import AdminQRScanner from './component/Admin/AdminQRScanner'
import AdminReferral from './component/Admin/AdminReferral'
import AttendanceDetails from './component/Admin/AttendanceDetails'
import RevenueDetails from './component/Admin/RevenueDetails'
import SeatManagement from './component/Admin/SeatManagement'
import StudentAttendanceDetails from './component/Admin/StudentAttendanceDetails'
import StudentManagement from './component/Admin/StudentManagement'
import StudentRemovalRequests from './component/Admin/StudentRemovalRequests'

// Student Components
import AttendanceHistory from './component/Student/AttendanceHistory'
import BookSeat from './component/Student/BookSeat'
import StudentAttendance from './component/Student/StudentAttendance'
import StudentDashboard from './component/Student/StudentDashboard'
import StudentExams from './component/Student/StudentExams'
import StudentMessages from './component/Student/StudentMessages'
import StudentProfile from './component/Student/StudentProfile'
import StudentSubscription from './component/Student/StudentSubscription'
import StudentSubscriptionUnavailable from './component/Student/StudentSubscriptionUnavailable'
import StudentTasks from './component/Student/StudentTasks'

// Payment Components
import PaymentConfirmation from './component/Payment/PaymentConfirmation'
import PaymentSuccess from './component/Payment/PaymentSuccess'
import TransferPayment from './component/Payment/TransferPayment'
import ScrollToTop from './component/common/ScrollToTop'
import PriyaVoiceWidget from './component/common/PriyaVoiceWidget'

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <PriyaVoiceWidget />
        <Routes>
          <Route element={<AdminPlatformSubscriptionGate />}>
          <Route element={<AdminDetailsGate />}>
          <Route element={<AppLayout />}>
            {/* Public Routes */}
            <Route path="/" element={<HomeRoute />} />
            <Route path="/services" element={<Services />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/book-seat" element={<AnonymousBookingPage />} />
            <Route path="/library/:libraryId" element={<LibraryDetails />} />
            <Route path="/libraries" element={<LibraryList />} />

            {/* Authentication Routes */}
            <Route path="/admin/login" element={<Navigate to="/admin/auth" replace />} />
            <Route path="/login" element={<Navigate to="/admin/auth" replace />} />
            <Route path="/admin/auth" element={<AdminAuth />} />
            <Route path="/admin/reset-password" element={<AdminResetPassword />} />
            <Route path="/student/login" element={<StudentLogin />} />
            <Route path="/student/forgot-password" element={<StudentForgotPassword />} />
            <Route path="/student/set-password" element={<StudentSetPassword />} />
            
            {/* Email Verification Routes */}
            <Route path="/auth/verify-success" element={<EmailVerificationSuccess />} />
            <Route path="/auth/verify-error" element={<EmailVerificationError />} />

            {/* Payment Routes */}
            <Route path="/payment/:bookingId" element={<PaymentConfirmation />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/transfer/payment" element={<TransferPayment />} />

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
            <Route path="/admin/scanner" element={<AdminQRScanner />} />
            <Route path="/admin/platform-subscription" element={<AdminPlatformSubscription />} />

            {/* Student Protected Routes */}
            <Route path="/student/subscription-unavailable" element={<StudentSubscriptionUnavailable />} />
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/subscription" element={<StudentSubscription />} />
            <Route path="/student/book-seat" element={<BookSeat />} />
            <Route path="/student/messages" element={<StudentMessages />} />
            <Route path="/student/tasks" element={<StudentTasks />} />
            <Route path="/student/exams" element={<StudentExams />} />
            <Route path="/student/attendance" element={<StudentAttendance />} />
            <Route path="/student/attendance-history" element={<AttendanceHistory />} />
            <Route path="/student/profile" element={<StudentProfile />} />
          </Route>
          </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}
export default App
