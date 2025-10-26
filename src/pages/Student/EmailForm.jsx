
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import studentIcon from '../../assets/student.png';

export default function EmailForm() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('signupEmail', email);
    navigate('/signup-student/details');
  };

  return (
    <div className="min-h-screen bg-[#f7f2ed] flex flex-col">
      {/* Header */}
      <div className="w-full bg-white py-6 px-8 flex justify-between items-center shadow-sm">
        <button
          onClick={() => navigate('/signup-role')}
          className="text-3xl text-gray-600 hover:text-gray-800 w-10 h-10 flex items-center justify-center"
        >
          &larr;
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Student Sign Up</h1>
        <button
          onClick={() => navigate('/')}
          className="text-3xl text-gray-600 hover:text-gray-800 w-10 h-10 flex items-center justify-center"
        >
          ×
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex justify-center items-center px-4">
        <div className="bg-white rounded-xl shadow-md p-8 max-w-4xl w-full flex flex-col md:flex-row gap-12">
          {/* Left side */}
          <div className="md:w-1/2 flex flex-col items-center justify-center">
            <img 
              src={studentIcon}
              alt="Student" 
              className="w-48 h-48 object-contain mb-6"
            />
            <h2 className="text-2xl font-bold mb-3">Join as a Student</h2>
            <p className="text-gray-600 text-center text-lg">
              Start your learning journey with expert tutors
            </p>
          </div>

          {/* Right side */}
          <div className="md:w-1/2 flex flex-col justify-center">
            <h3 className="text-2xl font-bold mb-8">Enter your email to get started</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03ccba] focus:border-transparent outline-none text-lg"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#03ccba] text-white py-4 rounded-lg hover:bg-[#02b5a5] text-lg font-medium"
              >
                Continue
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full bg-white py-6 px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-8">
            <p className="text-gray-600">
              Need help? Call us on{' '}
              <a href="tel:+442037736020" className="text-[#03ccba] font-medium">
                +44 (0) 203 773 6020
              </a>
              {' '}or{' '}
              <a href="mailto:help@mytutor.co.uk" className="text-[#03ccba] font-medium">
                email us
              </a>
            </p>
            <p className="text-gray-600">
              Help! I'm an{' '}
              <button className="text-[#03ccba] font-medium">
                adult learner
              </button>
            </p>
          </div>

          <button 
            onClick={() => navigate('/login-role')}
            className="bg-[#ebded5] px-8 py-3 rounded-lg hover:bg-[#03ccba] hover:text-white transition-all duration-300 font-medium"
          >
            Log in
          </button>
        </div>
      </div>
    </div>
  );
}
