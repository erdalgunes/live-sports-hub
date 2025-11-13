import { Card, CardContent } from '@/components/ui/card'
import { SeasonSelector } from '@/components/season-selector'
import { getCurrentSeason } from '@/lib/utils/season'
import { StandingsWrapper } from '@/components/standings/standings-wrapper'
import { getStandings } from '@/lib/api/api-football'

export const revalidate = 3600 // ISR: 1 hour

interface StandingsPageProps {
  searchParams: Promise<{ season?: string }>
}

export default async function StandingsPage({ searchParams }: StandingsPageProps) {
  const resolvedParams = await searchParams
  const season = parseInt(resolvedParams.season || String(getCurrentSeason()))
  const leagueId = 39 // Premier League

  let standingsTable: any[] = []
  let error: string | null = null

  try {
    // Fetch basic standings data (no form enhancement)
    const standingsData = await getStandings(leagueId, season)
    standingsTable = standingsData.response[0]?.league?.standings?.[0] || []
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
        <div className="text-center py-12">
          <p className="text-lg font-medium text-destructive">
            Error loading standings
          </p>
          <p className="text-sm text-muted-foreground mt-2">{error}</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-4">
            <StandingsWrapper
              initialStandings={standingsTable}
              leagueId={leagueId}
              season={season}
            />

            {/* Legend */}
            <div className="mt-6 pt-4 border-t">
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span className="text-muted-foreground">Champions League</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                  <span className="text-muted-foreground">Europa League</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
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
