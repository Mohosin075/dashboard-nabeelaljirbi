'use client';

import {
    Toast,
    ToastClose,
    ToastDescription,
    ToastProvider,
    ToastTitle,
    ToastViewport,
} from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/language-context';

export function Toaster() {
    const { toasts } = useToast();
    const { tr, dir } = useLanguage();

    // Translate plain-string titles/descriptions; leave React nodes untouched
    const localize = (value: unknown) => (typeof value === 'string' ? tr(value) : value);

    return (
        <ToastProvider>
            {toasts.map(function ({ id, title, description, action, ...props }) {
                return (
                    <Toast key={id} {...props} dir={dir}>
                        <div className="grid gap-1 text-start">
                            {title && <ToastTitle>{localize(title) as React.ReactNode}</ToastTitle>}
                            {description && (
                                <ToastDescription>{localize(description) as React.ReactNode}</ToastDescription>
                            )}
                        </div>
                        {action}
                        <ToastClose />
                    </Toast>
                );
            })}
            <ToastViewport />
        </ToastProvider>
    );
}
