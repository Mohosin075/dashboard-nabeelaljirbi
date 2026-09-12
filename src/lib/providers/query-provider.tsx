'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';

/**
 * Default query client configuration
 * Optimized for production use with:
 * - Auto retry on failure
 * - Stale-while-revalidate
 * - Request deduplication
 * - Smart caching
 */
export function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // Stale time: Data is considered fresh for 60 seconds
                // This implements stale-while-revalidate behavior
                staleTime: 60 * 1000,

                // Cache time: Unused data stays in cache for 5 minutes
                gcTime: 5 * 60 * 1000,

                // Retry configuration with exponential backoff
                retry: (failureCount, error) => {
                    // Don't retry on 4xx errors (client errors)
                    if (error instanceof Error && 'status' in error) {
                        const status = (error as { status?: number }).status;
                        if (status && status >= 400 && status < 500) {
                            return false;
                        }
                    }

                    // Retry up to 3 times for other errors
                    return failureCount < 3;
                },
                retryDelay: (attemptIndex) => {
                    // Exponential backoff: 1s, 2s, 4s
                    return Math.min(1000 * 2 ** attemptIndex, 30000);
                },

                // Refetch on window focus for fresh data
                refetchOnWindowFocus: true,

                // Refetch on reconnect
                refetchOnReconnect: true,

                // Don't refetch on mount if data is fresh
                refetchOnMount: true,

                // Network mode for better offline support
                networkMode: 'online',
            },
            mutations: {
                // Retry mutations once on failure
                retry: 1,

                // Network mode for mutations
                networkMode: 'online',

                // Global error handling for mutations
                onError: (error) => {
                    console.error('Mutation error:', error);
                },
            },
        },
    });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
    if (typeof window === 'undefined') {
        // Server: always make a new query client
        return makeQueryClient();
    } else {
        // Browser: use singleton pattern to keep the same query client
        if (!browserQueryClient) {
            browserQueryClient = makeQueryClient();
        }
        return browserQueryClient;
    }
}

interface QueryProviderProps {
    children: ReactNode;
}

/**
 * TanStack Query Provider with optimized configuration
 * Implements all production best practices:
 * - Auto retry with exponential backoff
 * - Stale-while-revalidate
 * - Request deduplication (automatic)
 * - Smart caching
 * - DevTools in development
 */
export function QueryProvider({ children }: QueryProviderProps) {
    // NOTE: Avoid useState when initializing the query client if you don't
    // have a suspense boundary between this and the code that may
    // suspend because React will throw away the client on the initial
    // render if it suspends and there is no boundary
    const [queryClient] = useState(() => getQueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {process.env.NODE_ENV === 'development' && (
                <ReactQueryDevtools
                    initialIsOpen={false}
                    buttonPosition="bottom-right"
                />
            )}
        </QueryClientProvider>
    );
}

/**
 * Prefetch helper for server components
 */
export { getQueryClient };
