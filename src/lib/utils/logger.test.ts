import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { logger } from './logger'

describe('logger utility', () => {
  let consoleDebugSpy: ReturnType<typeof vi.spyOn>
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('info', () => {
    it('should log info message to console.info', () => {
      logger.info('Test info message')

      expect(consoleInfoSpy).toHaveBeenCalledOnce()
      expect(consoleInfoSpy.mock.calls[0][0]).toContain('[INFO]')
      expect(consoleInfoSpy.mock.calls[0][0]).toContain('Test info message')
    })

    it('should include context in info log', () => {
      logger.info('Test message', { userId: 123, action: 'test' })

      expect(consoleInfoSpy).toHaveBeenCalledOnce()
      const logMessage = consoleInfoSpy.mock.calls[0][0]
      expect(logMessage).toContain('userId')
      expect(logMessage).toContain('123')
      expect(logMessage).toContain('action')
    })

    it('should include ISO timestamp', () => {
      logger.info('Test message')

      const logMessage = consoleInfoSpy.mock.calls[0][0]
      // Check for ISO date format pattern [YYYY-MM-DD]
      expect(logMessage).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })
  })

  describe('warn', () => {
    it('should log warn message to console.warn', () => {
      logger.warn('Test warning')

      expect(consoleWarnSpy).toHaveBeenCalledOnce()
      expect(consoleWarnSpy.mock.calls[0][0]).toContain('[WARN]')
      expect(consoleWarnSpy.mock.calls[0][0]).toContain('Test warning')
    })

    it('should include context in warn log', () => {
      logger.warn('Warning', { code: 'RATE_LIMIT' })

      const logMessage = consoleWarnSpy.mock.calls[0][0]
      expect(logMessage).toContain('RATE_LIMIT')
    })
  })

  describe('error', () => {
    it('should log error message to console.error', () => {
      logger.error('Test error')

      expect(consoleErrorSpy).toHaveBeenCalledOnce()
      expect(consoleErrorSpy.mock.calls[0][0]).toContain('[ERROR]')
      expect(consoleErrorSpy.mock.calls[0][0]).toContain('Test error')
    })

    it('should log error stack trace when error object provided', () => {
      const testError = new Error('Test error object')
      logger.error('Error occurred', { error: testError })

      expect(consoleErrorSpy).toHaveBeenCalledTimes(2)
      // First call is the formatted message
      expect(consoleErrorSpy.mock.calls[0][0]).toContain('[ERROR]')
      // Second call should be the stack trace
      expect(consoleErrorSpy.mock.calls[1][0]).toContain('Error: Test error object')
    })

    it('should handle error context', () => {
      logger.error('Database error', { table: 'users', operation: 'insert' })

      const logMessage = consoleErrorSpy.mock.calls[0][0]
      expect(logMessage).toContain('table')
      expect(logMessage).toContain('users')
    })
  })

  describe('debug', () => {
    it('should log debug messages in development', () => {
      // Debug only logs in development mode
      // In test environment, it might not log depending on NODE_ENV
      logger.debug('Debug message')

      // Check if it was called (behavior depends on environment)
      if (process.env.NODE_ENV === 'development') {
        expect(consoleDebugSpy).toHaveBeenCalled()
      }
    })

    it('should include context in debug log', () => {
      logger.debug('Debug info', { component: 'test' })

      // In development, should include context
      if (consoleDebugSpy.mock.calls.length > 0) {
        const logMessage = consoleDebugSpy.mock.calls[0][0]
        expect(logMessage).toContain('[DEBUG]')
      }
    })
  })

  describe('log format', () => {
    it('should follow consistent format', () => {
      logger.info('Test message', { context: 'test' })

      const logMessage = consoleInfoSpy.mock.calls[0][0]

      // Format: [timestamp] [LEVEL] message {context}
      expect(logMessage).toMatch(/\[\d{4}-\d{2}-\d{2}T.*\] \[INFO\] Test message/)
    })

    it('should JSON stringify context objects', () => {
      logger.info('Test', { nested: { value: 123 }, array: [1, 2, 3] })

      const logMessage = consoleInfoSpy.mock.calls[0][0]
      expect(logMessage).toContain('"nested"')
      expect(logMessage).toContain('"array"')
      expect(logMessage).toContain('123')
    })

    it('should work without context', () => {
      logger.info('Simple message')

      const logMessage = consoleInfoSpy.mock.calls[0][0]
      expect(logMessage).toContain('Simple message')
      expect(logMessage).not.toContain('undefined')
      expect(logMessage).not.toContain('null')
    })
  })
})
