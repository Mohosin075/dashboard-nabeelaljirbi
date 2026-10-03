'use client';

import { AuthProvider } from '@/components/providers/auth-provider';
import { Toaster } from '@/components/ui/toaster';
import { LanguageProvider } from '@/contexts/language-context';
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
        <LanguageProvider>
            <QueryProvider>
                <AuthProvider>
                    {children}
                    <Toaster />
                    {/* <SonnerToaster /> */}
                </AuthProvider>
            </QueryProvider>
        </LanguageProvider>
    );
}
