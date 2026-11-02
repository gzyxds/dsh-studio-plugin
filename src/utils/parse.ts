/**
 * 套餐文本解析工具集
 *
 * 号卡平台的商品名/套餐描述格式极不统一（如「【19元】100G通用+30G定向+100分钟」），
 * 过去 `search-data.ts`、`Product.astro`、`product/[id].astro` 各自实现了一份
 * 价格/流量/通话解析，规则不一致导致同一商品在不同页面展示不同数字。
 *
 * 本模块统一为唯一实现，各平台适配层负责把原始数据拼接成文本后调用即可。
 */

/**
 * 中英文方括号包裹的单段内容，如「【19元】」「[限时]」。
 *
 * 捕获组 1 为括号内部文本，供「去掉方括号」与「取方括号内内容」两种场景复用。
 */
export const BRACKET_SEGMENT_PATTERN = /(?:【|\[)([^】\]]*)(?:】|\])/;

/** 中文数字 → 阿拉伯数字，用于处理「两年」「三个月」等时长描述 */
const ZH_NUM: Record<string, string> = {
  一: '1',
  二: '2',
  两: '2',
  三: '3',
  四: '4',
  五: '5',
  六: '6',
  七: '7',
  八: '8',
  九: '9',
  十: '10',
};

/**
 * 加装/资费附加条款，如「+10元/月送路由器」「+0.15元/分钟」。
 *
 * 其中的金额是加价项或通话单价，不是月租。取价前必须剔除，
 * 否则「江苏南京移动56/月500M（包安装费，+10元/月送路由器）」会被解析成 10 元。
 */
const ADDON_CLAUSE_PATTERN = /\+\s*\d+(?:\.\d+)?\s*元[^，,。；;）)】\]]*/g;

/**
 * 从文本中提取月租价格。
 *
 * 依次尝试：方括号内价格（「【19元】100G」，商品名里的标准月租位）→
 * 显式月租（「29元/月」）→ 省略「元」的月租（「56/月500M」）→ 首个「N元」。
 * 前两者优先是因为商品名中可能存在「首月0元」「+10元/月」等干扰项。
 *
 * @param text - 商品名或套餐描述。
 * @param fallback - 未命中时的兜底值，默认 0。
 * @returns 解析出的月租金额。
 */
