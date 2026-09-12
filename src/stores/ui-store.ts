import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

/**
 * UI state interface
 */
interface UIState {
    isSidebarOpen: boolean;
    isMobileMenuOpen: boolean;
    isCommandPaletteOpen: boolean;
    theme: 'light' | 'dark' | 'system';
}

/**
 * UI store actions
 */
interface UIActions {
    toggleSidebar: () => void;
    setSidebarOpen: (isOpen: boolean) => void;
    toggleMobileMenu: () => void;
    setMobileMenuOpen: (isOpen: boolean) => void;
    toggleCommandPalette: () => void;
    setCommandPaletteOpen: (isOpen: boolean) => void;
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

/**
 * Combined UI store type
 */
type UIStore = UIState & UIActions;

/**
 * UI store for managing global UI state
 * 
 * Features:
 * - No persistence (UI state is ephemeral)
 * - DevTools support
 * - Immer for immutable updates
 */
export const useUIStore = create<UIStore>()(
    devtools(
        immer((set) => ({
            // Initial state
            isSidebarOpen: true,
            isMobileMenuOpen: false,
            isCommandPaletteOpen: false,
            theme: 'system',

            // Actions
            toggleSidebar: () =>
                set((state) => {
                    state.isSidebarOpen = !state.isSidebarOpen;
                }),

            setSidebarOpen: (isOpen) =>
                set((state) => {
                    state.isSidebarOpen = isOpen;
                }),

            toggleMobileMenu: () =>
                set((state) => {
                    state.isMobileMenuOpen = !state.isMobileMenuOpen;
                }),

            setMobileMenuOpen: (isOpen) =>
                set((state) => {
                    state.isMobileMenuOpen = isOpen;
                }),

            toggleCommandPalette: () =>
                set((state) => {
                    state.isCommandPaletteOpen = !state.isCommandPaletteOpen;
                }),

            setCommandPaletteOpen: (isOpen) =>
                set((state) => {
                    state.isCommandPaletteOpen = isOpen;
                }),

            setTheme: (theme) =>
                set((state) => {
                    state.theme = theme;
                }),
        })),
        {
            name: 'UIStore',
            enabled: process.env.NODE_ENV === 'development',
        }
    )
);
