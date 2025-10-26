import React from "react";

export default function Hero() {
  return (
    <section className="bg-[#fdf6f0] px-8 py-16 flex flex-col md:flex-row items-center justify-between">
      {/* Left content */}
      <div className="md:w-1/2 space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
          Online tutoring that releases potential
        </h1>
        <p className="text-gray-600 text-lg">
          We can’t stop you worrying about your child. But our expert tutors can help their grades and confidence soar – and help you worry a little less.
        </p>

        {/* Search bar */}
        <div className="flex items-center border rounded-lg overflow-hidden max-w-md bg-white shadow-sm">
          <input
            type="text"
            placeholder="Search a subject"
            className="flex-1 px-4 py-3 outline-none"
          />
          <button className="bg-teal-500 text-white px-6 py-3 hover:bg-teal-600">
            Get Started
          </button>
        </div>
      </div>

      {/* Right image */}
      <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center">
        <img
          src="/hero-img.png"
          alt="Tutoring"
          className="w-[350px] rounded-xl shadow-lg border-4 border-teal-400"
        />
      </div>
    </section>
  );
}
