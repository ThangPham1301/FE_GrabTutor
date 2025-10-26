import React from "react";

export default function Features() {
  const features = [
    { title: "Expert Tutors", desc: "Learn from the best students and graduates." },
    { title: "Flexible Lessons", desc: "Book lessons that fit your schedule." },
    { title: "Affordable Prices", desc: "High quality tutoring at a fair cost." },
  ];

  return (
    <section className="py-16 px-8 bg-white">
      <h2 className="text-3xl font-bold text-center mb-10">Why Choose Us?</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <div key={i} className="p-6 shadow-md rounded-xl bg-green-50 text-center">
            <h3 className="text-xl font-semibold">{f.title}</h3>
            <p className="text-gray-600 mt-3">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
