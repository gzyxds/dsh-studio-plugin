/**
 * 推广创作台 · 合规体检
 *
 * 流量卡是平台重点监管品类：极限用语、低价包装、虚假授权、承诺收益这几类表述
 * 轻则限流、重则封号，上游文案里还常带着「不允许包装9元、宣传永久、宣传归属地」
 * 这类硬约束。本模块把监管口径固化成规则表，对任何一段推广文案做扫描。
 *
 * 分工：
 * - `issues` 只报告，不改原文，供运营逐条确认；
 * - `sanitized` 只做**确定安全**的词面替换（极限词 → 弱化表达），
 *   无法自动修复的（虚假授权、低价包装、承诺收益）保持原文并靠 issues 提示。
 */
import type { ComplianceIssue, ComplianceLevel, ComplianceReport } from './types.ts';

/** 单条合规规则 */
export interface ComplianceRule {
  /** 规则 id，用于统计与豁免 */
  id: string;
  /** 命中模式（必须带 g 标志，模块内不共享 lastIndex） */
  pattern: RegExp;
  /** 风险等级 */
  level: ComplianceLevel;
  /** 规则短名（如「极限用语」） */
  rule: string;
  /** 为什么违规（给运营看的人话） */
  reason: string;
  /** 建议替换文案（可直接落地） */
  suggestion: string;
  /**
   * 命中后的二次校验（可选）：返回 false 表示这次命中属于误报，直接跳过。
   *
   * 用于「同一个词在不同语境下含义不同」的场景，例如「每天 1.5 元」是折算价，
   * 不是把套餐包装成 1.5 元/月。
   *
   * @param source - 被扫描的文本（约束句已置空）。
   * @param index - 命中位置。
   * @param matched - 命中的字面。
   */
  guard?: (source: string, index: number, matched: string) => boolean;
  /**
   * 可自动替换的安全词表（可选）。
   *
   * 只有「换成弱化表达后含义仍成立」的词才给这一项；需要补真实数据的
   * （月租、流量额度、授权资质）一律不给，避免把违规句改成语义错误的句子。
   */
  fixes?: ReadonlyArray<readonly [string, string]>;
}

/** 风险等级排序权重，用于取最高级 */
const LEVEL_WEIGHT: Record<ComplianceLevel, number> = { pass: 0, warn: 1, block: 2 };

/**
 * 合规规则表。
 *
 * 排序不影响结果（issues 最终按下标升序），但按「违法风险 → 平台处罚 → 运营建议」
 * 排列便于人工审阅。所有 pattern 都带 `g`，且不使用 `y`，保证可以多次扫描同一文本。
 */
