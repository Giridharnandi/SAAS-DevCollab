"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ParallaxSectionProps {
  children: React.ReactNode;
  bgImage?: string;
  bgColor?: string;
  speed?: number;
  className?: string;
}

export default function ParallaxSection({
  children,
  bgImage,
  bgColor = "bg-blue-600",
  speed = 0.5,
  className = "",
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", `${speed * 100}%`]);

  return (
    <section
      ref={ref}
      className={`relative overflow-hidden py-20 ${bgColor} ${className}`}
      style={
        bgImage
          ? { backgroundImage: `url(${bgImage})`, backgroundSize: "cover" }
          : {}
      }
    >
      <motion.div style={{ y }} className="relative z-10">
        {children}
      </motion.div>
    </section>
  );
}
