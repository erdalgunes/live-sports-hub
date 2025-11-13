# Live Sports Hub ⚽

Real-time soccer scores, fixtures, and league standings - POC

## 🚀 Tech Stack

- **Framework:** Next.js 16 (App Router, RSC)
- **Language:** TypeScript (strict mode)
- **Runtime:** React 19
- **Package Manager:** pnpm
- **Styling:** Tailwind CSS v4 (CSS-first, inline theming)
- **UI Components:** shadcn/ui with Radix UI
- **Database:** Supabase (PostgreSQL)
- **API:** API-Football (soccer data)
- **State Management:** TanStack Query v5 (React Query)
- **Validation:** Zod (runtime type safety)
- **Testing:** Vitest + React Testing Library + happy-dom
- **Code Quality:** ESLint + Prettier + TypeScript strict + Husky
- **Deployment:** Vercel

## 🏁 Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- API-Football API key ([Get one here](https://www.api-football.com/))
- Supabase project ([Create one here](https://supabase.com/))

### Installation

1. Clone the repository:

```bash
git clone https://github.com/erdalgunes/live-sports-hub.git
cd live-sports-hub
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

- `NEXT_PUBLIC_API_FOOTBALL_KEY`: Your API-Football API key
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

4. Run database migrations:

```bash
# Connect to your Supabase project and run migrations from supabase/migrations/
```

5. Start development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home (live scores)
│   ├── fixtures/          # Schedules page
│   └── api/               # API routes for polling
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── matches/           # Match-related components
│   ├── leagues/           # League components
│   ├── layout/            # Layout components
│   └── providers/         # React Query, Theme providers
├── lib/
│   ├── api/               # API-Football client
│   ├── supabase/          # Supabase clients
│   └── utils.ts           # Utility functions
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
└── tests/                 # Test setup and utilities
```

## 🛠️ Development

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Code quality
pnpm lint              # Run ESLint
pnpm lint:fix          # Fix linting issues automatically
pnpm format            # Check code formatting
pnpm format:write      # Format code with Prettier
pnpm type-check        # TypeScript type checking

# Testing
pnpm test              # Run tests in watch mode
pnpm test:ui           # Run tests with Vitest UI
pnpm test:coverage     # Run tests with coverage report
pnpm test:ci           # Run tests for CI (with verbose output)

# Database
pnpm db:reset          # Reset local Supabase database
pnpm db:types          # Generate TypeScript types from database

# Utilities
pnpm clean             # Clean build artifacts and caches
pnpm clean:install     # Full clean + reinstall dependencies
```

## 🌟 Features (POC)

- ✅ Live soccer scores with real-time updates
- ✅ Match schedules by date
- ✅ Match detail pages
- ✅ Dark mode support
- ✅ Responsive design (mobile-first)
- ✅ Popular leagues selector

## 📋 Roadmap

### Phase 1: Foundation ✅

- [x] Project setup with Next.js 16 + React 19
- [x] Tailwind CSS v4 configuration
- [x] shadcn/ui integration
- [x] Core dependencies installed
- [x] Husky + git hooks for code quality

### Phase 2: Database & API ✅

- [x] Supabase schema and migrations
- [x] API-Football client implementation
- [x] Type definitions for API responses
- [x] Zod validation for API responses
- [x] Environment variable validation

### Phase 3: Core Components ✅

- [x] Match cards and listings
- [x] Live indicators
- [x] Loading states and skeletons
- [x] Standings tables with form indicators
- [x] Season selectors

### Phase 4: Pages ✅

- [x] Home page (live scores with SSR)
- [x] Fixtures page (with ISR caching)
- [x] Match detail page
- [x] Standings page with tabs

### Phase 5: Real-time & Polish ✅

- [x] React Query v5 setup for polling
- [x] Optimizations and caching strategies
- [x] Testing infrastructure (Vitest)
- [x] Utility function tests (98% coverage)
- [x] JSDoc documentation for public APIs
- [x] Structured logging system

### Phase 6: Developer Experience ✅

- [x] Test coverage reporting with V8
- [x] Coverage thresholds (70% minimum)
- [x] Utility scripts for database management
- [x] Clean and maintenance scripts
- [x] Zod schemas for runtime validation
- [x] Comprehensive JSDoc comments

### Phase 7: Deployment (Next)

- [ ] Vercel deployment
- [ ] Environment variables configuration
- [ ] Production testing
- [ ] Performance monitoring

## 🔑 Key Considerations

- **API Rate Limits:** Free tier = 100 requests/day. Aggressive caching is essential.
- **Real-time Updates:** Using 60-second polling for live matches (no WebSockets in POC).
- **Caching Strategy:**
  - Live matches: 60s cache
  - Scheduled matches: 1hr cache
  - Finished matches: 24hr cache

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ using Next.js 15 and Tailwind CSS v4
