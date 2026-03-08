"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vite_1 = require("vite");
const cors_1 = require("cors");
const dotenv_1 = require("dotenv");
const genai_1 = require("@google/genai");
const celebritySoulsSystem_js_1 = require("./utils/celebritySoulsSystem.js");
const agentTemplates_js_1 = require("./templates/agentTemplates.js");
const database_js_1 = require("./db/database.js");
const ApiKey_js_1 = require("./models/ApiKey.js");
const AgentConfig_js_1 = require("./models/AgentConfig.js");
const Deployment_js_1 = require("./models/Deployment.js");
const init_js_1 = require("./db/init.js");
const logger_js_1 = require("./utils/logger.js");
const errorHandler_js_1 = require("./middleware/errorHandler.js");
const errors_js_1 = require("./utils/errors.js");
const validation_js_1 = require("./utils/validation.js");
const fileCleanupService_js_1 = require("./services/fileCleanupService.js");
const fileDownloadService_js_1 = require("./services/fileDownloadService.js");
dotenv_1.default.config();
// Initialize database on startup
(0, database_js_1.getDatabase)();
(0, init_js_1.initializeDemoData)();
logger_js_1.logger.info('Database initialized and demo data seeded');
// Start file cleanup service
fileCleanupService_js_1.fileCleanupService.start();
logger_js_1.logger.info('File cleanup service started');
// Middleware to validate API key
const validateApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
        logger_js_1.logger.warn('API key validation failed: missing API key', { path: req.path });
        throw new errors_js_1.AuthenticationError('API key required in x-api-key header');
    }
    const isValid = ApiKey_js_1.ApiKeyModel.isValid(apiKey);
    if (!isValid) {
        logger_js_1.logger.warn('API key validation failed: invalid or expired key', { path: req.path });
        throw new errors_js_1.AuthenticationError('Invalid or expired API key');
    }
    // Update last used timestamp
    const apiKeyRecord = ApiKey_js_1.ApiKeyModel.findByKey(apiKey);
    if (apiKeyRecord) {
        ApiKey_js_1.ApiKeyModel.updateLastUsed(apiKeyRecord.id);
        req.userId = apiKeyRecord.user_id;
    }
    next();
};
async function startServer() {
    const app = (0, express_1.default)();
    const PORT = process.env.PORT || 3000;
    // Add request ID middleware
    app.use(errorHandler_js_1.requestIdMiddleware);
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    logger_js_1.logger.info('Server starting...', { port: PORT });
    // Health check endpoint (no auth required)
    app.get("/api/health", (req, res) => {
        res.json({ status: "ok", timestamp: new Date().toISOString() });
    });
    // Validate API key endpoint
    app.post("/api/v1/keys/validate", (req, res) => {
        const apiKey = req.headers['x-api-key'];
        if (!apiKey) {
            return res.status(400).json({ error: 'API key required in x-api-key header' });
        }
        const isValid = ApiKey_js_1.ApiKeyModel.isValid(apiKey);
        res.json({
            valid: isValid,
            message: isValid ? 'API key is valid' : 'API key is invalid'
        });
    });
    // List available celebrity souls
    app.get("/api/v1/souls", (req, res) => {
        try {
            const souls = (0, celebritySoulsSystem_js_1.listCelebritySouls)();
            res.json({
                success: true,
                data: souls,
                count: souls.length
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to list souls'
            });
        }
    });
    // Get specific celebrity soul
    app.get("/api/v1/souls/:soulId", (req, res) => {
        try {
            const soul = (0, celebritySoulsSystem_js_1.getCelebritySoul)(req.params.soulId);
            if (!soul) {
                return res.status(404).json({
                    success: false,
                    error: 'Soul not found'
                });
            }
            res.json({
                success: true,
                data: soul
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to get soul'
            });
        }
    });
    // Generate agent configuration
    app.post("/api/v1/agents/generate", validateApiKey, (0, errorHandler_js_1.asyncHandler)(async (req, res) => {
        const { soulId, agentName, customizations } = req.body;
        const userId = req.userId;
        // Validate input
        if (!soulId) {
            throw new errors_js_1.ValidationError('soulId is required', { field: 'soulId' });
        }
        if (!agentName) {
            throw new errors_js_1.ValidationError('agentName is required', { field: 'agentName' });
        }
        (0, validation_js_1.validateSoulId)(soulId, 'soulId');
        (0, validation_js_1.validateAgentName)(agentName, 'agentName');
        const soul = (0, celebritySoulsSystem_js_1.getCelebritySoul)(soulId);
        if (!soul) {
            logger_js_1.logger.warn('Soul not found', { soulId });
            throw new errors_js_1.NotFoundError('Soul', { soulId });
        }
        logger_js_1.logger.info('Generating agent configuration', { soulId, agentName, userId });
        // Generate configuration files
        const config = (0, agentTemplates_js_1.generateAgentConfig)(soul, agentName, customizations);
        // Store in database
        const agentConfig = AgentConfig_js_1.AgentConfigModel.create(userId, soulId, agentName, config, new Date(Date.now() + 12 * 60 * 60 * 1000) // 12 hour expiry
        );
        logger_js_1.logger.info('Agent configuration created', { configId: agentConfig.id, soulId, agentName });
        res.json({
            success: true,
            data: {
                configId: agentConfig.id,
                agentId: `agent-${agentConfig.id}`,
                soulId,
                agentName: agentName || soul.name,
                files: config,
                generatedAt: agentConfig.created_at,
                expiresAt: agentConfig.expires_at,
                status: agentConfig.status
            }
        });
    }));
    // Get agent generation status
    app.get("/api/v1/agents/:agentId/status", validateApiKey, (req, res) => {
        try {
            const { agentId } = req.params;
            const apiKey = req.headers['x-api-key'];
            // Get user from API key
            const apiKeyRecord = ApiKey_js_1.ApiKeyModel.findByKey(apiKey);
            if (!apiKeyRecord) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid API key'
                });
            }
            // Find config by ID
            const config = AgentConfig_js_1.AgentConfigModel.findById(agentId);
            if (!config) {
                return res.status(404).json({
                    success: false,
                    error: 'Agent configuration not found'
                });
            }
            // Verify ownership
            if (config.user_id !== apiKeyRecord.user_id) {
                return res.status(403).json({
                    success: false,
                    error: 'Unauthorized'
                });
            }
            // Get latest deployment
            const deployment = Deployment_js_1.DeploymentModel.getLatestByConfigId(agentId);
            res.json({
                success: true,
                data: {
                    configId: config.id,
                    agentId: `agent-${config.id}`,
                    soulId: config.soul_id,
                    agentName: config.agent_name,
                    status: config.status,
                    createdAt: config.created_at,
                    expiresAt: config.expires_at,
                    deployment: deployment ? {
                        id: deployment.id,
                        status: deployment.status,
                        targetSystem: deployment.target_system,
                        result: deployment.result ? JSON.parse(deployment.result) : null,
                        deployedAt: deployment.created_at
                    } : null
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to get agent status'
            });
        }
    });
    // Create deployment
    app.post("/api/v1/deployments", validateApiKey, (0, errorHandler_js_1.asyncHandler)(async (req, res) => {
        const { configId, targetSystem } = req.body;
        const userId = req.userId;
        // Validate input
        if (!configId) {
            throw new errors_js_1.ValidationError('configId is required', { field: 'configId' });
        }
        if (!targetSystem) {
            throw new errors_js_1.ValidationError('targetSystem is required', { field: 'targetSystem' });
        }
        (0, validation_js_1.validateTargetSystem)(targetSystem, 'targetSystem');
        // Verify config exists and belongs to user
        const config = AgentConfig_js_1.AgentConfigModel.findById(configId);
        if (!config) {
            logger_js_1.logger.warn('Agent config not found', { configId });
            throw new errors_js_1.NotFoundError('Agent configuration', { configId });
        }
        if (config.user_id !== userId) {
            logger_js_1.logger.warn('Unauthorized deployment attempt', { configId, userId });
            throw new errors_js_1.AuthenticationError('Unauthorized');
        }
        logger_js_1.logger.info('Creating deployment', { configId, targetSystem, userId });
        // Create deployment
        const deployment = Deployment_js_1.DeploymentModel.create(configId, userId, targetSystem);
        logger_js_1.logger.info('Deployment created', { deploymentId: deployment.id, configId, targetSystem });
        res.json({
            success: true,
            data: {
                deploymentId: deployment.id,
                configId: deployment.config_id,
                status: deployment.status,
                targetSystem: deployment.target_system,
                createdAt: deployment.created_at
            }
        });
    }));
    // Get deployment status
    app.get("/api/v1/deployments/:deploymentId", validateApiKey, (req, res) => {
        try {
            const { deploymentId } = req.params;
            const apiKey = req.headers['x-api-key'];
            // Get user from API key
            const apiKeyRecord = ApiKey_js_1.ApiKeyModel.findByKey(apiKey);
            if (!apiKeyRecord) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid API key'
                });
            }
            // Find deployment
            const deployment = Deployment_js_1.DeploymentModel.findById(deploymentId);
            if (!deployment) {
                return res.status(404).json({
                    success: false,
                    error: 'Deployment not found'
                });
            }
            // Verify ownership
            if (deployment.user_id !== apiKeyRecord.user_id) {
                return res.status(403).json({
                    success: false,
                    error: 'Unauthorized'
                });
            }
            res.json({
                success: true,
                data: {
                    deploymentId: deployment.id,
                    configId: deployment.config_id,
                    status: deployment.status,
                    targetSystem: deployment.target_system,
                    result: deployment.result ? JSON.parse(deployment.result) : null,
                    createdAt: deployment.created_at,
                    updatedAt: deployment.updated_at
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to get deployment status'
            });
        }
    });
    // List user's agent configurations
    app.get("/api/v1/agents", validateApiKey, (req, res) => {
        try {
            const apiKey = req.headers['x-api-key'];
            // Get user from API key
            const apiKeyRecord = ApiKey_js_1.ApiKeyModel.findByKey(apiKey);
            if (!apiKeyRecord) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid API key'
                });
            }
            // Get user's configs
            const configs = AgentConfig_js_1.AgentConfigModel.findByUserId(apiKeyRecord.user_id);
            res.json({
                success: true,
                data: configs.map(config => ({
                    configId: config.id,
                    agentId: `agent-${config.id}`,
                    soulId: config.soul_id,
                    agentName: config.agent_name,
                    status: config.status,
                    createdAt: config.created_at,
                    expiresAt: config.expires_at
                })),
                count: configs.length
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to list agents'
            });
        }
    });
    // Get database statistics (admin endpoint)
    app.get("/api/v1/stats", validateApiKey, (0, errorHandler_js_1.asyncHandler)(async (req, res) => {
        try {
            const stats = (0, init_js_1.getDatabaseStats)();
            const fileStats = fileDownloadService_js_1.fileDownloadService.getStatistics();
            const cleanupStats = fileCleanupService_js_1.fileCleanupService.getStatistics();
            res.json({
                success: true,
                data: {
                    database: stats,
                    files: fileStats,
                    cleanup: cleanupStats,
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to get statistics'
            });
        }
    }));
    // Download agent configuration files
    app.get("/api/v1/downloads/:packageId", (0, errorHandler_js_1.asyncHandler)(async (req, res) => {
        const { packageId } = req.params;
        // Get file package
        const downloadInfo = fileDownloadService_js_1.fileDownloadService.downloadFilePackage(packageId);
        if (!downloadInfo) {
            logger_js_1.logger.warn('Download requested for non-existent package', { packageId });
            throw new errors_js_1.NotFoundError('Download package', { packageId });
        }
        logger_js_1.logger.info('Sending file download', {
            packageId,
            fileName: downloadInfo.fileName,
        });
        // Send file
        res.download(downloadInfo.path, downloadInfo.fileName, (err) => {
            if (err) {
                logger_js_1.logger.error('Error sending file download', err, { packageId });
            }
        });
    }));
    // Get download status
    app.get("/api/v1/downloads/:packageId/status", (0, errorHandler_js_1.asyncHandler)(async (req, res) => {
        const { packageId } = req.params;
        const status = fileDownloadService_js_1.fileDownloadService.getDownloadStatus(packageId);
        if (!status) {
            throw new errors_js_1.NotFoundError('Download package', { packageId });
        }
        res.json({
            success: true,
            data: {
                packageId,
                ...status,
                timeRemainingMinutes: status.timeRemaining ? Math.ceil(status.timeRemaining / 1000 / 60) : 0,
            }
        });
    }));
    // Chat endpoint (existing)
    app.post("/api/chat", async (req, res) => {
        try {
            const { messages, systemInstruction, temperature } = req.body;
            let responseText = "";
            // 智能模型选择 - 使用环境变量配置
            const primaryModel = process.env.PRIMARY_AI_PROVIDER || 'glm';
            const fallbackModels = process.env.FALLBACK_AI_PROVIDERS?.split(',') || ['minimax', 'gemini', 'kimi'];
            // 按优先级尝试模型
            const providers = [primaryModel, ...fallbackModels];
            // 优先使用MiniMax模型
            if (primaryModel === "minimax") {
                const ai = new genai_1.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
                const chat = ai.chats.create({
                    model: "gemini-3-flash-preview",
                    config: {
                        systemInstruction,
                        temperature: temperature || 0.7,
                    },
                });
                // Convert messages to Gemini format if needed, or just send the last user message
                const lastUserMessage = messages.filter((m) => m.role === 'user').pop();
                if (lastUserMessage) {
                    const response = await chat.sendMessage({ message: lastUserMessage.content });
                    responseText = response.text || "";
                }
            }
            else if (primaryModel === "gemini") {
                const ai = new genai_1.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
                const chat = ai.chats.create({
                    model: "gemini-3-flash-preview",
                    config: {
                        systemInstruction,
                        temperature: temperature || 0.7,
                    },
                });
                const lastUserMessage = messages.filter((m) => m.role === 'user').pop();
                if (lastUserMessage) {
                    const response = await chat.sendMessage({ message: lastUserMessage.content });
                    responseText = response.text || "";
                }
            }
            else if (primaryModel === "glm") {
                // Mock or actual implementation for GLM (Zhipu)
                const apiKey = process.env.GLM_API_KEY;
                if (!apiKey)
                    throw new Error("GLM_API_KEY is not set");
                const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model: "glm-4",
                        messages: messages,
                        temperature: temperature || 0.7
                    })
                });
                const data = await response.json();
                if (data.choices && data.choices.length > 0) {
                    responseText = data.choices[0].message.content;
                }
                else {
                    throw new Error(data.error?.message || "GLM API error");
                }
            }
            else if (primaryModel === "kimi") {
                // Mock or actual implementation for Kimi (Moonshot)
                const apiKey = process.env.KIMI_API_KEY;
                if (!apiKey)
                    throw new Error("KIMI_API_KEY is not set");
                const response = await fetch("https://api.moonshot.cn/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model: "moonshot-v1-8k",
                        messages: messages,
                        temperature: temperature || 0.7
                    })
                });
                const data = await response.json();
                if (data.choices && data.choices.length > 0) {
                    responseText = data.choices[0].message.content;
                }
                else {
                    throw new Error(data.error?.message || "Kimi API error");
                }
            }
            else {
                throw new Error("Unsupported model");
            }
            res.json({ text: responseText });
        }
        catch (error) {
            console.error("Chat API Error:", error);
            res.status(500).json({ error: error.message || "Internal Server Error" });
        }
    });
    // Vite middleware for development
    if (process.env.NODE_ENV !== "production") {
        const vite = await (0, vite_1.createServer)({
            server: { middlewareMode: true },
            appType: "spa",
        });
        app.use(vite.middlewares);
    }
    else {
        app.use(express_1.default.static("dist"));
    }
    // 404 handler (must be before error handler)
    app.use(errorHandler_js_1.notFoundHandler);
    // Global error handler (must be last)
    app.use(errorHandler_js_1.errorHandler);
    app.listen(PORT, "0.0.0.0", () => {
        logger_js_1.logger.info(`Server running on http://localhost:${PORT}`);
        logger_js_1.logger.info(`API endpoints available at http://localhost:${PORT}/api/v1/`);
    });
    // Graceful shutdown
    process.on('SIGINT', () => {
        logger_js_1.logger.info('Shutting down gracefully...');
        fileCleanupService_js_1.fileCleanupService.stop();
        (0, database_js_1.closeDatabase)();
        process.exit(0);
    });
}
startServer();
