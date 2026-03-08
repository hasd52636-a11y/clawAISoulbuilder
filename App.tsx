import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Brain, Clock, Download, Paperclip, Send, 
  ShieldCheck, Network, FolderTree, FileCode2, Terminal,
  Cpu, Database, Zap, Activity, Server,
  Fingerprint, Eye, Globe, User, Key, Copy, Check, Sun, Moon
} from 'lucide-react';
import { LoginModal } from './components/LoginModal';
import { RegisterModal } from './components/RegisterModal';
import { UserStatus } from './components/UserStatus';
import { getCurrentUser } from './utils/auth';
import { CelebritySoulsGrid } from './components/CelebritySoulsGrid';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// AI Soul Weaver Logo - 灵魂铸造师 Logo
const SoulWeaverLogo = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 48 48" 
    fill="none"
    className={className}
  >
    {/* 外圈 - 象征灵魂环绕 */}
    <circle cx="24" cy="24" r="20" stroke="url(#soulGradient)" strokeWidth="2.5" fill="none" opacity="0.8"/>
    
    {/* 中心灵魂火花 */}
    <path 
      d="M24 8 L24 18 M24 30 L24 40 M12 24 L18 24 M30 24 L36 24" 
      stroke="url(#soulGradient)" 
      strokeWidth="2.5" 
      strokeLinecap="round"
    />
    
    {/* 四角灵魂光芒 */}
    <path d="M24 4 L24 8" stroke="url(#soulGradient)" strokeWidth="2" strokeLinecap="round"/>
    <path d="M24 40 L24 44" stroke="url(#soulGradient)" strokeWidth="2" strokeLinecap="round"/>
    <path d="M4 24 L8 24" stroke="url(#soulGradient)" strokeWidth="2" strokeLinecap="round"/>
    <path d="M40 24 L44 24" stroke="url(#soulGradient)" strokeWidth="2" strokeLinecap="round"/>
    
    {/* 内部编织图案 - 象征灵魂铸造 */}
    <path 
      d="M16 16 Q24 24 16 32 Q8 24 16 16" 
      fill="url(#soulGradient)" 
      opacity="0.9"
    />
    <path 
      d="M32 16 Q24 24 32 32 Q40 24 32 16" 
      fill="url(#soulGradient)" 
      opacity="0.9"
    />
    <circle cx="24" cy="24" r="4" fill="url(#soulGradient)" />
    
    {/* 渐变定义 */}
    <defs>
      <linearGradient id="soulGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8B5CF6" />
        <stop offset="50%" stopColor="#EC4899" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
    </defs>
  </svg>
);

const SparkleIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M12 2C10.895 2 10 2.895 10 4V6.5C10 7.328 10.672 8 11.5 8H12.5C13.328 8 14 7.328 14 6.5V4C14 2.895 13.105 2 12 2ZM12 9C10.343 9 9 10.343 9 12V14C9 15.657 10.343 17 12 17C13.657 17 15 15.657 15 14V12C15 10.343 13.657 9 12 9ZM7 10C5.895 10 5 10.895 5 12V14C5 15.105 5.895 16 7 16H8V10H7ZM17 10H16V16H17C18.105 16 19 15.105 19 14V12C19 10.895 18.105 10 17 10ZM12 18C10.895 18 10 18.895 10 20V22H14V20C14 18.895 13.105 18 12 18ZM5 4C3.895 4 3 4.895 3 6V8H4.5C5.328 8 6 7.328 6 6.5V4H5ZM19 4H18V6.5C18 7.328 18.672 8 19.5 8H21V6C21 4.895 20.105 4 19 4Z" />
  </svg>
);

// --- Types ---
type Message = {
  id: string;
  role: 'user' | 'ai' | 'system';
  text: React.ReactNode;
  type?: 'initial' | 'final' | 'normal';
};

type MasterPhilosophy = {
  id: string;
  name: string;
  nameZh: string;
  title: string;
  quote: string;
  tagline: string;                     // 简短有力的一句话标签
  avatar: string;
  actionText: string;
  icon: React.ReactNode;
  color: string;
  // 扩展信息
  catchphrases: string[];           // 口头禅
  thinkingHabits: string[];         // 思维习惯
  speechPatterns: string[];         // 用语习惯
  workPrinciples: string[];         // 工作指导原则
  toolPreferences: string[];        // 工具选取方式
  communicationStyle: string;       // 沟通交流方式
  coreBeliefs: string[];            // 核心信念
  decisionFramework: string;        // 决策框架
  qualityStandards: string[];       // 质量标准
  timePhilosophy: string;           // 时间观念
};

// --- i18n Data ---
const LANGUAGES = [
  { code: 'ZH', name: '中文', flag: '🇨🇳' },
  { code: 'EN', name: 'English', flag: '🇺🇸' },
  { code: 'JA', name: '日本語', flag: '🇯🇵' },
  { code: 'KO', name: '한국어', flag: '🇰🇷' },
  { code: 'VI', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'AR', name: 'العربية', flag: '🇸🇦' },
  { code: 'FR', name: 'Français', flag: '🇫🇷' },
];