export function parsePrice(text: string, fallback = 0): number {
  const source = (text || '').replace(ADDON_CLAUSE_PATTERN, '');

  const bracketMatch = source.match(/(?:【|\[)\s*(\d+(?:\.\d+)?)元/);
  if (bracketMatch) return parseFloat(bracketMatch[1]);

  const monthlyMatch = source.match(/(\d+(?:\.\d+)?)\s*元\s*\/\s*月/);
  if (monthlyMatch) return parseFloat(monthlyMatch[1]);

  /** 数字与「/」之间若隔着单位字母（如「100G/月」），此处不会命中 */
  const bareMonthlyMatch = source.match(/(\d+(?:\.\d+)?)\s*\/\s*月/);
  if (bareMonthlyMatch) return parseFloat(bareMonthlyMatch[1]);

  const plainMatch = source.match(/(\d+(?:\.\d+)?)\s*元/);
  return plainMatch ? parseFloat(plainMatch[1]) : fallback;
}

/**
 * 从文本中提取通用流量值（GB）。
 *
 * 注意排除「5G流量卡 / 5G网络 / 5G全网通」这类速率标识被误判为 5GB 流量。
 *
 * @param text - 商品名或套餐描述。
 * @returns 流量 GB 数值，未命中返回 0。
 */
export function parseFlowGb(text: string): number {
  const source = text || '';

  const gbMatch = source.match(/(\d+(?:\.\d+)?)\s*GB/i);
  if (gbMatch) return parseFloat(gbMatch[1]);

  const gMatch = source.match(/(\d+(?:\.\d+)?)\s*G(?!B|b)/i);
  if (!gMatch) return 0;

  const start = (gMatch.index || 0) + gMatch[0].length;
  const after = source.slice(start, start + 4);
  if (/^(流量卡|网络|全网通|手机|套餐)/.test(after)) return 0;

  return parseFloat(gMatch[1]);
}

/** 周期文案里的中文数字（「一年」「两年」「半年」） */
const PERIOD_CN_NUM: Record<string, number> = {
  一: 1,
  二: 2,
  两: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
  十: 10,
  半: 0.5,
};

/**
 * 从文本中解析计费周期（月）。
 *
 * @param text - 商品名或套餐描述。
 * @returns 月数；「半年」→6、「一年」→12、「3年」→36；未命中返回 0。
 */
export function parsePeriodMonths(text: string): number {
  const years = (text || '').match(/([0-9一二两三四五半]+)\s*年/);
  if (years) return (PERIOD_CN_NUM[years[1]] ?? Number(years[1])) * 12;

  const months = (text || '').match(/([0-9一二两三四五半]+)\s*(?:个)?月/);
  if (months) return PERIOD_CN_NUM[months[1]] ?? Number(months[1]);

  if (/\/\s*年|包年|年付|按年|年享/.test(text)) return 12;
  if (/\/\s*月|包月|月付|按月/.test(text)) return 1;
  return 0;
}

/**
 * 解析「一次性预付」定价。
 *
 * 宽带常按年或多年一次性收费（「江西电信单宽100M360元/年」「重庆广电单宽【360元100M3年】」），
 * 商品名里同时写着总额与期限。命中时返回两者，供上层换算月均并单独展示预付门槛，
 * 否则总额会被当成月租（「360元」的卡显示成「¥360 /月起」）。
 *
 * 三种情况不判定为预付：
 * - 名称写明「元/月」「月付」「月租」，那是月租而非预付；
 * - 只写了总额或只写了期限（「北京联通单宽【880元300M】」没写期限，无从换算）；
 * - 号卡且未写明包年/年付，避免把「29元150G+4年会员」的会员期当成套餐期。
 *
 * @param name - 商品名。
 * @param cardType - 卡类型；号卡需额外写明年付关键词才判定。
 * @returns 预付总额与期限月数，未命中返回 `null`。
 */
export function parsePrepay(
  name: string,
  cardType: 'phone' | 'broadband'
): { total: number; months: number } | null {
  const text = name || '';
  if (/\/\s*月|月付|月租|月均/.test(text)) return null;
  if (cardType !== 'broadband' && !/包年|年付|年享|\/\s*年/.test(text)) return null;

  const total = Number((text.match(/(\d+(?:\.\d+)?)\s*元/) || [])[1] || 0);
  const months = parsePeriodMonths(text);
  if (total <= 0 || months < 2) return null;

  return { total, months };
}

/**
 * 从文本中提取带宽值（M）。
 *
 * 宽带商品名里的带宽写法有「500M」「300Mbps」「200M-1000M」几种，取首个数值即可。
 * 与 parseFlowGb 的分工：那个只认流量（G），这个只认带宽（M）。
 *
 * @param text - 商品名或套餐描述。
 * @returns 带宽 M 数值，未命中返回 0。
 */
export function parseBandwidthM(text: string): number {
  const match = (text || '').match(/(\d+(?:\.\d+)?)\s*M(?:bps)?/i);
  return match ? parseFloat(match[1]) : 0;
}

/**
 * 从文本中提取语音分钟数。
 *
 * @param text - 商品名或套餐描述。
 * @returns 分钟数，未命中返回 0。
 */
export function parseVoiceMinutes(text: string): number {
  const match = (text || '').match(/(\d+)\s*分钟/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * 从套餐文本中解析通用/定向流量（带单位字符串）。
 *
 * 优先识别「XXG通用」「XXG定向」的显式组合，无法区分时退化为取首个 G 数值作为通用流量。
 *
 * @param taocan - 套餐描述，如「19元包50G通用+30G定向」。
 * @returns 通用流量与定向流量字符串，形如 `{ general: '50G', directional: '30G' }`。
 */
export function parseTraffic(taocan: string): { general: string; directional: string } {
  const source = taocan || '';

  const generalMatch = source.match(/(\d+)G[^定]*(?:通用|全国)/);
  const dirMatch = source.match(/(\d+)G[^通]*(?:定向|专属)/);

  if (generalMatch || dirMatch) {
    return {
      general: generalMatch ? `${generalMatch[1]}G` : '0G',
      directional: dirMatch ? `${dirMatch[1]}G` : '0G',
    };
  }

  const gMatch = source.match(/(\d+)G/);
  return { general: gMatch ? `${gMatch[1]}G` : '0G', directional: '0G' };
}

/**
 * 从套餐文本中解析通话时长（带单位字符串）。
 *
 * @param taocan - 套餐描述。
 * @returns 形如「100分钟」的字符串，未命中返回「0分钟」。
 */
export function parseMinutes(taocan: string): string {
  const minutes = parseVoiceMinutes(taocan);
  return `${minutes}分钟`;
}

/**
 * 提取文本中第一处方括号内的内容。
 *
 * @param text - 原始文本。
 * @returns 括号内部文本；未命中返回空字符串。
 */
export function extractBracketContent(text: string): string {
  const match = (text || '').match(BRACKET_SEGMENT_PATTERN);
  return match ? match[1].trim() : '';
}

/**
 * 剥离商品名中的促销方括号片段。
 *
 * @param name - 原始商品名。
 * @returns 去除首个方括号片段后的短名称。
 */
export function stripBracketSegment(name: string): string {
  return (name || '').replace(BRACKET_SEGMENT_PATTERN, '').trim();
}

/**
 * 套餐有效期归一化：统一为 长期 / X年 / X个月 / 未知。
 *
 * 各平台原始文案混乱（「以套餐为准」「官方可查长期」「两年」「12个月合约」），
 * 归一化后前端「长期卡 / 短期体验」标签才能准确命中。
 *
 * @param raw - 原始时长文本。
 * @returns 归一化后的时长文案。
 */
export function normalizeDuration(raw: string | undefined): string {
  const text = (raw || '').trim();
  if (!text) return '未知';
  if (/长期|20年|永久/.test(text)) return '长期';

  const numYear = text.match(/(\d+)年/);
  if (numYear) return `${numYear[1]}年`;

  const zhYear = text.match(/([一两二三四五六七八九十]+)年/);
  if (zhYear) return `${ZH_NUM[zhYear[1]] || zhYear[1]}年`;

  const numMonth = text.match(/(\d+)个月/);
  if (numMonth) return `${numMonth[1]}个月`;

  if (/以套餐为准|套餐为准|未说明/.test(text)) return '未知';
  return text;
}

/**
 * 把月数写成中文期限（36 → "3年"，12 → "1年"，6 → "6个月"）。
 *
 * 用于展示一次性预付的覆盖期限。搜索页卡片与 AI 选卡的推荐卡共用，
 * 同一个商品在两处必须写法一致。
 *
 * @param months - 覆盖的月数。
 * @returns 展示用期限文案。
 */
export function formatMonths(months: number): string {
  if (months >= 12 && months % 12 === 0) return `${months / 12}年`;
  return `${months}个月`;
}

/**
 * 把归一化后的时长文案换算成月数。
 *
 * 「长期卡 / 短期体验」两个标签按阈值判定（长期 ≥24 个月、短期 ≤12 个月），
 * 但时长文案是「2年」「11个月」这类混排，需要先统一成月数。
 *
 * 注意：search.astro 的内联脚本里有一份同逻辑的 ES5 实现（内联脚本不能 import），
 * 改动本函数时需同步更新，`scripts/compare-agent-match.ts` 会对两者的口径做断言。
 *
 * @param du - `normalizeDuration` 产出的时长文案。
 * @returns 月数；长期/永久为 `Infinity`，未知或无法识别为 0。
 */
export function durationMonths(du: string): number {
  if (!du || du === '未知') return 0;
  if (du === '长期') return Infinity;
  if (du === '半年') return 6;
  const years = du.match(/^(\d+)年$/);
  if (years) return Number(years[1]) * 12;
  const months = du.match(/^(\d+)个月$/);
  if (months) return Number(months[1]);
  return 0;
}

/**
 * 判断数值是否落入「下限-上限」档位区间（闭区间；"-" 后为空表示无上限）。
 *
 * 档位串由列表页筛选栏生成，形如 `'0-99'` / `'100-200'` / `'201-'`；
 * kdd / shop / yky 三页此前在 SSR 与客户端各带一份同实现，此为准绳实现。
 *
 * @param value - 参与比较的数值（月租 / 流量 / 通话分钟等）。
 * @param band - 档位串，形如 `'100-200'`，上限留空表示无上限。
 * @returns 是否落入区间。
 */
export function inBand(value: number, band: string): boolean {
  const i = band.indexOf('-');
  const hi = band.slice(i + 1);
  return value >= Number(band.slice(0, i)) && (hi === '' || value <= Number(hi));
}
