import { LoadingProvider } from '@/contexts/loading-context';
import { AppProviders } from '@/lib/providers';
import '@/styles/globals.css';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import { JetBrains_Mono, Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Salama Dashboard',
    template: '%s | Salama Dashboard',
  },
  description: 'Clinic management dashboard for Salama platform',
  keywords: ['Clinic', 'Healthcare', 'Management', 'Salama', 'Dashboard'],
  authors: [{ name: 'Salama Team' }],
  creator: 'Salama Team',
  metadataBase: new URL(process.env['NEXT_PUBLIC_APP_URL'] || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: './',
    title: 'Salama Dashboard',
    description: 'Clinic management dashboard for Salama platform',
    siteName: 'Salama Dashboard',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Salama Dashboard',
    description: 'Clinic management dashboard for Salama platform',
    creator: '@salama',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${jetbrainsMono.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <LoadingProvider>
          <AppProviders>{children}</AppProviders>
        </LoadingProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
