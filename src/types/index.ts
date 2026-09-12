/**
 * Common TypeScript types and interfaces
 */

/**
 * Make all properties of T optional recursively
 */
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Make all properties of T required recursively
 */
export type DeepRequired<T> = {
    [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * Extract the type of an array element
 */
export type ArrayElement<T> = T extends (infer U)[] ? U : never;

/**
 * Async function return type
 */
export type AsyncReturnType<T extends (...args: unknown[]) => Promise<unknown>> = T extends (
    ...args: unknown[]
) => Promise<infer R>
    ? R
    : never;

/**
 * Make specific properties optional
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specific properties required
 */
export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/**
 * Pagination metadata
 */
export interface PaginationMeta {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
}

/**
 * Paginated API response
 */
export interface PaginatedApiResponse<T> {
    data: T[];
    meta: PaginationMeta;
}

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Filter operator
 */
export type FilterOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'like';

/**
 * Status types
 */
export type Status = 'idle' | 'loading' | 'success' | 'error';

/**
 * Generic error type
 */
export interface AppError {
    message: string;
    code?: string;
    status?: number;
    errors?: Record<string, string[]>;
}

/**
 * File upload type
 */
export interface FileUpload {
    file: File;
    preview?: string;
    progress?: number;
    status?: 'pending' | 'uploading' | 'success' | 'error';
    error?: string;
}
