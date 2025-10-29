import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Stats from "../components/Stats";
import Subjects from "../components/Subjects";
import Footer from "../components/Footer";
import { useAuth } from "../contexts/AuthContext";

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <div>
      <Navbar />
      <Hero />
      <Stats />
      <Subjects />

      {/* Hiển thị thông tin đăng nhập nếu là student */}
      {user && user.role === 'STUDENT' && (
        <div className="max-w-3xl mx-auto my-8 p-6 bg-green-50 rounded-xl shadow text-center">
          <h2 className="text-2xl font-bold text-green-700 mb-2">
            Xin chào, {user.fullName || user.email}!
          </h2>
          <p className="text-gray-700 mb-4">
            Bạn đã đăng nhập thành công với vai trò <span className="font-semibold">{user.role}</span>.
          </p>
          <button
            onClick={logout}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Đăng xuất
          </button>
        </div>
      )}

      <Footer />
    </div>
  );
}
