# Vercel 部署检查清单

## 部署信息
- **项目名称**: claw-ai-soulbuilder-qabe
- **部署ID**: 4ETvnNegDjToDT1MPGYkuULDnMcx
- **部署URL**: https://claw-ai-soulbuilder-qabe.vercel.app

## 需要检查的项目

### 1. Vercel 控制台设置
✅ **环境变量检查**:
- [ ] `POSTGRES_URL` - PostgreSQL数据库连接字符串
- [ ] `GEMINI_API_KEY` - Gemini AI API密钥
- [ ] `GLM_API_KEY` - GLM AI API密钥  
- [ ] `KIMI_API_KEY` - Kimi AI API密钥
- [ ] `NODE_ENV=production`

### 2. 数据库配置
✅ **Prisma 数据库**:
- [ ] 在Vercel中创建PostgreSQL数据库
- [ ] 运行数据库迁移: `npx prisma migrate deploy`
- [ ] 验证数据库连接

### 3. 构建状态检查
✅ **构建日志**:
- [ ] 检查Vercel构建日志是否有错误
- [ ] 确认 `vercel-build` 脚本执行成功
- [ ] 验证前端构建 (`dist/`) 和服务器构建 (`dist-server/`)

### 4. API 端点测试
✅ **健康检查**:
- [ ] `GET /api/health` - 应该返回 `{"status": "ok"}`
- [ ] `GET /api/v1/souls` - 应该返回名人灵魂列表
- [ ] `POST /api/chat` - 测试聊天功能

### 5. 路由配置验证
✅ **Vercel路由**:
- [ ] API请求正确路由到Express服务器
- [ ] 静态文件正确路由到前端构建
- [ ] 没有404错误

## 故障排除步骤

### 如果API仍然不可用:

1. **检查Vercel函数日志**
   - 登录Vercel控制台
   - 查看部署的函数日志
   - 查找任何启动错误

2. **验证环境变量**
   - 确认所有环境变量已正确设置
   - 特别是数据库连接字符串

3. **手动测试部署**
   ```bash
   # 测试健康端点
   curl https://claw-ai-soulbuilder-qabe.vercel.app/api/health
   
   # 测试灵魂列表
   curl https://claw-ai-soulbuilder-qabe.vercel.app/api/v1/souls
   ```

4. **重新部署**
   - 如果有配置更改，需要重新部署
   - Vercel会自动从GitHub重新构建

## 部署状态

- ✅ Vercel配置文件已添加 (`vercel.json`)
- ✅ 构建脚本已更新 (`package.json`)
- ✅ 环境变量模板已创建 (`.env.vercel`)
- ✅ 部署指南已编写 (`VERCEL_DEPLOYMENT.md`)

## 下一步

1. 登录 Vercel 控制台 (https://vercel.com)
2. 检查 `claw-ai-soulbuilder-qabe` 项目的环境变量
3. 查看最近的构建日志
4. 根据需要重新部署

如果构建日志显示成功但API仍然不可用，可能需要检查:
- 数据库连接问题
- API密钥配置
- 服务器启动错误