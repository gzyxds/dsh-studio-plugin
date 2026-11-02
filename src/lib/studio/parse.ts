/**
 * 推广创作台 · 上游商品文案解析
 *
 * 输入是运营从上游平台（172号卡 / 卡世界 / 浩卡联盟 …）整段复制的商品文案，版式极脏：
 * 既有 `字段名：值` 的单行写法，也有 `字段名` 换行再跟值，正文里还混着
 * 「0.15元/分钟」「5元/GB」「首充200元」等大量与月租无关的数字。
 *
 * 因此本模块不用一条贪婪正则硬啃全文，而是：
 * 1. 先按「标签行 + 值块」把文案切成 section（上游文案的主体结构就是 KV）；
 * 2. 再从 section 与自由文本里分别取字段，取不到的留 0 / 空串。
 *
 * 纪律：解析不到就留空，绝不猜。流量卡宣传写错数字是要被平台处罚的。
 */
import { detectOperator, type OperatorKey } from '../../data/config/operators.ts';
import { normalizeDuration } from '../../utils/parse.ts';
import type { CardForm, ParseResult, ProductSpec } from './types.ts';

// ===================== 一、结构切分 =====================

/** 上游文案里的字段名，按长度倒序匹配，避免「激活方式」抢在「激活流程图」之前命中 */
const SECTION_LABELS: readonly string[] = [
  '产品套餐',
  '套餐内容',
  '套餐详情',
  '套餐资费',
  '资费说明',
  '优惠详情',
  '优惠期',
  '有效期',
  '套餐有效期',
  '快递方式',
  '激活方式',
  '激活流程图',
  '充值链接',
  '办卡年龄',
  '年龄限制',
  '合约期',
  '合约期限',
  '不发货地区',
  '发货地区',
  '可发地区',
  '归属地',
  '定向范围',
  '定向流量',
  '通用流量',
  '温馨提示',
  '注意事项',
  '复机及注销方式',
  '首月政策',
  '办理方式',
  '选号方式',
  '套餐外资费',
].sort((a, b) => b.length - a.length);

/** 上游文案里的抓取时间戳行（如「172号卡2026/11/2 17:25:06」），纯噪音，不参与解析 */
const TIMESTAMP_LINE_PATTERN = /^\S{0,12}?\d{4}\s*[/-]\s*\d{1,2}\s*[/-]\s*\d{1,2}\s+\d{1,2}:\d{2}/;

/** 切分后的一个字段块 */
interface Section {
  /** 字段名（与 SECTION_LABELS 中的原文一致） */
  label: string;
  /** 该字段的值块（多行以 `\n` 连接，已 trim，可能为空串） */
  value: string;
}

/** 结构切分结果 */
interface SplitResult {
  /** 首个非空行，即商品标题原文 */
  titleLine: string;
  sections: Section[];
  /** 未能归入任何 section 的原文行 */
  leftovers: string[];
}

/**
 * 判断一行是否为字段名，并取出同行值（`合约期 12个月` 这类空格写法也认）。
 *
 * @param line - 已 trim 的原文行。
 * @returns 命中的字段名与同行值；不是字段行时返回 `null`。
 */
function parseLabelLine(line: string): { label: string; inline: string } | null {
  const colonMatch = line.match(/^([^：:]{2,12})[：:]\s*(.*)$/);
  if (colonMatch) {
    const label = colonMatch[1].trim();
    if (SECTION_LABELS.includes(label)) return { label, inline: colonMatch[2].trim() };
  }

  const bare = line.replace(/[：:]\s*$/, '').trim();
  if (SECTION_LABELS.includes(bare)) return { label: bare, inline: '' };

  const spaced = line.match(/^(\S{2,12})\s+(\S.*)$/);
  if (spaced && SECTION_LABELS.includes(spaced[1])) {
    return { label: spaced[1], inline: spaced[2].trim() };
  }
  return null;
}

/**
 * 判断首行是「字段行」还是「商品标题」。
 *
 * 标题里通常没有冒号（`【实体卡】重庆联通49元200G`）；带 `字段：值` 冒号、
 * 或字段名后跟空格的（`发货地区 全国`），几乎都是字段行，不能当标题吞掉。
 *
 * @param line - 首个非空行（已 trim）。
 * @returns 是否像字段行。
 */
