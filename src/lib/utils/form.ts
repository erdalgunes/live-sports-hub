/**
 * Calculate form from home/away records
 * The API provides overall form, but we can approximate home/away form
 * by looking at the win/draw/loss pattern in home or away stats
 */
export function calculateFormFromStats(
  stats: { win: number; draw: number; lose: number; played: number }
): string {
  // This is an approximation - we create a form string based on the ratio
  // In reality, we'd need fixture-by-fixture data
  const total = stats.played
  if (total === 0) return ''

  const winRatio = stats.win / total
  const drawRatio = stats.draw / total
  const loseRatio = stats.lose / total

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
 * Process form string for display
 * API form is in reverse chronological order (newest first)
 */
export function processFormString(form: string): string[] {
  if (!form) return []
  // Reverse to show oldest->newest (left to right)
  return form.split('').reverse().slice(-5)
}
