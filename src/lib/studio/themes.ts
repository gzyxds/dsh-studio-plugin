/**
 * 推广创作台 · 卡片图配色主题
 *
 * 五套主题共用同一套语义色位（见 types.ts 的 PosterTheme），渲染引擎只认这些色位，
 * 不认具体色值——新增主题只需在这里加一条，海报代码不用改。
 *
 * **对比度是硬指标**：卡片图是给人刷信息流时「扫一眼」的，字看不清等于没做。
 * 下表是每套主题实测的 WCAG 对比度（bg / bgAlt 两端都算过，取较差的一端）：
 *
 * | 主题   | fg:bg | fg:bgAlt | fgMuted:bgAlt | fgMuted:card | accentFg:accent |
 * |--------|-------|----------|---------------|--------------|----------------|
 * | brand  | 6.54  | 5.35     | 4.72          | 6.51         | 12.21          |
 * | ink    | 17.59 | 14.54    | 6.93          | 7.29         | 6.34           |
 * | sunset | 14.53 | 12.44    | 6.05          | 7.68         | 5.57           |
 * | mint   | 13.69 | 12.21    | 5.18          | 6.08         | 5.38           |
 * | violet | 17.92 | 14.71    | 8.32          | 9.36         | 6.47           |
 *
 * AA 要求：正文 4.5:1、大字号（≥24px 或 ≥18.66px 加粗）3:1。
 * `sunset` / `mint` 的 accent（#FF6B35 / #00B578）直接当文字色落在浅底上只有 2.5–2.8:1，
 * 因此 poster.ts 不把 accent 当正文色，只在「accent 实底 + accentFg 文字」里成对使用
 * （5.38–12.21:1 全部达标）。
 *
 * `accentFg` 是「accent 实底上的文字色」：五套 accent 都是高亮度色（金/珊瑚/橙/薄荷绿/紫），
 * 深色字才够对比度（5.38–12.21:1），白字全部不达标，故统一给深色。
 */
import type { PosterTheme, PosterThemeId } from './types';

/** 入参非法时的兜底主题：官方蓝是站内主视觉 */
const FALLBACK_THEME_ID: PosterThemeId = 'brand';

/**
 * 全部配色主题。
 *
 * 顺序即界面展示顺序，`brand` 放第一位（与站内主色一致，运营默认选中）。
 */
export const POSTER_THEMES: PosterTheme[] = [
  {
    id: 'brand',
    label: '官方蓝',
    bg: '#0052D9',
    bgAlt: '#3758F9',
    fg: '#FFFFFF',
    // 蓝色底上的次要文字不能直接用半透明白：会掉到 3:1 以下，这里给一个够亮的蓝白
    fgMuted: '#EAF1FF',
    accent: '#FFD24A',
    accentFg: '#111928',
    // 比 bg 略深一档，面板/胶囊压在渐变上仍能分出层次
    card: '#0B4CC4',
    line: '#6E9BFF',
  },
  {
    id: 'ink',
    label: '墨黑质感',
    bg: '#111928',
    bgAlt: '#1F2A37',
    fg: '#FFFFFF',
    fgMuted: '#A9B4C4',
    accent: '#FF6B6B',
    accentFg: '#111928',
    card: '#1B2634',
    line: '#3B4A60',
  },
  {
    id: 'sunset',
    label: '暖阳橙',
    bg: '#FFF4E6',
    bgAlt: '#FFE0B2',
    // 深字浅底：浅底主题的 fg 必须是深色，否则整张图在手机上会「发白看不清」
    fg: '#1F2329',
    fgMuted: '#5A5248',
    accent: '#FF6B35',
    accentFg: '#1F2329',
    card: '#FFFFFF',
    line: '#E8CBA8',
  },
  {
    id: 'mint',
    label: '薄荷绿',
    bg: '#E8FFF5',
    bgAlt: '#C8F7E4',
    fg: '#10301F',
    fgMuted: '#3F6B57',
    accent: '#00B578',
    accentFg: '#10301F',
    card: '#FFFFFF',
    line: '#A8DFC9',
  },
  {
    id: 'violet',
    label: '霓虹紫',
    bg: '#1B1035',
    bgAlt: '#2E1B5C',
    fg: '#FFFFFF',
    fgMuted: '#C9BCEB',
    accent: '#A78BFA',
    accentFg: '#111928',
    card: '#241545',
    line: '#4A3180',
  },
];

/**
 * 按 id 取配色主题。
 *
 * @param id - 主题 id；允许传入任意字符串（例如来自 localStorage 的历史值）。
 * @returns 命中的主题；未命中时返回官方蓝，调用方无需判空。
 */
export function getPosterTheme(id: string | null | undefined): PosterTheme {
  const matched = POSTER_THEMES.find((theme) => theme.id === id);
  if (matched) return matched;
  const fallback = POSTER_THEMES.find((theme) => theme.id === FALLBACK_THEME_ID);
  // POSTER_THEMES 非空且第一项恒存在，这里的兜底只为满足类型收窄
  return fallback ?? POSTER_THEMES[0];
}
