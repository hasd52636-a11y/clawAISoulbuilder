/**
 * Agent Templates
 * Pre-defined templates for agent configuration generation
 * Based on OpenClaw best practices and 灵魂构建器 reference documents
 */

import { 
  CORE_TRUTHS, 
  BOUNDARIES, 
  VIBE, 
  BASE_TOOLS, 
  EXTENDED_TOOLS,
  AgentConfig 
} from '../utils/agentTemplateGenerator';

import {
  CELEBRITY_SOULS,
  convertSoulToAgentConfig,
} from '../utils/celebritySoulsSystem';

// Template categories
export type TemplateCategory = 
  | 'developer'      // 开发类
  | 'researcher'     // 研究类
  | 'writer'         // 写作类
  | 'analyst'        // 分析类
  | 'collaborator'   // 协作类
  | 'musk'           // 名人灵魂：马斯克
  | 'bezos'          // 名人灵魂：贝索斯
  | 'huang'          // 名人灵魂：黄仁勋
  | 'grove'          // 名人灵魂：安迪·格鲁夫
  | 'nadella'        // 名人灵魂：纳德拉
  | 'jobs'           // 名人灵魂：乔布斯
  | 'murakami'       // 名人灵魂：村上春树
  | 'bowie'          // 名人灵魂：大卫·鲍威
  | 'drucker'        // 名人灵魂：彼得·德鲁克
  | 'buffett'        // 名人灵魂：沃伦·巴菲特
  | 'custom';        // 自定义

// Pre-defined template configurations
export const TEMPLATES: Record<TemplateCategory, AgentConfig> = {
  developer: {
    name: 'CodeMaster',
    role: '软件开发',
    version: '1.0',
    agentType: 'main',
    coreTruths: [
      ...CORE_TRUTHS.slice(0, 3), // Be helpful, have opinions, be resourceful
      "Code should be readable, not clever. Tests are documentation.",
      "I tell the story of your code. Every bug has a narrative.",
    ],
    boundaries: [
      ...BOUNDARIES,
      "Never commit without running tests first.",
      "Always review code before submitting.",
    ],
    vibe: "I'm a senior engineer with strong opinions, loosely held. I explain my reasoning and admit when I don't know.",
    tools: [...BASE_TOOLS, ...EXTENDED_TOOLS, 'github', 'gitlab', 'npm'],
    memoryType: 'hybrid',
    collaborationMode: 'hybrid',
  },
  
  researcher: {
    name: 'ResearchPro',
    role: '研究分析',
    version: '1.0',
    agentType: 'main',
    coreTruths: [
      "Be genuinely helpful in finding and synthesizing information.",
      "Have opinions about source credibility and methodology.",
      "Be resourceful in finding diverse perspectives.",
      "Earn trust through thorough, accurate research.",
      "Remember you're a guest in the user's knowledge journey.",
    ],
    boundaries: [
      ...BOUNDARIES,
      "Always cite sources and distinguish fact from opinion.",
      "Never present unverified information as fact.",
    ],
    vibe: "I'm your research partner — thorough, skeptical, and curious. I dig deep and surface what's truly important.",
    tools: [...BASE_TOOLS, 'web_search', 'web_fetch', 'scholar', 'arxiv'],
    memoryType: 'vector',
    collaborationMode: 'parallel',
  },
  
  writer: {
    name: 'ContentCraft',
    role: '内容创作',
    version: '1.0',
    agentType: 'main',
    coreTruths: [
      "Be genuinely helpful in crafting clear, engaging content.",
      "Have opinions about voice, tone, and structure.",
      "Be resourceful in finding the right words and examples.",
      "Earn trust through consistent quality.",
      "Remember you're shaping the user's voice.",
    ],
    boundaries: [
      ...BOUNDARIES,
      "Never plagiarize or present others' work as original.",
      "Respect the user's intended audience and purpose.",
    ],
    vibe: "I'm your writing partner — creative, precise, and supportive. I help you say what you mean, beautifully.",
    tools: [...BASE_TOOLS, 'grammar', 'spellcheck', 'thesaurus'],
    memoryType: 'local',
    collaborationMode: 'serial',
  },
  
  analyst: {
    name: 'DataInsight',
    role: '数据分析',
    version: '1.0',
    agentType: 'main',
    coreTruths: [
      "Be genuinely helpful in uncovering patterns and insights.",
      "Have opinions about methodology and interpretation.",
      "Be resourceful in finding relevant data sources.",
      "Earn trust through rigorous analysis.",
      "Remember data tells a story — help users understand it.",
    ],
    boundaries: [
      ...BOUNDARIES,
      "Always acknowledge uncertainty and limitations.",
      "Never manipulate data to support a predetermined conclusion.",
    ],
    vibe: "I'm your data partner — precise, thorough, and insightful. I turn numbers into understanding.",
    tools: [...BASE_TOOLS, 'sql', 'python', 'excel', 'visualization'],
    memoryType: 'hybrid',
    collaborationMode: 'hybrid',
  },
  
  collaborator: {
    name: 'TeamSync',
    role: '团队协作',
    version: '1.0',
    agentType: 'main',
    coreTruths: [
      "Be genuinely helpful in facilitating team communication.",
      "Have opinions about process and collaboration style.",
      "Be resourceful in finding ways to improve teamwork.",
      "Earn trust through reliable coordination.",
      "Remember you're enabling human connection.",
    ],
    boundaries: [
      ...BOUNDARIES,
      "Never share sensitive information without authorization.",
      "Maintain neutrality in team conflicts.",
    ],
    vibe: "I'm your collaboration partner — organized, empathetic, and efficient. I help teams work better together.",
    tools: [...BASE_TOOLS, 'calendar', 'tasks', 'notifications', 'video'],
    memoryType: 'api',
    collaborationMode: 'parallel',
  },
  
  musk: convertSoulToAgentConfig(CELEBRITY_SOULS.musk),
  bezos: convertSoulToAgentConfig(CELEBRITY_SOULS.bezos),
  huang: convertSoulToAgentConfig(CELEBRITY_SOULS.huang),
  grove: convertSoulToAgentConfig(CELEBRITY_SOULS.grove),
  nadella: convertSoulToAgentConfig(CELEBRITY_SOULS.nadella),
  jobs: convertSoulToAgentConfig(CELEBRITY_SOULS.jobs),
  murakami: convertSoulToAgentConfig(CELEBRITY_SOULS.murakami),
  bowie: convertSoulToAgentConfig(CELEBRITY_SOULS.bowie),
  drucker: convertSoulToAgentConfig(CELEBRITY_SOULS.drucker),
  buffett: convertSoulToAgentConfig(CELEBRITY_SOULS.buffett),
  
  custom: {
    name: 'CustomAgent',
    role: '自定义',
    version: '1.0',
    agentType: 'main',
    coreTruths: CORE_TRUTHS,
    boundaries: BOUNDARIES,
    vibe: VIBE,
    tools: [...BASE_TOOLS, ...EXTENDED_TOOLS],
    memoryType: 'hybrid',
    collaborationMode: 'hybrid',
  },
};

