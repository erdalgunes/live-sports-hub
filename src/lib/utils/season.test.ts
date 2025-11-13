import { describe, it, expect } from 'vitest'
import { getCurrentSeason, getAvailableSeasons } from './season'

describe('season utilities', () => {
  describe('getCurrentSeason', () => {
    it('should return current year when month is August or later', () => {
      const augustDate = new Date('2025-08-01')
      expect(getCurrentSeason(augustDate)).toBe(2025)

      const septemberDate = new Date('2025-09-15')
      expect(getCurrentSeason(septemberDate)).toBe(2025)

      const decemberDate = new Date('2025-12-31')
      expect(getCurrentSeason(decemberDate)).toBe(2025)
    })

    it('should return previous year when month is before August', () => {
      const januaryDate = new Date('2025-01-01')
      expect(getCurrentSeason(januaryDate)).toBe(2024)

      const mayDate = new Date('2025-05-31')
      expect(getCurrentSeason(mayDate)).toBe(2024)

      const julyDate = new Date('2025-07-31')
      expect(getCurrentSeason(julyDate)).toBe(2024)
    })

    it('should handle edge case of August 1st correctly', () => {
      const augustFirst = new Date('2025-08-01')
      expect(getCurrentSeason(augustFirst)).toBe(2025)
    })

    it('should handle edge case of July 31st correctly', () => {
      const julyLast = new Date('2025-07-31')
      expect(getCurrentSeason(julyLast)).toBe(2024)
    })

    it('should use current date when no parameter provided', () => {
      // This test will pass as long as the function works with default date
      const result = getCurrentSeason()
      expect(typeof result).toBe('number')
      expect(result).toBeGreaterThan(2020)
      expect(result).toBeLessThan(2100)
    })
  })

  describe('getAvailableSeasons', () => {
    it('should return current season plus 4 previous seasons', () => {
      const augustDate = new Date('2025-08-01')
      const result = getAvailableSeasons(augustDate)

      expect(result).toEqual([2025, 2024, 2023, 2022, 2021])
      expect(result).toHaveLength(5)
    })

    it('should return correct seasons when month is before August', () => {
      const mayDate = new Date('2025-05-01')
      const result = getAvailableSeasons(mayDate)

      expect(result).toEqual([2024, 2023, 2022, 2021, 2020])
      expect(result).toHaveLength(5)
    })

    it('should always return 5 seasons', () => {
      const result = getAvailableSeasons(new Date('2025-01-01'))
      expect(result).toHaveLength(5)
    })

    it('should return seasons in descending order', () => {
      const result = getAvailableSeasons(new Date('2025-08-01'))

      for (let i = 0; i < result.length - 1; i++) {
        const current = result[i]
        const next = result[i + 1]
        if (current !== undefined && next !== undefined) {
          expect(current).toBeGreaterThan(next)
        }
      }
    })

    it('should use current date when no parameter provided', () => {
      const result = getAvailableSeasons()
      expect(result).toHaveLength(5)
      const first = result[0]
      const last = result[4]
      if (first !== undefined && last !== undefined) {
        expect(first).toBeGreaterThan(last)
      }
    })
  })
})
