/**
 * 404 Not Found Page
 */

import Link from 'next/link'
import { FileQuestion, Home, Search, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-12 text-center">
          {/* Icon */}
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
            <FileQuestion className="h-12 w-12 text-muted-foreground" />
          </div>

          {/* Title */}
          <h1 className="mb-2 text-6xl font-bold">404</h1>
          <h2 className="mb-4 text-2xl font-semibold">Page Not Found</h2>
          <p className="mb-8 text-muted-foreground">
            Sorry, we couldn't find the page you're looking for. It might have been moved or
            deleted.
          </p>

          {/* Search */}
          <div className="mx-auto mb-8 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search for pages..." className="pl-10" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="javascript:history.back()">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Link>
            </Button>
          </div>

          {/* Helpful Links */}
          <div className="mt-12 border-t pt-8">
            <p className="mb-4 text-sm font-semibold">Helpful Links:</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link href="/dashboard" className="text-primary hover:underline">
                Dashboard
              </Link>
              <Link href="/pages/faq" className="text-primary hover:underline">
                FAQ
              </Link>
              <Link href="/pages/contact" className="text-primary hover:underline">
                Contact Us
              </Link>
              <Link href="/pages/team" className="text-primary hover:underline">
                Our Team
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
