import { env } from '@/env';
import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';

/**
 * NextAuth configuration
 * Implements JWT strategy with multiple auth providers
 */
export const authOptions: NextAuthOptions = {
  providers: [
    // GitHub OAuth Provider
    ...(env.GITHUB_ID && env.GITHUB_SECRET
      ? [
          GithubProvider({
            clientId: env.GITHUB_ID,
            clientSecret: env.GITHUB_SECRET,
          }),
        ]
      : []),

    // Google OAuth Provider
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),

    // Credentials Provider for email/password
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'user@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      authorize(credentials) {
        // Replace with your own logic
        // This is just a demo - in production, validate against your database
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Demo: Accept any email/password for development
        // TODO: Replace with real authentication
        const user = {
          id: '1',
          name: 'Demo User',
          email: credentials.email,
          role: 'user' as const,
        };

        return user;
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify',
    newUser: '/dashboard',
  },

  callbacks: {
    jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          role: user.role ?? 'user',
        };
      }

      return token;
    },

    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role as 'user' | 'admin';
      }

      return session;
    },

    redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;

      return baseUrl;
    },
  },

  events: {
    signIn(message) {
      console.log('User signed in:', message.user.email);
    },
    signOut() {
      console.log('User signed out');
    },
  },
  debug: process.env.NODE_ENV === 'development',
  secret: env.NEXTAUTH_SECRET || 'fallback-secret-key',
};
