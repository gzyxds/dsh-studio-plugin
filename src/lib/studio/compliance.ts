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
    pattern: /(?<![\d.])(?:0|1|8|9)(?:\.\d+)?\s*元(?!\s*\/\s*(?:分钟|条|GB|G|MB|M))|零月租|0月租/g,
    level: 'block',
    rule: '低价包装',
    reason: '上游明确禁止把套餐包装成 9 元 / 8 元 / 0 元等低价，与实际月租不符即属价格欺诈。',
    suggestion: '只写真实月租（如 49 元/月），首充金额单独说明。',
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
      /官方授权|运营商直签|官方直签|内部渠道|内部名额|官方合作|官方指定|独家代理|一级代理|总代理|官方渠道授权/g,
    level: 'block',
    rule: '虚假授权表述',
    reason: '无授权文件却自称「官方授权」「内部渠道」，属虚假资质宣传，平台按欺诈处理。',
    suggestion: '删除授权类表述，改为「套餐内容以运营商官方页面为准」。',
  },
  {
    id: 'absolute-wording',
    pattern:
      /100\s*%|百分之百|绝对(?:不会|能|可以|没问题|放心)?|保证(?:不会|能|可|通过|成功|有效)?|必过|包过|一定能|肯定能/g,
    level: 'block',
    rule: '绝对化用语',
    reason: '《广告法》第九条禁止使用「100%」「绝对」「保证」等绝对化用语。',
    suggestion: '改成有依据的表述，例如「实测可用」「多数用户反馈稳定」。',
    fixes: [
      ['100%', '实测'],
      ['100 %', '实测'],
      ['百分之百', '实测'],
      ['绝对', '基本'],
    ],
  },
  {
    id: 'free-claim',
    pattern: /0元(?:领|拿|办|用|送|得)|免费(?:领取|送|拿|办|得)|白嫖|不要钱/g,
    level: 'block',
    rule: '免费诱导',
    reason: '套餐有首充门槛（如首充 200 元），「0 元领」「免费送」与实际办理条件矛盾。',
    suggestion: '写明真实门槛，例如「首充 200 元话费，话费直接到账」。',
  },
  {
    id: 'income-claim',
    pattern:
      /日入过万|月入过万|月入十万|年入百万|躺赚|稳赚|日赚\d+|月赚\d+|保证收益|收益保底|零风险赚钱/g,
    level: 'block',
    rule: '承诺收益',
    reason: '承诺具体收益属违规，推广佣金随订单波动，无法保证。',
    suggestion: '删除收益数字，改为「按实际激活订单结算佣金，以后台数据为准」。',
  },
  {
    id: 'superlative',
    pattern:
      /最(?:便宜|低价|划算|优惠|实惠|省钱|好|强|快|稳|大|低|高)|全网最低|史上最低|性价比最高|行业第一|全国第一|销量第一|第一(?!个月|时间|次|天)|唯一(?!一)|顶级|No\.?\s*1|NO\.?\s*1/gi,
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
    pattern: /不限速|全程不限速|永不限速|高速不限速/g,
    level: 'warn',
    rule: '不限速承诺',
    reason: '达量限速规则由运营商设定，宣传「不限速」无法保证。',
    suggestion: '改为「按运营商公示的速率规则执行」。',
  },
  {
    id: 'fake-urgency',
    pattern:
      /最后一天|仅剩\s*\d+\s*张|限量\s*\d+\s*张|错过就没|最后\s*\d+\s*个名额|马上截止|今晚截止/g,
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
 * 对一段推广文案做合规体检。
 *
 * @param text - 待检文本（生成的文案、手改稿、上游原文均可）。
 * @returns 最高等级、逐条命中、自动修正稿与扫描字数。
 */
export function checkCompliance(text: string): ComplianceReport {
  const source = String(text || '');
  if (!source.trim()) {
    return { level: 'pass', issues: [], sanitized: source, scanned: source.length };
  }

  const issues: ComplianceIssue[] = [];

  for (const rule of COMPLIANCE_RULES) {
    // matchAll 内部会克隆正则，不会污染规则表里 pattern 的 lastIndex
    for (const match of source.matchAll(rule.pattern)) {
      const matched = match[0];
      if (!matched) continue;
      issues.push({
        id: rule.id,
        matched,
        level: rule.level,
        rule: rule.rule,
        reason: rule.reason,
        suggestion: rule.suggestion,
        index: match.index ?? 0,
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
