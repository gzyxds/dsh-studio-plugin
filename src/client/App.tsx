/**
 * 工作台主面板。
 *
 * 两栏布局：左栏是「输入 → 结构化 → 合规」的单向链路，右栏是「文案 / 卡片图」
 * 两个产出页签。这样用户改一处设置，只需要看右栏的结果区，视线不用来回横跳。
 */
import { useCallback, useEffect, useRef, useState } from 'react'

import type { PanelProps } from './contract'
import { CompliancePanel, SourcePanel, SpecPanel } from './panels/Source'
import { CopyResults, CopySettings } from './panels/Copy'
import { PosterPreview, PosterSettings } from './panels/Poster'
import { useStudio } from './useStudio'
import { DICTS } from './i18n'

/** 轻提示停留时长（ms）。 */
const TOAST_MS = 1800

/**
 * 兜底翻译。
 *
 * 插槽在声明了 `locale` 时会注入 `t`，但那是宿主侧的行为；插件不该因为这一层
 * 投影没到位就整块白屏，所以拿不到 `t` 时退回自带的字典（缺键时露 key 而不是
 * 抛异常）。
 *
 * @param injected - 宿主注入的 `t`（可能不存在）。
 * @returns 可用的翻译函数。
 */
function fallbackT(injected?: (key: string) => string): (key: string) => string {
  if (typeof injected === 'function') return injected
  const zh = DICTS.zh as Record<string, string>
  return (key: string) => (Object.prototype.hasOwnProperty.call(zh, key) ? zh[key] : key)
}

/**
 * 主面板组件。
 *
 * @param props - 插槽注入的 `t`（命名空间已绑定到 studio）。
 * @returns 创作台界面。
 */
export function StudioPanel({ t: injectedT }: { t?: (key: string) => string }) {
  const t = fallbackT(injectedT)
  const [toast, setToast] = useState<string | null>(null)
  const [tab, setTab] = useState<'copy' | 'poster'>('copy')
  /** 轻提示计时器：后一条提示要清掉前一条的计时，卸载时也要清，避免指向已卸载组件。 */
  const toastTimer = useRef<number | null>(null)

  const showToast = useCallback((message: string) => {
    setToast(message)
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => {
      toastTimer.current = null
      setToast(null)
    }, TOAST_MS)
  }, [])

  useEffect(() => {
    return () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
    }
  }, [])

  const { state, actions } = useStudio(showToast)

  const panelProps: PanelProps = { state, actions, t }

  return (
    <div className="ds-studio-root">
      <header className="ds-studio-head">
        <div>
          <h1>{t('title')}</h1>
          <p>{t('subtitle')}</p>
        </div>
      </header>

      <div className="ds-studio-body">
        <div className="ds-studio-col">
          <SourcePanel {...panelProps} />
          <SpecPanel {...panelProps} />
          <CompliancePanel {...panelProps} />
        </div>

        <div className="ds-studio-col">
          <div className="ds-tabs">
            <button
              type="button"
              className="ds-tab"
              data-active={tab === 'copy'}
              onClick={() => setTab('copy')}
            >
              {t('tab.copy')}
            </button>
            <button
              type="button"
              className="ds-tab"
              data-active={tab === 'poster'}
              onClick={() => setTab('poster')}
            >
              {t('tab.poster')}
            </button>
          </div>

          {tab === 'copy' ? (
            <>
              <CopySettings {...panelProps} />
              <CopyResults {...panelProps} />
            </>
          ) : (
            <>
              <PosterSettings {...panelProps} />
              <PosterPreview {...panelProps} />
            </>
          )}
        </div>
      </div>

      {toast === null ? null : <div className="ds-toast">{toast}</div>}
    </div>
  )
}
