/**
 * 右侧栏 · 推广文案页。
 *
 * 生成设置在上、结果在下：用户改完设置立刻能看到新结果，不用滚回顶部。
 */
import { PLATFORMS, TONES, getPlatform, getTone } from '../../lib/studio/platforms'
import type { CopyTone, PlatformId } from '../../lib/studio/types'
import type { PanelProps } from '../contract'

/**
 * 生成设置卡片。
 *
 * @param props - 工作台状态与动作。
 * @returns 设置卡片。
 */
export function CopySettings({ state, actions, t }: PanelProps) {
  const platform = getPlatform(state.platform)
  const available = TONES.filter((tone) => platform.tones.includes(tone.id))

  return (
    <section className="ds-card">
      <h2 className="ds-card-title">
        <span>{t('section.copy')}</span>
        <span className="ds-hint">
          {platform.lengthHint} · {platform.hint}
        </span>
      </h2>

      <div style={{ marginBottom: 10 }}>
        <div className="ds-hint" style={{ marginBottom: 6 }}>
          {t('label.platform')}
        </div>
        <div className="ds-pills">
          {PLATFORMS.map((item) => (
            <button
              type="button"
              className="ds-pill"
              key={item.id}
              data-active={item.id === state.platform}
              onClick={() => actions.setPlatform(item.id as PlatformId)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 10 }}>
        <div className="ds-hint" style={{ marginBottom: 6 }}>
          {t('label.tone')}
        </div>
        <div className="ds-pills">
          {available.map((item) => (
            <button
              type="button"
              className="ds-pill"
              key={item.id}
              data-active={item.id === state.tone}
              title={item.hint}
              onClick={() => actions.setTone(item.id as CopyTone)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="ds-grid">
        <div className="ds-field">
          <label htmlFor="ds-count">{t('label.count')}</label>
          <select
            id="ds-count"
            className="ds-select"
            value={String(state.count)}
            onChange={(event) => actions.setCount(Number(event.target.value))}
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>

        <div className="ds-field">
          <label htmlFor="ds-brand">{t('label.brand')}</label>
          <input
            id="ds-brand"
            className="ds-input"
            value={state.brand}
            onChange={(event) => actions.setBrand(event.target.value)}
          />
        </div>

        <div className="ds-field ds-field-wide">
          <label htmlFor="ds-link">
            {t('label.link')} <span className="ds-hint">· {t('hint.link')}</span>
          </label>
          <input
            id="ds-link"
            className="ds-input"
            value={state.link}
            placeholder="https://…"
            onChange={(event) => actions.setLink(event.target.value)}
          />
        </div>
      </div>

      <div className="ds-row" style={{ marginTop: 10 }}>
        <button
          type="button"
          className="ds-btn ds-btn-primary"
          onClick={actions.generate}
          disabled={state.spec === null}
        >
          {t('btn.generate')}
        </button>
      </div>
    </section>
  )
}

/**
 * 生成结果列表。
 *
 * @param props - 工作台状态与动作。
 * @returns 结果卡片。
 */
export function CopyResults({ state, actions, t }: PanelProps) {
  if (state.variants.length === 0) {
    return (
      <section className="ds-card">
        <h2 className="ds-card-title">{t('section.result')}</h2>
        <div className="ds-empty">
          {state.spec === null ? t('status.empty') : t('btn.generate')}
        </div>
      </section>
    )
  }

  return (
    <section className="ds-card">
      <h2 className="ds-card-title">
        <span>{t('section.result')}</span>
        <span className="ds-hint">{state.variants.length}</span>
      </h2>

      {state.variants.map((variant, index) => (
        <article className="ds-variant" key={variant.id}>
          <header className="ds-variant-head">
            <span className="ds-chip">
              {index + 1} · {getPlatform(variant.platform).label} · {getTone(variant.tone).label}
            </span>
            <span className="ds-row" style={{ gap: 4 }}>
              <button
                type="button"
                className="ds-btn"
                onClick={() => actions.copy(variant.full, t('btn.copyAll'))}
              >
                {t('btn.copyAll')}
              </button>
              <button
                type="button"
                className="ds-btn ds-btn-ghost"
                onClick={() => actions.copy(variant.tags.join(' '), t('note.tags'))}
              >
                {t('btn.copyTags')}
              </button>
            </span>
          </header>

          <div className="ds-variant-body">{variant.full}</div>

          {variant.notes.length > 0 ? (
            <div className="ds-notes">
              {t('note.publish')}：{variant.notes.join('；')}
            </div>
          ) : null}
        </article>
      ))}
    </section>
  )
}
