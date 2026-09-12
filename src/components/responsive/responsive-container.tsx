/**
 * 📱 Responsive Container
 *
 * Container that applies different styles based on breakpoints
 */

'use client'

import { ReactNode } from 'react'
import { useBreakpoint } from '@/hooks/use-responsive'
import { cn } from '@/lib/utils'

type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

interface ResponsiveContainerProps {
  /** Children to render */
  children: ReactNode
  /** Class name for each breakpoint */
  className?: Partial<Record<Breakpoint, string>>
  /** Default class name */
  defaultClassName?: string
}

/**
 * Container with breakpoint-specific styling
 *
 * @example
 * <ResponsiveContainer
 *   defaultClassName="p-4"
 *   className={{
 *     sm: "p-4",
 *     md: "p-6",
 *     lg: "p-8",
 *     xl: "p-10"
 *   }}
 * >
 *   <div>Content with responsive padding</div>
 * </ResponsiveContainer>
 */
export function ResponsiveContainer({
  children,
  className = {},
  defaultClassName = '',
}: ResponsiveContainerProps) {
  const breakpoint = useBreakpoint()

  // Get the appropriate class name for current breakpoint
  const breakpointClassName = className[breakpoint] || defaultClassName

  return (
    <div className={cn(defaultClassName, breakpointClassName)}>
      {children}
    </div>
  )
}
