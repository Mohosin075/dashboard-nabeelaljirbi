/**
 * 📱 Tablet Only Component
 *
 * Show content only on tablet devices
 */

'use client'

import { ReactNode } from 'react'
import { useIsTablet } from '@/hooks/use-responsive'

interface TabletOnlyProps {
  /** Children to render */
  children: ReactNode
  /** Fallback content for non-tablet */
  fallback?: ReactNode
}

/**
 * Show content only on tablet
 *
 * @example
 * <TabletOnly>
 *   <div>Tablet View</div>
 * </TabletOnly>
 *
 * @example
 * <TabletOnly fallback={<div>Not Tablet</div>}>
 *   <div>Tablet View</div>
 * </TabletOnly>
 */
export function TabletOnly({ children, fallback = null }: TabletOnlyProps) {
  const isTablet = useIsTablet()

  return isTablet ? <>{children}</> : <>{fallback}</>
}
