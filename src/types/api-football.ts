// API-Football response types
// Documentation: https://www.api-football.com/documentation-v3

export interface APIResponse<T> {
  get: string
  parameters: Record<string, any>
  errors: Record<string, any>
  results: number
  paging: {
    current: number
    total: number
  }
  response: T
}

export interface Fixture {
  fixture: {
    id: number
    referee: string | null
    timezone: string
    date: string
    timestamp: number
    periods: {
      first: number | null
      second: number | null
    }
    venue: {
      id: number | null
      name: string
      city: string
    }
    status: {
      long: string
      short: MatchStatus
      elapsed: number | null
    }
  }
  league: {
    id: number
    name: string
    country: string
    logo: string
    flag: string
    season: number
    round: string
  }
  teams: {
    home: Team
    away: Team
  }
  goals: {
    home: number | null
    away: number | null
  }
  score: {
    halftime: { home: number | null; away: number | null }
    fulltime: { home: number | null; away: number | null }
    extratime: { home: number | null; away: number | null }
    penalty: { home: number | null; away: number | null }
  }
}

export interface Team {
  id: number
  name: string
  logo: string
  winner: boolean | null
}

export interface League {
  league: {
    id: number
    name: string
    type: string
    logo: string
  }
  country: {
    name: string
    code: string | null
    flag: string | null
  }
  seasons: Season[]
}

export interface Season {
  year: number
  start: string
  end: string
  current: boolean
  coverage: {
    fixtures: {
      events: boolean
      lineups: boolean
      statistics_fixtures: boolean
      statistics_players: boolean
    }
    standings: boolean
    players: boolean
    top_scorers: boolean
    top_assists: boolean
    top_cards: boolean
    injuries: boolean
    predictions: boolean
    odds: boolean
  }
}

export interface Standing {
  rank: number
  team: Team
  points: number
  goalsDiff: number
  group: string
  form: string
  status: string
  description: string
  all: {
    played: number
    win: number
    draw: number
    lose: number
    goals: {
      for: number
      against: number
    }
  }
  home: {
    played: number
    win: number
    draw: number
    lose: number
    goals: {
      for: number
      against: number
    }
  }
  away: {
    played: number
    win: number
    draw: number
    lose: number
    goals: {
      for: number
      against: number
    }
  }
  update: string
}

// Match status types
export type MatchStatus =
  | 'TBD' // Time To Be Defined
  | 'NS' // Not Started
  | 'LIVE' // Live
  | '1H' // First Half
  | 'HT' // Halftime
  | '2H' // Second Half
  | 'ET' // Extra Time
  | 'BT' // Break Time (Extra Time)
  | 'P' // Penalty In Progress
  | 'SUSP' // Match Suspended
  | 'INT' // Match Interrupted
  | 'FT' // Finished
  | 'AET' // Finished After Extra Time
  | 'PEN' // Finished After Penalty
  | 'PST' // Match Postponed
  | 'CANC' // Match Cancelled
  | 'ABD' // Match Abandoned
  | 'AWD' // Technical Loss
  | 'WO' // WalkOver

// Match status labels
export const MATCH_STATUS_LABELS: Record<MatchStatus, string> = {
  TBD: 'Time To Be Defined',
  NS: 'Not Started',
  LIVE: 'Live',
  '1H': 'First Half',
  HT: 'Half Time',
  '2H': 'Second Half',
  ET: 'Extra Time',
  BT: 'Break Time',
  P: 'Penalty',
  SUSP: 'Suspended',
  INT: 'Interrupted',
  FT: 'Finished',
  AET: 'Finished After Extra Time',
  PEN: 'Finished After Penalty',
  PST: 'Postponed',
  CANC: 'Cancelled',
  ABD: 'Abandoned',
  AWD: 'Technical Loss',
  WO: 'WalkOver',
}

// Helper functions for match status
export const isLive = (status: string): boolean => {
  return ['LIVE', '1H', 'HT', '2H', 'ET', 'BT', 'P'].includes(status)
}

export const isFinished = (status: string): boolean => {
  return ['FT', 'AET', 'PEN'].includes(status)
}

export const isUpcoming = (status: string): boolean => {
  return ['TBD', 'NS'].includes(status)
}

export const isCancelled = (status: string): boolean => {
  return ['PST', 'CANC', 'ABD', 'AWD', 'WO'].includes(status)
}
