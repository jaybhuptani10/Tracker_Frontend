import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ReceiverNudgeAnimation = ({ message, from, onComplete }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 500);
    }, 3500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          {/* Impact Waves */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: 4, opacity: 0 }}
              transition={{
                duration: 1.5,
                delay: i * 0.2,
                ease: "easeOut",
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border-4 border-blue-400"
            />
          ))}

          {/* Waving Hand - Coming from left */}
          <motion.div
            initial={{ x: "-100vw", rotate: -45, scale: 3 }}
            animate={{
              x: "0vw",
              rotate: 0,
              scale: 1,
            }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 15,
              duration: 0.8,
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <motion.div
              animate={{
                rotate: [0, 15, -15, 15, -15, 0],
              }}
              transition={{
                duration: 0.6,
                delay: 0.8,
                repeat: 2,
              }}
              className="text-9xl md:text-[12rem]"
              style={{
                filter: "drop-shadow(0 0 30px rgba(59, 130, 246, 0.8))",
              }}
            >
              👋
            </motion.div>
          </motion.div>

          {/* Confetti Burst */}
          {[...Array(30)].map((_, i) => (
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
                scale: [0, 1, 0],
                rotate: Math.random() * 360,
              }}
              transition={{
                duration: 2,
                delay: 0.8 + i * 0.03,
                ease: "easeOut",
              }}
              className="absolute text-4xl"
            >
              {["⭐", "✨", "💫", "🌟"][Math.floor(Math.random() * 4)]}
            </motion.div>
          ))}

          {/* Message Card - Slides up */}
          <motion.div
            initial={{ y: "100vh", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 20,
              delay: 1.2,
            }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl"
          >
            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-60 animate-pulse" />

            {/* Card */}
            <div className="relative bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 border-2 border-blue-500/30 rounded-3xl p-6 md:p-10 shadow-2xl">
              {/* From Text */}
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.4 }}
                className="text-blue-400 text-sm md:text-base font-semibold mb-2 text-center"
              >
                Incoming from {from}
              </motion.p>

              {/* Title */}
              <motion.h2
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="text-3xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
              >
                {from} nudged you!
              </motion.h2>

              {/* Message */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.6 }}
                className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30"
              >
                <p className="text-2xl md:text-3xl font-bold text-white text-center">
                  "{message}"
                </p>
              </motion.div>

              {/* Sparkles */}
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-4 -right-4 text-4xl"
              >
                ✨
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.3, 1], rotate: -360 }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="absolute -bottom-4 -left-4 text-4xl"
              >
                💫
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReceiverNudgeAnimation;
