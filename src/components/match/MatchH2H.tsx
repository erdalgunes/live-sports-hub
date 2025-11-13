/**
 * MatchH2H Component
 *
 * Displays head-to-head statistics and recent matches between two teams
 * Shows wins/draws/losses statistics and match history list
 *
 * Features:
 * - Statistics cards with team performance
 * - Recent match history
 * - Responsive design
 * - Error handling
 */

'use client';

import React from 'react';
import type { MatchH2H, MatchDetail, Team } from '@/types/matches';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MatchH2HProps {
  h2h: MatchH2H | null;
  recentMatches: MatchDetail[];
  homeTeam: Team;
  awayTeam: Team;
  className?: string;
}

interface StatCardProps {
  title: string;
  homeValue: string | number;
  awayValue: string | number;
  homeTeamName: string;
  awayTeamName: string;
}

function StatCard({ title, homeValue, awayValue, homeTeamName, awayTeamName }: StatCardProps) {
  const cardId = `stat-card-${title.replace(/\s+/g, '-').toLowerCase()}`;
  const titleId = `${cardId}-title`;
  return (
    <div className="stat-card" aria-labelledby={titleId}>
      <div id={titleId} className="stat-card__title">{title}</div>
      <div className="stat-card__values">
        <div className="stat-card__value stat-card__value--home" aria-label={`${homeTeamName}: ${homeValue}`}>
          <span className="stat-card__team">{homeTeamName}</span>
          <span className="stat-card__number">{homeValue}</span>
        </div>
        <div className="stat-card__value stat-card__value--away" aria-label={`${awayTeamName}: ${awayValue}`}>
          <span className="stat-card__number">{awayValue}</span>
          <span className="stat-card__team">{awayTeamName}</span>
        </div>
      </div>

      <style jsx>{`
        .stat-card {
          background: var(--surface);
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .stat-card__title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 16px;
        }

        .stat-card__values {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .stat-card__value {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          border-radius: 8px;
          background: var(--surface-alt);
        }

        .stat-card__value--home {
          flex-direction: row-reverse;
        }

        .stat-card__team {
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .stat-card__number {
          font-size: 20px;
          font-weight: 700;
          color: var(--text-primary);
        }

        @media (max-width: 768px) {
          .stat-card {
            padding: 16px;
          }

          .stat-card__values {
            flex-direction: column;
            gap: 12px;
          }

          .stat-card__value {
            justify-content: space-between;
          }

          .stat-card__value--home {
            flex-direction: row;
          }
        }
      `}</style>
    </div>
  );
}

interface MatchHistoryItemProps {
  match: MatchDetail;
  homeTeamId: number;
  awayTeamId: number;
}

function MatchHistoryItem({ match, homeTeamId, awayTeamId }: MatchHistoryItemProps) {
  const isHomeWin = match.home_score > match.away_score;
  const isAwayWin = match.away_score > match.home_score;
  const isDraw = match.home_score === match.away_score;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <article className="match-history-item" aria-label={`Match on ${formatDate(match.match_date)}: ${match.home_team.name} ${match.home_score} - ${match.away_score} ${match.away_team.name}`}>
      <div className="match-history-item__date">
        {formatDate(match.match_date)}
      </div>
      <div className="match-history-item__teams">
        <div className="match-history-item__team match-history-item__team--home">
          {match.home_team.name}
        </div>
        <div className="match-history-item__score">
          <span className={`match-history-item__score-number ${isHomeWin ? 'match-history-item__score-number--winner' : ''}`} aria-label={isHomeWin ? 'Winner' : ''}>
            {match.home_score}
          </span>
          <span className="match-history-item__score-separator">-</span>
          <span className={`match-history-item__score-number ${isAwayWin ? 'match-history-item__score-number--winner' : ''}`} aria-label={isAwayWin ? 'Winner' : ''}>
            {match.away_score}
          </span>
        </div>
        <div className="match-history-item__team match-history-item__team--away">
          {match.away_team.name}
        </div>
      </div>
      <div className="match-history-item__league">
        {match.league.name}
      </div>

      <style jsx>{`
        .match-history-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px 16px;
          background: var(--surface);
          border-radius: 8px;
          border: 1px solid var(--border);
        }

        .match-history-item__date {
          font-size: 12px;
          color: var(--text-secondary);
          min-width: 80px;
        }

        .match-history-item__teams {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .match-history-item__team {
          flex: 1;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .match-history-item__score {
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .match-history-item__score-number {
          font-size: 16px;
          padding: 4px 8px;
          border-radius: 4px;
          background: var(--surface-alt);
        }

        .match-history-item__score-number--winner {
          background: var(--success-bg);
          color: var(--success-text);
        }

        .match-history-item__score-separator {
          color: var(--text-secondary);
        }

        .match-history-item__league {
          font-size: 12px;
          color: var(--text-secondary);
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        @media (max-width: 768px) {
          .match-history-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .match-history-item__date {
            min-width: auto;
          }

          .match-history-item__teams {
            width: 100%;
          }

          .match-history-item__team {
            flex: none;
            max-width: calc(50% - 24px);
          }

          .match-history-item__league {
            max-width: none;
          }
        }
      `}</style>
    </article>
  );
}

