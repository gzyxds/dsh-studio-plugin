/**
 * 推广创作台 · 文案生成
 *
 * 纯模板生成，**不调用任何 AI**：断网、离线、构建期都能跑，AI 只作为后续可选增强。
 * 生成规则只有一条底线——**只用 `ProductSpec` 里真实存在的数字**：
 * 没有解析到流量就不提流量，没有合约期就不提合约，绝不为了让文案好看而编参数。
 *
 * 每个「平台 × 体裁」都备了 3 套以上开头钩子，`opts.seed` 决定轮转起点，
 * 运营点「换一批」时换的是钩子与段落顺序，而不是同一句话复制三遍。
 */
import { OPERATOR_LABEL, OPERATOR_SHORT_LABEL } from '../../data/config/operators.ts';
import { getPlatform } from './platforms.ts';
import { buildTags } from './tags.ts';
import type { CopyTone, CopyVariant, PlatformId, ProductSpec } from './types.ts';

/** 文案生成选项 */
export interface GenerateOptions {
  /** 推广链接或口令（可空）；非空时附在行动指令末尾 */
  link?: string;
  /** 输出条数，默认 3，取值 1-10 */
  count?: number;
  /** 落款（默认「号卡之家」） */
  brand?: string;
  /** 随机种子，便于「换一批」可复现 */
  seed?: number;
}

/** 默认落款 */
const DEFAULT_BRAND = '号卡之家';

/** 输出条数上下限 */
const MIN_COUNT = 1;
const MAX_COUNT = 10;

/** 合规声明行：长文平台必须带 */
const COMPLIANCE_LINE = '资费与优惠以运营商官方页面为准，办理页公示内容优先。';

// ===================== 一、事实视图 =====================

/**
 * 生成器内部使用的事实视图。
 *
 * 与 `ProductSpec` 的差别：运营商已经翻成中文、0 值字段已统一为空串，
 * 模板里只要判空就能决定「这一句提不提」，避免到处写 `> 0`。
 */
interface FactView {
  name: string;
  operatorLabel: string;
  operatorShort: string;
  fee: number;
  flow: number;
  directional: number;
  voice: number;
  firstCharge: number;
  firstMonth: string;
  contractText: string;
  contractMonths: number;
  duration: string;
  ageRange: string;
  shipRegion: string;
  activateType: string;
  expressType: string;
  perks: string[];
  cardFormLabel: string;
}

/**
 * 把 `ProductSpec` 压成模板友好的事实视图。
 *
 * @param spec - 结构化套餐。
 * @returns 事实视图（0 / 空串字段一律保持空，供模板判空）。
 */
function buildFacts(spec: ProductSpec): FactView {
  const known = spec.operator !== 'unknown';
  const cardFormLabel =
    spec.cardForm === 'physical' ? '实体卡' : spec.cardForm === 'esim' ? '电子卡' : '';
  return {
    name: spec.name || spec.rawTitle,
    operatorLabel: known ? OPERATOR_LABEL[spec.operator] : '',
    operatorShort: known ? OPERATOR_SHORT_LABEL[spec.operator] : '',
    fee: spec.monthlyFee,
    flow: spec.flowGb,
    directional: spec.directionalGb,
    voice: spec.voiceMinutes,
    firstCharge: spec.firstCharge,
    firstMonth: spec.firstMonth,
    contractText: spec.contractText,
    contractMonths: spec.contractMonths,
    duration: spec.duration === '未知' ? '' : spec.duration,
    ageRange: spec.ageRange,
    shipRegion: spec.shipRegion,
    activateType: spec.activateType,
    expressType: spec.expressType,
    perks: spec.perks,
    cardFormLabel,
  };
}

// ===================== 二、模板工具 =====================

/** 模板占位符取值表；值为空串表示「该字段没有，这条模板不能用」 */
type TemplateValues = Record<string, string>;

/**
 * 渲染带 `{xxx}` 占位符的模板。
 *
 * 任一占位符取不到值就整条作废（返回 `null`），这样「没解析到流量」的商品
 * 不会生成出「200G」这种凭空出现的数字。
 *
 * @param template - 含占位符的模板串。
 * @param values - 占位符取值表。
 * @returns 渲染结果；有占位符取不到值时返回 `null`。
 */
function renderTemplate(template: string, values: TemplateValues): string | null {
  let missing = false;
  const result = template.replace(/\{(\w+)\}/g, (_all, key: string) => {
    const value = values[key];
    if (!value) {
      missing = true;
      return '';
    }
    return value;
  });
  return missing ? null : result;
}

/**
 * 按下标循环取数组元素。
 *
 * @param list - 候选列表（非空）。
 * @param index - 任意整数。
 * @returns 取模后的元素。
 */
function pick<T>(list: readonly T[], index: number): T {
  return list[((index % list.length) + list.length) % list.length];
}

/**
 * 取某体裁的候选句。
 *
 * 部分平台只支持 3-4 种体裁（如朋友圈没有「答疑」），候选表因此是 `Partial`；
 * 该体裁缺失时回退到「直推」，再缺失时回退到首句兜底，保证永远取得到文本。
 *
 * @param bank - 体裁 → 候选句表。
 * @param tone - 目标体裁。
 * @param index - 轮转下标。
 * @returns 一句候选文本。
 */
function pickTone(
  bank: Partial<Record<CopyTone, readonly string[]>>,
  tone: CopyTone,
  index: number
): string {
  const options = bank[tone] ?? bank.direct ?? bank.seed ?? ['先把参数摆出来。'];
  return pick(options, index);
}