export const COMPLIANCE_RULES: readonly ComplianceRule[] = [
  // ===== block：直接违法 / 平台必罚 =====
  {
    id: 'permanent-period',
    pattern: /(?:永久|终身|一辈子|长期有效|永久有效|永久套餐)/g,
    level: 'block',
    rule: '资费期限不实',
    reason: '「永久」「终身」无法被任何运营商套餐证实，属于虚假宣传，平台直接判违规。',
    suggestion: '按合约期如实写，例如「优惠期12个月，到期后按运营商公示资费执行」。',
    fixes: [
      ['长期有效', '长期可用'],
      ['永久有效', '长期可用'],
      ['永久套餐', '长期套餐'],
      ['永久', '长期'],
      ['终身', '长期'],
      ['一辈子', '长期'],
    ],
  },
  {
    id: 'low-price-packaging',
    // 折算价（每天 1.5 元、日均 2 元）是真实换算，不算低价包装
    pattern:
      /(?<!每天)(?<!日均)(?<!折合)(?<!平均)(?<![\d.])(?:0|1|8|9)(?:\.\d+)?\s*元(?!\s*\/\s*(?:分钟|条|GB|G|MB|M))|零月租|0月租/g,
    level: 'block',
    rule: '低价包装',
    reason: '上游明确禁止把套餐包装成 9 元 / 8 元 / 0 元等低价，与实际月租不符即属价格欺诈。',
    suggestion: '只写真实月租（如 49 元/月），首充金额单独说明。',
    guard: (source, index) =>
      !/(?:每天|日均|折合|平均|相当于|一天|按天)\s*$/.test(source.slice(Math.max(0, index - 8), index)),
  },
  {
    id: 'unlimited-claim',
    pattern: /无限流量|不限量|无限量|随便用|用不完|无限用|流量无限/g,
    level: 'block',
    rule: '绝对化流量承诺',
    reason: '运营商套餐均有限速或达量规则，「无限」「用不完」属无法履行的绝对化承诺。',
    suggestion: '写清真实额度，例如「每月 200G 全国通用流量」。',
  },
  {
    id: 'origin-region',
    pattern: /归属地/g,
    level: 'block',
    rule: '宣传归属地',
    reason: '上游明令禁止宣传归属地；归属地属运营商内部规则，宣传即违规。',
    suggestion: '只描述发货范围，例如「仅发重庆」。',
    fixes: [['归属地', '发货地']],
  },
  {
    id: 'fake-authority',
    pattern:
      /官方授权|运营商直签|官方直签|内部渠道|内部名额|官方合作|官方指定|独家代理|一级代理|总代理|官方渠道授权|官方认证|官方直营|官方补贴|运营商直营|工信部认证|正规授权/g,
    level: 'block',
    rule: '虚假授权表述',
    reason: '无授权文件却自称「官方授权」「内部渠道」，属虚假资质宣传，平台按欺诈处理。',
    suggestion: '删除授权类表述，改为「套餐内容以运营商官方页面为准」。',
  },
  {
    id: 'absolute-wording',
    pattern:
      // 「保证金」「保证期」「保证函」是正常业务名词，不算绝对化承诺
      /100\s*[%％]|百分之百|绝对(?:不会|能|可以|没问题|放心)?|保证(?![金期函书卡])(?:不会|能|可|通过|成功|有效)?|必过|包过|一定能|肯定能/g,
    level: 'block',
    rule: '绝对化用语',
    reason: '《广告法》第九条禁止使用「100%」「绝对」「保证」等绝对化用语。',
    suggestion: '改成有依据的表述，例如「实测可用」「多数用户反馈稳定」。',
    fixes: [
      ['100%', '实测'],
      ['100％', '实测'],
      ['100 %', '实测'],
      ['百分之百', '实测'],
      ['绝对', '基本'],
    ],
  },
  {
    id: 'free-claim',
    pattern:
      /0元(?:领|拿|办|用|送|得|月租)|免月租|免费用|免费(?:领取|送|拿|办|得|申请|使用|体验)|白嫖|不要钱|免单/g,
    level: 'block',
    rule: '免费诱导',
    reason: '套餐有首充门槛（如首充 200 元），「0 元领」「免费送」与实际办理条件矛盾。',
    suggestion: '写明真实门槛，例如「首充 200 元话费，话费直接到账」。',
  },
  {
    id: 'income-claim',
    pattern:
      /日入过万|月入过万|月入十万|年入百万|躺赚|稳赚|日赚\d+|月赚\d+|月入\d+|保证收益|收益保底|零风险赚钱|零风险|保本|稳赚不赔|包赚|理财|投资/g,
    level: 'block',
    rule: '承诺收益',
    reason: '承诺具体收益属违规，推广佣金随订单波动，无法保证。',
    suggestion: '删除收益数字，改为「按实际激活订单结算佣金，以后台数据为准」。',
  },
  {
    id: 'superlative',
    pattern:
      // 「最低消费」「最高速率」「唯一号码」「第一期」是客观业务表述，不算极限用语
      /最(?:便宜|低价|划算|优惠|实惠|省钱|好|强|快|稳|大)|最低(?!消费|资费|套餐|档|月租)|最高(?!速率|网速|可达|支持|下载|上传|档|配置)|全网最低|史上最低|性价比最高|行业第一|全国第一|销量第一|第一(?!个月|时间|次|天|期|步|批|轮)|唯一(?!一|号码|号卡|号|实名|通道|设备)|顶级|No\.?\s*1|NO\.?\s*1/gi,
    level: 'block',
    rule: '极限用语',
    reason: '「最」「第一」「唯一」「顶级」属《广告法》明令禁止的极限用语。',
    suggestion: '改成可比较的中性表述，例如「同档位更划算」「目前比较少见」。',
    fixes: [
      ['全网最低', '同档更实惠'],
      ['史上最低', '同档更实惠'],
      ['最便宜', '更划算'],
      ['最低价', '更实惠'],
      ['最划算', '更划算'],
      ['最优惠', '更实惠'],
      ['性价比最高', '性价比不错'],
      ['最省钱', '更省钱'],
      ['顶级', '靠谱'],
      ['唯一', '少见'],
    ],
  },

  // ===== warn：建议改，否则影响转化与限流 =====
  {
    id: 'speed-promise',
    pattern: /秒批|秒过|秒发|当天到账|当天发货|立即生效|马上到账|即刻到账|当天激活/g,
    level: 'warn',
    rule: '时效承诺',
    reason: '审核、发货、到账时间由运营商与快递决定，承诺具体时效容易引发投诉。',
    suggestion: '改为「提交后按运营商审核进度发货」。',
  },
  {
    id: 'no-throttle',
    pattern: /不限速|全程不限速|永不限速|高速不限速|极速(?:网络|上网|下载|体验)|千兆(?:网速|速率)|100\s*MB\s*\/\s*s/g,
    level: 'warn',
    rule: '不限速承诺',
    reason: '达量限速规则由运营商设定，宣传「不限速」无法保证。',
    suggestion: '改为「按运营商公示的速率规则执行」。',
  },
  {
    id: 'fake-urgency',
    pattern:
      /最后一天|仅剩\s*\d+\s*张|限量\s*\d+\s*张|错过就没|最后\s*\d+\s*个名额|马上截止|今晚截止|仅限今天|仅限今日|手慢无|名额有限|最后\s*\d+\s*天|限时(?:抢|办理|优惠)|马上涨价/g,
    level: 'warn',
    rule: '虚假紧迫感',
    reason: '虚构库存与倒计时属误导性营销，平台会判为虚假促销。',
    suggestion: '改为「活动以运营商页面公示为准」。',
  },
  {
    id: 'vague-quantity',
    pattern: /高达\s*\d+|最高\s*\d+\s*(?:G|GB|元)|多达\s*\d+|超过\s*\d+\s*(?:G|GB)/gi,
    level: 'warn',
    rule: '模糊额度',
    reason: '「高达」「最高」把额度说成浮动上限，与实际套餐不符时构成夸大。',
    suggestion: '直接写套餐内真实额度，例如「200G 全国通用流量」。',
  },
  {
    id: 'cashback',
    pattern: /返现|全返|话费全返|返费|返红包/g,
    level: 'warn',
    rule: '返现表述',
    reason: '返现 / 返费需写明到账方式与周期，否则易被判为诱导性承诺。',
    suggestion: '改为「话费按运营商规则分月返还，可在官方 APP 查询」。',
  },
  {
    id: 'external-diversion',
    pattern:
      /加(?:微信|VX|V信|vx|wx|QQ|qq|威)|微信号|wx号|扫码|扫一扫|长按识别|二维码|点击链接|点我头像|主页(?:链接|有链接|微信)|私下交易/g,
    level: 'block',
    rule: '站外引流',
    reason: '平台禁止推广内容出现微信、二维码、站外链接等引流信息，轻则限流重则封号。',
    suggestion: '删除站外联系方式，引导用户在平台内咨询或走运营商官方办理入口。',
  },
  {
    id: 'contact-info',
    pattern: /1[3-9]\d{9}|QQ\s*[:：]?\s*\d{5,}|微信\s*[:：]\s*[A-Za-z0-9_-]{4,}/g,
    level: 'block',
    rule: '联系方式',
    reason: '正文直接留手机号 / QQ / 微信号，会被平台判为站外交易并限流。',
    suggestion: '删除号码，改为「私信我了解详情」等平台内沟通方式。',
  },
  {
    id: 'fake-discount',
    pattern: /原价\s*\d+(?:\.\d+)?\s*元|划线价|专柜价|商场价|吊牌价/g,
    level: 'block',
    rule: '虚假原价',
    reason: '无法提供原价成交记录的「原价 X 元」属虚构原价，违反价格法。',
    suggestion: '删除虚构原价，直接写当前真实资费。',
  },
  {
    id: 'brand-store',
    pattern: /官方旗舰店|官方专卖店|旗舰店|官方店|直营店|授权店/g,
    level: 'block',
    rule: '虚假店铺资质',
    reason: '个人推广冒充官方旗舰店 / 授权店，属虚假主体宣传。',
    suggestion: '删除店铺资质类表述，注明「个人推广，套餐以运营商官方页面为准」。',
  },
  {
    id: 'shipping-scope',
    pattern: /全国(?:发货|可发|包邮|各地)|全国各地|不限地区|全国都能发/g,
    level: 'warn',
    rule: '发货范围夸大',
    reason: '流量卡有明确的不发货地区，宣传「全国发货」会与实际办理条件冲突。',
    suggestion: '按真实发货范围写，例如「仅发重庆」。',
  },
  {
    id: 'data-rollover',
    pattern: /流量(?:不清零|结转|可结转)|月底清零|流量永久有效/g,
    level: 'warn',
    rule: '流量结转承诺',
    reason: '是否结转、能否清零由运营商规则决定，宣传「不清零 / 可结转」易引发投诉。',
    suggestion: '改为「流量按月计费，结转规则以运营商公示为准」。',
  },
];