export function MatchH2H({
  h2h,
  recentMatches,
  homeTeam,
  awayTeam,
  className = '',
}: MatchH2HProps) {
  if (!h2h) {
    return (
      <div className={`match-h2h-empty ${className}`}>
        <p className="match-h2h-empty__text">Head-to-head statistics not available</p>
        <style jsx>{`
          .match-h2h-empty {
            padding: 48px 24px;
            text-align: center;
            color: var(--text-secondary);
            background: var(--surface);
            border-radius: 12px;
          }
        `}</style>
      </div>
    );
  }

  // Determine which team is team1 and team2 based on IDs
  const isHomeTeam1 = homeTeam.id === h2h.team1_id;
  const homeWins = isHomeTeam1 ? h2h.team1_wins : h2h.team2_wins;
  const awayWins = isHomeTeam1 ? h2h.team2_wins : h2h.team1_wins;

  return (
    <div className={`match-h2h ${className}`} aria-live="polite" aria-atomic="false" role="region" aria-label="Head-to-head statistics">
      {/* Statistics Section */}
      <section className="match-h2h__section" aria-labelledby="stats-title">
        <h3 id="stats-title" className="match-h2h__section-title">Overall Statistics</h3>
        <div className="match-h2h__stats">
          <StatCard
            title="Matches Played"
            homeValue={h2h.matches_played}
            awayValue={h2h.matches_played}
            homeTeamName={homeTeam.name}
            awayTeamName={awayTeam.name}
          />
          <StatCard
            title="Wins"
            homeValue={homeWins}
            awayValue={awayWins}
            homeTeamName={homeTeam.name}
            awayTeamName={awayTeam.name}
          />
          <StatCard
            title="Draws"
            homeValue={h2h.draws}
            awayValue={h2h.draws}
            homeTeamName={homeTeam.name}
            awayTeamName={awayTeam.name}
          />
        </div>
      </section>

      {/* Recent Matches Section */}
      {recentMatches.length > 0 && (
        <section className="match-h2h__section" aria-labelledby="matches-title">
          <h3 id="matches-title" className="match-h2h__section-title">Recent Matches</h3>
          <div className="match-h2h__matches" aria-live="polite">
            {recentMatches.map((match) => (
              <MatchHistoryItem
                key={match.id}
                match={match}
                homeTeamId={homeTeam.id}
                awayTeamId={awayTeam.id}
              />
            ))}
          </div>
        </section>
      )}

      <style jsx>{`
        .match-h2h {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .match-h2h__section {
          background: var(--surface);
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .match-h2h__section-title {
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 20px;
          color: var(--text-primary);
        }

        .match-h2h__stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
        }

        .match-h2h__matches {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        @media (max-width: 768px) {
          .match-h2h {
            gap: 24px;
          }

          .match-h2h__section {
            padding: 16px;
          }

          .match-h2h__section-title {
            font-size: 16px;
            margin-bottom: 16px;
          }

          .match-h2h__stats {
            grid-template-columns: 1fr;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
}