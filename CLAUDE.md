# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Loadira is a multi-tenant SaaS platform by RWX-TEK INC. Trucking companies sign up, enter their MC number, and receive an auto-generated professional website, carrier profile, and broker packet PDF. The platform pulls carrier data from the FMCSA QCMobile API to populate profiles automatically.

## Tech Stack

- **Frontend:** React + TypeScript, bundled with Vite
- **Styling:** Tailwind CSS (via @tailwindcss/vite plugin)
- **Backend/Auth/DB:** Supabase (PostgreSQL, Auth, Edge Functions, Storage)
- **Payments:** Stripe (subscriptions and billing)
- **External API:** FMCSA QCMobile API (carrier data lookup by MC number)

## Common Commands

```bash
npm install          # Install dependencies
npm run dev          # Start Vite dev server
npm run build        # Production build (runs tsc -b && vite build)
npm run preview      # Preview production build locally
npm run lint         # Run ESLint
```

### Supabase

```bash
npx supabase start        # Start local Supabase instance
npx supabase db reset      # Reset local DB and re-run migrations
npx supabase gen types typescript --local > src/types/supabase.ts  # Regenerate DB types
npx supabase functions serve   # Serve Edge Functions locally
```

## Architecture

### Multi-Tenancy Model

Each trucking company (tenant) is identified by their MC number. Supabase Row-Level Security (RLS) policies enforce tenant isolation. Tenant resolution for public-facing generated websites uses slug-based routing (`/profile/:slug`).

### Key Data Flow

1. **Signup:** User registers via Supabase Auth, enters MC number
2. **FMCSA Lookup:** MC number is sent to the FMCSA QCMobile API to fetch carrier details (legal name, address, fleet size, insurance, safety rating, etc.)
3. **Profile Generation:** Fetched data populates the carrier profile and auto-generates the company website
4. **Broker Packet PDF:** A downloadable broker packet PDF is generated from the carrier profile data
5. **Billing:** Stripe handles subscription management; webhook events sync subscription status back to Supabase

### Supabase Edge Functions

Used for server-side logic that shouldn't run in the browser:
- FMCSA API calls (to protect API keys)
- Stripe webhook handling
- PDF generation for broker packets

### Routing

React Router with these routes:
- `/` — Landing page
- `/signup` — Registration
- `/login` — Authentication
- `/dashboard` — Authenticated carrier dashboard
- `/profile/:slug` — Public carrier profile

### Environment Variables

Required in `.env.local` (never commit — covered by `*.local` in .gitignore):
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anonymous/public key
- `VITE_STRIPE_PUBLISHABLE_KEY` — Stripe publishable key
- `VITE_APP_URL` — Application base URL

## Conventions

- All Supabase database types are generated into `src/types/supabase.ts` — regenerate after any migration
- Use Supabase RLS policies for access control; do not implement authorization checks in application code alone
- Stripe-related secrets must only be used in Supabase Edge Functions, never exposed to the client
- FMCSA API calls go through Edge Functions to keep the API key server-side
- Tailwind is the sole styling approach; avoid inline styles or CSS modules
- Dark theme with `bg-gray-950` base and `orange-500` as the primary accent color