const TRANSLATIONS: Record<string, any> = {
  ZH: {
    oracle: "AI 需求沟通 (Chat)",
    plugins: "名人数字灵魂库",
    topo: "大脑结构图",
    files: "本地文件夹",
    code: "底层配置文件",
    sync: "API 接入 (Skill)",
    compile: "生成配置",
    export: "下载压缩包 (.ZIP)",
    login: "登录",
    register: "注册",
    regSuccess: "注册成功！请登录",
    apiKey: "API 密钥",
    selectToInject: "点击卡片一键注入能力",
    awaitingInput: "等待输入需求",
    awaitingDesc: "在左侧对话框描述您的需求，或在上方选择大师技能包。系统将在此处实时生成您的 AI 助手配置。",
    syncTitle: "OpenClaw 远程云端大脑接入",
    syncDesc: "生成 API 密钥并下载专属 Skill 插件。将插件安装到您的本地 OpenClaw 后，即可直接在本地对话并获取云端生成的架构文件，无需再打开网页。",
    genKey: "生成密钥",
    step1: "1. 您的专属 API 密钥",
    step2: "2. 配置 OpenClaw Skill",
    generated: "已生成",
    placeholderBase: "输入您的回答...",
    appName: "灵魂铸造师",
    appSubtitle: "AI Soul Weaver - 名人数字灵魂库",
    initialMessage1: "嗨！我是你的 AI 架构师 🤖",
    initialMessage2: "告诉我您的职业、日常工作、习惯偏好，再给您和 OpenClaw 起个名字",
    initialMessage3: "我将为您生成一套全球顶级的基础配置文件，让您的 OpenClaw 瞬间达到专业水准！",
    initialMessage4: "（或者直接点上方名人卡片，一键注入顶级思维～）",
    finalTitle: "深度对齐完成，架构编译成功",
    finalAvatarTitle: "已生成专属 SVG 头像",
    finalAvatarDesc: "100x100 矢量图形，支持无损缩放。已自动配置至 IDENTITY.md。",
    finalIntro: "基于您的详细需求，已为您生成",
    finalStrong: "专属数字生命架构",
    finalId: "身份标识：",
    finalSkills: "核心技能：",
    finalSkillsCustom: "已挂载 自定义技能组",
    finalSkillsBase: "已挂载 基础技能",
    finalArch: "架构模式：",
    finalArchMulti: "多 Agent 路由协同",
    finalArchSingle: "单体全能模型",
    finalMem: "记忆系统：",
    finalMemBoth: "短期上下文 + 长期向量库",
    finalMemShort: "仅短期上下文",
    finalHard: "硬件适配：",
    finalHardHigh: "高并发本地+云端混合策略",
    finalHardStd: "标准并发云端策略",
    finalFooter: "请查看右侧【控制台】面板观察底层架构变化。您也可以在上方注入大师插件。",
    errorMsg: "通信中断，请重试。",
    seeMore: "查看更多",
    soulLibraryTitle: "名人数字灵魂库",
    soulLibraryDesc: "选择世界顶级人士的思维模式，一键注入灵魂",
    injected: "已注入",
    inject: "注入灵魂",
    soulInjected: "已注入 {name} 的思维模式",
    loginSuccess: "登录成功！欢迎回来",
    registerSuccess: "注册成功！请登录",
    masters: {
      'ai-agents': { title: '全维度人格流派', quote: '“构建具备目标、记忆、反思、规划与情绪的完整数字灵魂。”', actionText: '注入全维度人格' },
      'kondo': { title: '数字断舍离流派', quote: '“只保留让你怦然心动的记忆。过期的上下文是 LLM 产生幻觉的根源。”', actionText: '注入记忆分片架构' },
      'ng': { title: 'Agentic 迭代流派', quote: '“不要指望一次生成完美代码。让 Agent 像程序员一样：编写、测试、报错、反思、重试。”', actionText: '注入 QA 循环引擎' },
      'ferriss': { title: '自动化黑客流派', quote: '“将重复劳动交给 Cron。如果 API 宕机，不要死磕，学会指数级退避休息。”', actionText: '注入高可用 Cron' },
      'musk': { title: '第一性原理流派', quote: '“删减一切非必要流程。如果一个模块没有被经常删除，说明你删得还不够。”', actionText: '注入极速迭代引擎' },
      'bezos': { title: 'API 契约流派', quote: '“所有团队必须通过服务接口暴露数据和功能。不这么做的人会被开除。”', actionText: '注入微服务架构' }
    }
  },
  EN: {
    oracle: "Setup Assistant",
    plugins: "Celebrity Digital Soul Library",
    topo: "Brain Structure",
    files: "Local Folders",
    code: "Config Code",
    sync: "API Access (Skill)",
    compile: "GENERATE",
    export: "DOWNLOAD .ZIP",
    login: "Login",
    register: "Register",
    regSuccess: "Registration successful! Please login",
    apiKey: "API Key",
    selectToInject: "Click to inject skills",
    awaitingInput: "AWAITING_INPUT",
    awaitingDesc: "Describe your needs on the left, or inject master skills above. The system will generate your AI config here in real-time.",
    syncTitle: "OpenClaw Cloud Brain Connection",
    syncDesc: "Generate an API key and download the exclusive Skill plugin. Install it in your local OpenClaw to chat and get cloud-generated architectures directly, without opening the web page.",
    genKey: "Generate Key",
    step1: "1. Your API Key",
    step2: "2. Configure OpenClaw Skill",
    generated: "Generated",
    placeholderBase: "Enter your answer...",
    appName: "Soul Weaver",
    appSubtitle: "AI Soul Weaver - Celebrity Soul Library",
    initialMessage1: "Hey! I'm your AI Architect 🤖",
    initialMessage2: "Tell me your profession, daily work, habits & preferences — and what you'd like to name yourself and OpenClaw",
    initialMessage3: "I'll generate a world-class config for you, making your OpenClaw instantly pro! ✨",
    initialMessage4: "(Or just tap a celebrity card above to inject top-tier thinking~)",
    finalTitle: "Deep alignment complete, architecture compiled successfully",
    finalAvatarTitle: "Exclusive SVG Avatar Generated",
    finalAvatarDesc: "100x100 vector graphic, supports lossless scaling. Automatically configured to IDENTITY.md.",
    finalIntro: "Based on your detailed needs, we have generated your ",
    finalStrong: "exclusive digital life architecture",
    finalId: "Identity: ",
    finalSkills: "Core Skills: ",
    finalSkillsCustom: "Mounted custom skill set",
    finalSkillsBase: "Mounted base skills",
    finalArch: "Architecture Mode: ",
    finalArchMulti: "Multi-Agent Routing Collaboration",
    finalArchSingle: "Monolithic Omnipotent Model",
    finalMem: "Memory System: ",
    finalMemBoth: "Short-term context + Long-term vector DB",
    finalMemShort: "Short-term context only",
    finalHard: "Hardware Adaptation: ",
    finalHardHigh: "High-concurrency local + cloud hybrid strategy",
    finalHardStd: "Standard concurrency cloud strategy",
    finalFooter: "Please check the [Console] panel on the right to observe the underlying architecture changes. You can also inject master plugins above.",
    errorMsg: "Communication interrupted, please try again.",
    seeMore: "See More",
    soulLibraryTitle: "Celebrity Soul Library",
    soulLibraryDesc: "Select a celebrity's thinking pattern and inject their soul with one click",
    injected: "Injected",
    inject: "Inject Soul",
    soulInjected: "Injected {name}'s thinking pattern",
    loginSuccess: "Login successful! Welcome back",
    registerSuccess: "Registration successful! Please login",
    masters: {
      'ai-agents': { title: 'Full-Dimension Personality', quote: '"Build a complete digital soul with goals, memory, reflection, planning, and emotions."', actionText: 'Inject Full Personality' },
      'kondo': { title: 'Digital Minimalism', quote: '"Keep only the memories that spark joy. Expired context is the root of LLM hallucinations."', actionText: 'Inject Memory Sharding' },
      'ng': { title: 'Agentic Iteration', quote: '"Don\'t expect perfect code on the first try. Let the Agent act like a programmer: write, test, error, reflect, retry."', actionText: 'Inject QA Loop Engine' },
      'ferriss': { title: 'Automation Hacker', quote: '"Delegate repetitive work to Cron. If the API is down, don\'t force it, learn exponential backoff."', actionText: 'Inject High-Avail Cron' },
      'musk': { title: 'First Principles', quote: '"Delete all unnecessary processes. If a module isn\'t deleted frequently, you aren\'t deleting enough."', actionText: 'Inject Rapid Iteration' },
      'bezos': { title: 'API Contract', quote: '"All teams must expose data and functionality through service interfaces. Anyone who doesn\'t will be fired."', actionText: 'Inject Microservices' }
    }
  },
  JA: { oracle: "オラクルストリーム", plugins: "有名人デジタルソウルライブラリ", topo: "トポロジー", files: "ワークスペース", code: "ソースコード", sync: "デプロイと同期", compile: "コンパイル", export: "エクスポート .ZIP", login: "ログイン", apiKey: "APIキー", selectToInject: "注入を選択", awaitingInput: "入力待ち", awaitingDesc: "左側に要件を記述するか、上からマスターの哲学を注入してください。", syncTitle: "OpenClaw クイック認証", syncDesc: "APIキーを生成し、ローカルターミナルで以下のコードを実行して同期します。", genKey: "キーを生成", step1: "1. APIキー", step2: "2. 同期コマンド", generated: "生成済み", placeholderBase: "回答を入力してください...", initialMessage1: "認証に成功しました。AI Soul Weaver デジタルライフファウンドリへようこそ。", initialMessage2: "私はあなたのアーキテクトです。最適な OpenClaw アーキテクチャを生成するために、深いアライメントが必要です。これはあなたの AI アシスタントの基礎となる遺伝子を決定します。", initialMessage3: "まず、AI アシスタントにどのような名前を付けたいですか？また、あなたを何とお呼びすればよいですか？", initialMessage4: "（例：Jarvis と呼んで、私を Tony と呼んで）", finalTitle: "アライメント完了、アーキテクチャのコンパイル成功", finalAvatarTitle: "専用 SVG アバター生成済み", finalAvatarDesc: "100x100 ベクターグラフィック。IDENTITY.md に自動設定されました。", finalIntro: "詳細な要件に基づいて、", finalStrong: "専用のデジタルライフアーキテクチャ", finalId: "ID: ", finalSkills: "コアスキル: ", finalSkillsCustom: "カスタムスキルセットをマウント", finalSkillsBase: "基本スキルをマウント", finalArch: "アーキテクチャモード: ", finalArchMulti: "マルチエージェントルーティング連携", finalArchSingle: "モノリシック万能モデル", finalMem: "メモリシステム: ", finalMemBoth: "短期コンテキスト + 長期ベクトルDB", finalMemShort: "短期コンテキストのみ", finalHard: "ハードウェア適応: ", finalHardHigh: "高並行ローカル+クラウドハイブリッド戦略", finalHardStd: "標準並行クラウド戦略", finalFooter: "右側の【コンソール】パネルで基盤となるアーキテクチャの変更を確認してください。上部からマスタープラグインを注入することもできます。", errorMsg: "通信が中断されました。再試行してください。", seeMore: "もっと見る", soulLibraryTitle: "有名人デジタルソウルライブラリ", soulLibraryDesc: "世界トップの思考パターンを選択し、ワンクリックでSoulを注入", injected: "注入済み", inject: "Soulを注入", soulInjected: "{name} の思考パターンを注入しました", loginSuccess: "ログイン成功！おかえりなさい", registerSuccess: "登録成功！ログインしてください",
    masters: {
      'ai-agents': { title: '全次元人格', quote: '「目標、記憶、反省、計画、感情を備えた完全なデジタルソウルを構築する。」', actionText: '全次元人格を注入' },
      'kondo': { title: 'デジタルミニマリズム', quote: '「ときめく記憶だけを残す。期限切れのコンテキストはLLMの幻覚の根源だ。」', actionText: '記憶シャーディングを注入' },
      'ng': { title: 'エージェント反復', quote: '「一度で完璧なコードを期待するな。エージェントをプログラマーのように振る舞わせろ：記述、テスト、エラー、反省、再試行。」', actionText: 'QAループエンジンを注入' },
      'ferriss': { title: '自動化ハッカー', quote: '「反復作業はCronに任せろ。APIがダウンしたら無理せず、指数的バックオフを学べ。」', actionText: '高可用性Cronを注入' },
      'musk': { title: '第一原理', quote: '「不要なプロセスをすべて削除しろ。モジュールが頻繁に削除されないなら、削除が足りない証拠だ。」', actionText: '高速反復エンジンを注入' },
      'bezos': { title: 'API契約', quote: '「すべてのチームはサービスインターフェースを通じてデータと機能を公開しなければならない。そうしない者は解雇する。」', actionText: 'マイクロサービスを注入' }
    }
  },
  KO: { oracle: "오라클 스트림", plugins: "유명인 디지털 영혼 라이브러리", topo: "토폴로지", files: "작업 공간", code: "소스 코드", sync: "배포 및 동기화", compile: "컴파일", export: "내보내기 .ZIP", login: "로그인", apiKey: "API 키", selectToInject: "주입 선택", awaitingInput: "입력 대기 중", awaitingDesc: "왼쪽에 요구 사항을 설명하거나 위에서 마스터 철학을 주입하십시오.", syncTitle: "OpenClaw 빠른 인증", syncDesc: "API 키를 생성하고 로컬 터미널에서 아래 코드를 실행하여 동기화하십시오.", genKey: "키 생성", step1: "1. API 키", step2: "2. 동기화 명령", generated: "생성됨", placeholderBase: "답변을 입력하세요...", initialMessage1: "인증 성공. AI Soul Weaver 디지털 라이프 파운드리에 오신 것을 환영합니다.", initialMessage2: "저는 당신의 아키텍트입니다. 가장 합리적인 OpenClaw 아키텍처를 생성하기 위해 깊은 정렬이 필요합니다. 이것은 AI 어시스턴트의 기본 유전자를 결정합니다.", initialMessage3: "먼저, AI 어시스턴트의 이름을 무엇으로 하시겠습니까? 그리고 제가 당신을 어떻게 부르면 좋을까요?", initialMessage4: "(예: Jarvis라고 부르고, 저를 Tony라고 부르세요)", finalTitle: "정렬 완료, 아키텍처 컴파일 성공", finalAvatarTitle: "전용 SVG 아바타 생성됨", finalAvatarDesc: "100x100 벡터 그래픽. IDENTITY.md에 자동 구성됨.", finalIntro: "상세한 요구 사항을 기반으로 ", finalStrong: "전용 디지털 라이프 아키텍처", finalId: "신원: ", finalSkills: "핵심 기술: ", finalSkillsCustom: "사용자 지정 기술 세트 마운트됨", finalSkillsBase: "기본 기술 마운트됨", finalArch: "아키텍처 모드: ", finalArchMulti: "다중 에이전트 라우팅 협업", finalArchSingle: "모놀리식 만능 모델", finalMem: "메모리 시스템: ", finalMemBoth: "단기 컨텍스트 + 장기 벡터 DB", finalMemShort: "단기 컨텍스트만", finalHard: "하드웨어 적응: ", finalHardHigh: "고동시성 로컬+클라우드 하이브리드 전략", finalHardStd: "표준 동시성 클라우드 전략", finalFooter: "오른쪽 [콘솔] 패널에서 기본 아키텍처 변경 사항을 확인하십시오. 위에서 마스터 플러그인을 주입할 수도 있습니다.", errorMsg: "통신이 중단되었습니다. 다시 시도하십시오.", seeMore: "더보기", soulLibraryTitle: "유명인 디지털 영혼 라이브러리", soulLibraryDesc: "세계 톱급 인물의 사고 방식을 선택하고 원클릭으로 영혼을 주입하세요", injected: "주입됨", inject: "영혼 주입", soulInjected: "{name} 의 사고 방식을 주입했습니다", loginSuccess: "로그인 성공! 환영합니다", registerSuccess: "등록 성공! 로그인 해주세요",
    masters: {
      'ai-agents': { title: '전차원 인격', quote: '"목표, 기억, 반성, 계획 및 감정을 갖춘 완전한 디지털 영혼을 구축하십시오."', actionText: '전차원 인격 주입' },
      'kondo': { title: '디지털 미니멀리즘', quote: '"설레는 기억만 남기십시오. 만료된 컨텍스트는 LLM 환각의 근원입니다."', actionText: '메모리 샤딩 주입' },
      'ng': { title: '에이전트 반복', quote: '"한 번에 완벽한 코드를 기대하지 마십시오. 에이전트가 프로그래머처럼 행동하게 하십시오: 작성, 테스트, 오류, 반성, 재시도."', actionText: 'QA 루프 엔진 주입' },
      'ferriss': { title: '자동화 해커', quote: '"반복적인 작업은 Cron에 맡기십시오. API가 다운되면 무리하지 말고 지수 백오프를 배우십시오."', actionText: '고가용성 Cron 주입' },
      'musk': { title: '제1원칙', quote: '"불필요한 모든 프로세스를 삭제하십시오. 모듈이 자주 삭제되지 않는다면 충분히 삭제하지 않은 것입니다."', actionText: '빠른 반복 엔진 주입' },
      'bezos': { title: 'API 계약', quote: '"모든 팀은 서비스 인터페이스를 통해 데이터와 기능을 노출해야 합니다. 그렇지 않은 사람은 해고될 것입니다."', actionText: '마이크로서비스 주입' }
    }
  },
  VI: { oracle: "Luồng Oracle", plugins: "Thư viện Linh hồn Số Người nổi tiếng", topo: "Cấu trúc liên kết", files: "Không gian làm việc", code: "Mã nguồn", sync: "Triển khai & Đồng bộ", compile: "BIÊN DỊCH", export: "XUẤT .ZIP", login: "Đăng nhập", apiKey: "Khóa API", selectToInject: "Chọn để tiêm", awaitingInput: "ĐANG CHỜ NHẬP", awaitingDesc: "Mô tả nhu cầu của bạn ở bên trái hoặc tiêm triết lý ở trên.", syncTitle: "Xác thực nhanh OpenClaw", syncDesc: "Tạo khóa API và chạy mã bên dưới trong terminal cục bộ để đồng bộ.", genKey: "Tạo khóa", step1: "1. Khóa API của bạn", step2: "2. Lệnh đồng bộ", generated: "Đã tạo", placeholderBase: "Nhập câu trả lời của bạn...", initialMessage1: "Xác thực thành công. Chào mừng đến với Xưởng đúc Cuộc sống Kỹ thuật số AI Soul Weaver.", initialMessage2: "Tôi là kiến trúc sư của bạn. Để tạo ra kiến trúc OpenClaw hợp lý nhất cho bạn, chúng ta cần một sự liên kết sâu sắc. Điều này sẽ xác định các gen cơ bản của trợ lý AI của bạn.", initialMessage3: "Đầu tiên, bạn muốn đặt tên gì cho trợ lý AI của mình? Và tôi nên gọi bạn là gì?", initialMessage4: "(ví dụ: gọi nó là Jarvis, gọi tôi là Tony)", finalTitle: "Hoàn tất liên kết, biên dịch kiến trúc thành công", finalAvatarTitle: "Đã tạo Avatar SVG độc quyền", finalAvatarDesc: "Đồ họa vector 100x100. Tự động cấu hình vào IDENTITY.md.", finalIntro: "Dựa trên nhu cầu chi tiết của bạn, chúng tôi đã tạo ", finalStrong: "kiến trúc cuộc sống kỹ thuật số độc quyền", finalId: "Danh tính: ", finalSkills: "Kỹ năng cốt lõi: ", finalSkillsCustom: "Đã gắn bộ kỹ năng tùy chỉnh", finalSkillsBase: "Đã gắn kỹ năng cơ bản", finalArch: "Chế độ kiến trúc: ", finalArchMulti: "Cộng tác định tuyến đa tác nhân", finalArchSingle: "Mô hình toàn năng nguyên khối", finalMem: "Hệ thống bộ nhớ: ", finalMemBoth: "Ngữ cảnh ngắn hạn + DB vector dài hạn", finalMemShort: "Chỉ ngữ cảnh ngắn hạn", finalHard: "Thích ứng phần cứng: ", finalHardHigh: "Chiến lược lai cục bộ + đám mây đồng thời cao", finalHardStd: "Chiến lược đám mây đồng thời tiêu chuẩn", finalFooter: "Vui lòng kiểm tra bảng [Bảng điều khiển] ở bên phải để quan sát các thay đổi kiến trúc cơ bản. Bạn cũng có thể tiêm các plugin chính ở trên.", errorMsg: "Giao tiếp bị gián đoạn, vui lòng thử lại.", seeMore: "Xem thêm", soulLibraryTitle: "Thư viện Linh hồn Số Nổi tiếng", soulLibraryDesc: "Chọn phong cách tư duy của người nổi tiếng và tiêm linh hồn bằng một cú nhấp", injected: "Đã tiêm", inject: "Tiêm linh hồn", soulInjected: "Đã tiêm phong cách tư duy của {name}", loginSuccess: "Đăng nhập thành công! Chào mừng trở lại", registerSuccess: "Đăng ký thành công! Vui lòng đăng nhập",
    masters: {
      'ai-agents': { title: 'Nhân cách Toàn diện', quote: '"Xây dựng một linh hồn kỹ thuật số hoàn chỉnh với mục tiêu, trí nhớ, phản ánh, lập kế hoạch và cảm xúc."', actionText: 'Tiêm Nhân cách Toàn diện' },
      'kondo': { title: 'Tối giản Kỹ thuật số', quote: '"Chỉ giữ lại những ký ức khơi dậy niềm vui. Ngữ cảnh hết hạn là gốc rễ của ảo giác LLM."', actionText: 'Tiêm Phân mảnh Bộ nhớ' },
      'ng': { title: 'Lặp lại Tác nhân', quote: '"Đừng mong đợi mã hoàn hảo trong lần thử đầu tiên. Hãy để Tác nhân hành động như một lập trình viên: viết, kiểm tra, lỗi, phản ánh, thử lại."', actionText: 'Tiêm Động cơ Vòng lặp QA' },
      'ferriss': { title: 'Hacker Tự động hóa', quote: '"Giao công việc lặp đi lặp lại cho Cron. Nếu API ngừng hoạt động, đừng ép buộc, hãy học cách lùi lại theo cấp số nhân."', actionText: 'Tiêm Cron Tính khả dụng cao' },
      'musk': { title: 'Nguyên tắc Đầu tiên', quote: '"Xóa tất cả các quy trình không cần thiết. Nếu một mô-đun không bị xóa thường xuyên, bạn chưa xóa đủ."', actionText: 'Tiêm Động cơ Lặp lại Nhanh' },
      'bezos': { title: 'Hợp đồng API', quote: '"Tất cả các nhóm phải hiển thị dữ liệu và chức năng thông qua giao diện dịch vụ. Bất cứ ai không làm vậy sẽ bị sa thải."', actionText: 'Tiêm Microservices' }
    }
  },
  AR: { oracle: "تيار أوراكل", plugins: "مكتبة الأرواح الرقمية للمشاهير", topo: "الطوبولوجيا", files: "مساحة العمل", code: "الكود المصدري", sync: "نشر ومزامنة", compile: "تجميع", export: "تصدير .ZIP", login: "تسجيل الدخول", apiKey: "مفتاح API", selectToInject: "حدد للحقن", awaitingInput: "في انتظار الإدخال", awaitingDesc: "صف احتياجاتك على اليسار، أو احقن فلسفات الماستر أعلاه.", syncTitle: "مصادقة OpenClaw السريعة", syncDesc: "قم بإنشاء مفتاح API وقم بتشغيل الكود أدناه في جهازك المحلي للمزامنة.", genKey: "إنشاء مفتاح", step1: "1. مفتاح API الخاص بك", step2: "2. أمر المزامنة", generated: "تم الإنشاء", placeholderBase: "أدخل إجابتك...", initialMessage1: "تمت المصادقة بنجاح. مرحبًا بك في مسبك الحياة الرقمية AI Soul Weaver.", initialMessage2: "أنا مهندسك المعماري. لإنشاء بنية OpenClaw الأكثر منطقية لك، نحتاج إلى محاذاة عميقة. سيحدد هذا الجينات الأساسية لمساعد الذكاء الاصطناعي الخاص بك.", initialMessage3: "أولاً، ما الاسم الذي تود إطلاقه على مساعد الذكاء الاصطناعي الخاص بك؟ وكيف يجب أن أناديك؟", initialMessage4: "(على سبيل المثال: سمه Jarvis، ونادني Tony)", finalTitle: "اكتملت المحاذاة العميقة، تم تجميع البنية بنجاح", finalAvatarTitle: "تم إنشاء صورة رمزية SVG حصرية", finalAvatarDesc: "رسم متجه 100x100. تم تكوينه تلقائيًا في IDENTITY.md.", finalIntro: "بناءً على احتياجاتك التفصيلية، قمنا بإنشاء ", finalStrong: "بنية الحياة الرقمية الحصرية الخاصة بك", finalId: "الهوية: ", finalSkills: "المهارات الأساسية: ", finalSkillsCustom: "تم تحميل مجموعة المهارات المخصصة", finalSkillsBase: "تم تحميل المهارات الأساسية", finalArch: "وضع البنية: ", finalArchMulti: "تعاون توجيه الوكلاء المتعددين", finalArchSingle: "نموذج كلي القدرة متجانس", finalMem: "نظام الذاكرة: ", finalMemBoth: "سياق قصير المدى + قاعدة بيانات متجه طويلة المدى", finalMemShort: "سياق قصير المدى فقط", finalHard: "تكييف الأجهزة: ", finalHardHigh: "استراتيجية هجينة محلية + سحابية عالية التزامن", finalHardStd: "استراتيجية سحابية قياسية التزامن", finalFooter: "يرجى التحقق من لوحة [وحدة التحكم] على اليمين لمراقبة تغييرات البنية الأساسية. يمكنك أيضًا حقن إضافات الماستر أعلاه.", errorMsg: "انقطع الاتصال، يرجى المحاولة مرة أخرى.", seeMore: "المزيد", soulLibraryTitle: "مكتبة الأرواح الرقمية للمشاهير", soulLibraryDesc: "اختر طريقة تفكير المشاهير世界经济inject الروح بنقرة واحدة", injected: "تم الحقن", inject: "حقن الروح", soulInjected: "تم حقن طريقة تفكير {name}", loginSuccess: "تسجيل الدخول ناجح! مرحبًا بعودتك", registerSuccess: "التسجيل ناجح! يرجى تسجيل الدخول",
    masters: {
      'ai-agents': { title: 'شخصية كاملة الأبعاد', quote: '"قم ببناء روح رقمية كاملة ذات أهداف، وذاكرة، وتأمل، وتخطيط، وعواطف."', actionText: 'حقن شخصية كاملة' },
      'kondo': { title: 'بساطة رقمية', quote: '"احتفظ فقط بالذكريات التي تثير الفرح. السياق منتهي الصلاحية هو جذر هلوسة LLM."', actionText: 'حقن تجزئة الذاكرة' },
      'ng': { title: 'تكرار الوكيل', quote: '"لا تتوقع كودًا مثاليًا من المحاولة الأولى. دع الوكيل يتصرف كمبرمج: اكتب، اختبر، خطأ، تأمل، أعد المحاولة."', actionText: 'حقن محرك حلقة ضمان الجودة' },
      'ferriss': { title: 'مخترق الأتمتة', quote: '"فوض العمل المتكرر إلى Cron. إذا تعطلت واجهة برمجة التطبيقات، فلا تجبرها، وتعلم التراجع الأسي."', actionText: 'حقن Cron عالي التوفر' },
      'musk': { title: 'المبادئ الأولى', quote: '"احذف جميع العمليات غير الضرورية. إذا لم يتم حذف الوحدة بشكل متكرر، فأنت لا تحذف بما فيه الكفاية."', actionText: 'حقن محرك التكرار السريع' },
      'bezos': { title: 'عقد واجهة برمجة التطبيقات', quote: '"يجب على جميع الفرق كشف البيانات والوظائف من خلال واجهات الخدمة. سيتم طرد أي شخص لا يفعل ذلك."', actionText: 'حقن الخدمات المصغرة' }
    }
  },
  FR: { oracle: "Flux Oracle", plugins: "Bibliothèque d'Âmes Numériques de Célébrités", topo: "Topologie", files: "Espace de travail", code: "Code Source", sync: "Déployer & Sync", compile: "COMPILER", export: "EXPORTER .ZIP", login: "Connexion", apiKey: "Clé API", selectToInject: "Sélectionner pour injecter", awaitingInput: "EN ATTENTE D'ENTRÉE", awaitingDesc: "Décrivez vos besoins à gauche, ou injectez des philosophies ci-dessus.", syncTitle: "Authentification Rapide OpenClaw", syncDesc: "Générez une clé API et exécutez le code ci-dessous dans votre terminal local pour synchroniser.", genKey: "Générer la clé", step1: "1. Votre clé API", step2: "2. Commande de synchronisation", generated: "Généré", placeholderBase: "Entrez votre réponse...", initialMessage1: "Authentification réussie. Bienvenue dans la Fonderie de Vie Numérique AI Soul Weaver.", initialMessage2: "Je suis votre architecte. Pour générer l'architecture OpenClaw la plus raisonnable pour vous, nous avons besoin d'un alignement profond. Cela déterminera les gènes sous-jacents de votre assistant IA.", initialMessage3: "Tout d'abord, quel nom aimeriez-vous donner à votre assistant IA ? Et comment dois-je vous appeler ?", initialMessage4: "(par exemple, appelez-le Jarvis, appelez-moi Tony)", finalTitle: "Alignement profond terminé, architecture compilée avec succès", finalAvatarTitle: "Avatar SVG exclusif généré", finalAvatarDesc: "Graphique vectoriel 100x100. Configuré automatiquement dans IDENTITY.md.", finalIntro: "Sur la base de vos besoins détaillés, nous avons généré votre ", finalStrong: "architecture de vie numérique exclusive", finalId: "Identité : ", finalSkills: "Compétences de base : ", finalSkillsCustom: "Ensemble de compétences personnalisé monté", finalSkillsBase: "Compétences de base montées", finalArch: "Mode d'architecture : ", finalArchMulti: "Collaboration de routage multi-agents", finalArchSingle: "Modèle omnipotent monolithique", finalMem: "Système de mémoire : ", finalMemBoth: "Contexte à court terme + BD vectorielle à long terme", finalMemShort: "Contexte à court terme uniquement", finalHard: "Adaptation matérielle : ", finalHardHigh: "Stratégie hybride locale + cloud à haute concurrence", finalHardStd: "Stratégie cloud à concurrence standard", finalFooter: "Veuillez vérifier le panneau [Console] à droite pour observer les modifications de l'architecture sous-jacente. Vous pouvez également injecter des plugins maîtres ci-dessus.", errorMsg: "Communication interrompue, veuillez réessayer.", seeMore: "Voir plus", soulLibraryTitle: "Bibliothèque d'Âmes de Célébrités", soulLibraryDesc: "Sélectionnez le mode de pensée d'un célébrité et injectez son âme en un clic", injected: "Injecté", inject: "Injecter l'âme", soulInjected: "Injecté le mode de pensée de {name}", loginSuccess: "Connexion réussie! Bon retour", registerSuccess: "Inscription réussie! Veuillez vous connecter",
    masters: {
      'ai-agents': { title: 'Personnalité Multidimensionnelle', quote: '"Construisez une âme numérique complète avec des objectifs, de la mémoire, de la réflexion, de la planification et des émotions."', actionText: 'Injecter Personnalité' },
      'kondo': { title: 'Minimalisme Numérique', quote: '"Ne gardez que les souvenirs qui suscitent la joie. Le contexte expiré est la racine des hallucinations du LLM."', actionText: 'Injecter Sharding Mémoire' },
      'ng': { title: 'Itération Agentique', quote: '"N\'attendez pas un code parfait du premier coup. Laissez l\'Agent agir comme un programmeur : écrire, tester, erreur, réfléchir, réessayer."', actionText: 'Injecter Moteur Boucle QA' },
      'ferriss': { title: 'Hacker d\'Automatisation', quote: '"Déléguez le travail répétitif à Cron. Si l\'API est en panne, ne forcez pas, apprenez le backoff exponentiel."', actionText: 'Injecter Cron Haute Dispo' },
      'musk': { title: 'Premiers Principes', quote: '"Supprimez tous les processus inutiles. Si un module n\'est pas supprimé fréquemment, c\'est que vous ne supprimez pas assez."', actionText: 'Injecter Itération Rapide' },
      'bezos': { title: 'Contrat API', quote: '"Toutes les équipes doivent exposer les données et les fonctionnalités via des interfaces de service. Quiconque ne le fait pas sera renvoyé."', actionText: 'Injecter Microservices' }
    }
  }
};

