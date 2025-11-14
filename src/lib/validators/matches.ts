// Zod validation schemas for Match/Event features
import { z } from 'zod';

// =============================================================================
// ENUMS
// =============================================================================

export const MatchStatusSchema = z.enum([
  'scheduled',
  'live',
  'finished',
  'postponed',
  'cancelled',
]);

export const EventTypeSchema = z.enum([
  'goal',
  'yellow_card',
  'red_card',
  'substitution',
  'var',
  'penalty',
]);

export const PlayerPositionSchema = z.enum([
  'goalkeeper',
  'defender',
  'midfielder',
  'forward',
]);

// =============================================================================
// ENTITY SCHEMAS
// =============================================================================

export const LeagueSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(255),
  country: z.string().max(100).nullable(),
  season: z.string().min(4).max(20), // e.g., "2024", "2024-25"
  logo_url: z.string().url().nullable(),
  type: z.string().default('league'),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const TeamSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(255),
  short_name: z.string().max(100).nullable(),
  logo_url: z.string().url().nullable(),
  founded_year: z.number().int().min(1800).max(new Date().getFullYear()).nullable(),
  stadium: z.string().max(255).nullable(),
  city: z.string().max(100).nullable(),
  country: z.string().max(100).nullable(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const PlayerSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(255),
  team_id: z.number().int().positive().nullable(),
  position: PlayerPositionSchema.nullable(),
  jersey_number: z.number().int().min(1).max(99).nullable(),
  birth_date: z.string().date().nullable(),
  nationality: z.string().max(100).nullable(),
  height: z.number().int().positive().nullable(), // in cm
  weight: z.number().int().positive().nullable(), // in kg
  photo_url: z.string().url().nullable(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const RefereeSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(255),
  nationality: z.string().max(100).nullable(),
  created_at: z.string().datetime().optional(),
});

