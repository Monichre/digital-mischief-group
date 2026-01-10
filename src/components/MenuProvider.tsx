"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { FullscreenMenu } from "./FullscreenMenu"

interface MenuContextValue {
  isOpen: boolean
  openMenu: () => void
  closeMenu: () => void
  toggleMenu: () => void
}

const MenuContext = createContext<MenuContextValue | null>(null)

export function useMenu() {
  const context = useContext(MenuContext)
  if (!context) {
    throw new Error("useMenu must be used within a MenuProvider")
  }
  return context
}

interface MenuProviderProps {
  children: ReactNode
}

export function MenuProvider({ children }: MenuProviderProps) {
  const [isOpen, setIsOpen] = useState(false)

  const openMenu = useCallback(() => setIsOpen(true), [])
  const closeMenu = useCallback(() => setIsOpen(false), [])
  const toggleMenu = useCallback(() => setIsOpen(prev => !prev), [])

  return (
    <MenuContext.Provider value={{ isOpen, openMenu, closeMenu, toggleMenu }}>
      {children}
      <FullscreenMenu isOpen={isOpen} onClose={closeMenu} />
    </MenuContext.Provider>
  )
}
