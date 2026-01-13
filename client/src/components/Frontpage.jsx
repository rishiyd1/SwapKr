import React from "react";
import { assets } from "../assets/assets";

function Frontpage() {
  return (
    <section className="relative w-full bg-[#f1efeecd] pt-32 pb-20 md:pt-40 md:pb-28 flex justify-center overflow-hidden">


      
      {/* BACKGROUND DECORATION */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-[#f57404]/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] -z-10" />

      <div className="w-full max-w-7xl px-6 md:px-16 lg:px-24 z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-16 lg:gap-24">

          {/* LEFT CONTENT */}
          <div className="w-full md:w-1/2 text-left animate-in fade-in slide-in-from-left duration-1000">
            <div className="inline-flex items-center gap-2 px-5 py-2 mb-10 rounded-full bg-[#f57404]/5 border border-[#f57404]/10 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-[#f57404] animate-pulse"></span>
              <span className="text-[#f57404] text-xs md:text-sm font-bold tracking-widest uppercase">
                Exclusive to University Students
              </span>
            </div>

            <div className="space-y-6 mb-10">
              <h1 className="text-3xl lg:text-5xl font-black tracking-tighter text-gray-900 leading-[0.95]">
                Campus<br />
                <span className="text-[#f57404]">Xchange</span>
              </h1>
              <h2 className="text-2xl md:text-3xl text-gray-700 font-medium tracking-tight">
                Exchange Smarter. <span className="text-gray-400">Together.</span>
              </h2>
            </div>

            <p className="text-gray-500 text-lg md:text-xl leading-relaxed max-w-lg mb-12">
              The premier marketplace designed exclusively for your campus. 
              Buy, sell, and trade with verified peers in a secure environment.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 mb-16">
              <button className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-[#f57404] text-white font-extrabold text-lg shadow-[0_20px_40px_-15px_rgba(245,116,4,0.4)] hover:shadow-[0_25px_50px_-12px_rgba(245,116,4,0.5)] hover:-translate-y-1.5 active:scale-95 transition-all duration-300">
                Start Exploring
              </button>
              <button className="w-full sm:w-auto px-10 py-5 rounded-2xl border-2 border-gray-100 text-gray-600 font-bold text-lg hover:border-[#f57404] hover:text-[#f57404] hover:bg-[#f57404]/5 transition-all duration-300">
                How it Works
              </button>
            </div>

            <div className="flex items-center gap-6 pt-8 border-t border-gray-100">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-gray-100 shadow-sm" />
                ))}
              </div>
              <div className="flex flex-col">
                <span className="text-gray-900 font-bold text-lg leading-none">500+ Students</span>
                <span className="text-gray-400 text-sm mt-1">Active this week on your campus</span>
              </div>
            </div>
          </div>

          {/* RIGHT IMAGE (STOPS ON HOVER) */}
          <div className="w-full md:w-1/2 flex justify-center md:justify-end animate-in fade-in slide-in-from-right duration-1000">
            <div className="relative group cursor-pointer">
              {/* Glow that intensifies on hover */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#f57404]/20 to-indigo-500/10 blur-[100px] rounded-full scale-90 group-hover:scale-110 transition-transform duration-1000" />
              
              <img
                src={assets.front}
                alt="Campus Xchange Illustration"
                className="relative w-full max-w-[500px] lg:max-w-[600px] h-auto object-contain animate-float transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </div>

        </div>
      </div>

      {/* CSS with Play-State control */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(1deg); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
          /* Ensures the transition from moving to still is smooth */
          transition: transform 0.5s ease-out;
        }

        /* This is the magic part you asked for */
        .animate-float:hover {
          animation-play-state: paused;
        }
      `}} />
    </section>
  );
}

export default Frontpage;