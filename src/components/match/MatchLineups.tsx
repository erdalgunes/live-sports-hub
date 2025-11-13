/**
 * MatchLineups Component
 *
 * Displays starting lineups and formations for both teams
 * Shows player positions on a formation grid with jersey numbers
 *
 * Features:
 * - Formation grid visualization (4-3-3, 4-4-2, etc.)
 * - Player cards with jersey numbers and names
 * - Team names and formations
 * - Responsive design
 * - Error handling
 */

'use client';

import React from 'react';
import type { MatchLineupWithTeam, LineupPlayer } from '@/types/matches';

interface MatchLineupsProps {
  homeLineup: MatchLineupWithTeam | null;
  awayLineup: MatchLineupWithTeam | null;
  className?: string;
}

interface PlayerCardProps {
  player: LineupPlayer;
}

function PlayerCard({ player }: PlayerCardProps) {
  return (
    <li className="player-card" role="listitem" aria-label={`${player.player_name}, jersey number ${player.jersey_number}`}>
      <div className="player-card__jersey">{player.jersey_number}</div>
      <div className="player-card__name">{player.player_name}</div>

      <style jsx>{`
        .player-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 8px;
          background: var(--surface);
          border-radius: 8px;
          border: 1px solid var(--border);
          min-width: 80px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .player-card__jersey {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
          background: var(--primary);
          color: var(--primary-text);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .player-card__name {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-primary);
          text-align: center;
          line-height: 1.2;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        @media (max-width: 768px) {
          .player-card {
            min-width: 70px;
            padding: 6px;
          }

          .player-card__jersey {
            width: 28px;
            height: 28px;
            font-size: 14px;
          }

          .player-card__name {
            font-size: 11px;
          }
        }
      `}</style>
    </li>
  );
}

interface FormationGridProps {
  lineup: MatchLineupWithTeam;
}

function FormationGrid({ lineup }: FormationGridProps) {
  const { formation, lineup_data } = lineup;

  // Parse formation like "4-3-3" into [4, 3, 3]
  const formationParts = formation?.split('-').map(Number) || [4, 4, 2];
  const [defenders, midfielders, forwards] = formationParts;

  // Group players by position
  const playersByPosition = lineup_data.reduce((acc, player) => {
    const pos = player.position.toLowerCase();
    if (!acc[pos]) acc[pos] = [];
    acc[pos].push(player);
    return acc;
  }, {} as Record<string, LineupPlayer[]>);

  // Sort players by grid position if available
  const sortByGrid = (players: LineupPlayer[]) => {
    return players.sort((a, b) => {
      if (a.grid && b.grid) {
        const [aRow, aCol] = a.grid.split(':').map(Number);
        const [bRow, bCol] = b.grid.split(':').map(Number);
        if (aRow !== bRow) return aRow - bRow;
        return aCol - bCol;
      }
      return a.jersey_number - b.jersey_number;
    });
  };

  const goalkeepers = sortByGrid(playersByPosition.goalkeeper || []);
  const defendersList = sortByGrid(playersByPosition.defender || []);
  const midfieldersList = sortByGrid(playersByPosition.midfielder || []);
  const forwardsList = sortByGrid(playersByPosition.forward || []);

  return (
    <div className="formation-grid">
      {/* Formation Label */}
      <div className="formation-grid__formation">{formation || '4-4-2'}</div>

      {/* Pitch */}
      <div className="formation-grid__pitch" role="img" aria-label={`Soccer pitch showing ${formation || '4-4-2'} formation`}>
        {/* Forwards */}
        <ul className="formation-row formation-row--forwards" role="list" aria-label="Forwards">
          {forwardsList.slice(0, forwards).map((player) => (
            <PlayerCard key={player.player_id} player={player} />
          ))}
        </ul>

        {/* Midfielders */}
        <ul className="formation-row formation-row--midfielders" role="list" aria-label="Midfielders">
          {midfieldersList.slice(0, midfielders).map((player) => (
            <PlayerCard key={player.player_id} player={player} />
          ))}
        </ul>

        {/* Defenders */}
        <ul className="formation-row formation-row--defenders" role="list" aria-label="Defenders">
          {defendersList.slice(0, defenders).map((player) => (
            <PlayerCard key={player.player_id} player={player} />
          ))}
        </ul>

        {/* Goalkeeper */}
        <ul className="formation-row formation-row--goalkeeper" role="list" aria-label="Goalkeeper">
          {goalkeepers.slice(0, 1).map((player) => (
            <PlayerCard key={player.player_id} player={player} />
          ))}
        </ul>
      </div>

      <style jsx>{`
        .formation-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .formation-grid__formation {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-secondary);
          text-align: center;
          padding: 8px 0;
          background: var(--surface-alt);
          border-radius: 6px;
        }

        .formation-grid__pitch {
          background: var(--pitch-bg, #2d5a27);
          border-radius: 12px;
          padding: 20px;
          min-height: 400px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
        }

        .formation-grid__pitch::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 2px;
          background: rgba(255, 255, 255, 0.3);
        }

        .formation-grid__pitch::after {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          width: 2px;
          background: rgba(255, 255, 255, 0.3);
          transform: translateX(-50%);
        }

        .formation-row {
          display: flex;
          justify-content: center;
          gap: 12px;
          position: relative;
          z-index: 1;
        }

        .formation-row--forwards {
          justify-content: space-around;
        }

        .formation-row--midfielders {
          justify-content: space-around;
        }

        .formation-row--defenders {
          justify-content: space-around;
        }

        .formation-row--goalkeeper {
          justify-content: center;
        }

        @media (max-width: 768px) {
          .formation-grid__pitch {
            padding: 16px;
            min-height: 320px;
          }

          .formation-row {
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
}

interface TeamLineupProps {
  lineup: MatchLineupWithTeam;
  isHome: boolean;
}

function TeamLineup({ lineup, isHome }: TeamLineupProps) {
  return (
    <article className="team-lineup" aria-labelledby={`team-${lineup.team.id}-name`}>
      <div className="team-lineup__header">
        <h3 id={`team-${lineup.team.id}-name`} className="team-lineup__name">{lineup.team.name}</h3>
      </div>
      <FormationGrid lineup={lineup} />

      <style jsx>{`
        .team-lineup {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .team-lineup__header {
          text-align: center;
        }

        .team-lineup__name {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        @media (max-width: 768px) {
          .team-lineup__name {
            font-size: 16px;
          }
        }
      `}</style>
    </article>
  );
}

export function MatchLineups({
  homeLineup,
  awayLineup,
  className = '',
}: MatchLineupsProps) {
  if (!homeLineup && !awayLineup) {
    return (
      <div className={`match-lineups-empty ${className}`}>
        <p className="match-lineups-empty__text">Lineups not available yet</p>
        <style jsx>{`
          .match-lineups-empty {
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

  return (
    <section className={`match-lineups ${className}`} aria-label="Team lineups" role="region">
      <div className="match-lineups__teams">
        {/* Home Team */}
        {homeLineup && <TeamLineup lineup={homeLineup} isHome={true} />}

        {/* Away Team */}
        {awayLineup && <TeamLineup lineup={awayLineup} isHome={false} />}
      </div>

      <style jsx>{`
        .match-lineups {
          background: var(--surface);
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .match-lineups__teams {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
        }

        @media (max-width: 768px) {
          .match-lineups {
            padding: 16px;
          }

          .match-lineups__teams {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }
      `}</style>
    </section>
  );
}