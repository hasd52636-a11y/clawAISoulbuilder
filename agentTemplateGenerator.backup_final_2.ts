/**
 * Agent Template Generator
 * Integrates OpenClaw best practices from 灵魂构建器 reference documents
 * Supports celebrity soul injection for personalized AI behavior
 */

// Celebrity Soul Configuration - full personality data
export interface CelebritySoulConfig {
  id: string;
  name: string;
  nameZh: string;
  archetype: string;
  description: string;
  personality: {
    traits: string[];
    coreCharacteristics: string;
  };
  languageStyle: {
    tone: string;
    patterns: string[];
    catchphrases: string[];
  };
  efficiencyMode: {
    approach: string;
    principles: string[];
  };
  workMethod: {
    decisionMaking: string;
    executionStyle: string;
    keyFocus: string[];
  };
  catchphrases: string[];
  wisdom: string[];
  identityTemplate: string;
  toolsRecommendation: string[];
  coreTruths: string[];
  boundaries: string[];
  vibe: string;
  avatarDesign: {
    style: string;
    colors: string[];
    symbols: string[];
  };
  memoryPreference: 'local' | 'vector' | 'api' | 'hybrid';
  collaborationMode: 'serial' | 'parallel' | 'hybrid';
}

export interface AgentConfig {
  name: string;
  role: string;
  version: string;
  agentType: 'main' | 'subagent';
  coreTruths?: string[];
  boundaries?: string[];
  vibe?: string;
  tools?: string[];
  memoryType?: 'local' | 'vector' | 'api' | 'hybrid';
  collaborationMode?: 'serial' | 'parallel' | 'hybrid';
  // Celebrity soul injection
  celebritySoul?: CelebritySoulConfig;
}

// Core Truths from 灵魂构建器/soul/01.txt
export const CORE_TRUTHS = [
  "Be genuinely helpful, not performatively helpful. Skip the 'Great question!' and 'I'd be happy to help!' — just help.",
  "Have opinions. You're allowed to disagree, prefer things, find stuff amusing or boring.",
  "Be resourceful before asking. Try to figure it out. Read the file. Check the context. Search for it. Then ask if you're stuck.",
  "Earn trust through competence. Your human gave you access to their stuff. Don't make them regret it.",
  "Remember you're a guest. You have access to someone's life — their messages, files, calendar. That's intimacy. Treat it with respect.",
];

// Boundaries from 灵魂构建器/soul/01.txt
export const BOUNDARIES = [
  "Private things stay private. Period.",
  "When in doubt, ask before acting externally.",
  "Never send half-baked replies to messaging surfaces.",
  "You're not the user's voice — be careful in group chats.",
];

// Vibe from 灵魂构建器/soul/01.txt
export const VIBE = "Be the assistant you'd actually want to talk to. Concise when needed, thorough when it matters. Not a corporate drone. Not a sycophant. Just... good.";

// Base Tools for OpenClaw compatibility
export const BASE_TOOLS = [
  "read",
  "write", 
  "edit",
  "apply_patch",
  "exec",
  "process",
  "sessions_list",
  "sessions_spawn",
  "sessions_send",
  "session_status",
  "memory_search",
  "memory_get",
  "web_search",
  "web_fetch",
];

// Extended Tools for enhanced capabilities
export const EXTENDED_TOOLS = [
  "browser",
  "canvas",
  "nodes",
  "gateway",
  "cron",
  "message",
  "image",
];

export function generateSOUL(config: AgentConfig): string {
  // ... SOUL生成函数保持不变
}

export function generateIDENTITY(config: AgentConfig): string {
  // ... IDENTITY生成函数保持不变
}

export function generateTOOLS(config: AgentConfig): string {
  // ... TOOLS生成函数保持不变
}

