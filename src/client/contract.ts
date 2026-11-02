/**
 * 工作台界面契约。
 *
 * 面板组件（panels/*）只依赖这里的接口，不直接持有状态；状态全部由 App 持有并
 * 通过 props 下传，避免多个面板各自维护一份 spec 导致「左边改了月租、右边还在
 * 用旧值出图」。
 */
import type {
  ComplianceReport,
  CopyTone,
  CopyVariant,
  ParseResult,
  PlatformId,
  PosterSizeId,
  PosterThemeId,
  ProductSpec,
} from '../lib/studio/types'

/** 工作台全部可变状态。 */
export interface StudioState {
  /** 粘贴进来的商品原文 */
  raw: string
  /** 最近一次解析结果（含 matched / missing 诊断） */
  parsed: ParseResult | null
  /** 当前生效的套餐事实；用户在表单里改的就是它 */
  spec: ProductSpec | null
  /** 对商品原文的合规体检结果 */
  compliance: ComplianceReport | null

  platform: PlatformId
  tone: CopyTone
  count: number
  link: string
  brand: string
  variants: CopyVariant[]

  size: PosterSizeId
  theme: PosterThemeId
  headline: string
  subline: string
  /** chips 用逗号分隔的原始输入，渲染时再切分 */
  chipsText: string
  footer: string
  qrUrl: string
  scale: number
  /** 预览图 dataURL；null 表示还没出图 */
  posterUrl: string | null
  posterMeta: { filename: string; width: number; height: number } | null

  parsing: boolean
  generating: boolean
  rendering: boolean
}

/** 工作台全部动作。 */
export interface StudioActions {
  setRaw(value: string): void
  parse(): void
  fillSample(): void
  patchSpec<K extends keyof ProductSpec>(key: K, value: ProductSpec[K]): void

  setPlatform(value: PlatformId): void
  setTone(value: CopyTone): void
  setCount(value: number): void
  setLink(value: string): void
  setBrand(value: string): void
  generate(): void

  setSize(value: PosterSizeId): void
  setTheme(value: PosterThemeId): void
  setHeadline(value: string): void
  setSubline(value: string): void
  setChipsText(value: string): void
  setFooter(value: string): void
  setQrUrl(value: string): void
  setScale(value: number): void
  render(): void
  download(): void

  copy(text: string, label?: string): void
}

/** 面板公共 props。 */
export interface PanelProps {
  state: StudioState
  actions: StudioActions
  t: (key: string) => string
}