function isFieldLine(line: string): boolean {
  if (parseLabelLine(line)) return true;
  const colon = line.match(/^([^：:]{2,12})[：:]/);
  if (!colon) return false;
  return /月租|月费|首充|充值|流量|通话|短信|资费|年龄|合约|发货|归属地|激活|快递|优惠|有效期|办理|选号|温馨提示/.test(
    colon[1]
  );
}

/**
 * 把整段文案切成「标题 + 若干字段块 + 剩余行」。
 *
 * 值块的边界是「下一个字段行」，因此 `产品套餐` 下面连续几段自由描述会整体归入
 * 该字段，这正是上游文案的实际结构，也保证自由文本不会污染其它字段。
 *
 * @param text - 上游原文。
 * @returns 标题行、字段块与剩余行。
 */
function splitSections(text: string): SplitResult {
  const lines = text.split(/\r?\n/).map((line) => line.trim());
  const firstIndex = lines.findIndex((line) => line !== '');
  const firstLine = firstIndex >= 0 ? lines[firstIndex] : '';

  // 首行不一定都是标题：`发货地区：全国`、`月租：19元` 这类字段行若被当标题吞掉，
  // 字段会整块消失（甚至把「不发货地区」当成标题，导致发货范围解析成空）。
  const titleLike =
    firstLine !== '' && !TIMESTAMP_LINE_PATTERN.test(firstLine) && !isFieldLine(firstLine);
  const titleIndex = titleLike ? firstIndex : -1;
  const titleLine = titleLike ? firstLine : '';

  const consumed = new Set<number>();
  if (titleIndex >= 0) consumed.add(titleIndex);

  const marks: Array<{ index: number; label: string; inline: string }> = [];
  lines.forEach((line, index) => {
    if (!line || consumed.has(index)) return;
    if (TIMESTAMP_LINE_PATTERN.test(line)) {
      consumed.add(index);
      return;
    }
    const parsed = parseLabelLine(line);
    if (parsed) marks.push({ index, label: parsed.label, inline: parsed.inline });
  });

  const sections: Section[] = [];
  marks.forEach((mark, order) => {
    consumed.add(mark.index);
    const next = marks[order + 1];
    const end = next ? next.index : lines.length;
    const block: string[] = [];
    if (mark.inline) block.push(mark.inline);
    for (let i = mark.index + 1; i < end; i += 1) {
      const line = lines[i];
      if (!line) continue;
      consumed.add(i);
      if (TIMESTAMP_LINE_PATTERN.test(line)) continue;
      block.push(line);
    }
    sections.push({ label: mark.label, value: block.join('\n').trim() });
  });

  const leftovers: string[] = [];
  lines.forEach((line, index) => {
    if (!line || consumed.has(index)) return;
    leftovers.push(line);
  });

  return { titleLine, sections, leftovers };
}

/**
 * 按字段名取值块。
 *
 * @param sections - 切分结果。
 * @param labels - 候选字段名，按优先级排列。
 * @returns 首个命中的值块；未命中返回空串。
 */
function findSection(sections: Section[], labels: readonly string[]): string {
  for (const label of labels) {
    const hit = sections.find((section) => section.label === label);
    if (hit && hit.value) return hit.value;
  }
  return '';
}

// ===================== 二、单字段取值 =====================

/** 月租候选：按可信度从高到低，先命中先返回，全部是「月租」语境而非任意「N元」 */
const MONTHLY_FEE_PATTERNS: readonly RegExp[] = [
  /(\d+(?:\.\d+)?)\s*元\s*月租/,
  /月租\s*[：:]?\s*(?:是|为|仅|只要|只需)?\s*(\d+(?:\.\d+)?)\s*元/,
  /每月\s*[：:]?\s*(\d+(?:\.\d+)?)\s*元/,
  /月费\s*[：:]?\s*(?:是|为|仅|只要|只需)?\s*(\d+(?:\.\d+)?)\s*元/,
  /(\d+(?:\.\d+)?)\s*元\s*\/\s*月/,
  /(\d+(?:\.\d+)?)\s*元\s*包月/,
  // 有些文案写「56/月500M」，金额后不跟「元」
  /(\d+(?:\.\d+)?)\s*\/\s*月/,
];

/**
 * 判断一个数字是否可能是月租。
 *
 * 排除 0 与异常大值：正文里的「0.15元/分钟」「5元/GB」「200元首充」都会被这条挡掉。
 *
 * @param value - 待判断数值。
 * @returns 是否可信。
 */
