import { getFixturesByDate, getFixturesByRound } from '@/lib/api/api-football'
import { MatchList } from '@/components/matches/match-list'
import { format } from 'date-fns'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { DATE_FORMATS } from '@/lib/constants'
import { SeasonSelector } from '@/components/season-selector'
import { RoundSelector } from '@/components/round-selector'
import { ViewTabs } from '@/components/view-tabs'
import { DatePicker } from '@/components/date-picker'
import { DateQuickNav } from '@/components/date-quick-nav'
import { getCurrentSeason } from '@/lib/utils/season'
import type { Fixture } from '@/types/api-football'
import { logger } from '@/lib/utils/logger'

export const revalidate = 3600 // ISR: 1 hour

interface FixturesPageProps {
  searchParams: Promise<{ season?: string; view?: string; round?: string; date?: string }>
}

export default async function FixturesPage({ searchParams }: FixturesPageProps) {
  const resolvedParams = await searchParams
  const season = parseInt(resolvedParams.season || String(getCurrentSeason()))
  const view = resolvedParams.view || 'date'
  const round = parseInt(resolvedParams.round || '11')
  const dateParam = resolvedParams.date

  // Use actual current dates for live data, or selected date from picker
  const selectedDate = dateParam ? new Date(dateParam) : new Date()
  const selectedDateFormatted = format(selectedDate, DATE_FORMATS.API)

  // Fetch fixtures based on view type
  let fixturesData: Fixture[] = []
  let roundFixturesData: Fixture[] = []
  let error: string | null = null

  if (view === 'date') {
    try {
      const data = await getFixturesByDate(selectedDateFormatted, 39, season) // Premier League only
      fixturesData = data.response
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load fixtures'
      logger.error('Failed to fetch fixtures by date', {
        error: e,
        date: selectedDateFormatted,
        context: 'fixtures-page',
      })
    }
  } else if (view === 'round') {
    try {
      const data = await getFixturesByRound(39, season, `Regular Season - ${round}`) // Premier League only
      roundFixturesData = data.response
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load fixtures'
      logger.error('Failed to fetch fixtures by round', {
        error: e,
        round,
        context: 'fixtures-page',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fixtures & Schedules</h1>
          <p className="text-muted-foreground">
            Browse {season}/{season + 1} matches
          </p>
        </div>
        <SeasonSelector defaultSeason={season} />
      </div>

      <Tabs defaultValue={view} className="w-full">
        <ViewTabs />

        <TabsContent value="date" className="space-y-4">
          <div className="mb-6 flex flex-col items-center gap-4">
            <DatePicker defaultDate={selectedDate} season={season} />
            <DateQuickNav currentDate={selectedDate} />
          </div>

          {error ? (
            <div className="py-12 text-center">
              <p className="text-destructive text-lg font-medium">Error loading fixtures</p>
              <p className="text-muted-foreground mt-2 text-sm">{error}</p>
            </div>
          ) : (
            <MatchList fixtures={fixturesData} />
          )}
        </TabsContent>

        <TabsContent value="round" className="space-y-4">
          <div className="flex justify-center">
            <RoundSelector defaultRound={round} />
          </div>

          {error ? (
            <div className="py-12 text-center">
              <p className="text-destructive text-lg font-medium">Error loading fixtures</p>
              <p className="text-muted-foreground mt-2 text-sm">{error}</p>
            </div>
          ) : (
            <MatchList fixtures={roundFixturesData} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
