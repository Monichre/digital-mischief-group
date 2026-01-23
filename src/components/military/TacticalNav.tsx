"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Home, LogIn, CreditCard, Target, LayoutDashboard, FileCode, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/", label: "HQ", icon: Home },
  { href: "/sign-in", label: "UPLINK", icon: LogIn },
  { href: "/dashboard", label: "CMD", icon: LayoutDashboard },
  { href: "/features", label: "INTEL", icon: Zap },
  { href: "/loadout", label: "LOADOUT", icon: CreditCard },
  { href: "/schematics", label: "DOCS", icon: FileCode },
]

export function TacticalNav() {
  const pathname = usePathname()

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="pointer-events-auto flex items-center gap-2 text-emerald-500 hover:text-emerald-400 transition-colors"
          >
            <Target size={20} className="animate-pulse" />
            <span className="font-bold tracking-widest text-xs hidden sm:inline">DIGITAL MISCHIEF</span>
          </Link>

          {/* Nav Links */}
          <div className="pointer-events-auto flex items-center gap-1 bg-black/80 backdrop-blur-sm border border-emerald-900/50 p-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-2 px-3 py-2 text-[10px] font-bold tracking-widest uppercase transition-all",
                    isActive ? "text-emerald-400" : "text-stone-500 hover:text-stone-300",
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 bg-emerald-900/30 border border-emerald-700/50"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon size={14} className="relative z-10" />
                  <span className="relative z-10 hidden sm:inline">{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Status Indicator */}
          <div className="pointer-events-auto flex items-center gap-2 text-[10px] text-emerald-700 tracking-widest">
            <span className="hidden md:inline">SYS_ONLINE</span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Bottom Border Line */}
      <div className="h-px bg-gradient-to-r from-transparent via-emerald-900/50 to-transparent" />
    </motion.nav>
  )
}
