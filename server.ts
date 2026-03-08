import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { getCelebritySoul, listCelebritySouls } from "./utils/celebritySoulsSystem.js";
import { generateAgentConfig } from "./templates/agentTemplates.js";
import { getDatabase, closeDatabase } from "./db/database.js";
import { UserModel } from "./models/User.js";
import { ApiKeyModel } from "./models/ApiKey.js";
import { AgentConfigModel } from "./models/AgentConfig.js";
import { DeploymentModel } from "./models/Deployment.js";
import { initializeDemoData, getDatabaseStats } from "./db/init.js";
import { logger } from "./utils/logger.js";
import { errorHandler, asyncHandler, notFoundHandler, requestIdMiddleware } from "./middleware/errorHandler.js";
import { AuthenticationError, ValidationError, NotFoundError } from "./utils/errors.js";
import { validateSoulId, validateAgentName, validateTargetSystem } from "./utils/validation.js";
import { fileCleanupService } from "./services/fileCleanupService.js";
import { fileDownloadService } from "./services/fileDownloadService.js";

dotenv.config();

// Start file cleanup service
fileCleanupService.start();
logger.info('File cleanup service started');

// Middleware to validate API key
const validateApiKey = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;
  if (!apiKey) {
    logger.warn('API key validation failed: missing API key', { path: req.path });
    throw new AuthenticationError('API key required in x-api-key header');
  }
  
  const isValid = ApiKeyModel.isValid(apiKey);
  if (!isValid) {
    logger.warn('API key validation failed: invalid or expired key', { path: req.path });
    throw new AuthenticationError('Invalid or expired API key');
  }
  
  // Update last used timestamp
  const apiKeyRecord = ApiKeyModel.findByKey(apiKey);
  if (apiKeyRecord) {
    ApiKeyModel.updateLastUsed(apiKeyRecord.id);
    (req as any).userId = apiKeyRecord.user_id;
  }
  
  next();
};

