# Vercel 部署指南

## 问题分析

当前项目在Vercel上部署后API不可用的原因：

1. **项目结构问题**：项目使用Express服务器 + Vite前端，但Vercel默认配置不支持这种混合模式
2. **缺少Vercel配置**：没有`vercel.json`配置文件
3. **构建配置问题**：需要专门的构建脚本处理服务器和前端

## 解决方案

### 1. 已添加的配置文件

- `vercel.json` - Vercel部署配置
- `.env.vercel` - Vercel环境变量模板
- 更新了`package.json`构建脚本

### 2. Vercel控制台设置

在Vercel控制台中需要设置以下环境变量：

```bash
# 数据库连接
POSTGRES_URL=你的PostgreSQL连接字符串

# AI API密钥
GEMINI_API_KEY=你的Gemini API密钥
GLM_API_KEY=你的GLM API密钥  
KIMI_API_KEY=你的Kimi API密钥

# 环境配置
NODE_ENV=production
```

### 3. 数据库配置

项目使用Prisma + PostgreSQL，需要在Vercel中：

1. 创建Vercel Postgres数据库
2. 运行数据库迁移：`npx prisma migrate deploy`
3. 设置`POSTGRES_URL`环境变量

### 4. 部署步骤

1. **连接GitHub仓库**到Vercel
2. **设置环境变量**在Vercel控制台
3. **重新部署**项目

### 5. 验证部署

部署成功后访问：

- 前端界面：`https://ai-soul-weaver.vercel.app`
- API健康检查：`https://ai-soul-weaver.vercel.app/api/health`
- API列表：`https://ai-soul-weaver.vercel.app/api/v1/souls`

## 故障排除

如果API仍然不可用：

1. 检查Vercel函数日志
2. 确认环境变量已正确设置
3. 验证数据库连接
4. 检查构建日志是否有错误

## 技术细节

- **前端构建**：Vite构建到`dist/`目录
- **服务器构建**：TypeScript编译到`dist-server/`目录  
- **路由配置**：API请求路由到Node.js服务器，静态文件路由到前端构建结果

这个配置应该能解决Vercel上API不可用的问题。