import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NudgeAnimation = ({ message, from, onComplete }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 500);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] pointer-events-none"
        >
          {/* Shake Effect */}
          <motion.div
            animate={{
              x: [0, -10, 10, -10, 10, -5, 5, 0],
              y: [0, -5, 5, -5, 5, 0],
            }}
            transition={{
              duration: 0.5,
              repeat: 2,
              ease: "easeInOut",
            }}
            className="w-full h-full relative"
          >
            {/* Ripple Waves */}
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-r from-indigo-500/30 to-purple-500/30 blur-xl"
            />
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-r from-purple-500/30 to-pink-500/30 blur-xl"
            />
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-r from-pink-500/30 to-indigo-500/30 blur-xl"
            />

            {/* Floating Emojis */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: "50vw",
                  y: "50vh",
                  scale: 0,
                  rotate: 0,
                }}
                animate={{
                  x: `${Math.random() * 100}vw`,
                  y: `${Math.random() * 100}vh`,
                  scale: [0, 1.5, 0],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.1,
                  ease: "easeOut",
                }}
                className="absolute text-6xl"
                style={{
                  filter: "drop-shadow(0 0 10px rgba(99, 102, 241, 0.5))",
                }}
              >
                👋
              </motion.div>
            ))}

            {/* Center Message Card */}
            <motion.div
              initial={{ scale: 0, rotate: -180, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, rotate: 180, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 20,
                delay: 0.3,
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
            >
              <div className="relative">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-75 animate-pulse" />

                {/* Card */}
                <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-white/20 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-xl min-w-[300px] md:min-w-[500px]">
                  {/* Animated Border */}
                  <motion.div
                    animate={{
                      background: [
                        "linear-gradient(0deg, #667eea, #764ba2)",
                        "linear-gradient(360deg, #667eea, #764ba2)",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-3xl opacity-20"
                  />

                  <div className="relative z-10 text-center">
                    {/* Bouncing Hand */}
                    <motion.div
                      animate={{
                        y: [0, -20, 0],
                        rotate: [0, 15, -15, 0],
                      }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="text-8xl md:text-9xl mb-6 inline-block"
                      style={{
                        filter: "drop-shadow(0 0 20px rgba(99, 102, 241, 0.8))",
                      }}
                    >
                      👋
                    </motion.div>

                    {/* From Text */}
                    <motion.h2
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4"
                    >
                      {from === "You"
                        ? "Nudge Sent! 🚀"
                        : `${from} nudged you!`}
                    </motion.h2>

                    {/* Message */}
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.7 }}
                      className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                    >
                      <p className="text-2xl md:text-3xl font-bold text-white">
                        "{message}"
                      </p>
                    </motion.div>

                    {/* Sparkles */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute -top-4 -right-4 text-4xl"
                    >
                      ✨
                    </motion.div>
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute -bottom-4 -left-4 text-4xl"
                    >
                      ✨
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NudgeAnimation;
