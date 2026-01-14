import React from "react";
import { motion } from "framer-motion";
import { assets } from "../assets/assets";

/* ---------------- ANIMATION VARIANTS ---------------- */

const fadeLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

const fadeRight = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

/* ---------------- COMPONENT ---------------- */

function Frontpage() {
  return (
    <section className="relative w-full bg-[#f1efeecd] pt-32 pb-20 md:pt-40 md:pb-28 flex justify-center overflow-hidden">

      {/* BACKGROUND BLOBS */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-[#f57404]/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] -z-10" />

      <div className="w-full max-w-7xl px-6 md:px-16 lg:px-24 z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-16 lg:gap-24">

          {/* ---------------- LEFT CONTENT ---------------- */}
          <motion.div
            className="w-full md:w-1/2 text-left"
            variants={fadeLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {/* Badge */}
              <motion.div
                variants={fadeUp}
                className="inline-flex items-center gap-2 px-5 py-2 mb-10 rounded-full bg-[#f57404]/5 border border-[#f57404]/10 shadow-sm"
              >
                <span className="flex h-2 w-2 rounded-full bg-[#f57404] animate-pulse"></span>
                <span className="text-[#f57404] text-xs md:text-sm font-bold tracking-widest uppercase">
                  Exclusive to University Students
                </span>
              </motion.div>

              {/* Headings */}
              <motion.div variants={fadeUp} className="space-y-6 mb-10">
                <h1 className="text-3xl lg:text-5xl font-black tracking-tighter text-gray-900 leading-[0.95]">
                  Campus <br />
                  <span className="text-[#f57404]">Xchange</span>
                </h1>
                <h2 className="text-2xl md:text-3xl text-gray-700 font-medium tracking-tight">
                  Exchange Smarter.{" "}
                  <span className="text-gray-400">Together.</span>
                </h2>
              </motion.div>

              {/* Description */}
              <motion.p
                variants={fadeUp}
                className="text-gray-500 text-lg md:text-xl leading-relaxed max-w-lg mb-12"
              >
                The premier marketplace designed exclusively for your campus.
                Buy, sell, and trade with verified peers in a secure environment.
              </motion.p>

              {/* Buttons */}
              <motion.div
                variants={fadeUp}
                className="flex flex-col sm:flex-row items-center gap-6 mb-16"
              >
                <motion.button
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-[#f57404] text-white font-extrabold text-lg shadow-[0_20px_40px_-15px_rgba(245,116,4,0.4)]"
                >
                  Start Exploring
                </motion.button>

                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 250 }}
                  className="w-full sm:w-auto px-10 py-5 rounded-2xl border-2 border-gray-100 text-gray-600 font-bold text-lg hover:border-[#f57404] hover:text-[#f57404] hover:bg-[#f57404]/5"
                >
                  How it Works
                </motion.button>
              </motion.div>

              {/* Students */}
              <motion.div
                variants={fadeUp}
                className="flex items-center gap-6 pt-8 border-t border-gray-100"
              >
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-4 border-white bg-gray-100 shadow-sm"
                    />
                  ))}
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-900 font-bold text-lg leading-none">
                    500+ Students
                  </span>
                  <span className="text-gray-400 text-sm mt-1">
                    Active this week on your campus
                  </span>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* ---------------- RIGHT IMAGE ---------------- */}
          <motion.div
            className="w-full md:w-1/2 flex justify-center md:justify-end"
            variants={fadeRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div
              className="relative cursor-pointer"
              animate={{ y: [0, -25, 0] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              whileHover={{ scale: 1.05 }}
            >
              {/* Glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#f57404]/20 to-indigo-500/10 blur-[100px] rounded-full" />

              <motion.img
                src={assets.front}
                alt="Campus Xchange Illustration"
                className="relative w-full max-w-[500px] lg:max-w-[600px] h-auto object-contain"
                whileHover={{ scale: 1.06 }}
                transition={{
                  type: "spring",
                  stiffness: 120,
                  damping: 15,
                }}
              />
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

export default Frontpage;
