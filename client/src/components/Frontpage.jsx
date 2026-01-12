import React from "react";
import { assets } from "../assets/assets";

function Frontpage() {
  return (
    <section className="relative w-full pt-24 pb-32 md:pt-32 md:pb-40 flex justify-center overflow-hidden">
      
      {/* 1. DECORATIVE BACKGROUND BLOB (Adds depth) */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[500px] h-[500px] bg-[#f57404]/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-7xl px-6 md:px-16 lg:px-24 z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-20">

          {/* LEFT CONTENT */}
          <div className="w-full md:w-1/2 text-left animate-in fade-in slide-in-from-left duration-1000">
            
            {/* Small Badge */}
            <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-[#f57404]/10 border border-[#f57404]/20">
              <span className="text-[#f57404] text-sm font-bold tracking-wide uppercase">
                🚀 Exclusive to University Students
              </span>
            </div>

            {/* Brand Title */}
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
              <span className="text-gray-900">Campus</span>
              <span className="text-[#f57404] drop-shadow-sm"> Xchange</span>
            </h1>

            {/* Tagline */}
            <h2 className="text-2xl text-gray-800 font-semibold mb-6 flex items-center gap-2">
              Exchange Smarter, Together.
              <span className="h-1 w-12 bg-[#f57404] rounded-full hidden md:block"></span>
            </h2>

            {/* Description */}
            <p className="text-gray-600 text-lg md:text-xl leading-relaxed max-w-xl mb-10">
              A trusted campus-only platform for buying, selling, and exchanging items. 
              Save money, reduce waste, and connect with your community effortlessly.
            </p>

            {/* CTA Buttons with Hover Animations */}
            <div className="flex flex-wrap items-center gap-5">
              <button className="group relative px-8 py-4 rounded-2xl bg-[#f57404] text-white font-bold shadow-[0_10px_20px_-10px_rgba(245,116,4,0.5)] hover:shadow-[0_20px_30px_-10px_rgba(245,116,4,0.6)] hover:-translate-y-1 active:scale-95 transition-all duration-300">
                Start Exploring
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </button>

              <button className="px-8 py-4 rounded-2xl border-2 border-gray-200 text-gray-700 font-bold hover:border-[#f57404] hover:text-[#f57404] hover:bg-[#f57404]/5 active:scale-95 transition-all duration-300">
                Browse Listings
              </button>
            </div>

            {/* Trust Indicator */}
            <div className="mt-12 pt-8 border-t border-gray-200/60 flex items-center gap-4 text-gray-500 text-sm">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200" />
                ))}
              </div>
              <p>Joined by <span className="font-bold text-gray-800">500+ students</span> this week</p>
            </div>
          </div>

          {/* RIGHT IMAGE (With Floating Animation) */}
          <div className="w-full md:w-1/2 flex justify-center md:justify-end animate-in fade-in slide-in-from-right duration-1000">
            <div className="relative group">
              {/* Subtle Glow behind image */}
              <div className="absolute inset-0 bg-[#f57404]/10 blur-3xl rounded-full scale-75 group-hover:scale-100 transition-transform duration-700" />
              
              <img
                src={assets.front}
                alt="Campus Xchange Illustration"
                className="relative w-full max-w-[480px] lg:max-w-[550px] h-auto object-contain animate-float"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Custom Styles for the Float effect */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
      `}} />
    </section>
  );
}

export default Frontpage;