/**
 * 左侧栏：商品原文 → 解析结果 → 合规体检。
 *
 * 三段是严格先后关系（解析出 spec 才能显示字段，spec 存在才有体检），所以放在
 * 同一列按阅读顺序排列，用户不需要在标签页之间来回跳。
 */
import { OPERATOR_LABEL } from '../../data/config/operators'
import type { OperatorKey } from '../../lib/studio/types'
import type { PanelProps } from '../contract'

/** 可选的运营商。 */
const OPERATOR_KEYS: OperatorKey[] = ['mobile', 'unicom', 'telecom', 'broadcast', 'unknown']

/** 合规等级 → 中文摘要 key。 */
const LEVEL_TEXT: Record<string, string> = {
  pass: 'compliance.pass',
  warn: 'compliance.warn',
  block: 'compliance.block',
}

/**
 * 商品原文输入区。
 *
 * @param props - 工作台状态与动作。
 * @returns 原文卡片。
 */
export function SourcePanel({ state, actions, t }: PanelProps) {
  return (
    <section className="ds-card">
      <h2 className="ds-card-title">
        <span>{t('section.source')}</span>
        <span className="ds-hint">{t('hint.source')}</span>
      </h2>

      <textarea
        className="ds-textarea"
        value={state.raw}
        spellCheck={false}
        placeholder={'【实体卡】重庆联通49元200G\n\n产品套餐：49元200G\n…'}
        onChange={(event) => actions.setRaw(event.target.value)}
      />

      <div className="ds-row" style={{ marginTop: 10 }}>
        <button type="button" className="ds-btn ds-btn-primary" onClick={actions.parse}>
          {t('btn.parse')}
        </button>
        <button type="button" className="ds-btn" onClick={actions.fillSample}>
          {t('btn.sample')}
        </button>
        <button
          type="button"
          className="ds-btn ds-btn-ghost"
          onClick={() => actions.setRaw('')}
          disabled={state.raw === ''}
        >
          {t('btn.clear')}
        </button>
      </div>
    </section>
  )
}

/**
 * 解析出的套餐字段表。
 *
 * 数值字段允许手改：解析器遇到上游写法不规范时会留 0，让用户自己补，
 * 比猜一个错数字安全得多。
 *
 * @param props - 工作台状态与动作。
 * @returns 套餐卡片。
 */
