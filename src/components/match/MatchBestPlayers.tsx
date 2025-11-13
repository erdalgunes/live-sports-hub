/**
 * MatchBestPlayers Component
 *
 * Displays the best performing players of a match
 * Shows player ratings, statistics, and rankings
 *
 * Features:
 * - Player cards with ratings and key stats
 * - Team separation (home/away)
 * - Responsive grid layout
 * - Loading and error states
 */

'use client';

import React from 'react';
import { useMatchBestPlayers } from '@/hooks';
import type { PlayerMatchStatsWithTeam } from '@/types/matches';

interface PlayerCardProps {
  player: PlayerMatchStatsWithTeam;
  rank: number;
}

function PlayerCard({ player, rank }: PlayerCardProps) {
  const { player: playerInfo, team } = player;

  return (
    <div className="player-card">
      {/* Rank Badge */}
      <div className="player-card__rank">
        <span className="player-card__rank-number">#{rank}</span>
      </div>

      {/* Player Info */}
      <div className="player-card__info">
        <div className="player-card__avatar">
          {playerInfo.photo_url ? (
            <img
              src={playerInfo.photo_url}
              alt={playerInfo.name}
              className="player-card__avatar-image"
            />
          ) : (
            <div className="player-card__avatar-placeholder">
              {playerInfo.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="player-card__details">
          <h4 className="player-card__name">{playerInfo.name}</h4>
          <div className="player-card__team">{team.name}</div>
          <div className="player-card__position">
            {playerInfo.position ? playerInfo.position.charAt(0).toUpperCase() + playerInfo.position.slice(1) : 'Unknown'}
          </div>
        </div>
      </div>

      {/* Rating */}
      <div className="player-card__rating">
        <div className="player-card__rating-value">
          {player.rating ? player.rating.toFixed(1) : 'N/A'}
        </div>
        <div className="player-card__rating-label">Rating</div>
      </div>

      {/* Key Stats */}
      <div className="player-card__stats">
        <div className="player-card__stat">
          <span className="player-card__stat-value">{player.goals}</span>
          <span className="player-card__stat-label">Goals</span>
        </div>
        <div className="player-card__stat">
          <span className="player-card__stat-value">{player.assists}</span>
          <span className="player-card__stat-label">Assists</span>
        </div>
        <div className="player-card__stat">
          <span className="player-card__stat-value">{player.shots_on_target}</span>
          <span className="player-card__stat-label">Shots</span>
        </div>
      </div>

      <style jsx>{`
        .player-card {
          background: var(--surface);
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          position: relative;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .player-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }

        .player-card__rank {
          position: absolute;
          top: -8px;
          left: 16px;
          background: var(--primary);
          color: var(--primary-text);
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
        }

        .player-card__info {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .player-card__avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
        }

        .player-card__avatar-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .player-card__avatar-placeholder {
          width: 100%;
          height: 100%;
          background: var(--surface-alt);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .player-card__details {
          flex: 1;
          min-width: 0;
        }

        .player-card__name {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .player-card__team {
          font-size: 12px;
          color: var(--text-secondary);
          margin-bottom: 2px;
        }

        .player-card__position {
          font-size: 11px;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .player-card__rating {
          text-align: center;
          margin-bottom: 12px;
        }

        .player-card__rating-value {
          font-size: 24px;
          font-weight: 800;
          color: var(--primary);
          line-height: 1;
        }

        .player-card__rating-label {
          font-size: 10px;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 2px;
        }

        .player-card__stats {
          display: flex;
          justify-content: space-around;
          gap: 8px;
        }

        .player-card__stat {
          text-align: center;
          flex: 1;
        }

        .player-card__stat-value {
          display: block;
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1;
        }

        .player-card__stat-label {
          display: block;
          font-size: 10px;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 2px;
        }

        @media (max-width: 640px) {
          .player-card {
            padding: 12px;
          }

          .player-card__info {
            gap: 8px;
          }

          .player-card__avatar {
            width: 40px;
            height: 40px;
          }

          .player-card__name {
            font-size: 14px;
          }

          .player-card__rating-value {
            font-size: 20px;
          }

          .player-card__stats {
            gap: 4px;
          }

          .player-card__stat-value {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}

interface MatchBestPlayersProps {
  matchId: number;
  className?: string;
}

export function MatchBestPlayers({ matchId, className = '' }: MatchBestPlayersProps) {
  const { bestPlayers, loading, error } = useMatchBestPlayers(matchId);

  if (loading) {
    return (
      <div className={`match-best-players ${className}`}>
        <div className="match-best-players__loading">
          <p>Loading best players...</p>
        </div>
        <style jsx>{`
          .match-best-players__loading {
            background: var(--surface);
            border-radius: 12px;
            padding: 48px 24px;
            text-align: center;
            color: var(--text-secondary);
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`match-best-players ${className}`}>
        <div className="match-best-players__error">
          <p>Failed to load best players</p>
          <p className="match-best-players__error-details">{error.message}</p>
        </div>
        <style jsx>{`
          .match-best-players__error {
            background: var(--surface);
            border-radius: 12px;
            padding: 48px 24px;
            text-align: center;
            color: var(--error-text);
          }

          .match-best-players__error-details {
            font-size: 14px;
            color: var(--text-secondary);
            margin-top: 8px;
          }
        `}</style>
      </div>
    );
  }

  if (!bestPlayers || bestPlayers.length === 0) {
    return (
      <div className={`match-best-players ${className}`}>
        <div className="match-best-players__empty">
          <p>Best players data not available</p>
        </div>
        <style jsx>{`
          .match-best-players__empty {
            background: var(--surface);
            border-radius: 12px;
            padding: 48px 24px;
            text-align: center;
            color: var(--text-secondary);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`match-best-players ${className}`}>
      <div className="match-best-players__header">
        <h3 className="match-best-players__title">Best Players</h3>
        <p className="match-best-players__subtitle">Top performers based on ratings</p>
      </div>

      <div className="match-best-players__grid">
        {bestPlayers.map((player, index) => (
          <PlayerCard key={player.id} player={player} rank={index + 1} />
        ))}
      </div>

      <style jsx>{`
        .match-best-players {
          background: var(--surface);
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .match-best-players__header {
          margin-bottom: 24px;
          text-align: center;
        }

        .match-best-players__title {
          font-size: 20px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 4px;
        }

        .match-best-players__subtitle {
          font-size: 14px;
          color: var(--text-secondary);
          margin: 0;
        }

        .match-best-players__grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        @media (max-width: 768px) {
          .match-best-players {
            padding: 16px;
          }

          .match-best-players__grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .match-best-players__title {
            font-size: 18px;
          }
        }
      `}</style>
    </div>
  );
}