/**
 * 取一组 issue 中的最高风险等级。
 *
 * @param issues - 已命中的 issue 列表。
 * @returns 最高等级；无命中时为 `pass`。
 */
function highestLevel(issues: readonly ComplianceIssue[]): ComplianceLevel {
  return issues.reduce<ComplianceLevel>(
    (level, issue) => (LEVEL_WEIGHT[issue.level] > LEVEL_WEIGHT[level] ? issue.level : level),
    'pass'
  );
}

/**
 * 对文本做可自动修复的替换。
 *
 * 只应用规则表里显式声明 `fixes` 的词条，长词优先替换，避免「最便宜」被「最」类
 * 短词拆开后改错。替换后不保证 100% 合规（虚假授权等本就无法自动改写），
 * 因此调用方仍应以 `issues` 为准。
 *
 * @param text - 原文。
 * @param issues - 命中的 issue 列表（只有带 fixes 的规则参与替换）。
 * @returns 修正后的文本。
 */
function applyFixes(text: string, issues: readonly ComplianceIssue[]): string {
  const hitIds = new Set(issues.map((issue) => issue.id));
  const pairs: Array<readonly [string, string]> = [];

  for (const rule of COMPLIANCE_RULES) {
    if (!rule.fixes || !hitIds.has(rule.id)) continue;
    pairs.push(...rule.fixes);
  }
  if (pairs.length === 0) return text;

  const ordered = [...pairs].sort((a, b) => b[0].length - a[0].length);
  return ordered.reduce((result, [from, to]) => result.split(from).join(to), text);
}

