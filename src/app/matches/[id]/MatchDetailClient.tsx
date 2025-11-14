/**
 * MatchDetailClient Component
 *
 * Client-side component for match details with real-time updates
 * Handles subscriptions, tab navigation, and dynamic UI
 */

'use client';

import React, { useState } from 'react';
import { useMatchLive, useMatchEvents, useMatchStats } from '@/hooks';
import { MatchHeader, MatchTimeline, MatchStats } from '@/components/match';
import type { MatchDetail } from '@/types/matches';

interface MatchDetailClientProps {
  readonly initialMatch: MatchDetail;
}

type TabType = 'overview' | 'stats' | 'lineups' | 'h2h';

export default function MatchDetailClient({ initialMatch }: MatchDetailClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Real-time match data
  const { match: liveMatch, isSubscribed } = useMatchLive(initialMatch.id);
  const { events } = useMatchEvents(initialMatch.id);
  const { stats, loading: statsLoading } = useMatchStats(initialMatch.id);

  // Use live match data if available, otherwise use initial data
  const match = liveMatch || initialMatch;

  const tabs: Array<{ id: TabType; label: string }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'stats', label: 'Statistics' },
    { id: 'lineups', label: 'Lineups' },
    { id: 'h2h', label: 'Head to Head' },
  ];

  return (
    <div className="match-detail">
      {/* Match Header */}
      <div className="match-detail__header">
        <MatchHeader match={match} showLiveIndicator={true} />
        {isSubscribed && match.status === 'live' && (
          <div className="match-detail__realtime-status">
            <span className="match-detail__realtime-indicator" />
            {' '}
            Real-time updates active
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="match-detail__tabs">
        <div className="match-detail__tabs-list" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
              className={`match-detail__tab ${
                activeTab === tab.id ? 'match-detail__tab--active' : ''
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="match-detail__content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div
            role="tabpanel"
            id="tabpanel-overview"
            aria-labelledby="tab-overview"
            className="match-detail__panel"
          >
            <div className="match-detail__overview">
              {/* Match Timeline */}
              <section className="match-detail__section">
                <MatchTimeline
                  events={events}
                  homeTeamId={match.home_team_id}
                  awayTeamId={match.away_team_id}
                />
              </section>

              {/* Quick Stats Preview */}
              {stats.home && stats.away && (
                <section className="match-detail__section">
                  <h3 className="match-detail__section-title">Key Statistics</h3>
                  <div className="match-detail__quick-stats">
                    <div className="quick-stat">
                      <div className="quick-stat__label">Possession</div>
                      <div className="quick-stat__value">
                        {stats.home.possession}% - {stats.away.possession}%
                      </div>
                    </div>
                    <div className="quick-stat">
                      <div className="quick-stat__label">Shots on Target</div>
                      <div className="quick-stat__value">
                        {stats.home.shots_on_target} - {stats.away.shots_on_target}
                      </div>
                    </div>
                    <div className="quick-stat">
                      <div className="quick-stat__label">Corners</div>
                      <div className="quick-stat__value">
                        {stats.home.corner_kicks} - {stats.away.corner_kicks}
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </div>
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div
            role="tabpanel"
            id="tabpanel-stats"
            aria-labelledby="tab-stats"
            className="match-detail__panel"
          >
            {statsLoading ? (
              <div className="match-detail__loading">Loading statistics...</div>
            ) : (
              <MatchStats
                homeStats={stats.home}
                awayStats={stats.away}
                homeTeamName={match.home_team.name}
                awayTeamName={match.away_team.name}
              />
            )}
          </div>
        )}

        {/* Lineups Tab */}
        {activeTab === 'lineups' && (
          <div
            role="tabpanel"
            id="tabpanel-lineups"
            aria-labelledby="tab-lineups"
            className="match-detail__panel"
          >
            <div className="match-detail__placeholder">
              <h3>Team Lineups</h3>
              <p>Lineups will be displayed here once available.</p>
            </div>
          </div>
        )}

        {/* H2H Tab */}
        {activeTab === 'h2h' && (
          <div
            role="tabpanel"
            id="tabpanel-h2h"
            aria-labelledby="tab-h2h"
            className="match-detail__panel"
          >
            <div className="match-detail__placeholder">
              <h3>Head to Head</h3>
              <p>Historical matchup data will be displayed here.</p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{/* NOSONAR */}{`
        .match-detail {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
        }

        .match-detail__header {
          margin-bottom: 24px;
        }

        .match-detail__realtime-status {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 12px;
          padding: 8px 12px;
          background: var(--success-bg);
          color: var(--success-text);
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
        }

        .match-detail__realtime-indicator {
          display: inline-block;
          width: 8px;
          height: 8px;
          background: var(--success-text);
          border-radius: 50%;
          animation: pulse-indicator 2s ease-in-out infinite;
        }

        @keyframes pulse-indicator {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .match-detail__tabs {
          background: var(--surface);
          border-radius: 12px;
          padding: 4px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .match-detail__tabs-list {
          display: flex;
          gap: 4px;
        }

        .match-detail__tab {
          flex: 1;
          padding: 12px 16px;
          background: transparent;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .match-detail__tab:hover {
          background: var(--surface-hover);
          color: var(--text-primary);
        }

        .match-detail__tab--active {
          background: var(--primary);
          color: var(--primary-text);
        }

        .match-detail__content {
          min-height: 400px;
        }

        .match-detail__panel {
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .match-detail__overview {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .match-detail__section {
          background: var(--surface);
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .match-detail__section-title {
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 16px;
          color: var(--text-primary);
        }

        .match-detail__quick-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .quick-stat {
          text-align: center;
          padding: 16px;
          background: var(--surface-alt);
          border-radius: 8px;
        }

        .quick-stat__label {
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }

        .quick-stat__value {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .match-detail__placeholder {
          background: var(--surface);
          border-radius: 12px;
          padding: 48px 24px;
          text-align: center;
        }

        .match-detail__placeholder h3 {
          font-size: 20px;
          font-weight: 700;
          margin: 0 0 12px;
          color: var(--text-primary);
        }

        .match-detail__placeholder p {
          font-size: 14px;
          color: var(--text-secondary);
          margin: 0;
        }

        .match-detail__loading {
          background: var(--surface);
          border-radius: 12px;
          padding: 48px 24px;
          text-align: center;
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          .match-detail {
            padding: 16px;
          }

          .match-detail__tabs-list {
            overflow-x: auto;
            flex-wrap: nowrap;
          }

          .match-detail__tab {
            white-space: nowrap;
            padding: 10px 14px;
            font-size: 13px;
          }

          .match-detail__quick-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
