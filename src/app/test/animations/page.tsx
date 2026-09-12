/**
 * ✨ Animation Utilities Test Page
 *
 * Test page to demonstrate all animation features
 */

'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  FadeIn,
  FadeInUp,
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  ScaleIn,
  SlideInFromBottom,
  StaggerContainer,
  StaggerItem,
} from '@/lib/animations/components'
import {
  ScrollFadeInUp,
  ScrollFadeInLeft,
  ScrollFadeInRight,
  ScrollScaleIn,
  ScrollStagger,
  ScrollReveal,
} from '@/lib/animations/scroll'
import {
  CardSkeleton,
  ListItemSkeleton,
  AvatarSkeleton,
  TextSkeleton,
  ImageSkeleton,
  DashboardCardSkeleton,
  FormFieldSkeleton,
  ButtonSkeleton,
  ChartSkeleton,
} from '@/components/ui/skeleton'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Zap,
  RotateCcw,
  ArrowDown,
  Loader2,
} from 'lucide-react'

export default function AnimationsTestPage() {
  const [showLoading, setShowLoading] = useState(false)
  const [key, setKey] = useState(0)

  const handleReplay = () => {
    setKey(prev => prev + 1)
  }

  const toggleLoading = () => {
    setShowLoading(!showLoading)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <FadeIn>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-yellow-500" />
              Animation Utilities
            </h1>
            <p className="text-muted-foreground">
              Framer Motion animations, transitions, and loading skeletons
            </p>
          </FadeIn>
        </div>

        {/* Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Animation Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button onClick={handleReplay} variant="default">
              <RotateCcw className="h-4 w-4 mr-2" />
              Replay Animations
            </Button>
            <Button onClick={toggleLoading} variant="outline">
              <Loader2 className="h-4 w-4 mr-2" />
              Toggle Loading States
            </Button>
          </CardContent>
        </Card>

        {/* Basic Animations */}
        <div key={key} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Basic Entrance Animations</CardTitle>
              <CardDescription>
                Fade, slide, and scale animations on mount
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FadeIn delay={0.1}>
                  <div className="p-6 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Badge className="mb-2">FadeIn</Badge>
                    <p className="text-sm">Simple fade in animation</p>
                  </div>
                </FadeIn>

                <FadeInUp delay={0.2}>
                  <div className="p-6 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Badge className="mb-2">FadeInUp</Badge>
                    <p className="text-sm">Fade in from bottom</p>
                  </div>
                </FadeInUp>

                <FadeInDown delay={0.3}>
                  <div className="p-6 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Badge className="mb-2">FadeInDown</Badge>
                    <p className="text-sm">Fade in from top</p>
                  </div>
                </FadeInDown>

                <FadeInLeft delay={0.4}>
                  <div className="p-6 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <Badge className="mb-2">FadeInLeft</Badge>
                    <p className="text-sm">Slide in from left</p>
                  </div>
                </FadeInLeft>

                <FadeInRight delay={0.5}>
                  <div className="p-6 bg-pink-100 dark:bg-pink-900 rounded-lg">
                    <Badge className="mb-2">FadeInRight</Badge>
                    <p className="text-sm">Slide in from right</p>
                  </div>
                </FadeInRight>

                <ScaleIn delay={0.6}>
                  <div className="p-6 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                    <Badge className="mb-2">ScaleIn</Badge>
                    <p className="text-sm">Scale up animation</p>
                  </div>
                </ScaleIn>
              </div>
            </CardContent>
          </Card>

          {/* Stagger Animation */}
          <Card>
            <CardHeader>
              <CardTitle>Stagger Animation</CardTitle>
              <CardDescription>
                Sequential animation of multiple items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StaggerContainer>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                    <StaggerItem key={item}>
                      <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-lg text-center font-semibold">
                        Item {item}
                      </div>
                    </StaggerItem>
                  ))}
                </div>
              </StaggerContainer>
            </CardContent>
          </Card>

          {/* Hover & Tap Animations */}
          <Card>
            <CardHeader>
              <CardTitle>Interactive Animations</CardTitle>
              <CardDescription>
                Hover and tap animations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-6 bg-blue-500 text-white rounded-lg cursor-pointer text-center"
                >
                  <p className="font-semibold">Hover & Click Me</p>
                  <p className="text-sm opacity-90">Scale Animation</p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-6 bg-green-500 text-white rounded-lg cursor-pointer text-center"
                >
                  <p className="font-semibold">Hover & Click Me</p>
                  <p className="text-sm opacity-90">Lift Animation</p>
                </motion.div>

                <motion.div
                  whileHover={{ rotate: 5 }}
                  whileTap={{ rotate: -5 }}
                  className="p-6 bg-purple-500 text-white rounded-lg cursor-pointer text-center"
                >
                  <p className="font-semibold">Hover & Click Me</p>
                  <p className="text-sm opacity-90">Rotate Animation</p>
                </motion.div>
              </div>
            </CardContent>
          </Card>

          {/* Slide In Animation */}
          <Card>
            <CardHeader>
              <CardTitle>Slide In Animation</CardTitle>
              <CardDescription>
                Spring-based slide animation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SlideInFromBottom delay={0.2}>
                <div className="p-8 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg">
                  <h3 className="text-2xl font-bold mb-2">Sliding Panel</h3>
                  <p>This panel slides in from the bottom with spring physics</p>
                </div>
              </SlideInFromBottom>
            </CardContent>
          </Card>
        </div>

        {/* Scroll Animations Section */}
        <div className="mt-16 mb-8">
          <FadeIn>
            <div className="flex items-center gap-2 mb-4">
              <ArrowDown className="h-6 w-6" />
              <h2 className="text-3xl font-bold">Scroll Animations</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Scroll down to see animations triggered by scroll position
            </p>
          </FadeIn>
        </div>

        {/* Spacer for scroll */}
        <div className="h-32"></div>

        {/* Scroll Triggered Animations */}
        <div className="space-y-16">
          <ScrollFadeInUp>
            <Card>
              <CardHeader>
                <CardTitle>Scroll Fade In Up</CardTitle>
                <CardDescription>Animates when scrolled into view</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This card fades in and moves up when you scroll to it.
                </p>
              </CardContent>
            </Card>
          </ScrollFadeInUp>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ScrollFadeInLeft>
              <Card>
                <CardHeader>
                  <CardTitle>From Left</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Slides in from the left side
                  </p>
                </CardContent>
              </Card>
            </ScrollFadeInLeft>

            <ScrollFadeInRight>
              <Card>
                <CardHeader>
                  <CardTitle>From Right</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Slides in from the right side
                  </p>
                </CardContent>
              </Card>
            </ScrollFadeInRight>
          </div>

          <ScrollScaleIn>
            <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white">
              <CardHeader>
                <CardTitle>Scale In on Scroll</CardTitle>
              </CardHeader>
              <CardContent>
                <p>This card scales in when scrolled into view</p>
              </CardContent>
            </Card>
          </ScrollScaleIn>

          <ScrollStagger>
            <Card>
              <CardHeader>
                <CardTitle>Scroll Stagger</CardTitle>
                <CardDescription>Children animate sequentially</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                    <motion.div
                      key={item}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 },
                      }}
                      className="p-4 bg-indigo-100 dark:bg-indigo-900 rounded-lg text-center font-semibold"
                    >
                      {item}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </ScrollStagger>

          <ScrollReveal>
            <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white">
              <CardHeader>
                <CardTitle>Smooth Reveal</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Simple CSS-based reveal animation on scroll</p>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>

        {/* Loading Skeletons */}
        <div className="mt-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Loader2 className="h-5 w-5" />
                Loading Skeletons
              </CardTitle>
              <CardDescription>
                Shimmer loading placeholders for content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* Card Skeleton */}
                <div>
                  <h3 className="font-semibold mb-4">Card Skeleton</h3>
                  {showLoading ? (
                    <CardSkeleton />
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle>Loaded Card</CardTitle>
                        <CardDescription>This is the actual content</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p>Content has finished loading</p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* List Skeletons */}
                <div>
                  <h3 className="font-semibold mb-4">List Item Skeletons</h3>
                  <div className="space-y-2 border rounded-lg">
                    {showLoading ? (
                      <>
                        <ListItemSkeleton />
                        <ListItemSkeleton />
                        <ListItemSkeleton />
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-4 p-4">
                          <div className="h-12 w-12 rounded-full bg-blue-500" />
                          <div>
                            <p className="font-medium">John Doe</p>
                            <p className="text-sm text-muted-foreground">john@example.com</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 p-4">
                          <div className="h-12 w-12 rounded-full bg-green-500" />
                          <div>
                            <p className="font-medium">Jane Smith</p>
                            <p className="text-sm text-muted-foreground">jane@example.com</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Various Skeletons */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Avatar</h3>
                    {showLoading ? (
                      <AvatarSkeleton size="lg" />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-500" />
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Text</h3>
                    {showLoading ? (
                      <TextSkeleton lines={3} />
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm">Line 1 of text</p>
                        <p className="text-sm">Line 2 of text</p>
                        <p className="text-sm">Line 3 of text</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Form Field</h3>
                    {showLoading ? (
                      <FormFieldSkeleton />
                    ) : (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <input
                          type="email"
                          className="w-full h-10 px-3 border rounded-md"
                          placeholder="email@example.com"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Button</h3>
                    {showLoading ? (
                      <ButtonSkeleton />
                    ) : (
                      <Button>Click Me</Button>
                    )}
                  </div>
                </div>

                {/* Dashboard & Chart Skeletons */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Dashboard Card</h3>
                    {showLoading ? (
                      <DashboardCardSkeleton />
                    ) : (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            Revenue
                            <span className="text-2xl">📊</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-3xl font-bold">$12,345</p>
                          <p className="text-sm text-muted-foreground">+12.5% from last month</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Chart</h3>
                    {showLoading ? (
                      <ChartSkeleton />
                    ) : (
                      <Card>
                        <CardHeader>
                          <CardTitle>Analytics</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-64 flex items-end gap-2">
                            {[60, 80, 45, 90, 70, 85, 65].map((height, i) => (
                              <div
                                key={i}
                                className="flex-1 bg-blue-500 rounded-t"
                                style={{ height: `${height}%` }}
                              />
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Image</h3>
                  {showLoading ? (
                    <ImageSkeleton aspectRatio="video" />
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-2xl">
                      Image Loaded
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage Guide */}
        <div className="mt-16">
          <ScrollFadeInUp>
            <Card>
              <CardHeader>
                <CardTitle>📚 Usage Guide</CardTitle>
                <CardDescription>How to use animation utilities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium mb-2">Import Animations:</p>
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                    {`import {
  FadeIn, FadeInUp, ScaleIn,
  StaggerContainer, StaggerItem
} from '@/lib/animations/components'

import {
  ScrollFadeInUp,
  ScrollReveal
} from '@/lib/animations/scroll'

import { CardSkeleton } from '@/components/ui/skeleton'`}
                  </pre>
                </div>

                <div>
                  <p className="font-medium mb-2">Use Components:</p>
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                    {`<FadeInUp delay={0.2}>
  <Card>Your content</Card>
</FadeInUp>

<ScrollFadeInUp>
  <div>Animates on scroll</div>
</ScrollFadeInUp>

{loading && <CardSkeleton />}`}
                  </pre>
                </div>

                <div>
                  <p className="font-medium mb-2">Direct Framer Motion:</p>
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                    {`import { motion } from 'framer-motion'

<motion.div
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Hover me!
</motion.div>`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </ScrollFadeInUp>
        </div>

        {/* End spacer */}
        <div className="h-32"></div>
      </div>
    </div>
  )
}
