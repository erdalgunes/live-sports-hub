import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from 'date-fns'
import { DATE_FORMATS } from './constants'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format match time for display
export function formatMatchTime(date: string): string {
  const matchDate = new Date(date)
  const now = new Date()
  const diffMs = matchDate.getTime() - now.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 0) return 'Started'
  if (diffMins < 60) return `${diffMins}m`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`
  return `${Math.floor(diffMins / 1440)}d`
}

// Format date for display
export function formatDate(date: string | Date, formatStr: string = DATE_FORMATS.DISPLAY): string {
  return format(new Date(date), formatStr)
}

// Determine team winner
export function getTeamWinner(
  homeScore: number | null,
  awayScore: number | null,
  team: 'home' | 'away'
): boolean | null {
  if (homeScore === null || awayScore === null) return null
  if (homeScore === awayScore) return null
  return team === 'home' ? homeScore > awayScore : awayScore > homeScore
}

// Get current season year
export function getCurrentSeason(): number {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  // Soccer seasons typically run from August to May
  // If we're in Jan-July, the season is the previous year
  return month >= 8 ? year : year - 1
}

// Truncate text with ellipsis
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length).trim() + '...'
}
