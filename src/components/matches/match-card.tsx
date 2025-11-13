import { Card, CardContent } from '@/components/ui/card'
import { Fixture } from '@/types/api-football'
import { LiveIndicator } from './live-indicator'
import { ScoreDisplay } from './score-display'
import { formatDate } from '@/lib/utils'
import { DATE_FORMATS } from '@/lib/constants'
import Image from 'next/image'
import Link from 'next/link'

interface MatchCardProps {
  fixture: Fixture
}

export function MatchCard({ fixture }: MatchCardProps) {
  const { fixture: match, teams, goals, league } = fixture

  const getMatchDescription = () => {
    const status = match.status.short
    if (status === 'FT') {
      return `${teams.home.name} ${goals.home} vs ${goals.away} ${teams.away.name} - Full Time`
    }
    if (status === 'LIVE' || status === '1H' || status === '2H' || status === 'HT') {
      const elapsed = match.status.elapsed ? `${match.status.elapsed}'` : ''
      return `${teams.home.name} ${goals.home} vs ${goals.away} ${teams.away.name} - Live ${elapsed}`
    }
    const scheduledTime = formatDate(match.date, DATE_FORMATS.DISPLAY_WITH_TIME)
    return `${teams.home.name} vs ${teams.away.name} - Scheduled for ${scheduledTime}`
  }

  return (
    <Link href={`/fixtures/${match.id}`} className="block" aria-label={getMatchDescription()}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-4">
          {/* League info */}
          <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
            <Image
              src={league.logo}
              alt={league.name}
              width={16}
              height={16}
              className="rounded"
            />
            <span className="flex-1 truncate">{league.name}</span>
            <LiveIndicator
              status={match.status.short}
              elapsed={match.status.elapsed}
            />
          </div>

          {/* Match info */}
          <div className="flex items-center justify-between gap-4">
            {/* Home team */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Image
                src={teams.home.logo}
                alt={teams.home.name}
                width={32}
                height={32}
                className="shrink-0"
              />
              <span className="font-medium truncate">{teams.home.name}</span>
            </div>

            {/* Score */}
            <ScoreDisplay
              homeScore={goals.home}
              awayScore={goals.away}
              status={match.status.short}
            />

            {/* Away team */}
            <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
              <span className="font-medium truncate">{teams.away.name}</span>
              <Image
                src={teams.away.logo}
                alt={teams.away.name}
                width={32}
                height={32}
                className="shrink-0"
              />
            </div>
          </div>

          {/* Match time */}
          <div className="mt-3 text-xs text-muted-foreground text-center">
            {formatDate(match.date, DATE_FORMATS.DISPLAY_WITH_TIME)}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