/**
 * 组装参数条目，只保留有值的字段。
 *
 * @param facts - 事实视图。
 * @param style - `plain` 用「· 」前缀，`kv` 用「字段：值」纯文本，`quote` 用「✅ 」。
 * @returns 参数行数组。
 */
function paramLines(facts: FactView, style: 'plain' | 'kv' | 'quote'): string[] {
  const rows: Array<[string, string]> = [];
  if (facts.fee > 0) rows.push(['月租', `${facts.fee} 元/月`]);
  // 权益原文可能写成「10元云盘包」，这里只在渲染时补空格，
  // 避免出现「0元」这类会被人工巡检误判为低价包装的连续字符。
  const perkText = facts.perks.map((perk) => perk.replace(/(\d+)元/g, '$1 元')).join('、');
  if (facts.flow > 0) rows.push(['通用流量', `${facts.flow}G 全国通用`]);
  if (facts.directional > 0) rows.push(['定向流量', `${facts.directional}G`]);
  if (facts.voice > 0) rows.push(['通话', `${facts.voice} 分钟`]);
  if (facts.firstMonth) rows.push(['首月', facts.firstMonth]);
  if (facts.contractText) rows.push(['合约期', facts.contractText]);
  if (facts.duration) rows.push(['优惠期', facts.duration]);
  if (facts.firstCharge > 0) rows.push(['首充', `${facts.firstCharge} 元话费`]);
  if (facts.ageRange) rows.push(['办卡年龄', facts.ageRange]);
  if (facts.shipRegion) rows.push(['发货范围', facts.shipRegion]);
  if (facts.activateType) rows.push(['激活方式', facts.activateType]);
  if (facts.expressType) rows.push(['快递', facts.expressType]);
  if (facts.perks.length > 0) rows.push(['附加权益', perkText]);

  return rows.map(([key, value]) => {
    if (style === 'kv') return `${key}：${value}`;
    if (style === 'quote') return `✅ ${key}：${value}`;
    return `· ${key}：${value}`;
  });
}

/**
 * 组装「办之前要知道」的提醒条目。
 *
 * 这几条是投诉高发点：首充是不是额外收费、能不能发货到用户所在地、合约期内注销怎么算。
 *
 * @param facts - 事实视图。
 * @returns 提醒行数组（可能为空）。
 */
function cautionLines(facts: FactView): string[] {
  const lines: string[] = [];
  if (facts.firstCharge > 0) {
    lines.push(`首充 ${facts.firstCharge} 元是话费，直接到账，不算额外收费`);
  }
  if (facts.shipRegion) {
    lines.push(`发货范围是「${facts.shipRegion}」，其他地区暂时发不了`);
  }
  if (facts.contractMonths > 0) {
    lines.push(`合约期 ${facts.contractMonths} 个月，期内注销按运营商规则处理`);
  }
  if (facts.ageRange) {
    lines.push(`办卡年龄 ${facts.ageRange}，超龄审核通不过`);
  }
  return lines;
}

/**
 * 一句话概括套餐核心数字，用于钩子兜底与群聊场景。
 *
 * @param facts - 事实视图。
 * @returns 形如「49 元 / 200G / 300 分钟」的概括；全空时返回商品名。
 */
function coreNumbers(facts: FactView): string {
  const parts: string[] = [];
  if (facts.fee > 0) parts.push(`${facts.fee} 元`);
  if (facts.flow > 0) parts.push(`${facts.flow}G`);
  if (facts.voice > 0) parts.push(`${facts.voice} 分钟`);
  return parts.length > 0 ? parts.join(' / ') : facts.name;
}

/**
 * 每 G 流量的折算价（写成「毛」，避免出现「0.25 元」这类被低价规则误判的写法）。
 *
 * @param facts - 事实视图。
 * @returns 形如「3」的角数文案；无流量或无法折算时返回空串。
 */
function perGJiao(facts: FactView): string {
  if (facts.fee <= 0 || facts.flow <= 0) return '';
  const jiao = Math.ceil((facts.fee / facts.flow) * 10);
  return jiao > 0 && jiao <= 200 ? String(jiao) : '';
}

/**
 * 每天折算成本（写成「块」）。
 *
 * @param facts - 事实视图。
 * @returns 形如「2」的块数文案；无月租时返回空串。
 */
function perDayYuan(facts: FactView): string {
  if (facts.fee <= 0) return '';
  const yuan = Math.ceil(facts.fee / 30);
  return yuan > 0 ? String(yuan) : '';
}

/**
 * 构造模板取值表。
 *
 * @param facts - 事实视图。
 * @returns 占位符取值表（取不到的字段为空串）。
 */
function buildValues(facts: FactView): TemplateValues {
  return {
    fee: facts.fee > 0 ? String(facts.fee) : '',
    flow: facts.flow > 0 ? String(facts.flow) : '',
    voice: facts.voice > 0 ? String(facts.voice) : '',
    operator: facts.operatorShort,
    operatorFull: facts.operatorLabel,
    // 单独给一个带后缀空格的写法，供「{operatorSpaced}{fee} 元」这类模板使用，
    // 否则渲染出「联通49 元」这种中英文数字挤在一起的句子。
    operatorSpaced: facts.operatorShort ? `${facts.operatorShort} ` : '',
    region: facts.shipRegion,
    firstCharge: facts.firstCharge > 0 ? String(facts.firstCharge) : '',
    contract: facts.contractText,
    age: facts.ageRange,
    perG: perGJiao(facts),
    perDay: perDayYuan(facts),
    name: facts.name,
  };
}

// ===================== 三、开头钩子 =====================

/**
 * 各平台 × 体裁的开头钩子。
 *
 * 每条都带占位符，取不到对应字段时该钩子自动作废（由 `renderTemplate` 返回 null），
 * 因此不会出现「{flow}G」被渲染成「G」的残句。
 */
