import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

import Home from "./pages/Home";
import Login from "./pages/login";
import SignupRole from "./pages/signup";
import EmailFormWithOtp from "./pages/Student/EmailFormWithOtp";
import SignupStudentDetails from "./pages/Student/StudentDetailsForm";
import TutorEmailFormWithOtp from "./pages/Tutor/EmailFormWithOtp";
import SignupTutorDetails from "./pages/Tutor/TutorDetailsForm";
import CreatePost from "./pages/posts/CreatePost";
import RechargeOptions from "./pages/wallet/RechargeOptions";
import PaymentProcess from "./pages/wallet/PaymentProcess";
import ReportPost from "./pages/posts/ReportPost";
import AllPosts from "./pages/posts/AllPosts";
import PostDetail from "./pages/posts/PostDetail";
import { ProtectedRoute } from './components/ProtectedRoute';
import StudentProfile from "./pages/Student/Profile";
import TutorProfile from "./pages/Tutor/Profile";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/users";
import AdminTutors from "./pages/admin/tutors";
import AdminSubjects from "./pages/admin/subjects";
import PostInventory from "./pages/posts/PostInventory";
import MyBids from "./pages/posts/MyBids";
import EditPost from "./pages/posts/EditPost";
import ProfileRouter from "./pages/ProfileRouter";
import ChangePassword from "./pages/ChangePassword";
import ForgotPasswordEmailForm from "./pages/ForgotPassword/EmailForm";
import BrowseCourses from './pages/courses/BrowseCourses';
import CourseDetail from './pages/courses/CourseDetail';
import TutorCourseInventory from './pages/courses/TutorCourseInventory';
import MyEnrolledCourses from './pages/courses/MyEnrolledCourses';
import CreateCourse from './pages/courses/CreateCourse';  
import EditCourse from './pages/courses/EditCourse';     
import LessonManagement from './pages/courses/LessonManagement';
import LessonPlayer from './pages/courses/LessonPlayer';
import ChatPage from './pages/Chat/ChatPage';
import TutorWallet from './pages/wallet/TutorWallet';
import AdminInteractions from './pages/admin/AdminInteractions';
import ReportDetail from './pages/admin/ReportDetail'; 
import MyReports from './pages/MyReports';
import AdminPosts from './pages/admin/AdminPosts';
import MyReviews from './pages/posts/MyReviews';
import MyReceivedReviews from './pages/posts/MyReceivedReviews';
import PaymentSuccess from "./pages/wallet/PaymentSuccess";
import AdminTransactions from './pages/admin/AdminTransactions';
import MyReceivedBids from './pages/posts/MyReceivedBids';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup-role" element={<SignupRole />} />
          <Route path="/signup-student" element={<EmailFormWithOtp />} />
          <Route path="/signup-student/details" element={<SignupStudentDetails />} />
          <Route path="/signup-tutor" element={<TutorEmailFormWithOtp />} />
          <Route path="/signup-tutor/details" element={<SignupTutorDetails />} />
          
          {/* ✅ Thay PostList → CreatePost */}
          <Route path="/posts" element={<CreatePost />} />
          
          <Route path="/posts/create" element={<ProtectedRoute element={<CreatePost />} allowedRoles={['TUTOR']} />} />
          <Route path="/posts/inventory" element={<ProtectedRoute element={<PostInventory />} allowedRoles={['USER', 'TUTOR']} />} />
          <Route path="/posts/my-bids" element={<ProtectedRoute element={<MyBids />} allowedRoles={['TUTOR']} />} />
          <Route path="/posts/edit/:id" element={<ProtectedRoute element={<EditPost />} allowedRoles={['USER', 'TUTOR']} />} />
          <Route path="/posts/:postId/report" element={<ReportPost />} />
          <Route path="/posts/:postId" element={<PostDetail />} />
          <Route path="/all-posts" element={<AllPosts />} />
          {/* Wallet Routes */}
          <Route path="/wallet/recharge" element={<ProtectedRoute element={<RechargeOptions />} allowedRoles={['USER', 'TUTOR']} />} />
          <Route path="/wallet/recharge/payment" element={<PaymentProcess />} />
          {/* ✅ NEW - Payment Success Route */}
          <Route path="/wallet/payment-success" element={<PaymentSuccess />} />

          {/* ✅ Dynamic Profile Route - Routes theo role */}
          <Route path="/profile" element={<ProtectedRoute element={<ProfileRouter />} allowedRoles={['USER', 'TUTOR', 'ADMIN']} />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute element={<AdminDashboard />} allowedRoles={['ADMIN']} />} />
          <Route path="/admin/users" element={<ProtectedRoute element={<AdminUsers />} allowedRoles={['ADMIN']} />} />
          <Route path="/admin/tutors" element={<ProtectedRoute element={<AdminTutors />} allowedRoles={['ADMIN']} />} />
          <Route path="/admin/posts" element={<ProtectedRoute element={<AdminPosts />} allowedRoles={['ADMIN']} />} />
          <Route path="/admin/subjects" element={<ProtectedRoute element={<AdminSubjects />} allowedRoles={['ADMIN']} />} />
          <Route path="/admin/interactions" element={<ProtectedRoute element={<AdminInteractions />} allowedRoles={['ADMIN']} />} />
          
          {/* ✅ UPDATED - Wallet Management (Transactions) */}
          <Route path="/admin/transactions" element={<ProtectedRoute element={<AdminTransactions />} allowedRoles={['ADMIN']} />} />
          <Route path="/admin/wallet" element={<ProtectedRoute element={<AdminTransactions />} allowedRoles={['ADMIN']} />} />
          
          {/* Legacy routes - backward compatibility */}
          <Route path="/student/profile" element={<ProtectedRoute element={<StudentProfile />} allowedRoles={['USER']} />} />
          <Route path="/tutor/profile" element={<ProtectedRoute element={<TutorProfile />} allowedRoles={['TUTOR']} />} />
          <Route path="/change-password" element={<ProtectedRoute element={<ChangePassword />} allowedRoles={['USER', 'TUTOR', 'ADMIN']} />} />
          
          {/* Forgot Password Routes */}
          <Route path="/forgot-password" element={<ForgotPasswordEmailForm />} />
          
          {/* ✅ COURSE ROUTES */}
          <Route path="/courses" element={<BrowseCourses />} />
          <Route path="/courses/:courseId" element={<CourseDetail />} />
          
          {/* TUTOR - My Courses Inventory */}
          <Route 
            path="/courses/inventory" 
            element={<ProtectedRoute element={<TutorCourseInventory />} allowedRoles={['TUTOR']} />} 
          />
          
          {/* ✅ TUTOR - Create Course */}
          <Route 
            path="/courses/create" 
            element={<ProtectedRoute element={<CreateCourse />} allowedRoles={['TUTOR']} />} 
          />
          
          {/* ✅ TUTOR - Edit Course */}
          <Route 
            path="/courses/edit/:courseId" 
            element={<ProtectedRoute element={<EditCourse />} allowedRoles={['TUTOR']} />} 
          />
          
          {/* STUDENT - My Enrolled Courses */}
          <Route 
            path="/courses/my-enrolled" 
            element={<ProtectedRoute element={<MyEnrolledCourses />} allowedRoles={['USER']} />} 
          />
          
          {/* NEW - Lesson Management */}
          <Route path="/courses/:courseId/lessons" element={<LessonManagement />} />
          <Route path="/courses/:courseId/learn/:lessonId" element={<LessonPlayer />} />
          
          {/* CHAT PAGE - NEW ROUTE */}
          <Route 
            path="/chat" 
            element={
              <ProtectedRoute 
                element={<ChatPage />} 
                allowedRoles={['USER', 'TUTOR']} 
              />
            } 
          />
          
          {/* ✅ NEW: Tutor Wallet Page */}
          <Route path="/wallet/tutor" element={<ProtectedRoute element={<TutorWallet />} allowedRoles={['TUTOR']} />} />

          {/* ✅ NEW: Admin Interactions */}
          <Route 
            path="/admin/interactions" 
            element={<ProtectedRoute element={<AdminInteractions />} allowedRoles={['ADMIN']} />} 
          />
          <Route 
            path="/admin/report/:reportId" 
            element={<ProtectedRoute element={<ReportDetail />} allowedRoles={['ADMIN']} />} 
          />
          <Route 
            path="/my-reports" 
            element={<ProtectedRoute element={<MyReports />} allowedRoles={['USER', 'TUTOR']} />} 
          />

          {/* STUDENT - My Posts */}
          <Route 
            path="/posts/inventory" 
            element={<ProtectedRoute element={<PostInventory />} allowedRoles={['USER']} />} 
          />

          {/* ✅ NEW - STUDENT - My Reviews */}
          <Route 
            path="/posts/my-reviews" 
            element={<ProtectedRoute element={<MyReviews />} allowedRoles={['USER']} />} 
          />

          {/* ✅ NEW - TUTOR - My Received Reviews */}
          <Route 
            path="/reviews/received" 
            element={<ProtectedRoute element={<MyReceivedReviews />} allowedRoles={['TUTOR']} />} 
          />

          {/* ✅ NEW - My Received Bids */}
          <Route 
            path="/posts/my-received-bids" 
            element={<ProtectedRoute element={<MyReceivedBids />} allowedRoles={['USER']} />} 
          />

          {/* 404 */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
