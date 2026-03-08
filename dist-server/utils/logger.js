"use strict";
/**
 * Logger utility for ClawNexus
 * Provides structured logging with different levels
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.Logger = exports.LogLevel = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "ERROR";
    LogLevel["WARN"] = "WARN";
    LogLevel["INFO"] = "INFO";
    LogLevel["DEBUG"] = "DEBUG";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
/**
 * Logger class for structured logging
 */
class Logger {
    constructor(logDir, logLevel) {
        this.logDir = logDir || path_1.default.join(process.env.HOME || process.env.USERPROFILE || '.', '.openclaw', 'logs');
        this.logFile = path_1.default.join(this.logDir, 'clawnexus.log');
        this.logLevel = logLevel || LogLevel.INFO;
        this.isDevelopment = process.env.NODE_ENV !== 'production';
        // Ensure log directory exists
        if (!fs_1.default.existsSync(this.logDir)) {
            fs_1.default.mkdirSync(this.logDir, { recursive: true });
        }
    }
    /**
     * Format log entry
     */
    formatEntry(entry) {
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
    writeToFile(entry) {
        try {
            const formatted = this.formatEntry(entry);
            fs_1.default.appendFileSync(this.logFile, formatted + '\n');
            // Rotate log file if it gets too large (10MB)
            const stats = fs_1.default.statSync(this.logFile);
            if (stats.size > 10 * 1024 * 1024) {
                this.rotateLogFile();
            }
        }
        catch (err) {
            console.error('Failed to write to log file:', err);
        }
    }
    /**
     * Rotate log file
     */
    rotateLogFile() {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFile = path_1.default.join(this.logDir, `clawnexus-${timestamp}.log`);
            fs_1.default.renameSync(this.logFile, backupFile);
            // Keep only last 10 log files
            const files = fs_1.default.readdirSync(this.logDir)
                .filter(f => f.startsWith('clawnexus-') && f.endsWith('.log'))
                .sort()
                .reverse();
            for (let i = 10; i < files.length; i++) {
                fs_1.default.unlinkSync(path_1.default.join(this.logDir, files[i]));
            }
        }
        catch (err) {
            console.error('Failed to rotate log file:', err);
        }
    }
    /**
     * Log error
     */
    error(message, error, context) {
        const entry = {
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
    warn(message, context) {
        const entry = {
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
    info(message, context) {
        const entry = {
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
    debug(message, context) {
        if (this.logLevel !== LogLevel.DEBUG) {
            return;
        }
        const entry = {
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
    getLogFile() {
        return this.logFile;
    }
    /**
     * Get log directory
     */
    getLogDir() {
        return this.logDir;
    }
    /**
     * Clear old logs
     */
    clearOldLogs(daysToKeep = 7) {
        try {
            const now = Date.now();
            const maxAge = daysToKeep * 24 * 60 * 60 * 1000;
            const files = fs_1.default.readdirSync(this.logDir);
            for (const file of files) {
                const filePath = path_1.default.join(this.logDir, file);
                const stats = fs_1.default.statSync(filePath);
                if (now - stats.mtime.getTime() > maxAge) {
                    fs_1.default.unlinkSync(filePath);
                    this.info(`Deleted old log file: ${file}`);
                }
            }
        }
        catch (err) {
            this.error('Failed to clear old logs', err);
        }
    }
}
exports.Logger = Logger;
// Create global logger instance
exports.logger = new Logger();
exports.default = exports.logger;
