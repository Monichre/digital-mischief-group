"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { FullscreenMenu } from "./FullscreenMenu"

interface MenuContextValue {
  isOpen: boolean
  isToggleDisabled: boolean
  openMenu: () => void
  closeMenu: () => void
  toggleMenu: () => void
  setToggleDisabled: (disabled: boolean) => void
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
  const [isToggleDisabled, setIsToggleDisabled] = useState(false)

  const setToggleDisabled = useCallback((disabled: boolean) => {
    setIsToggleDisabled(disabled)

    if (disabled) {
      setIsOpen(false)
    }
  }, [])

  const openMenu = useCallback(() => {
    if (isToggleDisabled) return
    setIsOpen(true)
  }, [isToggleDisabled])
  const closeMenu = useCallback(() => setIsOpen(false), [])
  const toggleMenu = useCallback(() => {
    if (isToggleDisabled) return
    setIsOpen(prev => !prev)
  }, [isToggleDisabled])

  return (
    <MenuContext.Provider
      value={{
        isOpen,
        isToggleDisabled,
        openMenu,
        closeMenu,
        toggleMenu,
        setToggleDisabled,
      }}
    >
      {children}
      <FullscreenMenu isOpen={isOpen} onClose={closeMenu} />
    </MenuContext.Provider>
  )
}
