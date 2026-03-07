# 🔌 ClawNexus API 文档

## 📋 概述

ClawNexus 提供完整的 RESTful API 用于生成和管理 OpenClaw 配置。所有 API 都需要有效的 API 密钥。

## 🔐 认证

所有 API 请求都需要在 Header 中提供 API 密钥：

```http
GET /api/v1/health
X-API-Key: your_api_key_here
```

## 📊 API 端点

### 健康检查
```http
GET /api/v1/health
```

**响应**:
```json
{
  "status": "ok",
  "timestamp": "2026-03-07T01:51:17.123Z",
  "version": "1.0.0"
}
```

### 获取名人数字灵魂列表
```http
GET /api/v1/souls
```

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "jobs",
      "name": "Steve Jobs",
      "title": "产品 visionary",
      "description": "极致产品追求者",
      "color": "bg-gradient-to-r from-amber-500 to-orange-600"
    }
  ],
  "count": 12
}
```

### 获取特定灵魂详情
```http
GET /api/v1/souls/{soulId}
```

**参数**:
- `soulId`: 灵魂ID (如: "jobs", "musk")

### 生成智能体配置
```http
POST /api/v1/agents/generate
Content-Type: application/json
X-API-Key: your_api_key_here

{
  "soulId": "jobs",
  "agentName": "我的产品助手",
  "customizations": {
    "skills": ["product_design", "user_research"],
    "workLang": "ZH"
  }
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "configId": "config_abc123",
    "downloadUrl": "/api/v1/download/config_abc123",
    "expiresAt": "2026-03-07T13:51:17.123Z"
  }
}
```

### 下载配置包
```http
GET /api/v1/download/{configId}
X-API-Key: your_api_key_here
```

**响应**: ZIP 文件包含完整的 OpenClaw 配置。

## 🚀 客户端集成示例

### JavaScript/TypeScript
```typescript
import { ClawNexusClient } from 'clawnexus-client';

const client = new ClawNexusClient({
  apiKey: 'your_api_key_here',
  baseURL: 'https://your-clawnexus-instance.com'
});

// 生成配置
const config = await client.generateAgentConfig({
  soulId: 'jobs',
  agentName: '产品设计助手',
  customizations: {
    skills: ['product_design', 'ui_ux'],
    workLang: 'ZH'
  }
});

// 下载ZIP
const zipBlob = await client.downloadConfig(config.configId);
```

### cURL 示例
```bash
# 健康检查
curl -H "X-API-Key: your_key" http://localhost:3000/api/v1/health

# 生成配置
curl -X POST http://localhost:3000/api/v1/agents/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_key" \
  -d '{
    "soulId": "jobs",
    "agentName": "我的助手",
    "customizations": {
      "skills": ["web_search", "code_execution"],
      "workLang": "ZH"
    }
  }'
```

## ⚠️ 错误处理

所有 API 都返回标准化的错误响应：

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### 常见错误码
- `AUTH_REQUIRED`: API 密钥缺失
- `INVALID_API_KEY`: 无效的 API 密钥
- `VALIDATION_ERROR`: 请求参数验证失败
- `SOUL_NOT_FOUND`: 指定的灵魂不存在
- `RATE_LIMITED`: 请求频率超限

## 📈 速率限制

- **免费层**: 10 请求/分钟
- **专业层**: 100 请求/分钟
- **企业层**: 无限请求

## 🔄 版本控制

API 通过路径前缀进行版本控制：
- `/api/v1/`: 当前稳定版本
- `/api/beta/`: 测试版本（可能变动）

---

**最后更新**: 2026-03-07
**API版本**: v1.0.0