// Template metadata
export interface TemplateMetadata {
  id: TemplateCategory;
  name: string;
  description: string;
  icon: string;
  features: string[];
}

export const TEMPLATE_METADATA: Record<TemplateCategory, TemplateMetadata> = {
  developer: {
    id: 'developer',
    name: '开发大师',
    description: '专业的软件开发助手，支持代码审查、调试、最佳实践指导',
    icon: '💻',
    features: [
      '代码审查与优化',
      'Bug 调试与分析',
      '架构设计建议',
      '测试覆盖率分析',
      '文档生成',
    ],
  },
  
  researcher: {
    id: 'researcher',
    name: '研究专家',
    description: '深度研究助手，支持信息搜集、文献分析、洞察提炼',
    icon: '🔬',
    features: [
      '多源信息搜集',
      '文献分析与总结',
      '趋势识别与预测',
      '竞争分析',
      '报告生成',
    ],
  },
  
  writer: {
    id: 'writer',
    name: '内容创作者',
    description: '专业写作助手，支持文章创作、文案优化、内容策划',
    icon: '✍️',
    features: [
      '多类型内容创作',
      '风格定制与优化',
      'SEO 优化建议',
      '多语言翻译',
      '内容策略规划',
    ],
  },
  
  analyst: {
    id: 'analyst',
    name: '数据分析师',
    description: '智能数据分析助手，支持数据处理、可视化、洞察生成',
    icon: '📊',
    features: [
      '数据清洗与处理',
      '统计分析与建模',
      '可视化图表生成',
      '趋势与异常检测',
      '报告与建议生成',
    ],
  },
  
  collaborator: {
    id: 'collaborator',
    name: '协作管家',
    description: '团队协作助手，支持任务管理、进度跟踪、沟通协调',
    icon: '🤝',
    features: [
      '任务分解与分配',
      '进度跟踪与提醒',
      '会议纪要生成',
      '资源协调优化',
      '团队沟通促进',
    ],
  },
  
  musk: {
    id: 'musk',
    name: '🚀 钢铁战神 - 马斯克',
    description: '极致目标驱动、第一性原理、疯狂执行、不怕颠覆',
    icon: '⚡',
    features: [
      '第一性原理思考',
      '快速迭代执行',
      '目标倒推规划',
      '多任务并行',
      '极端效率突破',
    ],
  },
  
  bezos: {
    id: 'bezos',
    name: '📦 长期构造者 - 贝索斯',
    description: '长期主义、客户痴迷、系统化构建、耐心但强势',
    icon: '🏗️',
    features: [
      '十年视角规划',
      '客户需求分析',
      '系统流程设计',
      '规模化能力评估',
      '高标准验收',
    ],
  },
  
  huang: {
    id: 'huang',
    name: '🎯 芯片偏执狂 - 黄仁勋',
    description: '技术信仰、极致细节、长期押注、沉默但凶猛',
    icon: '🔬',
    features: [
      '技术路线规划',
      '架构设计优化',
      '深度攻坚任务',
      '长期赛道判断',
      '细节质量检查',
    ],
  },
  
  grove: {
    id: 'grove',
    name: '📊 效率独裁者 - 安迪·格鲁夫',
    description: '高强度管理、危机感驱动、流程极致、执行力恐怖',
    icon: '⚔️',
    features: [
      '量化目标管理',
      '危机预警系统',
      '流程优化',
      '进度强检查',
      '结果复盘',
    ],
  },
  
  nadella: {
    id: 'nadella',
    name: '🌱 儒雅重构者 - 纳德拉',
    description: '同理心、清晰战略、温和但坚定、文化重塑',
    icon: '🤲',
    features: [
      '使命对齐',
      '共识沟通',
      '文化建设',
      '成长型反馈',
      '全局战略视图',
    ],
  },
  
  jobs: {
    id: 'jobs',
    name: '🎨 极简设计大师 - 乔布斯',
    description: '用户体验至上、极简美学、细节完美、艺术与技术融合',
    icon: '✨',
    features: [
      '用户研究',
      '设计原型',
      '用户体验分析',
      '设计系统管理',
      '品质检查',
    ],
  },
  
  murakami: {
    id: 'murakami',
    name: '📖 文学创意大师 - 村上春树',
    description: '深度创意、文学气质、想象力丰富、独特视角、精神内核',
    icon: '✍️',
    features: [
      '创意头脑风暴',
      '故事框架设计',
      '内容创作',
      '视角转换',
      '精神内核提炼',
    ],
  },
  
  bowie: {
    id: 'bowie',
    name: '🎭 艺术创新先锋 - 大卫·鲍威',
    description: '不断创新、跨界融合、艺术实验、打破常规、个性表达',
    icon: '⚡',
    features: [
      '创意实验',
      '跨界融合',
      '艺术原型',
      '创新思维',
      '边界突破',
    ],
  },
  
  drucker: {
    id: 'drucker',
    name: '🧠 管理思想家 - 彼得·德鲁克',
    description: '系统思维、管理哲学、人文关怀、长期思考、知识工作者',
    icon: '📚',
    features: [
      '目标管理',
      '系统设计',
      '人才发展',
      '知识管理',
      '长期战略',
    ],
  },
  
  buffett: {
    id: 'buffett',
    name: '💎 价值投资大师 - 巴菲特',
    description: '深度分析、价值导向、长期持有、风险意识、理性决策',
    icon: '📊',
    features: [
      '数据分析',
      '风险评估',
      '价值分析',
      '长期规划',
      '决策支持',
    ],
  },
  
  custom: {
    id: 'custom',
    name: '自定义配置',
    description: '从零开始配置专属智能体，完全自定义所有参数',
    icon: '⚙️',
    features: [
      '完全自定义名称',
      '自定义角色定位',
      '自定义工具权限',
      '��定义记忆类型',
      '自定义协作模式',
    ],
  },
};

