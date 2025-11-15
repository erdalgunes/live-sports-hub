import { cn } from '@/lib/utils'

interface ScoreDisplayProps {
  homeScore: number | null
  awayScore: number | null
  status: string
  className?: string
}

export function ScoreDisplay({
  homeScore,
  awayScore,
  status,
  className
}: Readonly<ScoreDisplayProps>) {
  const showScore = homeScore !== null && awayScore !== null

  return (
    <output
      className={cn('text-2xl font-bold tabular-nums', className)}
      aria-live="polite"
      aria-atomic="true"
    >
      {showScore ? (
        <>
          <span className="sr-only">Score: {homeScore} to {awayScore}</span>
          <span aria-hidden="true">{homeScore}</span>
          <span className="mx-2 text-muted-foreground" aria-hidden="true">-</span>
          <span aria-hidden="true">{awayScore}</span>
        </>
      ) : (
        <span className="text-sm text-muted-foreground">{status}</span>
      )}
    </output>
  )
}
