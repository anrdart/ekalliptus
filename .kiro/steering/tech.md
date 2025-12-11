# Technology Stack

## Core Framework

- **Vite 5** - Build tool and dev server
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **React Router 6** - Client-side routing

## Backend & Database

- **Supabase** - PostgreSQL database, Auth, Storage, Realtime
- **Row Level Security (RLS)** - Database authorization
- **Project ID**: muyzxygtlwsfegzyvgcm

## UI & Styling

- **Tailwind CSS** - Utility-first styling
- **Shadcn UI** - Component library (Radix UI primitives)
- **Lucide React** - Icon library
- **CSS Variables** - Theme tokens (HSL color system)
- **Vanta.js** - 3D background effects

## State & Data

- **React Query** - Server state management
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Sonner** - Toast notifications
- **i18next** - Internationalization

## Testing

- **Vitest** - Test runner (globals enabled)
- **fast-check** - Property-based testing

## Build Tools

- **Vite** - Dev server and bundling
- **SWC** - Fast compilation via @vitejs/plugin-react-swc
- **PostCSS** - CSS processing

## Common Commands

```bash
# Development
npm run dev               # Start Vite dev server

# Build & Production
npm run build             # Production build
npm run preview           # Preview production build

# Testing
npm run test              # Run tests (watch mode)
npm run test:run          # Run tests once
npm run test:ui           # Vitest UI
npm run test:coverage     # Run with coverage

# Code Quality
npm run lint              # ESLint
```

## Environment Variables

Required in `.env`:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anon key (public)

## Node Version

Requires Node.js ^20.19.0 or >=22.12.0

## Key Dependencies

- `@supabase/supabase-js` - Supabase client
- `@tanstack/react-query` - Data fetching
- `react-hook-form` + `@hookform/resolvers` - Forms
- `zod` - Validation
- `date-fns` - Date utilities
- `recharts` - Charts
- `react-dropzone` - File uploads
