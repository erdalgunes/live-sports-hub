/**
 * MatchGraphs Component
 *
 * Displays performance graphs for a match
 * - Momentum graph showing match flow
 * - Win probability graph showing chances over time
 *
 * Features:
 * - SVG-based line charts
 * - Responsive design
 * - Loading and error states
 */

'use client';

import React from 'react';
import { useMatchGraph, useMatchWinProbability } from '@/hooks';
import type { GraphPoint } from '@/types/matches';

interface MatchGraphsProps {
  matchId: number;
  className?: string;
}

interface LineChartProps {
  data: GraphPoint[];
  title: string;
  color: string;
  height?: number;
}

function LineChart({ data, title, color, height = 200 }: LineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="line-chart-empty">
        <p>No data available</p>
      </div>
    );
  }

  const maxMinute = Math.max(...data.map(d => d.minute));
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  const points = data.map((point, index) => {
    const x = (point.minute / maxMinute) * 100;
    const y = 100 - ((point.value - minValue) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="line-chart">
      <h4 className="line-chart__title">{title}</h4>
      <div className="line-chart__container">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="line-chart__svg"
        >
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
      <style jsx>{`
        .line-chart {
          margin-bottom: 24px;
        }

        .line-chart__title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 12px;
          text-align: center;
        }

        .line-chart__container {
          position: relative;
          height: ${height}px;
          background: var(--surface-alt);
          border-radius: 8px;
          padding: 8px;
        }

        .line-chart__svg {
          width: 100%;
          height: 100%;
        }

        .line-chart-empty {
          height: ${height}px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--surface-alt);
          border-radius: 8px;
          color: var(--text-secondary);
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}

export function MatchGraphs({ matchId, className = '' }: MatchGraphsProps) {
  const { graph: momentumGraph, loading: momentumLoading, error: momentumError } = useMatchGraph(matchId);
  const { winProbability, loading: winProbLoading, error: winProbError } = useMatchWinProbability(matchId);

  const isLoading = momentumLoading || winProbLoading;
  const error = momentumError || winProbError;

  if (isLoading) {
    return (
      <div className={`match-graphs-loading ${className}`}>
        <div className="match-graphs-loading__content">
          <div className="match-graphs-loading__spinner" />
          <p>Loading graphs...</p>
        </div>
        <style jsx>{`
          .match-graphs-loading {
            padding: 48px 24px;
            text-align: center;
            background: var(--surface);
            border-radius: 12px;
          }

          .match-graphs-loading__content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
          }

          .match-graphs-loading__spinner {
            width: 32px;
            height: 32px;
            border: 3px solid var(--border);
            border-top: 3px solid var(--primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`match-graphs-error ${className}`}>
        <div className="match-graphs-error__content">
          <p className="match-graphs-error__message">Failed to load graphs</p>
          <p className="match-graphs-error__details">{error.message}</p>
        </div>
        <style jsx>{`
          .match-graphs-error {
            padding: 48px 24px;
            text-align: center;
            background: var(--surface);
            border-radius: 12px;
          }

          .match-graphs-error__content {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .match-graphs-error__message {
            font-size: 16px;
            font-weight: 600;
            color: var(--error-text);
            margin: 0;
          }

          .match-graphs-error__details {
            font-size: 14px;
            color: var(--text-secondary);
            margin: 0;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`match-graphs ${className}`}>
      <div className="match-graphs__header">
        <h3 className="match-graphs__title">Match Performance Graphs</h3>
      </div>

      <div className="match-graphs__content">
        {/* Momentum Graph */}
        <div className="match-graphs__section">
          <LineChart
            data={momentumGraph?.momentum || []}
            title="Match Momentum"
            color="var(--primary)"
          />
        </div>

        {/* Win Probability Graph */}
        <div className="match-graphs__section">
          <div className="win-probability-charts">
            <LineChart
              data={winProbability?.home_probability || []}
              title="Home Win Probability"
              color="var(--home-color)"
              height={150}
            />
            <LineChart
              data={winProbability?.away_probability || []}
              title="Away Win Probability"
              color="var(--away-color)"
              height={150}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .match-graphs {
          background: var(--surface);
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .match-graphs__header {
          margin-bottom: 24px;
          text-align: center;
        }

        .match-graphs__title {
          font-size: 20px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        .match-graphs__content {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .match-graphs__section {
          width: 100%;
        }

        .win-probability-charts {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        @media (max-width: 768px) {
          .match-graphs {
            padding: 16px;
          }

          .match-graphs__title {
            font-size: 18px;
          }

          .win-probability-charts {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }
      `}</style>
    </div>
  );
}