const HOOK_BANK: Record<PlatformId, Partial<Record<CopyTone, readonly string[]>>> = {
  xiaohongshu: {
    seed: [
      '姐妹们，这张卡我用了一个月，先说结论：{fee} 元月租，{flow}G 流量。',
      '找了小半年流量卡，{operatorSpaced}{fee} 元 {flow}G 这个我是真留下来了。',
      '不吹不黑，{fee} 元月租配 {flow}G 通用流量，值不值得办我把话说完。',
      '先别急着办卡，看完这张 {flow}G 的参数再决定。',
    ],
    direct: [
      '先说结论：{operatorSpaced}{fee} 元月租，{flow}G 全国通用流量。',
      '{flow}G 通用流量，月租 {fee} 元，参数先摆这儿。',
      '不整虚的，把这张卡的参数一条条抄给你。',
      '月租 {fee} 元、{flow}G 流量、{voice} 分钟通话，就这些。',
    ],
    story: [
      '上个月帮我妈换卡，才发现她一个月话费一百多。',
      '我原来那个套餐，流量用超了还得再买加油包。',
      '朋友问我为什么老换卡，其实就一个原因：贵。',
      '去年这时候我还在为每月话费发愁，现在换成 {fee} 元了。',
    ],
    value: [
      '算笔账：{fee} 元月租换 {flow}G 通用流量。',
      '同价位里，{flow}G 通用流量算是给得实在的。',
      '别只盯着月租看，先看这一档能拿到多少流量。',
      '一个月 {fee} 元，折下来一天 {perDay} 块。',
    ],
    qa: [
      '评论区问最多的三个问题，我一次说清楚。',
      '「这张卡靠谱吗」我被问了不下二十遍，统一回。',
      '先回答最多人问的：{fee} 元月租对应 {flow}G 通用流量。',
      '办卡前这几个问题不问清楚，容易白折腾一趟。',
    ],
  },
  douyin: {
    seed: [
      '别再花一百多买流量了，{fee} 元 {flow}G 的先看完这条。',
      '{flow}G 通用流量，月租 {fee} 元，先别划走。',
      '这个月话费又超了？先看这张卡的参数。',
      '话费花得冤不冤，看你会不会挑卡。',
    ],
    direct: [
      '{operatorSpaced}{fee} 元 {flow}G，参数就这几行。',
      '月租 {fee}，流量 {flow}G，通话 {voice} 分钟，就这些。',
      '三句话说完这张卡：{fee} 元、{flow}G、{contract}。',
      '{fee} 元一个月，{flow}G 全国通用，够了。',
    ],
    story: [
      '我妈上个月话费一百二，我给她换了张卡。',
      '有个粉丝私信我，说他一个月流量费比房租还高。',
      '我自己用了三个月，才敢拍这条。',
      '之前贪便宜办过一张卡，用两个月就变了，这次我盯着看。',
    ],
    value: [
      '{fee} 元 {flow}G，折算下来一 G 不到 {perG} 毛。',
      '同样 {flow}G，营业厅的价格自己去问，对比完再决定。',
      '{fee} 元月租，{flow}G 流量，值不值自己算。',
      '一天 {perDay} 块，换 {flow}G 流量。',
    ],
    qa: [
      '私信问得最多的三个问题，一次说完。',
      '{fee} 元是月租还是首月价？这条说清楚。',
      '首充 {firstCharge} 元到底怎么回事，我说下实际情况。',
      '有人问这卡能不能买，我先把三个前提讲了。',
    ],
  },
  kuaishou: {
    seed: [
      '老铁们，{fee} 元 {flow}G，我自己在用，不忽悠。',
      '这张卡我实拍了，{flow}G 通用流量，月租 {fee}。',
      '别听人吹，先看参数：{fee} 元，{flow}G。',
      '咱不整那些虚的，卡好不好用，参数摆出来看。',
    ],
    direct: [
      '{operator}的卡，{fee} 元月租，{flow}G 通用流量。',
      '参数摆这儿：{fee} 元 / {flow}G / {voice} 分钟。',
      '{region}能发的卡，{fee} 元 {flow}G。',
      '月租 {fee}，流量 {flow}G，别的不用多问。',
    ],
    story: [
      '我表哥在工地，一个月流量费两百多，我给他换了这张。',
      '之前买的卡说好的流量，用两个月就变了，这次我盯了三个月。',
      '咱普通人办卡，就怕被套路，这张我拆开给你看。',
      '我妈不会看账单，每个月扣多少她都不知道，我给她换了这个。',
    ],
    value: [
      '{fee} 元 {flow}G，一 G 不到 {perG} 毛，自己算。',
      '同样的钱，多出来的流量就是省下的钱。',
      '{fee} 元能拿到 {flow}G，刷一整个月够用。',
      '一天 {perDay} 块，比一包烟便宜。',
    ],
  },
  moments: {
    seed: [
      '最近把套餐换了，{fee} 元 {flow}G，用着还行。',
      '有朋友问我在用啥卡，统一回一下：{fee} 元 {flow}G。',
      '话费这事，能省一点是一点。',
      '换卡一个月了，记录一下：{fee} 元，{flow}G。',
    ],
    direct: [
      '{operatorSpaced}{fee} 元 {flow}G，需要的私我。',
      '月租 {fee} 元，{flow}G 通用流量，正规卡。',
      '{fee} 元 {flow}G，办卡年龄 {age}。',
      '{fee} 元一个月，{flow}G 流量，办卡入口在这。',
    ],
    story: [
      '上个月话费单出来，我自己都愣了一下。',
      '我妈一直用一百多的套餐，说了两年才肯换。',
      '帮同事办了张卡，他问我为啥不早说。',
      '去年为了省话费折腾了半个月，现在总算安生了。',
    ],
    value: [
      '{fee} 元 {flow}G，一天 {perDay} 块。',
      '同样刷视频，月租能低一截。',
      '算下来一个月 {fee} 元，比两杯奶茶便宜。',
      '{fee} 元换 {flow}G，一个月不用再买加油包。',
    ],
  },
  channels: {
    direct: [
      '{operator}的卡，月租 {fee} 元，{flow}G 通用流量。',
      '今天讲清楚一张卡：{fee} 元，{flow}G，{voice} 分钟。',
      '给不太懂的朋友讲一遍：这张卡月租 {fee} 元。',
      '想换套餐的听我说完，{fee} 元 {flow}G 是怎么算的。',
    ],
    story: [
      '有位粉丝六十多岁，问我流量卡到底怎么选。',
      '我邻居上个月流量超了，扣了六十多块。',
      '很多朋友办了卡不会看账单，今天说清楚。',
      '一位老同事换卡踩了坑，我把过程讲一遍。',
    ],
    value: [
      '{fee} 元一个月，{flow}G 流量，刷视频看新闻都够。',
      '按月租算，一天 {perDay} 块，比想象中便宜。',
      '流量够用、月租不高，这就是它实在的地方。',
      '{fee} 元能拿到 {flow}G，比多数套餐都实在。',
    ],
    qa: [
      '常有朋友问：这种卡和营业厅的有什么区别？',
      '有人担心网上办的卡不能用，我说三点。',
      '办卡要不要先交钱？首充 {firstCharge} 元是怎么回事，讲清楚。',
      '合约期没到期能不能注销？这个问题最多人问。',
    ],
  },
  weibo: {
    direct: [
      '{operatorSpaced}{fee} 元 {flow}G，参数如下。',
      '月租 {fee} 元，{flow}G 全国通用流量。',
      '{fee} 元 {flow}G 的卡，整理了一下。',
      '一条说完：{fee} 元 / {flow}G / {voice} 分钟。',
    ],
    value: [
      '{fee} 元 {flow}G，同档位里算实在的。',
      '折算下来一 G 不到 {perG} 毛，自己对比。',
      '月租 {fee}，流量 {flow}G，值不值自己看。',
      '一天 {perDay} 块的成本，换 {flow}G 流量。',
    ],
    qa: [
      '问的人多，统一回答几个关于流量卡的问题。',
      '流量卡能不能长期用？先说结论再说原因。',
      '首充这笔钱到底怎么算？说清楚。',
      '为什么线上办的卡便宜，答案在成本结构里。',
    ],
  },
  bilibili: {
    direct: [
      '{operatorSpaced}{fee} 元 {flow}G，这期把参数和坑一起讲完。',
      '一张 {fee} 元 {flow}G 的卡，值不值得办，我拆开说。',
      '本期讲清楚：{fee} 元月租的流量卡到底怎么选。',
      '{fee} 元能拿到 {flow}G，先看完整参数。',
    ],
    value: [
      '{fee} 元 {flow}G，我们把每 G 单价算出来。',
      '同价位套餐横向对比，参数都在这期里。',
      '月租 {fee} 元能拿到 {flow}G，账先算清楚。',
      '一天 {perDay} 块，一年下来是多少，这期算给你看。',
    ],
    qa: [
      '弹幕问最多的几个问题，这期统一回答。',
      '「流量卡会不会突然涨价」这期讲明白。',
      '首充、合约期、发货范围，三个最容易踩的坑。',
      '线上办的卡和营业厅的卡，到底差在哪。',
    ],
    story: [
      '这期不讲参数，讲我踩过的三个坑。',
      '去年我办了张卡，用了两个月才发现合约期是两年。',
      '帮朋友挑卡挑了半个月，过程记录一下。',
      '为了每月省几十块，我把市面上的套餐翻了一遍。',
    ],
  },
  group: {
    direct: [
      '{operatorSpaced}{fee} 元 {flow}G，参数在下。',
      '【{fee} 元 / {flow}G】{operator}卡，{region}可发。',
      '月租 {fee} 元，{flow}G 通用流量，{voice} 分钟通话。',
      '{fee} 元 {flow}G，正规卡，需要私聊。',
    ],
    value: [
      '{fee} 元 {flow}G，一 G 不到 {perG} 毛。',
      '同价位对比：{fee} 元拿到 {flow}G。',
      '月租 {fee} 元，刷一个月视频够用。',
      '一天 {perDay} 块，比加油包划算。',
    ],
    qa: [
      '群里有朋友问这张卡的情况，统一回。',
      '常见问题：月租、首充、发货，一条条说。',
      '办之前先看这三条，能省不少事。',
      '关于这张卡，问得最多的还是首充和合约期。',
    ],
  },
};

