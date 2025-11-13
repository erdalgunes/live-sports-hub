/**
 * Tournament Standings API Route
 *
 * Returns league standings for a specific tournament, season, and type
 * Supports different standings views: total, home, away
 */

import { NextRequest, NextResponse } from 'next/server';
import { getStandings } from '@/lib/api/api-football';
import {
  getAllTeamFixturesFromCache,
  calculateFormFromFixtures,
} from '@/lib/supabase/standings-cache';

interface RouteParams {
  params: Promise<{
    id: string;
    seasonId: string;
    type: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const resolvedParams = await params;
    const tournamentId = parseInt(resolvedParams.id, 10);
    const seasonId = parseInt(resolvedParams.seasonId, 10);
    const type = resolvedParams.type;

    // Validate parameters
    if (isNaN(tournamentId) || isNaN(seasonId)) {
      return NextResponse.json(
        { error: 'Invalid tournament ID or season ID' },
        { status: 400 }
      );
    }

    // Validate type parameter
    if (!['total', 'home', 'away'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid standings type. Must be: total, home, or away' },
        { status: 400 }
      );
    }

    // Fetch basic standings data
    const standingsData = await getStandings(tournamentId, seasonId);
    let standings = standingsData.response[0]?.league?.standings?.[0] || [];

    if (standings.length === 0) {
      return NextResponse.json(
        { error: 'No standings found for this tournament and season' },
        { status: 404 }
      );
    }

    // Fetch cached fixtures from Supabase for form data
    const fixturesCache = await getAllTeamFixturesFromCache(tournamentId, seasonId);

    // Enhance standings with form data from cache
    standings = standings.map((team: any) => {
      const fixtures = fixturesCache.get(team.team.id);

      if (!fixtures || fixtures.length === 0) {
        return {
          ...team,
          homeForm: '',
          awayForm: '',
        };
      }

      // Calculate form strings for home/away
      const homeForm = calculateFormFromFixtures(fixtures, team.team.id, 'home');
      const awayForm = calculateFormFromFixtures(fixtures, team.team.id, 'away');
      const allForm = calculateFormFromFixtures(fixtures, team.team.id, 'all');

      return {
        ...team,
        form: allForm || team.form || '', // Use cached form or fallback to API form
        homeForm,
        awayForm,
      };
    });

    // Filter standings based on type for mini standings (around current match participants)
    // For now, return all standings - the component will handle filtering
    const response = {
      tournament: {
        id: tournamentId,
        name: standingsData.response[0]?.league?.name || 'Unknown League',
        season: seasonId,
      },
      type,
      standings,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching tournament standings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch standings' },
      { status: 500 }
    );
  }
}