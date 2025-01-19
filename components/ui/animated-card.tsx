"use client"

import { cn } from "@/lib/utils"
import React, { createContext, useState, useContext, useRef, useEffect } from "react"

const MouseEnterContext = createContext<{
  mouseEnter: boolean
  setMouseEnter: React.Dispatch<React.SetStateAction<boolean>>
}>({
  mouseEnter: false,
  setMouseEnter: () => {},
})

export const AnimatedCard = ({
  children,
  className,
  containerClassName,
}: {
  children: React.ReactNode
  className?: string
  containerClassName?: string
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mouseEnter, setMouseEnter] = useState(false)
  const [rotate, setRotate] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return

    const container = containerRef.current
    const rect = container.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const mouseX = e.clientX
    const mouseY = e.clientY

    const rotateX = (mouseY - centerY) / 20
    const rotateY = (mouseX - centerX) / 20

    setRotate({ x: rotateX, y: rotateY })
  }

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 })
  }

  return (
    <MouseEnterContext.Provider value={{ mouseEnter, setMouseEnter }}>
      <div
        className={cn("relative", containerClassName)}
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className={cn(
            "w-full h-full transition-transform duration-200 ease-linear preserve-3d",
            className
          )}
          style={{
            transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          }}
        >
          {children}
        </div>
      </div>
    </MouseEnterContext.Provider>
  )
}

export const CardBody = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <div
      className={cn(
        "w-full h-full flex flex-col items-start justify-center backface-hidden",
        className
      )}
    >
      {children}
    </div>
  )
}

