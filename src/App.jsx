import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from './contexts/AuthContext.jsx'; // Add .jsx extension and correct casing
import Home from "./pages/Home";
// import Login from "./pages/Login";
import LoginRole from "./pages/loginRole";
import LoginStudent from "./pages/loginStudent";
import LoginTutor from "./pages/loginTutor";
import SignupRole from "./pages/signup";
import SignupStudentEmail from "./pages/Student/EmailForm";
import SignupStudentDetails from "./pages/Student/StudentDetailsForm";
import SignupTutorEmail from "./pages/Tutor/EmailForm";
import SignupTutorDetails from "./pages/Tutor/TutorDetailsForm";
import PostList from "./pages/posts/PostList";
import PostForm from "./pages/posts/PostForm";
import RechargeOptions from "./pages/wallet/RechargeOptions";
import PaymentProcess from "./pages/wallet/PaymentProcess";
import ReportList from "./pages/admin/ReportList";
import ReportDetail from "./pages/admin/ReportDetail";
import ReportPost from "./pages/posts/ReportPost";
import AllPosts from "./pages/posts/AllPosts";
import PostDetail from "./pages/posts/PostDetail";
import { ProtectedRoute } from './components/ProtectedRoute';
import Profile from "./pages/Student/Profile";
import LoginAdmin from "./pages/loginAdmin";
import AdminDashboard from "./pages/admin/Dashboard";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          {/* <Route path="/login" element={<Login />} /> */}
          <Route path="/login-role" element={<LoginRole />} />
          <Route path="/login-student" element={<LoginStudent />} />
          <Route path="/login-tutor" element={<LoginTutor />} />
          <Route path="/signup-role" element={<SignupRole />} />
          <Route path="/signup-student" element={<SignupStudentEmail />} />
          <Route path="/signup-student/details" element={<SignupStudentDetails />} />
          <Route path="/signup-tutor" element={<SignupTutorEmail />} />
          <Route path="/signup-tutor/details" element={<SignupTutorDetails />} />
          <Route path="/posts" element={<PostList />} />
          <Route path="/posts/create" element={<PostForm />} />
          <Route path="/posts/edit/:id" element={<PostForm />} />
          <Route path="/wallet/recharge" element={<RechargeOptions />} />
          <Route path="/wallet/recharge/payment" element={<PaymentProcess />} />
          {/* Protected Routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="reports" element={<ReportList />} />
                <Route path="reports/:id" element={<ReportDetail />} />
                {/* Add more admin routes here */}
              </Routes>
            </ProtectedRoute>
          } />

          <Route path="/tutor/*" element={
            <ProtectedRoute requiredRole="TUTOR">
              {/* Tutor specific routes */}
            </ProtectedRoute>
          } />

          <Route path="/student/*" element={
            <ProtectedRoute>
              <Routes>
                {/* Student specific routes */}
                <Route path="profile" element={<Profile />} />
              </Routes>
            </ProtectedRoute>
          } />

          <Route path="/all-posts" element={<AllPosts />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="/login-admin" element={<LoginAdmin />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
