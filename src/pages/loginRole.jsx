import React from 'react';
import { useNavigate } from 'react-router-dom';
import studentIcon from '../assets/student.png';
import tutorIcon from '../assets/tutor.png';
import adminIcon from '../assets/admin.png';

const LoginCard = ({ role, icon, description, buttonText, onClick }) => (
  <div className="flex flex-col items-center p-8 bg-white rounded-xl shadow-md w-[350px]">
    <img 
      src={icon} 
      alt={`${role} icon`} 
      className="w-40 h-40 object-contain mb-6" 
    />
    <h2 className="text-2xl font-bold mb-3">{`I am a ${role}`}</h2>
    <p className="text-gray-600 text-center mb-6 text-lg">{description}</p>
    <button 
      onClick={onClick}
      className="w-full py-3 rounded-lg bg-[#ebded5] hover:bg-[#03ccba] text-gray-800 hover:text-white transition-all duration-300 text-lg font-medium"
    >
      {buttonText}
    </button>
  </div>
);

const LoginRole = () => {
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
        <h1 className="text-5xl font-bold text-gray-800 mb-12">Log in</h1>

        {/* Cards */}
        <div className="flex flex-wrap justify-center gap-10 mb-12">
          <LoginCard 
            role="Student" 
            icon={studentIcon}
            description="Have lessons, message your tutor or watch your lessons back" 
            buttonText="Student log in"
            onClick={() => navigate('/login', { state: { role: 'STUDENT' } })}
          />
          <LoginCard 
            role="Tutor" 
            icon={tutorIcon}
            description="Give lessons or manage bookings with your customers" 
            buttonText="Tutor log in"
            onClick={() => navigate('/login', { state: { role: 'TUTOR' } })}
          />
          <LoginCard 
            role="Admin" 
            icon={adminIcon}
            description="Manage payments or lessons for your organization" 
            buttonText="Admin log in"
            onClick={() => navigate('/login', { state: { role: 'ADMIN' } })}
          />
        </div>
      </div>

      {/* Footer with sign up button */}
      <div className="w-full bg-white py-6 px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Footer info */}
          <div className="flex items-center gap-8">
            <p className="text-gray-600">
              Need help? Call us on{' '}
              <a href="tel:+442037736020" className="text-teal-600 font-medium">
                +44 (0) 203 773 6020
              </a>
              {' '}or{' '}
              <a href="mailto:help@mytutor.co.uk" className="text-teal-600 font-medium">
                email us
              </a>
            </p>
            <p className="text-gray-600">
              Help! I'm an{' '}
              <button className="text-teal-600 font-medium">
                adult learner
              </button>
            </p>
          </div>

          {/* Sign up button */}
          <button 
            onClick={() => navigate('/signup-role')}
            className="bg-[#ebded5] px-8 py-3 rounded-lg hover:bg-[#03ccba] hover:text-white transition-all duration-300 text-lg font-medium"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginRole;