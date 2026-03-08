"use strict";
/**
 * File Cleanup Service
 * Automatically deletes generated files that are not downloaded within 1 hour
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileCleanupService = exports.FileCleanupService = void 0;
const fs_1 = require("fs");
const logger_js_1 = require("../utils/logger.js");
/**
 * File Cleanup Service
 * Manages automatic deletion of generated files
 */
class FileCleanupService {
    constructor() {
        this.generatedFiles = new Map();
        this.cleanupInterval = null;
        this.EXPIRATION_TIME = 60 * 60 * 1000; // 1 hour in milliseconds
        this.CLEANUP_CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes
    }
    /**
     * Start the cleanup service
     */
    start() {
        if (this.cleanupInterval) {
            logger_js_1.logger.warn('File cleanup service is already running');
            return;
        }
        logger_js_1.logger.info('Starting file cleanup service', {
            expirationTime: `${this.EXPIRATION_TIME / 1000 / 60} minutes`,
            checkInterval: `${this.CLEANUP_CHECK_INTERVAL / 1000 / 60} minutes`,
        });
        // Run cleanup check immediately
        this.performCleanup();
        // Schedule periodic cleanup
        this.cleanupInterval = setInterval(() => {
            this.performCleanup();
        }, this.CLEANUP_CHECK_INTERVAL);
    }
    /**
     * Stop the cleanup service
     */
    stop() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
            logger_js_1.logger.info('File cleanup service stopped');
        }
    }
    /**
     * Register a generated file for tracking
     */
    registerFile(fileId, filePath) {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + this.EXPIRATION_TIME);
        this.generatedFiles.set(fileId, {
            id: fileId,
            path: filePath,
            createdAt: now,
            expiresAt,
        });
        logger_js_1.logger.info('File registered for cleanup tracking', {
            fileId,
            filePath,
            expiresAt: expiresAt.toISOString(),
        });
    }
    /**
     * Mark a file as downloaded (prevents deletion)
     */
    markAsDownloaded(fileId) {
        const file = this.generatedFiles.get(fileId);
        if (!file) {
            logger_js_1.logger.warn('File not found for download marking', { fileId });
            return false;
        }
        file.downloadedAt = new Date();
        logger_js_1.logger.info('File marked as downloaded', {
            fileId,
            downloadedAt: file.downloadedAt.toISOString(),
        });
        return true;
    }
    /**
     * Perform cleanup of expired files
     */
    performCleanup() {
        const now = new Date();
        const filesToDelete = [];
        // Find expired files that haven't been downloaded
        for (const [fileId, file] of this.generatedFiles.entries()) {
            if (file.downloadedAt) {
                // File was downloaded, keep it
                continue;
            }
            if (now > file.expiresAt) {
                filesToDelete.push(fileId);
            }
        }
        // Delete expired files
        for (const fileId of filesToDelete) {
            this.deleteFile(fileId);
        }
        if (filesToDelete.length > 0) {
            logger_js_1.logger.info('File cleanup completed', {
                deletedCount: filesToDelete.length,
                remainingFiles: this.generatedFiles.size - filesToDelete.length,
            });
        }
    }
    /**
     * Delete a file and remove from tracking
     */
    deleteFile(fileId) {
        const file = this.generatedFiles.get(fileId);
        if (!file) {
            return;
        }
        try {
            // Delete the file if it exists
            if (fs_1.default.existsSync(file.path)) {
                fs_1.default.unlinkSync(file.path);
                logger_js_1.logger.info('Generated file deleted (expired)', {
                    fileId,
                    filePath: file.path,
                    createdAt: file.createdAt.toISOString(),
                    expiresAt: file.expiresAt.toISOString(),
                });
            }
            // Remove from tracking
            this.generatedFiles.delete(fileId);
        }
        catch (error) {
            logger_js_1.logger.error('Failed to delete expired file', error, {
                fileId,
                filePath: file.path,
            });
        }
    }
    /**
     * Get file status
     */
    getFileStatus(fileId) {
        const file = this.generatedFiles.get(fileId);
        if (!file) {
            return null;
        }
        const now = new Date();
        const timeRemaining = Math.max(0, file.expiresAt.getTime() - now.getTime());
        return {
            exists: fs_1.default.existsSync(file.path),
            downloaded: !!file.downloadedAt,
            expiresAt: file.expiresAt,
            timeRemaining,
        };
    }
    /**
     * Get all tracked files
     */
    getTrackedFiles() {
        return Array.from(this.generatedFiles.values());
    }
    /**
     * Get statistics
     */
    getStatistics() {
        const now = new Date();
        let downloaded = 0;
        let expired = 0;
        for (const file of this.generatedFiles.values()) {
            if (file.downloadedAt) {
                downloaded++;
            }
            else if (now > file.expiresAt) {
                expired++;
            }
        }
        return {
            totalTracked: this.generatedFiles.size,
            downloaded,
            pending: this.generatedFiles.size - downloaded - expired,
            expired,
        };
    }
    /**
     * Clean up all files (for testing/shutdown)
     */
    cleanupAll() {
        for (const fileId of this.generatedFiles.keys()) {
            this.deleteFile(fileId);
        }
        logger_js_1.logger.info('All tracked files cleaned up');
    }
}
exports.FileCleanupService = FileCleanupService;
// Create global instance
exports.fileCleanupService = new FileCleanupService();
exports.default = exports.fileCleanupService;