function isPlausibleFee(value: number): boolean {
  return Number.isFinite(value) && value >= 1 && value <= 999;
}

/**
 * 从标题里取「49元 + 200G」这种组合中的月租。
 *
 * 单独出现「49元」不足以判定（可能是首充），必须同时出现流量额度才认。
 *
 * @param titleLine - 标题原文。
 * @returns 月租；不满足组合条件返回 0。
 */
function feeFromTitle(titleLine: string): number {
  const flowHit = titleLine.match(/(\d+(?:\.\d+)?)\s*(?:GB|G)(?![A-Za-z])/i);
  if (!flowHit) return 0;
  // 「原价39元/月，现价19元/月，含100G」这种标题里，第一个 N元 是划掉的旧价
  for (const match of titleLine.matchAll(/(\d+(?:\.\d+)?)\s*元/g)) {
    const index = match.index ?? 0;
    const before = titleLine.slice(Math.max(0, index - 4), index);
    if (/原价|首月|首充|充值|预存|赠送|折合|每天|日均|平均/.test(before)) continue;
    const value = Number(match[1]);
    if (isPlausibleFee(value)) return value;
  }
  return 0;
}

/**
 * 取真实月租。
 *
 * 优先级：显式月租表述 → 标题「N元 + NG」组合 → 「产品套餐：49元200G」。
 * 绝不取套餐外单价（元/分钟、元/条、元/GB）与首充金额。
 *
 * @param text - 全文。
 * @param sections - 切分结果。
 * @param titleLine - 标题原文。
 * @returns 月租（元/月）；未解析到返回 0。
 */
function pickMonthlyFee(text: string, sections: Section[], titleLine: string): number {
  for (const pattern of MONTHLY_FEE_PATTERNS) {
    // 同一句式可能先出现「原价 39 元/月」再出现「现价 19 元/月」，
    // 不能取首个命中；带原价 / 首月 / 赠费 / 加装语境的金额一律跳过。
    for (const match of text.matchAll(new RegExp(pattern.source, 'g'))) {
      const index = match.index ?? 0;
      const value = Number(match[1]);
      if (!isPlausibleFee(value)) continue;
      // 只看紧邻的 4 个字符：窗口太长会把上一句的「原价」带进来，导致现价被误跳过
      const before = text.slice(Math.max(0, index - 4), index);
      if (/原价|首月|首充|充值|预存|赠送|折合|每天|日均|平均|\+\s*$/.test(before)) continue;
      return value;
    }
  }

  const fromTitle = feeFromTitle(titleLine);
  if (fromTitle > 0) return fromTitle;

  const plan = findSection(sections, ['产品套餐', '套餐内容', '套餐详情', '套餐资费']);
  if (plan) {
    // 套餐段里第一个「N元」可能是首充 / 预存 / 赠送金额，必须按所在分句排除，
    // 否则「产品套餐：200G通用流量/通话300分钟/首充200元」会把月租解析成 200。
    for (const match of plan.matchAll(/(\d+(?:\.\d+)?)\s*元/g)) {
      const index = match.index ?? 0;
      const clause = plan.slice(Math.max(0, index - 12), index + match[0].length + 6);
      if (/首充|充值|预存|赠送|话费|返/.test(clause)) continue;
      const value = Number(match[1]);
      if (isPlausibleFee(value)) return value;
    }
  }
  return 0;
}

/** 流量 token：`200G` / `200GB`，后面紧跟字母的（如 `5GHz`）不算 */
const FLOW_TOKEN_PATTERN = /(\d+(?:\.\d+)?)\s*(?:GB|G)(?![A-Za-z])/gi;

/** 流量解析结果 */
interface FlowPick {
  general: number;
  directional: number;
}

/**
 * 取通用流量与定向流量。
 *
 * 排除两类干扰：`5元/GB` 这类套餐外单价、`5G网络 / 5G流量卡` 这类制式标识。
 * 「200G全国通用流量」优先计入通用，其余不带定语的额度作为通用兜底。
 *
 * @param text - 全文。
 * @returns 通用流量与定向流量（GB），未命中均为 0。
 */
