"use client"

import type React from "react"
import { SidebarProvider } from "../ui/sidebar"
import { SidebarContextProvider } from "./sidebar-context"

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <SidebarContextProvider>{children}</SidebarContextProvider>
    </SidebarProvider>
  )
}
