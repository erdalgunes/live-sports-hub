'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { processFormString } from '@/lib/utils/form'
import type { Standing } from '@/types/api-football'

// Extended Standing type to support custom form fields
interface EnhancedStanding extends Standing {
  homeForm?: string
  awayForm?: string
}

interface StandingsTableProps {
  standings: EnhancedStanding[]
  type: 'all' | 'home' | 'away'
}

export function StandingsTable({ standings, type }: StandingsTableProps) {
  const getStats = (team: EnhancedStanding) => {
    if (type === 'home') return team.home
    if (type === 'away') return team.away
    return team.all
  }

  const getForm = (team: EnhancedStanding) => {
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

  const getTableCaption = () => {
    if (type === 'home') return 'Premier League home form standings'
    if (type === 'away') return 'Premier League away form standings'
    return 'Premier League standings'
  }

  const getFormDescription = (form: string[]) => {
    if (form.length === 0) return 'No recent form available'
    const results = form.map((r) => (r === 'W' ? 'Win' : r === 'D' ? 'Draw' : 'Loss'))
    return `Last ${form.length} matches: ${results.join(', ')}`
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <caption className="sr-only">{getTableCaption()}</caption>
        <thead>
          <tr className="bg-muted/30 border-b">
            <th
              scope="col"
              className="text-muted-foreground w-10 px-3 py-3 text-center text-xs font-medium"
            >
              <abbr title="Position">#</abbr>
            </th>
            <th
              scope="col"
              className="text-muted-foreground flex-1 px-3 py-3 pl-2 text-left text-xs font-medium"
            >
              Team
            </th>
            <th
              scope="col"
              className="text-muted-foreground w-10 px-3 py-3 text-center text-xs font-medium"
            >
              <abbr title="Played">P</abbr>
            </th>
            <th
              scope="col"
              className="text-muted-foreground w-10 px-3 py-3 text-center text-xs font-medium"
            >
              <abbr title="Won">W</abbr>
            </th>
            <th
              scope="col"
              className="text-muted-foreground w-10 px-3 py-3 text-center text-xs font-medium"
            >
              <abbr title="Drawn">D</abbr>
            </th>
            <th
              scope="col"
              className="text-muted-foreground w-10 px-3 py-3 text-center text-xs font-medium"
            >
              <abbr title="Lost">L</abbr>
            </th>
            <th
              scope="col"
              className="text-muted-foreground hidden w-16 px-3 py-3 text-center text-xs font-medium sm:table-cell"
            >
              <abbr title="Goal Difference">DIFF</abbr>
            </th>
            <th
              scope="col"
              className="text-muted-foreground hidden w-16 px-3 py-3 text-center text-xs font-medium md:table-cell"
            >
              Goals
            </th>
            <th
              scope="col"
              className="text-muted-foreground hidden w-32 px-3 py-3 text-center text-xs font-medium lg:table-cell"
            >
              Last 5
            </th>
            <th
              scope="col"
              className="text-muted-foreground w-12 px-3 py-3 text-center text-xs font-medium"
            >
              <abbr title="Points">PTS</abbr>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedStandings.map((team: EnhancedStanding, index: number) => {
            const stats = getStats(team)
            const form = getForm(team)
            const currentPosition = index + 1
            const overallRank = team.rank

            return (
              <tr key={team.team.id} className="hover:bg-muted/50 group border-b transition-colors">
                {/* Position */}
                <td className="px-3 py-3 text-center">
                  <div
                    className={cn(
                      'mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold',
                      getQualificationColor(overallRank) ? 'text-white' : 'text-foreground',
                      getQualificationColor(overallRank)
                    )}
                    title={type !== 'all' ? `Overall position: ${overallRank}` : undefined}
                    aria-label={`Position ${currentPosition}${type !== 'all' ? `, overall position ${overallRank}` : ''}`}
                  >
                    {currentPosition}
                  </div>
                </td>

                {/* Team Name */}
                <th scope="row" className="px-3 py-3 text-left">
                  <div className="flex min-w-0 items-center gap-2">
                    <Image
                      src={team.team.logo}
                      alt=""
                      width={28}
                      height={28}
                      className="flex-shrink-0"
                      aria-hidden="true"
                    />
                    <span className="truncate font-medium">{team.team.name}</span>
                  </div>
                </th>

                {/* Stats */}
                <td className="px-3 py-3 text-center text-sm">{stats.played}</td>
                <td className="px-3 py-3 text-center text-sm">{stats.win}</td>
                <td className="px-3 py-3 text-center text-sm">{stats.draw}</td>
                <td className="px-3 py-3 text-center text-sm">{stats.lose}</td>

                {/* Goal Difference */}
                <td className="hidden px-3 py-3 text-center text-sm font-medium sm:table-cell">
                  {(() => {
                    const diff = stats.goals.for - stats.goals.against
                    return `${diff > 0 ? '+' : ''}${diff}`
                  })()}
                </td>

                {/* Goals For:Against */}
                <td className="hidden px-3 py-3 text-center text-sm md:table-cell">
                  <span
                    aria-label={`${stats.goals.for} goals scored, ${stats.goals.against} goals conceded`}
                  >
                    {stats.goals.for}:{stats.goals.against}
                  </span>
                </td>

                {/* Form (Last 5) */}
                <td className="hidden px-3 py-3 lg:table-cell">
                  <div
                    className="flex items-center justify-center gap-1"
                    role="list"
                    aria-label={getFormDescription(form)}
                  >
                    {form.map((result: string, idx: number) => {
                      const isOldest = idx === 0
                      const isNewest = idx === form.length - 1
                      return (
                        <div
                          key={idx}
                          role="listitem"
                          className={cn(
                            'flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white transition-all',
                            getFormColor(result),
                            isOldest && 'rounded-l',
                            isNewest && 'rounded-r'
                          )}
                          title={result === 'W' ? 'Win' : result === 'D' ? 'Draw' : 'Loss'}
                          aria-label={result === 'W' ? 'Win' : result === 'D' ? 'Draw' : 'Loss'}
                        >
                          {result}
                        </div>
                      )
                    })}
                  </div>
                </td>

                {/* Points */}
                <td className="px-3 py-3 text-center text-sm font-bold">
                  {stats.win * 3 + stats.draw}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