function pickFlow(text: string): FlowPick {
  let general = 0;
  let directional = 0;
  let neutral = 0;

  for (const match of text.matchAll(FLOW_TOKEN_PATTERN)) {
    const index = match.index ?? 0;
    // 只在本行内看上下文：跨行的 `\s*` 会把下一行的「定向流量」当成当前额度的定语，
    // 出现「19元100G\n定向流量30G」被解析成通用 30G、定向 100G 的反转。
    const lineStart = text.lastIndexOf('\n', index - 1) + 1;
    const nextBreak = text.indexOf('\n', index);
    const lineEnd = nextBreak === -1 ? text.length : nextBreak;
    const before = text.slice(Math.max(lineStart, index - 12), index);
    if (/元\s*\/\s*$/.test(before)) continue;

    const after = text.slice(index + match[0].length, Math.min(lineEnd, index + match[0].length + 10));
    if (/^\s*(?:流量卡|网络|全网通|手机|套餐|信号)/.test(after)) continue;

    const value = Number(match[1]);
    if (!Number.isFinite(value) || value <= 0) continue;

    // 「定向流量30G」的定语在数字前面，「30G定向」的在后面，两种都要认
    if (/^\s*(?:定向|专属)/.test(after) || /(?:定向|专属)(?:流量)?\s*$/.test(before)) {
      directional = Math.max(directional, value);
    } else if (
      /^\s*(?:全国)?通用|^\s*全国/.test(after) ||
      /(?:全国)?通用(?:流量)?\s*$/.test(before) ||
      /全国\s*$/.test(before)
    ) {
      general = Math.max(general, value);
    } else {
      neutral = Math.max(neutral, value);
    }
  }

  return { general: general || neutral, directional };
}

/**
 * 取套餐内通话分钟数。
 *
 * 排除「0.15元/分钟」这类套餐外单价：数字前面紧跟「元/」的跳过。
 *
 * @param text - 全文。
 * @returns 分钟数；未命中返回 0。
 */
function pickVoiceMinutes(text: string): number {
  for (const match of text.matchAll(/(\d{1,6})\s*分钟/g)) {
    const index = match.index ?? 0;
    const before = text.slice(Math.max(0, index - 10), index);
    if (/元\s*\/\s*$/.test(before)) continue;
    const value = Number(match[1]);
    if (value > 0 && value <= 100_000) return value;
  }
  return 0;
}

/** 首充候选：优先「首充」，其次「充值」；金额区间单独校验 */
const FIRST_CHARGE_PATTERNS: readonly RegExp[] = [
  /首充\s*[：:]?\s*(\d+(?:\.\d+)?)\s*元/,
  /(\d+(?:\.\d+)?)\s*元\s*首充/,
  /首充\s*[：:]?\s*(\d+(?:\.\d+)?)/,
  /(?:激活|务必|需|须)?充值\s*[：:]?\s*(\d+(?:\.\d+)?)\s*元/,
  /充值\s*[：:]?\s*(\d+(?:\.\d+)?)/,
];

/**
 * 取激活首充金额。
 *
 * @param text - 全文。
 * @returns 首充金额（元）；无门槛或未命中返回 0。
 */
function pickFirstCharge(text: string): number {
  for (const pattern of FIRST_CHARGE_PATTERNS) {
    const hit = text.match(pattern);
    const value = hit ? Number(hit[1]) : 0;
    if (Number.isFinite(value) && value >= 1 && value <= 10_000) return value;
  }
  return 0;
}

/** 首月政策白名单，只认这些确定说法，其余一律留空 */
const FIRST_MONTH_PATTERN =
  /首月\s*(按天折算|按天计费|按天扣费|免月租|免费使用|半价|照常计费|全月全价|按自然月)/;

/**
 * 取首月政策原文。
 *
 * @param text - 全文。
 * @returns 归一化后的首月政策（如「按天折算」）；未命中返回空串。
 */
function pickFirstMonth(text: string): string {
  const hit = text.match(FIRST_MONTH_PATTERN);
  return hit ? hit[1] : '';
}

/**
 * 取合约期。
 *
 * 只从「合约期」字段取值，避免把「优惠期12个月」误当合约期。
 *
 * @param text - 全文。
 * @param sections - 切分结果。
 * @returns 合约月数与展示文案；未标注返回 0 与空串。
 */
