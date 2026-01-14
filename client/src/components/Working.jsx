import React from "react";
import { assets } from "../assets/assets";

const Working = () => {
  const steps = [
    {
      id: 1,
      title: "Sign Up & Verify",
      description:
        "Create your account using your university email. We verify you're a real student at your campus.",
      image:
        "https://s3.envato.com/files/483587867/screenshort/02_preview02.jpg",
      cardBg: "bg-[#E6E1FF]",
    },
    {
      id: 2,
      title: "Browse or List",
      description:
        "Find what you need or list items you want to sell or lend. Everything stays within your campus.",
      image: assets.items,
      cardBg: "bg-white",
    },
    {
      id: 3,
      title: "Meet & Exchange",
      description:
        "Connect with other students and arrange safe meetups on campus to complete your transaction.",
      image:
        "https://thumbs.dreamstime.com/z/people-exchange-books-reading-students-readers-club-bookcrossing-sharing-vector-illustration-cartoon-isolated-young-paper-252405920.jpg?w=992",
      cardBg: "bg-[#D8EEFF]",
    },
  ];

  return (
    <section className="w-full bg-[#f1efeecd] pt-8 pb-24 font-['Outfit']">
      {/* z-index fix stays */}
      <div className="relative z-10 max-w-6xl mx-auto px-12">
        
        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
  <span className="text-[#0D1B2A]">How </span>
  <span className="text-[#0D1B2A]">CAMPUS </span>
  <span className="text-[#f57404]">Xchange </span>
  <span className="text-[#0D1B2A]">Works</span>
</h2>
          <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto">
            Getting started with Campus Xchange is simple and secure
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 justify-items-center">
          {steps.map((step) => (
  <div
    key={step.id}
    className="flex flex-col items-center group transition-all duration-300"
  >
    {/* Image Card */}
    <div
      className={`${step.cardBg} w-[260px] h-[260px] rounded-[2.5rem] 
      flex items-center justify-center mb-8
      transition-all duration-500 ease-out
      group-hover:-translate-y-3 
      group-hover:shadow-[0_25px_50px_rgba(0,0,0,0.15)]`}
    >
      <img
        src={step.image}
        alt={step.title}
        className="w-[85%] h-[85%] object-contain mix-blend-multiply
        transition-transform duration-500
        group-hover:scale-105"
      />
    </div>

    {/* Step Number */}
    <div
      className="bg-[#6366F1] text-white w-11 h-11 rounded-full 
      flex items-center justify-center text-lg font-bold mb-4
      transition-all duration-300
      group-hover:scale-110 group-hover:shadow-lg"
    >
      {step.id}
    </div>

    {/* Title */}
    <h3
      className="text-xl font-bold text-[#1A1A1A] mb-2 text-center
      transition-colors duration-300
      group-hover:text-[#6366F1]"
    >
      {step.title}
    </h3>

    {/* Description */}
    <p
      className="text-[#666] text-center text-sm leading-relaxed max-w-xs
      transition-colors duration-300
      group-hover:text-[#333]"
    >
      {step.description}
    </p>
  </div>
))}

        </div>

      </div>
    </section>
  );
};

export default Working;
