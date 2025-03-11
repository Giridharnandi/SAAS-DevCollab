"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function CursorDot() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 z-50 pointer-events-none w-3 h-3 bg-blue-600 rounded-full"
      animate={{
        x: mousePosition.x - 6,
        y: mousePosition.y - 6,
      }}
      transition={{
        type: "spring",
        stiffness: 1000,
        damping: 28,
        mass: 0.5,
      }}
    />
  );
}
