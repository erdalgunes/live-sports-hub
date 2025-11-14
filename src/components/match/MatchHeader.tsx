/**
 * MatchHeader Component
 *
 * Displays match header with team names, logos, scores, and match status
 * Shows live indicator for ongoing matches
 *
 * Features:
 * - Team logos and names
 * - Current score display
 * - Match status badge
 * - Match minute (for live matches)
 * - Match date/time
 * - Responsive design
 */

'use client';

import React from 'react';
import type { MatchDetail } from '@/types/matches';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface MatchHeaderProps {
  readonly match: MatchDetail;
  readonly showLiveIndicator?: boolean;
  readonly className?: string;
}

export function MatchHeader({
  match,
  showLiveIndicator = true,
  className = '',
}: MatchHeaderProps) {
  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';
  const isScheduled = match.status === 'scheduled';

  // Format match date
  const matchDate = new Date(match.match_date);
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={cn('bg-card rounded-xl p-6 shadow-md', className)}>
      {/* League Info */}
      <div className="text-center mb-4 text-sm text-muted-foreground">
        <span className="font-semibold">{match.league.name}</span>
        {match.league.country && (
          <span> • {match.league.country}</span>
        )}
      </div>

      {/* Main Header */}
      <div className="grid grid-cols-3 gap-6 items-center md:grid-cols-1 md:gap-4">
        {/* Home Team */}
        <div className="flex items-center gap-3 justify-end md:justify-center">
          {match.home_team.logo_url && (
            <Image
              src={match.home_team.logo_url}
              alt={match.home_team.name}
              className="w-12 h-12 object-contain"
              width={48}
              height={48}
            />
          )}
          <div className="flex flex-col items-end md:items-center">
            <h2 className="text-xl font-bold m-0 text-foreground">{match.home_team.name}</h2>
            {match.home_team.short_name && (
              <span className="text-xs text-muted-foreground uppercase">{match.home_team.short_name}</span>
            )}
          </div>
        </div>

        {/* Score & Status */}
        <div className="flex flex-col items-center gap-2 min-w-[120px]">
          {/* Status Badge */}
          <div className={cn(
            'text-xs font-semibold px-3 py-1 rounded-2xl uppercase',
            isLive && 'bg-red-600/10 text-red-600',
            isFinished && 'bg-slate-600/10 text-slate-600',
            isScheduled && 'bg-blue-600/10 text-blue-600'
          )}>
            {isLive && showLiveIndicator && (
              <span className="flex items-center gap-1.5" aria-label="Live match">
                <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                {' '}
                LIVE
              </span>
            )}
            {isFinished && <span>FT</span>}
            {isScheduled && <span>{dateFormatter.format(matchDate)}</span>}
            {match.status === 'postponed' && <span>Postponed</span>}
            {match.status === 'cancelled' && <span>Cancelled</span>}
          </div>

          {/* Score */}
          {!isScheduled && (
            <div className="flex items-center gap-3 text-4xl font-bold text-foreground md:text-3xl">
              <span>{match.home_score ?? 0}</span>
              <span className="text-muted-foreground text-2xl">-</span>
              <span>{match.away_score ?? 0}</span>
            </div>
          )}

          {/* Minute */}
          {isLive && match.minute !== null && (
            <div
              className="text-sm font-semibold text-red-600 bg-red-600/10 px-2 py-0.5 rounded"
              aria-label={`Match minute ${match.minute}`}
            >
              {match.minute}&apos;
            </div>
          )}
        </div>

        {/* Away Team */}
        <div className="flex items-center gap-3 justify-start md:justify-center">
          <div className="flex flex-col items-start md:items-center">
            <h2 className="text-xl font-bold m-0 text-foreground">{match.away_team.name}</h2>
            {match.away_team.short_name && (
              <span className="text-xs text-muted-foreground uppercase">{match.away_team.short_name}</span>
            )}
          </div>
          {match.away_team.logo_url && (
            <Image
              src={match.away_team.logo_url}
              alt={match.away_team.name}
              className="w-12 h-12 object-contain"
              width={48}
              height={48}
            />
          )}
        </div>
      </div>

      {/* Additional Info */}
      <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
        {match.venue && <span>{match.venue}</span>}
        {match.referee && (
          <span>
            Referee: {match.referee.name}
          </span>
        )}
      </div>
    </div>
  );
}
