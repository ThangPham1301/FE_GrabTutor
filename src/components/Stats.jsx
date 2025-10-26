import React from "react";

export default function Stats() {
  const stats = [
    { label: "426,535+ 5-star reviews" },
    { label: "1500 schools trust us" },
    { label: "30+ subjects available" },
    { label: "255,203+ students" },
  ];

  return (
    <section className="bg-white py-8 px-6 border-t border-b text-center">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-around items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-teal-600 font-semibold underline cursor-pointer">
            Excellent
          </span>
          <img src="/trustpilot.png" alt="Trustpilot" className="h-6" />
        </div>
        {stats.map((s, i) => (
          <p key={i} className="font-medium text-gray-700">{s.label}</p>
        ))}
      </div>
    </section>
  );
}