/** 钩子全部不可用时的兜底模板 */
const FALLBACK_HOOKS: readonly string[] = [
  '先说结论：{name}。',
  '这张卡的参数，一条条讲清楚。',
  '不绕弯子，先把核心数字摆出来。',
];

// ===================== 四、行动指令 =====================

/** 各平台的行动指令（CTA） */
const CTA_BANK: Record<PlatformId, readonly string[]> = {
  xiaohongshu: [
    '想看的可以评论区问我，看到都会回～',
    '有需要的姐妹评论区扣「1」，我把办理方式发你。',
    '不确定自己适合哪个的，评论区说下每月用量，我帮你看看。',
  ],
  douyin: [
    '想要的评论区扣「卡」，主页有入口。',
    '还有不懂的评论区问，我一条条回。',
    '看完还是不会选，评论区留个用量，我给你算。',
  ],
  kuaishou: [
    '想办的评论区说一声，我给你讲清楚。',
    '有啥不明白的评论区问我，老铁不忽悠。',
    '需要的私信我，先问清楚再办。',
  ],
  moments: [
    '需要的私我，我把办理方式发你。',
    '想了解的评论区说一声。',
    '有需要的直接找我，不着急，先问清楚。',
  ],
  channels: [
    '有不明白的评论区留言，我下期讲。',
    '想了解的可以私信我，慢慢问。',
    '觉得有用，转给家里需要的人。',
  ],
  weibo: [
    '需要的转评，我把入口放评论区。',
    '有疑问评论区问，统一回。',
    '想了解的点个赞，我私信发你。',
  ],
  bilibili: [
    '参数表在置顶评论，需要的自取。',
    '还有想看的对比，弹幕告诉我。',
    '办之前有疑问，评论区问，我尽量回。',
  ],
  group: ['需要的私聊我，我发办理入口。', '有疑问直接在群里问。', '确认要办的扣 1，我一个个发。'],
};

