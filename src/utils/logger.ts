/**
 * Centralized Logger Utility
 *
 * Provides structured logging with environment-aware behavior.
 * In production, debug logs are suppressed.
 * Can be extended to send errors to tracking services.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDev = import.meta.env.DEV;

  private log(level: LogLevel, ...args: any[]) {
    if (!this.isDev && level === 'debug') {
      return; // Skip debug logs in production
    }

    const prefix = `[${level.toUpperCase()}]`;

    switch (level) {
      case 'error':
        console.error(prefix, ...args);
        // TODO: Send to error tracking service (e.g., Sentry)
        break;
      case 'warn':
        console.warn(prefix, ...args);
        break;
      case 'info':
        console.info(prefix, ...args);
        break;
      case 'debug':
        console.log(prefix, ...args);
        break;
    }
  }

  /**
   * Debug logs - only visible in development
   */
  debug(...args: any[]) {
    this.log('debug', ...args);
  }

  /**
   * Info logs - general information
   */
  info(...args: any[]) {
    this.log('info', ...args);
  }

  /**
   * Warning logs - potential issues
   */
  warn(...args: any[]) {
    this.log('warn', ...args);
  }

  /**
   * Error logs - critical errors
   * TODO: Integrate with error tracking service
   */
  error(...args: any[]) {
    this.log('error', ...args);
  }
}

export const logger = new Logger();
