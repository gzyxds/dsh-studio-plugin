/**
 * 运营商统一数据源
 *
 * 背景：各号卡平台的运营商字段格式不一（中文名、数字编码、混在商品名里），
 * 过去在 `search-data.ts`、`Product.astro`、`product/[id].astro`、
 * `yky-api.ts`、`ksj.ts` 等文件中各自维护了一份映射与配色，极易不一致。
 *
 * 本文件作为**唯一数据源**，提供：
 * 1. 标准标识 `OperatorKey`；
 * 2. 名称/短名/图标/配色的视觉元数据 `OPERATOR_META`；
 * 3. 从任意文本中识别运营商的 `detectOperator`；
 * 4. 平台自定义 Map 应在此转换为 `OperatorKey`，而非再定义一套。
 */

/** 标准运营商标识 */
export type OperatorKey = 'mobile' | 'unicom' | 'telecom' | 'broadcast' | 'unknown';

/** 运营商视觉元数据 */
export interface OperatorMeta {
  /** 标准标识 */
  key: OperatorKey;
  /** 完整名称，如「中国移动」 */
  label: string;
  /** 短名称，如「移动」 */
  shortLabel: string;
  /** Iconify 图标名（配合 astro-icon 使用） */
  icon: string;
  /** 徽章背景色（Tailwind class） */
  bgColor: string;
  /** 徽章文字色（Tailwind class） */
  textColor: string;
  /** 徽章边框色（Tailwind class） */
  borderColor: string;
  /** 小标签组合色（背景 + 文字，用于卡片右上角徽章） */
  chipColor: string;
  /** 圆点色（用于列表前的装饰点） */
  dotColor: string;
}

/**
 * 运营商元数据表。
 *
 * 新增运营商只需在此补充一条，所有卡片、详情页、筛选器自动生效。
 */
export const OPERATOR_META: Record<OperatorKey, OperatorMeta> = {
  mobile: {
    key: 'mobile',
    label: '中国移动',
    shortLabel: '移动',
    icon: 'mdi:cellphone',
    bgColor: 'bg-green-50 dark:bg-green-900/15',
    textColor: 'text-green-600 dark:text-green-400',
    borderColor: 'border-green-200 dark:border-green-800/30',
    chipColor: 'text-green-600 bg-green-500/10',
    dotColor: 'bg-green-500',
  },
  unicom: {
    key: 'unicom',
    label: '中国联通',
    shortLabel: '联通',
    icon: 'mdi:transmission-tower',
    bgColor: 'bg-orange-50 dark:bg-orange-900/15',
    textColor: 'text-orange-600 dark:text-orange-400',
    borderColor: 'border-orange-200 dark:border-orange-800/30',
    chipColor: 'text-orange-500 bg-orange-500/10',
    dotColor: 'bg-orange-500',
  },
  telecom: {
    key: 'telecom',
    label: '中国电信',
    shortLabel: '电信',
    icon: 'mdi:satellite-variant',
    bgColor: 'bg-blue-50 dark:bg-blue-900/15',
    textColor: 'text-blue-600 dark:text-blue-400',
    borderColor: 'border-blue-200 dark:border-blue-800/30',
    chipColor: 'text-blue-500 bg-blue-500/10',
    dotColor: 'bg-blue-500',
  },
  broadcast: {
    key: 'broadcast',
    label: '中国广电',
    shortLabel: '广电',
    icon: 'mdi:broadcast',
    bgColor: 'bg-purple-50 dark:bg-purple-900/15',
    textColor: 'text-purple-600 dark:text-purple-400',
    borderColor: 'border-purple-200 dark:border-purple-800/30',
    chipColor: 'text-purple-500 bg-purple-500/10',
    dotColor: 'bg-purple-500',
  },
  unknown: {
    key: 'unknown',
    label: '其他',
    shortLabel: '其他',
    icon: 'mdi:help-circle-outline',
    bgColor: 'bg-gray-50 dark:bg-gray-900/15',
    textColor: 'text-gray-600 dark:text-gray-400',
    borderColor: 'border-gray-200 dark:border-gray-800/30',
    chipColor: 'text-gray-500 bg-gray-500/10',
    dotColor: 'bg-gray-400',
  },
};

/**
 * 识别关键词表。
 *
 * 「广播电视」排在「电信」之前无影响（关键词互斥），但保留顺序可让
 * 类似「中国广电5G」这类文案优先命中广电。
 */
const OPERATOR_KEYWORDS: ReadonlyArray<{
  key: Exclude<OperatorKey, 'unknown'>;
  words: readonly string[];
}> = [
  { key: 'broadcast', words: ['广电', '广播电视'] },
  { key: 'mobile', words: ['移动'] },
  { key: 'unicom', words: ['联通'] },
  { key: 'telecom', words: ['电信'] },
];

/** 标准标识 → 完整名称 */
export const OPERATOR_LABEL: Record<OperatorKey, string> = Object.fromEntries(
  (Object.keys(OPERATOR_META) as OperatorKey[]).map((key) => [key, OPERATOR_META[key].label])
) as Record<OperatorKey, string>;

/** 标准标识 → 短名称 */
export const OPERATOR_SHORT_LABEL: Record<OperatorKey, string> = Object.fromEntries(
  (Object.keys(OPERATOR_META) as OperatorKey[]).map((key) => [key, OPERATOR_META[key].shortLabel])
) as Record<OperatorKey, string>;

/**
 * 从任意文本（商品名、套餐描述、平台返回的运营商字段）中识别运营商。
 *
 * @param text - 待识别文本，允许为空。
 * @returns 标准运营商标识，未命中返回 `unknown`。
 */
export function detectOperator(text: string | undefined | null): OperatorKey {
  const normalized = (text || '').toLowerCase();
  if (!normalized) return 'unknown';

  for (const { key, words } of OPERATOR_KEYWORDS) {
    if (words.some((word) => normalized.includes(word))) return key;
  }
  return 'unknown';
}

/**
 * 获取运营商视觉元数据，未知输入降级为 `unknown` 的样式。
 *
 * @param key - 运营商标识，允许传入平台原始 key。
 * @returns 对应的视觉元数据。
 */
export function getOperatorMeta(key: string | undefined | null): OperatorMeta {
  return OPERATOR_META[(key || 'unknown') as OperatorKey] || OPERATOR_META.unknown;
}

/**
 * 获取运营商完整名称。
 *
 * @param key - 运营商标识。
 * @returns 中文名称，未知返回「其他」。
 */
export function getOperatorLabel(key: string | undefined | null): string {
  return getOperatorMeta(key).label;
}

/**
 * 判断是否为三大基础运营商。
 *
 * @param key - 运营商标识。
 * @returns 移动/联通/电信返回 `true`。
 */
export function isMajorOperator(key: string | undefined | null): boolean {
  return key === 'mobile' || key === 'unicom' || key === 'telecom';
}
