/**
 * 📱 ShowAt Component
 *
 * Conditionally show content at specific breakpoints
 */

'use client'

import { ReactNode } from 'react'
import { useBreakpointValue } from '@/hooks/use-responsive'

type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

interface ShowAtProps {
  /** Breakpoint at which to show content */
  breakpoint: Breakpoint
  /** Children to render */
  children: ReactNode
  /** Show at breakpoint and above (default: true) */
  andAbove?: boolean
}

/**
 * Show content at specific breakpoint
 *
 * @example
 * <ShowAt breakpoint="md">
 *   <p>Visible on medium screens and up</p>
 * </ShowAt>
 *
 * @example
 * <ShowAt breakpoint="lg" andAbove={false}>
 *   <p>Only visible on large screens</p>
 * </ShowAt>
 */
export function ShowAt({ breakpoint, children, andAbove = true }: ShowAtProps) {
  const isVisible = useBreakpointValue(breakpoint)

  if (andAbove) {
    return isVisible ? <>{children}</> : null
  }

  // TODO: Implement exact breakpoint matching
  return isVisible ? <>{children}</> : null
}