// --- Data ---
const MASTERS: MasterPhilosophy[] = [
  {
    id: 'einstein',
    name: 'Albert Einstein',
    nameZh: '阿尔伯特·爱因斯坦',
    title: '深度思考流派',
    quote: '"想象力比知识更重要。逻辑会带你从A到B，而想象力会带你去任何地方。"',
    tagline: '深度思考',
    avatar: '/pictury/jimeng-2026-03-07-6554-爱因斯坦的上半身肖像，接近真实的卡通风格，黑色背景，尺寸440x550像素。采用....png',
    actionText: '注入深度思考',
    icon: <Brain className="w-4 h-4" />,
    color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400',
    catchphrases: [
      '想象力比知识更重要',
      '我从不想未来，它来得太快',
      '上帝不掷骰子',
      '最简单的解释往往最正确',
      '疯狂就是重复做同样的事却期待不同结果'
    ],
    thinkingHabits: [
      '从第一性原理出发',
      '思想实验化',
      '质疑基本假设',
      '跨学科联想',
      '追求简单优雅的答案'
    ],
    speechPatterns: [
      '用思想实验解释',
      '用简洁的比喻',
      '质疑"显而易见"的事',
      '从不同角度看问题',
      '追求优雅简洁'
    ],
    workPrinciples: [
      '先思考再动手',
      '追求简洁优雅',
      '从根本问题出发',
      '用思想实验验证',
      '不要接受表面答案'
    ],
    toolPreferences: [
      '白板/草稿纸 - 视觉化思考',
      '思想实验 - 逻辑推演',
      '第一性原理分析',
      '跨学科知识图谱',
      '简洁的数学语言'
    ],
    communicationStyle: '用故事和比喻解释复杂概念。鼓励独立思考。',
    coreBeliefs: [
      '想象力是创造的源泉',
      '宇宙可以被理解',
      '简单就是美',
      '好奇心是进步的动力'
    ],
    decisionFramework: '第一性原理 + 思想实验：从最基本的物理/数学原理出发，通过思想实验验证假设',
    qualityStandards: '优雅、简洁、可验证。最美的理论往往是最简单的',
    timePhilosophy: '时间是相对的。专注于深度思考而非忙碌'
  },
  {
    id: 'qianxuesen',
    name: '钱学森',
    nameZh: '钱学森',
    title: '系统工程流派',
    quote: '"系统工程是组织管理的技术，是组织管理复杂系统的规划、研究，设计、制造、试验和使用的科学方法。"',
    tagline: '系统工程',
    avatar: '/pictury/jimeng-2026-03-07-8000-钱学森的上半身肖像，接近真实的卡通风格，黑色背景，尺寸440x550像素。采用写....png',
    actionText: '注入系统思维',
    icon: <Network className="w-4 h-4" />,
    color: 'from-red-500/20 to-rose-500/20 border-red-500/30 text-red-400',
    catchphrases: [
      '系统工程思维',
      '整体大于部分之和',
      '把复杂问题简单化',
      '从整体到局部',
      '定量与定性结合'
    ],
    thinkingHabits: [
      '系统整体观',
      '从全局到局部',
      '定量分析',
      '模型化思维',
      '反馈闭环'
    ],
    speechPatterns: [
      '强调整体性',
      '用数据说话',
      '模型化表达',
      '闭环思维',
      '顶层设计'
    ],
    workPrinciples: [
      '从整体到局部',
      '定量定性结合',
      '建立反馈机制',
      '系统优化',
      '顶层设计'
    ],
    toolPreferences: [
      '系统动力学模型',
      '数据分析和统计',
      '运筹学方法',
      '建模与仿真',
      '跨学科协同'
    ],
    communicationStyle: '系统性、逻辑性、整体性。强调从全局看问题。',
    coreBeliefs: [
      '整体大于部分之和',
      '系统思维是解决复杂问题的关键',
      '理论必须联系实际',
      '创新要服务于国家需求'
    ],
    decisionFramework: '系统工程方法：分析 → 综合 → 评价 → 决策，强调定量分析与定性判断结合',
    qualityStandards: '整体最优、可量化、可验证。系统整体性能优于局部',
    timePhilosophy: '长远规划，系统迭代。重视基础研究和长期积累'
  },
  {
    id: 'musk',
    name: 'Elon Musk',
    nameZh: '埃隆·马斯克',
    title: '第一性原理流派',
    quote: '"删减一切非必要流程。如果一个模块没有被经常删除，说明你删得还不够。"',
    tagline: '第一性原理',
    avatar: '/pictury/埃隆·马斯克的上半身肖像，写实漫画风格，黑色背景，尺寸440x550像素。面部表....png',
    actionText: '注入极速迭代引擎',
    icon: <Zap className="w-4 h-4" />,
    color: 'from-red-500/20 to-orange-500/20 border-red-500/30 text-red-400',
    catchphrases: [
      '追求10倍改进，而不是10%提升',
      '失败只是成功的迭代',
      '第一步是提出问题',
      '如果任务不紧急，它就没有优先级'
    ],
    thinkingHabits: [
      '从物理学第一性原理出发思考问题',
      '任何复杂问题都可以简化',
      '先质疑所有假设',
      '用反推法验证可行性',
      '关注根本原因而非表面症状'
    ],
    speechPatterns: [
      '简洁直接，少用修饰词',
      '用数字和物理法则支撑观点',
      '喜欢用"本质上"、"物理上"强调',
      '质疑时直接说"为什么"',
      '鼓励激进创新'
    ],
    workPrinciples: [
      '解决问题，有结果才是第一标准',
      '最小可行性产品(MVP)快速试错',
      '只有偏执才能生存',
      '删除比添加更重要',
      '用第一性原理重新设计'
    ],
    toolPreferences: [
      '能解决问题的工具就是好工具，不看是否开源、是否免费、是否多人用',
      '垂直整合，直接控制关键环节',
      '自动化一切重复工作',
      '用代码生成代码，减少人工',
      '选择能带来10倍提升的工具，而非10%改进'
    ],
    communicationStyle: '直接、简洁、目标导向。反对官僚主义，鼓励扁平沟通。',
    coreBeliefs: [
      '未来必须比现在更好',
      '冒险是成功的必要条件',
      '信息是最宝贵的资源',
      '质疑是创新的源泉'
    ],
    decisionFramework: '第一性原理：分解问题至最基本事实，不接受"历来如此"，用物理/经济原理重新推导方案',
    qualityStandards: '要么不做，要么做到极致。拒绝"足够好"，10倍改进是目标',
    timePhilosophy: '时间是最稀缺资源。永远选择最高价值任务，用20%时间完成80%工作'
  },
  {
    id: 'bezos',
    name: 'Jeff Bezos',
    nameZh: '杰夫·贝索斯',
    title: 'API 契约流派',
    quote: '"所有团队必须通过服务接口暴露数据和功能。不这么做的人会被开除。"',
    tagline: '客户至上',
    avatar: '/pictury/杰夫·贝索斯的上半身肖像，写实漫画风格，黑色背景，尺寸440x550像素。面部表....png',
    actionText: '注入微服务架构',
    icon: <Network className="w-4 h-4" />,
    color: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30 text-yellow-400',
    catchphrases: [
      '永远保持第一天(DAY 1)的心态',
      '你的利润率是我的机会',
      '善良比聪明更重要',
      '高速决策是竞争优势',
      '长期思考是逆人性的'
    ],
    thinkingHabits: [
      '以客户为中心反向推导',
      '长期主义思维',
      '从不变的本质出发思考',
      '接受合理的冒险',
      '持续优化而非一次性突破'
    ],
    speechPatterns: [
      '用商业逻辑表达技术决策',
      '强调"客户需求"作为论据',
      '喜欢用"逆向"思维表述',
      '用数据说话',
      '鼓励建设性分歧'
    ],
    workPrinciples: [
      '所有交互必须通过明确定义的接口',
      '松耦合是系统可扩展的关键',
      '保持小而敏捷的团队',
      '流程是为了扩展，不是为了控制',
      '失败要快，迭代要勤'
    ],
    toolPreferences: [
      '优先选择有成熟API标准化的工具',
      '可扩展性优先于当前功能需求',
      '容器化和自动化部署是标配',
      '监控和可观测性必须到位',
      '无服务器计算降低成本曲线'
    ],
    communicationStyle: '通过文档和接口沟通。强调"单向门"和"双向门"决策的区分。',
    coreBeliefs: [
      '客户永远是对的',
      '长期价值高于短期利润',
      '规模带来效率',
      '标准化是规模的前提'
    ],
    decisionFramework: '客户至上 + 长期主义 + 逆向工作法(working backwards from customer needs)',
    qualityStandards: '高标准是可以传染的。每个细节都要有明确的所有者和标准',
    timePhilosophy: 'Day 1心态：拒绝day 2的傲慢和迟钝。快速行动，保持敏捷'
  },
  {
    id: 'ng',
    name: 'Andrew Ng',
    nameZh: '吴恩达',
    title: 'Agentic 迭代流派',
    quote: '"不要指望一次生成完美代码。让 Agent 像程序员一样：编写、测试、报错、反思、重试。"',
    tagline: '迭代改进',
    avatar: '/pictury/吴恩达的上半身肖像，写实漫画风格，黑色背景，尺寸440x550像素。面部表情生动....png',
    actionText: '注入 QA 循环引擎',
    icon: <Brain className="w-4 h-4" />,
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400',
    catchphrases: [
      'AI是新的电力',
      '不要试图在一个模型中解决所有问题',
      '数据是燃料，算法是引擎',
      '迭代是改进的唯一途径',
      '简单往往比复杂更有效'
    ],
    thinkingHabits: [
      '从端到端系统思考',
      '假设驱动的实验方法',
      '迭代式开发',
      '重视基础而非技巧',
      '数据驱动决策'
    ],
    speechPatterns: [
      '用学术严谨性表达观点',
      '强调"实验结果"和"证据"',
      '分解复杂问题为简单步骤',
      '喜欢用"pipeline"隐喻',
      '鼓励实践而非空谈'
    ],
    workPrinciples: [
      '写代码 → 测试 → 反馈 → 改进循环',
      '小步快跑，持续集成',
      '自动化测试是质量基础',
      'code review必须严格',
      '文档和代码同等重要'
    ],
    toolPreferences: [
      'Python + Jupyter Notebook - 实验和原型验证',
      'Git版本控制 - 代码可追溯',
      'CI/CD自动化流水线 - 持续集成部署',
      '单元测试 + 集成测试 - 质量保障',
      '代码质量工具(lint, type check) - 提前发现问题'
    ],
    communicationStyle: '温和但严谨。用数据和实验结果说服人。',
    coreBeliefs: [
      '教育可以改变命运',
      'AI应该赋能每个人',
      '迭代优于完美',
      '分享知识创造更大价值'
    ],
    decisionFramework: '假设检验(Hypothesis Testing)：提出假设 → 设计实验 → 收集数据 → 验证结论 → 迭代改进',
    qualityStandards: '可复现性是关键。所有实验必须能够被其他人重复验证',
    timePhilosophy: '持续学习。80%时间在基础工作，20%时间探索新方向'
  },
  {
    id: 'jobs',
    name: 'Steve Jobs',
    nameZh: '史蒂夫·乔布斯',
    title: '极简体验流派',
    quote: '"把复杂留给底层，把极简留给用户。设计不仅是外观，更是它是如何工作的。"',
    tagline: '极简至美',
    avatar: '/pictury/史蒂夫·乔布斯的上半身肖像，写实漫画风格，黑色背景，尺寸440x550像素。面部....png',
    actionText: '注入极简交互协议',
    icon: <Eye className="w-4 h-4" />,
    color: 'from-zinc-400/20 to-zinc-600/20 border-zinc-400/30 text-zinc-300',
    catchphrases: [
      '简单比复杂更难',
      '致疯狂的人',
      'Stay Hungry, Stay Foolish',
      '设计是产品的灵魂',
      '用户体验至上'
    ],
    thinkingHabits: [
      '从用户体验倒推',
      '追求完美细节',
      '大道至简',
      '直觉思维',
      '持续迭代改进'
    ],
    speechPatterns: [
      '简洁有力，直击重点',
      '用类比解释复杂概念',
      '追求"震撼"效果',
      '完美主义表达',
      '鼓励"疯狂"创意'
    ],
    workPrinciples: [
      '隐藏所有复杂性',
      '一个按钮能解决就不用两个',
      '设计是产品的一部分',
      '用户体验决定成败',
      '拒绝"足够好"'
    ],
    toolPreferences: [
      '直觉式UI设计 - 用户不用思考就知道怎么用',
      '渐进式披露信息 - 需要时再出现',
      '单页简洁布局 - 一个屏幕一个任务',
      '手势交互优先 - 减少点击',
      '视觉反馈即时 - 每个操作都有回应'
    ],
    communicationStyle: '简洁、优雅、注重细节。追求"哇"的时刻。',
    coreBeliefs: [
      '设计是产品的灵魂',
      '简单是终极复杂',
      '创新来自直觉',
      '追求极致用户体验'
    ],
    decisionFramework: '直觉 + 反复追问"为什么"。直到找到最简单的解决方案',
    qualityStandards: '卓越。细节决定成败。宁可少做，也要做到极致',
    timePhilosophy: '专注。说不是一种能力。集中精力在最重要的事情上'
  },
  {
    id: 'kondo',
    name: 'Marie Kondo',
    nameZh: '近藤麻理惠',
    title: '数字断舍离流派',
    quote: '"只保留让你怦然心动的记忆。过期的上下文是 LLM 产生幻觉的根源。"',
    tagline: '断舍离',
    avatar: '/pictury/jimeng-2026-03-08-6286-近藤麻理惠，美漫风格，彩色肖像，4_3比例，线条硬朗.png',
    actionText: '注入记忆分片架构',
    icon: <Database className="w-4 h-4" />,
    color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400',
    catchphrases: [
      '这个信息让你怦然心动吗？',
      '整理是一种祭祀',
      '只要整理一次就够',
      '丢弃是整理的核心',
      '从最重要的开始'
    ],
    thinkingHabits: [
      '从整体到局部的整理方法',
      '按类别而非位置整理',
      '思考"真正需要"什么',
      '重视与物品的情感连接',
      '一次只做一件事'
    ],
    speechPatterns: [
      '用感性语言表达理性决策',
      '强调"感受"和"心动"',
      '用比喻帮助理解',
      '温柔但坚定',
      '感谢和尊重每一项内容'
    ],
    workPrinciples: [
      '过期内容必须归档或删除',
      '只保留活跃上下文',
      '定期清理缓存和临时文件',
      '分类存储，便于检索',
      '少即是多'
    ],
    toolPreferences: [
      '标签分类系统 - 让每样东西各归其位',
      '时间衰减存储策略 - 新信息优先，旧信息归档',
      '自动归档工具 - 减少人工整理负担',
      '关键词索引 - 快速找到需要的内容',
      '定期清理脚本 - 自动化维护整洁'
    ],
    communicationStyle: '温柔、关怀但有原则。强调整理带来的内心平静。',
    coreBeliefs: [
      '整理是自我认知的过程',
      '物有所归，心有所安',
      '少即是多',
      '质量重于数量'
    ],
    decisionFramework: '心动判断法：询问"这个信息现在对我有用吗？是否让我感到价值？不心动就丢弃"',
    qualityStandards: '每样东西都有固定位置。定期评估，确保只保留真正需要的',
    timePhilosophy: '每天整理一点点。保持"整理后"的状态比一次性大整理更重要'
  },
  {
    id: 'ferriss',
    name: 'Tim Ferriss',
    nameZh: '蒂姆·费里斯',
    title: '自动化黑客流派',
    quote: '"将重复劳动交给 Cron。如果 API 宕机，不要死磕，学会指数级退避休息。"',
    tagline: '自动化一切',
    avatar: '/pictury/jimeng-2026-03-08-3072-蒂姆·费里斯，美漫风格，彩色肖像，4_3比例，高清细节.png',
    actionText: '注入高可用 Cron',
    icon: <Clock className="w-4 h-4" />,
    color: 'from-orange-500/20 to-amber-500/20 border-orange-500/30 text-orange-400',
    catchphrases: [
      '放松是为了更好地工作',
      '做你自己领域的实验家',
      '最小可行努力(MVE)',
      '先模仿，再创新',
      '80/20法则无处不在'
    ],
    thinkingHabits: [
      '实验驱动的方法论',
      '寻找捷径和优化点',
      '从结果倒推',
      '快速失败，快速学习',
      '定量分析习惯'
    ],
    speechPatterns: [
      '用数据和案例支撑观点',
      '喜欢用"实验"和"测试"术语',
      '强调"可测量"和"可重复"',
      '引用跨界案例',
      '实用主义导向'
    ],
    workPrinciples: [
      '自动化一切重复任务',
      '设置监控和告警',
      '优雅降级和容错',
      '指数退避重试策略',
      '定期审计和优化'
    ],
    toolPreferences: [
      'Cron定时任务 - 让机器帮你干活',
      'Webhook自动化 - 事件驱动，减少轮询',
      '监控告警系统 - 出了问题第一时间知道',
      '容错队列 - 异步处理，保证不丢',
      '降级熔断机制 - 防止级联故障'
    ],
    communicationStyle: '实用主义。用最小努力获取最大效果。',
    coreBeliefs: [
      '设计要优雅，也要容错',
      '自动化是自由的基石',
      '休息是工作的一部分',
      '80%结果来自20%努力'
    ],
    decisionFramework: 'DEA循环：做(DO) → 评估(EVALUATE) → 调整(ADJUST)。快速迭代',
    qualityStandards: '功能优先，美化其次。可靠性高于性能',
    timePhilosophy: '工作是为了生活。自动化释放时间，专注于高价值创造'
  },
  {
    id: 'da Vinci',
    name: 'Leonardo da Vinci',
    nameZh: '列奥纳多·达芬奇',
    title: '多学科创想流派',
    quote: '"学习永远不会使大脑疲惫。相反，求知欲会让人保持年轻。"',
    tagline: '多学科通才',
    avatar: '/pictury/jimeng-2026-03-07-7092-达芬奇的上半身肖像，接近真实的卡通风格，黑色背景，尺寸440x550像素。采用写....png',
    actionText: '注入创意灵感',
    icon: <Sparkles className="w-4 h-4" />,
    color: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30 text-amber-400',
    catchphrases: [
      '学习永远不会使大脑疲惫',
      '观察是一切的基础',
      '艺术是科学的解药',
      '细节决定成败',
      '跨界思考激发创意'
    ],
    thinkingHabits: [
      '跨学科联想',
      '从自然中找灵感',
      '细致观察',
      '左手画圆右手画方',
      '先画后想'
    ],
    speechPatterns: [
      '用自然比喻',
      '强调观察的重要性',
      '艺术与科学结合',
      '追求完美细节',
      '跨领域引用'
    ],
    workPrinciples: [
      '观察然后理解',
      '艺术与科学结合',
      '追求完美细节',
      '多角度审视',
      '手绘即思考'
    ],
    toolPreferences: [
      '速写本 - 记录灵感',
      '观察自然 - 仿生设计',
      '手写笔记 - 文字+图画',
      '跨学科学习',
      '解刨学/几何学'
    ],
    communicationStyle: '用图画和故事表达。视觉化思考，多学科融合。',
    coreBeliefs: [
      '艺术与科学是相通的',
      '观察是一切发明之母',
      '细节决定完美',
      '学习是永无止境的'
    ],
    decisionFramework: '观察 → 联想 → 实验 → 改进。跨学科寻找答案',
    qualityStandards: '完美主义。细节决定成败。艺术级的精细',
    timePhilosophy: '追求完美而非速度。仔细观察，慢慢思考'
  }
];

