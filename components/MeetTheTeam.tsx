"use client"

import { useState, useEffect, useRef } from "react"
import { ParticleFace } from "./particle-face"
import { X, ChevronLeft, ChevronRight, Flame } from "lucide-react"

interface TeamMember {
  id: string
  name: string
  role: string
  image: string
  bio: string
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "liam",
    name: "Liam Ellis",
    role: "Head of R&D / Lead Architect",
    image: "/images/liam-face.png",
    bio: "Systems architect designing governed AI infrastructure that transforms how enterprises deploy autonomous agents.",
  },
  {
    id: "brendan",
    name: "Brendan Ellis",
    role: "Lead Systems Engineer",
    image: "/portrait-silhouette-cyberpunk-style-person.jpg",
    bio: "Full-stack engineer building the infrastructure that powers production-grade AI systems and multi-agent workflows.",
  },
  {
    id: "jp",
    name: "JP McMonagle",
    role: "Ops Director",
    image: "/portrait-silhouette-neon-style-person.jpg",
    bio: "Operations lead ensuring seamless deployment pipelines and continuous system reliability across all client environments.",
  },
]

const EXPERTISE_AREAS = [
  {
    title: "RAG Architectures",
    subtitle: "& data intelligence",
  },
  {
    title: "Multi-Agent Systems",
    subtitle: "& workflow automation",
  },
  {
    title: "Observability & UX",
    subtitle: "for AI systems",
  },
]

