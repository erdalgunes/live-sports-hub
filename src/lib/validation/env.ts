import { z } from 'zod'

/**
 * Environment variables schema for runtime validation
 *
 * This ensures all required environment variables are present and valid
 * at application startup, preventing runtime errors from missing/invalid config.
 */
export const envSchema = z.object({
  // API Football Configuration
  API_FOOTBALL_BASE_URL: z.string().url().default('https://v3.football.api-sports.io'),
  NEXT_PUBLIC_API_FOOTBALL_KEY: z.string().min(1, 'API Football key is required'),

  // Supabase Configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),

  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

export type Env = z.infer<typeof envSchema>

/**
 * Validates environment variables against the schema
 *
 * @throws {z.ZodError} If validation fails, includes detailed error messages
 * @returns Validated and typed environment variables
 *
 * @example
 * ```ts
 * import { validateEnv } from '@/lib/validation/env'
 *
 * // In app initialization
 * const env = validateEnv()
 * ```
 */
export function validateEnv(): Env {
  try {
    return envSchema.parse({
      API_FOOTBALL_BASE_URL: process.env.API_FOOTBALL_BASE_URL,
      NEXT_PUBLIC_API_FOOTBALL_KEY: process.env.NEXT_PUBLIC_API_FOOTBALL_KEY,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NODE_ENV: process.env.NODE_ENV,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((err) => `  - ${err.path.join('.')}: ${err.message}`)
      throw new Error(`❌ Invalid environment variables:\n${missingVars.join('\n')}`)
    }
    throw error
  }
}
