/**
 * File Cleanup Service
 * Automatically deletes generated files that are not downloaded within 1 hour
 */

import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger.js';

interface GeneratedFile {
  id: string;
  path: string;
  createdAt: Date;
  downloadedAt?: Date;
  expiresAt: Date;
}

/**
 * File Cleanup Service
 * Manages automatic deletion of generated files
 */
export class FileCleanupService {
  private generatedFiles: Map<string, GeneratedFile> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;
  private readonly EXPIRATION_TIME = 60 * 60 * 1000; // 1 hour in milliseconds
  private readonly CLEANUP_CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes

  /**
   * Start the cleanup service
   */
  start(): void {
    if (this.cleanupInterval) {
      logger.warn('File cleanup service is already running');
      return;
    }

    logger.info('Starting file cleanup service', {
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
  stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      logger.info('File cleanup service stopped');
    }
  }

  /**
   * Register a generated file for tracking
   */
  registerFile(fileId: string, filePath: string): void {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.EXPIRATION_TIME);

    this.generatedFiles.set(fileId, {
      id: fileId,
      path: filePath,
      createdAt: now,
      expiresAt,
    });

    logger.info('File registered for cleanup tracking', {
      fileId,
      filePath,
      expiresAt: expiresAt.toISOString(),
    });
  }

  /**
   * Mark a file as downloaded (prevents deletion)
   */
  markAsDownloaded(fileId: string): boolean {
    const file = this.generatedFiles.get(fileId);
    if (!file) {
      logger.warn('File not found for download marking', { fileId });
      return false;
    }

    file.downloadedAt = new Date();
    logger.info('File marked as downloaded', {
      fileId,
      downloadedAt: file.downloadedAt.toISOString(),
    });

    return true;
  }

  /**
   * Perform cleanup of expired files
   */
  private performCleanup(): void {
    const now = new Date();
    const filesToDelete: string[] = [];

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
      logger.info('File cleanup completed', {
        deletedCount: filesToDelete.length,
        remainingFiles: this.generatedFiles.size - filesToDelete.length,
      });
    }
  }

  /**
   * Delete a file and remove from tracking
   */
  private deleteFile(fileId: string): void {
    const file = this.generatedFiles.get(fileId);
    if (!file) {
      return;
    }

    try {
      // Delete the file if it exists
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
        logger.info('Generated file deleted (expired)', {
          fileId,
          filePath: file.path,
          createdAt: file.createdAt.toISOString(),
          expiresAt: file.expiresAt.toISOString(),
        });
      }

      // Remove from tracking
      this.generatedFiles.delete(fileId);
    } catch (error) {
      logger.error('Failed to delete expired file', error as Error, {
        fileId,
        filePath: file.path,
      });
    }
  }

  /**
   * Get file status
   */
  getFileStatus(fileId: string): {
    exists: boolean;
    downloaded: boolean;
    expiresAt: Date | null;
    timeRemaining: number | null;
  } | null {
    const file = this.generatedFiles.get(fileId);
    if (!file) {
      return null;
    }

    const now = new Date();
    const timeRemaining = Math.max(0, file.expiresAt.getTime() - now.getTime());

    return {
      exists: fs.existsSync(file.path),
      downloaded: !!file.downloadedAt,
      expiresAt: file.expiresAt,
      timeRemaining,
    };
  }

  /**
   * Get all tracked files
   */
  getTrackedFiles(): GeneratedFile[] {
    return Array.from(this.generatedFiles.values());
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalTracked: number;
    downloaded: number;
    pending: number;
    expired: number;
  } {
    const now = new Date();
    let downloaded = 0;
    let expired = 0;

    for (const file of this.generatedFiles.values()) {
      if (file.downloadedAt) {
        downloaded++;
      } else if (now > file.expiresAt) {
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
  cleanupAll(): void {
    for (const fileId of this.generatedFiles.keys()) {
      this.deleteFile(fileId);
    }
    logger.info('All tracked files cleaned up');
  }
}

// Create global instance
export const fileCleanupService = new FileCleanupService();

export default fileCleanupService;
