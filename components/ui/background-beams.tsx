"use client";
import React from "react";
import { cn } from "@/lib/utils";

export const BackgroundBeams = ({ className }: { className?: string }) => {
  const paths = [
    "M-380 -189C-380 -189 -312 216 33 216C378 216 446 -189 446 -189",
    "M-380 -139C-380 -139 -312 266 33 266C378 266 446 -139 446 -139",
    "M-380 -89C-380 -89 -312 316 33 316C378 316 446 -89 446 -89",
    "M-380 -39C-380 -39 -312 366 33 366C378 366 446 -39 446 -39",
  ];

  return (
    <div className={cn("fixed inset-0 -z-20 opacity-50", className)}>
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="-400 -400 800 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="beam" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.3)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
          </radialGradient>
        </defs>
        <g>
          {paths.map((d, i) => (
            <path
              key={i}
              d={d}
              stroke="url(#beam)"
              strokeWidth="3"
              fill="none"
              className="animate-beam"
            />
          ))}
        </g>
      </svg>
    </div>
  );
}; 