import React from "react";

export default function Subjects() {
  const subjects = [
    "Maths", "English", "Chemistry", "Physics",
    "Biology", "Science", "Spanish", "French"
  ];

  return (
    <section className="bg-[#fdf6f0] py-12 px-6 text-center">
      <h2 className="text-3xl font-bold mb-8">Pick a subject to get started</h2>
      <div className="flex flex-wrap gap-4 justify-center">
        {subjects.map((subj, i) => (
          <button
            key={i}
            className="px-6 py-3 bg-white rounded-lg shadow hover:bg-gray-100 font-medium"
          >
            {subj}
          </button>
        ))}
      </div>
    </section>
  );
}
