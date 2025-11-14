/**
 * MatchStats Component
 *
 * Displays side-by-side comparison of match statistics
 * - Possession, shots, passes, etc.
 * - Visual bars showing comparison
 * - Percentage-based representations
 *
 * Features:
 * - Horizontal bars for each stat
 * - Home vs Away comparison
 * - Color-coded bars
 * - Responsive design
 */

'use client';

import React from 'react';
import type { MatchStats as MatchStatsType } from '@/types/matches';

interface MatchStatsProps {
  readonly homeStats: MatchStatsType | null;
  readonly awayStats: MatchStatsType | null;
  readonly homeTeamName: string;
  readonly awayTeamName: string;
  readonly className?: string;
}

interface StatRowProps {
  readonly label: string;
  readonly homeValue: number;
  readonly awayValue: number;
  readonly isPercentage?: boolean;
  readonly formatter?: (value: number) => string;
}

function StatRow({
  label,
  homeValue,
  awayValue,
  isPercentage = false,
  formatter,
}: StatRowProps) {
  const total = homeValue + awayValue;
  const homePercent = total > 0 ? (homeValue / total) * 100 : 50;
  const awayPercent = total > 0 ? (awayValue / total) * 100 : 50;

  const formatValue = (value: number) => {
    if (formatter) return formatter(value);
    if (isPercentage) return `${value}%`;
    return value.toString();
  };

  return (
    <div className="stat-row">
      {/* Home value */}
      <div className="stat-row__value stat-row__value--home">{formatValue(homeValue)}</div>

      {/* Bar visualization */}
      <div className="stat-row__bar">
        <div className="stat-row__bar-container">
          <div
            className="stat-row__bar-fill stat-row__bar-fill--home"
            style={{ width: `${homePercent}%` }}
          />
          <div
            className="stat-row__bar-fill stat-row__bar-fill--away"
            style={{ width: `${awayPercent}%` }}
          />
        </div>
        <div className="stat-row__label">{label}</div>
      </div>

      {/* Away value */}
      <div className="stat-row__value stat-row__value--away">{formatValue(awayValue)}</div>

      <style jsx>{`
        .stat-row {
          display: grid;
          grid-template-columns: 60px 1fr 60px;
          gap: 12px;
          align-items: center;
          margin-bottom: 16px;
        }

        .stat-row:last-child {
          margin-bottom: 0;
        }

        .stat-row__value {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .stat-row__value--home {
          text-align: right;
        }

        .stat-row__value--away {
          text-align: left;
        }

        .stat-row__bar {
          position: relative;
        }

        .stat-row__bar-container {
          display: flex;
          height: 24px;
          background: var(--surface-alt);
          border-radius: 4px;
          overflow: hidden;
        }

        .stat-row__bar-fill {
          transition: width 0.3s ease;
        }

        .stat-row__bar-fill--home {
          background: var(--home-color);
        }

        .stat-row__bar-fill--away {
          background: var(--away-color);
        }

        .stat-row__label {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 12px;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          pointer-events: none;
          text-shadow: 0 0 4px var(--surface);
        }

        @media (max-width: 640px) {
          .stat-row {
            grid-template-columns: 50px 1fr 50px;
            gap: 8px;
          }

          .stat-row__value {
            font-size: 13px;
          }

          .stat-row__label {
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
}

export function MatchStats({
  homeStats,
  awayStats,
  homeTeamName,
  awayTeamName,
  className = '',
}: MatchStatsProps) {
  if (!homeStats || !awayStats) {
    return (
      <div className={`match-stats-empty ${className}`}>
        <p className="match-stats-empty__text">Statistics not available yet</p>
        <style jsx>{`
          .match-stats-empty {
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
    <div className={`match-stats ${className}`}>
      {/* Team Headers */}
      <div className="match-stats__header">
        <div className="match-stats__team match-stats__team--home">{homeTeamName}</div>
        <div className="match-stats__title">Match Statistics</div>
        <div className="match-stats__team match-stats__team--away">{awayTeamName}</div>
      </div>

      {/* Stats Rows */}
      <div className="match-stats__rows">
        <StatRow
          label="Possession"
          homeValue={homeStats.possession ?? 50}
          awayValue={awayStats.possession ?? 50}
          isPercentage
        />

        <StatRow
          label="Shots"
          homeValue={homeStats.shots ?? 0}
          awayValue={awayStats.shots ?? 0}
        />

        <StatRow
          label="Shots on Target"
          homeValue={homeStats.shots_on_target ?? 0}
          awayValue={awayStats.shots_on_target ?? 0}
        />

        <StatRow
          label="Shots off Target"
          homeValue={homeStats.shots_off_target ?? 0}
          awayValue={awayStats.shots_off_target ?? 0}
        />

        <StatRow
          label="Blocked Shots"
          homeValue={homeStats.blocked_shots ?? 0}
          awayValue={awayStats.blocked_shots ?? 0}
        />

        <StatRow
          label="Corners"
          homeValue={homeStats.corners ?? 0}
          awayValue={awayStats.corners ?? 0}
        />

        <StatRow
          label="Offsides"
          homeValue={homeStats.offsides ?? 0}
          awayValue={awayStats.offsides ?? 0}
        />

        <StatRow
          label="Fouls"
          homeValue={homeStats.fouls ?? 0}
          awayValue={awayStats.fouls ?? 0}
        />

        <StatRow
          label="Yellow Cards"
          homeValue={homeStats.yellow_cards ?? 0}
          awayValue={awayStats.yellow_cards ?? 0}
        />

        <StatRow
          label="Red Cards"
          homeValue={homeStats.red_cards ?? 0}
          awayValue={awayStats.red_cards ?? 0}
        />

        <StatRow
          label="Saves"
          homeValue={homeStats.saves ?? 0}
          awayValue={awayStats.saves ?? 0}
        />

        <StatRow
          label="Passes"
          homeValue={homeStats.passes ?? 0}
          awayValue={awayStats.passes ?? 0}
        />

        <StatRow
          label="Pass Accuracy"
          homeValue={homeStats.pass_accuracy ?? 0}
          awayValue={awayStats.pass_accuracy ?? 0}
          isPercentage
        />
      </div>

      <style jsx>{`
        .match-stats {
          background: var(--surface);
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .match-stats__header {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 16px;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border);
        }

        .match-stats__title {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          text-align: center;
        }

        .match-stats__team {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .match-stats__team--home {
          text-align: right;
        }

        .match-stats__team--away {
          text-align: left;
        }

        .match-stats__rows {
          display: flex;
          flex-direction: column;
        }

        @media (max-width: 640px) {
          .match-stats {
            padding: 16px;
          }

          .match-stats__header {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .match-stats__team {
            text-align: center !important;
          }

          .match-stats__title {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
}