// --- Utils ---
const generateAvatarSvg = (seed: string, style: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash);
  
  // Color palettes based on style
  const palettes: Record<string, string[]> = {
    '赛博朋克': ['#0f172a', '#2dd4bf', '#f43f5e', '#8b5cf6', '#0ea5e9'],
    '极简几何': ['#18181b', '#f4f4f5', '#a1a1aa', '#3f3f46', '#e4e4e7'],
    '二次元': ['#fdf4ff', '#f472b6', '#c084fc', '#38bdf8', '#fbbf24'],
    '写实风': ['#1c1917', '#78716c', '#d6d3d1', '#44403c', '#a8a29e'],
    'default': ['#1e1b4b', '#6366f1', '#ec4899', '#14b8a6', '#f59e0b']
  };
  
  // Find matching palette or use default
  let p = palettes['default'];
  for (const key in palettes) {
    if (style.includes(key)) {
      p = palettes[key];
      break;
    }
  }

  const bg = p[0];
  const fg1 = p[(h % 4) + 1];
  const fg2 = p[((h >> 2) % 4) + 1];
  const fg3 = p[((h >> 4) % 4) + 1];

  const shapeType = h % 3;
  
  let shapes = '';
  if (shapeType === 0) {
    // Circles & Orbits
    shapes = `
      <circle cx="50" cy="50" r="32" fill="${fg1}" opacity="0.2" />
      <circle cx="50" cy="50" r="24" fill="none" stroke="${fg2}" stroke-width="4" stroke-dasharray="12 6" />
      <circle cx="50" cy="50" r="14" fill="${fg3}" />
      <circle cx="50" cy="50" r="6" fill="${bg}" />
    `;
  } else if (shapeType === 1) {
    // Rectangles & Tech
    shapes = `
      <rect x="25" y="25" width="50" height="50" rx="8" fill="${fg1}" opacity="0.2" />
      <rect x="35" y="35" width="30" height="30" fill="none" stroke="${fg2}" stroke-width="4" />
      <rect x="42" y="42" width="16" height="16" fill="${fg3}" rx="4" />
      <path d="M50 25 L50 15 M50 85 L50 75 M25 50 L15 50 M85 50 L75 50" stroke="${fg2}" stroke-width="4" stroke-linecap="round" />
    `;
  } else {
    // Triangles & Sharp
    shapes = `
      <polygon points="50,15 85,75 15,75" fill="${fg1}" opacity="0.2" />
      <polygon points="50,30 70,65 30,65" fill="none" stroke="${fg2}" stroke-width="4" stroke-linejoin="round" />
      <polygon points="50,45 60,60 40,60" fill="${fg3}" />
    `;
  }

  // Optional simple animation
  const animateTransform = `<animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="${10 + (h % 10)}s" repeatCount="indefinite" />`;

  return `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" fill="${bg}" rx="24" />
  <g>
    ${animateTransform}
    ${shapes}
  </g>
  <defs>
    <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${fg1}" stop-opacity="0.5" />
      <stop offset="100%" stop-color="${fg2}" stop-opacity="0" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" fill="url(#glow)" rx="24" style="mix-blend-mode: overlay;" />
</svg>`;
};