function pickContract(text: string, sections: Section[]): { months: number; text: string } {
  const section = findSection(sections, ['合约期', '合约期限']);
  const raw = section.split('\n')[0].trim();
  if (raw) {
    if (/无合约|不限制|无限制|没有合约|不设合约|无锁定期/.test(raw)) {
      return { months: 0, text: '无合约' };
    }
    const yearHit = raw.match(/(\d+)\s*年/);
    if (yearHit) return { months: Number(yearHit[1]) * 12, text: `${yearHit[1]}年` };
    const monthHit = raw.match(/(\d+)\s*(?:个)?月/);
    if (monthHit) return { months: Number(monthHit[1]), text: `${monthHit[1]}个月` };
    return { months: 0, text: raw };
  }

  const fallback = text.match(/合约期[^\d\n]{0,8}(\d+)\s*(?:个)?月/);
  if (fallback) return { months: Number(fallback[1]), text: `${fallback[1]}个月` };
  return { months: 0, text: '' };
}

/**
 * 取优惠期 / 有效期并归一化。
 *
 * 上游没写就返回「未知」，绝不按合约期或行业惯例推测。
 *
 * @param text - 全文。
 * @param sections - 切分结果。
 * @returns 归一化后的时长文案。
 */
function pickDuration(text: string, sections: Section[]): string {
  const section = findSection(sections, ['优惠期', '有效期', '套餐有效期']);
  if (section) return normalizeDuration(section.split('\n')[0]);

  const free = text.match(/(?:优惠期|有效期|套餐期)[：:]?\s*([^\n，。；;]{1,24})/);
  if (free) return normalizeDuration(free[1]);
  return normalizeDuration('');
}

/** 办卡年龄区间：`18-60周岁` / `18岁-60岁` / `18~60岁` */
const AGE_PATTERN = /(\d{1,2})\s*[-—~～至到]\s*(\d{1,2})\s*(?:周)?岁/;

/**
 * 取办卡年龄。
 *
 * @param text - 全文。
 * @param sections - 切分结果。
 * @returns 形如「18-60周岁」的年龄区间；未命中返回空串。
 */
function pickAgeRange(text: string, sections: Section[]): string {
  const section = findSection(sections, ['办卡年龄', '年龄限制']);
  const hit = (section || text).match(AGE_PATTERN);
  if (hit) return `${hit[1]}-${hit[2]}周岁`;
  if (section) {
    const single = section.match(/(\d{1,2})\s*(?:周)?岁/);
    if (single) return section.split('\n')[0].trim();
  }
  return '';
}

/**
 * 取发货范围。
 *
 * **只表示发货地区，绝不代表归属地**；上游若只写了「归属地」字段，这里保持空串。
 *
 * @param text - 全文。
 * @param sections - 切分结果。
 * @returns 发货范围原文（如「仅发重庆」）；未标注返回空串。
 */
function pickShipRegion(text: string, sections: Section[]): string {
  const hit = sections.find((section) =>
    ['不发货地区', '发货地区', '可发地区'].includes(section.label)
  );
  if (hit) {
    const line = hit.value.split('\n')[0].trim();
    if (line) {
      const positive = /^(?:仅发|只发|限发|仅限|只限)/.test(line) || hit.label !== '不发货地区';
      // 「不发货地区：新疆、西藏」不能当成发货范围（语义正好相反），
      // 转成「除新疆、西藏外」才是可发货地区。
      return positive ? line : `除${line}外`;
    }
  }
  const free = text.match(/(?:仅发|只发|限发|仅限)[^\n，。；;、]{1,12}/);
  return free ? free[0].trim() : '';
}

/** 附加权益词表：只认这些确定是「赠送/附带」的东西 */
const PERK_PATTERN = /(?:(\d+(?:\.\d+)?)\s*元)?\s*(云盘包|视频会员|音乐会员|来电显示|来显|宽带)/g;

/**
 * 取附加权益。
 *
 * @param text - 全文。
 * @returns 权益文案数组，去重后最多 5 条。
 */
function pickPerks(text: string): string[] {
  const perks: string[] = [];
  for (const match of text.matchAll(PERK_PATTERN)) {
    const amount = match[1] ? `${match[1]}元` : '';
    const rawName = match[2];
    const name = rawName === '来显' ? '来电显示' : rawName;
    if (perks.some((perk) => perk.includes(name))) continue;
    perks.push(`${amount}${name}`);
  }
  return perks.slice(0, 5);
}

