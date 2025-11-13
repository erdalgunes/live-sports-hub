# Live Sports Hub ⚽

Real-time soccer scores, fixtures, and league standings - POC

## 🚀 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (strict mode)
- **Package Manager:** pnpm
- **Styling:** Tailwind CSS v4 (CSS-first, inline theming)
- **UI Components:** shadcn/ui
- **Database:** Supabase
- **API:** API-Football (soccer data)
- **State Management:** TanStack Query (React Query)
- **Testing:** Vitest
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

# Run linter
pnpm lint

# Fix linting issues
pnpm lint:fix

# TypeScript type check
pnpm type-check

# Run tests
pnpm test

# Run tests with UI
pnpm test:ui
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
- [x] Project setup with Next.js 15
- [x] Tailwind CSS v4 configuration
- [x] shadcn/ui integration
- [x] Core dependencies installed

### Phase 2: Database & API
- [ ] Supabase schema and migrations
- [ ] API-Football client implementation
- [ ] Type definitions for API responses

### Phase 3: Core Components
- [ ] Match cards and listings
- [ ] Live indicators
- [ ] Loading states and skeletons

### Phase 4: Pages
- [ ] Home page (live scores)
- [ ] Fixtures page
- [ ] Match detail page

### Phase 5: Real-time & Polish
- [ ] React Query setup for polling
- [ ] Optimizations and caching
- [ ] Testing and documentation

### Phase 6: Deployment
- [ ] Vercel deployment
- [ ] Environment variables configuration
- [ ] Production testing

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
