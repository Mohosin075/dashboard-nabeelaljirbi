'use client';

import { AuthProvider } from '@/components/providers/auth-provider';
import { Toaster } from '@/components/ui/toaster';
import { type ReactNode } from 'react';
// import { Toaster } from 'sonner';
import { QueryProvider } from './query-provider';

interface AppProvidersProps {
    children: ReactNode;
}

/**
 * Combined app providers
 * Wraps the app with all necessary context providers
 */
export function AppProviders({ children }: AppProvidersProps) {
    return (
        <>
            {/* <ThemeProvider> */}
            <QueryProvider>
                <AuthProvider>
                    {children}
                    <Toaster />
                    {/* <SonnerToaster /> */}
                </AuthProvider>
            </QueryProvider>
            {/* </ThemeProvider> */}
        </>
    );
}
