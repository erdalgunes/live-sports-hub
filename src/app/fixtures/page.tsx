import { getFixturesByDate } from '@/lib/api/api-football'
import { MatchList } from '@/components/matches/match-list'
import { format, addDays, subDays } from 'date-fns'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DATE_FORMATS } from '@/lib/constants'

export const revalidate = 3600 // ISR: 1 hour

export default async function FixturesPage() {
  const today = new Date()
  const yesterday = subDays(today, 1)
  const tomorrow = addDays(today, 1)

  const dates = [
    { label: 'Yesterday', value: format(yesterday, DATE_FORMATS.API) },
    { label: 'Today', value: format(today, DATE_FORMATS.API) },
    { label: 'Tomorrow', value: format(tomorrow, DATE_FORMATS.API) },
  ]

  // Fetch today's fixtures by default
  let fixturesData: any[] = []
  let error: string | null = null

  try {
    const data = await getFixturesByDate(dates[1].value)
    fixturesData = data.response
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load fixtures'
    console.error('Error fetching fixtures:', e)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Fixtures & Schedules</h1>
        <p className="text-muted-foreground">Browse matches by date</p>
      </div>

      <Tabs defaultValue={dates[1].value} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {dates.map((date) => (
            <TabsTrigger key={date.value} value={date.value}>
              {date.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={dates[1].value} className="mt-6">
          {error ? (
            <div className="text-center py-12">
              <p className="text-lg font-medium text-destructive">
                Error loading fixtures
              </p>
              <p className="text-sm text-muted-foreground mt-2">{error}</p>
            </div>
          ) : (
            <MatchList fixtures={fixturesData} />
          )}
        </TabsContent>

        {/* Note: Other tabs would need client-side data fetching */}
        {dates.slice(0, 1).concat(dates.slice(2)).map((date) => (
          <TabsContent key={date.value} value={date.value} className="mt-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Switch to this tab to load {date.label.toLowerCase()}'s matches
              </p>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
