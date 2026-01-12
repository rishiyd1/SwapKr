import React, { useState } from "react";
import { Link } from "react-router-dom";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="pt-32">
    <nav className="w-full px-6 md:px-16 lg:px-24 relative z-50">

      
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* LOGO */}
        <h1 className="ml-4 md:ml-20 text-2xl md:text-3xl font-bold cursor-pointer transition-transform duration-200 hover:scale-105">
          CAMPUS
          <span className="text-orange-500">Xchange</span>
        </h1>

        {/* NAV LINKS + BUTTON */}
        <div className="hidden md:flex items-center gap-12 mr-6">
          
          <ul className="flex gap-10 text-gray-600 font-medium text-[1.1rem]">
            <li className="cursor-pointer hover:text-orange-500 transition-colors duration-200 relative group">
              How it Works
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
            </li>
            <li className="cursor-pointer hover:text-orange-500 transition-colors duration-200 relative group">
              Categories
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
            </li>
            <li className="cursor-pointer hover:text-orange-500 transition-colors duration-200 relative group">
              About Us
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
            </li>
          </ul>

        <Link
          to="/login"
  className="
    group
    flex items-center gap-2
    bg-gradient-to-r from-orange-500 to-red-500
    text-white
    px-8 py-3
    rounded-full
    font-semibold text-lg
    shadow-md
    transition-all duration-300
    hover:shadow-orange-500/40 hover:shadow-lg
    hover:-translate-y-0.5
    active:scale-95 active:translate-y-0
  "
>
  <span>Login/Sign Up</span>

  {/* Icon container */}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2.5}
    stroke="currentColor"
    className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
</Link>


        </div>

        {/* MOBILE HAMBURGER */}
        <div className="md:hidden flex items-center">
          <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 focus:outline-none">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <div className={`md:hidden absolute top-full left-0 w-full bg-white shadow-lg px-6 flex flex-col items-center gap-6 overflow-hidden transition-all duration-300 ease-in-out ${
        isOpen ? "max-h-[500px] opacity-100 py-6" : "max-h-0 opacity-0 py-0"
      }`}>
          <ul className="flex flex-col gap-6 text-gray-600 font-medium text-[1.1rem] text-center">
            <li className="cursor-pointer hover:text-orange-500 transition-colors duration-200">
              How it Works
            </li>
            <li className="cursor-pointer hover:text-orange-500 transition-colors duration-200">
              Categories
            </li>
            <li className="cursor-pointer hover:text-orange-500 transition-colors duration-200">
              About Us
            </li>
          </ul>
          <Link
            to="/login"
            className="
              group
              flex items-center gap-2
              bg-gradient-to-r from-orange-500 to-red-500
              text-white
              px-8 py-3
              rounded-full
              font-semibold text-lg
              shadow-md
              transition-all duration-300
              hover:shadow-orange-500/40 hover:shadow-lg
              hover:-translate-y-0.5
              active:scale-95 active:translate-y-0
            "
          >
            <span>Login/Sign Up</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
      </div>
    </nav>
    </div>
  );
}

export default Navbar;
