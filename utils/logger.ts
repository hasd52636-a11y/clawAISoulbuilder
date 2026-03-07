/**
 * Logger utility for ClawNexus
 * Provides structured logging with different levels
 */

import fs from 'fs';
import path from 'path';

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: any;
  error?: any;
}

/**
 * Logger class for structured logging
 */
export class Logger {
  private logDir: string;
  private logFile: string;
  private logLevel: LogLevel;
  private isDevelopment: boolean;

  constructor(logDir?: string, logLevel?: LogLevel) {
    this.logDir = logDir || path.join(process.env.HOME || process.env.USERPROFILE || '.', '.openclaw', 'logs');
    this.logFile = path.join(this.logDir, 'clawnexus.log');
    this.logLevel = logLevel || LogLevel.INFO;
    this.isDevelopment = process.env.NODE_ENV !== 'production';

    // Ensure log directory exists
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Format log entry
   */
  private formatEntry(entry: LogEntry): string {
    const { timestamp, level, message, context, error } = entry;
    let formatted = `[${timestamp}] [${level}] ${message}`;

    if (context) {
      formatted += ` | ${JSON.stringify(context)}`;
    }

    if (error) {
      formatted += ` | Error: ${error.message || error}`;
      if (this.isDevelopment && error.stack) {
        formatted += `\n${error.stack}`;
      }
    }

    return formatted;
  }

  /**
   * Write log entry to file
   */
  private writeToFile(entry: LogEntry): void {
    try {
      const formatted = this.formatEntry(entry);
      fs.appendFileSync(this.logFile, formatted + '\n');

      // Rotate log file if it gets too large (10MB)
      const stats = fs.statSync(this.logFile);
      if (stats.size > 10 * 1024 * 1024) {
        this.rotateLogFile();
      }
    } catch (err) {
      console.error('Failed to write to log file:', err);
    }
  }

  /**
   * Rotate log file
   */
  private rotateLogFile(): void {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(this.logDir, `clawnexus-${timestamp}.log`);
      fs.renameSync(this.logFile, backupFile);

      // Keep only last 10 log files
      const files = fs.readdirSync(this.logDir)
        .filter(f => f.startsWith('clawnexus-') && f.endsWith('.log'))
        .sort()
        .reverse();

      for (let i = 10; i < files.length; i++) {
        fs.unlinkSync(path.join(this.logDir, files[i]));
      }
    } catch (err) {
      console.error('Failed to rotate log file:', err);
    }
  }

  /**
   * Log error
   */
  error(message: string, error?: Error | any, context?: any): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      message,
      context,
      error,
    };

    if (this.isDevelopment) {
      console.error(`[${entry.level}] ${message}`, context, error);
    }

    this.writeToFile(entry);
  }

  /**
   * Log warning
   */
  warn(message: string, context?: any): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.WARN,
      message,
      context,
    };

    if (this.isDevelopment) {
      console.warn(`[${entry.level}] ${message}`, context);
    }

    this.writeToFile(entry);
  }

  /**
   * Log info
   */
  info(message: string, context?: any): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      message,
      context,
    };

    if (this.isDevelopment) {
      console.log(`[${entry.level}] ${message}`, context);
    }

    this.writeToFile(entry);
  }

  /**
   * Log debug
   */
  debug(message: string, context?: any): void {
    if (this.logLevel !== LogLevel.DEBUG) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.DEBUG,
      message,
      context,
    };

    if (this.isDevelopment) {
      console.debug(`[${entry.level}] ${message}`, context);
    }

    this.writeToFile(entry);
  }

  /**
   * Get log file path
   */
  getLogFile(): string {
    return this.logFile;
  }

  /**
   * Get log directory
   */
  getLogDir(): string {
    return this.logDir;
  }

  /**
   * Clear old logs
   */
  clearOldLogs(daysToKeep: number = 7): void {
    try {
      const now = Date.now();
      const maxAge = daysToKeep * 24 * 60 * 60 * 1000;

      const files = fs.readdirSync(this.logDir);
      for (const file of files) {
        const filePath = path.join(this.logDir, file);
        const stats = fs.statSync(filePath);

        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filePath);
          this.info(`Deleted old log file: ${file}`);
        }
      }
    } catch (err) {
      this.error('Failed to clear old logs', err as Error);
    }
  }
}

// Create global logger instance
export const logger = new Logger();

export default logger;
