/**
 * 📱 Responsive Hooks & Components Test Page
 *
 * Test page to demonstrate responsive utilities
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  useBreakpoint,
  useWindowSize,
  useOrientation,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
} from '@/hooks/use-responsive'
import {
  ShowAt,
  HideAt,
  ResponsiveContainer,
  MobileOnly,
  TabletOnly,
  DesktopOnly,
} from '@/components/responsive'
import { Monitor, Smartphone, Tablet, Maximize2, Rotate3d } from 'lucide-react'

export default function ResponsiveTestPage() {
  const breakpoint = useBreakpoint()
  const { width, height } = useWindowSize()
  const orientation = useOrientation()
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  const isDesktop = useIsDesktop()

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">📱 Responsive Utilities</h1>
        <p className="text-muted-foreground">
          Test hooks and components for responsive design
        </p>
      </div>

      {/* Current State */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Current Device State</CardTitle>
          <CardDescription>Real-time responsive information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Breakpoint</p>
              <Badge variant="default" className="text-lg">
                {breakpoint}
              </Badge>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Width</p>
              <Badge variant="outline" className="text-lg">
                {width}px
              </Badge>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Height</p>
              <Badge variant="outline" className="text-lg">
                {height}px
              </Badge>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Orientation</p>
              <Badge variant="secondary" className="text-lg">
                {orientation}
              </Badge>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Device Type</p>
              <Badge variant="default" className="text-lg">
                {isMobile ? '📱 Mobile' : isTablet ? '📋 Tablet' : '🖥️ Desktop'}
              </Badge>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              <span className="text-sm">Is Mobile:</span>
              <Badge variant={isMobile ? 'default' : 'secondary'}>
                {isMobile ? 'Yes' : 'No'}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Tablet className="h-5 w-5" />
              <span className="text-sm">Is Tablet:</span>
              <Badge variant={isTablet ? 'default' : 'secondary'}>
                {isTablet ? 'Yes' : 'No'}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              <span className="text-sm">Is Desktop:</span>
              <Badge variant={isDesktop ? 'default' : 'secondary'}>
                {isDesktop ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device-Specific Components */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Mobile Only
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MobileOnly
              fallback={
                <p className="text-muted-foreground">
                  📵 Not visible on mobile devices
                </p>
              }
            >
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-green-700 dark:text-green-300 font-medium">
                  ✅ Visible on mobile!
                </p>
              </div>
            </MobileOnly>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tablet className="h-5 w-5" />
              Tablet Only
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TabletOnly
              fallback={
                <p className="text-muted-foreground">
                  📵 Not visible on tablet devices
                </p>
              }
            >
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-blue-700 dark:text-blue-300 font-medium">
                  ✅ Visible on tablet!
                </p>
              </div>
            </TabletOnly>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Desktop Only
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DesktopOnly
              fallback={
                <p className="text-muted-foreground">
                  📵 Not visible on desktop devices
                </p>
              }
            >
              <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-purple-700 dark:text-purple-300 font-medium">
                  ✅ Visible on desktop!
                </p>
              </div>
            </DesktopOnly>
          </CardContent>
        </Card>
      </div>

      {/* ShowAt Component */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>ShowAt Component</CardTitle>
          <CardDescription>
            Show content at specific breakpoints and above
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ShowAt breakpoint="sm">
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <Badge variant="outline" className="mb-2">sm+</Badge>
              <p className="text-sm">Visible on small screens and up (≥640px)</p>
            </div>
          </ShowAt>

          <ShowAt breakpoint="md">
            <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Badge variant="outline" className="mb-2">md+</Badge>
              <p className="text-sm">Visible on medium screens and up (≥768px)</p>
            </div>
          </ShowAt>

          <ShowAt breakpoint="lg">
            <div className="p-4 bg-green-100 dark:bg-green-900 rounded-lg">
              <Badge variant="outline" className="mb-2">lg+</Badge>
              <p className="text-sm">Visible on large screens and up (≥1024px)</p>
            </div>
          </ShowAt>

          <ShowAt breakpoint="xl">
            <div className="p-4 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Badge variant="outline" className="mb-2">xl+</Badge>
              <p className="text-sm">Visible on extra large screens and up (≥1280px)</p>
            </div>
          </ShowAt>

          <ShowAt breakpoint="2xl">
            <div className="p-4 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Badge variant="outline" className="mb-2">2xl+</Badge>
              <p className="text-sm">Visible on 2x extra large screens and up (≥1536px)</p>
            </div>
          </ShowAt>
        </CardContent>
      </Card>

      {/* HideAt Component */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>HideAt Component</CardTitle>
          <CardDescription>
            Hide content at specific breakpoints and above
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <HideAt breakpoint="md">
            <div className="p-4 bg-red-100 dark:bg-red-900 rounded-lg">
              <Badge variant="destructive" className="mb-2">Hidden md+</Badge>
              <p className="text-sm">Hidden on medium screens and up (≥768px)</p>
            </div>
          </HideAt>

          <HideAt breakpoint="lg">
            <div className="p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Badge variant="destructive" className="mb-2">Hidden lg+</Badge>
              <p className="text-sm">Hidden on large screens and up (≥1024px)</p>
            </div>
          </HideAt>
        </CardContent>
      </Card>

      {/* Responsive Container */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Maximize2 className="h-5 w-5" />
            Responsive Container
          </CardTitle>
          <CardDescription>
            Container with different padding at each breakpoint
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer
            defaultClassName="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg"
            className={{
              sm: 'p-2',
              md: 'p-4',
              lg: 'p-6',
              xl: 'p-8',
              '2xl': 'p-10',
            }}
          >
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4">
              <p className="font-medium mb-2">Responsive Padding</p>
              <p className="text-sm text-muted-foreground">
                Resize your window to see padding change:
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>• Small (sm): 0.5rem padding</li>
                <li>• Medium (md): 1rem padding</li>
                <li>• Large (lg): 1.5rem padding</li>
                <li>• Extra Large (xl): 2rem padding</li>
                <li>• 2X Large (2xl): 2.5rem padding</li>
              </ul>
            </div>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Orientation Demo */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rotate3d className="h-5 w-5" />
            Orientation Detection
          </CardTitle>
          <CardDescription>
            Rotate your device to see orientation change
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`p-6 rounded-lg ${orientation === 'portrait'
              ? 'bg-blue-100 dark:bg-blue-900'
              : 'bg-orange-100 dark:bg-orange-900'
            }`}>
            <p className="text-2xl font-bold mb-2">
              {orientation === 'portrait' ? '📱 Portrait Mode' : '🖥️ Landscape Mode'}
            </p>
            <p className="text-sm">
              Current: {width}x{height}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>📚 How to Use</CardTitle>
          <CardDescription>
            Import and use responsive hooks and components
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-medium mb-2">Hooks:</p>
            <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
              {`import {
  useBreakpoint,
  useWindowSize,
  useOrientation,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
} from '@/hooks/use-responsive'

const breakpoint = useBreakpoint() // 'sm' | 'md' | 'lg' | 'xl' | '2xl'
const { width, height } = useWindowSize()
const orientation = useOrientation() // 'portrait' | 'landscape'
const isMobile = useIsMobile()
const isTablet = useIsTablet()
const isDesktop = useIsDesktop()`}
            </pre>
          </div>

          <div>
            <p className="font-medium mb-2">Components:</p>
            <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
              {`import {
  ShowAt,
  HideAt,
  ResponsiveContainer,
  MobileOnly,
  TabletOnly,
  DesktopOnly,
} from '@/components/responsive'

<ShowAt breakpoint="md">Show on medium+</ShowAt>
<HideAt breakpoint="lg">Hide on large+</HideAt>
<MobileOnly>Mobile content</MobileOnly>
<DesktopOnly>Desktop content</DesktopOnly>`}
            </pre>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Try resizing browser
            </Button>
            <Button variant="outline" size="sm">
              Open DevTools (F12)
            </Button>
            <Button variant="outline" size="sm">
              Toggle Device Toolbar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
