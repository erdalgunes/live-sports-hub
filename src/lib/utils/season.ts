/**
 * Determines the current Premier League season based on the date.
 * Premier League seasons typically run from August to May.
 *
 * Logic:
 * - If month is August (8) or later: season is current year
 * - If month is before August: season is previous year
 *
 * Example:
 * - November 2025 → 2025/2026 season → return 2025
 * - May 2025 → 2024/2025 season → return 2024
 * - August 2025 → 2025/2026 season → return 2025
 */
export function getCurrentSeason(date: Date = new Date()): number {
  const year = date.getFullYear()
  const month = date.getMonth() + 1 // 1-12

  // Season starts in August
  if (month >= 8) {
    return year
  } else {
    return year - 1
  }
}

/**
 * Gets a list of available seasons for selection
 * Returns the current season plus 4 previous seasons
 */
export function getAvailableSeasons(date: Date = new Date()): number[] {
  const currentSeason = getCurrentSeason(date)
  return [
    currentSeason,
    currentSeason - 1,
    currentSeason - 2,
    currentSeason - 3,
    currentSeason - 4,
  ]
}