export function SpecPanel({ state, actions, t }: PanelProps) {
  const spec = state.spec
  if (spec === null) {
    return (
      <section className="ds-card">
        <h2 className="ds-card-title">{t('section.spec')}</h2>
        <div className="ds-empty">{t('status.empty')}</div>
      </section>
    )
  }

  const missing = new Set(state.parsed?.missing ?? [])

  /** 数字字段的行内编辑器。 */
  const numberField = (key: 'monthlyFee' | 'flowGb' | 'voiceMinutes' | 'firstCharge' | 'contractMonths', label: string) => (
    <div className="ds-field" key={key}>
      <label htmlFor={`ds-${key}`}>{label}</label>
      <input
        id={`ds-${key}`}
        className="ds-input"
        type="number"
        min={0}
        value={String(spec[key])}
        onChange={(event) => {
          const next = Number(event.target.value)
          actions.patchSpec(key, Number.isFinite(next) && next >= 0 ? Math.floor(next) : 0)
        }}
      />
    </div>
  )

  return (
    <section className="ds-card">
      <h2 className="ds-card-title">
        <span>{t('section.spec')}</span>
        <span className="ds-hint">{Math.round(spec.confidence * 100)}%</span>
      </h2>

      <div className="ds-grid">
        {numberField('monthlyFee', t('field.monthlyFee'))}
        {numberField('flowGb', t('field.flowGb'))}
        {numberField('voiceMinutes', t('field.voiceMinutes'))}
        {numberField('firstCharge', t('field.firstCharge'))}
        {numberField('contractMonths', t('field.contractMonths'))}

        <div className="ds-field">
          <label htmlFor="ds-operator">{t('field.operator')}</label>
          <select
            id="ds-operator"
            className="ds-select"
            value={spec.operator}
            onChange={(event) => actions.patchSpec('operator', event.target.value as OperatorKey)}
          >
            {OPERATOR_KEYS.map((key) => (
              <option key={key} value={key}>
                {OPERATOR_LABEL[key]}
              </option>
            ))}
          </select>
        </div>

        <div className="ds-field">
          <label htmlFor="ds-ship">{t('field.shipRegion')}</label>
          <input
            id="ds-ship"
            className="ds-input"
            value={spec.shipRegion}
            onChange={(event) => actions.patchSpec('shipRegion', event.target.value)}
          />
        </div>

        <div className="ds-field">
          <label htmlFor="ds-age">{t('field.ageRange')}</label>
          <input
            id="ds-age"
            className="ds-input"
            value={spec.ageRange}
            onChange={(event) => actions.patchSpec('ageRange', event.target.value)}
          />
        </div>

        <div className="ds-field">
          <label htmlFor="ds-activate">{t('field.activateType')}</label>
          <input
            id="ds-activate"
            className="ds-input"
            value={spec.activateType}
            onChange={(event) => actions.patchSpec('activateType', event.target.value)}
          />
        </div>

        <div className="ds-field">
          <label htmlFor="ds-express">{t('field.expressType')}</label>
          <input
            id="ds-express"
            className="ds-input"
            value={spec.expressType}
            onChange={(event) => actions.patchSpec('expressType', event.target.value)}
          />
        </div>

        <div className="ds-field">
          <label htmlFor="ds-duration">{t('field.duration')}</label>
          <input
            id="ds-duration"
            className="ds-input"
            value={spec.duration}
            onChange={(event) => actions.patchSpec('duration', event.target.value)}
          />
        </div>
      </div>

      {spec.perks.length > 0 ? (
        <div className="ds-row" style={{ marginTop: 10 }}>
          <span className="ds-hint">{t('field.perks')}</span>
          {spec.perks.map((perk) => (
            <span className="ds-chip" key={perk}>
              {perk}
            </span>
          ))}
        </div>
      ) : null}

      {missing.size > 0 ? (
        <div className="ds-row" style={{ marginTop: 10 }}>
          <span className="ds-hint">{t('status.missing')}</span>
          {[...missing].map((item) => (
            <span className="ds-chip" key={item}>
              {item}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  )
}

/**
 * 合规体检结果。
 *
 * 只列出真实命中的规则：没命中时给一句「未发现风险表述」，而不是空白，
 * 否则用户分不清是「没问题」还是「没跑」。
 *
 * @param props - 工作台状态与动作。
 * @returns 合规卡片。
 */
export function CompliancePanel({ state, t }: PanelProps) {
  const report = state.compliance

  if (report === null) {
    return (
      <section className="ds-card">
        <h2 className="ds-card-title">{t('section.compliance')}</h2>
        <div className="ds-empty">{t('compliance.empty')}</div>
      </section>
    )
  }

  return (
    <section className="ds-card">
      <h2 className="ds-card-title">
        <span>{t('section.compliance')}</span>
        <span className={`ds-level-${report.level}`} style={{ fontSize: 12 }}>
          {t(LEVEL_TEXT[report.level] ?? 'compliance.pass')}
        </span>
      </h2>

      {report.issues.length === 0 ? (
        <div className="ds-empty" style={{ padding: '12px 4px' }}>
          {t('compliance.pass')}
        </div>
      ) : (
        report.issues.map((issue, index) => (
          <div className="ds-issue" data-level={issue.level} key={`${issue.id}-${index}`}>
            <b className={`ds-level-${issue.level}`}>{issue.rule}</b>
            <p>
              命中 <code>{issue.matched}</code>
            </p>
            <p>{issue.reason}</p>
            {issue.suggestion ? (
              <p>
                建议：<code>{issue.suggestion}</code>
              </p>
            ) : null}
          </div>
        ))
      )}
    </section>
  )
}
