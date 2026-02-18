import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Mail,
  Lock,
  Smartphone,
  User,
  Eye,
  EyeOff,
  CheckCircle,
  Home,
  Calendar,
  BookOpen,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useSearchParams } from "react-router-dom";
import SwapkrLogo from "@/components/landing/SwapkrLogo";

const Login = () => {
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get("email") || "";
  const initialMode = searchParams.get("mode") || "login";

  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
  const [loginMethod, setLoginMethod] = useState("password"); // 'password' | 'otp'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Signup Steps: 'email' -> 'otp' -> 'details'
  const [signupStep, setSignupStep] = useState("email");

  // Form States
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");

  // New fields
  const [hostel, setHostel] = useState("");
  const [year, setYear] = useState("");
  const [branch, setBranch] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Logic placeholder
  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Logging in with", loginMethod, { email, password, otp });
  };

  const handleSignupEmail = (e) => {
    e.preventDefault();
    // Simulate sending OTP
    console.log("Sending OTP to", email);
    setSignupStep("otp");
  };

  const handleSignupOtp = (e) => {
    e.preventDefault();
    // Simulate verifying OTP
    console.log("Verifying OTP", otp);
    setSignupStep("details");
  };

  const handleSignupFinal = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log("Creating account", {
      name,
      email,
      password,
      hostel,
      year,
      branch,
      phoneNumber,
    });
  };

  const resetSignup = () => {
    setMode("signup");
    setSignupStep("email");
    setOtp("");
    setPassword("");
    setConfirmPassword("");
    setName("");
    setHostel("");
    setYear("");
    setBranch("");
    setPhoneNumber("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background Elements */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--accent)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--accent)) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-[0.1] bg-primary blur-[100px] pointer-events-none" />

      {/* Navbar Placeholder / Logo */}
      <nav className="p-6 relative z-10">
        <Link to="/">
          <SwapkrLogo />
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center p-4 relative z-10 transition-all duration-300 ease-in-out">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden"
        >
          {/* Top Shine */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {/* Tabs: Login vs Signup */}
          <div className="flex gap-4 mb-8 border-b border-white/5 pb-2 relative">
            <button
              onClick={() => setMode("login")}
              className={`pb-2 text-sm font-display font-medium transition-colors relative ${mode === "login" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              Login
              {mode === "login" && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-primary"
                />
              )}
            </button>
            <button
              onClick={resetSignup}
              className={`pb-2 text-sm font-display font-medium transition-colors relative ${mode === "signup" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              Sign Up
              {mode === "signup" && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-primary"
                />
              )}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {mode === "login" ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-2xl font-display font-bold mb-2">
                  Welcome Back
                </h2>
                <p className="text-muted-foreground text-sm mb-6">
                  Enter your details to access your account
                </p>

                {/* Login Method Tabs */}
                <div className="flex bg-secondary/50 p-1 rounded-lg mb-6">
                  <button
                    onClick={() => setLoginMethod("password")}
                    className={`flex-1 text-xs py-2 rounded-md transition-all ${loginMethod === "password" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Password
                  </button>
                  <button
                    onClick={() => setLoginMethod("otp")}
                    className={`flex-1 text-xs py-2 rounded-md transition-all ${loginMethod === "otp" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    OTP
                  </button>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="rollno@nitj.ac.in"
                        className="pl-10 bg-secondary/50 border-white/5 focus:border-primary/50"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  {loginMethod === "password" && (
                    <div className="space-y-2">
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          className="pl-10 pr-10 bg-secondary/50 border-white/5 focus:border-primary/50"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <div className="flex justify-end">
                        <a
                          href="#"
                          className="text-xs text-primary hover:underline"
                        >
                          Forgot Password?
                        </a>
                      </div>
                    </div>
                  )}

                  {loginMethod === "otp" && (
                    <div className="space-y-2">
                      {/* Placeholder for Send OTP interaction */}
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="Enter OTP"
                          className="pl-10 bg-secondary/50 border-white/5 focus:border-primary/50 tracking-widest"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-1.5 bottom-1.5 px-3 bg-primary/10 hover:bg-primary/20 text-primary text-xs rounded transition-colors"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display mt-2"
                    type="submit"
                  >
                    Login <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-2xl font-display font-bold mb-2">
                  Create Account
                </h2>
                <p className="text-muted-foreground text-sm mb-6">
                  Join the campus marketplace
                </p>

                {/* Progress Indicator */}
                <div className="flex items-center gap-2 mb-6">
                  <div
                    className={`h-1 flex-1 rounded-full ${signupStep === "email" || signupStep === "otp" || signupStep === "details" ? "bg-primary" : "bg-white/10"}`}
                  />
                  <div
                    className={`h-1 flex-1 rounded-full ${signupStep === "otp" || signupStep === "details" ? "bg-primary" : "bg-white/10"}`}
                  />
                  <div
                    className={`h-1 flex-1 rounded-full ${signupStep === "details" ? "bg-primary" : "bg-white/10"}`}
                  />
                </div>

                <AnimatePresence mode="wait">
                  {signupStep === "email" && (
                    <motion.form
                      key="step-email"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      onSubmit={handleSignupEmail}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="rollno@nitj.ac.in"
                            className="pl-10 bg-secondary/50 border-white/5 focus:border-primary/50"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoFocus
                          />
                        </div>
                      </div>
                      <Button
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display mt-2"
                        type="submit"
                      >
                        Send Verification Code{" "}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </motion.form>
                  )}

                  {signupStep === "otp" && (
                    <motion.form
                      key="step-otp"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      onSubmit={handleSignupOtp}
                      className="space-y-4"
                    >
                      <div className="text-center mb-4">
                        <p className="text-sm text-muted-foreground">
                          We sent a code to{" "}
                          <span className="text-primary">{email}</span>
                        </p>
                        <button
                          type="button"
                          onClick={() => setSignupStep("email")}
                          className="text-xs text-muted-foreground/50 hover:text-foreground mt-1"
                        >
                          Change email
                        </button>
                      </div>
                      <div className="space-y-2">
                        <div className="relative">
                          <Smartphone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="text"
                            placeholder="Enter OTP"
                            className="pl-10 bg-secondary/50 border-white/5 focus:border-primary/50 tracking-widest text-center text-lg"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            autoFocus
                          />
                        </div>
                      </div>
                      <Button
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display mt-2"
                        type="submit"
                      >
                        Verify Email <CheckCircle className="w-4 h-4 ml-2" />
                      </Button>
                    </motion.form>
                  )}

                  {signupStep === "details" && (
                    <motion.form
                      key="step-details"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      onSubmit={handleSignupFinal}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <div className="relative">
                          <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="text"
                            placeholder="Full Name"
                            className="pl-10 bg-secondary/50 border-white/5 focus:border-primary/50"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="relative">
                            <Home className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input
                              type="text"
                              placeholder="Hostel"
                              className="pl-10 bg-secondary/50 border-white/5 focus:border-primary/50"
                              value={hostel}
                              onChange={(e) => setHostel(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="relative">
                            <Calendar className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input
                              type="text"
                              placeholder="Year"
                              className="pl-10 bg-secondary/50 border-white/5 focus:border-primary/50"
                              value={year}
                              onChange={(e) => setYear(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="relative">
                          <BookOpen className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="text"
                            placeholder="Branch"
                            className="pl-10 bg-secondary/50 border-white/5 focus:border-primary/50"
                            value={branch}
                            onChange={(e) => setBranch(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="tel"
                            placeholder="Phone Number"
                            className="pl-10 bg-secondary/50 border-white/5 focus:border-primary/50"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Create Password"
                            className="pl-10 pr-10 bg-secondary/50 border-white/5 focus:border-primary/50"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Confirm Password Field */}
                      <div className="space-y-2">
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            className="pl-10 pr-10 bg-secondary/50 border-white/5 focus:border-primary/50"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <Button
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display mt-2"
                        type="submit"
                      >
                        Create Account <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="absolute bottom-6 left-0 right-0 text-center">
        <p className="text-xs text-muted-foreground/30 font-mono">
          SECURE • CAMPUS ONLY • ENCRYPTED
        </p>
      </div>
    </div>
  );
};

export default Login;
