/**
 * Match Detail Page
 *
 * Displays comprehensive match information with real-time updates
 * - Match header with scores and status
 * - Tabs: Overview, Stats, Lineups, H2H, Commentary
 * - Real-time updates for live matches
 *
 * Features:
 * - Server-side rendering for initial data
 * - Client-side real-time subscriptions
 * - Tabbed navigation
 * - Responsive design
 * - SEO-friendly metadata
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMatchById } from '@/services/matches';
import MatchDetailClient from './MatchDetailClient';

interface MatchDetailPageProps {
  params: Promise<{ id: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: MatchDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const matchId = parseInt(resolvedParams.id, 10);

  if (isNaN(matchId)) {
    return { title: 'Match Not Found' };
  }

  try {
    const match = await getMatchById(matchId);

    if (!match) {
      return { title: 'Match Not Found' };
    }

    const title = `${match.home_team.name} vs ${match.away_team.name}`;
    const description = `${match.league.name} - ${match.status === 'live' ? 'LIVE' : match.status}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
      },
    };
  } catch (error) {
    return { title: 'Match Not Found' };
  }
}

// Main page component (Server Component)
export default async function MatchDetailPage({ params }: MatchDetailPageProps) {
  const resolvedParams = await params;
  const matchId = parseInt(resolvedParams.id, 10);

  // Validate match ID
  if (isNaN(matchId)) {
    notFound();
  }

  // Fetch initial match data (server-side)
  let initialMatch;
  try {
    initialMatch = await getMatchById(matchId);
  } catch (error) {
    console.error('Failed to fetch match:', error);
    notFound();
  }

  if (!initialMatch) {
    notFound();
  }

  // Pass initial data to client component for real-time updates
  return <MatchDetailClient initialMatch={initialMatch} />;
}

// Enable dynamic rendering for live data
export const dynamic = 'force-dynamic';
export const revalidate = 0;
