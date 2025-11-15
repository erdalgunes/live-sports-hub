import { getLiveFixtures } from '@/lib/api/api-football'
import { MatchList } from '@/components/matches/match-list'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import type { Fixture } from '@/types/api-football'

export const revalidate = 60 // ISR: revalidate every 60 seconds

export default async function HomePage() {
  // Server-side initial data
  let fixtures: Fixture[] = []
  let error: string | null = null

  try {
    // Fetch live fixtures for Premier League
    const data = await getLiveFixtures(39)
    fixtures = data.response as Fixture[]
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load live matches'
    console.error('Error fetching live fixtures:', e)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Live Scores</h1>
        <p className="text-muted-foreground">Real-time soccer matches</p>
      </div>

      <Suspense fallback={<MatchListSkeleton />}>
        {error ? (
          <div className="text-center py-12">
            <p className="text-lg font-medium text-destructive">
              Error loading live matches
            </p>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
          </div>
        ) : (
          <MatchList fixtures={fixtures} />
        )}
      </Suspense>
    </div>
  )
}

const SKELETON_IDS = Array.from({ length: 5 }, (_, i) => `match-skeleton-${i + 1}`)

function MatchListSkeleton() {
  return (
    <div className="space-y-4">
      {SKELETON_IDS.map((id) => (
        <Skeleton key={id} className="h-32 w-full" />
      ))}
    </div>
  )
}
