/**
 * 📱 HideAt Component
 *
 * Conditionally hide content at specific breakpoints
 */

'use client'

import { ReactNode } from 'react'
import { useBreakpointValue } from '@/hooks/use-responsive'

type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

interface HideAtProps {
  /** Breakpoint at which to hide content */
  breakpoint: Breakpoint
  /** Hide at breakpoint and above (default: true) */
  andAbove?: boolean
  /** Children to render */
  children: ReactNode
}

/**
 * Hide content at specific breakpoint
 *
 * @example
 * <HideAt breakpoint="md">
 *   <p>Hidden on medium screens and up</p>
 * </HideAt>
 *
 * @example
 * <HideAt breakpoint="sm" andAbove={false}>
 *   <p>Only hidden on small screens</p>
 * </HideAt>
 */
export function HideAt({ breakpoint, children, andAbove = true }: HideAtProps) {
  const isAtBreakpoint = useBreakpointValue(breakpoint)

  if (andAbove) {
    return !isAtBreakpoint ? <>{children}</> : null
  }

  // TODO: Implement exact breakpoint matching
  return !isAtBreakpoint ? <>{children}</> : null
}
