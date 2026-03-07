/**
 * File Download Service
 * Handles generation and download of agent configuration files
 */

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import JSZip from 'jszip';
import { logger } from '../utils/logger.js';
import { fileCleanupService } from './fileCleanupService.js';

interface FilePackage {
  id: string;
  userId: string;
  configId: string;
  agentName: string;
  files: Record<string, string>;
  createdAt: Date;
  zipPath?: string;
}

/**
 * File Download Service
 * Manages file generation and download
 */
export class FileDownloadService {
  private filePackages: Map<string, FilePackage> = new Map();
  private readonly TEMP_DIR = path.join(process.env.HOME || process.env.USERPROFILE || '.', '.openclaw', 'temp');

  constructor() {
    // Ensure temp directory exists
    if (!fs.existsSync(this.TEMP_DIR)) {
      fs.mkdirSync(this.TEMP_DIR, { recursive: true });
      logger.info('Created temp directory for file downloads', { path: this.TEMP_DIR });
    }
  }

  /**
   * Create a file package (ZIP with all configuration files)
   */
  async createFilePackage(
    userId: string,
    configId: string,
    agentName: string,
    files: Record<string, string>
  ): Promise<{ packageId: string; downloadUrl: string }> {
    const packageId = uuidv4();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const zipFileName = `${agentName}-${timestamp}.zip`;
    const zipPath = path.join(this.TEMP_DIR, zipFileName);

    try {
      // Create ZIP file
      const zip = new JSZip();

      // Add all files to ZIP
      for (const [fileName, content] of Object.entries(files)) {
        zip.file(fileName, content);
      }

      // Write ZIP to disk
      const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
      fs.writeFileSync(zipPath, zipBuffer);

      // Register file package
      const filePackage: FilePackage = {
        id: packageId,
        userId,
        configId,
        agentName,
        files,
        createdAt: new Date(),
        zipPath,
      };

      this.filePackages.set(packageId, filePackage);

      // Register with cleanup service
      fileCleanupService.registerFile(packageId, zipPath);

      logger.info('File package created', {
        packageId,
        userId,
        configId,
        agentName,
        zipPath,
        fileCount: Object.keys(files).length,
      });

      return {
        packageId,
        downloadUrl: `/api/v1/downloads/${packageId}`,
      };
    } catch (error) {
      logger.error('Failed to create file package', error as Error, {
        packageId,
        agentName,
        zipPath,
      });
      throw error;
    }
  }

  /**
   * Get file package for download
   */
  getFilePackage(packageId: string): FilePackage | null {
    return this.filePackages.get(packageId) || null;
  }

  /**
   * Download file package (mark as downloaded)
   */
  downloadFilePackage(packageId: string): { path: string; fileName: string } | null {
    const filePackage = this.filePackages.get(packageId);
    if (!filePackage || !filePackage.zipPath) {
      logger.warn('File package not found for download', { packageId });
      return null;
    }

    // Check if file still exists
    if (!fs.existsSync(filePackage.zipPath)) {
      logger.warn('File package file not found on disk', { packageId, path: filePackage.zipPath });
      this.filePackages.delete(packageId);
      return null;
    }

    // Mark as downloaded in cleanup service
    fileCleanupService.markAsDownloaded(packageId);

    const fileName = path.basename(filePackage.zipPath);

    logger.info('File package downloaded', {
      packageId,
      userId: filePackage.userId,
      configId: filePackage.configId,
      fileName,
    });

    return {
      path: filePackage.zipPath,
      fileName,
    };
  }

  /**
   * Get download status
   */
  getDownloadStatus(packageId: string): {
    exists: boolean;
    downloaded: boolean;
    expiresAt: Date | null;
    timeRemaining: number | null;
    agentName: string | null;
  } | null {
    const filePackage = this.filePackages.get(packageId);
    if (!filePackage) {
      return null;
    }

    const cleanupStatus = fileCleanupService.getFileStatus(packageId);
    if (!cleanupStatus) {
      return null;
    }

    return {
      exists: cleanupStatus.exists,
      downloaded: cleanupStatus.downloaded,
      expiresAt: cleanupStatus.expiresAt,
      timeRemaining: cleanupStatus.timeRemaining,
      agentName: filePackage.agentName,
    };
  }

  /**
   * Get all file packages for a user
   */
  getUserFilePackages(userId: string): FilePackage[] {
    return Array.from(this.filePackages.values()).filter(pkg => pkg.userId === userId);
  }

  /**
   * Delete a file package manually
   */
  deleteFilePackage(packageId: string): boolean {
    const filePackage = this.filePackages.get(packageId);
    if (!filePackage) {
      return false;
    }

    try {
      if (filePackage.zipPath && fs.existsSync(filePackage.zipPath)) {
        fs.unlinkSync(filePackage.zipPath);
      }

      this.filePackages.delete(packageId);

      logger.info('File package deleted manually', {
        packageId,
        userId: filePackage.userId,
        configId: filePackage.configId,
      });

      return true;
    } catch (error) {
      logger.error('Failed to delete file package', error as Error, { packageId });
      return false;
    }
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalPackages: number;
    totalSize: number;
    averageSize: number;
  } {
    let totalSize = 0;
    let count = 0;

    for (const filePackage of this.filePackages.values()) {
      if (filePackage.zipPath && fs.existsSync(filePackage.zipPath)) {
        const stats = fs.statSync(filePackage.zipPath);
        totalSize += stats.size;
        count++;
      }
    }

    return {
      totalPackages: this.filePackages.size,
      totalSize,
      averageSize: count > 0 ? totalSize / count : 0,
    };
  }

  /**
   * Clean up all file packages
   */
  cleanupAll(): void {
    for (const packageId of this.filePackages.keys()) {
      this.deleteFilePackage(packageId);
    }
    logger.info('All file packages cleaned up');
  }
}

// Create global instance
export const fileDownloadService = new FileDownloadService();

export default fileDownloadService;
