"use client"

import type React from "react"

import { useState, useCallback, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ArrowRight, ArrowLeft, Check, Flame, User, MessageSquare, Loader2, Sparkles, Globe } from "lucide-react"

// =============================================================================
// TYPES
// =============================================================================

type FormData = {
  name: string
  businessIdentifier: string // Combined email or URL field
  role: string
  challenge: string
  budget: string
  timeline: string
}

type StepConfig = {
  id: keyof FormData
  question: string
  subtext: string
  type: "text" | "email" | "select" | "textarea"
  placeholder: string
  options?: string[]
  icon: React.ReactNode
  validation?: (value: string) => boolean
}

// =============================================================================
// CONSTANTS
// =============================================================================

const STEPS: StepConfig[] = [
  {
    id: "name",
    question: "Let's start with your name",
    subtext: "What should we call you?",
    type: "text",
    placeholder: "Enter your full name",
    icon: <User className="w-5 h-5" />,
    validation: (v) => v.length >= 2,
  },
  {
    id: "businessIdentifier",
    question: "What's your business email or website?",
    subtext: "Enter your work email or company URL — we'll extract the rest",
    type: "text",
    placeholder: "you@company.com or company.com",
    icon: <Globe className="w-5 h-5" />,
    validation: (v) => {
      // Validate email format
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
      // Validate URL/domain format
      const isUrl = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/.test(v)
      return isEmail || isUrl
    },
  },
  {
    id: "role",
    question: "What's your role?",
    subtext: "Select the option that best describes you",
    type: "select",
    placeholder: "Select your role",
    options: [
      "Founder / CEO",
      "CTO / VP Engineering",
      "Head of Product",
      "Head of Operations",
      "Director / Manager",
      "Individual Contributor",
      "Other",
    ],
    icon: <Sparkles className="w-5 h-5" />,
    validation: (v) => v.length > 0,
  },
  {
    id: "challenge",
    question: "What's your biggest challenge?",
    subtext: "Tell us what's keeping you up at night",
    type: "textarea",
    placeholder: "Describe your current pain points with AI, automation, or data...",
    icon: <MessageSquare className="w-5 h-5" />,
    validation: (v) => v.length >= 10,
  },
  {
    id: "budget",
    question: "What's your budget range?",
    subtext: "This helps us scope the engagement",
    type: "select",
    placeholder: "Select budget range",
    options: [
      "< $10k - Pilot Project",
      "$10k - $50k - Single System",
      "$50k - $150k - Full Implementation",
      "$150k+ - Enterprise Deployment",
      "Not sure yet",
    ],
    icon: <Flame className="w-5 h-5" />,
    validation: (v) => v.length > 0,
  },
  {
    id: "timeline",
    question: "When do you need this?",
    subtext: "What's your ideal timeline?",
    type: "select",
    placeholder: "Select timeline",
    options: ["ASAP - Urgent", "1-2 months", "3-6 months", "6+ months", "Just exploring"],
    icon: <ArrowRight className="w-5 h-5" />,
    validation: (v) => v.length > 0,
  },
]

const INITIAL_FORM_DATA: FormData = {
  name: "",
  businessIdentifier: "", // Renamed from email + company
  role: "",
  challenge: "",
  budget: "",
  timeline: "",
}

// =============================================================================
// SIGNUP FORM COMPONENT
// =============================================================================

