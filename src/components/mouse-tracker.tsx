"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function MouseTracker() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorVariant, setCursorVariant] = useState("default");
  const [isHovering, setIsHovering] = useState(false);
  const [currentSection, setCurrentSection] = useState("hero");

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = () => {
      // Determine which section is currently in view
      const sections = [
        { id: "hero", element: document.querySelector("#hero") },
        { id: "features", element: document.querySelector("#features") },
        {
          id: "how-it-works",
          element: document.querySelector("#how-it-works"),
        },
        { id: "stats", element: document.querySelector("#stats") },
        { id: "pricing", element: document.querySelector("#pricing") },
        { id: "cta", element: document.querySelector("#cta") },
      ];

      for (const section of sections) {
        if (!section.element) continue;

        const rect = section.element.getBoundingClientRect();
        if (
          rect.top <= window.innerHeight / 2 &&
          rect.bottom >= window.innerHeight / 2
        ) {
          setCurrentSection(section.id);
          break;
        }
      }
    };

    // Track hover state for links and buttons
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("a") ||
        target.closest("button")
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mouseover", handleMouseOver);

    // Initial check for current section
    handleScroll();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  // Cursor variants based on section and hover state
  const variants = {
    default: {
      x: mousePosition.x - 16,
      y: mousePosition.y - 16,
      height: 32,
      width: 32,
      backgroundColor: "rgba(59, 130, 246, 0.5)",
      mixBlendMode: "difference" as const,
      borderRadius: "50%",
    },
    hero: {
      x: mousePosition.x - 20,
      y: mousePosition.y - 20,
      height: 40,
      width: 40,
      backgroundColor: "rgba(99, 102, 241, 0.4)",
      mixBlendMode: "difference" as const,
      borderRadius: "50%",
      border: "2px solid rgba(255, 255, 255, 0.8)",
    },
    features: {
      x: mousePosition.x - 15,
      y: mousePosition.y - 15,
      height: 30,
      width: 30,
      backgroundColor: "rgba(79, 70, 229, 0.3)",
      mixBlendMode: "difference" as const,
      borderRadius: "8px",
      rotate: 45,
    },
    "how-it-works": {
      x: mousePosition.x - 25,
      y: mousePosition.y - 25,
      height: 50,
      width: 50,
      backgroundColor: "rgba(139, 92, 246, 0.3)",
      mixBlendMode: "difference" as const,
      borderRadius: "50%",
      scale: 0.8,
    },
    stats: {
      x: mousePosition.x - 18,
      y: mousePosition.y - 18,
      height: 36,
      width: 36,
      backgroundColor: "rgba(255, 255, 255, 0.3)",
      mixBlendMode: "difference" as const,
      borderRadius: "50%",
      border: "2px solid rgba(255, 255, 255, 0.8)",
    },
    pricing: {
      x: mousePosition.x - 20,
      y: mousePosition.y - 20,
      height: 40,
      width: 40,
      backgroundColor: "rgba(37, 99, 235, 0.2)",
      mixBlendMode: "difference" as const,
      borderRadius: "12px",
      rotate: 0,
    },
    cta: {
      x: mousePosition.x - 22,
      y: mousePosition.y - 22,
      height: 44,
      width: 44,
      backgroundColor: "rgba(147, 197, 253, 0.3)",
      mixBlendMode: "difference" as const,
      borderRadius: "50%",
      scale: 1.1,
    },
    hover: {
      x: mousePosition.x - 30,
      y: mousePosition.y - 30,
      height: 60,
      width: 60,
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      mixBlendMode: "difference" as const,
      borderRadius: "50%",
      border: "2px solid rgba(59, 130, 246, 0.8)",
      scale: 1.2,
    },
  };

  return (
    <motion.div
      className="fixed top-0 left-0 z-50 pointer-events-none"
      animate={isHovering ? "hover" : currentSection}
      variants={variants}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 28,
        mass: 0.8,
      }}
    />
  );
}
