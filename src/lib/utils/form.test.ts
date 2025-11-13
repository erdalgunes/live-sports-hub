import { describe, it, expect } from 'vitest'
import { calculateFormFromStats, processFormString } from './form'

describe('form utilities', () => {
  describe('calculateFormFromStats', () => {
    it('should return empty string when no games played', () => {
      const result = calculateFormFromStats({
        win: 0,
        draw: 0,
        lose: 0,
        played: 0,
      })

      expect(result).toBe('')
    })

    it('should calculate form for all wins', () => {
      const result = calculateFormFromStats({
        win: 5,
        draw: 0,
        lose: 0,
        played: 5,
      })

      expect(result).toBe('WWWWW')
      expect(result).toHaveLength(5)
    })

    it('should calculate form for all losses', () => {
      const result = calculateFormFromStats({
        win: 0,
        draw: 0,
        lose: 5,
        played: 5,
      })

      expect(result).toBe('LLLLL')
      expect(result).toHaveLength(5)
    })

    it('should calculate form for all draws', () => {
      const result = calculateFormFromStats({
        win: 0,
        draw: 5,
        lose: 0,
        played: 5,
      })

      expect(result).toBe('DDDDD')
      expect(result).toHaveLength(5)
    })

    it('should calculate mixed form correctly', () => {
      const result = calculateFormFromStats({
        win: 3,
        draw: 1,
        lose: 1,
        played: 5,
      })

      // Should have 3 W's, 1 D, and 1 L
      expect(result).toContain('W')
      expect(result).toContain('D')
      expect(result).toContain('L')
      expect(result).toHaveLength(5)

      const wCount = (result.match(/W/g) || []).length
      const dCount = (result.match(/D/g) || []).length
      const lCount = (result.match(/L/g) || []).length

      expect(wCount).toBe(3)
      expect(dCount).toBe(1)
      expect(lCount).toBe(1)
    })

    it('should limit form length to 5 when more games played', () => {
      const result = calculateFormFromStats({
        win: 20,
        draw: 10,
        lose: 8,
        played: 38,
      })

      expect(result).toHaveLength(5)
    })

    it('should handle single game played', () => {
      const result = calculateFormFromStats({
        win: 1,
        draw: 0,
        lose: 0,
        played: 1,
      })

      expect(result).toBe('W')
      expect(result).toHaveLength(1)
    })

    it('should handle less than 5 games played', () => {
      const result = calculateFormFromStats({
        win: 2,
        draw: 1,
        lose: 0,
        played: 3,
      })

      expect(result).toHaveLength(3)
    })
  })

  describe('processFormString', () => {
    it('should return empty array for empty string', () => {
      const result = processFormString('')
      expect(result).toEqual([])
    })

    it('should return empty array for undefined or falsy input', () => {
      const result1 = processFormString(undefined as unknown as string)
      const result2 = processFormString(null as unknown as string)

      expect(result1).toEqual([])
      expect(result2).toEqual([])
    })

    it('should reverse form string and show oldest->newest', () => {
      // Input: WDLWW (newest first from API)
      // Output: [W, W, L, D, W] (oldest first, left to right)
      const result = processFormString('WDLWW')
      expect(result).toEqual(['W', 'W', 'L', 'D', 'W'])
    })

    it('should limit to last 5 results after reversing', () => {
      // Input has 7 chars, should take last 5 after reversing
      const result = processFormString('WWDLWDL')
      expect(result).toHaveLength(5)
      // WWDLWDL -> reverse -> LDWLDWW -> slice last 5 -> ['L', 'D', 'W', 'L', 'D']
      // Actually: split().reverse().slice(-5) gives us the last 5 chars in reversed order
      expect(result).toEqual(['W', 'L', 'D', 'W', 'W'])
    })

    it('should handle exactly 5 results', () => {
      const result = processFormString('WDLWW')
      expect(result).toHaveLength(5)
      expect(result).toEqual(['W', 'W', 'L', 'D', 'W'])
    })

    it('should handle less than 5 results', () => {
      const result = processFormString('WWL')
      expect(result).toHaveLength(3)
      expect(result).toEqual(['L', 'W', 'W'])
    })

    it('should handle single result', () => {
      const result = processFormString('W')
      expect(result).toEqual(['W'])
    })
  })
})