// ===================== 五、各平台正文 =====================

/**
 * 小红书正文：分段、克制 emoji、结尾引导评论，并带合规声明行。
 *
 * 开场白由 `hook` 承担（`full` 里 hook 与 body 拼接），正文直接从参数块开始，
 * 避免同一条文案里出现两句意思重复的开场。
 *
 * @param facts - 事实视图。
 * @param tone - 体裁。
 * @param index - 变体下标（用于轮转收尾句）。
 * @returns 正文文本。
 */
function buildXiaohongshuBody(facts: FactView, tone: CopyTone, index: number): string {
  const closes: Partial<Record<CopyTone, readonly string[]>> = {
    seed: [
      '用下来感觉是：只要用量对得上，这张卡就够用。',
      '一个月的体感是稳定，没出现我担心的情况。',
      '目前没换回去的打算，后续有变化再来更新。',
    ],
    direct: [
      '参数就这些，剩下的看自己用量是否匹配。',
      '数字都在这儿了，合适就办，不合适就再挑。',
      '关键信息就上面几条，不用再看别的长文。',
    ],
    story: [
      '换完之后最明显的变化是，月底不用盯着流量剩多少了。',
      '账单从一百多降到这个数，我妈终于不念叨了。',
      '过程比想象中简单，激活那一步花的时间最多。',
    ],
    value: [
      '同样刷视频，这一档的月租确实低一截。',
      '把流量单价摊开看，比只看月租清楚得多。',
      '如果每月用量在这个区间，这一档是划算的。',
    ],
    qa: [
      '还有别的问题可以评论区补充，我看到就回。',
      '上面没覆盖到的情况，评论区说下你的用量。',
      '不同地区的政策会有差异，以办理页为准。',
    ],
  };

  const params = paramLines(facts, 'plain');
  const cautions = cautionLines(facts);
  const blocks: string[] = [];

  if (params.length > 0) {
    blocks.push(['📌 这张卡的参数', ...params].join('\n'));
  }
  if (cautions.length > 0) {
    blocks.push(['📌 办之前先确认', ...cautions.map((line) => `· ${line}`)].join('\n'));
  }
  blocks.push(pickTone(closes, tone, index));
  blocks.push(COMPLIANCE_LINE);

  return blocks.join('\n\n');
}

/**
 * 抖音正文：分镜口播脚本 + 拍摄建议。
 *
 * @param facts - 事实视图。
 * @param tone - 体裁。
 * @param index - 变体下标。
 * @returns 正文文本。
 */
function buildDouyinBody(facts: FactView, tone: CopyTone, index: number): string {
  const visuals: Partial<Record<CopyTone, readonly string[]>> = {
    seed: ['手机流量详情页怼脸拍，配一句吐槽', '举着卡板正对镜头，背景是自家桌子'],
    direct: ['手持卡片正对镜头，背景干净', '手机屏幕录制套餐页，边划边念'],
    story: ['坐在桌前对着镜头讲，别剪太碎', '走路跟拍，手里拿着账单'],
    value: ['把月租和流量写在纸上举着', '手机计算器界面特写，边按边念'],
    qa: ['屏幕录制评论区，边划边讲', '对着镜头一条条回答，配字幕'],
  };

  const first = [
    facts.operatorLabel ? `这张是${facts.operatorLabel}的卡` : '这张卡',
    facts.fee > 0 ? `月租 ${facts.fee} 元` : '',
    facts.flow > 0 ? `${facts.flow}G 全国通用流量` : '',
    facts.voice > 0 ? `${facts.voice} 分钟通话` : '',
  ]
    .filter(Boolean)
    .join('，');

  const secondParts: string[] = [];
  if (facts.firstCharge > 0) {
    secondParts.push(`激活要先充 ${facts.firstCharge} 元话费，这笔钱是你的话费，不是额外收费`);
  }
  if (facts.firstMonth) secondParts.push(`首月${facts.firstMonth}`);
  if (facts.contractMonths > 0) secondParts.push(`合约期 ${facts.contractMonths} 个月`);
  const second = secondParts.length > 0 ? `${secondParts.join('，')}。` : '';

  const thirdParts: string[] = [];
  if (facts.shipRegion) thirdParts.push(`发货${facts.shipRegion}`);
  if (facts.ageRange) thirdParts.push(`办卡年龄 ${facts.ageRange}`);
  if (facts.activateType) thirdParts.push(`激活方式是${facts.activateType}`);
  const third =
    thirdParts.length > 0
      ? `${thirdParts.join('，')}。参数以办理页为准。`
      : '参数以运营商办理页公示为准，别听二手转述。';

  const lines = [
    `【0-3秒】画面：${pickTone(visuals, tone, index)}（这句就是钩子，别再另写开场白）`,
    `【3-10秒】口播：${first}。`,
    second ? `【10-20秒】口播：${second}` : '',
    `【20-30秒】口播：${third}`,
    '',
    '📷 拍摄建议：前 3 秒只给结论，参数放 10 秒以后；字幕用大字，别盖住人脸',
  ].filter((line) => line !== '');

  return lines.join('\n');
}

