import { Card, CardContent } from '@/components/ui/card'
import { SeasonSelector } from '@/components/season-selector'
import { getCurrentSeason } from '@/lib/utils/season'
import { StandingsTabs } from '@/components/standings/standings-tabs'
import { getStandings } from '@/lib/api/api-football'
import {
  getAllTeamFixturesFromCache,
  calculateFormFromFixtures,
  isCacheStale,
} from '@/lib/supabase/standings-cache'
import type { Standing } from '@/types/api-football'

// Extended Standing type with custom form properties
interface EnhancedStanding extends Standing {
  homeForm?: string
  awayForm?: string
}

export const revalidate = 3600 // ISR: 1 hour

interface StandingsPageProps {
  searchParams: Promise<{ season?: string }>
}

export default async function StandingsPage({ searchParams }: StandingsPageProps) {
  const resolvedParams = await searchParams
  const season = parseInt(resolvedParams.season || String(getCurrentSeason()))
  const leagueId = 39 // Premier League

  let standingsTable: EnhancedStanding[] = []
  let error: string | null = null

  try {
    // Fetch basic standings data
    const standingsData = await getStandings(leagueId, season)
    standingsTable = standingsData.response[0]?.league?.standings?.[0] || []

    // Fetch cached fixtures from Supabase
    const fixturesCache = await getAllTeamFixturesFromCache(leagueId, season)

    // Enhance standings with form data from cache
    standingsTable = standingsTable.map((team: Standing): EnhancedStanding => {
      const fixtures = fixturesCache.get(team.team.id)

      if (!fixtures || fixtures.length === 0) {
        return {
          ...team,
          homeForm: '',
          awayForm: '',
        }
      }

      // Calculate form strings for home/away
      const homeForm = calculateFormFromFixtures(fixtures, team.team.id, 'home')
      const awayForm = calculateFormFromFixtures(fixtures, team.team.id, 'away')
      const allForm = calculateFormFromFixtures(fixtures, team.team.id, 'all')

      return {
        ...team,
        form: allForm || team.form || '', // Use cached form or fallback to API form
        homeForm,
        awayForm,
      }
    })

    // Check if cache is stale and trigger background refresh (fire-and-forget)
    const isStale = await isCacheStale(leagueId, season)
    if (isStale && process.env.NEXT_PUBLIC_APP_URL) {
      // Trigger background refresh without waiting
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/cache/refresh-standings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leagueId, season }),
      }).catch((err) => {
        console.error('Failed to trigger cache refresh:', err)
      })
    }
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load standings'
    console.error('Error fetching standings:', e)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Premier League Standings</h1>
          <p className="text-muted-foreground">
            {season}/{season + 1} Season
          </p>
        </div>
        <SeasonSelector defaultSeason={season} />
      </div>

      {error ? (
        <div className="py-12 text-center">
          <p className="text-destructive text-lg font-medium">Error loading standings</p>
          <p className="text-muted-foreground mt-2 text-sm">{error}</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-4">
            <StandingsTabs standings={standingsTable} />

            {/* Legend */}
            <div className="mt-6 border-t pt-4">
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-blue-500"></div>
                  <span className="text-muted-foreground">Champions League</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-orange-500"></div>
                  <span className="text-muted-foreground">Europa League</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-red-500"></div>
                  <span className="text-muted-foreground">Relegation</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
