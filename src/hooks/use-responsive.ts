/**
 * 📱 Responsive Hooks
 *
 * Custom hooks for responsive design
 */

'use client'

import { useEffect, useState } from 'react'

type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

/**
 * Hook to detect media query match
 * @param query - Media query string
 * @returns boolean indicating if media query matches
 *
 * @example
 * const isMobile = useMediaQuery('(max-width: 768px)')
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)

    // Set initial value
    setMatches(media.matches)

    // Create event listener
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Add listener
    media.addEventListener('change', listener)

    // Cleanup
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}

/**
 * Hook to get current breakpoint
 * @returns current breakpoint name
 *
 * @example
 * const breakpoint = useBreakpoint() // 'sm' | 'md' | 'lg' | 'xl' | '2xl'
 */
export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('sm')

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth

      if (width >= breakpoints['2xl']) {
        setBreakpoint('2xl')
      } else if (width >= breakpoints.xl) {
        setBreakpoint('xl')
      } else if (width >= breakpoints.lg) {
        setBreakpoint('lg')
      } else if (width >= breakpoints.md) {
        setBreakpoint('md')
      } else {
        setBreakpoint('sm')
      }
    }

    // Set initial value
    updateBreakpoint()

    // Add listener
    window.addEventListener('resize', updateBreakpoint)

    // Cleanup
    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])

  return breakpoint
}

/**
 * Hook to check if current breakpoint is above or equal to specified breakpoint
 * @param breakpoint - Breakpoint to check against
 * @returns boolean indicating if current breakpoint >= specified breakpoint
 *
 * @example
 * const isDesktop = useBreakpointValue('lg') // true if >= lg
 */
export function useBreakpointValue(breakpoint: Breakpoint): boolean {
  const currentBreakpoint = useBreakpoint()

  const breakpointOrder: Breakpoint[] = ['sm', 'md', 'lg', 'xl', '2xl']
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint)
  const targetIndex = breakpointOrder.indexOf(breakpoint)

  return currentIndex >= targetIndex
}

/**
 * Hook to check if device is mobile
 * @returns boolean indicating if device is mobile
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 768px)')
}

/**
 * Hook to check if device is tablet
 * @returns boolean indicating if device is tablet
 */
export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 769px) and (max-width: 1024px)')
}

/**
 * Hook to check if device is desktop
 * @returns boolean indicating if device is desktop
 */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1025px)')
}

/**
 * Hook to get window dimensions
 * @returns object with width and height
 */
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    // Set initial size
    handleResize()

    // Add listener
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return windowSize
}

/**
 * Hook for orientation detection
 * @returns 'portrait' | 'landscape'
 */
export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(
        window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      )
    }

    // Set initial orientation
    handleOrientationChange()

    // Add listener
    window.addEventListener('resize', handleOrientationChange)

    // Cleanup
    return () => window.removeEventListener('resize', handleOrientationChange)
  }, [])

  return orientation
}