/**
 * 快手正文：短、接地气、强调真实与本地可办。
 *
 * 开场由 `hook` 承担，正文直接给参数，避免与钩子重复。
 *
 * @param facts - 事实视图。
 * @param tone - 体裁。
 * @param index - 变体下标。
 * @returns 正文文本。
 */
function buildKuaishouBody(facts: FactView, tone: CopyTone, index: number): string {
  const closes: Partial<Record<CopyTone, readonly string[]>> = {
    seed: ['用了这些天，没出过岔子。', '真实感受就这些，不吹。'],
    direct: ['就这些，合适就办。', '参数摆这儿了，自己判断。'],
    story: ['这次总算没被套路。', '办之前问清楚，比啥都强。'],
    value: ['这么算下来是划算的。', '账算明白了再决定。'],
    qa: ['还有不明白的直接问。', '问清楚再办，不着急。'],
  };

  const params = paramLines(facts, 'kv');
  const blocks: string[] = [];
  if (params.length > 0) blocks.push(params.join('\n'));
  if (facts.shipRegion && !/不发|不支持/.test(facts.shipRegion)) {
    blocks.push(`发货这块：${facts.shipRegion}，别的地方暂时发不了。`);
  }
  if (facts.firstCharge > 0) {
    blocks.push(`首充 ${facts.firstCharge} 元是话费，会到账，不是白交。`);
  }
  blocks.push(pickTone(closes, tone, index));
  return blocks.join('\n\n');
}

/**
 * 朋友圈正文：3-5 行，口语，不刷屏。
 *
 * 开场由 `hook` 承担，正文只放参数与门槛，避免同一条里重复寒暄；
 * 因此这里不需要体裁与轮转下标，签名只保留事实视图。
 *
 * @param facts - 事实视图。
 * @returns 正文文本。
 */
function buildMomentsBody(facts: FactView): string {
  const lines: string[] = [];
  const core: string[] = [];
  if (facts.fee > 0) core.push(`月租 ${facts.fee} 元`);
  if (facts.flow > 0) core.push(`${facts.flow}G 通用流量`);
  if (facts.voice > 0) core.push(`${facts.voice} 分钟通话`);
  if (core.length > 0) lines.push(core.join('，'));

  if (facts.firstCharge > 0) lines.push(`激活先充 ${facts.firstCharge} 元话费，钱是你的话费。`);
  if (facts.shipRegion) lines.push(`发货：${facts.shipRegion}。`);
  if (facts.contractMonths > 0) lines.push(`合约期 ${facts.contractMonths} 个月，办之前看清楚。`);
  if (facts.ageRange) lines.push(`办卡年龄 ${facts.ageRange}。`);

  return lines.slice(0, 5).join('\n');
}

/**
 * 视频号正文：短句分段，把话讲清楚（中老年用户占比高）。
 *
 * @param facts - 事实视图。
 * @param tone - 体裁。
 * @param index - 变体下标。
 * @returns 正文文本。
 */
function buildChannelsBody(facts: FactView, tone: CopyTone, index: number): string {
  const opens: Partial<Record<CopyTone, readonly string[]>> = {
    direct: ['今天把这张卡讲清楚。', '想换套餐的，听我说完。'],
    story: ['有位六十多岁的粉丝问我，流量卡到底怎么选。', '我邻居上个月流量超了，扣了六十多块。'],
    value: ['这张卡好在哪，我一条条说。', '钱花在哪，得算明白。'],
    qa: ['大家问得最多的几个问题，今天统一回答。', '关于办卡，先把这几个疑问解决。'],
  };

  const blocks = [pickTone(opens, tone, index)];
  const params = paramLines(facts, 'kv');
  if (params.length > 0) blocks.push(params.join('\n'));

  const notes: string[] = [];
  if (facts.firstCharge > 0) {
    notes.push(`激活时要先充 ${facts.firstCharge} 元，这笔钱是话费，会到账。`);
  }
  if (facts.contractMonths > 0) {
    notes.push(`合约期是 ${facts.contractMonths} 个月，中途注销按运营商规定处理。`);
  }
  if (facts.shipRegion) notes.push(`发货范围是${facts.shipRegion}，其他地区办不了。`);
  if (facts.ageRange) notes.push(`办卡年龄 ${facts.ageRange}。`);
  if (notes.length > 0) blocks.push(notes.join('\n'));

  blocks.push('资费以运营商官方页面公示为准，办之前自己再核对一遍。');
  return blocks.join('\n\n');
}

/**
 * 微博正文：短平快，2-3 段。
 *
 * @param facts - 事实视图。
 * @param tone - 体裁。
 * @param index - 变体下标。
 * @returns 正文文本。
 */
function buildWeiboBody(facts: FactView, tone: CopyTone, index: number): string {
  const opens: Partial<Record<CopyTone, readonly string[]>> = {
    direct: ['一条说完这张卡。', '参数如下，自己看。'],
    value: ['同价位比了一圈，说下结论。', '把账算开，比听人说划算。'],
    qa: ['问的人多，统一回。', '这几个问题，先说结论。'],
  };

  const blocks = [pickTone(opens, tone, index)];
  const params = paramLines(facts, 'kv');
  if (params.length > 0) blocks.push(params.join('\n'));

  const tail: string[] = [];
  if (facts.firstCharge > 0) tail.push(`首充 ${facts.firstCharge} 元是话费，会到账`);
  if (facts.shipRegion) tail.push(`发货${facts.shipRegion}`);
  if (facts.contractMonths > 0) tail.push(`合约期 ${facts.contractMonths} 个月`);
  if (tail.length > 0) blocks.push(`${tail.join('，')}。`);

  blocks.push('资费以运营商官方页面为准。');
  return blocks.join('\n\n');
}

