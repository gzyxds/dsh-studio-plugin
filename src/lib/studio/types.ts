/**
 * 推广创作台（studio）类型契约
 *
 * 本文件是创作台三个子系统的**唯一接口文档**：
 * - 文案引擎（parse / compliance / copy / tags）：纯函数，无 DOM 依赖，可在构建期与浏览器复用；
 * - 卡片图引擎（poster）：只依赖 Canvas 2D，输入 ProductSpec + 尺寸 + 主题；
 * - 页面控制器（src/scripts/studio/*）：串联两者并负责交互。
 *
 * 纪律：三个子系统之间只通过本文件的类型通信，不得互相 import 实现文件，
 * 避免出现"文案层改了字段、海报层静默取到 undefined"这类只在线上暴露的问题。
 */
import type { OperatorKey } from '../../data/config/operators';

export type { OperatorKey };

// ===================== 一、商品结构化 =====================

/** 卡形态：实体卡 / 电子卡（eSIM、虚拟）/ 未知 */
export type CardForm = 'physical' | 'esim' | 'unknown';

/**
 * 从一段上游商品文案里解析出的套餐事实。
 *
 * 所有数值字段「解析不到」一律用 0 / 空串表示，**绝不填猜测值**——
 * 流量卡宣传出错是要被平台处罚的，宁可留空让用户手填。
 */
export interface ProductSpec {
  /** 原始标题行（保留【】前缀，用于回溯） */
  rawTitle: string;
  /** 干净商品名（去掉【实体卡】这类前缀） */
  name: string;
  /** 运营商标准标识 */
  operator: OperatorKey;
  /** 卡形态 */
  cardForm: CardForm;

  /** 月租（元/月）——宣传口径的主数字，必须是真实月租 */
  monthlyFee: number;
  /** 激活首充金额（元）；0 = 无首充门槛 */
  firstCharge: number;
  /** 首月政策原文（如「按天折算」） */
  firstMonth: string;

  /** 通用流量（GB）；0 = 未标注 */
  flowGb: number;
  /** 定向流量（GB）；0 = 无定向 */
  directionalGb: number;
  /** 通话分钟；0 = 无通话 */
  voiceMinutes: number;

  /** 合约期（月）；0 = 未标注 */
  contractMonths: number;
  /** 合约期展示文案（如「12个月」） */
  contractText: string;
  /** 优惠期 / 有效期归一化文案（长期 / 12个月 / 未知） */
  duration: string;

  /** 办卡年龄（如「18-60周岁」） */
  ageRange: string;
  /** 发货地区原文（如「仅发重庆」）——**只允许说发货范围，禁止说归属地** */
  shipRegion: string;
  /** 激活方式（如「面对面激活」） */
  activateType: string;
  /** 快递方式（如「上门」） */
  expressType: string;

  /** 附加权益（如「10元云盘包」） */
  perks: string[];
  /** 套餐外资费 */
  outOfPlan: { voice: string; sms: string; data: string };
  /** 上游「温馨提示」等约束原文，供合规扫描回溯 */
  notices: string[];
  /** 未能归类的原文行（便于人工补全，也用于"解析不完整"提示） */
  leftovers: string[];

  /** 解析置信度 0–1：命中字段越多越高，低于 0.5 时界面提示用户核对 */
  confidence: number;
}

/** 解析结果的附带诊断 */
export interface ParseResult {
  spec: ProductSpec;
  /** 命中的字段名（中文），用于界面上"已识别"清单 */
  matched: string[];
  /** 未识别的关键字段（中文），用于"请手动补全"提示 */
  missing: string[];
}

// ===================== 二、合规 =====================

/** 合规等级：pass 可发 / warn 建议改 / block 禁止发 */
export type ComplianceLevel = 'pass' | 'warn' | 'block';

/** 单条合规命中 */
export interface ComplianceIssue {
  /** 规则 id，便于统计 */
  id: string;
  /** 命中的原文片段 */
  matched: string;
  level: ComplianceLevel;
  /** 规则短名（如「极限用语」） */
  rule: string;
  /** 为什么违规（给运营看的人话） */
  reason: string;
  /** 建议替换文案（可直接落地） */
  suggestion: string;
  /** 在原文中的起始下标 */
  index: number;
}

