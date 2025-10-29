import React from "react";

export default function Stats() {
  const stats = [
    { label: "50K+", title: "Questions Answered", desc: "Every day, thousands of students get help" },
    { label: "10K+", title: "Expert Tutors", desc: "Verified and highly-rated educators" },
    { label: "100K+", title: "Active Students", desc: "Learning and improving their grades" },
    { label: "4.9★", title: "Average Rating", desc: "From thousands of satisfied users" },
  ];

  return (
    <section className="bg-gray-50 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-xl shadow-md p-8 text-center hover:shadow-lg transition-shadow">
              <div className="text-4xl font-bold text-[#03ccba] mb-2">{stat.label}</div>
              <p className="text-gray-600 font-semibold">{stat.title}</p>
              <p className="text-sm text-gray-500 mt-2">{stat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
