import { Fixture } from '@/types/api-football'
import { CompactMatchRow } from './compact-match-row'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import Image from 'next/image'

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
      <div className="py-12 text-center">
        <p className="text-muted-foreground text-lg font-medium">No matches found</p>
        <p className="text-muted-foreground mt-2 text-sm">Check back later for live scores</p>
      </div>
    )
  }

  // Get league info from first fixture
  const leagueInfo = fixtures[0]?.league

  return (
    <Card className="overflow-hidden">
      {leagueInfo && (
        <div className="bg-muted/30 flex items-center gap-3 border-b px-6 py-4">
          <Image src={leagueInfo.logo} alt={leagueInfo.name} width={24} height={24} />
          <span className="font-medium">{leagueInfo.name}</span>
        </div>
      )}
      <div className="divide-y">
        {fixtures.map((fixture) => (
          <CompactMatchRow key={fixture.fixture.id} fixture={fixture} />
        ))}
      </div>
    </Card>
  )
}
