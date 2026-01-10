"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, AlertTriangle, XCircle, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"

type ToastType = "success" | "warning" | "error" | "info"

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function useTacticalToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useTacticalToast must be used within a TacticalToastProvider")
  }
  return context
}

const TOAST_CONFIG = {
  success: {
    icon: CheckCircle,
    borderColor: "border-emerald-500",
    textColor: "text-emerald-500",
    bgColor: "bg-emerald-900/20",
    label: "OPERATION_SUCCESS",
  },
  warning: {
    icon: AlertTriangle,
    borderColor: "border-yellow-500",
    textColor: "text-yellow-500",
    bgColor: "bg-yellow-900/20",
    label: "CAUTION_ADVISED",
  },
  error: {
    icon: XCircle,
    borderColor: "border-red-500",
    textColor: "text-red-500",
    bgColor: "bg-red-900/20",
    label: "OPERATION_FAILED",
  },
  info: {
    icon: Info,
    borderColor: "border-blue-500",
    textColor: "text-blue-500",
    bgColor: "bg-blue-900/20",
    label: "INTEL_UPDATE",
  },
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const config = TOAST_CONFIG[toast.type]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
      className={cn(
        "relative w-80 bg-black/95 backdrop-blur-sm border p-4",
        config.borderColor,
        "shadow-lg shadow-black/50",
      )}
    >
      {/* Corner accents */}
      <div className={cn("absolute top-0 left-0 w-3 h-3 border-l border-t", config.borderColor)} />
      <div className={cn("absolute top-0 right-0 w-3 h-3 border-r border-t", config.borderColor)} />
      <div className={cn("absolute bottom-0 left-0 w-3 h-3 border-l border-b", config.borderColor)} />
      <div className={cn("absolute bottom-0 right-0 w-3 h-3 border-r border-b", config.borderColor)} />

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className={cn("flex items-center gap-2 text-[10px] tracking-widest", config.textColor)}>
          <Icon size={12} />
          {config.label}
        </div>
        <button
          onClick={onRemove}
          className="text-stone-600 hover:text-stone-400 transition-colors"
          aria-label="Dismiss notification"
        >
          <X size={14} />
        </button>
      </div>

      {/* Content */}
      <div className="text-sm font-bold text-stone-200 tracking-wider">{toast.title}</div>
      {toast.message && <div className="text-xs text-stone-500 mt-1 tracking-wider">{toast.message}</div>}

      {/* Progress bar */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: (toast.duration || 4000) / 1000, ease: "linear" }}
        className={cn("absolute bottom-0 left-0 right-0 h-0.5 origin-left", config.bgColor.replace("/20", ""))}
      />
    </motion.div>
  )
}

export function TacticalToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { ...toast, id }
    setToasts((prev) => [...prev, newToast])

    // Auto-remove after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, toast.duration || 4000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-3">
        <AnimatePresence mode="sync">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
