/**
 * Celebrity Souls Visual Data
 * 名人数字灵魂库视觉数据
 * 
 * 包含照片、简洁描述、名言和标注用语
 */

export interface CelebritySoulVisual {
  id: string;
  photoUrl: string;
  name: string;
  nameZh: string;
  archetype: string;
  bio: string; // 社交简介
  quote: string; // 广为人知的名言
  tags: string[]; // 简单标注用语
  color: string; // 主题色
}

export const CELEBRITY_SOULS_VISUAL: Record<string, CelebritySoulVisual> = {
  // 执行导向
  musk: {
    id: 'musk',
    photoUrl: '/images/celebrities/musk.jpg',
    name: 'Elon Musk',
    nameZh: '埃隆·马斯克',
    archetype: '钢铁战神型',
    bio: 'Tesla、SpaceX 创始人，用第一性原理改变世界',
    quote: '别告诉我困难，告诉我方案',
    tags: ['第一性原理', '快速迭代', '极致执行'],
    color: '#FF6B35',
  },

  bezos: {
    id: 'bezos',
    photoUrl: '/images/celebrities/bezos.jpg',
    name: 'Jeff Bezos',
    nameZh: '杰夫·贝索斯',
    archetype: '长期构造者',
    bio: 'Amazon 创始人，用十年视角构建帝国',
    quote: '如果你愿意投入七年，你就只和少数人竞争',
    tags: ['长期主义', '客户痴迷', '系统化'],
    color: '#FF9900',
  },

  huang: {
    id: 'huang',
    photoUrl: '/images/celebrities/huang.jpg',
    name: 'Jensen Huang',
    nameZh: '黄仁勋',
    archetype: '芯片偏执狂',
    bio: 'NVIDIA CEO，用技术定义下一代赛道',
    quote: '我们不是在追赶潮流，我们是在创造潮流',
    tags: ['技术信仰', '极致细节', '长期押注'],
    color: '#76B900',
  },

  grove: {
    id: 'grove',
    photoUrl: '/images/celebrities/grove.jpg',
    name: 'Andy Grove',
    nameZh: '安迪·格鲁夫',
    archetype: '效率独裁者',
    bio: 'Intel 前 CEO，用危机感驱动效率',
    quote: '只有偏执狂才能生存',
    tags: ['危机感驱动', '量化管理', '强执行'],
    color: '#C41E3A',
  },

  nadella: {
    id: 'nadella',
    photoUrl: '/images/celebrities/nadella.jpg',
    name: 'Satya Nadella',
    nameZh: '萨提亚·纳德拉',
    archetype: '儒雅重构者',
    bio: 'Microsoft CEO，用同理心重塑企业文化',
    quote: '同理心是领导者最重要的能力',
    tags: ['同理心', '文化建设', '成长型思维'],
    color: '#00A4EF',
  },

  // 创意与思想导向
  jobs: {
    id: 'jobs',
    photoUrl: '/images/celebrities/jobs.jpg',
    name: 'Steve Jobs',
    nameZh: '史蒂夫·乔布斯',
    archetype: '极简设计大师',
    bio: 'Apple 创始人，用极简美学改变世界',
    quote: '简单就是终极的复杂',
    tags: ['用户体验', '极简美学', '完美主义'],
    color: '#000000',
  },

  murakami: {
    id: 'murakami',
    photoUrl: '/images/celebrities/murakami.jpg',
    name: 'Haruki Murakami',
    nameZh: '村上春树',
    archetype: '文学创意大师',
    bio: '日本文学大师，用故事触动灵魂',
    quote: '故事是人类最古老的治疗方式',
    tags: ['深度创意', '文学气质', '独特视角'],
    color: '#2C3E50',
  },

  bowie: {
    id: 'bowie',
    photoUrl: '/images/celebrities/bowie.jpg',
    name: 'David Bowie',
    nameZh: '大卫·鲍威',
    archetype: '艺术创新先锋',
    bio: '音乐传奇，不断创新和跨界融合',
    quote: '不要重复自己，那是最大的死亡',
    tags: ['创新精神', '跨界融合', '打破常规'],
    color: '#FF1493',
  },

  drucker: {
    id: 'drucker',
    photoUrl: '/images/celebrities/drucker.jpg',
    name: 'Peter Drucker',
    nameZh: '彼得·德鲁克',
    archetype: '管理思想家',
    bio: '管理学之父，用系统思维指导组织',
    quote: '管理是一门艺术，也是一门科学',
    tags: ['系统思维', '人文关怀', '管理哲学'],
    color: '#34495E',
  },

  buffett: {
    id: 'buffett',
    photoUrl: '/images/celebrities/buffett.jpg',
    name: 'Warren Buffett',
    nameZh: '沃伦·巴菲特',
    archetype: '价值投资大师',
    bio: '投资大师，用理性分析创造财富',
    quote: '投资就是分析',
    tags: ['深度分析', '价值导向', '风险管理'],
    color: '#1F618D',
  },
};

/**
 * 获取灵魂的视觉数据
 */
export function getCelebritySoulVisual(id: string): CelebritySoulVisual | undefined {
  return CELEBRITY_SOULS_VISUAL[id];
}

/**
 * 列出所有灵魂的视觉数据
 */
export function listCelebritySoulsVisual(): CelebritySoulVisual[] {
  return Object.values(CELEBRITY_SOULS_VISUAL);
}

/**
 * 按分类列出灵魂
 */
export function listCelebritySoulsByCategory(category: 'execution' | 'creative'): CelebritySoulVisual[] {
  const executionIds = ['musk', 'bezos', 'huang', 'grove', 'nadella'];
  const creativeIds = ['jobs', 'murakami', 'bowie', 'drucker', 'buffett'];

  const ids = category === 'execution' ? executionIds : creativeIds;
  return ids
    .map(id => CELEBRITY_SOULS_VISUAL[id])
    .filter((soul): soul is CelebritySoulVisual => soul !== undefined);
}
