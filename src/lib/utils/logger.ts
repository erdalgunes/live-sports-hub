type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

interface LogEntry {
  level: LogLevel
  message: string
  context?: LogContext
  timestamp: string
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  private formatLog(entry: LogEntry): string {
    const { level, message, context, timestamp } = entry
    const contextStr = context ? ` ${JSON.stringify(context)}` : ''
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    const entry: LogEntry = {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
    }

    const formattedLog = this.formatLog(entry)

    switch (level) {
      case 'debug':
        if (this.isDevelopment) {
          console.debug(formattedLog)
        }
        break
      case 'info':
        console.info(formattedLog)
        break
      case 'warn':
        console.warn(formattedLog)
        break
      case 'error':
        console.error(formattedLog)
        if (context?.error instanceof Error) {
          console.error(context.error.stack)
        }
        break
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context)
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context)
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context)
  }

  error(message: string, context?: LogContext): void {
    this.log('error', message, context)
  }
}

export const logger = new Logger()
