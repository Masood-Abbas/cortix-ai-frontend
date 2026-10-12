
import  { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

function LoadingAnimation() {
  const thinkingLabels = [
    "Thinking",
    "Analyzing",
    "Reasoning",
    "Generating",
  ];

  const [labelIndex, setLabelIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLabelIndex((prev) => (prev + 1) % thinkingLabels.length);
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  const label = thinkingLabels[labelIndex];

  return (
    <div className="flex items-center gap-3 max-w-[72%] py-1">
      {/* Animated ripple circles */}
      <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
        {[0, 0.45, 0.9].map((delay, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border border-indigo-400"
            initial={{ scale: 0.3, opacity: 0.55 }}
            animate={{ scale: 1.7, opacity: 0 }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              delay,
              ease: "easeOut",
            }}
          />
        ))}

        {/* Center dot */}
        <div className="w-2 h-2 rounded-full bg-indigo-400" />
      </div>

      {/* Animated thinking label */}
      <div className="flex overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={label}
            className="flex text-sm text-slate-400"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {label.split("").map((letter, index) => (
              <motion.span
                key={`${label}-${index}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, duration: 0.2 }}
              >
                {letter}
              </motion.span>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default LoadingAnimation;
