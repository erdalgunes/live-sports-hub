/**
 * Determines the current football season year based on the date
 *
 * European football seasons run from August to May.
 * The season is identified by its starting year.
 *
 * @param date - Date to check (defaults to current date)
 * @returns Season year (e.g., 2025 for 2025/2026 season)
 *
 * @example
 * ```ts
 * getCurrentSeason(new Date('2025-11-15')) // November 2025
 * // Returns: 2025 (2025/2026 season)
 * ```
 *
 * @example
 * ```ts
 * getCurrentSeason(new Date('2025-05-20')) // May 2025
 * // Returns: 2024 (2024/2025 season - not yet started new season)
 * ```
 *
 * @example
 * ```ts
 * getCurrentSeason(new Date('2025-08-01')) // August 1st 2025
 * // Returns: 2025 (2025/2026 season starts)
 * ```
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
 *
 * Returns the current season plus 4 previous seasons in descending order.
 * Useful for season selectors to allow viewing historical data.
 *
 * @param date - Date to base calculation on (defaults to current date)
 * @returns Array of 5 season years in descending order
 *
 * @example
 * ```ts
 * getAvailableSeasons(new Date('2025-11-15'))
 * // Returns: [2025, 2024, 2023, 2022, 2021]
 * ```
 *
 * @example
 * ```ts
 * getAvailableSeasons(new Date('2025-05-20'))
 * // Returns: [2024, 2023, 2022, 2021, 2020] (current season is still 2024/2025)
 * ```
 */
export function getAvailableSeasons(date: Date = new Date()): number[] {
  const currentSeason = getCurrentSeason(date)
  return [currentSeason, currentSeason - 1, currentSeason - 2, currentSeason - 3, currentSeason - 4]
}
