/**
 * dsh-studio — Client half。
 *
 * 注册两个插槽：
 * - `main`（keyed）承载工作台主面板，`key` 与侧边栏按钮的 `id` 是同一个字符串，
 *   二者靠它互相寻址；
 * - `sidebar.panellist`（list）提供侧边栏入口图标。
 *
 * 词典与样式都通过 `ctx.effect` 注册：插件卸载时 Cordis 会调用返回的清理函数，
 * 不会在页面上留下孤儿 style 节点。
 */
import { StudioPanel } from './App'
import { CSS } from './css'
import { StudioIcon } from './icon'
import { DICTS, NS } from './i18n'

/** 面板 id：main 的 key 与 sidebar.panellist 的 id 必须是同一个字符串。 */
const PANEL_ID = 'studio'

/** 样式节点标记，用于重复注入时去重。 */
const STYLE_ID = 'dsh-studio/studio.css'

/** 硬依赖：没有插槽与词典服务，工作台无法挂载。 */
export const inject = ['slots', 'locale']

/**
 * 注入样式表。
 *
 * 静态 bundle 拿不到 Dynamic Client half 的 `styles.insert`，所以直接操作
 * document —— 与已发布的 dsh-better-sidebar 保持同一套做法。
 *
 * @returns 卸载时移除节点的清理函数。
 */
function injectStyles(): () => void {
  if (typeof document === 'undefined') return () => {}

  const selector = `style[data-plugin-css="${STYLE_ID}"]`
  // 旧节点直接换掉而不是复用：插件重载后 CSS 常量已经变了，留着旧的会
  // 让界面停在上一版样式上，且刷新页面才好，排查起来非常费时。
  for (const stale of Array.from(document.querySelectorAll(selector))) {
    stale.remove()
  }

  const tag = document.createElement('style')
  tag.dataset.plugin = 'dsh-studio'
  tag.dataset.pluginCss = STYLE_ID
  tag.textContent = CSS
  document.head.appendChild(tag)

  return () => {
    tag.remove()
  }
}

/**
 * 插件入口。
 *
 * @param ctx - Client Cordis 上下文。
 */
export function apply(ctx: any): void {
  ctx.effect(() => ctx.locale.register(NS, DICTS), 'dsh-studio: dictionaries')
  ctx.effect(injectStyles, 'dsh-studio: stylesheet')

  const t = ctx.locale.bind(NS)

  ctx.slots.inject('main', () =>
    ctx.slots.register(
      {
        name: 'main',
        key: PANEL_ID,
        locale: NS,
        inject: () => ({}),
      },
      StudioPanel
    )
  )

  ctx.slots.inject('sidebar.panellist', () =>
    ctx.slots.register(
      {
        name: 'sidebar.panellist',
        id: PANEL_ID,
        order: 20,
        locale: NS,
        label: () => t('panel'),
      },
      StudioIcon
    )
  )
}
