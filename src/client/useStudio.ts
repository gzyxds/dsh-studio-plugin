/**
 * 工作台状态与动作的实现。
 *
 * 单独抽出来是为了让 App 只负责编排：状态机、解析、合规、文案、出图四条链路
 * 都在这里，每条都是「输入 → 引擎 → 写回 state」的单向流，任何一步失败只影响
 * 自己的 loading 标志，不会把整块界面打成白屏。
 */
import { useCallback, useMemo, useRef, useState } from 'react'

import { parseProductText } from '../lib/studio/parse'
import { checkCompliance } from '../lib/studio/compliance'
import { generateVariants } from '../lib/studio/copy'
import { renderPoster, downloadPoster } from '../lib/studio/poster'
import type { CopyVariant, PosterResult, ProductSpec } from '../lib/studio/types'
import { getPlatform } from '../lib/studio/platforms'

import type { StudioActions, StudioState } from './contract'
import { SAMPLE_TEXT } from './sample'

/** 默认落款，与文案引擎的 DEFAULT_BRAND 保持一致。 */
const DEFAULT_BRAND = '号卡之家'

/** 把逗号（中英文）分隔的标签串切成数组。 */
export function splitChips(text: string): string[] {
  return text
    .split(/[,，]/)
    .map((item) => item.trim())
    .filter((item) => item !== '')
}

/**
 * 由套餐事实推导默认卖点标签。
 *
 * 只写套餐里真实存在的数字：没有通话就不出「通话」标签，避免卡片上出现
 * 「0 分钟通话」这种自己拆自己台的内容。
 *
 * @param spec - 套餐事实。
 * @returns 最多 4 个卖点标签。
 */
export function defaultChips(spec: ProductSpec): string[] {
  const chips: string[] = []
  if (spec.flowGb > 0) chips.push(`${spec.flowGb}G 通用流量`)
  if (spec.voiceMinutes > 0) chips.push(`${spec.voiceMinutes} 分钟通话`)
  if (spec.contractMonths > 0) chips.push(`合约 ${spec.contractMonths} 个月`)
  if (spec.firstCharge > 0) chips.push(`首充 ${spec.firstCharge} 元`)
  if (chips.length < 4 && spec.shipRegion) chips.push(spec.shipRegion)
  if (chips.length < 4 && spec.activateType) chips.push(spec.activateType)
  return chips.slice(0, 4)
}

/** 由套餐事实推导默认副标题。 */
export function defaultSubline(spec: ProductSpec): string {
  const parts: string[] = []
  if (spec.flowGb > 0) parts.push(`${spec.flowGb}G 全国通用`)
  if (spec.voiceMinutes > 0) parts.push(`${spec.voiceMinutes} 分钟通话`)
  if (spec.shipRegion) parts.push(spec.shipRegion)
  return parts.join(' · ')
}

/** 默认页脚。 */
const DEFAULT_FOOTER = `${DEFAULT_BRAND} · 官方自助下单`

/**
 * 生成后复扫。
 *
 * 生成器只保证「数字来自 spec」，但卖点、优惠期、发货地区这些自由文本可能
 * 带进风险词（例如把优惠期写成「永久」）。这里逐条复扫，把命中写进 notes，
 * 让「生成结果自己踩自己的合规规则」在界面上可见，而不是悄悄发出去。
 *
 * @param variants - 刚生成的文案变体。
 * @returns 追加了风险提示的变体（无命中时原样返回）。
 */
function annotateCompliance(variants: CopyVariant[]): CopyVariant[] {
  return variants.map((variant) => {
    const report = checkCompliance(variant.full)
    if (report.level === 'pass') return variant
    const hits = Array.from(new Set(report.issues.map((issue) => issue.matched))).slice(0, 2)
    const hint = `发布前注意：检出「${hits.join('」「')}」等风险表述，建议改写后再发`
    return { ...variant, notes: [hint, ...variant.notes].slice(0, 4) }
  })
}

const INITIAL: StudioState = {
  raw: '',
  parsed: null,
  spec: null,
  compliance: null,

  platform: 'xiaohongshu',
  tone: 'seed',
  count: 3,
  link: '',
  brand: DEFAULT_BRAND,
  variants: [],

  size: '9:16',
  theme: 'brand',
  headline: '',
  subline: '',
  chipsText: '',
  footer: DEFAULT_FOOTER,
  qrUrl: '',
  scale: 2,
  posterUrl: null,
  posterMeta: null,

  parsing: false,
  generating: false,
  rendering: false,
}

/** 一次性把复制结果落地的兼容实现（navigator.clipboard 在非安全上下文不可用）。 */
async function writeClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // 落到下面的兜底路径
  }

  try {
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    area.remove()
    return ok
  } catch {
    return false
  }
}

/**
 * 工作台状态钩子。
 *
 * @param onToast - 复制等轻提示的回调，由外层负责渲染。
 * @returns 当前状态与全部动作。
 */
