import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="sticky top-0 z-50">
      <div className="bg-[#f1efeecd] backdrop-blur-md border-b border-[#f1efeecd] border-opacity-20">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between px-6 lg:px-12 py-4">

          {/* Brand (shifted RIGHT) */}
          <Link
            to="/"
            className="ml-6 text-2xl font-bold tracking-tighter flex items-center gap-0.5 group"
          >
            <span className="text-gray-900 transition-transform duration-300 group-hover:-translate-y-0.5">
              CAMPUS
            </span>
            <span className="text-[#f57404] transition-transform duration-300 group-hover:translate-y-0.5">
              Xchange
            </span>
          </Link>

          {/* Nav Links (shifted RIGHT) */}
          <div className="hidden md:flex items-center gap-8 lg:gap-12 ml-12">
            {["How it Works", "Categories", "About Us"].map((item, i) => (
              <Link
                key={i}
                to="/"
                className="relative group text-gray-600 font-medium transition-colors duration-300 hover:text-gray-900"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 ease-out group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* Login Button (shifted LEFT + bigger) */}
          <div className="mr-6">
            <Link
              to="/login"
              className="
                px-8
                py-3
                rounded-full
                text-base
                font-semibold
                text-gray-700
                border
                border-gray-400/60
                transition-all
                duration-300
                ease-out
                hover:bg-gray-900
                hover:text-[#ebe9e7]
                hover:border-gray-900
                hover:shadow-lg
                hover:scale-105
                active:scale-95
              "
            >
              Login
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;