/** 套餐外资费的三条规则，输出统一为「数值+单位」 */
const OUT_OF_PLAN_RULES = {
  voice: /(?:国内)?(?:语音|通话|拨打)[^0-9\n]{0,8}(\d+(?:\.\d+)?)\s*元\s*\/\s*分钟/,
  sms: /短信[^0-9\n]{0,8}(\d+(?:\.\d+)?)\s*元\s*\/\s*条/,
  data: /(?:国内)?(?:流量|上网)[^0-9\n]{0,8}(\d+(?:\.\d+)?)\s*元\s*\/\s*(?:GB|G|MB|M)/i,
} as const;

/**
 * 取套餐外资费。
 *
 * @param text - 全文。
 * @returns 语音 / 短信 / 流量三项单价文案，未命中的为空串。
 */
function pickOutOfPlan(text: string): ProductSpec['outOfPlan'] {
  const voice = text.match(OUT_OF_PLAN_RULES.voice);
  const sms = text.match(OUT_OF_PLAN_RULES.sms);
  const data = text.match(OUT_OF_PLAN_RULES.data);
  return {
    voice: voice ? `${voice[1]}元/分钟` : '',
    sms: sms ? `${sms[1]}元/条` : '',
    data: data ? `${data[1]}元/GB` : '',
  };
}

/** 标题开头的卡形态方括号标记，如「【实体卡】」 */
const FORM_BRACKET_PATTERN =
  /^[【[]\s*(?:实体卡|电子卡|虚拟卡|eSIM|esim|卡板|流量卡|正规卡|号卡|手机卡)\s*[】\]]/;

/**
 * 取干净商品名。
 *
 * 只剥离开头的卡形态方括号；「【19元】100G」这类价格方括号保留，避免丢信息。
 *
 * @param titleLine - 标题原文。
 * @returns 干净商品名。
 */
function pickName(titleLine: string): string {
  let name = titleLine.trim();
  while (FORM_BRACKET_PATTERN.test(name)) {
    name = name.replace(FORM_BRACKET_PATTERN, '').trim();
  }
  return name || titleLine.trim();
}

/**
 * 判断卡形态。
 *
 * @param rawTitle - 标题原文（形态标记几乎都在开头）。
 * @param text - 全文（兜底）。
 * @returns 卡形态；判断不出返回 `unknown`。
 */
function pickCardForm(rawTitle: string, text: string): CardForm {
  const head = rawTitle.slice(0, 40);
  if (/eSIM|esim|虚拟卡|电子卡|虚拟号/i.test(head)) return 'esim';
  if (/实体卡|卡板/.test(head)) return 'physical';
  if (/eSIM|esim|虚拟卡|电子卡/i.test(text)) return 'esim';
  if (/实体卡|卡板/.test(text)) return 'physical';
  return 'unknown';
}

/**
 * 取运营商：先看标题，标题没有再看全文。
 *
 * @param rawTitle - 标题原文。
 * @param text - 全文。
 * @returns 标准运营商标识。
 */
function pickOperator(rawTitle: string, text: string): OperatorKey {
  const fromTitle = detectOperator(rawTitle);
  return fromTitle === 'unknown' ? detectOperator(text) : fromTitle;
}

// ===================== 三、置信度与诊断 =====================

/** 界面必须拿到的关键字段（缺失时要提示运营手填） */
const KEY_FIELDS: readonly string[] = [
  '月租',
  '通用流量',
  '运营商',
  '通话分钟',
  '首充',
  '合约期',
  '办卡年龄',
  '发货地区',
  '激活方式',
];

/** matched 的完整字段数，用于计算解析广度 */
const TOTAL_TRACKED_FIELDS = 18;

/** 三个决定「能不能发」的字段，占置信度七成权重 */
const CRITICAL_FIELDS: readonly string[] = ['月租', '通用流量', '运营商'];

/**
 * 计算解析置信度。
 *
 * 关键字段（月租 / 通用流量 / 运营商）占 70%，其余字段的解析广度占 30%：
 * 三个关键字段全中且广度足够时接近 1，关键字段缺一个就明显掉下来。
 *
 * @param matched - 已命中的字段名。
 * @returns 0–1 的置信度，保留两位小数。
 */
function computeConfidence(matched: readonly string[]): number {
  const criticalHit = CRITICAL_FIELDS.filter((field) => matched.includes(field)).length;
  const breadth = Math.min(matched.length, TOTAL_TRACKED_FIELDS) / TOTAL_TRACKED_FIELDS;
  const score = (criticalHit / CRITICAL_FIELDS.length) * 0.7 + breadth * 0.3;
  return Math.round(Math.min(1, Math.max(0, score)) * 100) / 100;
}

