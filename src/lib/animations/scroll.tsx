/**
 * 🎬 Scroll Animations
 *
 * Animations triggered by scroll position
 */

'use client'

import { motion, useInView } from 'framer-motion'
import { ReactNode, useRef } from 'react'
import {
  fadeInUp,
  fadeInLeft,
  fadeInRight,
  scaleIn,
} from './presets'

interface ScrollAnimationProps {
  children: ReactNode
  className?: string
  delay?: number
  once?: boolean
}

/**
 * Fade In Up on Scroll
 */
export function ScrollFadeInUp({
  children,
  className,
  delay = 0,
  once = true
}: ScrollAnimationProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, margin: '-100px' })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={fadeInUp}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Fade In Left on Scroll
 */
export function ScrollFadeInLeft({
  children,
  className,
  delay = 0,
  once = true
}: ScrollAnimationProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, margin: '-100px' })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={fadeInLeft}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Fade In Right on Scroll
 */
export function ScrollFadeInRight({
  children,
  className,
  delay = 0,
  once = true
}: ScrollAnimationProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, margin: '-100px' })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={fadeInRight}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Scale In on Scroll
 */
export function ScrollScaleIn({
  children,
  className,
  delay = 0,
  once = true
}: ScrollAnimationProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, margin: '-100px' })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={scaleIn}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Stagger Children on Scroll
 */
export function ScrollStagger({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Reveal on Scroll (no initial hide)
 */
export function ScrollReveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? 'none' : 'translateY(20px)',
        transition: 'all 0.6s cubic-bezier(0.17, 0.55, 0.55, 1)',
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
