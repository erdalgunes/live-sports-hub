/* eslint-disable react-hooks/error-boundaries */
// Next.js Server Components execute synchronously on the server.
// Try/catch around JSX in Server Components correctly catches data fetching errors.
// The react-hooks/error-boundaries rule is designed for Client Components only.

import { getFixtureById } from '@/lib/api/api-football'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScoreDisplay } from '@/components/matches/score-display'
import { LiveIndicator } from '@/components/matches/live-indicator'
import { formatDate } from '@/lib/utils'
import { DATE_FORMATS } from '@/lib/constants'
import Image from 'next/image'

export const revalidate = 60

interface MatchDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: MatchDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const fixtureId = Number.parseInt(resolvedParams.id, 10)

  try {
    const data = await getFixtureById(fixtureId)
    const fixture = data.response[0]

    return {
      title: `${fixture.teams.home.name} vs ${fixture.teams.away.name} - Live Sports Hub`,
      description: `Match details for ${fixture.teams.home.name} vs ${fixture.teams.away.name}`,
    }
  } catch {
    return {
      title: 'Match Detail - Live Sports Hub',
    }
  }
}

export default async function MatchDetailPage({ params }: MatchDetailPageProps) {
  const resolvedParams = await params
  const fixtureId = Number.parseInt(resolvedParams.id, 10)

  if (Number.isNaN(fixtureId)) {
    notFound()
  }

  try {
    const data = await getFixtureById(fixtureId)
    const fixture = data.response[0]

    if (!fixture) {
      notFound()
    }

    const { fixture: match, teams, goals, league } = fixture

    return (
      // eslint-disable-next-line react-hooks/error-boundaries -- Server Component JSX in try/catch is valid
      <div className="space-y-6">
        {/* League header */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Image
                src={league.logo}
                alt={league.name}
                width={40}
                height={40}
              />
              <div>
                <CardTitle>{league.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{league.round}</p>
              </div>
              <div className="ml-auto">
                <LiveIndicator
                  status={match.status.short}
                  elapsed={match.status.elapsed}
                />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Match info */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Teams and score */}
              <div className="flex items-center justify-between">
                {/* Home team */}
                <div className="flex flex-col items-center gap-3 flex-1">
                  <Image
                    src={teams.home.logo}
                    alt={teams.home.name}
                    width={80}
                    height={80}
                  />
                  <h2 className="text-xl font-bold text-center">{teams.home.name}</h2>
                </div>

                {/* Score */}
                <div className="px-8">
                  <ScoreDisplay
                    homeScore={goals.home}
                    awayScore={goals.away}
                    status={match.status.short}
                    className="text-4xl"
                  />
                </div>

                {/* Away team */}
                <div className="flex flex-col items-center gap-3 flex-1">
                  <Image
                    src={teams.away.logo}
                    alt={teams.away.name}
                    width={80}
                    height={80}
                  />
                  <h2 className="text-xl font-bold text-center">{teams.away.name}</h2>
                </div>
              </div>

              {/* Match metadata */}
              <div className="text-center space-y-2 pt-6 border-t">
                <p className="text-sm text-muted-foreground">
                  {formatDate(match.date, DATE_FORMATS.DISPLAY_WITH_TIME)}
                </p>
                {match.venue.name && (
                  <p className="text-sm text-muted-foreground">
                    {match.venue.name}, {match.venue.city}
                  </p>
                )}
                {match.referee && (
                  <p className="text-xs text-muted-foreground">
                    Referee: {match.referee}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Placeholder for future features */}
        <Card>
          <CardHeader>
            <CardTitle>Match Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Statistics will be available soon
            </p>
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    console.error('Error fetching fixture:', error)
    notFound()
  }
}
