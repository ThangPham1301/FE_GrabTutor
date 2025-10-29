import React from "react";
import { FaComments, FaCheckCircle, FaBook, FaClock, FaStar, FaShieldAlt } from 'react-icons/fa';

export default function Features() {
  const features = [
    { 
      title: "Chat with Experts", 
      desc: "Real-time chat with tutors to discuss solutions and clarify doubts",
      icon: FaComments
    },
    { 
      title: "Verified Answers", 
      desc: "All answers are reviewed and verified by expert educators",
      icon: FaCheckCircle
    },
    { 
      title: "Multiple Subjects", 
      desc: "Math, Physics, Chemistry, Biology, English, and many more",
      icon: FaBook
    },
    { 
      title: "Quick Responses", 
      desc: "Get answers within minutes from available tutors",
      icon: FaClock
    },
    { 
      title: "Transparent Reviews", 
      desc: "See real ratings and reviews from other students",
      icon: FaStar
    },
    { 
      title: "Safe & Secure", 
      desc: "Your data is protected with top-level security",
      icon: FaShieldAlt
    },
  ];

  return (
    <section className="bg-gray-50 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-16">
          Why Choose MyTutor?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div 
                key={i} 
                className="bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="bg-gradient-to-br from-[#03ccba] to-[#02b5a5] rounded-lg w-16 h-16 flex items-center justify-center mb-6">
                  <Icon className="text-3xl text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
