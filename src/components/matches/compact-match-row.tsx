import Image from 'next/image'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import type { Fixture } from '@/types/api-football'

interface CompactMatchRowProps {
  fixture: Fixture
}

export function CompactMatchRow({ fixture }: CompactMatchRowProps) {
  const { fixture: match, teams, goals } = fixture

  const homeScore = goals.home ?? 0
  const awayScore = goals.away ?? 0
  const isHomeWinner = homeScore > awayScore
  const isAwayWinner = awayScore > homeScore

  const matchDate = format(new Date(match.date), 'dd/MM/yy')
  const status = match.status.short

  const getMatchDescription = () => {
    if (status === 'FT') {
      return `${teams.home.name} ${homeScore} vs ${awayScore} ${teams.away.name} - Full Time on ${matchDate}`
    }
    if (homeScore === awayScore) {
      return `${teams.home.name} ${homeScore} vs ${awayScore} ${teams.away.name} - Draw`
    }
    return `${teams.home.name} ${homeScore} vs ${awayScore} ${teams.away.name} on ${matchDate}`
  }

  return (
    <div
      className="hover:bg-muted/50 flex h-[72px] cursor-pointer items-center rounded-sm px-4 transition-colors"
      role="article"
      aria-label={getMatchDescription()}
    >
      {/* Date and Status */}
      <div className="mx-2 w-20 flex-shrink-0 text-center">
        <div className="text-muted-foreground text-xs">{matchDate}</div>
        <div className="text-muted-foreground mt-1 text-xs">{status}</div>
      </div>

      {/* Vertical separator */}
      <div className="bg-border mr-3 h-9 w-px" />

      {/* Teams section */}
      <div className="flex min-w-0 flex-1 items-center justify-between">
        <div className="min-w-0 flex-1">
          {/* Home team */}
          <div className="mb-1 flex items-center gap-2">
            <Image
              src={teams.home.logo}
              alt={teams.home.name}
              width={20}
              height={20}
              className="flex-shrink-0"
            />
            <span
              className={cn(
                'truncate text-sm',
                isHomeWinner ? 'font-semibold' : 'text-muted-foreground'
              )}
            >
              {teams.home.name}
            </span>
          </div>

          {/* Away team */}
          <div className="flex items-center gap-2">
            <Image
              src={teams.away.logo}
              alt={teams.away.name}
              width={20}
              height={20}
              className="flex-shrink-0"
            />
            <span
              className={cn(
                'truncate text-sm',
                isAwayWinner ? 'font-semibold' : 'text-muted-foreground'
              )}
            >
              {teams.away.name}
            </span>
          </div>
        </div>

        {/* Scores */}
        <div className="mr-3 ml-4 flex w-10 flex-col items-end justify-center">
          <div className={cn('text-sm', isHomeWinner ? 'font-semibold' : 'text-muted-foreground')}>
            {homeScore}
          </div>
          <div className={cn('text-sm', isAwayWinner ? 'font-semibold' : 'text-muted-foreground')}>
            {awayScore}
          </div>
        </div>
      </div>

      {/* Vertical separator */}
      <div className="bg-border mx-3 h-9 w-px" />

      {/* Favorite button placeholder */}
      <div className="flex-shrink-0">
        <div className="h-6 w-6" />
      </div>
    </div>
  )
}
