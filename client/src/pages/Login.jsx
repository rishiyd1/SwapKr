import { useState } from "react";
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
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import SwapkrLogo from "@/components/landing/SwapkrLogo";
import { authService } from "@/services/auth.service";
import { toast } from "sonner"; // Assuming sonner is used based on package.json

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get("email") || "";
  const initialMode = searchParams.get("mode") || "login";

  const [mode, setMode] = useState(initialMode); // 'login' | 'signup' | 'forgot-password'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Signup Steps: 'details' -> 'otp'
  const [signupStep, setSignupStep] = useState("details");

  // Forgot Password Steps: 'email' -> 'otp'
  const [forgotPasswordStep, setForgotPasswordStep] = useState("email");
  const [newPassword, setNewPassword] = useState("");

  // Form States
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [hostel, setHostel] = useState("");
  const [year, setYear] = useState("");
  const [department, setDepartment] = useState(""); // Changed from branch to department to match backend
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authService.login(email, password);
      toast.success("Login successful!");
      navigate("/home");
    } catch (error) {
      toast.error(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordEmail = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authService.sendResetOtp(email);
      toast.success("OTP sent to your email!");
      setForgotPasswordStep("otp");
    } catch (error) {
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    setIsLoading(true);
    try {
      await authService.resetPassword(email, otp, newPassword);
      toast.success("Password reset successful! Please login.");
      setMode("login");
      setForgotPasswordStep("email");
      setPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setOtp("");
    } catch (error) {
      toast.error(error.message || "Password reset failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupDetails = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setIsLoading(true);
    try {
      // Register triggers OTP sending from backend
      await authService.register({
        name,
        email,
        password,
        phoneNumber,
        department,
        year,
        hostel,
      });
      toast.success("OTP sent to your email!");
      setSignupStep("otp");
    } catch (error) {
      toast.error(error.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authService.verifyOtp(email, otp);
      toast.success("Account created successfully! Please login.");
      // Reset to login mode
      setMode("login");
      setSignupStep("details");
      setPassword("");
    } catch (error) {
      toast.error(error.message || "OTP verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const resetSignup = () => {
    setMode("signup");
    setSignupStep("details");
    setOtp("");
    setPassword("");
    setConfirmPassword("");
    setName("");
    setHostel("");
    setYear("");
    setDepartment("");
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
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        className="pl-10 pr-10 bg-secondary/50 border-white/5 focus:border-primary/50"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
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
                      <button
                        type="button"
                        onClick={() => setMode("forgot-password")}
                        className="text-xs text-primary hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display mt-2"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Login <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                  <div className="mt-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Not a registered user?{" "}
                      <button
                        type="button"
                        onClick={resetSignup}
                        className="text-primary hover:underline font-semibold"
                      >
                        Register now
                      </button>
                    </p>
                  </div>
                </form>
              </motion.div>
            ) : mode === "signup" ? (
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
                    className={`h-1 flex-1 rounded-full ${signupStep === "details" || signupStep === "otp" ? "bg-primary" : "bg-white/10"}`}
                  />
                  <div
                    className={`h-1 flex-1 rounded-full ${signupStep === "otp" ? "bg-primary" : "bg-white/10"}`}
                  />
                </div>

                <AnimatePresence mode="wait">
                  {signupStep === "details" && (
                    <motion.form
                      key="step-details"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      onSubmit={handleSignupDetails}
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
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="rollno@nitj.ac.in"
                            className="pl-10 bg-secondary/50 border-white/5 focus:border-primary/50"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
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
                              required
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
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="relative">
                          <BookOpen className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="text"
                            placeholder="Department/Branch"
                            className="pl-10 bg-secondary/50 border-white/5 focus:border-primary/50"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="tel"
                            placeholder="Phone Number (10 digits)"
                            className="pl-10 bg-secondary/50 border-white/5 focus:border-primary/50"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                            pattern="[0-9]{10}"
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
                            required
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
                            required
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
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            Request OTP <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>

                      <div className="mt-4 text-center">
                        <p className="text-sm text-muted-foreground">
                          Already a user?{" "}
                          <button
                            type="button"
                            onClick={() => setMode("login")}
                            className="text-primary hover:underline font-semibold"
                          >
                            Login
                          </button>
                        </p>
                      </div>
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
                          onClick={() => setSignupStep("details")}
                          className="text-xs text-muted-foreground/50 hover:text-foreground mt-1"
                        >
                          Change details
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
                            required
                          />
                        </div>
                      </div>
                      <Button
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display mt-2"
                        type="submit"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            Verify & Create Account{" "}
                            <CheckCircle className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                key="forgot-password"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-2xl font-display font-bold mb-2">
                  Reset Password
                </h2>
                <p className="text-muted-foreground text-sm mb-6">
                  Enter your email to receive a reset code
                </p>

                <AnimatePresence mode="wait">
                  {forgotPasswordStep === "email" && (
                    <motion.form
                      key="fp-step-email"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      onSubmit={handleForgotPasswordEmail}
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
                            required
                            autoFocus
                          />
                        </div>
                      </div>
                      <Button
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display mt-2"
                        type="submit"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            Send Reset Code{" "}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                      <div className="mt-4 text-center">
                        <button
                          type="button"
                          onClick={() => setMode("login")}
                          className="text-sm text-primary hover:underline font-semibold"
                        >
                          Back to Login
                        </button>
                      </div>
                    </motion.form>
                  )}

                  {forgotPasswordStep === "otp" && (
                    <motion.form
                      key="fp-step-otp"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      onSubmit={handleForgotPasswordReset}
                      className="space-y-4"
                    >
                      <div className="text-center mb-4">
                        <p className="text-sm text-muted-foreground">
                          Code sent to{" "}
                          <span className="text-primary">{email}</span>
                        </p>
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
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="New Password"
                            className="pl-10 pr-10 bg-secondary/50 border-white/5 focus:border-primary/50"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
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

                      <div className="space-y-2">
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm New Password"
                            className="pl-10 pr-10 bg-secondary/50 border-white/5 focus:border-primary/50"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
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
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            Reset Password{" "}
                            <CheckCircle className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                      <div className="mt-4 text-center">
                        <button
                          type="button"
                          onClick={() => setMode("login")}
                          className="text-sm text-primary hover:underline font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
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
