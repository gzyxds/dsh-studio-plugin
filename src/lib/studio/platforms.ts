/**
 * 推广创作台 · 平台与体裁元数据
 *
 * 这里同时服务于两处：UI 的平台选择卡片、文案生成器的排版分支。
 * 两处共用一份数据，避免「卡片上写 300-600 字、生成器按 1000 字写」这类对不上的问题。
 *
 * 新增平台时只需在 `PLATFORMS` 补一条（id 必须落在 `PlatformId` 联合类型内），
 * 并在 `copy.ts` 的排版分支里补对应实现。
 */
import type { CopyTone, PlatformId, PlatformMeta, ToneMeta } from './types.ts';

/**
 * 平台元数据表。
 *
 * `tones` 是该平台真正吃香的体裁，不是全部体裁——朋友圈放「答疑」几乎没人看，
 * 微博也不适合长故事，生成器只提供这些组合。
 */
export const PLATFORMS: readonly PlatformMeta[] = [
  {
    id: 'xiaohongshu',
    label: '小红书',
    icon: 'mdi:book-heart-outline',
    hint: '封面决定点击，正文决定转化，忌硬广',
    lengthHint: '300-600字',
    tones: ['seed', 'direct', 'story', 'value', 'qa'],
  },
  {
    id: 'douyin',
    label: '抖音',
    icon: 'mdi:music-note-outline',
    hint: '口播 15-30 秒，前 3 秒定生死',
    lengthHint: '15-30秒口播（约150-250字）',
    tones: ['seed', 'direct', 'story', 'value', 'qa'],
  },
  {
    id: 'kuaishou',
    label: '快手',
    icon: 'mdi:video-outline',
    hint: '老铁文化，真实感强，忌端着',
    lengthHint: '80-200字',
    tones: ['seed', 'direct', 'story', 'value'],
  },
  {
    id: 'moments',
    label: '朋友圈',
    icon: 'mdi:account-multiple-outline',
    hint: '熟人场景，越像广告越没人看',
    lengthHint: '60-150字',
    tones: ['seed', 'direct', 'story', 'value'],
  },
  {
    id: 'channels',
    label: '视频号',
    icon: 'mdi:play-box-outline',
    hint: '中老年用户多，讲清楚比讲好听重要',
    lengthHint: '60-90秒口播（约250-400字）',
    tones: ['direct', 'story', 'value', 'qa'],
  },
  {
    id: 'weibo',
    label: '微博',
    icon: 'mdi:sina-weibo',
    hint: '短平快 + 话题词，超过三段就没人看完',
    lengthHint: '80-200字',
    tones: ['direct', 'value', 'qa'],
  },
  {
    id: 'bilibili',
    label: 'B站',
    icon: 'mdi:television-play',
    hint: '弹幕文化，可长文科普，参数越细越可信',
    lengthHint: '800-1500字',
    tones: ['direct', 'value', 'qa', 'story'],
  },
  {
    id: 'group',
    label: '群聊',
    icon: 'mdi:chat-outline',
    hint: '信息密度优先，直接给参数',
    lengthHint: '80-200字',
    tones: ['direct', 'value', 'qa'],
  },
];

/** 体裁元数据表 */
export const TONES: readonly ToneMeta[] = [
  {
    id: 'seed',
    label: '种草',
    hint: '以真实使用体验切入，先讲场景再讲参数，适合泛流量',
  },
  {
    id: 'direct',
    label: '直推',
    hint: '开门见山摆参数，适合已有明确需求的用户',
  },
  {
    id: 'story',
    label: '故事',
    hint: '用一个具体经历带出套餐，别编细节，编了会被评论区拆穿',
  },
  {
    id: 'value',
    label: '性价比',
    hint: '做对比、算账，用真实数字说话，别用极限词',
  },
  {
    id: 'qa',
    label: '答疑',
    hint: '用问答消除顾虑，适合承接评论区和私信流量',
  },
];

/** 平台 id → 元数据，便于 O(1) 查询 */
const PLATFORM_MAP: Record<PlatformId, PlatformMeta> = Object.fromEntries(
  PLATFORMS.map((platform) => [platform.id, platform])
) as Record<PlatformId, PlatformMeta>;

/** 体裁 id → 元数据 */
const TONE_MAP: Record<CopyTone, ToneMeta> = Object.fromEntries(
  TONES.map((tone) => [tone.id, tone])
) as Record<CopyTone, ToneMeta>;

/**
 * 取平台元数据。
 *
 * @param id - 平台 id。
 * @returns 对应元数据；非法 id 回退到小红书，保证 UI 不会拿到 undefined。
 */
export function getPlatform(id: PlatformId): PlatformMeta {
  return PLATFORM_MAP[id] ?? PLATFORMS[0];
}

/**
 * 取体裁元数据。
 *
 * @param id - 体裁 id。
 * @returns 对应元数据；非法 id 回退到「种草」。
 */
export function getTone(id: CopyTone): ToneMeta {
  return TONE_MAP[id] ?? TONES[0];
}
