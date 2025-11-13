import { getLiveFixtures } from '@/lib/api/api-football'
import { MatchList } from '@/components/matches/match-list'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import type { Fixture } from '@/types/api-football'
import { logger } from '@/lib/utils/logger'

export const revalidate = 60 // ISR: revalidate every 60 seconds

export default async function HomePage() {
  // Server-side initial data
  let fixtures: Fixture[] = []
  let error: string | null = null

  try {
    // Fetch live fixtures for Premier League
    const data = await getLiveFixtures(39)
    fixtures = data.response
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load live matches'
    logger.error('Failed to fetch live fixtures', { error: e, context: 'home-page' })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Live Scores</h1>
        <p className="text-muted-foreground">Real-time soccer matches</p>
      </div>

      <Suspense fallback={<MatchListSkeleton />}>
        {error ? (
          <div className="py-12 text-center">
            <p className="text-destructive text-lg font-medium">Error loading live matches</p>
            <p className="text-muted-foreground mt-2 text-sm">{error}</p>
          </div>
        ) : (
          <MatchList fixtures={fixtures} />
        )}
      </Suspense>
    </div>
  )
}

function MatchListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
  )
}
