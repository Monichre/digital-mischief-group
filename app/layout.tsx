import type React from "react"
import type { Metadata } from "next"
import { Share_Tech_Mono, Inter } from "next/font/google"
import "./globals.css"
import { TargetCursor } from "@/components/TargetCursor"
import DynamicIsland from "@/components/DynamicIsland"

const shareTechMono = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-share-tech-mono",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Digital Mischief Group",
  description: "Creative Technology Studio - Experimental interfaces, audio-reactive systems, and digital experiences",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.css"
          integrity="sha384-Xi8rHCmBmhbuyyhbI88391ZKP2dmfnOl4rT9ZfSmPb86w6OPFLyfxpH0ObTYuy7f"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${shareTechMono.variable} ${inter.variable} font-mono antialiased bg-[#050507] text-gray-300 overflow-x-hidden`}
      >
        <TargetCursor targetSelector=".cursor-target, button, a, [role='button']" />
        {children}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <DynamicIsland showControls={true} />
        </div>
      </body>
    </html>
  )
}
