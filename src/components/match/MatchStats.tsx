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
import { cn } from '@/lib/utils';

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
    <div className="grid grid-cols-[60px_1fr_60px] gap-3 items-center mb-4 last:mb-0 sm:grid-cols-[50px_1fr_50px] sm:gap-2">
      {/* Home value */}
      <div className="text-sm font-semibold text-foreground text-right sm:text-xs">
        {formatValue(homeValue)}
      </div>

      {/* Bar visualization */}
      <div className="relative">
        <div className="flex h-6 bg-muted rounded overflow-hidden">
          <div
            className="bg-blue-500 transition-all duration-300"
            style={{ width: `${homePercent}%` }}
          />
          <div
            className="bg-red-500 transition-all duration-300"
            style={{ width: `${awayPercent}%` }}
          />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-semibold text-foreground whitespace-nowrap pointer-events-none [text-shadow:0_0_4px_var(--color-card)] sm:text-[11px]">
          {label}
        </div>
      </div>

      {/* Away value */}
      <div className="text-sm font-semibold text-foreground text-left sm:text-xs">
        {formatValue(awayValue)}
      </div>
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
      <div className={cn('p-12 text-center text-muted-foreground bg-card rounded-xl', className)}>
        <p>Statistics not available yet</p>
      </div>
    );
  }

  return (
    <div className={cn('bg-card rounded-xl p-6 shadow-md sm:p-4', className)}>
      {/* Team Headers */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center mb-6 pb-4 border-b border-border sm:grid-cols-1 sm:text-center">
        <div className="text-sm font-semibold text-muted-foreground text-right sm:text-center">
          {homeTeamName}
        </div>
        <div className="text-lg font-bold text-foreground text-center sm:text-base">
          Match Statistics
        </div>
        <div className="text-sm font-semibold text-muted-foreground text-left sm:text-center">
          {awayTeamName}
        </div>
      </div>

      {/* Stats Rows */}
      <div className="flex flex-col">
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
    </div>
  );
}
