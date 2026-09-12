# Frontend Starter Pack

A clean and modern Next.js starter template for building frontend applications.

## 🚀 Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful UI components
- **React Hook Form + Zod** - Form management and validation
- **TanStack Query** - Server state management
- **Zustand** - Client state management
- **Framer Motion** - Animation library

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (admin-dashboard)/  # Admin dashboard pages
│   ├── (landing)/          # Landing pages
│   └── api/                # API routes (NextAuth)
├── components/             # React components
│   ├── ui/                 # shadcn/ui components
│   ├── forms/              # Form components
│   └── shared/             # Shared components
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities and helpers
├── services/               # API service layer
├── stores/                 # Zustand stores
├── types/                  # TypeScript types
└── styles/                 # Global styles
```

## 🎯 Features

### Admin Dashboard

- Sidebar navigation with collapse functionality
- Topbar with greeting and notifications
- Responsive layout

### Landing Pages

- Clean navbar with mobile menu
- Responsive design

### UI Components

- 30+ pre-built shadcn/ui components
- Form components with validation
- Loading skeletons
- Animation utilities

## 🛠️ Getting Started

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

Copy `.env.example` to `.env.local` and update the values:

```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

## 📝 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run type-check   # Run TypeScript compiler check
npm run format       # Format code with Prettier
```

## 🔗 Routes

- `/` - Landing page
- `/dashboard` - Admin dashboard

## 📦 Key Dependencies

- `next` - Next.js framework
- `react` - React library
- `typescript` - Type safety
- `tailwindcss` - Styling
- `@tanstack/react-query` - Data fetching
- `zustand` - State management
- `react-hook-form` - Form handling
- `zod` - Schema validation
- `framer-motion` - Animations
- `axios` - HTTP client
- `next-auth` - Authentication

## 🎨 Customization

### Styling

- Modify `tailwind.config.ts` for theme customization
- Edit `src/styles/globals.css` for global styles

### Components

- All UI components are in `src/components/ui`
- Customize as needed for your project

## 🚀 Deployment

### Build

```bash
npm run build
```

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## 📄 License

MIT

---

Built with Next.js 15, TypeScript, and Tailwind CSS
