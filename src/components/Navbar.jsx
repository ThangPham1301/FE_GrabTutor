import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../contexts/authContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <nav className="w-full flex justify-between items-center px-8 py-4 bg-white shadow-sm">
      {/* Logo */}
      <Link to="/" className="text-2xl font-bold text-gray-800">MyTutor</Link>

      {/* Menu */}
      <ul className="hidden md:flex gap-6 text-gray-700">
        <li><Link to="/posts" className="hover:text-teal-600">Post a question</Link></li>
        <li><a href="/all-posts" className="hover:text-teal-600">Find </a></li>
        <li><a href="#" className="hover:text-teal-600">How it works</a></li>
        {/* <li><a href="#" className="hover:text-teal-600">Prices</a></li> */}
        <li><Link to="/wallet/recharge" className="hover:text-teal-600">Top up</Link></li>
        <li><a href="#" className="hover:text-teal-600">Resources ▾</a></li>
        <li><a href="#" className="hover:text-teal-600">For schools</a></li>
        {/* <li><a href="#" className="hover:text-teal-600">Become a tutor</a></li> */}
        <li><Link to="/posts/:postId/report" className="hover:text-teal-600">Reports</Link></li>
        {user && user.role === 'ADMIN' && (
          <li><Link to="/admin/reports" className="hover:text-teal-600">Admin Dashboard</Link></li>
        )}
        {user && user.role === 'TUTOR' && (
          <li><Link to="/tutor/dashboard" className="hover:text-teal-600">Tutor Dashboard</Link></li>
        )}
        {user && user.role === 'STUDENT' && (
          <li><Link to="/student/dashboard" className="hover:text-teal-600">My Classes</Link></li>
        )}
      </ul>

      {/* Contact + buttons */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600 hidden md:block">
          +84 775462868
        </span>
        {user ? (
          <div className="flex items-center gap-2">
            <span className="text-gray-800">{user.fullName}</span>
            <button 
              onClick={logout}
              className="px-4 py-2 border rounded-lg hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        ) : (
          <>
            <button 
              onClick={() => navigate('/login-role')}
              className="px-4 py-2 border rounded-lg hover:bg-gray-100"
            >
              Log in
            </button>
            <button 
              onClick={() => navigate('/signup-role')}
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
            >
              Sign up
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
