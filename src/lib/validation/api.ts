import { z } from 'zod'

/**
 * API Football Response Schemas
 *
 * These schemas validate API responses from API-Football to ensure type safety
 * and catch unexpected API changes early.
 */

// Base API Response structure
export const apiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    get: z.string(),
    parameters: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
    errors: z.union([z.record(z.string(), z.string()), z.array(z.unknown())]).optional(),
    results: z.number(),
    paging: z.object({
      current: z.number(),
      total: z.number(),
    }),
    response: dataSchema,
  })

// Team schema
export const teamSchema = z.object({
  id: z.number(),
  name: z.string(),
  logo: z.string().url(),
  winner: z.boolean().nullable().optional(),
})

// Season schema
export const seasonSchema = z.object({
  year: z.number(),
  start: z.string(),
  end: z.string(),
  current: z.boolean(),
  coverage: z.object({
    fixtures: z.object({
      events: z.boolean(),
      lineups: z.boolean(),
      statistics_fixtures: z.boolean(),
      statistics_players: z.boolean(),
    }),
    standings: z.boolean(),
    players: z.boolean(),
    top_scorers: z.boolean(),
    top_assists: z.boolean(),
    top_cards: z.boolean(),
    injuries: z.boolean(),
    predictions: z.boolean(),
    odds: z.boolean(),
  }),
})

// League schema (for /leagues endpoint)
export const leagueSchema = z.object({
  league: z.object({
    id: z.number(),
    name: z.string(),
    type: z.string(),
    logo: z.string().url(),
  }),
  country: z.object({
    name: z.string(),
    code: z.string().nullable(),
    flag: z.string().url().nullable(),
  }),
  seasons: z.array(seasonSchema),
})

// League info schema (for fixture responses)
export const leagueInfoSchema = z.object({
  id: z.number(),
  name: z.string(),
  country: z.string(),
  logo: z.string().url(),
  flag: z.string(),
  season: z.number(),
  round: z.string(),
})

// Match status enum (matching TypeScript MatchStatus type)
export const matchStatusEnum = z.enum([
  'TBD',
  'NS',
  'LIVE',
  '1H',
  'HT',
  '2H',
  'ET',
  'BT',
  'P',
  'SUSP',
  'INT',
  'FT',
  'AET',
  'PEN',
  'PST',
  'CANC',
  'ABD',
  'AWD',
  'WO',
])

// Fixture status schema
export const fixtureStatusSchema = z.object({
  long: z.string(),
  short: matchStatusEnum,
  elapsed: z.number().nullable(),
})

// Goals schema
export const goalsSchema = z.object({
  home: z.number().nullable(),
  away: z.number().nullable(),
})

// Score schema
export const scoreSchema = z.object({
  halftime: goalsSchema,
  fulltime: goalsSchema,
  extratime: goalsSchema,
  penalty: goalsSchema,
})

// Fixture schema
export const fixtureSchema = z.object({
  fixture: z.object({
    id: z.number(),
    referee: z.string().nullable(),
    timezone: z.string(),
    date: z.string(),
    timestamp: z.number(),
    periods: z.object({
      first: z.number().nullable(),
      second: z.number().nullable(),
    }),
    venue: z.object({
      id: z.number().nullable(),
      name: z.string(),
      city: z.string(),
    }),
    status: fixtureStatusSchema,
  }),
  league: leagueInfoSchema,
  teams: z.object({
    home: teamSchema,
    away: teamSchema,
  }),
  goals: goalsSchema,
  score: scoreSchema,
})

// Standings schema
export const standingsEntrySchema = z.object({
  rank: z.number(),
  team: teamSchema,
  points: z.number(),
  goalsDiff: z.number(),
  group: z.string(),
  form: z.string(),
  status: z.string(),
  description: z.string().nullable(),
  all: z.object({
    played: z.number(),
    win: z.number(),
    draw: z.number(),
    lose: z.number(),
    goals: z.object({
      for: z.number(),
      against: z.number(),
    }),
  }),
  home: z.object({
    played: z.number(),
    win: z.number(),
    draw: z.number(),
    lose: z.number(),
    goals: z.object({
      for: z.number(),
      against: z.number(),
    }),
  }),
  away: z.object({
    played: z.number(),
    win: z.number(),
    draw: z.number(),
    lose: z.number(),
    goals: z.object({
      for: z.number(),
      against: z.number(),
    }),
  }),
  update: z.string(),
})

export const standingsResponseSchema = z.object({
  league: z.object({
    id: z.number(),
    name: z.string(),
    country: z.string(),
    logo: z.string().url(),
    flag: z.string(),
    season: z.number(),
    standings: z.array(z.array(standingsEntrySchema)),
  }),
})

// Statistics schema
export const statisticValueSchema = z.union([z.number(), z.string(), z.null()])

export const statisticSchema = z.object({
  type: z.string(),
  value: statisticValueSchema,
})

export const fixtureStatisticsSchema = z.object({
  team: teamSchema,
  statistics: z.array(statisticSchema),
})

/**
 * Type-safe API response parser
 *
 * @param schema - Zod schema to validate against
 * @param data - Raw API response data
 * @returns Validated and typed data
 * @throws {z.ZodError} If validation fails
 *
 * @example
 * ```ts
 * const fixtures = parseAPIResponse(
 *   apiResponseSchema(z.array(fixtureSchema)),
 *   rawApiData
 * )
 * ```
 */
export function parseAPIResponse<T>(schema: z.ZodType<T>, data: unknown): T {
  return schema.parse(data)
}

/**
 * Safe API response parser that returns result or error
 *
 * @param schema - Zod schema to validate against
 * @param data - Raw API response data
 * @returns Success result with data or error result
 *
 * @example
 * ```ts
 * const result = safeParseAPIResponse(
 *   apiResponseSchema(z.array(fixtureSchema)),
 *   rawApiData
 * )
 * if (result.success) {
 *   console.log(result.data)
 * } else {
 *   console.error(result.error)
 * }
 * ```
 */
export function safeParseAPIResponse<T>(
  schema: z.ZodType<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data)
  return result
}

// Export typed response schemas
export const fixturesResponseSchema = apiResponseSchema(z.array(fixtureSchema))
export const leaguesResponseSchema = apiResponseSchema(z.array(leagueSchema))
export const standingsArrayResponseSchema = apiResponseSchema(z.array(standingsResponseSchema))
export const fixtureStatsResponseSchema = apiResponseSchema(z.array(fixtureStatisticsSchema))

// Export inferred types
export type FixtureSchema = z.infer<typeof fixtureSchema>
export type StandingsEntrySchema = z.infer<typeof standingsEntrySchema>
export type FixtureStatisticsSchema = z.infer<typeof fixtureStatisticsSchema>