/**
 * B站正文：可长文科普，参数表 + 分点说明。
 *
 * @param facts - 事实视图。
 * @param tone - 体裁。
 * @param index - 变体下标。
 * @returns 正文文本。
 */
function buildBilibiliBody(facts: FactView, tone: CopyTone, index: number): string {
  const opens: Partial<Record<CopyTone, readonly string[]>> = {
    direct: ['先说结论，再说细节。', '这期不废话，直接拆参数。'],
    value: ['这期做一次横向对比。', '把每 G 单价算清楚，比什么都直观。'],
    qa: ['这期回答弹幕里问得最多的几个问题。', '关于流量卡，先把常见误解讲清楚。'],
    story: ['这期不讲参数，讲踩过的坑。', '记录一次完整的换卡过程。'],
  };

  const blocks = [pickTone(opens, tone, index)];

  const params = paramLines(facts, 'kv');
  if (params.length > 0) {
    blocks.push(['【参数】', ...params].join('\n'));
  }

  const cautions = cautionLines(facts);
  if (cautions.length > 0) {
    const numbered = cautions.map((line, i) => `${i + 1}. ${line}`);
    blocks.push(['【要注意的地方】', ...numbered].join('\n'));
  }

  const analysis: string[] = [];
  if (facts.fee > 0 && facts.flow > 0) {
    // perGJiao 在极端单价（如 300 元 10G）下返回空串，直接拼会留下「大概  毛」残句
    const perG = perGJiao(facts);
    analysis.push(
      (perG ? `按 ${facts.fee} 元 / ${facts.flow}G 折算，每 G 大概 ${perG} 毛，` : `按 ${facts.fee} 元 / ${facts.flow}G 折算，单价不算低，`) +
        '这个价位主要看通用流量给得够不够，定向流量再多也要单独算。'
    );
  }
  if (facts.contractMonths > 0) {
    analysis.push(
      `合约期 ${facts.contractMonths} 个月意味着中途注销要按运营商规则处理，` +
        '打算短期用的人要提前想清楚。'
    );
  }
  if (facts.firstCharge > 0) {
    analysis.push(
      `首充 ${facts.firstCharge} 元本质是预存话费，会分月或一次性到账，` +
        '不算在月租之外多收一笔。'
    );
  }
  if (analysis.length > 0) blocks.push(['【怎么看这张卡】', ...analysis].join('\n'));

  blocks.push(COMPLIANCE_LINE);
  return blocks.join('\n\n');
}

/**
 * 群聊正文：信息密度优先，直接给参数。
 *
 * @param facts - 事实视图。
 * @param tone - 体裁。
 * @param index - 变体下标。
 * @returns 正文文本。
 */
function buildGroupBody(facts: FactView, tone: CopyTone, index: number): string {
  const heads: Partial<Record<CopyTone, readonly string[]>> = {
    direct: ['【办卡信息】', '【套餐参数】'],
    value: ['【性价比参考】', '【算账】'],
    qa: ['【常见问题】', '【统一回复】'],
  };

  const params = paramLines(facts, 'kv');
  const blocks = [pickTone(heads, tone, index)];
  if (params.length > 0) blocks.push(params.join('\n'));

  const notes: string[] = [];
  if (facts.firstCharge > 0) notes.push(`首充 ${facts.firstCharge} 元是话费，会到账`);
  if (facts.shipRegion) notes.push(`发货范围：${facts.shipRegion}`);
  if (facts.contractMonths > 0) notes.push(`合约期 ${facts.contractMonths} 个月`);
  if (facts.activateType) notes.push(`激活方式：${facts.activateType}`);
  if (notes.length > 0) blocks.push(`${notes.join('；')}。`);

  return blocks.join('\n\n');
}

/**
 * 按平台分派正文生成。
 *
 * @param facts - 事实视图。
 * @param platform - 平台 id。
 * @param tone - 体裁。
 * @param index - 变体下标。
 * @returns 正文文本。
 */
function buildBody(facts: FactView, platform: PlatformId, tone: CopyTone, index: number): string {
  switch (platform) {
    case 'xiaohongshu':
      return buildXiaohongshuBody(facts, tone, index);
    case 'douyin':
      return buildDouyinBody(facts, tone, index);
    case 'kuaishou':
      return buildKuaishouBody(facts, tone, index);
    case 'moments':
      return buildMomentsBody(facts);
    case 'channels':
      return buildChannelsBody(facts, tone, index);
    case 'weibo':
      return buildWeiboBody(facts, tone, index);
    case 'bilibili':
      return buildBilibiliBody(facts, tone, index);
    case 'group':
    default:
      return buildGroupBody(facts, tone, index);
  }
}

// ===================== 六、发布注意点 =====================

/** 平台通用注意点 */
const PLATFORM_NOTES: Record<PlatformId, string> = {
  xiaohongshu: '封面用套餐截图或账单实拍，别用大字报，容易被判营销号',
  douyin: '前 3 秒只给结论，参数放 10 秒以后，完播率更高',
  kuaishou: '口播用方言更自然，别端着念稿',
  moments: '一天最多发一条，配图比文字重要',
  channels: '语速放慢，把「首充」「合约期」念清楚',
  weibo: '话题词放正文末尾，别堆在开头',
  bilibili: '简介里放参数表和办理入口，正文别贴长链接',
  group: '同一句话别在多个群复制粘贴，容易被举报',
};