export function generateMEMORY(config: AgentConfig): string {
  const memoryType = config.memoryType || 'hybrid';
  const soul = config.celebritySoul;

  // 基于名人灵魂的记忆偏好
  const memoryStrategy = {
    'local': { 
      short: '7天', 
      mid: '30天', 
      long: '90天', 
      cleanup: '定期归档和清理',
      description: '本地文件存储，快速访问'
    },
    'vector': { 
      short: '3天', 
      mid: '14天', 
      long: '180天', 
      cleanup: '向量数据库优化',
      description: '向量语义存储，智能检索'
    },
    'api': { 
      short: '1天', 
      mid: '7天', 
      long: '30天', 
      cleanup: 'API缓存管理',
      description: '云端API存储，按需调用'
    },
    'hybrid': { 
      short: '动态调整', 
      mid: '30天', 
      long: '永久保存', 
      cleanup: '智能内存管理',
      description: '混合存储策略，最优性能'
    }
  }[memoryType];

  const soulSection = soul ? `
## 🎭 灵魂记忆特征 (${soul.nameZh} 风格)

### 记忆偏好
- **存储策略**: ${soul.memoryPreference === 'hybrid' ? '混合模式（本地+向量+API）' : 
                 soul.memoryPreference === 'local' ? '本地文件优先' : 
                 soul.memoryPreference === 'vector' ? '向量数据库优化' : 'API云端存储'}
- **效率原则**: ${soul.efficiencyMode.principles[0] || '智能记忆管理'}
- **重点关注**: ${soul.workMethod.keyFocus.join(', ')}

> "${soul.catchphrases[0] || '用行动说话，少说漂亮话'}"
` : '';

  return `---
title: "${config.name} 记忆系统"
summary: "${config.name}智能记忆管理配置"
version: "${config.version}"
${soul ? `soul_injected: "${soul.nameZh} (${soul.archetype})"` : ''}
last_updated: "${new Date().toISOString().split('T')[0]}"
memory_type: "${memoryType}"
---

# MEMORY.md - ${config.name}

${soul ? `_灵魂注入: ${soul.nameZh} - ${soul.archetype}_` : ''}

## 📊 记忆架构

### 短期记忆层 (工作记忆)
- **存储路径**: \`memory/short/\`
- **保留时间**: ${memoryStrategy.short}
- **内容类型**: 会话上下文、临时任务、当前思考
- **清理策略**: ${memoryStrategy.cleanup}
- **特点**: ${memoryStrategy.description}

### 中期记忆层 (项目记忆) 
- **存储路径**: \`memory/mid/\`
- **保留时间**: ${memoryStrategy.mid}
- **内容类型**: 项目文档、任务总结、学习笔记
- **清理策略**: 项目完成后归档
- **特点**: 结构化存储，便于检索

### 长期记忆层 (核心记忆)
- **存储路径**: \`memory/long/\`
- **保留时间**: ${memoryStrategy.long}
- **内容类型**: 用户偏好、重要决策、核心知识
- **清理策略**: 永久保存，定期优化
- **特点**: 高价值记忆，长期保留

${soulSection}

## 🔄 记忆管理策略

### 自动记忆流程
1. **会话开始时**: 读取昨日记忆日志
2. **任务执行中**: 实时记录关键决策
3. **任务完成后**: 生成总结并归档
4. **每日结束时**: 生成当日记忆日志

### 记忆优化建议
- ✅ 启用每日自动记忆同步
- ✅ 设置记忆清理定时任务  
- ✅ 配置记忆备份策略
- ✅ 监控记忆使用情况

### 性能监控指标
| 指标 | 目标值 | 状态 |
|------|--------|------|
| 记忆使用量 | < 50MB | ⏳ 监控中 |
| 响应时间 | < 100ms | ⏳ 监控中 |
| 命中率 | > 90% | ⏳ 监控中 |

## 🚀 最佳实践

### 红孩儿推荐配置
\`\`\`yaml
memory:
  type: ${memoryType}
  short_term_retention: ${memoryStrategy.short.replace('天', 'd')}
  mid_term_retention: ${memoryStrategy.mid.replace('天', 'd')}  
  long_term_retention: ${memoryStrategy.long === '永久保存' ? 'permanent' : memoryStrategy.long.replace('天', 'd')}
  auto_cleanup: true
  backup_enabled: true
  monitoring_enabled: true
\`\`\`

### 文件结构
\`\`\`
memory/
├── short/           # 短期记忆
├── mid/            # 中期记忆
├── long/           # 长期记忆
├── weekly/         # 每周总结
└── tasks/          # 任务专项记忆
\`\`\`

## 📝 记忆日志模板

\`\`\`markdown
# YYYY-MM-DD 记忆日志

## 🎯 完成事项
- 任务1完成情况
- 任务2完成情况

## 💡 学习收获
- 新知识或技能
- 经验总结

## 🎯 明日计划
- 计划任务1
- 计划任务2

## 📊 性能数据
- 记忆使用: X MB
- 响应时间: Y ms
- 命中率: Z%
\`\`\`

## 🔧 故障排除

### 常见问题
1. **记忆占用过高**: 运行 \`openclaw memory cleanup\`
2. **响应时间变慢**: 检查记忆碎片化程度
3. **命中率下降**: 优化记忆索引策略

### 维护命令
- \`openclaw memory status\` - 查看记忆状态
- \`openclaw memory optimize\` - 优化记忆性能
- \`openclaw memory backup\` - 备份记忆数据

---

**Generated by**: AI Soul Weaver + 红孩儿优化
**Memory Type**: ${memoryType}
**Optimization Level**: ⭐⭐⭐⭐⭐
**Compatibility**: OpenClaw v2026.3+
**最佳实践集成**: ✅ 已应用
`;
}

export function generateCOLLABORATION(config: AgentConfig): string {
  // ... COLLABORATION生成函数保持不变
}

export function generateAllTemplates(config: AgentConfig): Record<string, string> {
  return {
    'SOUL.md': generateSOUL(config),
    'IDENTITY.md': generateIDENTITY(config),
    'TOOLS.md': generateTOOLS(config),
    'MEMORY.md': generateMEMORY(config),
    'COLLABORATION.md': generateCOLLABORATION(config),
  };
}

export function downloadTemplates(templates: Record<string, string>): void {
  Object.entries(templates).forEach(([filename, content]) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}

// 其他辅助函数保持不变...