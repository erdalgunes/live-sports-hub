'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Premier League typically has 38 rounds
const MAX_ROUNDS = 38

interface RoundSelectorProps {
  defaultRound?: number
}

export function RoundSelector({ defaultRound = 1 }: RoundSelectorProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentRound = Number.parseInt(searchParams.get('round') || String(defaultRound))

  const handleRoundChange = (round: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('round', round)
    params.set('view', 'round') // Set view to round
    router.push(`${pathname}?${params.toString()}`)
  }

  const handlePrevious = () => {
    if (currentRound > 1) {
      handleRoundChange(String(currentRound - 1))
    }
  }

  const handleNext = () => {
    if (currentRound < MAX_ROUNDS) {
      handleRoundChange(String(currentRound + 1))
    }
  }

  return (
    <div className="flex items-center gap-2" aria-label="Round navigation">
      <Button
        variant="outline"
        size="icon"
        onClick={handlePrevious}
        disabled={currentRound <= 1}
        className="h-9 w-9"
        aria-label={`Go to round ${currentRound - 1}`}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </Button>

      <Select value={String(currentRound)} onValueChange={handleRoundChange}>
        <SelectTrigger className="w-[140px]" aria-label="Select round">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: MAX_ROUNDS }, (_, i) => i + 1).map((round) => (
            <SelectItem key={round} value={String(round)}>
              Round {round}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="icon"
        onClick={handleNext}
        disabled={currentRound >= MAX_ROUNDS}
        className="h-9 w-9"
        aria-label={`Go to round ${currentRound + 1}`}
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  )
}