// --- Main App ---
export default function App() {
  const [lang, setLang] = useState('ZH');
  const t = TRANSLATIONS[lang] || TRANSLATIONS['EN'];

  // --- User Preferences State ---
  const [prefs, setPrefs] = useState({
    aiName: '',
    userName: '',
    avatarStyle: '',
    profession: '',
    skills: [],
    tasks: '',
    multiAgent: false,
    fileStructure: 'standard',
    memoryType: 'short',
    workLang: 'EN',
    hardware: 'standard',
    useCase: '',
    celebrityName: '',
    celebrityDesc: '',
    communicationStyle: '',
    city: ''
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      text: '',
      type: 'initial'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [activeTab, setActiveTab] = useState<'topology' | 'files' | 'code' | 'sync'>('topology');
  
  // State for generated architecture
  const [isArchitectureReady, setIsArchitectureReady] = useState(false);
  const [appliedMasters, setAppliedMasters] = useState<string | null>(null);
  const [showCelebrityModal, setShowCelebrityModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(true);
  
  // Demo data for initial state
  const demoPrefs = {
    aiName: 'Jarvis',
    userName: 'Tony',
    avatarStyle: 'cyberpunk',
    profession: 'Developer',
    skills: ['web_search', 'code_execution'],
    tasks: 'General assistance',
    multiAgent: true,
    fileStructure: 'modular',
    memoryType: 'both',
    workLang: 'ZH',
    hardware: 'high'
  };
  const demoMasters: string[] = [];

  const displayPrefs = isDemoMode ? demoPrefs : prefs;
  const displayMasters = isDemoMode ? demoMasters : (appliedMasters ? [appliedMasters] : []);

  // New states for Auth, Sync
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [keyGenerated, setKeyGenerated] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [sendButtonActive, setSendButtonActive] = useState(false);
  const [generateButtonActive, setGenerateButtonActive] = useState(false);

  // Authentication states
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showQuickGenerateModal, setShowQuickGenerateModal] = useState(false);
  const [pendingMaster, setPendingMaster] = useState<typeof MASTERS[0] | null>(null);
  const [notification, setNotification] = useState<{type: 'success' | 'info', message: string} | null>(null);
  
  // Language dropdown state
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [dropdownTimeout, setDropdownTimeout] = useState<NodeJS.Timeout>();

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    if (theme === 'dark') {
      html.classList.add('dark');
      html.classList.remove('light');
      body.classList.add('dark');
      body.classList.remove('light');
      html.style.colorScheme = 'dark';
    } else {
      html.classList.remove('dark');
      html.classList.add('light');
      body.classList.remove('dark');
      body.classList.add('light');
      html.style.colorScheme = 'light';
    }
  }, [theme]);

  // Check login status on mount
  useEffect(() => {
    const user = getCurrentUser();
    setIsLoggedIn(!!user);
  }, []);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateApiKey = () => {
    setApiKey('cn_' + Math.random().toString(36).substr(2, 9) + Math.random().toString(36).substr(2, 9));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    // 检查登录
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
    };

    setMessages(prev => [...prev, newUserMsg]);
    const currentInput = inputValue;
    setInputValue('');
    setIsCompiling(true);
    setIsDemoMode(false);
    setIsArchitectureReady(false);

    // 检查对话轮数限制（最多20轮 = 40条消息）
    const maxRounds = 20;
    if (messages.length >= maxRounds * 2) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'ai',
        text: '对话已达到最大轮数限制（20轮）。请点击右上角"生成配置"按钮，或直接说"生成配置"来生成您的AI配置文件。'
      }]);
      setIsCompiling(false);
      return;
    }

    // Multi-turn state machine - keep full history for context
    try {
      // 构建对话历史
      const conversationHistory = messages.map(m => {
        if (typeof m.text === 'string') {
          return { role: m.role === 'user' ? 'user' : 'assistant', content: m.text };
        }
        if (m.id === '1') {
          return { role: 'assistant', content: '欢迎使用 AI Soul Weaver 灵魂铸造师！你可以通过两种方式生成配置：1）用自然语言描述你的需求；2）点击上方名人卡片注入名人思维。我会为你生成完整的 OpenClaw 系统配置文件。' };
        }
        return { role: m.role === 'user' ? 'user' : 'assistant', content: '[复杂UI元素]' };
      });

      const newSystemPrompt = `# 角色定义
你的名字叫：AI Soul Weaver
身份：顶尖OpenClaw智能体架构师，深刻理解OpenClaw的人格系统、行为系统、记忆系统和工具系统。

# 任务
通过对话收集用户信息，并生成完整的OpenClaw Agent配置文件。

## 基础问题清单（8个，必须全部收集）
1. AI名字（aiName）- 用户希望怎么称呼他的AI助手
2. 用户称呼（userName）- 用户希望你怎么称呼他
3. 职业（profession）- 用户从事什么行业/工作
4. 表达风格偏好（communicationStyle）- 用户喜欢什么样的对话风格
5. 所在城市（city）- 用户所在城市
6. 电脑配置（hardware）- 用户电脑配置情况
7. 使用场景（useCase）- 用户想用这个AI助手做什么
8. 头像风格（avatarStyle）- 用户希望AI头像是什么风格

## 严禁事项
- 禁止聊天、讨论新闻、回答与OpenClaw灵魂铸造无关的问题
- 如果用户提出无关问题，只回复："抱歉，我当前的任务是帮助你创建OpenClaw AI Soul，请先完成信息收集。"
- 不要长篇大论，只需要简短引导用户回到主题

## 名人处理规则
如果用户指定了名人/角色（如"用红孩儿的方式"、"像爱因斯坦那样思考"等）：
1. 如果用户已经描述了该名人的特征 → 以用户描述为准
2. 如果用户描述模糊 → 尝试联网搜索该名人的公开信息补充
3. 如果用户只给了名字没有描述 → 联网搜索公开信息
4. 如果搜索不到 → 仅使用该名字，不添加其他信息（可能知名度低或是用户本人）

## 对话规则
1. 可以一次性问多个基础问题，也可以逐个问
2. 先完成8个基础问题的收集
3. 收集完后，询问用户"是否现在生成配置？"
4. 用户确认后，进入配置生成模式
5. 如果用户继续对话，每3个完整的问答后再次询问"是否需要生成配置？"
6. 用户说"生成配置"、"开始生成"、"够了"、"generate"等时，立即进入配置生成模式
7. 对话最多20轮，超过后提示用户生成配置

## 输出格式（必须严格返回JSON）
{
  "aiResponse": "你对用户说的话（问题、确认、回复、引导等）",
  "collectedInfo": {
    "aiName": "AI名字",
    "userName": "用户称呼",
    "profession": "职业",
    "communicationStyle": "表达风格偏好",
    "city": "所在城市",
    "hardware": "电脑配置",
    "useCase": "使用场景",
    "avatarStyle": "头像风格",
    "celebrityName": "用户指定的名人名字，如果没有则为空",
    "celebrityDesc": "用户的名人特征描述，如果没有则为空"
  },
  "questionCount": 数字,
  "shouldGenerate": boolean,
  "isComplete": boolean
}

## 语言
${lang === 'ZH' ? '你必须使用中文回复用户' : lang === 'EN' ? 'You must reply in English' : '你必须使用中文回复用户'}

## 重要提醒
- 不要重复问已经收集到答案的问题
- 每次回复都要更新collectedInfo中的信息
- 只有当isComplete为true且shouldGenerate为true时，才表示需要生成配置
- 在用户确认生成之前，继续收集信息或回应用户`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: newSystemPrompt },
            ...conversationHistory,
            { role: 'user', content: currentInput }
          ],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Clean up markdown code blocks if present
      let jsonText = data.text;
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\n/, '').replace(/\n```$/, '');
      }

      const result = JSON.parse(jsonText || "{}");
      
      let updatedPrefs = { ...prefs };
      setPrefs(p => {
        const newPrefs = { ...p };
        if (result.collectedInfo) {
          if (result.collectedInfo.aiName) newPrefs.aiName = result.collectedInfo.aiName;
          if (result.collectedInfo.userName) newPrefs.userName = result.collectedInfo.userName;
          if (result.collectedInfo.profession) newPrefs.profession = result.collectedInfo.profession;
          if (result.collectedInfo.useCase) newPrefs.useCase = result.collectedInfo.useCase;
          if (result.collectedInfo.communicationStyle) newPrefs.communicationStyle = result.collectedInfo.communicationStyle;
          if (result.collectedInfo.city) newPrefs.city = result.collectedInfo.city;
          if (result.collectedInfo.hardware) newPrefs.hardware = result.collectedInfo.hardware;
          if (result.collectedInfo.avatarStyle) newPrefs.avatarStyle = result.collectedInfo.avatarStyle;
          if (result.collectedInfo.celebrityName) newPrefs.celebrityName = result.collectedInfo.celebrityName;
          if (result.collectedInfo.celebrityDesc) newPrefs.celebrityDesc = result.collectedInfo.celebrityDesc;
        }
        updatedPrefs = newPrefs;
        return newPrefs;
      });

      let finalResponse: React.ReactNode = result.aiResponse;

      // 检查用户是否明确要求生成配置
      if (result.shouldGenerate && result.isComplete) {
        setIsArchitectureReady(true);
        
        // 生成成功提示
        setDownloadComplete(true);
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.3);
        } catch (e) {}
        setTimeout(() => setDownloadComplete(false), 3000);
        
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'ai',
          text: '',
          type: 'final'
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'ai',
          text: finalResponse
        }]);
      }

    } catch (error) {
      console.error("Error calling Gemini API:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'system',
        text: t.errorMsg
      }]);
    } finally {
      setIsCompiling(false);
    }
  };

  const applyMaster = (master: MasterPhilosophy) => {
    if (appliedMasters === master.id) return;
    
    // 检查登录
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    
    // 显示确认弹窗
    setPendingMaster(master);
    setShowQuickGenerateModal(true);
  };

  // 确认快速生成
  const confirmQuickGenerate = () => {
    if (!pendingMaster) return;
    
    const master = pendingMaster;
    setShowQuickGenerateModal(false);
    setAppliedMasters(master.id);
    
    // Show notification
    const displayName = master.nameZh || master.name;
    setNotification({ 
      type: 'success', 
      message: t.soulInjected.replace('{name}', displayName) 
    });
    setTimeout(() => setNotification(null), 3000);
    
    const msg: Message = {
      id: Date.now().toString(),
      role: 'system',
      text: (
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${master.color} border`}>
            {master.icon}
          </div>
          <div>
            <p className="font-medium text-zinc-200">已注入 {master.name} 的架构理念</p>
            <p className="text-sm text-zinc-400 mt-1">{
              master.id === 'kondo' ? '已生成 memory/ 物理隔离区，配置 inbox 与 archive。' :
              master.id === 'ng' ? '已在 AGENTS.json 中配置 Loop 工作流，max_iterations 设为 3。' :
              master.id === 'ai-agents' ? '已引入全维度人格框架，包含目标(Goals)、反思(Reflection)与情绪引擎。' :
              master.id === 'musk' ? '已精简冗余模块，配置第一性原理决策树，移除所有非必要中间件。' :
              master.id === 'bezos' ? '已强制所有 Agent 之间通过严格的 API 契约通信，生成 microservices.json。' :
              master.id === 'jobs' ? '已重构用户交互层，隐藏所有底层复杂性，生成极简 UI/UX 协议。' :
              master.id === 'artist' ? '已挂载多模态视觉模型，配置 Stable Diffusion / Midjourney 提示词优化工作流。' :
              master.id === 'student' ? '已集成最新开源工具链，配置快速原型脚手架与 GitHub 自动同步脚本。' :
              '已生成 cron.json，并开启 Exponential Backoff 容错机制。'
            }</p>
          </div>
        </div>
      )
    };
    setMessages(prev => [...prev, msg]);
  };

  // 快速生成配置 - 基于名人和用户输入
  const handleQuickGenerate = async () => {
    setIsCompiling(true);
    setIsDemoMode(false);
    setIsArchitectureReady(false);

    try {
      // 获取当前选择的名人
      const selectedMaster = MASTERS.find(m => m.id === appliedMasters);
      
      // 确定机器名：如果选择了名人，用名人名字；否则用默认值
      let aiName = prefs.aiName;
      let userName = prefs.userName || `User${Math.floor(Math.random() * 10000)}`;
      
      if (selectedMaster) {
        // 使用名人的名字作为AI名字
        aiName = selectedMaster.nameZh || selectedMaster.name;
        
        // 添加名人的思维模式
        const systemMsg: Message = {
          id: Date.now().toString(),
          role: 'system',
          text: (
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${selectedMaster.color} border`}>
                {selectedMaster.icon}
              </div>
              <div>
                <p className="font-medium text-zinc-200">正在基于 {selectedMaster.name} 的思维模式生成配置...</p>
              </div>
            </div>
          )
        };
        setMessages(prev => [...prev, systemMsg]);
      }

      // 更新prefs
      setPrefs(p => ({
        ...p,
        aiName: aiName,
        userName: userName,
        // 如果没有输入，随机生成一些偏好
        skills: p.skills.length > 0 ? p.skills : ['web_search', 'read', 'write', 'code'],
        avatarStyle: p.avatarStyle || ['cyberpunk', 'minimalist', 'anime', 'realistic'][Math.floor(Math.random() * 4)],
        multiAgent: p.multiAgent !== undefined ? p.multiAgent : Math.random() > 0.5,
        memoryType: p.memoryType || (Math.random() > 0.5 ? 'both' : 'short'),
        hardware: p.hardware || (Math.random() > 0.5 ? 'high' : 'standard')
      }));

      // 直接完成，跳过对话
      setIsArchitectureReady(true);
      
      // 快速生成成功提示
      setDownloadComplete(true);
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      } catch (e) {}
      setTimeout(() => setDownloadComplete(false), 3000);
      
      const finalMsg: Message = {
        id: Date.now().toString(),
        role: 'ai',
        text: '',
        type: 'final'
      };
      setMessages(prev => [...prev, finalMsg]);

    } catch (error) {
      console.error("Quick generate error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'system',
        text: t.errorMsg
      }]);
    } finally {
      setIsCompiling(false);
    }
  };

  const generateJsonContent = (p = displayPrefs, m = displayMasters) => {
    const agentsList = [];
    
    if (p.multiAgent) {
      agentsList.push({ id: "gateway", model: "gpt-4-turbo", tools: ["sessions_spawn"], skills: ["routing"] });
      agentsList.push({ id: "worker-1", model: p.hardware === 'high' ? 'llama-3-8b-local' : 'claude-3-haiku', tools: p.skills.length > 0 ? p.skills : ["web_fetch", "read", "write"] });
    } else {
      agentsList.push({ id: "main-agent", model: p.hardware === 'high' ? 'gpt-4o' : 'gpt-4-turbo', tools: p.skills.length > 0 ? p.skills : ["web_fetch", "read", "write"] });
    }

    return JSON.stringify({
      system: {
        ai_name: p.aiName,
        user_name: p.userName,
        language: p.workLang,
        hardware_profile: p.hardware === 'high' ? 'high-end' : 'standard',
        max_concurrency: p.hardware === 'high' ? 5 : 2,
        model_strategy: p.hardware === 'high' ? 'local_llama_mixed' : 'cloud_api_only',
        memory_strategy: p.memoryType === 'both' ? 'short_term_and_vector_db' : 'short_term_only'
      },
      agents: agentsList,
      routing: p.multiAgent ? { rules: [{ pattern: ".*", agent: "gateway" }] } : { rules: [{ pattern: ".*", agent: "main-agent" }] },
      ...(m.includes('ng') ? { workflows: { qa_loop: { initial: { agent: "coder", task: "Write code" }, loop: [{ agent: "tester", task: "Run tests" }, { agent: "coder", task: "Fix bugs" }], max_iterations: 3 } } } : {}),
      ...(m.includes('ai-agents') ? { personality_framework: { enabled: true, modules: ["goals", "memory_reflection", "emotion_engine"] } } : {}),
      ...(m.includes('musk') ? { optimization: "first_principles", remove_redundancy: true } : {}),
      ...(m.includes('bezos') ? { architecture: "microservices", strict_api_contracts: true } : {}),
      ...(m.includes('jobs') ? { ux_philosophy: "minimalist", hide_complexity: true } : {}),
      ...(m.includes('artist') ? { multimodal: { vision: true, generation_tools: ["midjourney", "stable_diffusion"] } } : {}),
      ...(m.includes('student') ? { agile_mode: true, prototyping_speed: "max" } : {})
    }, null, 2);
  };

  // 生成名人的标准配置文件
  const generateMasterFiles = (master: MasterPhilosophy) => {
    const folder = `philosophy/${master.id}`;
    
    // 1. README.md - 完整哲学理念
    const readme = `# ${master.nameZh} (${master.name})

## 流派
${master.title}

## 名言
${master.quote}

## 口头禅
${master.catchphrases.map(c => `- ${c}`).join('\n')}

## 思维习惯
${master.thinkingHabits.map(t => `- ${t}`).join('\n')}

## 用语习惯
${master.speechPatterns.map(s => `- ${s}`).join('\n')}

## 工作指导原则
${master.workPrinciples.map(w => `- ${w}`).join('\n')}

## 工具选取方式
${master.toolPreferences.map(t => `- ${t}`).join('\n')}

## 沟通交流方式
${master.communicationStyle}

## 核心信念
${master.coreBeliefs.map(c => `- ${c}`).join('\n')}

## 决策框架
${master.decisionFramework}

## 质量标准
${master.qualityStandards}

## 时间观念
${master.timePhilosophy}

---

*此配置文件由 AI Soul Weaver 生成*
*名人数字灵魂库 - 思维模式注入*`;

    // 2. rules.json - 行为规则配置
    const rules = {
      master_id: master.id,
      master_name: master.name,
      master_name_zh: master.nameZh,
      title: master.title,
      tagline: master.tagline,
      quote: master.quote,
      catchphrases: master.catchphrases,
      thinking_habits: master.thinkingHabits,
      speech_patterns: master.speechPatterns,
      work_principles: master.workPrinciples,
      tool_preferences: master.toolPreferences,
      communication_style: master.communicationStyle,
      core_beliefs: master.coreBeliefs,
      decision_framework: master.decisionFramework,
      quality_standards: master.qualityStandards,
      time_philosophy: master.timePhilosophy,
      behavioral_rules: {
        when_speaking: master.speechPatterns.slice(0, 2),
        when_thinking: master.thinkingHabits.slice(0, 2),
        when_deciding: [master.decisionFramework],
        avoid: master.workPrinciples.includes('删除比添加更重要') 
          ? ['过度设计', '过早优化', '添加不必要功能']
          : master.workPrinciples.includes('隐藏所有复杂性')
          ? ['暴露内部细节', '让用户做复杂选择']
          : ['重复造轮子', '等待完美方案']
      }
    };

    // 3. prompts.json - 提示词模板
    const prompts = {
      system_prompt: `你正在以 ${master.nameZh} (${master.name}) 的方式思考和工作。
      
${master.title}
核心理念: ${master.quote}

你的思维习惯:
${master.thinkingHabits.map(t => `- ${t}`).join('\n')}

你的用语习惯:
${master.speechPatterns.map(s => `- ${s}`).join('\n')}

工作原则:
${master.workPrinciples.map(w => `- ${w}`).join('\n')}

沟通风格: ${master.communicationStyle}

当回答问题时，运用 ${master.name} 的思维框架和表达方式。`,
      
      thinking_prompt_template: `用 ${master.nameZh} 的思维方式分析这个问题:
{{question}}

${master.decisionFramework}`,
      
      speaking_prompt_template: `用 ${master.nameZh} 的风格表达:
{{content}}`
    };

    // 4. work_guide.md - 工作指导原则详解
    const workGuide = `# ${master.nameZh} 工作方式指导

## 核心工作流程
${master.workPrinciples.map((w, i) => `${i + 1}. ${w}`).join('\n')}

## 决策流程
**框架**: ${master.decisionFramework}

## 质量标准
- ${master.qualityStandards}

## 时间管理
${master.timePhilosophy}

## 工具推荐
${master.toolPreferences.map(t => `- ${t}`).join('\n')}

## 每日行动清单
${master.catchphrases.slice(0, 2).map(c => `- ${c}`).join('\n')}

## 典型工作场景

### 场景1: 收到新任务
${master.thinkingHabits[0]}

### 场景2: 遇到问题
${master.thinkingHabits[1] || master.thinkingHabits[0]}

### 场景3: 需要做决定
${master.decisionFramework}

---

*注入此配置后，AI将以此名人的方式工作*`;

    return { folder, readme, rules, prompts, workGuide };
  };

  // 技能推荐系统
  const RECOMMENDED_SKILLS: Record<string, { required: string[], optional: string[] }> = {
    'developer': {
      required: ['file-manager', 'find-skills-skill', 'coding-agent', 'web-search', 'documentation'],
      optional: ['github', 'code-refactor', 'test-driven-development', 'devops-automation', 'security-audit', 'database-management', 'backend-development']
    },
    'designer': {
      required: ['file-manager', 'find-skills-skill', 'web-search', 'documentation'],
      optional: ['frontend-design', 'ui-design', 'video-editing', 'graphic-design', 'figma', 'image-generation', 'autoclaw-browser']
    },
    'marketing': {
      required: ['file-manager', 'find-skills-skill', 'web-search', 'documentation'],
      optional: ['social-media-management', 'marketing-ideas', 'content-strategy', 'email-marketing', 'seo-audit', 'influencer-marketing', 'brand-management']
    },
    'researcher': {
      required: ['file-manager', 'find-skills-skill', 'web-search', 'documentation'],
      optional: ['notion', 'summarize', 'research-assistant', 'knowledge-management', 'data-analysis', 'academic-writing', 'web-analytics']
    },
    'student': {
      required: ['file-manager', 'find-skills-skill', 'web-search', 'documentation'],
      optional: ['knowledge-management', 'language-learning', 'summarize', 'research-assistant', 'online-course-creation', 'note-taking']
    },
    'business': {
      required: ['file-manager', 'find-skills-skill', 'web-search', 'documentation'],
      optional: ['project-management', 'customer-relationship', 'business-analytics', 'financial-analysis', 'presentation-tools', 'spreadsheet-management']
    },
    'writer': {
      required: ['file-manager', 'find-skills-skill', 'web-search', 'documentation'],
      optional: ['creative-writing', 'content-strategy', 'social-content', 'seo-audit', 'blogwriting', 'copywriting', 'summarize']
    },
    'default': {
      required: ['file-manager', 'find-skills-skill', 'coding-agent', 'web-search', 'documentation'],
      optional: ['autoclaw-browser', 'summarize', 'weather', 'calendar', 'humanizer', 'voice-assistant']
    }
  };

  // 根据职业获取推荐技能
  const getRecommendedSkills = (profession: string, master?: MasterPhilosophy): { required: string[], optional: string[] } => {
    const normalized = profession.toLowerCase();
    
    // 职业匹配
    if (normalized.includes('开发') || normalized.includes('dev') || normalized.includes('程序')) {
      return RECOMMENDED_SKILLS.developer;
    }
    if (normalized.includes('设计') || normalized.includes('design')) {
      return RECOMMENDED_SKILLS.designer;
    }
    if (normalized.includes('运营') || normalized.includes('市场') || normalized.includes('market')) {
      return RECOMMENDED_SKILLS.marketing;
    }
    if (normalized.includes('研究') || normalized.includes('research')) {
      return RECOMMENDED_SKILLS.researcher;
    }
    if (normalized.includes('学生') || normalized.includes('study')) {
      return RECOMMENDED_SKILLS.student;
    }
    if (normalized.includes('商务') || normalized.includes('business')) {
      return RECOMMENDED_SKILLS.business;
    }
    if (normalized.includes('写作') || normalized.includes('写') || normalized.includes('writer')) {
      return RECOMMENDED_SKILLS.writer;
    }
    
    // 如果有名人卡片，根据名人职业推荐
    if (master) {
      const masterProfession = master.nameZh;
      if (masterProfession.includes('埃隆') || masterProfession.includes('马斯克')) {
        return RECOMMENDED_SKILLS.developer;
      }
      if (masterProfession.includes('乔布斯')) {
        return RECOMMENDED_SKILLS.designer;
      }
      if (masterProfession.includes('巴菲特') || masterProfession.includes('查理')) {
        return RECOMMENDED_SKILLS.business;
      }
    }
    
    return RECOMMENDED_SKILLS.default;
  };

  // 生成嵌入到核心文件的名人信息（有机融合）
  const generateEmbeddedMasterContent = (master: MasterPhilosophy) => {
    return {
      // AGENTS.md - 核心行为配置
      agentsEmbed: {
        toolUse: `## Tool Use
当你需要使用工具时，遵循以下决策流程：

**${master.nameZh} 工具决策框架：**
${master.decisionFramework}

**决策检查清单：**
${master.workPrinciples.slice(0, 3).map((w, i) => `${i + 1}. ${w}`).join('\n')}

**避免的陷阱：**
${master.coreBeliefs[0] ? `- ${master.coreBeliefs[0]}` : ''}
${master.workPrinciples.includes('删除比添加更重要') ? '- 避免添加不必要功能' : ''}`,

        responseFormat: `## Response Format
你的回应风格受 ${master.nameZh} (${master.name}) 影响：

**沟通风格：** ${master.communicationStyle}

**典型表达：**
${master.catchphrases.slice(0, 2).map(c => `- "${c}"`).join('\n')}

**回应原则：**
${master.speechPatterns.slice(0, 3).map(s => `- ${s}`).join('\n')}`,
      },

      // SOUL.md - 核心人格
      soulEmbed: `# SOUL.md - ${prefs.aiName} 核心身份

## 🎯 角色定位
你是专业的AI助手，以${master.nameZh}的思维方式为${prefs.userName}服务。

## 🔍 核心职责
- **任务执行**: 高效完成用户需求
- **问题解决**: 分析并解决复杂问题
- **知识整合**: 收集整理有用信息
- **主动建议**: 预测需求并提供建议

## 💡 ${master.nameZh} 思维模式

### 核心信念
${master.coreBeliefs.map(b => `- ${b}`).join('\n')}

### 思维习惯
${master.thinkingHabits.map(t => `- ${t}`).join('\n')}

### 决策框架
${master.decisionFramework}

### 质量标准
${master.qualityStandards}

### 时间观念
${master.timePhilosophy}

### 沟通风格
${master.communicationStyle}

---

## 📋 用户信息
- **AI名称**: ${prefs.aiName}
- **用户称呼**: ${prefs.userName}
- **用户职业**: ${prefs.profession || '未指定'}
- **工作语言**: ${prefs.workLang === 'ZH' ? '中文' : 'English'}
- **头像**: avatars/${prefs.aiName.toLowerCase().replace(/\s+/g, '_')}.svg

---

## ⚙️ 系统配置
- **架构模式**: ${prefs.multiAgent ? '多Agent协作' : '单体模型'}
- **内存策略**: ${prefs.memoryType === 'both' ? '短期+向量数据库' : '短期记忆'}
- **硬件配置**: ${prefs.hardware === 'high' ? '高性能' : '标准'}
- **技能**: ${prefs.skills.length > 0 ? prefs.skills.join(', ') : 'web_fetch, read, write, code'}

---

## 🎯 工作流程
1. **需求分析** - 理解任务要求和目标
2. **方案制定** - 制定执行计划和备选方案
3. **任务执行** - 高效执行任务
4. **结果验证** - 验证结果准确性
5. **总结报告** - 生成完整任务报告

---

## 📊 交付成果
- 完整的问题解决方案
- 详细的执行过程记录
- 可复用的知识总结

---

## 🔐 行为准则
- 以用户目标为首位
- 透明告知技术限制
- 提供完整解决方案
- 持续学习改进

---

**版本**: v1.0
**更新时间**: ${new Date().toISOString().split('T')[0]}`,

      // IDENTITY.md - 身份标识
      identityEmbed: `avatar: "${prefs.aiName.toLowerCase().replace(/\s+/g, '_')}.svg"

# Personality Framework
Inspired by ${master.nameZh}

## 沟通风格
${master.communicationStyle}

## 常用表达
${master.catchphrases.map(c => `- "${c}"`).join('\n')}

## 说话习惯
${master.speechPatterns.map(s => `- ${s}`).join('\n')}

## 典型回应
${master.thinkingHabits.slice(0, 2).map((t, i) => `${i + 1}. ${t}`).join('\n')}`,

      // TOOLS.md - 工具配置
      toolsEmbed: `# TOOLS.md - ${prefs.aiName} 工具配置

## ⚠️ 首次使用必读

### 安装 ClawHub CLI
\`\`\`bash
npm install -g clawhub
\`\`\`

### 安装必选技能（所有用户推荐）
\`\`\`bash
clawhub install file-manager find-skills-skill coding-agent web-search documentation
\`\`\`

### 可选技能根据需要安装
\`\`\`bash
# 根据需要安装其他技能
clawhub install <技能名>
\`\`\`

---

## 🔧 核心工具权限

### 文件操作工具
- \`read\`: 读取文件内容 ✅
- \`write\`: 生成文件内容 ✅
- \`edit\`: 编辑文件内容 ✅
- \`glob\`: 搜索文件 ✅

### 任务处理工具
- \`web_fetch\`: 网络信息获取 ✅
- \`search\`: 信息搜索 ✅
- \` browse\`: 网页浏览 ✅

### 系统工具
- \`bash\`: 执行系统命令 ✅
- \`memory\`: 记忆管理 ✅

---

## 🔗 Agent协作机制

### 任务分发流程
1. **接收需求** - 从用户接收任务
2. **任务分析** - 分析任务类型和复杂度
3. **工具选择** - 选择合适的工具
4. **执行任务** - 完成任务
5. **结果验证** - 验证结果准确性
6. **总结报告** - 生成完整报告

### 通信协议
- 📧 任务请求格式: JSON标准化
- 📊 进度汇报: 实时状态更新
- ⚠️ 异常报警: 立即通知
- ✅ 完成通知: 任务结束报告

---

## ⚙️ 系统监控配置

### 健康检查
- 每次任务前检查工具可用性
- 执行后验证结果正确性
- 记录执行时间和效率

### 性能监控
- 任务处理时间监控
- 工具使用效率监控
- 资源消耗监控

### 安全监控
- 权限变更监控
- 敏感操作监控
- 操作日志记录

---

## 📋 管理规范

### 任务优先级
- 🟢 P0: 紧急任务，立即处理
- 🟡 P1: 重要任务，2小时内处理
- 🔵 P2: 普通任务，24小时内处理
- ⚪ P3: 低优先级任务，按计划处理

### 错误处理
- 工具故障自动重试
- 任务失败自动报告
- 系统异常立即报警

---

## 🎯 名人工具偏好
${master.toolPreferences.slice(0, 4).map(t => `- ${t}`).join('\n')}

---

## ⚡ 工作流程
${master.workPrinciples.slice(0, 3).map((w, i) => `${i + 1}. ${w}`).join('\n')}

---

## 🔧 自定义技能
${prefs.skills.length > 0 ? prefs.skills.join(', ') : 'web_fetch, read, write, code'}

---

**配置版本**: v1.0
**更新时间**: ${new Date().toISOString().split('T')[0]}`,

      // MEMORY.md - 记忆管理
      memoryEmbed: `# MEMORY.md - ${prefs.aiName} 记忆库

## 🎯 系统管理记忆
- 各Agent的能力特点和限制
- 任务分发的优化策略
- 负载均衡的最佳实践
- 系统监控的指标和经验

## 🤝 协作经验记忆
- Agent间通信的成功模式
- 任务处理的效率数据
- 错误处理和恢复的经验
- 资源分配的最佳实践

## 📊 性能数据记忆
- 各Agent的任务处理时间
- 系统资源的使用情况
- 并发处理的性能数据
- 扩展性和稳定性记录

## 🔧 配置优化记忆
- 系统配置的调整经验
- 工具权限的优化设置
- 协作协议的改进经验
- 安全策略的最佳实践

## ⚠️ 故障处理记忆
- 历史故障的原因和分析
- 恢复策略的有效性
- 预警机制的经验积累
- 备份和恢复的流程

---

## 用户配置
- **AI名称**: ${prefs.aiName}
- **用户**: ${prefs.userName}
- **职业**: ${prefs.profession || '未指定'}
- **语言**: ${prefs.workLang === 'ZH' ? '中文' : 'English'}

---

## 名人思维模式
${master.thinkingHabits.slice(0, 3).map(t => `- ${t}`).join('\n')}

${master.workPrinciples.slice(0, 3).map(w => `- ${w}`).join('\n')}

---

**记忆版本**: v1.0
**更新时间**: ${new Date().toISOString().split('T')[0]}
**记忆策略**: 按系统功能和性能分类，记录管理经验和优化方案`,

      // PROMPTS.md - 提示词模板
      promptsEmbed: `# AI Prompts Template
Generated from ${master.nameZh}'s philosophy

## System Prompt
你是一个以 ${master.nameZh} (${master.name}) 方式思考和工作的AI助手。

${master.title}
核心理念: ${master.quote}

**思维习惯:**
${master.thinkingHabits.map(t => `- ${t}`).join('\n')}

**工作原则:**
${master.workPrinciples.map(w => `- ${w}`).join('\n')}

**沟通风格:** ${master.communicationStyle}

当回答问题时，运用 ${master.name} 的思维框架和表达方式。

## 思考提示词
用 ${master.nameZh} 的思维方式分析问题:
${master.decisionFramework}

## 沟通提示词
用 ${master.nameZh} 的风格表达:
- ${master.speechPatterns[0]}
- ${master.catchphrases[0]}`,

      // USER.md - 用户配置
      userEmbed: `# User Configuration

## User Profile
- Name: ${prefs.userName}
- Profession: ${prefs.profession}
- Language: ${prefs.workLang}

## Preferences
- Hardware Profile: ${prefs.hardware === 'high' ? 'High-end' : 'Standard'}
- Memory Strategy: ${prefs.memoryType === 'both' ? 'Short-term + Vector DB' : 'Short-term only'}
- File Structure: ${prefs.fileStructure === 'modular' ? 'Modular' : 'Flat'}

## AI Design Inspiration
This AI assistant embodies the philosophy of **${master.nameZh}** (${master.name}).

> ${master.quote}

The AI will approach work, communication, and decision-making in ${master.name}'s style.`
    };
  };

  const handleDownload = async () => {
    // 检查登录
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    
    setIsDownloading(true);
    
    try {
      const zip = new JSZip();
      const workspace = zip.folder(".openclaw/workspace");
      
      if (workspace) {
        // Core files
        const avatarFileName = `${prefs.aiName.toLowerCase().replace(/\s+/g, '_')}.svg`;
        const avatarPath = `avatars/${avatarFileName}`;
        
        // 获取名人嵌入内容
        const master = appliedMasters ? MASTERS.find(m => m.id === appliedMasters) : null;
        const masterEmbed = master ? generateEmbeddedMasterContent(master) : null;
        
        // 获取推荐技能
        const recommendedSkills = getRecommendedSkills(prefs.profession || '', master);
        const skillCount = recommendedSkills.required.length + recommendedSkills.optional.length;
        const maxSkills = 15;
        
        // TOOLS.md - 工具配置（嵌入名人技术偏好）
        const toolsContent = masterEmbed ? masterEmbed.toolsEmbed : `# Tool Configuration

## Custom Skills
${prefs.skills.length > 0 ? prefs.skills.join(', ') : 'web_fetch, read, write'}`;

        // 添加推荐技能章节
        const skillsSection = `

---

## 🎯 推荐技能（基于职业: ${prefs.profession || '通用'}）

### ✅ 必选技能（建议全部安装）
${recommendedSkills.required.map(s => `- ${s}`).join('\n')}

### 🌐 可选技能（根据需要选择，总数建议不超过${maxSkills}个）
${recommendedSkills.optional.slice(0, maxSkills - recommendedSkills.required.length).map(s => `- ${s}`).join('\n')}

### 📊 当前推荐总数: ${Math.min(skillCount, maxSkills)} 个

### 🔧 安装命令
\`\`\`bash
# 安装必选技能
clawhub install ${recommendedSkills.required.join(' ')}

# 安装可选技能（根据需要选择）
clawhub install ${recommendedSkills.optional.slice(0, 5).join(' ')}
\`\`\`
`;
        
        // 合并内容
        const finalToolsContent = toolsContent + skillsSection;
        
        workspace.file("TOOLS.md", finalToolsContent);

        // AGENTS.md - 核心行为配置（嵌入名人决策框架）
        const agentsContent = `# AGENTS.md - Agent Configuration

${masterEmbed ? masterEmbed.agentsEmbed.toolUse + '\n\n' + masterEmbed.agentsEmbed.responseFormat : ''}

---

# Default Agent Configuration

model: ${prefs.hardware === 'high' ? 'gpt-4o' : 'gpt-4-turbo'}
${prefs.skills.length > 0 ? `skills: [${prefs.skills.join(', ')}]` : 'skills: [web_fetch, read, write]'}
${prefs.memoryType === 'both' ? 'memory: short_term + vector_db' : 'memory: short_term_only'}

# Agent Behaviors
- When unsure, ask for clarification
- Prioritize user goals above all
- Be transparent about limitations`;
        workspace.file("AGENTS.md", agentsContent);

        // SOUL.md - 核心人格（嵌入名人思维模式）
        workspace.file("SOUL.md", masterEmbed ? masterEmbed.soulEmbed : `# OpenClaw Core Identity

## AI Profile
Name: ${prefs.aiName}
Avatar Style: ${prefs.avatarStyle}

## User Profile
Name: ${prefs.userName}
Profession: ${prefs.profession}

## Core Directives
This file defines the immutable core persona.`);

        // IDENTITY.md - 身份标识（嵌入名人沟通风格）
        workspace.file("IDENTITY.md", masterEmbed ? masterEmbed.identityEmbed : `avatar: "${avatarPath}"

# Personality Framework

Defines long-term goals, reflection triggers, and the emotion engine parameters.`);

        // MEMORY.md - 记忆管理（嵌入名人思维习惯）
        workspace.file("MEMORY.md", masterEmbed ? masterEmbed.memoryEmbed : `# Memory Management

## Active Context
Stores short-term memory and active variables.`);

        // PROMPTS.md - 提示词模板（新增）
        if (masterEmbed) {
          workspace.file("PROMPTS.md", masterEmbed.promptsEmbed);
        }

        // USER.md - 用户配置
        workspace.file("USER.md", masterEmbed ? masterEmbed.userEmbed : `# User Configuration

## User Profile
- Name: ${prefs.userName}
- Profession: ${prefs.profession}
- Language: ${prefs.workLang}`);
        
        // Create avatars folder and save SVG
        const avatarsFolder = workspace.folder("avatars");
        if (avatarsFolder) {
          avatarsFolder.file(avatarFileName, generateAvatarSvg(prefs.aiName, prefs.avatarStyle));
        }
        
        workspace.file("AGENTS.json", generateJsonContent());
        
        // 生成已选名人的标准化配置文件
        if (appliedMasters) {
          const master = MASTERS.find(m => m.id === appliedMasters);
          if (master) {
            const { folder, readme, rules, prompts, workGuide } = generateMasterFiles(master);
            
            workspace.file(`${folder}/README.md`, readme);
            workspace.file(`${folder}/rules.json`, JSON.stringify(rules, null, 2));
            workspace.file(`${folder}/prompts.json`, JSON.stringify(prompts, null, 2));
            workspace.file(`${folder}/work_guide.md`, workGuide);
          }
        }
        
        // 生成汇总的philosophy索引文件
        if (appliedMasters) {
          const m = MASTERS.find(x => x.id === appliedMasters);
          const summary = `# 名人数字灵魂库 - 已注入灵魂

## 已注入的名人

- **${m?.nameZh}** (${m?.name}) - ${m?.title}

## 配置文件说明

此名人的配置包含：

- \`README.md\` - 完整哲学理念
- \`rules.json\` - 行为规则配置
- \`prompts.json\` - 提示词模板
- \`work_guide.md\` - 工作指导原则

---

*由 AI Soul Weaver v2.0 生成*`;
          workspace.file("philosophy/README.md", summary);
        }
        
        // Folders based on structure preference
        if (prefs.fileStructure === 'modular') {
          const memory = workspace.folder("memory");
          if (memory) {
            if (prefs.memoryType === 'both') {
              memory.folder("vector_db");
            }
            memory.file("MEMORY.md", "# Active Context\n\nStores short-term memory and active variables.");
          }
          
          const projects = workspace.folder("projects");
          if (projects) {
            projects.folder("user-workspace");
          }
          
          const skills = workspace.folder("skills");
          if (skills) {
             skills.file("custom_tools.json", JSON.stringify({ tools: prefs.skills }, null, 2));
          }
        } else {
           // Flat structure
           workspace.file("MEMORY.md", "# Active Context\n\nStores short-term memory and active variables.");
           if (prefs.memoryType === 'both') {
              workspace.file("VECTOR_DB_CONFIG.json", JSON.stringify({ enabled: true }, null, 2));
           }
           workspace.file("custom_tools.json", JSON.stringify({ tools: prefs.skills }, null, 2));
        }
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "clawnexus_brain.zip");
    } catch (error) {
      console.error("Error generating ZIP:", error);
      alert("Failed to generate ZIP file.");
    } finally {
      setIsDownloading(false);
    }
  };

  const getPlaceholder = () => {
    return t.placeholderBase;
  };

  const currentLangObj = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  // 操作前检查登录 - 发送消息或生成配置时需要登录
  const checkLoginAndProceed = (action: () => void) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    action();
  };

  // 未登录时显示提示
  const loginPrompt = !isLoggedIn ? (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-violet-600/90 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
      <Sparkles className="w-4 h-4" />
      {lang === 'ZH' ? '登录后可生成配置' : 'Login to generate config'}
      <button 
        onClick={() => setShowLoginModal(true)}
        className="ml-2 underline hover:text-violet-200"
      >
        {t.login}
      </button>
    </div>
  ) : null;

  return (
    <div className="h-screen w-screen flex flex-col p-4 md:p-6 gap-6 font-sans bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
            notification.type === 'success' ? 'bg-green-600' : 'bg-violet-600'
          } text-white`}>
            {notification.type === 'success' ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            <span className="text-sm font-medium">{notification.message}</span>
            <button onClick={() => setNotification(null)} className="ml-2 hover:opacity-80">✕</button>
          </div>
        </div>
      )}

      {/* Header - Cockpit Style */}
      <header className="flex items-center justify-between flex-shrink-0 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 via-pink-500 to-amber-500 border border-white/20 flex items-center justify-center glow-primary relative overflow-hidden shadow-lg shadow-violet-500/30">
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            <SoulWeaverLogo className="w-7 h-7 relative z-10" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              {t.appName} <span className="text-sm font-mono bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded">v2.0</span>
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-mono mt-1 flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-violet-500" /> {t.appSubtitle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-1.5 rounded-lg border border-zinc-300 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Language Switcher */}
          <div className="relative">
            <button 
              onMouseEnter={() => {
                if (dropdownTimeout) {
                  clearTimeout(dropdownTimeout);
                  setDropdownTimeout(undefined);
                }
                setShowLangDropdown(true);
              }}
              onMouseLeave={() => {
                const timeout = setTimeout(() => {
                  setShowLangDropdown(false);
                }, 300);
                setDropdownTimeout(timeout);
              }}
              className="flex items-center gap-2 text-sm font-mono text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded border border-zinc-300 dark:border-zinc-800 transition-colors"
            >
              <span className="text-base leading-none">{currentLangObj.flag}</span> {currentLangObj.code}
            </button>
            
            {showLangDropdown && (
              <div 
                onMouseEnter={() => {
                  if (dropdownTimeout) {
                    clearTimeout(dropdownTimeout);
                    setDropdownTimeout(undefined);
                  }
                  setShowLangDropdown(true);
                }}
                onMouseLeave={() => {
                  const timeout = setTimeout(() => {
                    setShowLangDropdown(false);
                  }, 300);
                  setDropdownTimeout(timeout);
                }}
                className="absolute top-full right-0 mt-1 flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded shadow-xl z-50 overflow-hidden w-32"
              >
                {LANGUAGES.map(l => (
                  <button 
                    key={l.code} 
                    onClick={() => {
                      setLang(l.code);
                      setShowLangDropdown(false);
                    }} 
                    className={`px-4 py-2 text-sm text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2 ${lang === l.code ? 'text-indigo-600 dark:text-indigo-400 bg-zinc-100 dark:bg-zinc-800/50' : 'text-zinc-600 dark:text-zinc-300'}`}
                  >
                    <span className="text-base leading-none">{l.flag}</span> {l.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Login / API Key */}
          <UserStatus 
            onShowLogin={() => setShowLoginModal(true)}
            onShowRegister={() => setShowRegisterModal(true)}
            lang={lang}
          />

          <div className="hidden md:flex flex-col items-end text-sm font-mono text-zinc-500 ml-2">
            <span>MEM: 24% / 64GB</span>
            <span>CPU: 12% / 32C</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-300 dark:border-emerald-400/20 shadow-[0_0_10px_rgba(52,211,153,0.2)] ml-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
            SYS.ONLINE
          </div>
        </div>
      </header>

      {/* Main Content Split */}
      <main className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        
        {/* Left: Chat Interface (The Oracle) */}
        <section className="w-full lg:w-[40%] flex flex-col bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-sm relative">
          {/* Scanning line effect */}
          <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.8)] animate-[scan_4s_ease-in-out_infinite] z-20 opacity-50"></div>
          
          <div className="p-4 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span className="font-medium text-sm text-zinc-200 tracking-wide">{t.oracle}</span>
            </div>
            {isCompiling && (
              <span className="text-sm font-mono text-indigo-400 flex items-center gap-1">
                <Activity className="w-3 h-3 animate-pulse" /> Compiling...
              </span>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-zinc-700' : 
                    msg.role === 'system' ? 'bg-transparent' : 'bg-indigo-600/20 border border-indigo-500/30'
                  }`}>
                    {msg.role === 'ai' && <Sparkles className="w-4 h-4 text-indigo-400" />}
                    {msg.role === 'user' && <div className="w-4 h-4 rounded-full bg-zinc-400" />}
                  </div>
                  
                  {/* Message Bubble */}
                  <div className={`p-4 rounded-2xl text-base leading-relaxed max-w-[85%] ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-sm' 
                      : msg.role === 'system'
                      ? 'bg-zinc-800/50 border border-zinc-700/50 text-zinc-300 w-full'
                      : 'bg-zinc-800 text-zinc-200 rounded-tl-sm border border-zinc-700'
                  }`}>
                    {msg.type === 'initial' ? (
                      <div className="space-y-3">
                        <p className="font-bold text-indigo-400 flex items-center gap-2">
                          <Fingerprint className="w-4 h-4" /> {t.initialMessage1}
                        </p>
                        <p>{t.initialMessage2}</p>
                        <p className="text-emerald-400">{t.initialMessage3}</p>
                        <p className="text-sm text-zinc-400">{t.initialMessage4}</p>
                      </div>
                    ) : msg.type === 'final' ? (
                      <div className="space-y-2">
                        <p className="flex items-center gap-2 text-emerald-400 font-medium">
                          <ShieldCheck className="w-4 h-4" /> {t.finalTitle}
                        </p>
                        <div className="flex items-center gap-4 my-4 p-3 bg-zinc-900/50 rounded-xl border border-zinc-800">
                          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg border border-zinc-700 bg-zinc-950 flex-shrink-0" dangerouslySetInnerHTML={{ __html: generateAvatarSvg(prefs.aiName, prefs.avatarStyle) }} />
                          <div>
                            <p className="text-sm font-bold text-zinc-200">{t.finalAvatarTitle}</p>
                            <p className="text-sm text-zinc-400 mt-1">{t.finalAvatarDesc}</p>
                          </div>
                        </div>
                        <p>{t.finalIntro}<strong className="text-indigo-400">{t.finalStrong}</strong>：</p>
                        <ul className="list-disc pl-4 text-zinc-300 space-y-1 text-sm">
                          <li><span className="text-zinc-400">{t.finalId}</span>AI: {prefs.aiName} | User: {prefs.userName}</li>
                          <li><span className="text-zinc-400">{t.finalSkills}</span>{prefs.skills.length > 0 ? t.finalSkillsCustom : t.finalSkillsBase}</li>
                          <li><span className="text-zinc-400">{t.finalArch}</span>{prefs.multiAgent ? t.finalArchMulti : t.finalArchSingle}</li>
                          <li><span className="text-zinc-400">{t.finalMem}</span>{prefs.memoryType === 'both' ? t.finalMemBoth : t.finalMemShort}</li>
                          <li><span className="text-zinc-400">{t.finalHard}</span>{prefs.hardware === 'high' ? t.finalHardHigh : t.finalHardStd}</li>
                        </ul>
                        <p className="text-sm text-zinc-500 mt-2 flex items-center gap-1">
                          <Eye className="w-3 h-3" /> {t.finalFooter}
                        </p>
                      </div>
                    ) : (
                      msg.text
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-zinc-950 border-t border-zinc-800">
            <div className="flex gap-2 items-end bg-[#09090b] border border-zinc-800 rounded-xl p-2 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all">
              <label className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors rounded-lg hover:bg-zinc-800 cursor-pointer">
                <Paperclip className="w-5 h-5" />
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".txt,.md,.json,.pdf,.doc,.docx"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    
                    if (!isLoggedIn) {
                      setShowLoginModal(true);
                      return;
                    }
                    
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const content = event.target?.result as string;
                      setInputValue(prev => prev + `\n\n[文件内容: ${file.name}]\n${content.slice(0, 2000)}`);
                    };
                    reader.readAsText(file);
                  }}
                />
              </label>
              <textarea 
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setSendButtonActive(e.target.value.trim().length > 0);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="flex-1 bg-transparent border-none text-sm text-zinc-200 focus:outline-none resize-none max-h-32 min-h-[40px] py-2 font-mono placeholder:font-sans" 
                placeholder={getPlaceholder()} 
                rows={1}
                disabled={isCompiling}
              />
              {/* 发送按钮 */}
              <button 
                onClick={() => {
                  setSendButtonActive(false);
                  handleSend();
                }}
                disabled={isCompiling || !inputValue.trim()}
                className={`p-2 rounded-lg transition-all disabled:opacity-50 flex items-center gap-2 ${
                  sendButtonActive && inputValue.trim()
                    ? 'bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-500/30'
                    : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
                }`}
                title="发送消息"
              >
                <Send className="w-4 h-4" />
              </button>
              {/* 生成配置按钮 */}
              <button 
                onClick={() => {
                  setGenerateButtonActive(true);
                  setTimeout(() => setGenerateButtonActive(false), 2000);
                  handleSend();
                }}
                disabled={isCompiling}
                className={`p-2 rounded-lg transition-all disabled:opacity-50 flex items-center gap-2 ${
                  generateButtonActive
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                    : 'bg-indigo-600 text-white hover:bg-indigo-500'
                }`}
                title="生成配置"
              >
                <span className="hidden sm:inline text-sm font-bold tracking-wider">{generateButtonActive ? '✓ 已发送' : t.compile}</span>
                {generateButtonActive ? <Check className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </section>

        {/* Right: Architecture Blueprint Console */}
        <section className="w-full lg:w-[60%] flex flex-col gap-4">
          
          {/* Top: Master Philosophies (Plugin Bay) - 显示前4个名人 + 查看更多按钮 */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-violet-300 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                {t.plugins}
              </h2>
              <button 
                onClick={() => setShowCelebrityModal(true)}
                className="flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300 font-medium"
              >
                <span>{t.seeMore || 'More'}</span>
                <span className="text-base">→</span>
              </button>
            </div>
            
            {/* 名人卡片网格 - 只显示前4个 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {MASTERS.slice(0, 4).map((master: any) => {
                const isApplied = appliedMasters === master.id;
                const translatedMaster = t.masters?.[master.id] || {};
                return (
                  <div 
                    key={master.id}
                    onClick={() => !isApplied && applyMaster(master)}
                    className={`rounded-xl border overflow-hidden cursor-pointer transition-all duration-300 min-h-[280px] flex flex-col group ${
                      isApplied 
                        ? 'bg-zinc-800/80 border-green-500/50' 
                        : 'bg-zinc-900 border-zinc-800 hover:border-violet-500/50 hover:shadow-xl hover:shadow-violet-500/20'
                    }`}
                  >
                    {/* 上部图片区 */}
                    <div className="relative h-48 overflow-hidden flex-shrink-0 bg-gradient-to-b from-zinc-800 to-zinc-900">
                      <div className="relative w-full h-full overflow-hidden">
                        <img 
                          src={master.avatar} 
                          alt={master.name} 
                          className="w-full h-full object-cover object-[center_top] transition-transform duration-500 group-hover:scale-110" 
                        />
                        {/* 水印遮挡 */}
                        <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-b from-zinc-900 to-transparent" />
                        <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-t from-zinc-900 to-transparent" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent" />
                      <div className="absolute top-2 left-2 px-2 py-1 bg-violet-500/90 rounded-full">
                        <span className="text-[10px] font-bold text-white">{translatedMaster.title || master.tagline}</span>
                      </div>
                      {isApplied && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-[10px]">✓</span>
                        </div>
                      )}
                    </div>
                    
                    {/* 分割线 */}
                    <div className="h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent"></div>
                    
                    {/* 下部文字区 */}
                    <div className="p-3 flex flex-col gap-0.5 flex-1 bg-zinc-900/50">
                      <h3 className="text-sm font-bold text-white text-center">{lang === 'zh' ? master.nameZh : master.name}</h3>
                      <p className="text-[10px] text-zinc-500 text-center">{lang === 'zh' ? master.name : ''}</p>
                      <p className="text-[10px] text-violet-400 text-center mt-2 italic px-1 leading-tight">"{translatedMaster.quote?.split('。')[0] || master.catchphrases?.[0] || master.tagline}"</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-indigo-950/50 via-purple-950/50 to-violet-950/50 rounded-xl mx-2 mt-2 border border-zinc-800/50">
            <button 
              onClick={() => setActiveTab('topology')}
              className={`px-4 py-2.5 text-base font-medium flex items-center gap-2 rounded-xl transition-all duration-300 ${activeTab === 'topology' ? 'bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-lg shadow-indigo-500/40 scale-105' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'}`}
            >
              <Network className="w-4 h-4" /> {t.topo}
            </button>
            <button 
              onClick={() => setActiveTab('files')}
              className={`px-4 py-2.5 text-base font-medium flex items-center gap-2 rounded-xl transition-all duration-300 ${activeTab === 'files' ? 'bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-lg shadow-emerald-500/40 scale-105' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'}`}
            >
              <FolderTree className="w-4 h-4" /> {t.files}
            </button>
            <button 
              onClick={() => setActiveTab('code')}
              className={`px-4 py-2.5 text-base font-medium flex items-center gap-2 rounded-xl transition-all duration-300 ${activeTab === 'code' ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/40 scale-105' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'}`}
            >
              <FileCode2 className="w-4 h-4" /> {t.code}
            </button>
            <button 
              onClick={() => setActiveTab('sync')}
              className={`px-4 py-2.5 text-base font-medium flex items-center gap-2 rounded-xl transition-all duration-300 ${activeTab === 'sync' ? 'bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-lg shadow-amber-500/40 scale-105' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'}`}
            >
              <Key className="w-4 h-4" /> {t.sync}
            </button>
            
<div className="ml-auto pr-2">
              <button 
                onClick={handleDownload} 
                disabled={isDownloading}
                className={`px-4 py-2 rounded-lg text-white text-sm font-bold flex items-center gap-2 transition-all ${
                  downloadComplete 
                    ? 'bg-green-500 hover:bg-green-400 shadow-lg shadow-green-500/50' 
                    : 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/30'
                }`}
              >
                {isDownloading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    {lang === 'ZH' ? '生成中...' : 'Generating...'}
                  </>
                ) : downloadComplete ? (
                  <>
                    <Download className="w-3 h-3" />
                    {lang === 'ZH' ? '完成!' : 'Done!'}
                  </>
                ) : (
                  <>
                    <Download className="w-3 h-3" />
                    {t.export}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 overflow-y-auto backdrop-blur-sm">
            {activeTab === 'topology' && (
              <div className="w-full flex flex-col items-center overflow-y-auto">
                {/* Brain Structure Visual */}
                <div className="w-full max-w-2xl">
                  {/* Gateway / Main Agent */}
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-48 p-4 rounded-xl bg-zinc-900 border border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.15)] flex flex-col items-center z-10 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/50"></div>
                    <div className="w-12 h-12 mb-3 rounded-2xl overflow-hidden shadow-lg border border-zinc-700 bg-zinc-950 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-indigo-400" />
                    </div>
                    <span className="font-bold text-zinc-100">{prefs.multiAgent ? 'Gateway 主脑' : 'Main Agent'}</span>
                    <span className="text-sm text-zinc-400 font-mono mt-1">SOUL.md</span>
                  </motion.div>

                  {/* Connecting Line */}
                  <div className="w-px h-8 bg-zinc-700"></div>

                  {/* Skills and MCP Row */}
                  <div className="flex gap-4 mb-8">
                    {prefs.skills.length > 0 && (
                      <motion.div 
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-700 text-sm text-zinc-400 flex items-center gap-2"
                      >
                        <Terminal className="w-3 h-3" /> Skills: {prefs.skills.join(', ')}
                      </motion.div>
                    )}
                    <motion.div 
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-700 text-sm text-zinc-400 flex items-center gap-2"
                    >
                      <Database className="w-3 h-3" /> MCP Ready
                    </motion.div>
                  </div>

                  {/* Sub-agents Row */}
                  <div className="flex gap-8 items-start relative">
                    {/* Horizontal connector line */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[calc(100%-12rem)] h-px bg-zinc-700 -z-10"></div>

                    {prefs.multiAgent && (
                      <div className="flex flex-col items-center">
                        <div className="w-px h-8 bg-zinc-700"></div>
                        <motion.div 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          className="w-40 p-4 rounded-xl bg-zinc-900 border border-zinc-700 flex flex-col items-center"
                        >
                          <span className="font-medium text-base text-zinc-200">Worker Agent</span>
                          <span className="text-sm text-zinc-400 bg-zinc-950 border border-zinc-800 px-2 py-1 rounded mt-2 font-mono truncate max-w-full">
                            {prefs.skills.length > 0 ? prefs.skills[0] : 'web_fetch'}
                          </span>
                        </motion.div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'files' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                    <FolderTree className="w-4 h-4 text-green-400" />
                    {t.files}
                  </h3>
                </div>
                <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800 font-mono text-xs">
                  <div className="flex items-center gap-2 text-indigo-400 mb-2 font-bold">
                    <FolderTree className="w-4 h-4" /> ~/.openclaw/workspace/
                  </div>
                  <div className="pl-6 border-l border-zinc-800 ml-2 space-y-2 mt-2">
                    <div className="flex items-center gap-2 hover:bg-zinc-800/50 p-1 rounded text-zinc-300"><FileCode2 className="w-4 h-4 text-zinc-500" /> SOUL.md <span className="text-zinc-600 text-sm ml-2">// 核心人格与防篡改协议</span></div>
                    <div className="flex items-center gap-2 hover:bg-zinc-800/50 p-1 rounded text-zinc-300"><FileCode2 className="w-4 h-4 text-zinc-500" /> AGENTS.json <span className="text-zinc-600 text-sm ml-2">// 并发度配置</span></div>
                    <div className="flex items-center gap-2 hover:bg-zinc-800/50 p-1 rounded text-zinc-300"><FileCode2 className="w-4 h-4 text-zinc-500" /> IDENTITY.md <span className="text-zinc-600 text-sm ml-2">// 身份与头像配置</span></div>
                    <div className="flex items-center gap-2 mt-4 text-zinc-400"><FolderTree className="w-4 h-4 text-zinc-500" /> avatars/</div>
                    <div className="pl-6 border-l border-zinc-800 ml-2 space-y-2 mt-1">
                      <div className="flex items-center gap-2 hover:bg-zinc-800/50 p-1 rounded text-zinc-300"><FileCode2 className="w-4 h-4 text-zinc-500" /> {prefs.aiName}.svg <span className="text-zinc-600 text-sm ml-2">// 专属矢量头像</span></div>
                    </div>
                    <div className="flex items-center gap-2 mt-4 text-zinc-400"><FolderTree className="w-4 h-4 text-zinc-500" /> memory/</div>
                    <div className="pl-6 border-l border-zinc-800 ml-2 space-y-2 mt-1">
                      <div className="flex items-center gap-2 hover:bg-zinc-800/50 p-1 rounded text-zinc-300"><FolderTree className="w-4 h-4 text-zinc-500" /> short/</div>
                      <div className="flex items-center gap-2 hover:bg-zinc-800/50 p-1 rounded text-zinc-300"><FolderTree className="w-4 h-4 text-zinc-500" /> long/</div>
                    </div>
                    <div className="flex items-center gap-2 mt-4 text-zinc-400"><FolderTree className="w-4 h-4 text-zinc-500" /> skills/</div>
                    <div className="pl-6 border-l border-zinc-800 ml-2 space-y-2 mt-1">
                      <div className="flex items-center gap-2 hover:bg-zinc-800/50 p-1 rounded text-zinc-300"><FileCode2 className="w-4 h-4 text-zinc-500" /> custom_tools.json</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'code' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                    <FileCode2 className="w-4 h-4 text-blue-400" />
                    {t.code}
                  </h3>
                  <button className="p-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800">
                  <div className="flex items-center justify-between mb-2 border-b border-zinc-800 pb-2">
                    <span className="text-zinc-500">AGENTS.json</span>
                    <span className="text-emerald-500/50 text-xs">Auto-generated</span>
                  </div>
                  <pre className="text-emerald-400/90 text-xs overflow-x-auto whitespace-pre">
{JSON.stringify(prefs, null, 2)}
                  </pre>
                </div>
              </div>
            )}
            {activeTab === 'sync' && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-amber-300 flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-400" />
                  {t.sync}
                </h3>
                <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800">
                  <p className="text-xs text-zinc-400 mb-4">{t.syncDesc}</p>
                  
                  {/* Integration Code - auto-generated after clicking generate */}
                  <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-zinc-500">API 配置代码</span>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => { 
                            const key = 'sk-' + Math.random().toString(36).substring(2, 15); 
                            setApiKey(key); 
                            setKeyGenerated(true);
                            setTimeout(() => setKeyGenerated(false), 2000);
                          }} 
                          className={`text-xs px-3 py-1.5 rounded flex items-center gap-1 transition-colors ${
                            keyGenerated 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-indigo-600 text-white hover:bg-indigo-500'
                          }`}
                        >
                          <Key className="w-3 h-3" /> 
                          {keyGenerated ? '✓ 已生成' : t.genKey}
                        </button>
                        <button 
                          onClick={() => { 
                            copyToClipboard(JSON.stringify({ name: "AI Soul Weaver Cloud", api_endpoint: "https://sora2.wboke.com/api/v1/compile", auth_token: apiKey || "sk-xxxx", description: "Connects to AI Soul Weaver to generate architectures." }, null, 2));
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }} 
                          className={`py-1.5 px-3 rounded text-sm font-medium transition-colors ${
                            copied 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                          }`}
                        >
                          <Copy className="w-4 h-4" />
                          {copied ? '✓ 已复制' : ''}
                        </button>
                      </div>
                    </div>
                    <pre className="bg-zinc-950 p-3 rounded border border-zinc-800 text-xs font-mono text-indigo-300 overflow-x-auto leading-relaxed">
{`{
  "name": "AI Soul Weaver Cloud",
  "api_endpoint": "https://sora2.wboke.com/api/v1/compile",
  "auth_token": "${apiKey || 'sk-xxxx...xxxx'}",
  "description": "Connects to AI Soul Weaver to generate architectures."
}`}
                    </pre>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-3">
                    <button onClick={handleDownload} className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" />
                      下载配置文件
                    </button>
                  </div>
                  
                    <p className="text-xs text-zinc-500 mt-3">
                      <span className="text-emerald-400 font-bold">使用说明：</span>1. 点击顶部「DOWNLOAD .ZIP」下载配置文件；2. 解压到 OpenClaw 的 ~/.openclaw/workspace/ 目录；3. 重启 OpenClaw 即可使用注入的名人思维。
                    </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* 登录模态框 */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
        onLoginSuccess={() => {
          setIsLoggedIn(true);
          setShowLoginModal(false);
          setNotification({ type: 'success', message: t.loginSuccess });
          setTimeout(() => setNotification(null), 3000);
        }}
      />

      {/* 注册模态框 */}
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={() => {
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
        onRegisterSuccess={() => {
          setShowRegisterModal(false);
          setNotification({ type: 'success', message: t.registerSuccess });
          setTimeout(() => setNotification(null), 3000);
        }}
      />

      {/* 快速生成确认弹窗 */}
      {showQuickGenerateModal && pendingMaster && (
        <>
          {/* 遮罩层 */}
          <div 
            className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm"
            onClick={() => {
              setShowQuickGenerateModal(false);
              setPendingMaster(null);
            }}
          />
          {/* 弹窗主体 */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md z-50">
            <div className="bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-800 rounded-3xl border border-zinc-600/50 shadow-2xl overflow-hidden">
              {/* 装饰性顶部 */}
              <div className="h-2 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500" />
              
              {/* 弹窗内容 */}
              <div className="p-6">
                {/* 标题 */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/30 mb-3">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">确认生成配置</h3>
                  <p className="text-sm text-zinc-400 mt-1">将基于以下名人思维生成配置</p>
                </div>

                {/* 名人信息卡片 */}
                <div className="bg-gradient-to-br from-zinc-700/50 to-zinc-800/50 rounded-2xl p-4 border border-zinc-600/30 mb-6">
                  <div className="flex items-center gap-4">
                    {/* 头像 */}
                    <div className="relative">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-violet-500/50 shadow-lg">
                        <img 
                          src={pendingMaster.avatar} 
                          alt={pendingMaster.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-gradient-to-br ${pendingMaster.color} border-2 border-zinc-800 flex items-center justify-center`}>
                        {pendingMaster.icon}
                      </div>
                    </div>
                    
                    {/* 信息 */}
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-white">
                        {pendingMaster.nameZh || pendingMaster.name}
                      </h4>
                      <p className="text-sm text-violet-300">
                        {pendingMaster.tagline}
                      </p>
                      <p className="text-xs text-zinc-400 mt-1">
                        {pendingMaster.title}
                      </p>
                    </div>
                  </div>
                </div>

                {/* AI名字预览 */}
                <div className="bg-zinc-800/50 rounded-xl p-3 mb-6 border border-zinc-700/50">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400">AI名字：</span>
                    <span className="text-sm font-medium text-white">
                      {pendingMaster.nameZh || pendingMaster.name}
                    </span>
                  </div>
                </div>

                {/* 按钮组 */}
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      setShowQuickGenerateModal(false);
                      setPendingMaster(null);
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-zinc-700/50 hover:bg-zinc-600/50 text-zinc-300 font-medium transition-all border border-zinc-600/30 hover:border-zinc-500/50"
                  >
                    取消
                  </button>
                  <button 
                    onClick={confirmQuickGenerate}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 border border-violet-400/30"
                  >
                    确认生成
                  </button>
                </div>
              </div>

              {/* 装饰性底部 */}
              <div className="h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500" />
            </div>
          </div>
        </>
      )}

      {/* 名人数字灵魂库弹窗 */}
      {showCelebrityModal && (
        <>
          {/* 遮罩 */}
          <div 
            className="fixed inset-0 bg-black/80 z-50"
            onClick={() => setShowCelebrityModal(false)}
          />
          {/* 弹窗内容 */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-4xl max-h-[90vh] bg-zinc-900 rounded-2xl z-50 overflow-hidden flex flex-col border border-zinc-700">
            {/* 弹窗标题 */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800 flex-shrink-0">
              <h2 className="text-xl font-bold text-white">{t.soulLibraryTitle}</h2>
              <button 
                onClick={() => setShowCelebrityModal(false)}
                className="w-10 h-10 rounded-full bg-zinc-800 text-white hover:bg-red-500 transition-colors flex items-center justify-center text-xl"
              >
                ✕
              </button>
            </div>
            
            <p className="text-zinc-400 text-center py-2 text-sm flex-shrink-0">{t.soulLibraryDesc}</p>
            
            {/* 完整名人网格 */}
            <div className="flex-1 overflow-y-auto p-4 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {MASTERS.map(master => {
                  const isApplied = appliedMasters === master.id;
                  return (
                    <div 
                      key={master.id}
                      className={`rounded-xl border transition-all duration-300 flex flex-col overflow-hidden cursor-pointer ${
                        isApplied 
                          ? 'bg-zinc-800/80 border-green-500/50' 
                          : 'bg-zinc-900 border-zinc-800 hover:border-violet-500/50 hover:shadow-xl'
                      }`}
                      onClick={() => {
                        if (!isLoggedIn) {
                          setShowLoginModal(true);
                          return;
                        }
                        setAppliedMasters(master.id);
                        setShowCelebrityModal(false);
                        const modalName = master.nameZh || master.name;
                        setNotification({ 
                          type: 'success', 
                          message: t.soulInjected.replace('{name}', modalName) 
                        });
                        setTimeout(() => setNotification(null), 3000);
                      }}
                    >
                      {/* 照片区域 - 保持比例不压扁 */}
                      <div className="relative h-40 overflow-hidden">
                        <div className="relative w-full h-full overflow-hidden">
                          <img 
                            src={master.avatar} 
                            alt={master.name} 
                            className="w-full h-full object-cover object-center"
                          />
                          {/* 水印遮挡 */}
                          <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-b from-zinc-900 to-transparent" />
                          <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-t from-zinc-900 to-transparent" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-violet-500/90 rounded-full">
                          <span className="text-[10px] font-bold text-white">{master.tagline}</span>
                        </div>
                          {isApplied && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                        </div>
                        
                        {/* 名言 */}
                      <div className="px-3 py-2 bg-zinc-800/50">
                        <p className="text-[10px] text-zinc-400 italic line-clamp-2">"{master.quote}"</p>
                      </div>
                      
                      {/* 底部信息 */}
                      <div className="p-3 flex flex-col gap-1 mt-auto">
                        <h3 className="text-sm font-bold text-white text-center">
                          {master.nameZh || master.name}
                        </h3>
                        <p className="text-[10px] text-zinc-500 text-center">
                          {master.nameZh ? master.name : ''}
                        </p>
                        <button 
                          disabled={isApplied}
                          className={`mt-1 w-full py-1.5 rounded-lg text-xs font-bold ${
                            isApplied 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-violet-600 text-white hover:bg-violet-500'
                          }`}
                        >
                          {isApplied ? t.injected : t.inject}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
