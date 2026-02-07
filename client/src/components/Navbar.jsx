import React, { useState, useEffect, useRef } from "react";
import { X, User, LogOut, LayoutDashboard } from "lucide-react";

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const menuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ SECTION LINKS
  const navLinks = [
    { name: "How it Works", href: "#how-it-works" },
    { name: "Categories", href: "#categories" },
    { name: "About Us", href: "#about-us" },
  ];

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setUser({ name: "Rishi", email: "rishi@college.edu" });
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
        className={`fixed top-0 w-full z-[100] transition-all duration-500 ${scrolled
            ? "py-3 bg-white/90 backdrop-blur-xl shadow border-b border-gray-100"
            : "py-6 bg-transparent"
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-24 flex items-center justify-between">

          {/* LOGO */}
          <div className="flex-1">
            <a href="#" className="group flex items-center gap-1 w-fit transition-all duration-500 hover:translate-x-6">
              <h1 className="text-2xl md:text-3xl font-black tracking-tighter flex items-center">
                <span className="text-gray-900 group-hover:text-[#f57404] transition">
                  CAMPUS
                </span>
                <span className="text-[#f57404] italic ml-1">X</span>
                <span className="text-[#f57404] font-medium overflow-hidden max-w-0 opacity-0 group-hover:max-w-[120px] group-hover:opacity-100 ml-1 transition-all">
                  change
                </span>
              </h1>
            </a>
          </div>

          {/* NAV LINKS (ORIGINAL UI) */}
          <div className="hidden md:flex items-center gap-12">
            <ul className="flex gap-10">
              {navLinks.map((link) => (
                <li key={link.name} className="group relative py-2">
                  <a
                    href={link.href}
                    className="relative text-[1.05rem] font-bold text-gray-600 transition-all duration-300
                               group-hover:text-[#f57404] group-hover:-translate-y-1 flex flex-col items-center"
                  >
                    <span>{link.name}</span>

                    {/* Dot */}
                    <span className="absolute -top-1 w-1 h-1 bg-[#f57404] rounded-full opacity-0 scale-0 
                                     transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 group-hover:-top-2" />

                    {/* Underline */}
                    <span className="absolute -bottom-1 w-0 h-[2px] bg-[#f57404] rounded-full 
                                     transition-all duration-300 ease-out group-hover:w-full" />
                  </a>
                </li>
              ))}
            </ul>

            {/* AUTH */}
            {!user ? (
              <button
                onClick={() => setShowAuth(true)}
                className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-bold uppercase tracking-widest
                           hover:bg-[#f57404] hover:-translate-y-1 transition"
              >
                Get Started
              </button>
            ) : (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-10 h-10 rounded-full bg-[#f57404] text-white font-black flex items-center justify-center"
                >
                  {user.name[0]}
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-4 w-56 bg-white rounded-2xl shadow-xl border p-2">
                    <div className="px-4 py-3 border-b">
                      <p className="font-bold">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>

                    <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl">
                      <LayoutDashboard size={18} /> Dashboard
                    </button>

                    <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl">
                      <User size={18} /> Profile
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl"
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
          <div className="bg-white rounded-3xl p-10 w-full max-w-md z-10">
            <button
              onClick={() => setShowAuth(false)}
              className="absolute top-4 right-4 text-gray-400"
            >
              <X />
            </button>

            <h2 className="text-3xl font-black text-center mb-6">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {!isLogin && (
                <input className="w-full p-3 border rounded-xl" placeholder="Full Name" />
              )}
              <input className="w-full p-3 border rounded-xl" placeholder="College Email" />
              <input className="w-full p-3 border rounded-xl" placeholder="Password" type="password" />
              <button className="w-full bg-[#f57404] text-white py-3 rounded-xl font-bold">
                {isLogin ? "Log in" : "Sign up"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
