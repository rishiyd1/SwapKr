import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { X, User, LogOut, LayoutDashboard } from "lucide-react";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  // ✅ USER STATE
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const menuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { name: "How it Works", href: "/" },
    { name: "Categories", href: "/" },
    { name: "About Us", href: "/" },
  ];

  // 🔐 MOCK LOGIN HANDLER
  const handleAuthSubmit = (e) => {
    e.preventDefault();

    // fake user data (replace later with real auth)
    setUser({
      name: "Rishi",
      email: "rishi@college.edu",
    });

    setShowAuth(false);
  };

  const handleLogout = () => {
    setUser(null);
    setShowUserMenu(false);
  };

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <nav
        className={`fixed top-0 w-full z-[100] transition-all duration-500 ${
          scrolled
            ? "py-3 bg-white/90 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-b border-gray-100"
            : "py-6 bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-24 flex items-center justify-between">

          {/* LOGO */}
          <div className="flex-1">
            <Link
              to="/"
              className="group flex items-center gap-1 w-fit transition-all duration-500 ease-out hover:translate-x-6"
            >
              <h1 className="text-2xl md:text-3xl font-black tracking-tighter flex items-center">
                <span className="text-gray-900 group-hover:text-[#f57404] transition-colors">
                  CAMPUS
                </span>
                <span className="text-[#f57404] italic ml-1">X</span>
                <span className="text-[#f57404] font-medium overflow-hidden max-w-0 opacity-0 group-hover:max-w-[120px] group-hover:opacity-100 ml-1 transition-all">
                  change
                </span>
              </h1>
            </Link>
          </div>

          {/* NAV LINKS */}
          <div className="hidden md:flex items-center gap-12">
            <ul className="flex gap-10">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="font-bold text-gray-600 hover:text-[#f57404] transition"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* AUTH AREA */}
            {!user ? (
              <button
                onClick={() => setShowAuth(true)}
                className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-bold uppercase tracking-widest hover:bg-[#f57404] transition"
              >
                Get Started
              </button>
            ) : (
              <div className="relative" ref={menuRef}>
                {/* USER AVATAR */}
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-10 h-10 rounded-full bg-[#f57404] text-white font-black flex items-center justify-center"
                >
                  {user.name[0]}
                </button>

                {/* POPOVER */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-4 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2">
                    <div className="px-4 py-3 border-b">
                      <p className="font-bold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>

                    <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-xl">
                      <LayoutDashboard size={18} /> Dashboard
                    </button>

                    <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-xl">
                      <User size={18} /> Profile
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl"
                    >
                      <LogOut size={18} /> Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ================= AUTH MODAL ================= */}
      {showAuth && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-md"
            onClick={() => setShowAuth(false)}
          />

          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-10 z-10">
            <button
              onClick={() => setShowAuth(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
            >
              <X />
            </button>

            <h2 className="text-3xl font-black text-center mb-2">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>

            <form onSubmit={handleAuthSubmit} className="space-y-4 mt-8">
              {!isLogin && (
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full p-3 rounded-xl border"
                />
              )}
              <input
                type="email"
                placeholder="College Email"
                className="w-full p-3 rounded-xl border"
                required
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full p-3 rounded-xl border"
                required
              />

              <button className="w-full bg-[#f57404] text-white py-3 rounded-xl font-bold">
                {isLogin ? "Log in" : "Sign up"}
              </button>
            </form>

            <p className="text-sm text-center text-gray-500 mt-6">
              {isLogin ? (
                <>
                  Don’t have an account?{" "}
                  <button
                    onClick={() => setIsLogin(false)}
                    className="text-[#f57404] font-bold"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => setIsLogin(true)}
                    className="text-[#f57404] font-bold"
                  >
                    Login
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
