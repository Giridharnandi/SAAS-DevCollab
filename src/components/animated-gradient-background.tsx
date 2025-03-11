"use client";

import { useEffect, useRef } from "react";

export default function AnimatedGradientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Create gradient points
    const points = [
      {
        x: width * 0.1,
        y: height * 0.2,
        vx: 0.3,
        vy: 0.1,
        color: "rgba(59, 130, 246, 0.5)",
      },
      {
        x: width * 0.8,
        y: height * 0.3,
        vx: -0.2,
        vy: 0.2,
        color: "rgba(99, 102, 241, 0.5)",
      },
      {
        x: width * 0.5,
        y: height * 0.8,
        vx: 0.1,
        vy: -0.3,
        color: "rgba(139, 92, 246, 0.5)",
      },
      {
        x: width * 0.3,
        y: height * 0.6,
        vx: -0.2,
        vy: -0.1,
        color: "rgba(79, 70, 229, 0.5)",
      },
    ];

    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Update points position
      points.forEach((point) => {
        point.x += point.vx;
        point.y += point.vy;

        // Bounce off edges
        if (point.x <= 0 || point.x >= width) point.vx *= -1;
        if (point.y <= 0 || point.y >= height) point.vy *= -1;

        // Draw gradient
        const gradient = ctx.createRadialGradient(
          point.x,
          point.y,
          0,
          point.x,
          point.y,
          width * 0.5,
        );
        gradient.addColorStop(0, point.color);
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10"
    />
  );
}