async function startServer() {
  // Initialize database on startup
  getDatabase();
  await initializeDemoData();
  logger.info('Database initialized and demo data seeded');

  const app = express();
  const PORT = process.env.PORT || 3000;

  // Add request ID middleware
  app.use(requestIdMiddleware);

  app.use(cors());
  app.use(express.json());

  logger.info('Server starting...', { port: PORT });

  // Health check endpoint (no auth required)
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Validate API key endpoint
  app.post("/api/v1/keys/validate", (req, res) => {
    const apiKey = req.headers['x-api-key'] as string;
    if (!apiKey) {
      return res.status(400).json({ error: 'API key required in x-api-key header' });
    }
    const isValid = ApiKeyModel.isValid(apiKey);
    res.json({ 
      valid: isValid,
      message: isValid ? 'API key is valid' : 'API key is invalid'
    });
  });

  // List available celebrity souls
  app.get("/api/v1/souls", (req, res) => {
    try {
      const souls = listCelebritySouls();
      res.json({ 
        success: true,
        data: souls,
        count: souls.length
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        error: error.message || 'Failed to list souls' 
      });
    }
  });

  // Get specific celebrity soul
  app.get("/api/v1/souls/:soulId", (req, res) => {
    try {
      const soul = getCelebritySoul(req.params.soulId);
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
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        error: error.message || 'Failed to get soul' 
      });
    }
  });

  // Generate agent configuration
  app.post("/api/v1/agents/generate", validateApiKey, asyncHandler(async (req, res) => {
    const { soulId, agentName, customizations } = req.body;
    const userId = (req as any).userId;

    // Validate input
    if (!soulId) {
      throw new ValidationError('soulId is required', { field: 'soulId' });
    }

    if (!agentName) {
      throw new ValidationError('agentName is required', { field: 'agentName' });
    }

    validateSoulId(soulId, 'soulId');
    validateAgentName(agentName, 'agentName');

    const soul = getCelebritySoul(soulId);
    if (!soul) {
      logger.warn('Soul not found', { soulId });
      throw new NotFoundError('Soul', { soulId });
    }

    logger.info('Generating agent configuration', { soulId, agentName, userId });

    // Generate configuration files
    const config = generateAgentConfig(soul, agentName, customizations);

    // Store in database
    const agentConfig = AgentConfigModel.create(
      userId,
      soulId,
      agentName,
      config,
      new Date(Date.now() + 12 * 60 * 60 * 1000) // 12 hour expiry
    );

    logger.info('Agent configuration created', { configId: agentConfig.id, soulId, agentName });

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
      const apiKey = req.headers['x-api-key'] as string;

      // Get user from API key
      const apiKeyRecord = ApiKeyModel.findByKey(apiKey);
      if (!apiKeyRecord) {
        return res.status(401).json({ 
          success: false,
          error: 'Invalid API key' 
        });
      }

      // Find config by ID
      const config = AgentConfigModel.findById(agentId);
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
      const deployment = DeploymentModel.getLatestByConfigId(agentId);

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
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        error: error.message || 'Failed to get agent status' 
      });
    }
  });

  // Create deployment
  app.post("/api/v1/deployments", validateApiKey, asyncHandler(async (req, res) => {
    const { configId, targetSystem } = req.body;
    const userId = (req as any).userId;

    // Validate input
    if (!configId) {
      throw new ValidationError('configId is required', { field: 'configId' });
    }

    if (!targetSystem) {
      throw new ValidationError('targetSystem is required', { field: 'targetSystem' });
    }

    validateTargetSystem(targetSystem, 'targetSystem');

    // Verify config exists and belongs to user
    const config = AgentConfigModel.findById(configId);
    if (!config) {
      logger.warn('Agent config not found', { configId });
      throw new NotFoundError('Agent configuration', { configId });
    }

    if (config.user_id !== userId) {
      logger.warn('Unauthorized deployment attempt', { configId, userId });
      throw new AuthenticationError('Unauthorized');
    }

    logger.info('Creating deployment', { configId, targetSystem, userId });

    // Create deployment
    const deployment = DeploymentModel.create(configId, userId, targetSystem);

    logger.info('Deployment created', { deploymentId: deployment.id, configId, targetSystem });

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
      const apiKey = req.headers['x-api-key'] as string;

      // Get user from API key
      const apiKeyRecord = ApiKeyModel.findByKey(apiKey);
      if (!apiKeyRecord) {
        return res.status(401).json({ 
          success: false,
          error: 'Invalid API key' 
        });
      }

      // Find deployment
      const deployment = DeploymentModel.findById(deploymentId);
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
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        error: error.message || 'Failed to get deployment status' 
      });
    }
  });

  // List user's agent configurations
  app.get("/api/v1/agents", validateApiKey, (req, res) => {
    try {
      const apiKey = req.headers['x-api-key'] as string;

      // Get user from API key
      const apiKeyRecord = ApiKeyModel.findByKey(apiKey);
      if (!apiKeyRecord) {
        return res.status(401).json({ 
          success: false,
          error: 'Invalid API key' 
        });
      }

      // Get user's configs
      const configs = AgentConfigModel.findByUserId(apiKeyRecord.user_id);

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
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        error: error.message || 'Failed to list agents' 
      });
    }
  });

  // Get database statistics (admin endpoint)
  app.get("/api/v1/stats", validateApiKey, asyncHandler(async (req, res) => {
    try {
      const stats = getDatabaseStats();
      const fileStats = fileDownloadService.getStatistics();
      const cleanupStats = fileCleanupService.getStatistics();

      res.json({ 
        success: true,
        data: {
          database: stats,
          files: fileStats,
          cleanup: cleanupStats,
        }
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        error: error.message || 'Failed to get statistics' 
      });
    }
  }));

  // Download agent configuration files
  app.get("/api/v1/downloads/:packageId", asyncHandler(async (req, res) => {
    const { packageId } = req.params;

    // Get file package
    const downloadInfo = fileDownloadService.downloadFilePackage(packageId);
    if (!downloadInfo) {
      logger.warn('Download requested for non-existent package', { packageId });
      throw new NotFoundError('Download package', { packageId });
    }

    logger.info('Sending file download', {
      packageId,
      fileName: downloadInfo.fileName,
    });

    // Send file
    res.download(downloadInfo.path, downloadInfo.fileName, (err) => {
      if (err) {
        logger.error('Error sending file download', err as Error, { packageId });
      }
    });
  }));

  // Get download status
  app.get("/api/v1/downloads/:packageId/status", asyncHandler(async (req, res) => {
    const { packageId } = req.params;

    const status = fileDownloadService.getDownloadStatus(packageId);
    if (!status) {
      throw new NotFoundError('Download package', { packageId });
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
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const chat = ai.chats.create({
          model: "gemini-3-flash-preview",
          config: {
            systemInstruction,
            temperature: temperature || 0.7,
          },
        });
        
        // Convert messages to Gemini format if needed, or just send the last user message
        const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop();
        if (lastUserMessage) {
            const response = await chat.sendMessage({ message: lastUserMessage.content });
            responseText = response.text || "";
        }
      } else if (primaryModel === "gemini") {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const chat = ai.chats.create({
          model: "gemini-3-flash-preview",
          config: {
            systemInstruction,
            temperature: temperature || 0.7,
          },
        });
        
        const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop();
        if (lastUserMessage) {
            const response = await chat.sendMessage({ message: lastUserMessage.content });
            responseText = response.text || "";
        }
      } else if (primaryModel === "glm") {
        // Mock or actual implementation for GLM (Zhipu)
        const apiKey = process.env.GLM_API_KEY;
        if (!apiKey) throw new Error("GLM_API_KEY is not set");
        
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
        } else {
            throw new Error(data.error?.message || "GLM API error");
        }
      } else if (primaryModel === "kimi") {
        // Mock or actual implementation for Kimi (Moonshot)
        const apiKey = process.env.KIMI_API_KEY;
        if (!apiKey) throw new Error("KIMI_API_KEY is not set");
        
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
        } else {
            throw new Error(data.error?.message || "Kimi API error");
        }
      } else {
        throw new Error("Unsupported model");
      }

      res.json({ text: responseText });
    } catch (error: any) {
      console.error("Chat API Error:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  // 404 handler (must be before error handler)
  app.use(notFoundHandler);

  // Global error handler (must be last)
  app.use(errorHandler);

  app.listen(PORT, "0.0.0.0", () => {
    logger.info(`Server running on http://localhost:${PORT}`);
    logger.info(`API endpoints available at http://localhost:${PORT}/api/v1/`);
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    logger.info('Shutting down gracefully...');
    fileCleanupService.stop();
    closeDatabase();
    process.exit(0);
  });
}

startServer();
