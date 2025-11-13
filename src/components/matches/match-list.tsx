import { Fixture } from '@/types/api-football'
import { MatchCard } from './match-card'
import { Skeleton } from '@/components/ui/skeleton'

interface MatchListProps {
  fixtures: Fixture[]
  isLoading?: boolean
}

export function MatchList({ fixtures, isLoading }: MatchListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    )
  }

  if (fixtures.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg font-medium text-muted-foreground">
          No matches found
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Check back later for live scores
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {fixtures.map((fixture) => (
        <MatchCard key={fixture.fixture.id} fixture={fixture} />
      ))}
    </div>
  )
}
