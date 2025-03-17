import React from "react";
import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "netflix";
}

const variants = {
  default: {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }
    }
  },
  netflix: {
    initial: { scale: 1.5, opacity: 0 },
    animate: {
      scale: [1.5, 1, 1.5],
      opacity: [0, 1, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }
};

const sizes = {
  sm: "w-6 h-6",
  md: "w-12 h-12",
  lg: "w-24 h-24"
};

export function LoadingSpinner({ size = "md", variant = "default" }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center">
      {variant === "default" ? (
        <motion.div
          className={`${sizes[size]} border-4 border-primary border-t-transparent rounded-full`}
          animate="animate"
          variants={variants.default}
        />
      ) : (
        <motion.div
          className={`${sizes[size]} text-primary font-bold`}
          initial="initial"
          animate="animate"
          variants={variants.netflix}
        >
          N
        </motion.div>
      )}
    </div>
  );
}
