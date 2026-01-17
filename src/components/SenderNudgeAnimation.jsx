import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SenderNudgeAnimation = ({ message, onComplete }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 500);
    }, 3000);
    return () => clearTimeout(timer);
  }, []); // Run once on mount

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          {/* Rocket Trail Particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: "50vw",
                y: "50vh",
                scale: 1,
                opacity: 1,
              }}
              animate={{
                x: `${50 + (Math.random() - 0.5) * 40}vw`,
                y: `${100 + Math.random() * 20}vh`,
                scale: 0,
                opacity: 0,
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.05,
                ease: "easeOut",
              }}
              className="absolute w-3 h-3 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500"
            />
          ))}

          {/* Main Card */}
          <motion.div
            initial={{ scale: 0.8, y: 0, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.5, y: -1000, opacity: 0, rotate: 20 }}
            transition={{
              exit: { duration: 1, ease: "easeIn" },
            }}
            className="relative"
          >
            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-3xl blur-3xl opacity-60 animate-pulse" />

            {/* Card */}
            <div className="relative bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 border-2 border-purple-500/30 rounded-3xl p-8 md:p-12 shadow-2xl min-w-[320px] md:min-w-[500px]">
              {/* Rocket */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotate: [-5, 5, -5],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="text-8xl md:text-9xl mb-4 text-center"
              >
                🚀
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-5xl font-bold text-center mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent"
              >
                Nudge Sent! 🎯
              </motion.h2>

              {/* Message Box */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30"
              >
                <p className="text-2xl md:text-3xl font-bold text-white text-center">
                  "{message}"
                </p>
              </motion.div>

              {/* Flying Stars */}
              <motion.div
                animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-6 -right-6 text-5xl"
              >
                ⭐
              </motion.div>
              <motion.div
                animate={{ rotate: -360, scale: [1, 1.3, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="absolute -bottom-6 -left-6 text-5xl"
              >
                ✨
              </motion.div>
            </div>
          </motion.div>

          {/* Launch Text */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ delay: 0.6 }}
            className="absolute bottom-20 text-center"
          >
            <p className="text-white/80 text-lg font-medium">
              Launching to your partner... 🚀
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SenderNudgeAnimation;
