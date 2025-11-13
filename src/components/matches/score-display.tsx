import { cn } from '@/lib/utils'

interface ScoreDisplayProps {
  homeScore: number | null
  awayScore: number | null
  status: string
  className?: string
}

export function ScoreDisplay({ homeScore, awayScore, status, className }: ScoreDisplayProps) {
  const showScore = homeScore !== null && awayScore !== null

  return (
    <div
      className={cn('text-2xl font-bold tabular-nums', className)}
      aria-live="polite"
      aria-atomic="true"
      role="status"
    >
      {showScore ? (
        <>
          <span className="sr-only">
            Score: {homeScore} to {awayScore}
          </span>
          <span aria-hidden="true">{homeScore}</span>
          <span className="text-muted-foreground mx-2" aria-hidden="true">
            -
          </span>
          <span aria-hidden="true">{awayScore}</span>
        </>
      ) : (
        <span className="text-muted-foreground text-sm">{status}</span>
      )}
    </div>
  )
}
