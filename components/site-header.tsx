"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ThemeSwitcher } from "@/components/theme-switcher"

export function SiteHeader() {
  return (
    <motion.header 
      className="border-b border-white/10 backdrop-blur-xl"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl text-white">
          DNS Analyzer
        </Link>
        <ThemeSwitcher />
      </div>
    </motion.header>
  )
}

