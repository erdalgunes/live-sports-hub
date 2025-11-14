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
    <div className={`match-header ${className}`}>
      {/* League Info */}
      <div className="match-header__league">
        <span className="match-header__league-name">{match.league.name}</span>
        {match.league.country && (
          <span className="match-header__league-country"> • {match.league.country}</span>
        )}
      </div>

      {/* Main Header */}
      <div className="match-header__main">
        {/* Home Team */}
        <div className="match-header__team match-header__team--home">
          {match.home_team.logo_url && (
            <img
              src={match.home_team.logo_url}
              alt={match.home_team.name}
              className="match-header__team-logo"
              width={48}
              height={48}
            />
          )}
          <div className="match-header__team-info">
            <h2 className="match-header__team-name">{match.home_team.name}</h2>
            {match.home_team.short_name && (
              <span className="match-header__team-short">{match.home_team.short_name}</span>
            )}
          </div>
        </div>

        {/* Score & Status */}
        <div className="match-header__center">
          {/* Status Badge */}
          <div className={`match-header__status match-header__status--${match.status}`}>
            {isLive && showLiveIndicator && (
              <span className="match-header__live-indicator" aria-label="Live match">
                <span className="match-header__live-dot" />
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
            <div className="match-header__score">
              <span className="match-header__score-value">{match.home_score ?? 0}</span>
              <span className="match-header__score-separator">-</span>
              <span className="match-header__score-value">{match.away_score ?? 0}</span>
            </div>
          )}

          {/* Minute */}
          {isLive && match.minute !== null && (
            <div className="match-header__minute" aria-label={`Match minute ${match.minute}`}>
              {match.minute}&apos;
            </div>
          )}
        </div>

        {/* Away Team */}
        <div className="match-header__team match-header__team--away">
          <div className="match-header__team-info">
            <h2 className="match-header__team-name">{match.away_team.name}</h2>
            {match.away_team.short_name && (
              <span className="match-header__team-short">{match.away_team.short_name}</span>
            )}
          </div>
          {match.away_team.logo_url && (
            <img
              src={match.away_team.logo_url}
              alt={match.away_team.name}
              className="match-header__team-logo"
              width={48}
              height={48}
            />
          )}
        </div>
      </div>

      {/* Additional Info */}
      <div className="match-header__info">
        {match.venue && <span className="match-header__venue">{match.venue}</span>}
        {match.referee && (
          <span className="match-header__referee">
            Referee: {match.referee.first_name} {match.referee.last_name}
          </span>
        )}
      </div>

      <style jsx>{/* NOSONAR */}{`
        .match-header {
          background: var(--surface);
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .match-header__league {
          text-align: center;
          margin-bottom: 16px;
          font-size: 14px;
          color: var(--text-secondary);
        }

        .match-header__league-name {
          font-weight: 600;
        }

        .match-header__main {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 24px;
          align-items: center;
        }

        .match-header__team {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .match-header__team--home {
          justify-content: flex-end;
        }

        .match-header__team--away {
          justify-content: flex-start;
        }

        .match-header__team-logo {
          width: 48px;
          height: 48px;
          object-fit: contain;
        }

        .match-header__team-info {
          display: flex;
          flex-direction: column;
        }

        .match-header__team--home .match-header__team-info {
          align-items: flex-end;
        }

        .match-header__team--away .match-header__team-info {
          align-items: flex-start;
        }

        .match-header__team-name {
          font-size: 20px;
          font-weight: 700;
          margin: 0;
          color: var(--text-primary);
        }

        .match-header__team-short {
          font-size: 12px;
          color: var(--text-secondary);
          text-transform: uppercase;
        }

        .match-header__center {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          min-width: 120px;
        }

        .match-header__status {
          font-size: 12px;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 16px;
          text-transform: uppercase;
        }

        .match-header__status--live {
          background: var(--live-bg);
          color: var(--live-text);
        }

        .match-header__status--finished {
          background: var(--finished-bg);
          color: var(--finished-text);
        }

        .match-header__status--scheduled {
          background: var(--scheduled-bg);
          color: var(--scheduled-text);
        }

        .match-header__live-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .match-header__live-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          background: var(--live-text);
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .match-header__score {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 36px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .match-header__score-separator {
          color: var(--text-secondary);
          font-size: 24px;
        }

        .match-header__minute {
          font-size: 14px;
          font-weight: 600;
          color: var(--live-text);
          background: var(--live-bg);
          padding: 2px 8px;
          border-radius: 4px;
        }

        .match-header__info {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--border);
          font-size: 13px;
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          .match-header__main {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .match-header__team {
            justify-content: center !important;
          }

          .match-header__team-info {
            align-items: center !important;
          }

          .match-header__team-name {
            font-size: 18px;
          }

          .match-header__score {
            font-size: 28px;
          }
        }
      `}</style>
    </div>
  );
}
