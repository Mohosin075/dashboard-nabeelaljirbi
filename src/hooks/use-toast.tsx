'use client';

import { AlertTriangle, CheckCircle2, Info, Loader2, XCircle } from 'lucide-react';
import * as React from 'react';


const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 20;

type ToasterToast = any & {
    id: string;
    title?: React.ReactNode;
    description?: React.ReactNode;
    action?: any;
};

const actionTypes = {
    ADD_TOAST: 'ADD_TOAST',
    UPDATE_TOAST: 'UPDATE_TOAST',
    DISMISS_TOAST: 'DISMISS_TOAST',
    REMOVE_TOAST: 'REMOVE_TOAST',
} as const;

let count = 0;

function genId() {
    count = (count + 1) % Number.MAX_SAFE_INTEGER;
    return count.toString();
}

type ActionType = typeof actionTypes;

type Action =
    | {
        type: ActionType['ADD_TOAST'];
        toast: ToasterToast;
    }
    | {
        type: ActionType['UPDATE_TOAST'];
        toast: Partial<ToasterToast>;
    }
    | {
        type: ActionType['DISMISS_TOAST'];
        toastId?: ToasterToast['id'];
    }
    | {
        type: ActionType['REMOVE_TOAST'];
        toastId?: ToasterToast['id'];
    };

interface State {
    toasts: ToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: string) => {
    if (toastTimeouts.has(toastId)) {
        return;
    }

    const timeout = setTimeout(() => {
        toastTimeouts.delete(toastId);
        dispatch({
            type: 'REMOVE_TOAST',
            toastId: toastId,
        });
    }, TOAST_REMOVE_DELAY);

    toastTimeouts.set(toastId, timeout);
};

export const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'ADD_TOAST':
            return {
                ...state,
                toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
            };

        case 'UPDATE_TOAST':
            return {
                ...state,
                toasts: state.toasts.map((t) =>
                    t.id === (action.toast as any).id ? { ...t, ...action.toast } : t
                ),
            };

        case 'DISMISS_TOAST': {
            const { toastId } = action;

            if (toastId) {
                addToRemoveQueue(toastId);
            } else {
                state.toasts.forEach((toast) => {
                    addToRemoveQueue(toast.id);
                });
            }

            return {
                ...state,
                toasts: state.toasts.map((t) =>
                    t.id === toastId || toastId === undefined
                        ? {
                            ...t,
                            open: false,
                        }
                        : t
                ),
            };
        }
        case 'REMOVE_TOAST':
            if (action.toastId === undefined) {
                return {
                    ...state,
                    toasts: [],
                };
            }
            return {
                ...state,
                toasts: state.toasts.filter((t) => t.id !== action.toastId),
            };
    }
};

const listeners: Array<(state: State) => void> = [];

let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
    memoryState = reducer(memoryState, action);
    listeners.forEach((listener) => {
        listener(memoryState);
    });
}

type Toast = Omit<ToasterToast, 'id'>;

function toast({ ...props }: Toast) {
    const id = genId();

    const update = (props: ToasterToast) =>
        dispatch({
            type: 'UPDATE_TOAST',
            toast: { ...props, id },
        });
    const dismiss = () => dispatch({ type: 'DISMISS_TOAST', toastId: id });

    dispatch({
        type: 'ADD_TOAST',
        toast: {
            ...props,
            id,
            open: true,
            onOpenChange: (open: boolean) => {
                if (!open) dismiss();
            },
        },
    });

    return {
        id: id,
        dismiss,
        update,
    };
}

// Helper toast functions for different variants
function toastSuccess({ title, description, ...props }: Omit<Toast, 'variant' | 'title'> & { title?: string | React.ReactNode }) {
    return toast({
        variant: 'success',
        title: (
            <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5" />
                <span>{title || 'Success'}</span>
            </div>
        ) as any,
        description,
        ...props,
    });
}

function toastError({ title, description, ...props }: Omit<Toast, 'variant' | 'title'> & { title?: string | React.ReactNode }) {
    return toast({
        variant: 'error',
        title: (
            <div className="flex items-center gap-2">
                <XCircle className="size-5" />
                <span>{title || 'Error'}</span>
            </div>
        ) as any,
        description,
        ...props,
    });
}

function toastWarning({ title, description, ...props }: Omit<Toast, 'variant' | 'title'> & { title?: string | React.ReactNode }) {
    return toast({
        variant: 'warning',
        title: (
            <div className="flex items-center gap-2">
                <AlertTriangle className="size-5" />
                <span>{title || 'Warning'}</span>
            </div>
        ) as any,
        description,
        ...props,
    });
}

function toastInfo({ title, description, ...props }: Omit<Toast, 'variant' | 'title'> & { title?: string | React.ReactNode }) {
    return toast({
        variant: 'info',
        title: (
            <div className="flex items-center gap-2">
                <Info className="size-5" />
                <span>{title || 'Info'}</span>
            </div>
        ) as any,
        description,
        ...props,
    });
}

function toastLoading({ title, description, ...props }: Omit<Toast, 'variant' | 'title'> & { title?: string | React.ReactNode }) {
    return toast({
        variant: 'loading',
        title: (
            <div className="flex items-center gap-2">
                <Loader2 className="size-5 animate-spin" />
                <span>{title || 'Loading...'}</span>
            </div>
        ) as any,
        description,
        ...props,
    });
}

function toastPromise<T>(
    promise: Promise<T>,
    {
        loading,
        success,
        error,
    }: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: unknown) => string);
    }
) {
    const toastId = toastLoading({ description: loading });

    promise
        .then((data) => {
            const message = typeof success === 'function' ? success(data) : success;
            toastId.update({
                id: toastId.id,
                variant: 'success',
                title: (
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="size-5" />
                        <span>Success</span>
                    </div>
                ) as any,
                description: message,
            });
        })
        .catch((err) => {
            const message = typeof error === 'function' ? error(err) : error;
            toastId.update({
                id: toastId.id,
                variant: 'error',
                title: (
                    <div className="flex items-center gap-2">
                        <XCircle className="size-5" />
                        <span>Error</span>
                    </div>
                ) as any,
                description: message,
            });
        });

    return toastId;
}

function useToast() {
    const [state, setState] = React.useState<State>(memoryState);

    React.useEffect(() => {
        listeners.push(setState);
        return () => {
            const index = listeners.indexOf(setState);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        };
    }, [state]);

    return {
        ...state,
        toast,
        toastSuccess,
        toastError,
        toastWarning,
        toastInfo,
        toastLoading,
        toastPromise,
        dismiss: (toastId?: string) => {
            if (toastId !== undefined) {
                dispatch({ type: 'DISMISS_TOAST', toastId });
            } else {
                dispatch({ type: 'DISMISS_TOAST' });
            }
        },
    };
} export { toast, toastError, toastInfo, toastLoading, toastPromise, toastSuccess, toastWarning, useToast };

