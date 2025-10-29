import React from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Company Info */}
          <div>
            <h3 className="text-white text-2xl font-bold mb-4">MyTutor</h3>
            <p className="text-sm text-gray-400 mb-4">
              Connect with expert tutors, get answers to homework questions, and improve your grades through real-time chat and discussion.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-[#03ccba] transition"><FaFacebook size={20} /></a>
              <a href="#" className="hover:text-[#03ccba] transition"><FaTwitter size={20} /></a>
              <a href="#" className="hover:text-[#03ccba] transition"><FaInstagram size={20} /></a>
              <a href="#" className="hover:text-[#03ccba] transition"><FaLinkedin size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-[#03ccba] transition">Ask a Question</a></li>
              <li><a href="#" className="hover:text-[#03ccba] transition">Become a Tutor</a></li>
              <li><a href="#" className="hover:text-[#03ccba] transition">About Us</a></li>
              <li><a href="#" className="hover:text-[#03ccba] transition">Blog</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-[#03ccba] transition">FAQ</a></li>
              <li><a href="#" className="hover:text-[#03ccba] transition">Contact Us</a></li>
              <li><a href="#" className="hover:text-[#03ccba] transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[#03ccba] transition">Terms of Service</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>📧 <a href="mailto:support@mytutor.com" className="hover:text-[#03ccba] transition">support@mytutor.com</a></li>
              <li>📱 <a href="tel:+1234567890" className="hover:text-[#03ccba] transition">+1 (234) 567-890</a></li>
              <li>📍 123 Education Street, Learning City</li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          <p className="text-center text-sm text-gray-400">
            © 2024 MyTutor. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
