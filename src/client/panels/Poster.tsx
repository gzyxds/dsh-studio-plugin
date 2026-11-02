/**
 * 右侧栏 · 卡片图页。
 *
 * 左边设置、右边预览（窄屏时上下堆叠）。预览用 canvas 的 dataURL，不挂真 canvas
 * 节点：出图与展示解耦，切换尺寸时旧图不会闪一下再消失。
 */
import { POSTER_SIZES } from '../../lib/studio/sizes'
import { POSTER_THEMES } from '../../lib/studio/themes'
import type { PosterSizeId, PosterThemeId } from '../../lib/studio/types'
import type { PanelProps } from '../contract'

/**
 * 出图设置卡片。
 *
 * @param props - 工作台状态与动作。
 * @returns 设置卡片。
 */
export function PosterSettings({ state, actions, t }: PanelProps) {
  return (
    <section className="ds-card">
      <h2 className="ds-card-title">
        <span>{t('section.poster')}</span>
        <span className="ds-hint">
          {state.posterMeta ? `${state.posterMeta.width}×${state.posterMeta.height}` : ''}
        </span>
      </h2>

      <div style={{ marginBottom: 10 }}>
        <div className="ds-hint" style={{ marginBottom: 6 }}>
          {t('label.size')}
        </div>
        <div className="ds-pills">
          {POSTER_SIZES.map((size) => (
            <button
              type="button"
              className="ds-pill"
              key={size.id}
              data-active={size.id === state.size}
              title={`${size.width}×${size.height} · ${size.usage}`}
              onClick={() => actions.setSize(size.id as PosterSizeId)}
            >
              {size.id}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 10 }}>
        <div className="ds-hint" style={{ marginBottom: 6 }}>
          {t('label.theme')}
        </div>
        <div className="ds-pills">
          {POSTER_THEMES.map((theme) => (
            <button
              type="button"
              className="ds-pill"
              key={theme.id}
              data-active={theme.id === state.theme}
              onClick={() => actions.setTheme(theme.id as PosterThemeId)}
            >
              {theme.label}
            </button>
          ))}
        </div>
      </div>

      <div className="ds-grid">
        <div className="ds-field ds-field-wide">
          <label htmlFor="ds-headline">{t('label.headline')}</label>
          <input
            id="ds-headline"
            className="ds-input"
            value={state.headline}
            onChange={(event) => actions.setHeadline(event.target.value)}
          />
        </div>

        <div className="ds-field ds-field-wide">
          <label htmlFor="ds-subline">{t('label.subline')}</label>
          <input
            id="ds-subline"
            className="ds-input"
            value={state.subline}
            onChange={(event) => actions.setSubline(event.target.value)}
          />
        </div>

        <div className="ds-field ds-field-wide">
          <label htmlFor="ds-chips">
            {t('label.chips')} <span className="ds-hint">· {t('hint.chips')}</span>
          </label>
          <input
            id="ds-chips"
            className="ds-input"
            value={state.chipsText}
            onChange={(event) => actions.setChipsText(event.target.value)}
          />
        </div>

        <div className="ds-field ds-field-wide">
          <label htmlFor="ds-footer">{t('label.footer')}</label>
          <input
            id="ds-footer"
            className="ds-input"
            value={state.footer}
            onChange={(event) => actions.setFooter(event.target.value)}
          />
        </div>

        <div className="ds-field ds-field-wide">
          <label htmlFor="ds-qr">
            {t('label.qr')} <span className="ds-hint">· {t('hint.qr')}</span>
          </label>
          <input
            id="ds-qr"
            className="ds-input"
            value={state.qrUrl}
            placeholder="https://…"
            onChange={(event) => actions.setQrUrl(event.target.value)}
          />
        </div>

        <div className="ds-field">
          <label htmlFor="ds-scale">{t('label.scale')}</label>
          <select
            id="ds-scale"
            className="ds-select"
            value={String(state.scale)}
            onChange={(event) => actions.setScale(Number(event.target.value))}
          >
            {[1, 2, 3].map((value) => (
              <option key={value} value={value}>
                {value}x
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="ds-row" style={{ marginTop: 10 }}>
        <button
          type="button"
          className="ds-btn ds-btn-primary"
          onClick={actions.render}
          disabled={state.spec === null || state.rendering}
        >
          {state.rendering ? t('status.rendering') : t('btn.render')}
        </button>
        <button
          type="button"
          className="ds-btn"
          onClick={actions.download}
          disabled={state.posterUrl === null}
        >
          {t('btn.download')}
        </button>
      </div>
    </section>
  )
}

/**
 * 卡片图预览。
 *
 * @param props - 工作台状态与动作。
 * @returns 预览卡片。
 */
export function PosterPreview({ state, t }: PanelProps) {
  return (
    <section className="ds-card">
      <h2 className="ds-card-title">
        <span>{t('section.preview')}</span>
        <span className="ds-hint">{state.posterMeta?.filename ?? ''}</span>
      </h2>

      {state.posterUrl === null ? (
        <div className="ds-empty">
          {state.rendering ? t('status.rendering') : t('status.noPoster')}
        </div>
      ) : (
        <div className="ds-preview">
          <img src={state.posterUrl} alt={t('section.preview')} />
        </div>
      )}
    </section>
  )
}