/** 合规体检报告 */
export interface ComplianceReport {
  /** 整段文本的最高风险等级 */
  level: ComplianceLevel;
  issues: ComplianceIssue[];
  /** 自动修正后的文本（极限词替换、删禁用词） */
  sanitized: string;
  /** 扫描字符数 */
  scanned: number;
}

// ===================== 三、文案生成 =====================

/** 发布平台 */
export type PlatformId =
  'xiaohongshu' | 'douyin' | 'kuaishou' | 'moments' | 'channels' | 'weibo' | 'bilibili' | 'group';

/** 文案体裁（同一平台可有多种） */
export type CopyTone = 'seed' | 'direct' | 'story' | 'value' | 'qa';

/** 平台元信息（UI 卡片与生成器共用同一份，避免两处文案对不上） */
export interface PlatformMeta {
  id: PlatformId;
  /** 展示名 */
  label: string;
  /** Iconify 图标名 */
  icon: string;
  /** 一句平台特征说明 */
  hint: string;
  /** 正文字数建议区间 */
  lengthHint: string;
  /** 该平台可用的体裁 */
  tones: CopyTone[];
}

/** 体裁元信息 */
export interface ToneMeta {
  id: CopyTone;
  label: string;
  hint: string;
}

/** 一条生成好的推广文案 */
export interface CopyVariant {
  /** 稳定 id：`${platform}-${tone}-${index}` */
  id: string;
  platform: PlatformId;
  tone: CopyTone;
  /** 首句钩子（抖音/视频号即前 3 秒口播） */
  hook: string;
  /** 正文（已按平台排版：小红书分段带 emoji，抖音带分镜/口播标记） */
  body: string;
  /** 行动指令 */
  cta: string;
  /** 话题标签（含 # 前缀） */
  tags: string[];
  /** 本条专属的发布注意点 */
  notes: string[];
  /** 本条完整可复制文本 = hook + body + cta + tags 的拼装结果（由引擎产出，保证复制即所见） */
  full: string;
}

// ===================== 四、卡片图 =====================

/** 出图尺寸 id（社交媒体标准比例） */
export type PosterSizeId = '9:16' | '16:9' | '1:1' | '4:3' | '3:4';

/** 尺寸定义 */
export interface PosterSize {
  id: PosterSizeId;
  label: string;
  /** 逻辑宽（px，1x） */
  width: number;
  /** 逻辑高（px，1x） */
  height: number;
  /** 适用场景说明 */
  usage: string;
}

/** 配色主题 id */
export type PosterThemeId = 'brand' | 'ink' | 'sunset' | 'mint' | 'violet';

/** 配色主题（全部为可读性达标的实色组合，不用渐变文字） */
export interface PosterTheme {
  id: PosterThemeId;
  label: string;
  /** 背景主色 */
  bg: string;
  /** 背景次色（用于渐变/装饰块） */
  bgAlt: string;
  /** 主文字色 */
  fg: string;
  /** 次文字色 */
  fgMuted: string;
  /** 强调色（价格、流量数字） */
  accent: string;
  /** 强调色上的文字色 */
  accentFg: string;
  /** 卡片底色 */
  card: string;
  /** 描边色 */
  line: string;
}

/** 出图请求 */
export interface PosterRequest {
  spec: ProductSpec;
  size: PosterSizeId;
  theme: PosterThemeId;
  /** 主标题（用户可改；为空时由 spec.name 派生） */
  headline: string;
  /** 副标题/卖点一行 */
  subline: string;
  /** 卖点 chips（最多渲染 4 个，超出的忽略） */
  chips: string[];
  /** 页脚落款（如站点名 + 域名） */
  footer: string;
  /** 二维码内容（推广链接）；空串则不画二维码 */
  qrUrl: string;
  /** 输出倍率（1 / 2 / 3），影响导出分辨率 */
  scale: number;
}

/** 出图结果 */
export interface PosterResult {
  canvas: HTMLCanvasElement;
  /** 实际像素宽 */
  width: number;
  /** 实际像素高 */
  height: number;
  /** 建议文件名（不含扩展名） */
  filename: string;
}