export function SignupForm({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [direction, setDirection] = useState(1)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null)

  const currentStep = STEPS[step]
  const progress = ((step + 1) / STEPS.length) * 100

  // Focus input on step change
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [step, isOpen])

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep(0)
        setFormData(INITIAL_FORM_DATA)
        setIsComplete(false)
      }, 300)
    }
  }, [isOpen])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      if (e.key === "Escape") onClose()
      if (e.key === "Enter" && !e.shiftKey && currentStep?.type !== "textarea") {
        e.preventDefault()
        handleNext()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, step, formData, onClose])

  const handleNext = useCallback(() => {
    if (!currentStep) return

    const value = formData[currentStep.id]
    if (currentStep.validation && !currentStep.validation(value)) return

    if (step < STEPS.length - 1) {
      setDirection(1)
      setStep((s) => s + 1)
    } else {
      handleSubmit()
    }
  }, [step, formData, currentStep])

  const handleBack = useCallback(() => {
    if (step > 0) {
      setDirection(-1)
      setStep((s) => s - 1)
    }
  }, [step])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsSubmitting(false)
    setIsComplete(true)
  }

  const handleInputChange = (value: string) => {
    if (!currentStep) return
    setFormData((prev) => ({ ...prev, [currentStep.id]: value }))
  }

  const isCurrentStepValid = currentStep?.validation
    ? currentStep.validation(formData[currentStep.id])
    : formData[currentStep?.id]?.length > 0

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-zinc-950/95 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Form Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl mx-4 bg-zinc-900 border border-zinc-800 overflow-hidden"
          >
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-orange-500" />
            <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-orange-500" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-orange-500" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-orange-500" />

            {/* Header */}
            <div className="flex items-center justify-between px-8 py-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="font-mono text-sm text-zinc-400">SYSTEM_AUDIT_INIT</span>
              </div>
              <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-zinc-800">
              <motion.div
                className="h-full bg-gradient-to-r from-orange-500 to-orange-400"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Content */}
            <div className="relative min-h-[400px] px-8 py-12">
              <AnimatePresence mode="wait" initial={false}>
                {isComplete ? (
                  <motion.div
                    key="complete"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex flex-col items-center justify-center h-full text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                      className="w-20 h-20 rounded-full bg-orange-500/20 border-2 border-orange-500 flex items-center justify-center mb-6"
                    >
                      <Check className="w-10 h-10 text-orange-500" />
                    </motion.div>
                    <h2 className="text-3xl font-bold text-white mb-3">Audit Initialized</h2>
                    <p className="text-zinc-400 max-w-md mb-8">
                      We've received your request, <span className="text-orange-500">{formData.name}</span>. Expect a
                      response within 24 hours. Time to light some fires.
                    </p>
                    <button
                      onClick={onClose}
                      className="px-6 py-3 bg-orange-500 text-white font-bold hover:bg-orange-400 transition-colors"
                    >
                      CLOSE TERMINAL
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: direction * 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction * -50 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    {/* Step Counter */}
                    <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
                      <span className="text-orange-500">{String(step + 1).padStart(2, "0")}</span>
                      <span>/</span>
                      <span>{String(STEPS.length).padStart(2, "0")}</span>
                    </div>

                    {/* Question */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-orange-500">{currentStep.icon}</div>
                      <h2 className="text-3xl md:text-4xl font-bold text-white">{currentStep.question}</h2>
                      <p className="text-zinc-400">{currentStep.subtext}</p>
                    </div>

                    {/* Input */}
                    <div className="relative">
                      {currentStep.type === "text" ? (
                        <input
                          ref={inputRef as React.RefObject<HTMLInputElement>}
                          type={currentStep.type}
                          value={formData[currentStep.id]}
                          onChange={(e) => handleInputChange(e.target.value)}
                          placeholder={currentStep.placeholder}
                          className="w-full bg-transparent border-b-2 border-zinc-700 focus:border-orange-500 text-2xl text-white placeholder:text-zinc-600 py-4 outline-none transition-colors"
                          autoComplete="off"
                        />
                      ) : currentStep.type === "textarea" ? (
                        <textarea
                          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                          value={formData[currentStep.id]}
                          onChange={(e) => handleInputChange(e.target.value)}
                          placeholder={currentStep.placeholder}
                          rows={4}
                          className="w-full bg-zinc-800/50 border border-zinc-700 focus:border-orange-500 text-lg text-white placeholder:text-zinc-600 p-4 outline-none transition-colors resize-none"
                        />
                      ) : currentStep.type === "select" ? (
                        <div className="grid gap-2">
                          {currentStep.options?.map((option) => (
                            <button
                              key={option}
                              onClick={() => handleInputChange(option)}
                              className={`w-full text-left px-4 py-3 border transition-all duration-200 ${
                                formData[currentStep.id] === option
                                  ? "border-orange-500 bg-orange-500/10 text-white"
                                  : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"
                              }`}
                            >
                              <span className="font-mono text-xs text-orange-500 mr-3">
                                {String(currentStep.options!.indexOf(option) + 1).padStart(2, "0")}
                              </span>
                              {option}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    {/* Hint */}
                    {currentStep.type === "text" && (
                      <p className="text-xs text-zinc-600 font-mono">
                        Press <span className="text-orange-500">Enter ↵</span> to continue
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {!isComplete && (
              <div className="flex items-center justify-between px-8 py-4 border-t border-zinc-800 bg-zinc-900/50">
                <button
                  onClick={handleBack}
                  disabled={step === 0}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-mono transition-colors ${
                    step === 0 ? "text-zinc-700 cursor-not-allowed" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  BACK
                </button>

                <button
                  onClick={handleNext}
                  disabled={!isCurrentStepValid || isSubmitting}
                  className={`flex items-center gap-2 px-6 py-3 font-bold transition-all duration-200 ${
                    isCurrentStepValid
                      ? "bg-orange-500 text-white hover:bg-orange-400"
                      : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      PROCESSING
                    </>
                  ) : step === STEPS.length - 1 ? (
                    <>
                      SUBMIT
                      <Check className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      CONTINUE
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Scan Line Effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[size:100%_4px]" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// =============================================================================
// SIGNUP TRIGGER HOOK
// =============================================================================

export function useSignupForm() {
  const [isOpen, setIsOpen] = useState(false)
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  return { isOpen, open, close }
}
