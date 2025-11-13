import { NextRequest, NextResponse } from 'next/server'
import { getFixturesByTeam } from '@/lib/api/api-football'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params
  const searchParams = request.nextUrl.searchParams
  const season = searchParams.get('season')
  const league = searchParams.get('league')
  const last = searchParams.get('last') || '10'

  if (!season || !league) {
    return NextResponse.json(
      { error: 'Missing required parameters: season, league' },
      { status: 400 }
    )
  }

  try {
    const data = await getFixturesByTeam(
      parseInt(teamId),
      parseInt(season),
      parseInt(league),
      parseInt(last)
    )

    return NextResponse.json(data)
  } catch (error) {
    console.error(`Error fetching fixtures for team ${teamId}:`, error)
    return NextResponse.json(
      { error: 'Failed to fetch fixtures' },
      { status: 500 }
    )
  }
}