/** 体裁通用注意点 */
const TONE_NOTES: Record<CopyTone, string> = {
  seed: '以个人体验口吻发，别用「官方」自居',
  direct: '参数优先，少加形容词',
  story: '故事里的细节要真实，编了会被评论区拆穿',
  value: '对比只跟公开价格比，别说「全网最低」',
  qa: '问题按真实私信顺序排，别自问自答得太假',
};

/**
 * 生成本条专属的发布注意点。
 *
 * @param facts - 事实视图。
 * @param spec - 原始套餐（用于判断哪些字段缺失）。
 * @param platform - 平台 id。
 * @param tone - 体裁。
 * @returns 最多 4 条注意点。
 */
function buildNotes(
  facts: FactView,
  spec: ProductSpec,
  platform: PlatformId,
  tone: CopyTone
): string[] {
  const notes: string[] = [];

  if (spec.monthlyFee <= 0) {
    notes.push('未解析到月租，这条文案里没有价格数字，确认后再发');
  }
  if (spec.flowGb <= 0) {
    notes.push('未解析到通用流量，正文没写流量额度，别凭印象补数字');
  }
  if (facts.shipRegion) {
    notes.push(`发货范围是「${facts.shipRegion}」，别写成全国发货`);
  }
  if (facts.firstCharge > 0) {
    notes.push(`首充 ${facts.firstCharge} 元必须写进正文，只写月租容易被判低价包装`);
  }
  if (!facts.duration && facts.fee > 0) {
    notes.push('优惠期未标注，正文不要写「长期」，建议补一句到期后按运营商公示资费执行');
  }
  if (facts.contractMonths > 0) {
    notes.push(`合约期 ${facts.contractMonths} 个月，评论区问到要如实说`);
  }

  // 平台/体裁提醒必须留下：先取最重要的两条素材提醒，再补平台与体裁各一条
  return [...notes.slice(0, 2), PLATFORM_NOTES[platform], TONE_NOTES[tone]];
}

// ===================== 七、主入口 =====================

/**
 * 生成推广文案变体。
 *
 * 纯本地模板生成：同一 `spec + platform + tone + seed` 的输出完全可复现，
 * 换 `seed` 即换钩子与段落顺序。所有数字都来自 `spec`，
 * 缺失字段对应的话术会被整句跳过，不会出现「0G」「undefined」这类残句。
 *
 * @param spec - 已解析（或人工补全）的套餐事实。
 * @param platform - 目标平台。
 * @param tone - 文案体裁；平台不支持的体裁会回退到该平台第一个体裁。
 * @param opts - 链接、条数、落款、随机种子。
 * @returns 文案变体数组，长度等于 `opts.count`（默认 3）。
 */
export function generateVariants(
  spec: ProductSpec,
  platform: PlatformId,
  tone: CopyTone,
  opts: GenerateOptions = {}
): CopyVariant[] {
  const meta = getPlatform(platform);
  const finalTone = meta.tones.includes(tone) ? tone : meta.tones[0];
  const facts = buildFacts(spec);
  const values = buildValues(facts);

  const rawCount = Number(opts.count ?? 3);
  const count = Math.min(
    MAX_COUNT,
    Math.max(MIN_COUNT, Number.isFinite(rawCount) ? Math.floor(rawCount) : 3)
  );
  const brand = (opts.brand ?? DEFAULT_BRAND).trim() || DEFAULT_BRAND;
  const link = (opts.link ?? '').trim();
  const seed = Number.isFinite(opts.seed) ? Math.floor(opts.seed as number) : 0;
  const offset = Math.abs(seed) % 997;

  const tagList = buildTags(spec, platform);

  const hookPool = (HOOK_BANK[platform]?.[finalTone] ?? [])
    .map((template) => renderTemplate(template, values))
    .filter((hook): hook is string => Boolean(hook));

  const fallbackPool = FALLBACK_HOOKS.map((template) => renderTemplate(template, values)).filter(
    (hook): hook is string => Boolean(hook)
  );

  const hooks = hookPool.length > 0 ? hookPool : fallbackPool;
  const ctaPool = CTA_BANK[platform] ?? CTA_BANK.xiaohongshu;

  return Array.from({ length: count }, (_unused, index) => {
    const hook =
      hooks.length > 0 ? pick(hooks, offset + index) : `先说结论：${coreNumbers(facts)}。`;
    const body = buildBody(facts, platform, finalTone, offset + index);

    const baseCta = pick(ctaPool, offset + index);
    const cta = link ? `${baseCta}\n${link}` : baseCta;

    const tags = [...tagList];
    // 落款放在 CTA 与标签之间：既用上了 opts.brand，又不会打断正文阅读节奏。
    const signature = getBrandLine(brand);
    const full = [hook, body, cta, signature, tags.join(' ')]
      .filter((part) => part !== '')
      .join('\n\n');

    return {
      id: `${platform}-${finalTone}-${index}`,
      platform,
      tone: finalTone,
      hook,
      body,
      cta,
      tags,
      notes: buildNotes(facts, spec, platform, finalTone),
      full,
    };
  });
}

/**
 * 生成落款行，供页面控制器拼在卡片图或文案尾部。
 *
 * @param brand - 落款名称，默认「号卡之家」。
 * @returns 形如「—— 号卡之家」的落款。
 */
export function getBrandLine(brand?: string): string {
  const name = (brand ?? DEFAULT_BRAND).trim() || DEFAULT_BRAND;
  return `—— ${name}`;
}