export function useStudio(onToast: (message: string) => void): {
  state: StudioState
  actions: StudioActions
} {
  const [state, setState] = useState<StudioState>(INITIAL)
  /** 出图结果单独存在 ref：canvas 不需要参与 diff，也不该被序列化。 */
  const posterRef = useRef<PosterResult | null>(null)
  /** 最新状态的镜像：动作里读它，避免把副作用塞进 setState 的 updater（StrictMode 会双调用）。 */
  const stateRef = useRef(state)
  stateRef.current = state

  const patch = useCallback((next: Partial<StudioState>) => {
    setState((prev) => ({ ...prev, ...next }))
  }, [])

  const setRaw = useCallback((value: string) => patch({ raw: value }), [patch])

  const parse = useCallback(() => {
    const current = stateRef.current
    const text = current.raw.trim()
    if (text === '') {
      onToast('请先粘贴商品原文')
      return
    }

    const parsed = parseProductText(text)
    const compliance = checkCompliance(text)
    const spec = parsed.spec

    posterRef.current = null
    setState((prev) => ({
      ...prev,
      parsed,
      spec,
      compliance,
      headline: spec.name || spec.rawTitle,
      subline: defaultSubline(spec),
      chipsText: defaultChips(spec).join('，'),
      variants: [],
      posterUrl: null,
      posterMeta: null,
    }))
  }, [onToast])

  const fillSample = useCallback(() => {
    setState((prev) => ({ ...prev, raw: SAMPLE_TEXT }))
  }, [])

  const patchSpec = useCallback(
    <K extends keyof ProductSpec>(key: K, value: ProductSpec[K]) => {
      setState((prev) => (prev.spec === null ? prev : { ...prev, spec: { ...prev.spec, [key]: value } }))
    },
    []
  )

  const setPlatform = useCallback((value: StudioState['platform']) => {
    setState((prev) => {
      // 换平台时体裁可能不受支持，先按新平台收敛，避免生成器静默回退
      const tones = getPlatform(value).tones
      const tone = tones.includes(prev.tone) ? prev.tone : tones[0]
      return { ...prev, platform: value, tone }
    })
  }, [])

  const setTone = useCallback((value: StudioState['tone']) => patch({ tone: value }), [patch])
  const setCount = useCallback((value: number) => patch({ count: value }), [patch])
  const setLink = useCallback((value: string) => patch({ link: value }), [patch])
  const setBrand = useCallback((value: string) => patch({ brand: value }), [patch])

  const generate = useCallback(() => {
    const current = stateRef.current
    if (current.spec === null) {
      onToast('请先解析商品原文')
      return
    }

    const variants = annotateCompliance(
      generateVariants(current.spec, current.platform, current.tone, {
        link: current.link,
        count: current.count,
        brand: current.brand,
      })
    )

    setState((prev) => ({ ...prev, variants }))
  }, [onToast])

  // 换尺寸 / 主题 / 倍率后旧图已不代表当前设置，清掉预览避免「图与参数对不上」
  const setSize = useCallback(
    (value: StudioState['size']) => patch({ size: value, posterUrl: null, posterMeta: null }),
    [patch]
  )
  const setTheme = useCallback(
    (value: StudioState['theme']) => patch({ theme: value, posterUrl: null, posterMeta: null }),
    [patch]
  )
  const setHeadline = useCallback((value: string) => patch({ headline: value }), [patch])
  const setSubline = useCallback((value: string) => patch({ subline: value }), [patch])
  const setChipsText = useCallback((value: string) => patch({ chipsText: value }), [patch])
  const setFooter = useCallback((value: string) => patch({ footer: value }), [patch])
  const setQrUrl = useCallback((value: string) => patch({ qrUrl: value }), [patch])
  const setScale = useCallback((value: number) => patch({ scale: value }), [patch])

  const render = useCallback(() => {
    const current = stateRef.current
    if (current.spec === null) {
      onToast('请先解析商品原文')
      return
    }

    const request = {
      spec: current.spec as ProductSpec,
      size: current.size,
      theme: current.theme,
      headline: current.headline,
      subline: current.subline,
      chips: splitChips(current.chipsText),
      footer: current.footer,
      qrUrl: current.qrUrl,
      scale: current.scale,
    }

    setState((prev) => ({ ...prev, rendering: true }))

    void (async () => {
      try {
        const result = await renderPoster(request)

        posterRef.current = result
        setState((prev) => ({
          ...prev,
          posterUrl: result.canvas.toDataURL('image/png'),
          posterMeta: { filename: result.filename, width: result.width, height: result.height },
          rendering: false,
        }))
      } catch (error) {
        onToast(error instanceof Error ? error.message : '出图失败')
        setState((prev) => ({ ...prev, rendering: false }))
      }
    })()
  }, [onToast])

  const download = useCallback(() => {
    const result = posterRef.current
    if (result === null) {
      onToast('请先生成卡片图')
      return
    }
    void downloadPoster(result, 'png').catch(() => onToast('下载失败，请重试'))
  }, [onToast])

  const copy = useCallback(
    (text: string, label?: string) => {
      void writeClipboard(text).then((ok) => {
        onToast(ok ? `已复制${label ? ` ${label}` : ''}` : '复制失败，请手动选中复制')
      })
    },
    [onToast]
  )

  const actions = useMemo<StudioActions>(
    () => ({
      setRaw,
      parse,
      fillSample,
      patchSpec,
      setPlatform,
      setTone,
      setCount,
      setLink,
      setBrand,
      generate,
      setSize,
      setTheme,
      setHeadline,
      setSubline,
      setChipsText,
      setFooter,
      setQrUrl,
      setScale,
      render,
      download,
      copy,
    }),
    [
      setRaw,
      parse,
      fillSample,
      patchSpec,
      setPlatform,
      setTone,
      setCount,
      setLink,
      setBrand,
      generate,
      setSize,
      setTheme,
      setHeadline,
      setSubline,
      setChipsText,
      setFooter,
      setQrUrl,
      setScale,
      render,
      download,
      copy,
    ]
  )

  return { state, actions }
}
