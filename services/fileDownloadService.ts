/**
 * File Download Service
 * Handles generation and download of agent configuration files
 * Vercel-compatible version - uses in-memory storage
 */

import { v4 as uuidv4 } from 'uuid';
import JSZip from 'jszip';
import { logger } from '../utils/logger.js';

interface FilePackage {
  id: string;
  userId: string;
  configId: string;
  agentName: string;
  files: Record<string, string>;
  createdAt: Date;
  zipData?: Buffer;
  expiresAt: Date;
}

/**
 * File Download Service
 * Manages file generation and download
 */
export class FileDownloadService {
  private filePackages: Map<string, FilePackage> = new Map();
  private readonly EXPIRY_HOURS = 12;

  constructor() {
    logger.info('FileDownloadService initialized (in-memory mode for Vercel)');
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

    try {
      const zip = new JSZip();

      for (const [fileName, content] of Object.entries(files)) {
        zip.file(fileName, content);
      }

      const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

      const expiresAt = new Date(Date.now() + this.EXPIRY_HOURS * 60 * 60 * 1000);

      const filePackage: FilePackage = {
        id: packageId,
        userId,
        configId,
        agentName,
        files,
        createdAt: new Date(),
        zipData: zipBuffer,
        expiresAt,
      };

      this.filePackages.set(packageId, filePackage);

      logger.info('File package created', {
        packageId,
        userId,
        configId,
        agentName,
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
      });
      throw error;
    }
  }

  /**
   * Get file package for download
   */
  getFilePackage(packageId: string): FilePackage | null {
    const pkg = this.filePackages.get(packageId);
    if (!pkg) return null;
    
    if (new Date() > pkg.expiresAt) {
      this.filePackages.delete(packageId);
      return null;
    }
    
    return pkg;
  }

  /**
   * Download file package
   */
  downloadFilePackage(packageId: string): { data: Buffer; fileName: string } | null {
    const filePackage = this.getFilePackage(packageId);
    if (!filePackage || !filePackage.zipData) {
      logger.warn('File package not found for download', { packageId });
      return null;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${filePackage.agentName}-${timestamp}.zip`;

    logger.info('File package downloaded', {
      packageId,
      userId: filePackage.userId,
      configId: filePackage.configId,
      fileName,
    });

    return {
      data: filePackage.zipData,
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
    const filePackage = this.getFilePackage(packageId);
    if (!filePackage) return null;

    const now = new Date();
    const timeRemaining = filePackage.expiresAt.getTime() - now.getTime();

    return {
      exists: true,
      downloaded: false,
      expiresAt: filePackage.expiresAt,
      timeRemaining: timeRemaining > 0 ? timeRemaining : 0,
      agentName: filePackage.agentName,
    };
  }

  /**
   * Delete expired packages
   */
  cleanupExpired(): void {
    const now = new Date();
    for (const [id, pkg] of this.filePackages.entries()) {
      if (pkg.expiresAt < now) {
        this.filePackages.delete(id);
        logger.info('Expired file package removed', { packageId: id });
      }
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
      if (filePackage.zipData) {
        totalSize += filePackage.zipData.length;
        count++;
      }
    }

    return {
      totalPackages: this.filePackages.size,
      totalSize,
      averageSize: count > 0 ? totalSize / count : 0,
    };
  }
}

// Create global instance
export const fileDownloadService = new FileDownloadService();

export default fileDownloadService;
