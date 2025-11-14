'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { processFormString } from '@/lib/utils/form'

interface StandingsTableProps {
  standings: unknown[]
  type: 'all' | 'home' | 'away'
}

export function StandingsTable({ standings, type }: StandingsTableProps) {
  const getStats = (team: { team: { id: number; name: string; logo: string }; rank: number; [key: string]: unknown }) => {
    if (type === 'home') return team.home
    if (type === 'away') return team.away
    return team.all
  }

  const getForm = (team: { team: { id: number; name: string; logo: string }; rank: number; [key: string]: unknown }) => {
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
    const results = form.map(r => {
      if (r === 'W') return 'Win'
      if (r === 'D') return 'Draw'
      return 'Loss'
    })
    return `Last ${form.length} matches: ${results.join(', ')}`
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <caption className="sr-only">{getTableCaption()}</caption>
        <thead>
          <tr className="border-b bg-muted/30">
            <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-muted-foreground w-10">
              <abbr title="Position">#</abbr>
            </th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-muted-foreground flex-1 pl-2">
              Team
            </th>
            <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-muted-foreground w-10">
              <abbr title="Played">P</abbr>
            </th>
            <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-muted-foreground w-10">
              <abbr title="Won">W</abbr>
            </th>
            <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-muted-foreground w-10">
              <abbr title="Drawn">D</abbr>
            </th>
            <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-muted-foreground w-10">
              <abbr title="Lost">L</abbr>
            </th>
            <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-muted-foreground w-16 hidden sm:table-cell">
              <abbr title="Goal Difference">DIFF</abbr>
            </th>
            <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-muted-foreground w-16 hidden md:table-cell">
              Goals
            </th>
            <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-muted-foreground w-32 hidden lg:table-cell">
              Last 5
            </th>
            <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-muted-foreground w-12">
              <abbr title="Points">PTS</abbr>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedStandings.map((team: { team: { id: number; name: string; logo: string }; rank: number; [key: string]: unknown }, index: number) => {
            const stats = getStats(team)
            const form = getForm(team)
            const currentPosition = index + 1
            const overallRank = team.rank

            return (
              <tr
                key={team.team.id}
                className="border-b hover:bg-muted/50 transition-colors group"
              >
                {/* Position */}
                <td className="px-3 py-3 text-center">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mx-auto',
                      getQualificationColor(overallRank) || 'text-foreground',
                      getQualificationColor(overallRank) && 'text-white'
                    )}
                    title={type === 'all' ? undefined : `Overall position: ${overallRank}`}
                    aria-label={type === 'all'
                      ? `Position ${currentPosition}`
                      : `Position ${currentPosition}, overall position ${overallRank}`}
                  >
                    {currentPosition}
                  </div>
                </td>

                {/* Team Name */}
                <th scope="row" className="px-3 py-3 text-left">
                  <div className="flex items-center gap-2 min-w-0">
                    <Image
                      src={team.team.logo}
                      alt=""
                      width={28}
                      height={28}
                      className="flex-shrink-0"
                      aria-hidden="true"
                    />
                    <span className="font-medium truncate">{team.team.name}</span>
                  </div>
                </th>

                {/* Stats */}
                <td className="px-3 py-3 text-center text-sm">{stats.played}</td>
                <td className="px-3 py-3 text-center text-sm">{stats.win}</td>
                <td className="px-3 py-3 text-center text-sm">{stats.draw}</td>
                <td className="px-3 py-3 text-center text-sm">{stats.lose}</td>

                {/* Goal Difference */}
                <td className="px-3 py-3 text-center text-sm font-medium hidden sm:table-cell">
                  {(() => {
                    const diff = stats.goals.for - stats.goals.against
                    return diff > 0 ? `+${diff}` : String(diff)
                  })()}
                </td>

                {/* Goals For:Against */}
                <td className="px-3 py-3 text-center text-sm hidden md:table-cell">
                  <span aria-label={`${stats.goals.for} goals scored, ${stats.goals.against} goals conceded`}>
                    {stats.goals.for}:{stats.goals.against}
                  </span>
                </td>

                {/* Form (Last 5) */}
                <td className="px-3 py-3 hidden lg:table-cell">
                  <ul
                    className="flex items-center justify-center gap-1"
                    aria-label={getFormDescription(form)}
                  >
                    {form.map((result: string, idx: number) => {
                      const isOldest = idx === 0
                      const isNewest = idx === form.length - 1
                      const getResultTitle = () => {
                        if (result === 'W') return 'Win'
                        if (result === 'D') return 'Draw'
                        return 'Loss'
                      }
                      return (
                        <li
                          key={`${team.team.id}-form-${idx}`}
                          className={cn(
                            'w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-white transition-all',
                            getFormColor(result),
                            isOldest && 'rounded-l',
                            isNewest && 'rounded-r'
                          )}
                          title={getResultTitle()}
                          aria-label={getResultTitle()}
                        >
                          {result}
                        </li>
                      )
                    })}
                  </ul>
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
