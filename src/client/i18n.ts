/**
 * 工作台文案字典。
 *
 * 两个语言都写全：`locale.register` 的双语形式要求 zh / en 键集合一致，
 * 少一个键在切换语言时就会露出原始 key。
 */
export const NS = 'studio'

const zh = {
  panel: '推广创作台',
  title: '推广创作台',
  subtitle: '粘贴商品原文 → 生成合规文案与卡片图',
  'tab.copy': '推广文案',
  'tab.poster': '卡片图',

  'section.source': '商品原文',
  'section.spec': '识别到的套餐',
  'section.compliance': '合规体检',
  'section.copy': '生成设置',
  'section.result': '生成结果',
  'section.poster': '出图设置',
  'section.preview': '预览',

  'btn.parse': '解析',
  'btn.sample': '填入示例',
  'btn.clear': '清空',
  'btn.generate': '生成文案',
  'btn.render': '生成卡片图',
  'btn.download': '下载图片',
  'btn.copy': '复制',
  'btn.copyAll': '复制全文',
  'btn.copyTags': '复制标签',

  'hint.source': '把上游给的商品文案整段粘进来，格式不限。',
  'hint.chips': '逗号分隔，最多渲染 4 个',
  'hint.qr': '留空则不画二维码',
  'hint.link': '会拼在行动指令后面，留空则不带链接',

  'label.platform': '发布平台',
  'label.tone': '文案体裁',
  'label.count': '生成条数',
  'label.link': '推广链接',
  'label.brand': '落款名称',
  'label.size': '图片尺寸',
  'label.theme': '配色主题',
  'label.headline': '主标题',
  'label.subline': '副标题',
  'label.chips': '卖点标签',
  'label.footer': '页脚落款',
  'label.qr': '二维码链接',
  'label.scale': '导出倍率',

  'field.monthlyFee': '月租(元)',
  'field.flowGb': '通用流量(GB)',
  'field.voiceMinutes': '通话(分钟)',
  'field.firstCharge': '首充(元)',
  'field.contractMonths': '合约期(月)',
  'field.operator': '运营商',
  'field.shipRegion': '发货地区',
  'field.ageRange': '办卡年龄',
  'field.activateType': '激活方式',
  'field.expressType': '快递方式',
  'field.perks': '附加权益',
  'field.duration': '优惠期',

  'compliance.pass': '未发现风险表述',
  'compliance.warn': '有需要留意的地方',
  'compliance.block': '发现禁用表述，发布前必须修改',
  'compliance.empty': '解析后自动体检',

  'status.missing': '未识别',
  'status.matched': '已识别',
  'status.empty': '先粘贴商品原文并解析',
  'status.rendering': '正在出图…',
  'status.noPoster': '还没有生成卡片图',
  'status.copied': '已复制',
  'status.parseFirst': '请先解析商品原文',

  'note.tags': '标签',
  'note.publish': '发布注意',
}

const en: typeof zh = {
  panel: 'Promo Studio',
  title: 'Promo Studio',
  subtitle: 'Paste a product sheet to generate compliant copy and cards',
  'tab.copy': 'Copy',
  'tab.poster': 'Card image',

  'section.source': 'Product sheet',
  'section.spec': 'Detected plan',
  'section.compliance': 'Compliance check',
  'section.copy': 'Generation settings',
  'section.result': 'Results',
  'section.poster': 'Card settings',
  'section.preview': 'Preview',

  'btn.parse': 'Parse',
  'btn.sample': 'Load sample',
  'btn.clear': 'Clear',
  'btn.generate': 'Generate copy',
  'btn.render': 'Render card',
  'btn.download': 'Download',
  'btn.copy': 'Copy',
  'btn.copyAll': 'Copy all',
  'btn.copyTags': 'Copy tags',

  'hint.source': 'Paste the whole product sheet here; the format is free-form.',
  'hint.chips': 'Comma separated, at most 4 are drawn',
  'hint.qr': 'Leave empty to skip the QR code',
  'hint.link': 'Appended to the call to action',

  'label.platform': 'Platform',
  'label.tone': 'Tone',
  'label.count': 'Variants',
  'label.link': 'Promo link',
  'label.brand': 'Signature',
  'label.size': 'Size',
  'label.theme': 'Theme',
  'label.headline': 'Headline',
  'label.subline': 'Subline',
  'label.chips': 'Selling points',
  'label.footer': 'Footer',
  'label.qr': 'QR link',
  'label.scale': 'Export scale',

  'field.monthlyFee': 'Monthly (CNY)',
  'field.flowGb': 'Data (GB)',
  'field.voiceMinutes': 'Minutes',
  'field.firstCharge': 'First top-up',
  'field.contractMonths': 'Contract (mo)',
  'field.operator': 'Carrier',
  'field.shipRegion': 'Ships to',
  'field.ageRange': 'Age range',
  'field.activateType': 'Activation',
  'field.expressType': 'Delivery',
  'field.perks': 'Extras',
  'field.duration': 'Validity',

  'compliance.pass': 'No risky wording found',
  'compliance.warn': 'A few things to watch',
  'compliance.block': 'Forbidden wording — fix before publishing',
  'compliance.empty': 'Runs automatically after parsing',

  'status.missing': 'Not detected',
  'status.matched': 'Detected',
  'status.empty': 'Paste a product sheet and parse it first',
  'status.rendering': 'Rendering…',
  'status.noPoster': 'No card rendered yet',
  'status.copied': 'Copied',
  'status.parseFirst': 'Parse the product sheet first',

  'note.tags': 'Tags',
  'note.publish': 'Before publishing',
}

export const DICTS = { zh, en }

/** 未注册 key 时的兜底，避免界面出现裸 key。 */
export type StudioKey = keyof typeof zh