/**
 * 句子级豁免的识别规则。
 *
 * 上游原文常带「平台所有产品不允许包装 9 元、宣传永久，违者永不合作」这类
 * **约束句**：它在陈述规则，不是自我宣传，但字面里恰好有 9 元 / 永久 / 归属地。
 * 若整段照扫，「填入示例」一解析就被判 block。这里把带上游主体 + 禁止词的句子
 * 用**等长空格**替换后再扫，命中下标仍与原文字符对齐。
 */
const SENTENCE_RE = /[^。！？!?；;\n]+/g;
const UPSTREAM_RE = /平台|上游|运营商|官方|工信部|商家|厂家|主办方|所有产品|任何形式/;
const PROHIBIT_RE = /不允许|禁止|严禁|切勿|不得|请勿|违者|杜绝/;
const SELF_DISCLAIM_RE = /(?:勿|不得)\s*宣传/;
const CONSTRAINT_CONTEXT_RE = /包装|宣传|话术|表述|用语|发布|使用|承诺|违规|废单|转单|二次|推广|文案|内容/;

/**
 * 把约束句替换成等长空格。
 *
 * @param source - 原文。
 * @returns 同样长度、约束句部分为空格的可扫描文本。
 */
function maskConstraintSentences(source: string): string {
  return source.replace(SENTENCE_RE, (sentence) => {
    const constrained =
      CONSTRAINT_CONTEXT_RE.test(sentence) &&
      ((UPSTREAM_RE.test(sentence) && PROHIBIT_RE.test(sentence)) ||
        SELF_DISCLAIM_RE.test(sentence));
    return constrained ? sentence.replace(/[^\n]/g, ' ') : sentence;
  });
}

/**
 * 对一段推广文案做合规体检。
 *
 * 上游约束句（如「不允许包装 9 元、宣传永久」）只陈述规则，不参与扫描；
 * 其余文本逐条跑规则表，`matched` 与 `index` 仍指向原文。
 *
 * @param text - 待检文本（生成的文案、手改稿、上游原文均可）。
 * @returns 最高等级、逐条命中、自动修正稿与扫描字数。
 */
export function checkCompliance(text: string): ComplianceReport {
  const source = String(text || '');
  if (!source.trim()) {
    return { level: 'pass', issues: [], sanitized: source, scanned: source.length };
  }

  const scannable = maskConstraintSentences(source);
  const issues: ComplianceIssue[] = [];

  for (const rule of COMPLIANCE_RULES) {
    // matchAll 内部会克隆正则，不会污染规则表里 pattern 的 lastIndex
    for (const match of scannable.matchAll(rule.pattern)) {
      const index = match.index ?? 0;
      const matched = source.slice(index, index + match[0].length).trim();
      if (!matched) continue;
      if (rule.guard && !rule.guard(scannable, index, matched)) continue;
      issues.push({
        id: rule.id,
        matched,
        level: rule.level,
        rule: rule.rule,
        reason: rule.reason,
        suggestion: rule.suggestion,
        index,
      });
    }
  }

  issues.sort((a, b) => a.index - b.index);

  return {
    level: highestLevel(issues),
    issues,
    sanitized: applyFixes(source, issues),
    scanned: source.length,
  };
}