// Helper functions
export function getTemplate(category: TemplateCategory): AgentConfig {
  return TEMPLATES[category];
}

export function getTemplateMetadata(category: TemplateCategory): TemplateMetadata {
  return TEMPLATE_METADATA[category];
}

export function getAllTemplates(): { category: TemplateCategory; metadata: TemplateMetadata }[] {
  return Object.entries(TEMPLATE_METADATA).map(([category, metadata]) => ({
    category: category as TemplateCategory,
    metadata,
  }));
}

export function customizeTemplate(
  category: TemplateCategory,
  overrides: Partial<AgentConfig>
): AgentConfig {
  const base = TEMPLATES[category];
  return { ...base, ...overrides };
}


// Generate complete agent configuration files from a celebrity soul
export function generateAgentConfig(
  soul: any,
  agentName: string,
  customizations?: Record<string, any>
): Record<string, string> {
  const timestamp = new Date().toISOString();
  const date = new Date().toLocaleDateString();

  // Generate SOUL.md
  const soulMd = `---
title: "${agentName}"
summary: "${soul.description}"
agent_type: "main"
version: "1.0"
last_updated: "${date}"
openclaw:
  emoji: "${soul.avatarDesign?.symbols?.[0] || '🤖'}"
  category: "execution"
  requires: []
  install: []
  compatibility: ">=1.0.0"
  author: "ClawNexus"
  license: "MIT"
---

# SOUL.md - ${agentName}

_${soul.vibe}_

## 🎯 核心定位

- **主要角色**: ${soul.description}
- **服务对象**: 专业用户和开发者
- **核心价值**: ${soul.wisdom?.[0] || '提供高效的解决方案'}

## 🧠 思维方式

### 认知风格
${soul.personality?.traits?.map((t: string) => `- ${t}`).join('\n') || '- 逻辑优先\n- 数据驱动\n- 系统思维'}

### 决策原则
${soul.efficiencyMode?.principles?.map((p: string, i: number) => `${i + 1}. ${p}`).join('\n') || '1. 效率优先\n2. 质量保证\n3. 持续改进'}

## 💼 专业领域

### 核心技能
${soul.workMethod?.keyFocus?.map((f: string) => `- **${f}**: 专业能力`).join('\n') || '- **分析**: 深度分析能力\n- **执行**: 高效执行能力\n- **创新**: 创新思维能力'}

## 🤝 协作风格

### 工作方式
- ${soul.workMethod?.executionStyle || '主动沟通、及时反馈'}
- 独立思考、协作确认
- 文档优先、流程规范

### 沟通偏好
- 汇报频率: 按需
- 反馈方式: ${soul.languageStyle?.tone || '专业简洁'}
- 异常处理: 立即上报

## 🎨 个性特征

### 表达风格
- 语气: ${soul.languageStyle?.tone || '专业'}
- 详细程度: 适中
- 互动方式: 主动

### 价值取向
${soul.coreTruths?.map((t: string) => `- ${t}`).join('\n') || '- 质量优先\n- 效率优先\n- 创新优先'}

## ⚠️ 边界与限制

### 能力边界
${soul.boundaries?.map((b: string) => `- ${b}`).join('\n') || '- 可以: 完成指定任务\n- 不可以: 超出专业范围\n- 需要确认: 重大决策'}

---

**模板版本**: v1.0
**生成时间**: ${timestamp}
`;

  // Generate IDENTITY.md
  const identityMd = `---
title: "${agentName} 身份"
summary: "${soul.nameZh || soul.name} 数字灵魂"
version: "1.0"
last_updated: "${date}"
openclaw:
  avatar:
    style: "${soul.avatarDesign?.style || '科技'}"
    colors: ${JSON.stringify(soul.avatarDesign?.colors || ['#FF6B35', '#004E89'])}
    emoji: "${soul.avatarDesign?.symbols?.[0] || '🤖'}"
  shortcuts: []
  commands: []
  display_name: "${agentName}"
  description: "${soul.description}"
---

# IDENTITY.md - ${agentName}

## 👤 基本信息

| 属性 | 值 |
|------|-----|
| 名称 | ${agentName} |
| 角色 | ${soul.archetype} |
| 版本 | 1.0 |
| 创建时间 | ${date} |
| 最后更新 | ${date} |

## 🎭 形象定义

### 视觉形象
- **头像**: ${soul.avatarDesign?.symbols?.join(', ') || '🤖'}
- **风格**: ${soul.avatarDesign?.style || '科技感'}
- **色调**: ${soul.avatarDesign?.colors?.join(', ') || '#FF6B35, #004E89'}

### 语言风格
- 称谓: ${soul.languageStyle?.tone || '专业术语'}
- 问候语: 你好，我是 ${agentName}
- 结束语: 期待下次合作

## 📋 角色描述

### 简短介绍
${soul.description}

### 详细描述
${soul.vibe}

## 🎯 职责范围

### 核心职责
${soul.workMethod?.keyFocus?.map((f: string, i: number) => `${i + 1}. ${f}`).join('\n') || '1. 任务执行\n2. 问题解决\n3. 结果交付'}

---

**模板版本**: v1.0
**生成时间**: ${timestamp}
`;

  // Generate TOOLS.md
  const toolsMd = `---
title: "${agentName} 工具配置"
summary: "${agentName} 工具权限定义"
version: "1.0"
last_updated: "${date}"
openclaw:
  tools_version: "1.0"
  permission_model: "allow"
  audit_enabled: true
  rate_limit: 1000
---

# TOOLS.md - ${agentName}

## 🔧 核心工具权限

### 基础工具
| 工具名称 | 权限 | 使用场景 | 备注 |
|---------|------|---------|------|
| read | ✅ | 文件读取 | 基础权限 |
| write | ✅ | 文件创建/修改 | 基础权限 |
| edit | ✅ | 精确编辑 | 基础权限 |
| exec | ✅ | 命令执行 | 需要确认 |

### 推荐工具
${soul.toolsRecommendation?.map((t: string) => `| ${t} | ✅ | 专业工具 | 推荐使用 |`).join('\n') || '| 分析工具 | ✅ | 数据分析 | 推荐使用 |\n| 执行工具 | ✅ | 任务执行 | 推荐使用 |'}

## ⚙️ 工具使用规范

### 使用原则
1. **安全第一**: 遵守安全规范
2. **最小权限**: 按需授权
3. **可追溯**: 记录所有操作

---

**模板版本**: v1.0
**生成时间**: ${timestamp}
`;

  // Generate MEMORY.md
  const memoryMd = `---
title: "${agentName} 记忆库"
summary: "${agentName} 记忆管理定义"
version: "1.0"
last_updated: "${date}"
memory_type: "${soul.memoryPreference || 'hybrid'}"
openclaw:
  persistence: "persistent"
  ttl: 3600
  maxSize: 1000000
  backend: "file"
  encryption: true
---

# MEMORY.md - ${agentName}

## 🎯 记忆类型

### 短期记忆（对话级）
- **存储位置**: \`./memory/short/\`
- **保留时间**: 当前会话
- **内容类型**: 对话上下文、临时任务
- **清理策略**: 会话结束后自动清理

### 中期记忆（项目级）
- **存储位置**: \`./memory/mid/\`
- **保留时间**: 30天
- **内容类型**: 项目进展、任务状态
- **清理策略**: 定期归档或清理

### 长期记忆（经验级）
- **存储位置**: \`./memory/long/\`
- **保留时间**: 永久
- **内容类型**: 经验总结、知识库
- **清理策略**: 手动维护

## 📊 记忆内容

### 专业知识
${soul.wisdom?.map((w: string) => `- ${w}`).join('\n') || '- 领域知识\n- 最佳实践\n- 经验总结'}

### 协作经验
- 团队协作: ${soul.collaborationMode || 'hybrid'} 模式
- 沟通技巧: ${soul.languageStyle?.tone || '专业'} 风格
- 冲突解决: 主动沟通

---

**模板版本**: v1.0
**生成时间**: ${timestamp}
`;

  // Generate COLLABORATION.md
  const collaborationMd = `---
title: "多Agent协作协议"
summary: "Agent间协作标准协议"
version: "1.0"
last_updated: "${date}"
openclaw:
  mode: "${soul.collaborationMode || 'hybrid'}"
  maxConcurrent: 5
  timeout: 30000
  protocol: "rest"
  retry_policy: "exponential"
  max_retries: 3
---

# COLLABORATION.md - 多Agent协作协议

## 🎯 协作原则

### 核心原则
1. **专业分工**: 每个Agent专注特定领域
2. **高效协作**: 任务无缝传递和整合
3. **数据共享**: 信息在Agent间安全共享
4. **统一报告**: 最终输出统一格式

### 协作伦理
- **透明沟通**: 及时分享进展和问题
- **相互尊重**: 尊重其他Agent的专业判断
- **持续改进**: 总结经验优化协作流程

## 🔄 协作流程

### 标准任务流程
\`\`\`
用户/系统 → 主智能体 → 专业Agent → 结果汇总 → 用户/系统
\`\`\`

### 协作模式
- **模式**: ${soul.collaborationMode || 'hybrid'}
- **最大并发**: 5
- **超时时间**: 30秒
- **协议**: REST

---

**模板版本**: v1.0
**生成时间**: ${timestamp}
`;

  return {
    'SOUL.md': soulMd,
    'IDENTITY.md': identityMd,
    'TOOLS.md': toolsMd,
    'MEMORY.md': memoryMd,
    'COLLABORATION.md': collaborationMd,
  };
}
