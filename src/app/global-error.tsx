/**
 * Global Error Page (500)
 */

'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ServerCrash, Home, RefreshCw, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Global Error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardContent className="p-12 text-center">
              {/* Icon */}
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10">
                <ServerCrash className="h-12 w-12 text-destructive" />
              </div>

              {/* Title */}
              <h1 className="mb-2 text-6xl font-bold">500</h1>
              <h2 className="mb-4 text-2xl font-semibold">Server Error</h2>
              <p className="mb-8 text-muted-foreground">
                Oops! Something went wrong on our end. We're working to fix it.
              </p>

              {/* Error Details (Development) */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mx-auto mb-8 max-w-md rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-left">
                  <p className="mb-2 text-sm font-semibold text-destructive">Error Details:</p>
                  <p className="text-sm font-mono">{error.message}</p>
                  {error.digest && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Digest: {error.digest}
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                <Button onClick={reset}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button asChild variant="outline">
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    Go Home
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/pages/contact">
                    <Mail className="mr-2 h-4 w-4" />
                    Contact Support
                  </Link>
                </Button>
              </div>

              {/* Help Text */}
              <p className="mt-8 text-sm text-muted-foreground">
                Error ID: {error.digest || 'N/A'}
                <br />
                If this problem persists, please include this ID when contacting support.
              </p>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  )
}
