'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ReactNode } from 'react';

interface ThemeProviderProps {
    children: ReactNode;
}

/**
 * Theme provider for dark mode support
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="system"
            enableSystem={true}
            storageKey="cadence-theme"
        >
            {children}
        </NextThemesProvider>
    );
}
