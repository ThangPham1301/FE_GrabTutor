import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Stats from "../components/Stats";
import Subjects from "../components/Subjects";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div>
      <Navbar />
      <Hero />
      <Stats />
      <Subjects />
      <Footer />

    </div>
  );
}
