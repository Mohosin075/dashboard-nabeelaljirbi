import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  /**
   * Server-side environment variables schema
   */
  server: {
    DATABASE_URL: z.string().url().optional(),
    NEXTAUTH_SECRET: z.string().min(1).optional(),
    NEXTAUTH_URL: z.string().url().optional(),

    // OAuth
    GITHUB_ID: z.string().optional(),
    GITHUB_SECRET: z.string().optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),

    // Email
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.string().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASSWORD: z.string().optional(),
    SMTP_FROM: z.string().email().optional(),

    // External Services
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),

    // Sentry
    SENTRY_DSN: z.string().optional(),
    SENTRY_AUTH_TOKEN: z.string().optional(),

    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  },

  /**
   * Client-side environment variables schema
   * Must be prefixed with NEXT_PUBLIC_
   */
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_API_URL: z.string().url(),
    NEXT_PUBLIC_ENABLE_ANALYTICS: z
      .string()
      .transform((val) => val === 'true')
      .optional(),
    NEXT_PUBLIC_ENABLE_AB_TESTING: z
      .string()
      .transform((val) => val === 'true')
      .optional(),
    NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
    NEXT_PUBLIC_VERCEL_ANALYTICS_ID: z.string().optional(),
    NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().optional(),
  },

  /**
   * Runtime environment variables
   * For environment variables that are available at runtime
   */
  runtimeEnv: {
    // Server
    DATABASE_URL: process.env['DATABASE_URL'],
    NEXTAUTH_SECRET: process.env['NEXTAUTH_SECRET'],
    NEXTAUTH_URL: process.env['NEXTAUTH_URL'],
    GITHUB_ID: process.env['GITHUB_ID'],
    GITHUB_SECRET: process.env['GITHUB_SECRET'],
    GOOGLE_CLIENT_ID: process.env['GOOGLE_CLIENT_ID'],
    GOOGLE_CLIENT_SECRET: process.env['GOOGLE_CLIENT_SECRET'],
    SMTP_HOST: process.env['SMTP_HOST'],
    SMTP_PORT: process.env['SMTP_PORT'],
    SMTP_USER: process.env['SMTP_USER'],
    SMTP_PASSWORD: process.env['SMTP_PASSWORD'],
    SMTP_FROM: process.env['SMTP_FROM'],
    CLOUDINARY_API_KEY: process.env['CLOUDINARY_API_KEY'],
    CLOUDINARY_API_SECRET: process.env['CLOUDINARY_API_SECRET'],
    SENTRY_DSN: process.env['SENTRY_DSN'],
    SENTRY_AUTH_TOKEN: process.env['SENTRY_AUTH_TOKEN'],
    NODE_ENV: process.env['NODE_ENV'],

    // Client
    NEXT_PUBLIC_APP_URL: process.env['NEXT_PUBLIC_APP_URL'],
    NEXT_PUBLIC_API_URL: process.env['NEXT_PUBLIC_API_URL'],
    NEXT_PUBLIC_ENABLE_ANALYTICS: process.env['NEXT_PUBLIC_ENABLE_ANALYTICS'],
    NEXT_PUBLIC_ENABLE_AB_TESTING: process.env['NEXT_PUBLIC_ENABLE_AB_TESTING'],
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env['NEXT_PUBLIC_GA_MEASUREMENT_ID'],
    NEXT_PUBLIC_VERCEL_ANALYTICS_ID: process.env['NEXT_PUBLIC_VERCEL_ANALYTICS_ID'],
    NEXT_PUBLIC_SENTRY_DSN: process.env['NEXT_PUBLIC_SENTRY_DSN'],
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env['NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME'],
  },

  /**
   * Skip validation of environment variables on build
   * Useful for Docker builds where env vars are provided at runtime
   */
  skipValidation: !!process.env['SKIP_ENV_VALIDATION'],

  /**
   * Makes it so that empty strings are treated as undefined.
   * Required for transforming env vars to booleans
   */
  emptyStringAsUndefined: true,
});
