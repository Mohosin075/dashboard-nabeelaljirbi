/**
 * 📱 Mobile Only Component
 *
 * Show content only on mobile devices
 */

'use client'

import { ReactNode } from 'react'
import { useIsMobile } from '@/hooks/use-responsive'

interface MobileOnlyProps {
  /** Children to render */
  children: ReactNode
  /** Fallback content for non-mobile */
  fallback?: ReactNode
}

/**
 * Show content only on mobile
 *
 * @example
 * <MobileOnly>
 *   <button>Mobile Menu</button>
 * </MobileOnly>
 *
 * @example
 * <MobileOnly fallback={<div>Desktop View</div>}>
 *   <div>Mobile View</div>
 * </MobileOnly>
 */
export function MobileOnly({ children, fallback = null }: MobileOnlyProps) {
  const isMobile = useIsMobile()

  return isMobile ? <>{children}</> : <>{fallback}</>
}
