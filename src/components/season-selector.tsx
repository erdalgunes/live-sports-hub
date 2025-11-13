'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getAvailableSeasons, getCurrentSeason } from '@/lib/utils/season'

interface SeasonSelectorProps {
  defaultSeason?: number
}

export function SeasonSelector({ defaultSeason }: SeasonSelectorProps) {
  const AVAILABLE_SEASONS = getAvailableSeasons()
  const actualDefaultSeason = defaultSeason || getCurrentSeason()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentSeason = searchParams.get('season') || String(actualDefaultSeason)

  const handleSeasonChange = (season: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('season', season)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <Select value={currentSeason} onValueChange={handleSeasonChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select season" />
      </SelectTrigger>
      <SelectContent>
        {AVAILABLE_SEASONS.map((season) => (
          <SelectItem key={season} value={String(season)}>
            {season}/{season + 1} Season
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