export const MatchSchema = z.object({
  id: z.number().int().positive(),
  league_id: z.number().int().positive(),
  home_team_id: z.number().int().positive(),
  away_team_id: z.number().int().positive(),
  match_date: z.string().datetime(),
  status: MatchStatusSchema,
  venue: z.string().max(255).nullable(),
  referee_id: z.number().int().positive().nullable(),
  attendance: z.number().int().min(0).nullable(),
  round: z.string().max(50).nullable(),
  home_score: z.number().int().min(0).default(0),
  away_score: z.number().int().min(0).default(0),
  home_halftime_score: z.number().int().min(0).default(0),
  away_halftime_score: z.number().int().min(0).default(0),
  minute: z.number().int().min(0).max(120).nullable(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const MatchStatsSchema = z.object({
  id: z.number().int().positive().optional(),
  match_id: z.number().int().positive(),
  team_id: z.number().int().positive(),
  goals: z.number().int().min(0).default(0),
  shots: z.number().int().min(0).default(0),
  shots_on_target: z.number().int().min(0).default(0),
  shots_off_target: z.number().int().min(0).default(0),
  blocked_shots: z.number().int().min(0).default(0),
  possession: z.number().int().min(0).max(100).nullable(),
  corners: z.number().int().min(0).default(0),
  offsides: z.number().int().min(0).default(0),
  fouls: z.number().int().min(0).default(0),
  yellow_cards: z.number().int().min(0).default(0),
  red_cards: z.number().int().min(0).default(0),
  saves: z.number().int().min(0).default(0),
  passes: z.number().int().min(0).default(0),
  passes_accurate: z.number().int().min(0).default(0),
  pass_accuracy: z.number().int().min(0).max(100).nullable(),
  tackles: z.number().int().min(0).default(0),
  interceptions: z.number().int().min(0).default(0),
  duels: z.number().int().min(0).default(0),
  duels_won: z.number().int().min(0).default(0),
  free_kicks: z.number().int().min(0).default(0),
  penalty_goals: z.number().int().min(0).default(0),
  penalty_missed: z.number().int().min(0).default(0),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const MatchEventSchema = z.object({
  id: z.number().int().positive().optional(),
  match_id: z.number().int().positive(),
  team_id: z.number().int().positive(),
  player_id: z.number().int().positive().nullable(),
  assist_player_id: z.number().int().positive().nullable(),
  event_type: EventTypeSchema,
  minute: z.number().int().min(0).max(120),
  extra_minute: z.number().int().min(0).max(15).default(0),
  detail: z.string().max(255).nullable(),
  event_data: z.record(z.string(), z.any()).nullable(),
  created_at: z.string().datetime().optional(),
});

export const LineupPlayerSchema = z.object({
  player_id: z.number().int().positive(),
  player_name: z.string().min(1),
  jersey_number: z.number().int().min(1).max(99),
  position: z.string().min(1),
  grid: z.string().nullable(), // e.g., "4:3"
});

export const MatchLineupSchema = z.object({
  id: z.number().int().positive().optional(),
  match_id: z.number().int().positive(),
  team_id: z.number().int().positive(),
  formation: z.string().max(20).nullable(), // e.g., "4-3-3"
  lineup_data: z.array(LineupPlayerSchema),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const PlayerMatchStatsSchema = z.object({
  id: z.number().int().positive().optional(),
  match_id: z.number().int().positive(),
  player_id: z.number().int().positive(),
  team_id: z.number().int().positive(),
  minutes_played: z.number().int().min(0).max(120).default(0),
  rating: z.number().min(0).max(10).nullable(),
  goals: z.number().int().min(0).default(0),
  assists: z.number().int().min(0).default(0),
  shots: z.number().int().min(0).default(0),
  shots_on_target: z.number().int().min(0).default(0),
  passes: z.number().int().min(0).default(0),
  passes_accurate: z.number().int().min(0).default(0),
  key_passes: z.number().int().min(0).default(0),
  tackles: z.number().int().min(0).default(0),
  interceptions: z.number().int().min(0).default(0),
  duels: z.number().int().min(0).default(0),
  duels_won: z.number().int().min(0).default(0),
  dribbles: z.number().int().min(0).default(0),
  dribbles_successful: z.number().int().min(0).default(0),
  fouls_committed: z.number().int().min(0).default(0),
  fouls_drawn: z.number().int().min(0).default(0),
  yellow_cards: z.number().int().min(0).default(0),
  red_cards: z.number().int().min(0).default(0),
  saves: z.number().int().min(0).default(0),
  created_at: z.string().datetime().optional(),
});

export const StandingSchema = z.object({
  id: z.number().int().positive().optional(),
  league_id: z.number().int().positive(),
  team_id: z.number().int().positive(),
  season: z.string().min(4).max(20),
  position: z.number().int().positive(),
  played: z.number().int().min(0).default(0),
  won: z.number().int().min(0).default(0),
  drawn: z.number().int().min(0).default(0),
  lost: z.number().int().min(0).default(0),
  goals_for: z.number().int().min(0).default(0),
  goals_against: z.number().int().min(0).default(0),
  goal_difference: z.number().int(),
  points: z.number().int().min(0).default(0),
  form: z.string().max(10).nullable(),
  updated_at: z.string().datetime().optional(),
});

// =============================================================================
// API QUERY PARAMETERS
// =============================================================================

export const MatchFiltersSchema = z.object({
  league_id: z.coerce.number().int().positive().optional(),
  team_id: z.coerce.number().int().positive().optional(),
  status: MatchStatusSchema.optional(),
  date: z.string().date().optional(), // YYYY-MM-DD
  date_from: z.string().date().optional(),
  date_to: z.string().date().optional(),
  page: z.coerce.number().int().positive().default(1),
  page_size: z.coerce.number().int().min(1).max(100).default(20),
});

export const MatchIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const LeagueIdParamSchema = z.object({
  leagueId: z.coerce.number().int().positive(),
});

export const TeamIdParamSchema = z.object({
  teamId: z.coerce.number().int().positive(),
});

export const PlayerIdParamSchema = z.object({
  playerId: z.coerce.number().int().positive(),
});

// =============================================================================
// API RESPONSE SCHEMAS
// =============================================================================

export const PaginationMetaSchema = z.object({
  total: z.number().int().min(0),
  page: z.number().int().positive(),
  page_size: z.number().int().positive(),
  total_pages: z.number().int().min(0),
});

export const ApiErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
  field: z.string().optional(),
});

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    meta: PaginationMetaSchema.optional(),
    error: ApiErrorSchema.optional(),
  });

// =============================================================================
// TYPE INFERENCE
// =============================================================================

export type MatchFilters = z.infer<typeof MatchFiltersSchema>;
export type MatchIdParam = z.infer<typeof MatchIdParamSchema>;
export type LeagueIdParam = z.infer<typeof LeagueIdParamSchema>;
export type TeamIdParam = z.infer<typeof TeamIdParamSchema>;
export type PlayerIdParam = z.infer<typeof PlayerIdParamSchema>;
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;
export type ApiError = z.infer<typeof ApiErrorSchema>;

// Export inferred types for entities
export type MatchStatus = z.infer<typeof MatchStatusSchema>;
export type EventType = z.infer<typeof EventTypeSchema>;
export type PlayerPosition = z.infer<typeof PlayerPositionSchema>;

// =============================================================================
// VALIDATION HELPER FUNCTIONS
// =============================================================================

/**
 * Safely parse and validate data with Zod schema
 * Returns parsed data or throws validation error
 */
export function validateSchema<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): z.infer<T> {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new Error(
      `Validation failed: ${result.error.issues
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join(', ')}`
    );
  }

  return result.data;
}

/**
 * Safely parse query parameters
 * Returns { success: true, data } or { success: false, error }
 */
export function parseQueryParams<T extends z.ZodTypeAny>(
  schema: T,
  params: Record<string, string | string[] | undefined>
): { success: true; data: z.infer<T> } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(params);

  if (!result.success) {
    return { success: false, error: result.error };
  }

  return { success: true, data: result.data };
}
