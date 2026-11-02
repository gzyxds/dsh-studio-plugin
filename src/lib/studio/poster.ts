/**
 * 推广创作台 · 卡片图渲染引擎（Canvas 2D）
 *
 * 输入 `PosterRequest`（套餐事实 + 尺寸 + 主题 + 文案），输出一张可直接下载的
 * `HTMLCanvasElement`。本文件只依赖 Canvas 2D 与 `qrcode`，不碰 DOM 结构、不碰页面状态，
 * 便于在创作台预览、批量出图、乃至将来的服务端（node-canvas）复用同一套排版。
 *
 * 三条硬规则（写死在实现里，不靠调用方自觉）：
 * 1. **只画真实存在的数字**：`flowGb / voiceMinutes / monthlyFee` 为 0 时对应区块整块不画，
 *    绝不出现「¥0/月」「0G」这种把「没填」说成「免费 / 零流量」的误导；
 * 2. **中文逐行测量折行**：所有长文本走 `measureText` 的贪心折行 + 字号回退，
 *    不用 `\n` 硬切，也不允许溢出画布；
 * 3. **合规文案原样落地**：页脚只渲染 `req.footer`，引擎不生成任何「永久」「无限」类表述。
 *
 * 尺寸口径：`PosterSize.width/height` 是**逻辑尺寸（1x）**，真实像素 = 逻辑尺寸 × `scale`；
 * 画布先按倍率放大、再 `ctx.scale()`，之后所有坐标与字号都按逻辑 px 写，一套排版吃全部倍率。
 *
 * 排版模型：**先量后排**。每个区块函数返回自身高度；区块先在「干跑上下文」
 * （吞掉所有绘制指令、但 measureText 仍作用于真画布）里跑一遍拿到真实高度，
 * 再由 `drawSections` 按权重分配剩余空间。因此 y 坐标从不硬编码——
 * 文案变长只会挤压留白，不会压到二维码上。
 */
import QRCode from 'qrcode';

import { OPERATOR_META } from '../../data/config/operators';
import { getPosterSize } from './sizes';
import { getPosterTheme } from './themes';
import type { PosterRequest, PosterResult, PosterTheme, ProductSpec } from './types';

// ===================== 常量 =====================

/**
 * 全局字体栈。
 *
 * 依次覆盖：macOS/iOS（PingFang SC）→ Windows（微软雅黑）→ Linux（Noto / 思源黑体）→ 兜底。
 * Canvas 的 `font` 只接受 CSS font 简写，字体名带空格必须加引号，故整串原样使用。
 */
export const FONT_STACK =
  '"PingFang SC","Microsoft YaHei","Noto Sans CJK SC","Source Han Sans SC",sans-serif';

/** 卖点 chips 的渲染上限（超出直接忽略，不硬塞） */
const CHIP_LIMIT = 4;

/** 二维码位图边长：512 足够 3x 倍率下的清晰度，又不至于拖慢出图 */
const QR_PIXEL_SIZE = 512;

/** 二维码 dataURL 缓存条数：连续换主题 / 尺寸时不必重复编码同一链接 */
const QR_CACHE_LIMIT = 8;

/**
 * 字号回退梯度：放不下就逐级缩，最低 0.72 倍——
 * 再小就不是「海报」而是「说明文档」了。
 */
const FIT_FACTORS = [1, 0.96, 0.92, 0.88, 0.84, 0.8, 0.76, 0.72];

/** 干跑时被吞掉的绘制类方法名 */
const NOOP_METHODS = new Set([
  'beginPath',
  'closePath',
  'moveTo',
  'lineTo',
  'arc',
  'arcTo',
  'ellipse',
  'rect',
  'bezierCurveTo',
  'quadraticCurveTo',
  'fill',
  'stroke',
  'fillRect',
  'strokeRect',
  'clearRect',
  'fillText',
  'strokeText',
  'drawImage',
  'save',
  'restore',
  'translate',
  'rotate',
  'scale',
  'clip',
  'setLineDash',
  'setTransform',
  'resetTransform',
]);

/** 二维码 dataURL 缓存（key = 链接原文） */
const qrCache = new Map<string, string>();

// ===================== 颜色工具 =====================

/**
 * 解析 `#RRGGBB` / `#RGB` 为 RGB 三元组。
 *
 * @param hex - 十六进制颜色。
 * @returns `[r, g, b]`，每项 0–255；非法输入返回黑色。
 */
