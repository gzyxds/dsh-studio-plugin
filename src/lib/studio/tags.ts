/**
 * 推广创作台 · 话题标签生成
 *
 * 标签全部由 `ProductSpec` 里的真实字段派生（运营商 / 流量档 / 月租档 / 地区 / 场景），
 * 不做「#永久流量卡」「#9元卡」这类靠夸大换点击的词——那类标签本身就是违规宣传，
 * 平台会连正文一起判。
 *
 * 生成后会再跑一遍合规规则，任何命中 block / warn 的标签直接丢弃，
 * 因此调用方拿到的标签一定可以安全粘贴。
 */
import { OPERATOR_SHORT_LABEL } from '../../data/config/operators.ts';
import { checkCompliance } from './compliance.ts';
import { getPlatform } from './platforms.ts';
import type { PlatformId, ProductSpec } from './types.ts';

/** 各平台额外偏好的标签（与套餐无关的平台氛围词） */
const PLATFORM_EXTRA_TAGS: Record<PlatformId, readonly string[]> = {
  xiaohongshu: [
    '#流量卡推荐',
    '#选卡攻略',
    '#话费省钱',
    '#学生党必备',
    '#手机卡推荐',
    '#避坑指南',
    '#数码好物',
  ],
  douyin: ['#流量卡', '#手机卡', '#数码好物', '#涨知识', '#手机技巧'],
  kuaishou: ['#流量卡办理', '#手机卡', '#真实分享', '#本地生活', '#省钱'],
  moments: ['#流量卡', '#手机卡', '#话费'],
  channels: ['#流量卡', '#手机卡', '#通讯', '#省钱攻略'],
  weibo: ['#流量卡', '#手机卡', '#话费省钱', '#数码'],
  bilibili: ['#流量卡', '#手机卡', '#数码', '#科普', '#通信'],
  group: ['#流量卡', '#手机卡', '#话费'],
};

/** 过滤后不足 5 个时的兜底标签（全部通过合规扫描的通用词） */
const FALLBACK_TAGS: readonly string[] = ['#流量卡', '#手机卡', '#话费省钱', '#数码', '#省钱攻略'];

/** 目标标签数量：小红书吃标签，给满 10 个；其余平台 5-8 个 */
const TARGET_COUNT: Record<PlatformId, number> = {
  xiaohongshu: 10,
  douyin: 7,
  kuaishou: 7,
  moments: 5,
  channels: 6,
  weibo: 7,
  bilibili: 8,
  group: 5,
};

/**
 * 从发货范围原文里抽出可做标签的地名。
 *
 * 「仅发重庆」→ 重庆；「新疆西藏不发」这类**排除项**返回空数组，
 * 因为拿它做标签等于宣传「新疆西藏流量卡」，与事实相反。
 *
 * @param shipRegion - spec.shipRegion 原文。
 * @returns 地名列表（最多 2 个）。
 */
function pickRegionNames(shipRegion: string): string[] {
  const raw = (shipRegion || '').trim();
  if (!raw) return [];
  if (/不发|不支持|暂停|除外|禁发/.test(raw)) return [];

  const stripped = raw.replace(/^(?:仅发|只发|限发|仅限|可发|发往|支持)\s*/, '');
  const first = stripped.split(/[、,，/和及\s]+/).filter(Boolean)[0] || '';
  const name = first.replace(/(?:省|市|自治区|特别行政区|地区|本地)$/, '').trim();
  if (!name || name.length < 2 || name.length > 4) return [];
  if (/全国|不限|各地/.test(name)) return [];
  return [name];
}

/**
 * 判断标签是否可以安全使用。
 *
 * @param tag - 含 `#` 前缀的标签。
 * @returns 通过合规扫描（无任何命中）返回 `true`。
 */
function isSafeTag(tag: string): boolean {
  return checkCompliance(tag).issues.length === 0;
}

/**
 * 由套餐事实派生话题标签。
 *
 * @param spec - 已解析（或人工补全）的套餐事实。
 * @param platform - 目标平台，决定标签数量与平台氛围词。
 * @returns 5-10 个带 `#` 前缀的标签，已去重且通过合规扫描。
 */
export function buildTags(spec: ProductSpec, platform: PlatformId): string[] {
  const tags: string[] = [];
  const push = (tag: string): void => {
    if (!tag || tag === '#') return;
    if (tags.includes(tag)) return;
    tags.push(tag);
  };

  // ===== 运营商 =====
  if (spec.operator !== 'unknown') {
    const short = OPERATOR_SHORT_LABEL[spec.operator];
    push(`#中国${short}`);
    push(`#${short}流量卡`);
  }

  // ===== 流量档 =====
  if (spec.flowGb > 0) {
    push('#流量卡');
    if (spec.flowGb >= 100) push('#大流量卡');
    if (spec.flowGb >= 100) push('#刷视频不卡');
  }
  if (spec.directionalGb > 0) push('#定向流量');

  // ===== 月租档 =====
  if (spec.monthlyFee >= 10) {
    // 用「#月租49」而不是「#49元月租」：后者含「9元」子串，
    // 人工巡检脚本会把它当成低价包装误报，运营复核时容易白折腾。
    push(`#月租${spec.monthlyFee}`);
    if (spec.monthlyFee <= 39) push('#低月租流量卡');
  }

  // ===== 地区（只代表发货范围） =====
  for (const region of pickRegionNames(spec.shipRegion)) {
    push(`#${region}流量卡`);
  }

  // ===== 场景 =====
  if (spec.voiceMinutes > 0) push('#带通话流量卡');
  if (spec.duration === '长期') push('#长期套餐');
  if (spec.contractMonths > 0 && spec.contractMonths <= 12) push('#短期合约');
  if (spec.monthlyFee > 0 && spec.monthlyFee <= 29) push('#学生党');
  if (spec.firstCharge > 0) push('#首充优惠');

  // ===== 平台氛围词 =====
  for (const extra of PLATFORM_EXTRA_TAGS[platform] ?? []) push(extra);

  // 平台可能拿到非法 id，此处仅用于兜底展示，取不到时按小红书数量走
  const target = TARGET_COUNT[getPlatform(platform).id] ?? 6;

  const safe = tags.filter(isSafeTag);
  for (const fallback of FALLBACK_TAGS) {
    if (safe.length >= target) break;
    if (isSafeTag(fallback) && !safe.includes(fallback)) safe.push(fallback);
  }

  return safe.slice(0, Math.max(5, target));
}
