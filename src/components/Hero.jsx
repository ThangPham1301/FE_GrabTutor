import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { FaArrowRight, FaLightbulb } from 'react-icons/fa';

export default function Hero() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <section className="bg-gradient-to-r from-[#03ccba] via-[#02b5a5] to-[#008b7a] text-white py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Get Expert Help, Instantly
            </h1>
            <p className="text-xl text-teal-50 leading-relaxed">
              Post your homework questions and get answers from expert tutors. Chat, discuss, and learn with real educators in real-time.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={() => navigate('/posts')}
                className="px-8 py-4 bg-white text-[#03ccba] rounded-lg font-bold hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-2 text-lg"
              >
                Ask a Question <FaArrowRight />
              </button>
              
              {/* ✅ Ẩn nút Login khi đã đăng nhập */}
              {!user && (
                <button
                  onClick={() => navigate('/login')}
                  className="px-8 py-4 border-2 border-white text-white rounded-lg font-bold hover:bg-white hover:text-[#03ccba] transition-all duration-300 text-lg"
                >
                  Login
                </button>
              )}
            </div>
          </div>

          {/* Right Image */}
          <div className="flex justify-center">
            <div className="relative w-full h-96">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-3xl opacity-20 blur-3xl"></div>
              <div className="relative bg-gradient-to-br from-blue-400 to-purple-500 rounded-3xl p-8 flex items-center justify-center h-full shadow-2xl">
                <div className="flex flex-col items-center text-center">
                  <FaLightbulb className="text-white text-8xl mx-auto mb-4" />
                  <p className="text-white text-xl font-bold">Learning Journey</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
