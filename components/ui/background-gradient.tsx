"use client"

import { cn } from "@/lib/utils"
import React, { useEffect, useRef, useState } from "react"

export const BackgroundGradient = ({
  children,
  className = "",
  containerClassName = "",
  animate = true,
}: {
  children?: React.ReactNode
  className?: string
  containerClassName?: string
  animate?: boolean
}) => {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div
      className={cn(
        "relative p-[4px] group/container",
        containerClassName
      )}
      ref={containerRef}
    >
      <div
        className={cn(
          "absolute inset-0 rounded-3xl bg-gradient-to-r from-violet-500 via-purple-500 to-blue-500",
          "group-hover/container:opacity-100 transition duration-500",
          animate ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        className={cn(
          "relative flex h-full w-full items-center justify-center rounded-3xl bg-black",
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}

