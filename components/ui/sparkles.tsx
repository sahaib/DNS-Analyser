"use client";
import React from "react";
import { cn } from "@/lib/utils";

export const SparklesCore = ({
  background,
  minSize,
  maxSize,
  particleDensity,
  className,
  particleColor,
}: {
  background?: string;
  minSize?: number;
  maxSize?: number;
  particleDensity?: number;
  className?: string;
  particleColor?: string;
}) => {
  const [particles, setParticles] = React.useState<Array<any>>([]);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        const canvas = canvasRef.current;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particlesArray: Array<any> = [];
        const numberOfParticles = particleDensity || 100;

        for (let i = 0; i < numberOfParticles; i++) {
          const size = ((maxSize || 3) - (minSize || 0.1)) * Math.random() + (minSize || 0.1);
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const directionX = Math.random() * 2 - 1;
          const directionY = Math.random() * 2 - 1;

          particlesArray.push({
            x,
            y,
            directionX,
            directionY,
            size,
            color: particleColor || "#FFFFFF"
          });
        }

        setParticles(particlesArray);

        const animate = () => {
          requestAnimationFrame(animate);
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          for (let i = 0; i < particlesArray.length; i++) {
            const particle = particlesArray[i];
            particle.x += particle.directionX;
            particle.y += particle.directionY;

            if (particle.x < 0 || particle.x > canvas.width) particle.directionX *= -1;
            if (particle.y < 0 || particle.y > canvas.height) particle.directionY *= -1;

            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = particle.color;
            ctx.fill();
          }
        };

        animate();
      }
    }
  }, [maxSize, minSize, particleColor, particleDensity]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("fixed inset-0 -z-10", className)}
      style={{ background: background || "transparent" }}
    />
  );
}; 