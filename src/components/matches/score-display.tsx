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
}: ScoreDisplayProps) {
  const showScore = homeScore !== null && awayScore !== null

  return (
    <div className={cn('text-2xl font-bold tabular-nums', className)}>
      {showScore ? (
        <>
          <span>{homeScore}</span>
          <span className="mx-2 text-muted-foreground">-</span>
          <span>{awayScore}</span>
        </>
      ) : (
        <span className="text-sm text-muted-foreground">{status}</span>
      )}
    </div>
  )
}