function parseHex(hex: string): [number, number, number] {
  const raw = hex.replace('#', '').trim();
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((char) => char + char)
          .join('')
      : raw;
  if (full.length !== 6) return [0, 0, 0];
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

/**
 * 给颜色加透明度，输出 `rgba()`。
 *
 * @param hex - 十六进制颜色。
 * @param alpha - 0–1 的透明度。
 * @returns Canvas 可用的 rgba 字符串。
 */
function withAlpha(hex: string, alpha: number): string {
  const [r, g, b] = parseHex(hex);
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
}

/**
 * WCAG 相对亮度。
 *
 * @param hex - 十六进制颜色。
 * @returns 0–1 的相对亮度。
 */
function relativeLuminance(hex: string): number {
  const channels = parseHex(hex).map((value) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

/**
 * 两色对比度（WCAG 公式）。
 *
 * @param a - 颜色 A。
 * @param b - 颜色 B。
 * @returns 1–21 的对比度。
 */
function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const light = Math.max(la, lb);
  const dark = Math.min(la, lb);
  return (light + 0.05) / (dark + 0.05);
}

/**
 * 按比例线性插值两色。
 *
 * @param from - 起始色。
 * @param to - 目标色。
 * @param t - 0 = 全 from，1 = 全 to。
 * @returns 混合后的十六进制色。
 */
function mixColor(from: string, to: string, t: number): string {
  const a = parseHex(from);
  const b = parseHex(to);
  const ratio = Math.max(0, Math.min(1, t));
  const channel = (index: number) =>
    Math.round(a[index] + (b[index] - a[index]) * ratio)
      .toString(16)
      .padStart(2, '0');
  return `#${channel(0)}${channel(1)}${channel(2)}`;
}

/**
 * 取主题背景的「代表色」（渐变两端的中点），用于计算文字对比度。
 *
 * @param theme - 配色主题。
 * @returns 代表背景色。
 */
function backgroundBase(theme: PosterTheme): string {
  return mixColor(theme.bg, theme.bgAlt, 0.5);
}

/**
 * 把强调色调到「在指定底色上可读」。
 *
 * 主题里的 accent 是设计稿给定值（金 / 珊瑚 / 橙 / 薄荷绿 / 紫）。在深色主题里它是天然高光，
 * 但在浅色主题（sunset / mint）上直接当文字色只有 2.5–2.8:1，达不到大字号 AA 的 3:1。
 * 这里按底色明暗把 accent 朝黑 / 白逐级混合，取第一个达标的色——观感仍是原来的橙 / 绿，
 * 只是更深一点，主题色位本身不改。
 *
 * @param accent - 主题强调色。
 * @param background - 实际落字处的背景色。
 * @param minRatio - 需要达到的最低对比度，默认 3（≥24px 大字号 AA）。
 * @returns 可安全当文字色使用的颜色。
 */
function readableAccent(accent: string, background: string, minRatio = 3): string {
  if (contrastRatio(accent, background) >= minRatio) return accent;
  const isLightBackground = relativeLuminance(background) > 0.35;
  const target = isLightBackground ? '#000000' : '#FFFFFF';
  for (let step = 1; step <= 10; step += 1) {
    const candidate = mixColor(accent, target, step / 10);
    if (contrastRatio(candidate, background) >= minRatio) return candidate;
  }
  return target;
}

// ===================== 几何工具 =====================

/**
 * 圆角矩形路径（自带实现，不依赖 `ctx.roundRect`——Safari 16 之前没有）。
 *
 * @param ctx - Canvas 上下文。
 * @param x - 左上角 x。
 * @param y - 左上角 y。
 * @param width - 宽。
 * @param height - 高。
 * @param radius - 圆角半径，超过短边一半时自动收敛。
 */
function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.arcTo(x + width, y, x + width, y + r, r);
  ctx.lineTo(x + width, y + height - r);
  ctx.arcTo(x + width, y + height, x + width - r, y + height, r);
  ctx.lineTo(x + r, y + height);
  ctx.arcTo(x, y + height, x, y + height - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

/**
 * 填充圆角矩形。
 *
 * @param ctx - Canvas 上下文。
 * @param x - 左上角 x。
 * @param y - 左上角 y。
 * @param width - 宽。
 * @param height - 高。
 * @param radius - 圆角半径。
 * @param fill - 填充色。
 */
function fillRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill: string
): void {
  roundRectPath(ctx, x, y, width, height, radius);
  ctx.fillStyle = fill;
  ctx.fill();
}

/**
 * 描边圆角矩形。
 *
 * @param ctx - Canvas 上下文。
 * @param x - 左上角 x。
 * @param y - 左上角 y。
 * @param width - 宽。
 * @param height - 高。
 * @param radius - 圆角半径。
 * @param stroke - 描边色。
 * @param lineWidth - 线宽，默认 1。
 */
function strokeRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  stroke: string,
  lineWidth = 1
): void {
  roundRectPath(ctx, x, y, width, height, radius);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

// ===================== 文字工具 =====================

/**
 * 生成 CSS font 简写。
 *
 * @param size - 字号（逻辑 px）。
 * @param weight - 字重，默认 400。
 * @returns 可直接赋给 `ctx.font` 的字符串。
 */
function fontOf(size: number, weight: number | string = 400): string {
  const safeSize = Math.max(1, Math.round(size * 100) / 100);
  return `${weight} ${safeSize}px ${FONT_STACK}`;
}

/**
 * 分词正则：中文 / 全角标点单字成 token，拉丁字母与数字整段成 token，空白单独成 token。
 *
 * 中文可以任意断行，但「200G」「18-60」这类不能从中间劈开——按字符断行会把「200G」
 * 拆成两行，看上去像两个数字。
 */
const TOKEN_RE = /[A-Za-z0-9][A-Za-z0-9.,+\-/]*|\s+|[\s\S]/gu;

/**
 * 按最大宽度贪心折行（支持显式 `\n` 强制换行）。
 *
 * @param ctx - Canvas 上下文（调用前需已设置好 `ctx.font`）。
 * @param text - 待排版文本。
 * @param maxWidth - 单行最大宽度（逻辑 px）。
 * @returns 折好的行数组，至少一行。
 */
function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  const paragraphs = text.split('\n');

  for (const paragraph of paragraphs) {
    const tokens = paragraph.match(TOKEN_RE) ?? [];
    let current = '';

    for (const token of tokens) {
      if (/^\s+$/.test(token) && current === '') continue;

      if (current !== '' && ctx.measureText((current + token).trimEnd()).width > maxWidth) {
        lines.push(current.trimEnd());
        current = token.trimStart();
      } else {
        current += token;
      }

      // 当前行本身超宽（长 URL / 连续字母数字，换行后仍然超宽）时按字符硬折，
      // 否则它会原样画出去、横向溢出画布（审计里的 chips / 页脚溢出即此）。
      if (ctx.measureText(current.trimEnd()).width > maxWidth) {
        const broken = breakToken(ctx, current, maxWidth);
        lines.push(...broken.slice(0, -1));
        current = broken[broken.length - 1] ?? '';
      }
    }

    lines.push(current.trimEnd());
  }

  // 去掉空段落产生的空行，但保底返回一行，避免调用方拿到空数组
  const cleaned = lines.filter((line) => line !== '');
  return cleaned.length > 0 ? cleaned : [''];
}

/**
 * 单个超宽 token 按字符硬折。
 *
 * @param ctx - Canvas 上下文（调用前需已设置好 `ctx.font`）。
 * @param token - 待拆分的 token。
 * @param maxWidth - 单行最大宽度（逻辑 px）。
 * @returns 至少一段文本。
 */
function breakToken(ctx: CanvasRenderingContext2D, token: string, maxWidth: number): string[] {
  const parts: string[] = [];
  let current = '';
  for (const char of Array.from(token)) {
    const candidate = current + char;
    if (current !== '' && ctx.measureText(candidate).width > maxWidth) {
      parts.push(current);
      current = char;
    } else {
      current = candidate;
    }
  }
  if (current !== '') parts.push(current);
  return parts.length > 0 ? parts : [''];
}

/**
 * 单行省略：把文本裁到 maxWidth 内并以「…」结尾。
 *
 * @param ctx - Canvas 上下文（调用前需已设置好 `ctx.font`）。
 * @param text - 原始文本。
 * @param maxWidth - 单行最大宽度。
 * @returns 省略后的文本。
 */
function ellipsize(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  const chars = Array.from(text);
  while (chars.length > 0) {
    chars.pop();
    const candidate = `${chars.join('')}…`;
    if (ctx.measureText(candidate).width <= maxWidth) return candidate;
  }
  return '…';
}

/** 折行结果 */
interface FittedText {
  lines: string[];
  size: number;
  lineHeight: number;
  height: number;
}

/** 折行参数 */
interface FitOptions {
  /** 单行最大宽度 */
  maxWidth: number;
  /** 最多行数：超出先缩字号，缩到下限仍超出才省略 */
  maxLines: number;
  /** 起始字号 */
  size: number;
  /** 字号下限，默认起始字号的 70% */
  minSize?: number;
  /** 字重，默认 400 */
  weight?: number | string;
  /** 行高倍数，默认 1.3 */
  lineHeight?: number;
}

/**
 * 自适应折行：从起始字号逐级缩到下限，取第一个能塞进 maxLines 的字号。
 *
 * 中文字体度量在不同平台差异不小（PingFang 与微软雅黑同字号宽度能差 5%），
 * 所以不按「字数 × 字号」估算，每一级都真实 `measureText`。
 *
 * @param ctx - Canvas 上下文。
 * @param text - 待排版文本。
 * @param options - 折行参数。
 * @returns 行、字号与总高度（空文本返回 height 0）。
 */
function fitText(ctx: CanvasRenderingContext2D, text: string, options: FitOptions): FittedText {
  const { maxWidth, maxLines, size, weight = 400 } = options;
  const lineHeightRatio = options.lineHeight ?? 1.3;
  const minSize = options.minSize ?? size * 0.7;
  const trimmed = text.trim();

  if (!trimmed) {
    return { lines: [], size, lineHeight: size * lineHeightRatio, height: 0 };
  }

  for (let current = size; current >= minSize; current -= 1) {
    ctx.font = fontOf(current, weight);
    const lines = wrapLines(ctx, trimmed, maxWidth);
    if (lines.length <= maxLines) {
      const lineHeight = current * lineHeightRatio;
      return { lines, size: current, lineHeight, height: lines.length * lineHeight };
    }
  }

  // 缩到下限仍放不下：保留前 maxLines 行，末行省略（极端长文案的兜底）
  ctx.font = fontOf(minSize, weight);
  const lines = wrapLines(ctx, trimmed, maxWidth);
  const truncated = lines.length > maxLines;
  const kept = lines.slice(0, maxLines);
  // 只有「内容确实被截掉」时才补省略号：否则读者看不出后面还有文字
  if (kept.length > 0) {
    const last = truncated ? `${kept[kept.length - 1]}…` : kept[kept.length - 1];
    kept[kept.length - 1] = ellipsize(ctx, last, maxWidth);
  }
  return {
    lines: kept,
    size: minSize,
    lineHeight: minSize * lineHeightRatio,
    height: kept.length * minSize * lineHeightRatio,
  };
}

/**
 * 按行绘制文本（左对齐、顶部对齐）。
 *
 * @param ctx - Canvas 上下文。
 * @param fitted - 折行结果。
 * @param x - 起始 x。
 * @param top - 文本块顶部 y。
 * @param color - 文字色。
 * @param weight - 字重。
 */
function drawFitted(
  ctx: CanvasRenderingContext2D,
  fitted: FittedText,
  x: number,
  top: number,
  color: string,
  weight: number | string = 400
): void {
  if (fitted.lines.length === 0) return;
  ctx.font = fontOf(fitted.size, weight);
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  fitted.lines.forEach((line, index) => {
    ctx.fillText(line, x, top + index * fitted.lineHeight);
  });
}

// ===================== 数据工具 =====================

/**
 * 运营商短名（如「联通」），取自全站唯一数据源 OPERATOR_META。
 *
 * @param spec - 套餐事实。
 * @returns 短名；未知运营商返回「其他」。
 */
function operatorShortLabel(spec: ProductSpec): string {
  return OPERATOR_META[spec.operator]?.shortLabel ?? OPERATOR_META.unknown.shortLabel;
}

/**
 * 规范化导出倍率：非有限数回退 2x，并收敛到 1–4。
 *
 * @param scale - 请求倍率。
 * @returns 可用的倍率。
 */
function normalizeScale(scale: number): number {
  if (!Number.isFinite(scale) || scale <= 0) return 2;
  return Math.min(4, Math.max(1, scale));
}

/**
 * 清洗文件名：去掉 Windows / macOS 都不接受的字符，压缩连续分隔符。
 *
 * @param name - 原始文件名（不含扩展名）。
 * @returns 安全文件名。
 */
function sanitizeFilename(name: string): string {
  const cleaned = name
    .replace(/[:\\/*?"<>|]/g, '-')
    .replace(/\s+/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
  return cleaned || 'poster';
}

/**
 * 生成建议文件名（不含扩展名），形如 `联通-200G-49元-9x16`。
 *
 * 只拼真实存在的数字：没有流量就不写流量段，避免文件名替商品「补」一个不存在的卖点。
 *
 * @param spec - 套餐事实。
 * @param sizeId - 尺寸 id（`9:16` → `9x16`，文件名不能带冒号）。
 * @returns 安全文件名。
 */
function buildFilename(spec: ProductSpec, sizeId: string): string {
  const parts: string[] = [operatorShortLabel(spec)];
  if (spec.flowGb > 0) parts.push(`${spec.flowGb}G`);
  if (spec.monthlyFee > 0) parts.push(`${spec.monthlyFee}元`);
  parts.push(sizeId.replace(/:/g, 'x'));
  return sanitizeFilename(parts.join('-'));
}

/** 核心参数格子 */
interface SpecCell {
  value: string;
  label: string;
  /** 是否用强调色（流量数字） */
  highlight: boolean;
}

/**
 * 生成核心参数格子：只收真实存在的字段。
 *
 * @param spec - 套餐事实。
 * @returns 0–3 个格子（0 个时整块不画）。
 */
function buildSpecCells(spec: ProductSpec): SpecCell[] {
  const cells: SpecCell[] = [];
  if (spec.flowGb > 0) {
    cells.push({ value: `${spec.flowGb}G`, label: '全国通用流量', highlight: true });
  }
  if (spec.voiceMinutes > 0) {
    cells.push({ value: `${spec.voiceMinutes}分钟`, label: '国内通话', highlight: false });
  }
  const contract =
    spec.contractText.trim() || (spec.contractMonths > 0 ? `${spec.contractMonths}个月` : '');
  if (contract) {
    cells.push({ value: contract, label: '合约期', highlight: false });
  }
  return cells;
}

/**
 * 首充说明文案：有首充写金额，没有写「无首充门槛」。
 *
 * @param spec - 套餐事实。
 * @returns 一行说明。
 */
function chargeTextOf(spec: ProductSpec): string {
  return spec.firstCharge > 0 ? `首充${spec.firstCharge}元` : '无首充门槛';
}

// ===================== 二维码 =====================

/**
 * 载入图片（dataURL / blobURL 均可）。
 *
 * @param src - 图片地址。
 * @returns 已解码完成的图片元素。
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('[poster] 二维码图片解码失败'));
    image.src = src;
  });
}

/**
 * 生成并载入二维码。
 *
 * 二维码是异步的（`qrcode` 返回 Promise），Canvas 绘制是同步的，所以必须在排版前
 * `await` 拿到位图；链接为空串时直接返回 null，排版会把这块空间让出去。
 * 编码失败（链接过长、含非法字符）不抛给调用方——一张没有二维码的海报远好过出图失败。
 *
 * @param url - 二维码内容。
 * @returns 二维码图片；空链接或失败时返回 null。
 */
async function loadQrImage(url: string): Promise<HTMLImageElement | null> {
  const text = url.trim();
  if (!text) return null;

  try {
    let dataUrl = qrCache.get(text);
    if (!dataUrl) {
      // margin 单位是「模块数」：4 是 ISO/IEC 18004 要求的最小静区，
      // 设 1 再靠托板留白时实测只有 1.8–2.4 个模块，部分手机扫码会失败
      dataUrl = await QRCode.toDataURL(text, { margin: 4, width: QR_PIXEL_SIZE });
      if (qrCache.size >= QR_CACHE_LIMIT) {
        const oldest = qrCache.keys().next();
        if (!oldest.done) qrCache.delete(oldest.value);
      }
      qrCache.set(text, dataUrl);
    }
    return await loadImage(dataUrl);
  } catch (error) {
    console.warn('[poster] 二维码生成失败，已跳过：', error);
    return null;
  }
}

// ===================== 干跑上下文 =====================

/**
 * 创建一个「只测量、不落笔」的代理上下文。
 *
 * 排版要先知道每个区块多高，再决定它落在哪。若为测量另写一套高度公式，
 * 两套逻辑迟早会走偏（改一处忘一处 → 文字压到二维码上）。这里让测量与绘制
 * **跑同一段代码**：绘制类方法被替换成空函数，`measureText` 与字体状态仍作用于真画布。
 *
 * @param target - 真实 Canvas 上下文。
 * @returns 行为等价、但吞掉所有绘制指令的上下文。
 */
function createMeasureContext(target: CanvasRenderingContext2D): CanvasRenderingContext2D {
  const noop = (): void => undefined;
  return new Proxy(target, {
    get(object, property) {
      if (property === 'measureText') {
        return (text: string) => object.measureText(text);
      }
      if (typeof property === 'string' && NOOP_METHODS.has(property)) return noop;
      const value = Reflect.get(object, property, object);
      return typeof value === 'function' ? value.bind(object) : value;
    },
    set(object, property, value) {
      return Reflect.set(object, property, value, object);
    },
  });
}

// ===================== 绘制上下文 =====================

/** 一次渲染的公共上下文 */
interface PaintContext {
  /** 真实绘制上下文 */
  ctx: CanvasRenderingContext2D;
  /** 干跑上下文（吞掉绘制指令） */
  measureCtx: CanvasRenderingContext2D;
  width: number;
  height: number;
  theme: PosterTheme;
  spec: ProductSpec;
  headline: string;
  subline: string;
  chips: string[];
  footer: string;
  qr: HTMLImageElement | null;
}

/**
 * 在干跑上下文中执行一段排版，拿到它需要的高度。
 *
 * @param pc - 绘制上下文。
 * @param run - 返回该区块高度的绘制函数。
 * @returns 该区块的高度。
 */
function measureWith(pc: PaintContext, run: () => number): number {
  const real = pc.ctx;
  pc.ctx = pc.measureCtx;
  try {
    return run();
  } finally {
    pc.ctx = real;
  }
}

/** 版式区块：已知高度 + 权重 + 落地绘制 */
interface Section {
  height: number;
  /** 该区块之后留白的权重，0 = 紧贴下一块 */
  weight: number;
  draw: (top: number) => void;
}

/**
 * 依次绘制区块，并把剩余高度按权重分配成区块间留白。
 *
 * 这是整套排版「不溢出」的关键：先测高、再分配，而不是硬编码 y 坐标。
 *
 * @param sections - 区块列表。
 * @param top - 内容区顶部。
 * @param bottom - 内容区底部（不含）。
 * @param minGap - 区块间最小间距。
 */
function drawSections(sections: Section[], top: number, bottom: number, minGap: number): void {
  const contentHeight = sections.reduce((sum, section) => sum + section.height, 0);
  const gapCount = Math.max(sections.length - 1, 0);
  const free = bottom - top - contentHeight - minGap * gapCount;
  const weightSum = sections.reduce((sum, section) => sum + section.weight, 0) || 1;

  let cursor = top;
  sections.forEach((section, index) => {
    section.draw(cursor);
    cursor += section.height;
    if (index < sections.length - 1) {
      const extra = free > 0 ? (free * section.weight) / weightSum : 0;
      cursor += minGap + extra;
    }
  });
}

/**
 * 区块总高 + 最小间距：用于判断当前字号系数是否放得下。
 *
 * @param sections - 区块列表。
 * @param minGap - 最小间距。
 * @returns 需要的总高度。
 */
function requiredHeight(sections: Section[], minGap: number): number {
  const contentHeight = sections.reduce((sum, section) => sum + section.height, 0);
  return contentHeight + minGap * Math.max(sections.length - 1, 0);
}

// ===================== 区块绘制 =====================

/**
 * 背景：主渐变 + 克制的装饰（大圆、斜切色块、描边圆环）。
 *
 * 装饰一律低透明度：卡片图的主语是套餐数字，背景只负责把版面「托」起来。
 *
 * @param pc - 绘制上下文。
 */
function paintBackground(pc: PaintContext): void {
  const { ctx, width, height, theme } = pc;

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, theme.bg);
  gradient.addColorStop(1, theme.bgAlt);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const shortSide = Math.min(width, height);

  // 右上大圆：主题强调色，极低透明度，给纯色底一点空气感
  ctx.beginPath();
  ctx.arc(width * 0.94, height * 0.06, shortSide * 0.52, 0, Math.PI * 2);
  ctx.fillStyle = withAlpha(theme.accent, 0.1);
  ctx.fill();

  // 左下斜切色块：把视线往价格区引，同时压住画面下半部分
  ctx.beginPath();
  ctx.moveTo(0, height * 0.8);
  ctx.lineTo(width, height * 0.63);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fillStyle = withAlpha(theme.fg, 0.045);
  ctx.fill();

  // 左下描边圆环：与右上实心圆呼应，只描边不抢戏
  ctx.beginPath();
  ctx.arc(width * 0.1, height * 0.9, shortSide * 0.3, 0, Math.PI * 2);
  ctx.strokeStyle = withAlpha(theme.line, 0.28);
  ctx.lineWidth = Math.max(1, shortSide * 0.004);
  ctx.stroke();
}

/**
 * 顶部品牌条：左侧运营商胶囊，右侧站点名。
 *
 * @param pc - 绘制上下文。
 * @param x - 左边距。
 * @param top - 顶部 y。
 * @param width - 可用宽度。
 * @param unit - 尺寸系数（1 = 540 宽的 9:16 基准）。
 * @param factor - 自适应缩放系数。
 * @returns 区块高度。
 */
function drawBrandBar(
  pc: PaintContext,
  x: number,
  top: number,
  width: number,
  unit: number,
  factor: number
): number {
  const { ctx, theme, spec } = pc;
  const height = 26 * unit * factor;
  const fontSize = 13 * unit * factor;
  const padX = 11 * unit * factor;

  ctx.font = fontOf(fontSize, 600);
  const label = operatorShortLabel(spec);
  const pillWidth = ctx.measureText(label).width + padX * 2;
  const pillHeight = fontSize * 1.9;
  const pillY = top + (height - pillHeight) / 2;

  fillRoundRect(ctx, x, pillY, pillWidth, pillHeight, pillHeight / 2, withAlpha(theme.fg, 0.16));
  ctx.fillStyle = theme.fg;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + pillWidth / 2, pillY + pillHeight / 2 + fontSize * 0.04);

  // 右侧站点名：站点标识，不参与信息层级竞争，用次要色
  ctx.font = fontOf(fontSize * 1.05, 500);
  ctx.fillStyle = theme.fgMuted;
  ctx.textAlign = 'right';
  ctx.fillText('号卡之家', x + width, top + height / 2 + fontSize * 0.04);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  return height;
}

/** 价格区几何：绘制与测量共用，保证两次一致 */
interface PriceLayout {
  height: number;
  numberSize: number;
  markSize: number;
  unitSize: number;
  feeWidth: number;
  markWidth: number;
  accent: string;
  charge: { text: string; fontSize: number; width: number; height: number; x: number; y: number };
}

/**
 * 计算价格区几何。
 *
 * @param ctx - 绘制上下文。
 * @param pc - 渲染上下文。
 * @param x - 左边距。
 * @param width - 可用宽度。
 * @param unit - 尺寸系数。
 * @param factor - 自适应缩放系数。
 * @param compact - 紧凑模式（方图 / 横版用，字号整体小一档）。
 * @returns 价格区几何与总高度。
 */
function layoutPrice(
  ctx: CanvasRenderingContext2D,
  pc: PaintContext,
  x: number,
  width: number,
  unit: number,
  factor: number,
  compact: boolean
): PriceLayout {
  const numberSize = (compact ? 68 : 96) * unit * factor;
  const markSize = numberSize * 0.3;
  const unitSize = numberSize * 0.24;
  const accent = readableAccent(pc.theme.accent, backgroundBase(pc.theme), 4.5);

  ctx.font = fontOf(numberSize, 800);
  const feeWidth = ctx.measureText(`${pc.spec.monthlyFee}`).width;
  ctx.font = fontOf(markSize, 700);
  const markWidth = ctx.measureText('¥').width;
  ctx.font = fontOf(unitSize, 500);
  const perMonthWidth = ctx.measureText('/月').width;

  const blockHeight = numberSize * 1.05;
  const priceWidth = markWidth + feeWidth + perMonthWidth + markSize * 0.4;

  const chargeFontSize = 13 * unit * factor;
  const chargeText = chargeTextOf(pc.spec);
  ctx.font = fontOf(chargeFontSize, 600);
  const chargeWidth = ctx.measureText(chargeText).width + chargeFontSize * 1.6;
  const chargeHeight = chargeFontSize * 1.9;

  const chargeX = x + priceWidth + chargeFontSize * 0.9;
  const chargeBelow = chargeX + chargeWidth > x + width;

  return {
    height: chargeBelow ? blockHeight + chargeHeight + 6 * unit : blockHeight,
    numberSize,
    markSize,
    unitSize,
    feeWidth,
    markWidth,
    accent,
    charge: {
      text: chargeText,
      fontSize: chargeFontSize,
      width: chargeWidth,
      height: chargeHeight,
      x: chargeBelow ? x : chargeX,
      y: chargeBelow ? blockHeight + 6 * unit : blockHeight - chargeHeight,
    },
  };
}

/**
 * 价格区：`¥` 小字 + 月租特大字 + `/月` 小字，旁边（或下方）首充说明。
 *
 * @param pc - 绘制上下文。
 * @param x - 左边距。
 * @param top - 顶部 y。
 * @param width - 可用宽度。
 * @param unit - 尺寸系数。
 * @param factor - 自适应缩放系数。
 * @param compact - 紧凑模式。
 * @returns 区块高度（无真实月租时为 0，整块不画）。
 */
function drawPriceBlock(
  pc: PaintContext,
  x: number,
  top: number,
  width: number,
  unit: number,
  factor: number,
  compact = false
): number {
  // 没有真实月租就整块不画——「¥0/月」是会被平台判虚假宣传的表述
  if (pc.spec.monthlyFee <= 0) return 0;

  const { ctx, theme } = pc;
  const layout = layoutPrice(ctx, pc, x, width, unit, factor, compact);
  const baseline = top + layout.numberSize * 0.82;

  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';

  ctx.font = fontOf(layout.markSize, 700);
  ctx.fillStyle = layout.accent;
  ctx.fillText('¥', x, baseline - layout.numberSize * 0.06);

  ctx.font = fontOf(layout.numberSize, 800);
  ctx.fillText(`${pc.spec.monthlyFee}`, x + layout.markWidth + layout.markSize * 0.08, baseline);

  ctx.font = fontOf(layout.unitSize, 500);
  // 直接用不透明 fg：0.72 透明度在 brand 主题下只有 3.5–4.1:1，低于 AA 4.5:1
  ctx.fillStyle = theme.fg;
  ctx.fillText('/月', x + layout.markWidth + layout.feeWidth + layout.markSize * 0.24, baseline);

  // 首充说明：accent 实底小胶囊（accentFg 深字，5.3–12.2:1，全部达标）
  const charge = layout.charge;
  const chargeY = top + charge.y;
  fillRoundRect(
    ctx,
    charge.x,
    chargeY,
    charge.width,
    charge.height,
    charge.height / 2,
    theme.accent
  );
  ctx.font = fontOf(charge.fontSize, 700);
  ctx.fillStyle = theme.accentFg;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(charge.text, charge.x + charge.width / 2, chargeY + charge.height / 2);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  return layout.height;
}

/**
 * 核心参数格子：等宽排布，值与口径上下两行，格间细分隔线。
 *
 * @param pc - 绘制上下文。
 * @param x - 左边距。
 * @param top - 顶部 y。
 * @param width - 可用宽度。
 * @param unit - 尺寸系数。
 * @param factor - 自适应缩放系数。
 * @param compact - 紧凑模式。
 * @returns 区块高度（无格子时为 0）。
 */
function drawSpecGrid(
  pc: PaintContext,
  x: number,
  top: number,
  width: number,
  unit: number,
  factor: number,
  compact = false
): number {
  const { ctx, theme, spec } = pc;
  const cells = buildSpecCells(spec);
  if (cells.length === 0) return 0;

  const height = (compact ? 62 : 74) * unit * factor;
  fillRoundRect(ctx, x, top, width, height, 16 * unit * factor, withAlpha(theme.card, 0.62));

  const valueSize = (compact ? 26 : 32) * unit * factor;
  const labelSize = (compact ? 10.5 : 12) * unit * factor;
  const cellWidth = width / cells.length;
  const accent = readableAccent(theme.accent, theme.card, 4.5);

  cells.forEach((cell, index) => {
    const centerX = x + cellWidth * (index + 0.5);

    // 分隔线：第一格前面不画
    if (index > 0) {
      ctx.beginPath();
      ctx.moveTo(x + cellWidth * index, top + height * 0.24);
      ctx.lineTo(x + cellWidth * index, top + height * 0.76);
      ctx.strokeStyle = withAlpha(theme.line, 0.5);
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 值：数字单独加粗放大；放不下就缩字号，绝不溢出格子
    const fitted = fitText(ctx, cell.value, {
      maxWidth: cellWidth - 16 * unit,
      maxLines: 1,
      size: valueSize,
      minSize: valueSize * 0.6,
      weight: 800,
    });
    ctx.font = fontOf(fitted.size, 800);
    ctx.fillStyle = cell.highlight ? accent : theme.fg;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(fitted.lines[0], centerX, top + height * 0.56);

    ctx.font = fontOf(labelSize, 500);
    ctx.fillStyle = theme.fgMuted;
    ctx.fillText(cell.label, centerX, top + height * 0.56 + labelSize * 1.7);
  });

  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  return height;
}

/**
 * 卖点 chips：圆角胶囊，按宽度自动换行。
 *
 * @param pc - 绘制上下文。
 * @param x - 左边距。
 * @param top - 顶部 y。
 * @param width - 可用宽度。
 * @param unit - 尺寸系数。
 * @param factor - 自适应缩放系数。
 * @returns 区块高度（无 chips 时为 0）。
 */
function drawChips(
  pc: PaintContext,
  x: number,
  top: number,
  width: number,
  unit: number,
  factor: number
): number {
  const { ctx, theme } = pc;
  const chips = pc.chips.filter((chip) => chip.trim() !== '').slice(0, CHIP_LIMIT);
  if (chips.length === 0) return 0;

  const baseFontSize = 14 * unit * factor;
  const padX = 13 * unit * factor;
  const padY = 7 * unit * factor;
  const gap = 9 * unit * factor;
  const rowHeight = baseFontSize + padY * 2;

  // 先测量再排：单颗胶囊超过整行宽度时先缩字号，缩到底仍放不下就省略号截断
  const maxTextWidth = Math.max(0, width - padX * 2);
  const items = chips.map((chip) => {
    let size = baseFontSize;
    ctx.font = fontOf(size, 600);
    let textWidth = ctx.measureText(chip).width;
    while (textWidth > maxTextWidth && size > baseFontSize * 0.62) {
      size -= 1;
      ctx.font = fontOf(size, 600);
      textWidth = ctx.measureText(chip).width;
    }
    const text = ellipsize(ctx, chip, maxTextWidth);
    return { chip: text, size, textWidth: Math.min(ctx.measureText(text).width, maxTextWidth) };
  });

  let cursorX = x;
  let cursorY = top;
  let rows = 1;

  for (const item of items) {
    const pillWidth = item.textWidth + padX * 2;
    if (cursorX > x && cursorX + pillWidth > x + width) {
      cursorX = x;
      cursorY += rowHeight + gap;
      rows += 1;
    }
    fillRoundRect(
      ctx,
      cursorX,
      cursorY,
      pillWidth,
      rowHeight,
      rowHeight / 2,
      withAlpha(theme.card, 0.7)
    );
    strokeRoundRect(
      ctx,
      cursorX,
      cursorY,
      pillWidth,
      rowHeight,
      rowHeight / 2,
      withAlpha(theme.line, 0.6)
    );

    ctx.font = fontOf(item.size, 600);
    ctx.fillStyle = theme.fg;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.chip, cursorX + padX, cursorY + rowHeight / 2 + item.size * 0.04);

    cursorX += pillWidth + gap;
  }

  ctx.textBaseline = 'top';
  return rows * rowHeight + (rows - 1) * gap;
}

/**
 * 底部：二维码（白底托板）+ 右侧两行说明；无二维码时只留页脚文字。
 *
 * @param pc - 绘制上下文。
 * @param x - 左边距。
 * @param top - 顶部 y。
 * @param width - 可用宽度。
 * @param unit - 尺寸系数。
 * @param factor - 自适应缩放系数。
 * @param qrSize - 二维码边长（逻辑 px）。
 * @returns 区块高度。
 */
function drawFooterBlock(
  pc: PaintContext,
  x: number,
  top: number,
  width: number,
  unit: number,
  factor: number,
  qrSize: number
): number {
  const { ctx, theme, qr, footer } = pc;
  const footerText = footer.trim();

  if (!qr) {
    // 没有二维码：页脚独占整行，不编造「扫码办理」这类落不到的指令
    const fitted = fitText(ctx, footerText, {
      maxWidth: width,
      maxLines: 2,
      size: 13 * unit * factor,
      weight: 400,
      lineHeight: 1.45,
    });
    drawFitted(ctx, fitted, x, top, theme.fgMuted);
    return fitted.height;
  }

  const platePad = 6 * unit * factor;
  const plateSize = qrSize + platePad * 2;
  fillRoundRect(ctx, x, top, plateSize, plateSize, 12 * unit * factor, '#FFFFFF');
  ctx.drawImage(qr, x + platePad, top + platePad, qrSize, qrSize);

  const textX = x + plateSize + 16 * unit * factor;
  const textWidth = Math.max(0, width - (textX - x));
  const ctaSize = 15 * unit * factor;
  const ctaText = '扫码办理 · 详情页查看';

  ctx.font = fontOf(ctaSize, 700);
  const ctaWidth = ctx.measureText(ctaText).width;
  // 放不下就等比缩字号，仍放不下交给 fitText 省略——绝不压到二维码上
  const ctaFitSize =
    ctaWidth > textWidth && ctaWidth > 0
      ? Math.max(11 * unit, (textWidth / ctaWidth) * ctaSize)
      : ctaSize;
  const ctaHeight = ctaFitSize * 1.2;

  const footerFitted = fitText(ctx, footerText, {
    maxWidth: textWidth,
    maxLines: 2,
    size: 12 * unit * factor,
    weight: 400,
    lineHeight: 1.45,
  });

  const textHeight = ctaHeight + 6 * unit + footerFitted.height;
  const textTop = top + Math.max(0, (plateSize - textHeight) / 2);

  ctx.font = fontOf(ctaFitSize, 700);
  ctx.fillStyle = theme.fg;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(ctaText, textX, textTop);
  drawFitted(ctx, footerFitted, textX, textTop + ctaHeight + 6 * unit, theme.fgMuted);

  return Math.max(plateSize, textHeight);
}

// ===================== 三种版式 =====================

/**
 * 竖版（9:16 / 3:4）：品牌条 → 标题 → 副标题 → 价格 → 三宫格 → chips → 底部。
 *
 * @param pc - 绘制上下文。
 */
function paintVertical(pc: PaintContext): void {
  const { width, height } = pc;
  const unit = width / 540;
  const pad = Math.round(40 * unit);
  const innerWidth = width - pad * 2;
  const minGap = 12 * unit;
  const qrSize = 96 * unit;

  const build = (factor: number): Section[] => {
    const sections: Section[] = [];

    const brandHeight = measureWith(pc, () => drawBrandBar(pc, pad, 0, innerWidth, unit, factor));
    sections.push({
      height: brandHeight,
      weight: 1,
      draw: (top) => {
        drawBrandBar(pc, pad, top, innerWidth, unit, factor);
      },
    });

    const headline = fitText(pc.ctx, pc.headline, {
      maxWidth: innerWidth,
      maxLines: 3,
      size: 40 * unit * factor,
      minSize: 26 * unit,
      weight: 800,
      lineHeight: 1.25,
    });
    sections.push({
      height: headline.height,
      weight: 1.6,
      draw: (top) => {
        drawFitted(pc.ctx, headline, pad, top, pc.theme.fg, 800);
      },
    });

    const subline = fitText(pc.ctx, pc.subline, {
      maxWidth: innerWidth,
      maxLines: 2,
      size: 19 * unit * factor,
      minSize: 13 * unit,
      weight: 500,
      lineHeight: 1.45,
    });
    if (subline.height > 0) {
      sections.push({
        height: subline.height,
        weight: 1.2,
        draw: (top) => {
          drawFitted(pc.ctx, subline, pad, top, pc.theme.fgMuted, 500);
        },
      });
    }

    const priceHeight = measureWith(pc, () =>
      drawPriceBlock(pc, pad, 0, innerWidth, unit, factor)
    );
    if (priceHeight > 0) {
      sections.push({
        height: priceHeight,
        weight: 1.5,
        draw: (top) => {
          drawPriceBlock(pc, pad, top, innerWidth, unit, factor);
        },
      });
    }

    const specHeight = measureWith(pc, () => drawSpecGrid(pc, pad, 0, innerWidth, unit, factor));
    if (specHeight > 0) {
      sections.push({
        height: specHeight,
        weight: 1.2,
        draw: (top) => {
          drawSpecGrid(pc, pad, top, innerWidth, unit, factor);
        },
      });
    }

    const chipHeight = measureWith(pc, () => drawChips(pc, pad, 0, innerWidth, unit, factor));
    if (chipHeight > 0) {
      sections.push({
        height: chipHeight,
        weight: 1,
        draw: (top) => {
          drawChips(pc, pad, top, innerWidth, unit, factor);
        },
      });
    }

    const footerHeight = measureWith(pc, () =>
      drawFooterBlock(pc, pad, 0, innerWidth, unit, factor, qrSize)
    );
    if (footerHeight > 0) {
      sections.push({
        height: footerHeight,
        weight: 0,
        draw: (top) => {
          drawFooterBlock(pc, pad, top, innerWidth, unit, factor, qrSize);
        },
      });
    }

    return sections;
  };

  const available = height - pad * 2;
  let sections = build(1);
  for (const factor of FIT_FACTORS) {
    const candidate = build(factor);
    sections = candidate;
    if (requiredHeight(candidate, minGap) <= available) break;
  }

  paintBackground(pc);
  drawSections(sections, pad, height - pad, minGap);
}

/**
 * 横版（16:9）：左 62% 文字区，右 38% 二维码卡片。
 *
 * @param pc - 绘制上下文。
 */
function paintHorizontal(pc: PaintContext): void {
  const { width, height } = pc;
  const unit = Math.min(width / 960, height / 540);
  const pad = Math.round(40 * unit);
  const hasQr = pc.qr !== null;
  const innerWidth = width - pad * 2;

  // 右侧卡片占内容宽度的 34%，剩下的给文字列（约 62%），中间留一个 pad 作间隔
  const cardWidth = hasQr ? Math.round(innerWidth * 0.34) : 0;
  const leftWidth = hasQr ? innerWidth - cardWidth - pad : innerWidth;
  const minGap = 12 * unit;

  const build = (factor: number): Section[] => {
    const sections: Section[] = [];

    const brandHeight = measureWith(pc, () =>
      drawBrandBar(pc, pad, 0, leftWidth, unit, factor)
    );
    sections.push({
      height: brandHeight,
      weight: 0.8,
      draw: (top) => {
        drawBrandBar(pc, pad, top, leftWidth, unit, factor);
      },
    });

    const headline = fitText(pc.ctx, pc.headline, {
      maxWidth: leftWidth,
      maxLines: 3,
      size: 38 * unit * factor,
      minSize: 22 * unit,
      weight: 800,
      lineHeight: 1.22,
    });
    sections.push({
      height: headline.height,
      weight: 1.6,
      draw: (top) => {
        drawFitted(pc.ctx, headline, pad, top, pc.theme.fg, 800);
      },
    });

    const subline = fitText(pc.ctx, pc.subline, {
      maxWidth: leftWidth,
      maxLines: 2,
      size: 17 * unit * factor,
      minSize: 12 * unit,
      weight: 500,
      lineHeight: 1.4,
    });
    if (subline.height > 0) {
      sections.push({
        height: subline.height,
        weight: 1,
        draw: (top) => {
          drawFitted(pc.ctx, subline, pad, top, pc.theme.fgMuted, 500);
        },
      });
    }

    const priceHeight = measureWith(pc, () =>
      drawPriceBlock(pc, pad, 0, leftWidth, unit, factor, true)
    );
    if (priceHeight > 0) {
      sections.push({
        height: priceHeight,
        weight: 1.2,
        draw: (top) => {
          drawPriceBlock(pc, pad, top, leftWidth, unit, factor, true);
        },
      });
    }

    const specHeight = measureWith(pc, () =>
      drawSpecGrid(pc, pad, 0, leftWidth, unit, factor, true)
    );
    if (specHeight > 0) {
      sections.push({
        height: specHeight,
        weight: 1,
        draw: (top) => {
          drawSpecGrid(pc, pad, top, leftWidth, unit, factor, true);
        },
      });
    }

    const chipHeight = measureWith(pc, () => drawChips(pc, pad, 0, leftWidth, unit, factor));
    if (chipHeight > 0) {
      sections.push({
        height: chipHeight,
        weight: 0.8,
        draw: (top) => {
          drawChips(pc, pad, top, leftWidth, unit, factor);
        },
      });
    }

    // 无二维码时页脚落在左侧文字列的最后
    if (!hasQr) {
      const footerFitted = fitText(pc.ctx, pc.footer, {
        maxWidth: leftWidth,
        maxLines: 1,
        size: 12 * unit * factor,
        weight: 400,
      });
      if (footerFitted.height > 0) {
        sections.push({
          height: footerFitted.height,
          weight: 0,
          draw: (top) => {
            drawFitted(pc.ctx, footerFitted, pad, top, pc.theme.fgMuted);
          },
        });
      }
    }

    return sections;
  };

  const available = height - pad * 2;
  let sections = build(1);
  for (const factor of FIT_FACTORS) {
    const candidate = build(factor);
    sections = candidate;
    if (requiredHeight(candidate, minGap) <= available) break;
  }

  paintBackground(pc);
  drawSections(sections, pad, height - pad, minGap);

  if (!hasQr) return;

  // ===== 右侧二维码卡片 =====
  const { ctx, theme } = pc;
  const cardX = width - pad - cardWidth;
  const cardY = pad;
  const cardH = height - pad * 2;
  const radius = 20 * unit;

  fillRoundRect(ctx, cardX, cardY, cardWidth, cardH, radius, withAlpha(theme.card, 0.9));
  strokeRoundRect(ctx, cardX, cardY, cardWidth, cardH, radius, withAlpha(theme.line, 0.5));

  const innerPad = 18 * unit;
  const qrSize = Math.min(cardWidth - innerPad * 2, 168 * unit);
  const plateSize = qrSize + 12 * unit;
  const plateX = cardX + (cardWidth - plateSize) / 2;
  const plateY = cardY + innerPad + 26 * unit;

  ctx.font = fontOf(13 * unit, 600);
  ctx.fillStyle = theme.fgMuted;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('扫码查看套餐详情', cardX + cardWidth / 2, cardY + innerPad);

  fillRoundRect(ctx, plateX, plateY, plateSize, plateSize, 12 * unit, '#FFFFFF');
  if (pc.qr) ctx.drawImage(pc.qr, plateX + 6 * unit, plateY + 6 * unit, qrSize, qrSize);

  // 落款：站点名 + 页脚合规说明
  const footerTop = plateY + plateSize + 20 * unit;
  ctx.font = fontOf(16 * unit, 700);
  ctx.fillStyle = theme.fg;
  ctx.fillText('号卡之家', cardX + cardWidth / 2, footerTop);

  const footerFitted = fitText(ctx, pc.footer, {
    maxWidth: cardWidth - innerPad * 2,
    maxLines: 3,
    size: 11.5 * unit,
    weight: 400,
    lineHeight: 1.5,
  });
  footerFitted.lines.forEach((line, index) => {
    ctx.font = fontOf(footerFitted.size, 400);
    ctx.fillStyle = theme.fgMuted;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(
      line,
      cardX + cardWidth / 2,
      footerTop + 22 * unit + index * footerFitted.lineHeight
    );
  });

  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
}

/**
 * 方图（1:1 / 4:3）：居中浅色卡片，上标题、中价格、下 chips + 二维码。
 *
 * @param pc - 绘制上下文。
 */
function paintSquare(pc: PaintContext): void {
  const { width, height } = pc;
  const unit = Math.min(width, height) / 640;
  const inset = 22 * unit;
  const cardX = inset;
  const cardY = inset;
  const cardW = width - inset * 2;
  const cardH = height - inset * 2;
  const cardRadius = 26 * unit;

  const pad = 30 * unit;
  const innerX = cardX + pad;
  const innerWidth = cardW - pad * 2;
  const minGap = 10 * unit;
  const qrSize = 84 * unit;

  const build = (factor: number): Section[] => {
    const sections: Section[] = [];

    const brandHeight = measureWith(pc, () =>
      drawBrandBar(pc, innerX, 0, innerWidth, unit, factor)
    );
    sections.push({
      height: brandHeight,
      weight: 0.6,
      draw: (top) => {
        drawBrandBar(pc, innerX, top, innerWidth, unit, factor);
      },
    });

    const headline = fitText(pc.ctx, pc.headline, {
      maxWidth: innerWidth,
      maxLines: 2,
      size: 32 * unit * factor,
      minSize: 19 * unit,
      weight: 800,
      lineHeight: 1.24,
    });
    sections.push({
      height: headline.height,
      weight: 1.4,
      draw: (top) => {
        drawFitted(pc.ctx, headline, innerX, top, pc.theme.fg, 800);
      },
    });

    const subline = fitText(pc.ctx, pc.subline, {
      maxWidth: innerWidth,
      maxLines: 1,
      size: 15 * unit * factor,
      minSize: 11 * unit,
      weight: 500,
    });
    if (subline.height > 0) {
      sections.push({
        height: subline.height,
        weight: 1,
        draw: (top) => {
          drawFitted(pc.ctx, subline, innerX, top, pc.theme.fgMuted, 500);
        },
      });
    }

    const priceHeight = measureWith(pc, () =>
      drawPriceBlock(pc, innerX, 0, innerWidth, unit, factor, true)
    );
    if (priceHeight > 0) {
      sections.push({
        height: priceHeight,
        weight: 1.2,
        draw: (top) => {
          drawPriceBlock(pc, innerX, top, innerWidth, unit, factor, true);
        },
      });
    }

    const specHeight = measureWith(pc, () =>
      drawSpecGrid(pc, innerX, 0, innerWidth, unit, factor, true)
    );
    if (specHeight > 0) {
      sections.push({
        height: specHeight,
        weight: 1,
        draw: (top) => {
          drawSpecGrid(pc, innerX, top, innerWidth, unit, factor, true);
        },
      });
    }

    const chipHeight = measureWith(pc, () => drawChips(pc, innerX, 0, innerWidth, unit, factor));
    if (chipHeight > 0) {
      sections.push({
        height: chipHeight,
        weight: 0.8,
        draw: (top) => {
          drawChips(pc, innerX, top, innerWidth, unit, factor);
        },
      });
    }

    const footerHeight = measureWith(pc, () =>
      drawFooterBlock(pc, innerX, 0, innerWidth, unit, factor, qrSize)
    );
    if (footerHeight > 0) {
      sections.push({
        height: footerHeight,
        weight: 0,
        draw: (top) => {
          drawFooterBlock(pc, innerX, top, innerWidth, unit, factor, qrSize);
        },
      });
    }

    return sections;
  };

  paintBackground(pc);
  fillRoundRect(pc.ctx, cardX, cardY, cardW, cardH, cardRadius, withAlpha(pc.theme.card, 0.94));
  strokeRoundRect(
    pc.ctx,
    cardX,
    cardY,
    cardW,
    cardH,
    cardRadius,
    withAlpha(pc.theme.line, 0.45)
  );

  const available = cardH - pad * 2;
  let sections = build(1);
  for (const factor of FIT_FACTORS) {
    const candidate = build(factor);
    sections = candidate;
    if (requiredHeight(candidate, minGap) <= available) break;
  }
  drawSections(sections, cardY + pad, cardY + cardH - pad, minGap);
}

// ===================== 对外 API =====================

/**
 * 渲染一张推广卡片图。
 *
 * 流程：取尺寸 / 主题 → 按 scale 建画布并 `ctx.scale` → 生成二维码位图（异步，必须先 await）
 * → 按宽高比选版式 → 全部按逻辑 px 绘制。
 *
 * @param req - 出图请求（套餐事实、尺寸、主题、文案、二维码链接、倍率）。
 * @returns 画布与建议文件名；画布尺寸为逻辑尺寸 × scale 的实际像素。
 * @throws 浏览器不支持 Canvas 2D 时抛出错误。
 */
export async function renderPoster(req: PosterRequest): Promise<PosterResult> {
  const size = getPosterSize(req.size);
  const theme = getPosterTheme(req.theme);
  const scale = normalizeScale(req.scale);

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(size.width * scale);
  canvas.height = Math.round(size.height * scale);

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('[poster] 当前环境不支持 Canvas 2D，无法生成卡片图');

  // 分别算 x / y 缩放：整数倍率时两者相同，非整数倍率也能恰好铺满画布
  ctx.scale(canvas.width / size.width, canvas.height / size.height);
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';

  const qr = await loadQrImage(req.qrUrl);
  const spec = req.spec;
  const headline = req.headline.trim() || spec.name.trim() || spec.rawTitle.trim() || '流量卡套餐';

  const pc: PaintContext = {
    ctx,
    measureCtx: createMeasureContext(ctx),
    width: size.width,
    height: size.height,
    theme,
    spec,
    headline,
    subline: req.subline.trim(),
    chips: req.chips,
    footer: req.footer,
    qr,
  };

  // 版式选择：16:9 走横版；其余按宽高比——竖的走竖版，方 / 横的走方图版式
  if (size.id === '16:9') {
    paintHorizontal(pc);
  } else if (size.width / size.height < 1) {
    paintVertical(pc);
  } else {
    paintSquare(pc);
  }

  return {
    canvas,
    width: canvas.width,
    height: canvas.height,
    filename: buildFilename(spec, size.id),
  };
}

/**
 * 把画布导出为 Blob。
 *
 * @param canvas - 已渲染的画布。
 * @param format - `png`（默认，无损）或 `jpeg`（体积小，适合微信发送）。
 * @param quality - JPEG 质量 0–1，默认 0.92；PNG 忽略该参数。
 * @returns 图片 Blob。
 * @throws 画布被跨域污染或编码失败时抛出错误。
 */
export function toBlob(
  canvas: HTMLCanvasElement,
  format: 'png' | 'jpeg' = 'png',
  quality?: number
): Promise<Blob> {
  const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
  const safeQuality = Math.min(1, Math.max(0.1, quality ?? 0.92));

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('[poster] 画布编码失败，可能是跨域图片污染了 canvas'));
      },
      mime,
      format === 'jpeg' ? safeQuality : undefined
    );
  });
}

/**
 * 触发浏览器下载。
 *
 * @param result - `renderPoster` 的返回值。
 * @param format - 下载格式，默认 png；扩展名随之变化。
 * @returns 下载开始后 resolve（是否真正落盘由用户代理决定）。
 */
export async function downloadPoster(
  result: PosterResult,
  format: 'png' | 'jpeg' = 'png'
): Promise<void> {
  const blob = await toBlob(result.canvas, format);
  const extension = format === 'jpeg' ? 'jpg' : 'png';
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `${result.filename}.${extension}`;
  link.rel = 'noopener';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();

  // 立刻 revoke 会让 Safari 的下载中断，延后释放；期间 blob 由 URL 引用保持存活
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}
