import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "How it Works", href: "/" },
    { name: "Categories", href: "/" },
    { name: "About Us", href: "/" },
  ];

  return (
    <nav 
      className={`fixed top-0 w-full z-[100] transition-all duration-500 ${
        scrolled 
          ? "py-3 bg-white/90 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-b border-gray-100" 
          : "py-6 bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-24 flex items-center justify-between">
        
        {/* LOGO - Shifts Right & Reveals on Hover */}
        <div className="flex-1">
          <Link to="/" className="group flex items-center gap-1 w-fit transition-all duration-500 ease-out hover:translate-x-6">
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter flex items-center">
              <span className="text-gray-900 group-hover:text-[#f57404] transition-colors duration-300">CAMPUS</span>
              <span className="text-[#f57404] italic ml-1">X</span>
              <span className="text-[#f57404] font-medium tracking-tight overflow-hidden transition-all duration-500 max-w-0 opacity-0 group-hover:max-w-[120px] group-hover:opacity-100 group-hover:ml-1">
                change
              </span>
            </h1>
          </Link>
        </div>

        {/* NAV LINKS - High-End Interactive Styles */}
        <div className="hidden md:flex items-center gap-12">
          <ul className="flex gap-10">
            {navLinks.map((link) => (
              <li key={link.name} className="group relative py-2">
                <Link
                  to={link.href}
                  className="relative text-[1.05rem] font-bold text-gray-600 transition-all duration-300 
                             group-hover:text-[#f57404] group-hover:-translate-y-1 flex flex-col items-center"
                >
                  {/* The Text */}
                  <span>{link.name}</span>

                  {/* 1. The Dot Indicator (appears above) */}
                  <span className="absolute -top-1 w-1 h-1 bg-[#f57404] rounded-full opacity-0 scale-0 
                                   transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 group-hover:-top-2" />
                  
                  {/* 2. The Liquid Underline (expands from center) */}
                  <span className="absolute -bottom-1 w-0 h-[2px] bg-[#f57404] rounded-full 
                                   transition-all duration-300 ease-out group-hover:w-full" />
                </Link>
              </li>
            ))}
          </ul>

          {/* CTA BUTTON - Glow effect */}
          <Link
            to="/login"
            className="
              relative overflow-hidden group
              bg-gray-900 text-white
              px-8 py-3 rounded-2xl
              font-bold text-sm uppercase tracking-widest
              transition-all duration-300
              hover:bg-[#f57404] hover:shadow-[0_20px_40px_-12px_rgba(245,116,4,0.5)]
              hover:-translate-y-1 active:scale-95
            "
          >
            <span className="relative z-10">Get Started</span>
            <div className="absolute inset-0 bg-white/10 translate-y-full transition-transform duration-300 group-hover:translate-y-0" />
          </Link>
        </div>

        {/* MOBILE MENU BUTTON */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="p-2 text-gray-900 focus:outline-none"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span className={`h-0.5 bg-current transition-all duration-300 ${isOpen ? "rotate-45 translate-y-2 w-6" : "w-6"}`} />
              <span className={`h-0.5 bg-current transition-all duration-300 ${isOpen ? "opacity-0" : "w-4 self-end"}`} />
              <span className={`h-0.5 bg-current transition-all duration-300 ${isOpen ? "-rotate-45 -translate-y-2 w-6" : "w-5 self-end"}`} />
            </div>
          </button>
        </div>
      </div>

      {/* MOBILE OVERLAY */}
      <div className={`
        md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl
        transition-all duration-500 ease-in-out border-b border-gray-100
        ${isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}
      `}>
        <div className="p-10 flex flex-col gap-8 text-center">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.href} 
              className="text-2xl font-black text-gray-800 hover:text-[#f57404] transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <Link 
            to="/login" 
            className="bg-[#f57404] text-white py-5 rounded-3xl font-bold shadow-xl"
            onClick={() => setIsOpen(false)}
          >
            Login / Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;