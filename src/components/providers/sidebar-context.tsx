"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface SidebarContextType {
  isCollapsed: boolean
  toggleCollapsed: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarContextProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed)
  }

  return <SidebarContext.Provider value={{ isCollapsed, toggleCollapsed }}>{children}</SidebarContext.Provider>
}

export function useSidebarCollapse() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebarCollapse must be used within SidebarContextProvider")
  }
  return context
}
