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
import { cn } from '@/lib/utils';

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
    <div className="max-w-[1200px] mx-auto p-6 md:p-4">
      {/* Match Header */}
      <div className="mb-6">
        <MatchHeader match={match} showLiveIndicator={true} />
        {isSubscribed && match.status === 'live' && (
          <div className="flex items-center gap-2 mt-3 px-3 py-2 bg-green-600/10 text-green-600 rounded-lg text-xs font-medium">
            <span className="inline-block w-2 h-2 bg-green-600 rounded-full animate-pulse" />
            {' '}
            Real-time updates active
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="bg-card rounded-xl p-1 mb-6 shadow-md">
        <div className="flex gap-1 overflow-x-auto md:flex-nowrap" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
              className={cn(
                'flex-1 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200',
                'md:whitespace-nowrap md:px-3.5 md:py-2.5 md:text-xs',
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div
            role="tabpanel"
            id="tabpanel-overview"
            aria-labelledby="tab-overview"
            className="animate-[fadeIn_0.3s_ease]"
          >
            <div className="flex flex-col gap-6">
              {/* Match Timeline */}
              <section>
                <MatchTimeline
                  events={events}
                  homeTeamId={match.home_team_id}
                  awayTeamId={match.away_team_id}
                />
              </section>

              {/* Quick Stats Preview */}
              {stats.home && stats.away && (
                <section className="bg-card rounded-xl p-6 shadow-md">
                  <h3 className="text-lg font-bold m-0 mb-4 text-foreground">Key Statistics</h3>
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 md:grid-cols-1">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-xs text-muted-foreground mb-2">Possession</div>
                      <div className="text-lg font-bold text-foreground">
                        {stats.home.possession}% - {stats.away.possession}%
                      </div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-xs text-muted-foreground mb-2">Shots on Target</div>
                      <div className="text-lg font-bold text-foreground">
                        {stats.home.shots_on_target} - {stats.away.shots_on_target}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-xs text-muted-foreground mb-2">Corners</div>
                      <div className="text-lg font-bold text-foreground">
                        {stats.home.corners} - {stats.away.corners}
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
            className="animate-[fadeIn_0.3s_ease]"
          >
            {statsLoading ? (
              <div className="bg-card rounded-xl py-12 px-6 text-center text-muted-foreground">
                Loading statistics...
              </div>
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
            className="animate-[fadeIn_0.3s_ease]"
          >
            <div className="bg-card rounded-xl py-12 px-6 text-center">
              <h3 className="text-xl font-bold m-0 mb-3 text-foreground">Team Lineups</h3>
              <p className="text-sm text-muted-foreground m-0">Lineups will be displayed here once available.</p>
            </div>
          </div>
        )}

        {/* H2H Tab */}
        {activeTab === 'h2h' && (
          <div
            role="tabpanel"
            id="tabpanel-h2h"
            aria-labelledby="tab-h2h"
            className="animate-[fadeIn_0.3s_ease]"
          >
            <div className="bg-card rounded-xl py-12 px-6 text-center">
              <h3 className="text-xl font-bold m-0 mb-3 text-foreground">Head to Head</h3>
              <p className="text-sm text-muted-foreground m-0">Historical matchup data will be displayed here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
