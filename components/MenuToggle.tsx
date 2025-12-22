"use client"

import { Menu } from "lucide-react"
import { useMenu } from "./MenuProvider"
import { cn } from "@/lib/utils"

interface MenuToggleProps {
  className?: string
}

export function MenuToggle({ className }: MenuToggleProps) {
  const { toggleMenu, isOpen } = useMenu()

  return (
    <button
      onClick={toggleMenu}
      className={cn(
        "fixed top-4 right-6 z-[60] p-2.5 border border-zinc-800 bg-zinc-950/90 backdrop-blur-md",
        "hover:border-orange-500/50 hover:bg-orange-500/10 transition-all duration-300",
        "group",
        isOpen && "opacity-0 pointer-events-none",
        className
      )}
      aria-label="Open menu"
    >
      <Menu className="w-5 h-5 text-zinc-400 group-hover:text-orange-500 transition-colors" />
    </button>
  )
}
