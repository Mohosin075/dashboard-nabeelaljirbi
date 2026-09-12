/**
 * 🖥️ Desktop Only Component
 *
 * Show content only on desktop devices
 */

'use client'

import { ReactNode } from 'react'
import { useIsDesktop } from '@/hooks/use-responsive'

interface DesktopOnlyProps {
  /** Children to render */
  children: ReactNode
  /** Fallback content for non-desktop */
  fallback?: ReactNode
}

/**
 * Show content only on desktop
 *
 * @example
 * <DesktopOnly>
 *   <nav>Desktop Navigation</nav>
 * </DesktopOnly>
 *
 * @example
 * <DesktopOnly fallback={<div>Mobile View</div>}>
 *   <div>Desktop View</div>
 * </DesktopOnly>
 */
export function DesktopOnly({ children, fallback = null }: DesktopOnlyProps) {
  const isDesktop = useIsDesktop()

  return isDesktop ? <>{children}</> : <>{fallback}</>
}
