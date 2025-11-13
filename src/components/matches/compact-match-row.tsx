import Image from 'next/image'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface CompactMatchRowProps {
  fixture: any
}

export function CompactMatchRow({ fixture }: CompactMatchRowProps) {
  const { fixture: match, teams, goals, league } = fixture

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
      className="flex items-center h-[72px] hover:bg-muted/50 rounded-sm transition-colors px-4 cursor-pointer"
      role="article"
      aria-label={getMatchDescription()}
    >
      {/* Date and Status */}
      <div className="text-center mx-2 flex-shrink-0 w-20">
        <div className="text-xs text-muted-foreground">{matchDate}</div>
        <div className="text-xs text-muted-foreground mt-1">{status}</div>
      </div>

      {/* Vertical separator */}
      <div className="h-9 w-px bg-border mr-3" />

      {/* Teams section */}
      <div className="flex-1 min-w-0 flex items-center justify-between">
        <div className="flex-1 min-w-0">
          {/* Home team */}
          <div className="flex items-center gap-2 mb-1">
            <Image
              src={teams.home.logo}
              alt={teams.home.name}
              width={20}
              height={20}
              className="flex-shrink-0"
            />
            <span className={cn(
              "text-sm truncate",
              isHomeWinner ? "font-semibold" : "text-muted-foreground"
            )}>
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
            <span className={cn(
              "text-sm truncate",
              isAwayWinner ? "font-semibold" : "text-muted-foreground"
            )}>
              {teams.away.name}
            </span>
          </div>
        </div>

        {/* Scores */}
        <div className="flex flex-col items-end justify-center ml-4 w-10 mr-3">
          <div className={cn(
            "text-sm",
            isHomeWinner ? "font-semibold" : "text-muted-foreground"
          )}>
            {homeScore}
          </div>
          <div className={cn(
            "text-sm",
            isAwayWinner ? "font-semibold" : "text-muted-foreground"
          )}>
            {awayScore}
          </div>
        </div>
      </div>

      {/* Vertical separator */}
      <div className="h-9 w-px bg-border mx-3" />

      {/* Favorite button placeholder */}
      <div className="flex-shrink-0">
        <div className="w-6 h-6" />
      </div>
    </div>
  )
}
