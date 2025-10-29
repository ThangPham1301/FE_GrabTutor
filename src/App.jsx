import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from './contexts/AuthContext.jsx';
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
import EditPost from "./pages/posts/EditPost";
import ProfileRouter from "./pages/ProfileRouter";
import ChangePassword from "./pages/ChangePassword";
import ForgotPasswordEmailForm from "./pages/ForgotPassword/EmailForm";

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
          <Route path="/posts/edit/:id" element={<ProtectedRoute element={<EditPost />} allowedRoles={['USER', 'TUTOR']} />} />
          <Route path="/posts/:postId/report" element={<ReportPost />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="/all-posts" element={<AllPosts />} />
          <Route path="/wallet/recharge" element={<RechargeOptions />} />
          <Route path="/wallet/recharge/payment" element={<PaymentProcess />} />

          {/* ✅ Dynamic Profile Route - Routes theo role */}
          <Route path="/profile" element={<ProtectedRoute element={<ProfileRouter />} allowedRoles={['USER', 'TUTOR', 'ADMIN']} />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute element={<AdminDashboard />} allowedRoles={['ADMIN']} />} />
          <Route path="/admin/users" element={<ProtectedRoute element={<AdminUsers />} allowedRoles={['ADMIN']} />} />
          <Route path="/admin/tutors" element={<ProtectedRoute element={<AdminTutors />} allowedRoles={['ADMIN']} />} />
          <Route path="/admin/subjects" element={<ProtectedRoute element={<AdminSubjects />} allowedRoles={['ADMIN']} />} />

          {/* Legacy routes - backward compatibility */}
          <Route path="/student/profile" element={<ProtectedRoute element={<StudentProfile />} allowedRoles={['USER']} />} />
          <Route path="/tutor/profile" element={<ProtectedRoute element={<TutorProfile />} allowedRoles={['TUTOR']} />} />
          <Route path="/change-password" element={<ProtectedRoute element={<ChangePassword />} allowedRoles={['USER', 'TUTOR', 'ADMIN']} />} />
          
          {/* Forgot Password Routes */}
          <Route path="/forgot-password" element={<ForgotPasswordEmailForm />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