export function MeetTheTeam() {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAnimatingIn, setIsAnimatingIn] = useState(false)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  const handleSelectMember = (member: TeamMember) => {
    setSelectedMember(member)
    setIsModalOpen(true)
    setTimeout(() => setIsAnimatingIn(true), 50)
  }

  const handleCloseModal = () => {
    setIsAnimatingIn(false)
    setTimeout(() => {
      setIsModalOpen(false)
      setSelectedMember(null)
    }, 400)
  }

  const handleNavigate = (direction: "prev" | "next") => {
    if (!selectedMember) return
    const currentIndex = TEAM_MEMBERS.findIndex((m) => m.id === selectedMember.id)
    const newIndex =
      direction === "next"
        ? (currentIndex + 1) % TEAM_MEMBERS.length
        : (currentIndex - 1 + TEAM_MEMBERS.length) % TEAM_MEMBERS.length
    setSelectedMember(TEAM_MEMBERS[newIndex])
  }

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCloseModal()
      if (e.key === "ArrowLeft") handleNavigate("prev")
      if (e.key === "ArrowRight") handleNavigate("next")
    }
    if (isModalOpen) {
      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isModalOpen, selectedMember])

  return (
    <section className="relative py-24 px-6 overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(196, 138, 88, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(196, 138, 88, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Floating particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-copper/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-zinc-500 text-xs tracking-[0.3em] uppercase mb-4 block">// MISSION</span>
          <h2 className="text-4xl md:text-5xl font-mono text-white mb-6">
            The Skunkworks <span className="text-orange-500">Unit</span>
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto text-base leading-relaxed">
            A multidisciplinary team of engineers and architects obsessed with velocity. Led by{" "}
            <span className="text-white font-medium">Liam Ellis</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {EXPERTISE_AREAS.map((area, index) => (
            <div
              key={index}
              className="border border-zinc-800 bg-zinc-900/50 p-6 hover:border-zinc-700 transition-colors"
            >
              <h3 className="text-white font-mono text-sm mb-1">{area.title}</h3>
              <p className="text-zinc-500 text-xs">{area.subtitle}</p>
            </div>
          ))}
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {TEAM_MEMBERS.map((member, index) => (
            <button
              key={member.id}
              onClick={() => handleSelectMember(member)}
              onMouseEnter={() => setHoveredId(member.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="group relative cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-copper"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              {/* Card Container */}
              <div className="relative aspect-square overflow-hidden border border-white/10 bg-void/50 backdrop-blur-sm transition-all duration-500 group-hover:border-copper/50 group-hover:shadow-[0_0_30px_rgba(196,138,88,0.2)]">
                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-copper/30 transition-all duration-300 group-hover:w-6 group-hover:h-6 group-hover:border-copper" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-copper/30 transition-all duration-300 group-hover:w-6 group-hover:h-6 group-hover:border-copper" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-copper/30 transition-all duration-300 group-hover:w-6 group-hover:h-6 group-hover:border-copper" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-copper/30 transition-all duration-300 group-hover:w-6 group-hover:h-6 group-hover:border-copper" />

                {/* Image */}
                <div className="absolute inset-4 overflow-hidden">
                  <img
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    className="w-full h-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-110"
                    crossOrigin="anonymous"
                  />
                  {/* Scan Line Effect */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-copper/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-scan" />
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-void via-void/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />

                {/* Click Indicator */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="flex items-center gap-2 text-copper text-xs tracking-wider">
                    <span className="w-2 h-2 border border-copper animate-ping" />
                    <span>CLICK TO VIEW</span>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  <div
                    className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${hoveredId === member.id ? "bg-green-400 animate-pulse" : "bg-copper/50"}`}
                  />
                </div>
              </div>

              {/* Member Info */}
              <div className="mt-4 space-y-1">
                <h3 className="text-white font-mono text-sm tracking-wide group-hover:text-copper transition-colors duration-300">
                  {member.name}
                </h3>
                <p className="text-gray-500 text-xs tracking-wider uppercase">{member.role}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Bottom Tagline */}
        <p className="text-center text-zinc-500 italic text-sm max-w-2xl mx-auto">
          We're an ideas lab with matches <Flame className="inline w-3 h-3 text-orange-500" /> — curious enough to find
          new patterns, disciplined enough to ship reliable infrastructure.
        </p>
      </div>

      {/* Particle Face Modal */}
      {isModalOpen && selectedMember && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-400 ${isAnimatingIn ? "opacity-100" : "opacity-0"}`}
          onClick={handleCloseModal}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-void/95 backdrop-blur-md" />

          {/* Modal Content */}
          <div
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full h-full max-w-5xl max-h-[90vh] mx-4 flex flex-col md:flex-row items-stretch transition-all duration-500 ${isAnimatingIn ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 z-10 p-2 border border-white/20 text-white/70 hover:text-copper hover:border-copper transition-all duration-300 group"
              aria-label="Close"
            >
              <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>

            {/* Navigation Arrows */}
            <button
              onClick={() => handleNavigate("prev")}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 border border-white/20 text-white/70 hover:text-copper hover:border-copper transition-all duration-300"
              aria-label="Previous member"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() => handleNavigate("next")}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 border border-white/20 text-white/70 hover:text-copper hover:border-copper transition-all duration-300"
              aria-label="Next member"
            >
              <ChevronRight size={24} />
            </button>

            {/* Particle Face Display */}
            <div className="flex-1 relative min-h-[50vh] md:min-h-0">
              {/* Decorative Frame */}
              <div className="absolute inset-0 border border-copper/20">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-copper" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-copper" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-copper" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-copper" />
              </div>

              {/* Particle Canvas */}
              <div className="absolute inset-4">
                <ParticleFace key={selectedMember.id} imageSrc={selectedMember.image} />
              </div>

              {/* Scan Lines Overlay */}
              <div
                className="absolute inset-0 pointer-events-none opacity-10"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(196,138,88,0.1) 2px, rgba(196,138,88,0.1) 4px)",
                }}
              />
            </div>

            {/* Info Panel */}
            <div className="w-full md:w-80 p-8 border-t md:border-t-0 md:border-l border-copper/20 flex flex-col justify-center bg-void/50 backdrop-blur-sm">
              <div className="space-y-6">
                {/* Status */}
                <div className="flex items-center gap-2 text-xs text-copper/70 tracking-widest">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span>PARTICLE_RENDER_ACTIVE</span>
                </div>

                {/* Name */}
                <div>
                  <div className="text-gray-500 text-xs tracking-wider mb-1">IDENTITY</div>
                  <h3 className="text-white text-3xl font-mono tracking-wide">{selectedMember.name}</h3>
                </div>

                {/* Role */}
                <div>
                  <div className="text-gray-500 text-xs tracking-wider mb-1">DESIGNATION</div>
                  <p className="text-copper text-sm tracking-wider uppercase">{selectedMember.role}</p>
                </div>

                {/* Bio */}
                <div>
                  <div className="text-gray-500 text-xs tracking-wider mb-1">BIO_DATA</div>
                  <p className="text-gray-400 text-sm leading-relaxed">{selectedMember.bio}</p>
                </div>

                {/* Interaction Hint */}
                <div className="pt-4 border-t border-white/10">
                  <p className="text-gray-600 text-xs tracking-wide">
                    Move mouse over particles to interact. Click for explosion effect.
                  </p>
                </div>

                {/* Navigation Indicator */}
                <div className="flex items-center justify-center gap-2">
                  {TEAM_MEMBERS.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => setSelectedMember(member)}
                      className={`w-2 h-2 transition-all duration-300 ${selectedMember.id === member.id ? "bg-copper w-6" : "bg-white/20 hover:bg-white/40"}`}
                      aria-label={`View ${member.name}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Scan Animation */}
      <style jsx>{`
        @keyframes scan {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100%);
          }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </section>
  )
}
