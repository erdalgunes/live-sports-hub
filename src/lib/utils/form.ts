/**
 * Calculate form string from match statistics
 *
 * Generates a form string (e.g., "WWDL") based on win/draw/loss ratios.
 * The API provides overall form, but this approximates home/away-specific
 * form by distributing results proportionally.
 *
 * @param stats - Match statistics containing wins, draws, losses, and total played
 * @returns Form string (max 5 characters: W/D/L), empty string if no games played
 *
 * @example
 * ```ts
 * // Team with 3 wins, 1 draw, 1 loss in 5 games
 * calculateFormFromStats({ win: 3, draw: 1, lose: 1, played: 5 })
 * // Returns: "WWWDL" (3 W's, 1 D, 1 L)
 * ```
 *
 * @example
 * ```ts
 * // Team with many games - limited to last 5
 * calculateFormFromStats({ win: 20, draw: 10, lose: 8, played: 38 })
 * // Returns: 5-character form string based on ratios
 * ```
 */
export function calculateFormFromStats(stats: {
  win: number
  draw: number
  lose: number
  played: number
}): string {
  // This is an approximation - we create a form string based on the ratio
  // In reality, we'd need fixture-by-fixture data
  const total = stats.played
  if (total === 0) return ''

  // Generate a form string weighted by the ratios
  let form = ''
  const formLength = Math.min(5, total)

  // Simple heuristic: distribute W/D/L based on actual counts in last 5
  const recentWins = Math.round((stats.win / total) * formLength)
  const recentDraws = Math.round((stats.draw / total) * formLength)
  const recentLosses = formLength - recentWins - recentDraws

  for (let i = 0; i < recentWins; i++) form += 'W'
  for (let i = 0; i < recentDraws; i++) form += 'D'
  for (let i = 0; i < recentLosses; i++) form += 'L'

  return form
}

/**
 * Process and reverse API form string for chronological display
 *
 * The API returns form in reverse chronological order (newest first),
 * but we want to display oldest→newest (left to right) for better UX.
 * Also limits to last 5 results.
 *
 * @param form - Form string from API (e.g., "WDLWW" where W is most recent)
 * @returns Array of form results in chronological order, limited to 5
 *
 * @example
 * ```ts
 * // API returns newest first: "WDLWW" (latest match is W)
 * processFormString("WDLWW")
 * // Returns: ['W', 'W', 'L', 'D', 'W'] (oldest to newest, left to right)
 * ```
 *
 * @example
 * ```ts
 * // Handles strings longer than 5
 * processFormString("WWDLWDL") // 7 chars
 * // Returns: ['W', 'L', 'D', 'W', 'W'] (last 5 after reversal)
 * ```
 */
export function processFormString(form: string): string[] {
  if (!form) return []
  // Reverse to show oldest->newest (left to right)
  return form.split('').reverse().slice(-5)
}
