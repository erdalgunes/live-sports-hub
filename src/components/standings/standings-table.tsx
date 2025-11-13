'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { processFormString } from '@/lib/utils/form'

interface StandingsTableProps {
  standings: any[]
  type: 'all' | 'home' | 'away'
}

export function StandingsTable({ standings, type }: StandingsTableProps) {
  const getStats = (team: any) => {
    if (type === 'home') return team.home
    if (type === 'away') return team.away
    return team.all
  }

  const getForm = (team: any) => {
    if (type === 'home') {
      return processFormString(team.homeForm || '')
    }
    if (type === 'away') {
      return processFormString(team.awayForm || '')
    }
    // All tab - use the overall form string from API
    return processFormString(team.form || '')
  }

  // IMPORTANT: Qualification colors are ALWAYS based on overall rank
  // Even when viewing home/away sorted tables
  const getQualificationColor = (overallRank: number) => {
    if (overallRank <= 4) return 'bg-blue-500' // Champions League
    if (overallRank === 5) return 'bg-orange-500' // Europa League
    if (overallRank >= 18) return 'bg-red-500' // Relegation
    return 'bg-transparent'
  }

  // Sort standings based on filtered points when viewing home/away
  const sortedStandings = [...standings].sort((a, b) => {
    if (type === 'all') {
      // Keep original order for "All" tab
      return a.rank - b.rank
    }

    // Calculate points for home/away tabs
    const statsA = getStats(a)
    const statsB = getStats(b)
    const pointsA = statsA.win * 3 + statsA.draw
    const pointsB = statsB.win * 3 + statsB.draw

    // Sort by points (descending)
    if (pointsB !== pointsA) return pointsB - pointsA

    // Tiebreaker 1: Goal difference
    const gdA = statsA.goals.for - statsA.goals.against
    const gdB = statsB.goals.for - statsB.goals.against
    if (gdB !== gdA) return gdB - gdA

    // Tiebreaker 2: Goals scored
    return statsB.goals.for - statsA.goals.for
  })

  const getFormColor = (result: string) => {
    if (result === 'W') return 'bg-green-500'
    if (result === 'D') return 'bg-gray-400'
    if (result === 'L') return 'bg-red-500'
    return 'bg-gray-300'
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center px-3 py-3 border-b bg-muted/30">
        <div className="w-10 text-center">
          <span className="text-xs font-medium text-muted-foreground">#</span>
        </div>
        <div className="flex-1 pl-2">
          <span className="text-xs font-medium text-muted-foreground">Team</span>
        </div>
        <div className="w-10 text-center">
          <span className="text-xs font-medium text-muted-foreground">P</span>
        </div>
        <div className="w-10 text-center">
          <span className="text-xs font-medium text-muted-foreground">W</span>
        </div>
        <div className="w-10 text-center">
          <span className="text-xs font-medium text-muted-foreground">D</span>
        </div>
        <div className="w-10 text-center">
          <span className="text-xs font-medium text-muted-foreground">L</span>
        </div>
        <div className="w-16 text-center hidden sm:block">
          <span className="text-xs font-medium text-muted-foreground">DIFF</span>
        </div>
        <div className="w-16 text-center hidden md:block">
          <span className="text-xs font-medium text-muted-foreground">Goals</span>
        </div>
        <div className="w-32 text-center hidden lg:block">
          <span className="text-xs font-medium text-muted-foreground">Last 5</span>
        </div>
        <div className="w-12 text-center">
          <span className="text-xs font-medium text-muted-foreground">PTS</span>
        </div>
      </div>

      {/* Rows */}
      {sortedStandings.map((team: any, index: number) => {
        const stats = getStats(team)
        const form = getForm(team)
        const currentPosition = index + 1 // Position in current sorted view
        const overallRank = team.rank // Original overall rank for qualification colors

        return (
          <div
            key={team.team.id}
            className="flex items-center px-3 py-3 border-b hover:bg-muted/50 transition-colors group"
          >
            {/* Position - Shows current position, but color based on overall rank */}
            <div className="w-10 flex items-center justify-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
                  getQualificationColor(overallRank) ? 'text-white' : 'text-foreground',
                  getQualificationColor(overallRank)
                )}
                title={type !== 'all' ? `Overall position: ${overallRank}` : undefined}
              >
                {currentPosition}
              </div>
            </div>

            {/* Team */}
            <div className="flex-1 flex items-center gap-2 pl-2 min-w-0">
              <Image
                src={team.team.logo}
                alt={team.team.name}
                width={28}
                height={28}
                className="flex-shrink-0"
              />
              <span className="font-medium truncate">{team.team.name}</span>
            </div>

            {/* Stats */}
            <div className="w-10 text-center text-sm">{stats.played}</div>
            <div className="w-10 text-center text-sm">{stats.win}</div>
            <div className="w-10 text-center text-sm">{stats.draw}</div>
            <div className="w-10 text-center text-sm">{stats.lose}</div>

            {/* Goal Difference - Calculate based on stats for home/away */}
            <div className="w-16 text-center text-sm font-medium hidden sm:block">
              {(() => {
                const diff = stats.goals.for - stats.goals.against
                return `${diff > 0 ? '+' : ''}${diff}`
              })()}
            </div>

            {/* Goals For:Against */}
            <div className="w-16 text-center text-sm hidden md:block">
              {stats.goals.for}:{stats.goals.against}
            </div>

            {/* Form (Last 5) - Display oldest to newest (left to right) */}
            <div className="w-32 hidden lg:flex items-center justify-center gap-1">
              {form.map((result: string, idx: number) => {
                const isOldest = idx === 0
                const isNewest = idx === form.length - 1
                return (
                  <div
                    key={idx}
                    className={cn(
                      'w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-white transition-all',
                      getFormColor(result),
                      isOldest && 'rounded-l',
                      isNewest && 'rounded-r'
                    )}
                    title={result === 'W' ? 'Win' : result === 'D' ? 'Draw' : 'Loss'}
                  >
                    {result}
                  </div>
                )
              })}
            </div>

            {/* Points - Calculate based on stats for home/away */}
            <div className="w-12 text-center text-sm font-bold">
              {stats.win * 3 + stats.draw}
            </div>
          </div>
        )
      })}
    </div>
  )
}
