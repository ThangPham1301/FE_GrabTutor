import React from 'react';
import { useNavigate } from 'react-router-dom';
import studentIcon from '../assets/student.png';
import tutorIcon from '../assets/tutor.png';

const SignupCard = ({ role, icon, description, onClick }) => (
  <div className="flex flex-col items-center p-8 bg-white rounded-xl shadow-md w-[350px]">
    <img 
      src={icon} 
      alt={`${role} icon`} 
      className="w-40 h-40 object-contain mb-6" 
    />
    <h2 className="text-2xl font-bold mb-3">{`Register as ${role}`}</h2>
    <p className="text-gray-600 text-center mb-6 text-lg">{description}</p>
    <button 
      onClick={onClick}
      className="w-full py-3 rounded-lg bg-[#ebded5] hover:bg-[#03ccba] text-gray-800 hover:text-white transition-all duration-300 text-lg font-medium"
    >
      Sign up
    </button>
  </div>
);

const SignupRole = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-[#f7f2ed] flex flex-col items-center relative">
      {/* Close button */}
      <button 
        onClick={() => navigate('/')} 
        className="absolute top-8 right-8 text-4xl text-gray-600 hover:text-gray-800 w-12 h-12 flex items-center justify-center"
      >
        ×
      </button>

      {/* Content wrapper */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-7xl px-4 py-8">
        {/* Header */}
        <h1 className="text-5xl font-bold text-gray-800 mb-12">Sign up</h1>

        {/* Cards */}
        <div className="flex flex-wrap justify-center gap-10 mb-12">
          <SignupCard 
            role="Student" 
            icon={studentIcon}
            description="Join us to find your perfect tutor and start learning" 
            onClick={() => navigate('/signup-student')}
          />
          <SignupCard 
            role="Tutor" 
            icon={tutorIcon}
            description="Share your knowledge and earn by teaching others" 
            onClick={() => navigate('/signup-tutor')}
          />
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
};

export default SignupRole;