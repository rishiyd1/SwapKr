import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
const LoginModal = ({ open, onClose }) => {
    const [step, setStep] = useState("email");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [otp, setOtp] = useState("");
    const handleEmail = () => {
        if (!email.endsWith("@nitj.ac.in")) {
            setError("campus email only :(");
            return;
        }
        setError("");
        setStep("otp");
    };
    const handleClose = () => {
        setStep("email");
        setEmail("");
        setOtp("");
        setError("");
        onClose();
    };
    return (<AnimatePresence>
      {open && (<motion.div className="fixed inset-0 z-[100] flex items-center justify-center px-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={handleClose}/>
          <motion.div className="relative glass rounded-2xl p-8 w-full max-w-md border border-border" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "spring", duration: 0.5 }}>
            <button onClick={handleClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-5 h-5"/>
            </button>

            <AnimatePresence mode="wait">
              {step === "email" ? (<motion.div key="email" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center mb-5">
                    <Mail className="w-5 h-5 text-primary"/>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-foreground">
                    Welcome to Swapkr
                  </h3>
                  <p className="text-muted-foreground text-sm mt-2 mb-6">
                    enter your campus email to get started
                  </p>
                  <input type="email" placeholder="you@nitj.ac.in" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} onKeyDown={(e) => e.key === "Enter" && handleEmail()} className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"/>
                  {error && (<motion.p className="text-destructive text-sm mt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      {error}
                    </motion.p>)}
                  <Button className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90 font-display" onClick={handleEmail}>
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2"/>
                  </Button>
                </motion.div>) : (<motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <h3 className="font-display text-2xl font-bold text-foreground">
                    Check your inbox
                  </h3>
                  <p className="text-muted-foreground text-sm mt-2 mb-6">
                    we sent a code to{" "}
                    <span className="text-primary">{email}</span>
                  </p>
                  <input type="text" placeholder="Enter OTP" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] font-display text-foreground placeholder:text-muted-foreground placeholder:text-sm placeholder:tracking-normal focus:outline-none focus:ring-1 focus:ring-primary/50"/>
                  <Button className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90 font-display">
                    Verify
                    <ArrowRight className="w-4 h-4 ml-2"/>
                  </Button>
                  <button className="w-full mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={() => setStep("email")}>
                    use a different email
                  </button>
                </motion.div>)}
            </AnimatePresence>
          </motion.div>
        </motion.div>)}
    </AnimatePresence>);
};
export default LoginModal;
