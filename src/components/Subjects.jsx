import React from "react";
import { useNavigate } from "react-router-dom";

export default function Subjects() {
  const navigate = useNavigate();
  
  const subjects = [
    "Mathematics", "Physics", "Chemistry", "Biology",
    "English", "Literature", "History", "Geography"
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-16">
          Popular Subjects
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {subjects.map((subject, i) => (
            <button
              key={i}
              onClick={() => navigate('/posts')}
              className="bg-gradient-to-br from-[#03ccba] to-[#02b5a5] text-white rounded-xl py-6 font-bold text-lg hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              {subject}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
