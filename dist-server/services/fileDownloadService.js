"use strict";
/**
 * File Download Service
 * Handles generation and download of agent configuration files
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileDownloadService = exports.FileDownloadService = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const uuid_1 = require("uuid");
const jszip_1 = require("jszip");
const logger_js_1 = require("../utils/logger.js");
const fileCleanupService_js_1 = require("./fileCleanupService.js");
/**
 * File Download Service
 * Manages file generation and download
 */
class FileDownloadService {
    constructor() {
        this.filePackages = new Map();
        this.TEMP_DIR = path_1.default.join(process.env.HOME || process.env.USERPROFILE || '.', '.openclaw', 'temp');
        // Ensure temp directory exists
        if (!fs_1.default.existsSync(this.TEMP_DIR)) {
            fs_1.default.mkdirSync(this.TEMP_DIR, { recursive: true });
            logger_js_1.logger.info('Created temp directory for file downloads', { path: this.TEMP_DIR });
        }
    }
    /**
     * Create a file package (ZIP with all configuration files)
     */
    async createFilePackage(userId, configId, agentName, files) {
        const packageId = (0, uuid_1.v4)();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const zipFileName = `${agentName}-${timestamp}.zip`;
        const zipPath = path_1.default.join(this.TEMP_DIR, zipFileName);
        try {
            // Create ZIP file
            const zip = new jszip_1.default();
            // Add all files to ZIP
            for (const [fileName, content] of Object.entries(files)) {
                zip.file(fileName, content);
            }
            // Write ZIP to disk
            const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
            fs_1.default.writeFileSync(zipPath, zipBuffer);
            // Register file package
            const filePackage = {
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
            fileCleanupService_js_1.fileCleanupService.registerFile(packageId, zipPath);
            logger_js_1.logger.info('File package created', {
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
        }
        catch (error) {
            logger_js_1.logger.error('Failed to create file package', error, {
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
    getFilePackage(packageId) {
        return this.filePackages.get(packageId) || null;
    }
    /**
     * Download file package (mark as downloaded)
     */
    downloadFilePackage(packageId) {
        const filePackage = this.filePackages.get(packageId);
        if (!filePackage || !filePackage.zipPath) {
            logger_js_1.logger.warn('File package not found for download', { packageId });
            return null;
        }
        // Check if file still exists
        if (!fs_1.default.existsSync(filePackage.zipPath)) {
            logger_js_1.logger.warn('File package file not found on disk', { packageId, path: filePackage.zipPath });
            this.filePackages.delete(packageId);
            return null;
        }
        // Mark as downloaded in cleanup service
        fileCleanupService_js_1.fileCleanupService.markAsDownloaded(packageId);
        const fileName = path_1.default.basename(filePackage.zipPath);
        logger_js_1.logger.info('File package downloaded', {
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
    getDownloadStatus(packageId) {
        const filePackage = this.filePackages.get(packageId);
        if (!filePackage) {
            return null;
        }
        const cleanupStatus = fileCleanupService_js_1.fileCleanupService.getFileStatus(packageId);
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
    getUserFilePackages(userId) {
        return Array.from(this.filePackages.values()).filter(pkg => pkg.userId === userId);
    }
    /**
     * Delete a file package manually
     */
    deleteFilePackage(packageId) {
        const filePackage = this.filePackages.get(packageId);
        if (!filePackage) {
            return false;
        }
        try {
            if (filePackage.zipPath && fs_1.default.existsSync(filePackage.zipPath)) {
                fs_1.default.unlinkSync(filePackage.zipPath);
            }
            this.filePackages.delete(packageId);
            logger_js_1.logger.info('File package deleted manually', {
                packageId,
                userId: filePackage.userId,
                configId: filePackage.configId,
            });
            return true;
        }
        catch (error) {
            logger_js_1.logger.error('Failed to delete file package', error, { packageId });
            return false;
        }
    }
    /**
     * Get statistics
     */
    getStatistics() {
        let totalSize = 0;
        let count = 0;
        for (const filePackage of this.filePackages.values()) {
            if (filePackage.zipPath && fs_1.default.existsSync(filePackage.zipPath)) {
                const stats = fs_1.default.statSync(filePackage.zipPath);
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
    cleanupAll() {
        for (const packageId of this.filePackages.keys()) {
            this.deleteFilePackage(packageId);
        }
        logger_js_1.logger.info('All file packages cleaned up');
    }
}
exports.FileDownloadService = FileDownloadService;
// Create global instance
exports.fileDownloadService = new FileDownloadService();
exports.default = exports.fileDownloadService;
