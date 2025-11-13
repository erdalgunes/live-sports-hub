import { NextRequest, NextResponse } from 'next/server'
import { format, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns'
import { getFixturesByDate } from '@/lib/api/api-football'
import { DATE_FORMATS } from '@/lib/constants'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const year = parseInt(searchParams.get('year') || '')
  const month = parseInt(searchParams.get('month') || '')
  const season = parseInt(searchParams.get('season') || '')

  if (!year || !month || !season) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
  }

  try {
    // Create date range for the month
    const date = new Date(year, month - 1, 1)
    const start = startOfMonth(date)
    const end = endOfMonth(date)
    const days = eachDayOfInterval({ start, end })

    // Fetch fixtures for each day and collect dates with matches
    const datesWithMatches: string[] = []

    // Batch requests to avoid rate limiting - check every day
    for (const day of days) {
      const dateStr = format(day, DATE_FORMATS.API)
      try {
        const data = await getFixturesByDate(dateStr, 39, season) // Premier League only
        if (data.response && data.response.length > 0) {
          datesWithMatches.push(dateStr)
        }
      } catch (error) {
        // Skip days with errors
        console.error(`Error fetching fixtures for ${dateStr}:`, error)
      }
    }

    return NextResponse.json({
      dates: datesWithMatches,
      month: month,
      year: year,
    })
  } catch (error) {
    console.error('Error fetching month fixtures:', error)
    return NextResponse.json(
      { error: 'Failed to fetch fixtures' },
      { status: 500 }
    )
  }
}
