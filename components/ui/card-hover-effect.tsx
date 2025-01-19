"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const HoverEffect = ({
  items,
  className,
}: {
  items: {
    title: string;
    description: string;
  }[];
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 py-10",
        className
      )}
    >
      {items.map((item, idx) => (
        <div
          key={item.title + idx}
          className="relative group block p-2 h-full w-full"
        >
          <motion.div
            whileHover={{
              scale: 1.05,
            }}
            transition={{
              duration: 0.2,
            }}
            className="rounded-xl border border-white/10 bg-white/5 p-6 h-full"
          >
            <div className="relative z-10">
              <div className="p-4">
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-neutral-200">{item.description}</p>
              </div>
            </div>
          </motion.div>
        </div>
      ))}
    </div>
  );
}; 