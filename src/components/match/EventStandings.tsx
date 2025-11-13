/**
 * EventStandings Component
 *
 * Displays mini league standings table focused on teams around match participants
 * Shows promotion/relegation zones and highlights match teams
 *
 * Features:
 * - Mini standings table with teams around match participants
 * - Promotion/relegation zone indicators
 * - Highlighting of home and away teams
 * - Responsive design
 * - Error handling
 */

'use client';

import React from 'react';
import Image from 'next/image';
import { useEventStandings } from '@/hooks';
import type { MatchDetail } from '@/types/matches';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface EventStandingsProps {
  match: MatchDetail;
  className?: string;
}

interface MiniStandingRowProps {
  standing: any;
  isHomeTeam: boolean;
  isAwayTeam: boolean;
  showPromotionZones: boolean;
}

function MiniStandingRow({ standing, isHomeTeam, isAwayTeam, showPromotionZones }: MiniStandingRowProps) {
  const getQualificationColor = (rank: number) => {
    if (rank <= 4 && showPromotionZones) return 'bg-blue-500'; // Champions League
    if (rank === 5 && showPromotionZones) return 'bg-orange-500'; // Europa League
    if (rank >= 18 && showPromotionZones) return 'bg-red-500'; // Relegation
    return 'bg-transparent';
  };

  const getQualificationLabel = (rank: number) => {
    if (rank <= 4 && showPromotionZones) return 'CL';
    if (rank === 5 && showPromotionZones) return 'EL';
    if (rank >= 18 && showPromotionZones) return 'REL';
    return '';
  };

  return (
    <div className={`mini-standing-row ${isHomeTeam || isAwayTeam ? 'mini-standing-row--highlight' : ''}`}>
      <div className="mini-standing-row__position">
        <div
          className={`mini-standing-row__position-badge ${getQualificationColor(standing.rank) ? 'text-white' : 'text-foreground'}`}
          style={{ backgroundColor: getQualificationColor(standing.rank) }}
        >
          {standing.rank}
          {getQualificationLabel(standing.rank) && (
            <span className="mini-standing-row__position-label">{getQualificationLabel(standing.rank)}</span>
          )}
        </div>
      </div>

      <div className="mini-standing-row__team">
        <Image
          src={standing.team.logo}
          alt=""
          width={20}
          height={20}
          className="mini-standing-row__team-logo"
        />
        <span className="mini-standing-row__team-name">{standing.team.name}</span>
        {(isHomeTeam || isAwayTeam) && (
          <Badge variant="secondary" className="mini-standing-row__team-badge">
            {isHomeTeam ? 'Home' : 'Away'}
          </Badge>
        )}
      </div>

      <div className="mini-standing-row__stats">
        <span className="mini-standing-row__played">{standing.all.played}</span>
        <span className="mini-standing-row__points font-bold">{standing.all.win * 3 + standing.all.draw}</span>
      </div>

      <style jsx>{`
        .mini-standing-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          border-radius: 6px;
          transition: background-color 0.2s ease;
        }

        .mini-standing-row:hover {
          background: var(--surface-hover);
        }

        .mini-standing-row--highlight {
          background: var(--primary-light);
          border: 1px solid var(--primary);
        }

        .mini-standing-row__position {
          min-width: 40px;
        }

        .mini-standing-row__position-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          font-size: 12px;
          font-weight: 700;
          position: relative;
        }

        .mini-standing-row__position-label {
          position: absolute;
          top: -2px;
          right: -2px;
          font-size: 8px;
          font-weight: 900;
          background: rgba(255, 255, 255, 0.9);
          color: #000;
          padding: 1px 3px;
          border-radius: 2px;
          line-height: 1;
        }

        .mini-standing-row__team {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }

        .mini-standing-row__team-logo {
          flex-shrink: 0;
        }

        .mini-standing-row__team-name {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
          truncate: true;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .mini-standing-row__team-badge {
          font-size: 10px;
          padding: 2px 6px;
          margin-left: 4px;
        }

        .mini-standing-row__stats {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 13px;
          color: var(--text-secondary);
          min-width: 60px;
          justify-content: flex-end;
        }

        .mini-standing-row__played {
          min-width: 20px;
          text-align: center;
        }

        .mini-standing-row__points {
          min-width: 24px;
          text-align: center;
          color: var(--text-primary);
        }

        @media (max-width: 768px) {
          .mini-standing-row {
            gap: 8px;
            padding: 6px 8px;
          }

          .mini-standing-row__team-name {
            font-size: 13px;
          }

          .mini-standing-row__stats {
            gap: 8px;
            font-size: 12px;
            min-width: 50px;
          }
        }
      `}</style>
    </div>
  );
}

export function EventStandings({ match, className = '' }: EventStandingsProps) {
  const { standings, loading, error } = useEventStandings(match, 'total');

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">League Standings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !standings) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">League Standings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Standings not available</p>
            {error && <p className="text-sm mt-1">{error.message}</p>}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Determine if we should show promotion zones (typically for top leagues)
  const showPromotionZones = standings.tournament.id === 39; // Premier League

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>{standings.tournament.name} Standings</span>
          <Badge variant="outline" className="text-xs">
            {standings.tournament.season}/{standings.tournament.season + 1}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mini-standings">
          {standings.standings.map((standing: any) => (
            <MiniStandingRow
              key={standing.team.id}
              standing={standing}
              isHomeTeam={standing.team.id === match.home_team_id}
              isAwayTeam={standing.team.id === match.away_team_id}
              showPromotionZones={showPromotionZones}
            />
          ))}
        </div>

        {showPromotionZones && (
          <div className="mini-standings__legend mt-4 pt-3 border-t">
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Champions League</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Europa League</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Relegation</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <style jsx>{`
        .mini-standings {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .mini-standings__legend {
          border-color: var(--border);
        }
      `}</style>
    </Card>
  );
}