/**
 * 构造一份全空 spec，供空输入与解析兜底使用。
 *
 * @returns 所有数值为 0、所有文案为空串的 spec。
 */
function emptySpec(): ProductSpec {
  return {
    rawTitle: '',
    name: '',
    operator: 'unknown',
    cardForm: 'unknown',
    monthlyFee: 0,
    firstCharge: 0,
    firstMonth: '',
    flowGb: 0,
    directionalGb: 0,
    voiceMinutes: 0,
    contractMonths: 0,
    contractText: '',
    duration: '未知',
    ageRange: '',
    shipRegion: '',
    activateType: '',
    expressType: '',
    perks: [],
    outOfPlan: { voice: '', sms: '', data: '' },
    notices: [],
    leftovers: [],
    confidence: 0,
  };
}

/**
 * 解析运营粘贴的上游商品文案。
 *
 * 只做「能证实的提取」：任何字段解析不到都留 0 / 空串，并在 `missing` 里点名，
 * 由界面提示运营手填。调用方应把 `confidence < 0.5` 的结果视为「需要人工核对」。
 *
 * @param text - 上游商品文案原文（允许含空行、时间戳、温馨提示等噪音）。
 * @returns 结构化套餐 + 命中/缺失字段清单。
 */
export function parseProductText(text: string): ParseResult {
  const source = String(text || '')
    .replace(/\u3000/g, ' ')
    .trim();
  if (!source) {
    return { spec: emptySpec(), matched: [], missing: [...KEY_FIELDS] };
  }

  const { titleLine, sections, leftovers } = splitSections(source);
  const matched: string[] = [];

  const rawTitle = titleLine;
  const name = pickName(rawTitle);
  if (name) matched.push('商品名');

  const cardForm = pickCardForm(rawTitle, source);
  if (cardForm !== 'unknown') matched.push('卡形态');

  const operator = pickOperator(rawTitle, source);
  if (operator !== 'unknown') matched.push('运营商');

  const monthlyFee = pickMonthlyFee(source, sections, rawTitle);
  if (monthlyFee > 0) matched.push('月租');

  const firstCharge = pickFirstCharge(source);
  if (firstCharge > 0) matched.push('首充');

  const firstMonth = pickFirstMonth(source);
  if (firstMonth) matched.push('首月政策');

  const flow = pickFlow(source);
  if (flow.general > 0) matched.push('通用流量');
  if (flow.directional > 0) matched.push('定向流量');

  const voiceMinutes = pickVoiceMinutes(source);
  if (voiceMinutes > 0) matched.push('通话分钟');

  const contract = pickContract(source, sections);
  if (contract.months > 0 || contract.text) matched.push('合约期');

  const duration = pickDuration(source, sections);
  if (duration !== '未知') matched.push('优惠期');

  const ageRange = pickAgeRange(source, sections);
  if (ageRange) matched.push('办卡年龄');

  const shipRegion = pickShipRegion(source, sections);
  if (shipRegion) matched.push('发货地区');

  const activateType = findSection(sections, ['激活方式']).split('\n')[0].trim();
  if (activateType) matched.push('激活方式');

  const expressType = findSection(sections, ['快递方式']).split('\n')[0].trim();
  if (expressType) matched.push('快递方式');

  const perks = pickPerks(source);
  if (perks.length > 0) matched.push('附加权益');

  const outOfPlan = pickOutOfPlan(source);
  if (outOfPlan.voice || outOfPlan.sms || outOfPlan.data) matched.push('套餐外资费');

  const notices = findSection(sections, ['温馨提示', '注意事项'])
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '');
  if (notices.length > 0) matched.push('温馨提示');

  const spec: ProductSpec = {
    rawTitle,
    name,
    operator,
    cardForm,
    monthlyFee,
    firstCharge,
    firstMonth,
    flowGb: flow.general,
    directionalGb: flow.directional,
    voiceMinutes,
    contractMonths: contract.months,
    contractText: contract.text,
    duration,
    ageRange,
    shipRegion,
    activateType,
    expressType,
    perks,
    outOfPlan,
    notices,
    leftovers: leftovers.slice(0, 20),
    confidence: computeConfidence(matched),
  };

  const missing = KEY_FIELDS.filter((field) => !matched.includes(field));
  return { spec, matched, missing };
}
