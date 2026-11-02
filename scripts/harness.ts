/**
 * E2E 宿主壳的入口。
 *
 * 这个文件由 scripts/e2e.mjs 用 esbuild 打包成浏览器可跑的 IIFE，打包时会带上
 * 真正的 react / react-dom / react/jsx-runtime —— 手写 jsx-runtime 垫片会让
 * React 少做一轮 key 校验，测出来的东西和线上不一致。
 *
 * 壳子的职责：模拟 DSH 的 __ModuleLoader__ 与 Client Cordis 上下文，把
 * lib/client.js（插件真实产物）当第三方脚本加载，然后挂载面板。
 */
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as jsxRuntime from 'react/jsx-runtime'
import { createRoot } from 'react-dom/client'

/** 面板组件收到的 t：走插件自己注册的字典，缺键时露出 key（便于断言）。 */
function makeT(dicts: Array<{ ns: string; dict: { zh: Record<string, string> } }>) {
  return (key: string): string => {
    const zh = dicts.length > 0 ? dicts[0].dict.zh : {}
    return Object.prototype.hasOwnProperty.call(zh, key) ? zh[key] : key
  }
}

/**
 * 装配宿主壳并挂载插件。
 *
 * @param bundleSource - lib/client.js 的源码。
 */
export function boot(bundleSource: string): void {
  const modules: Record<string, unknown> = {
    react: React,
    'react-dom': ReactDOM,
    'react-dom/client': { createRoot },
    'react/jsx-runtime': jsxRuntime,
  }

  let plugin: { apply(ctx: unknown): void; inject: string[] } | null = null

  ;(window as any).__ModuleLoader__ = {
    load(entry: { id: string; factory(require: (name: string) => unknown): unknown }) {
      const require = (name: string): unknown => {
        if (!(name in modules)) throw new Error(`Cannot find module: ${name}`)
        return modules[name]
      }
      plugin = entry.factory(require) as typeof plugin
    },
  }

  // 插件产物是普通脚本，用 Function 求值即等价于 <script> 加载
  new Function(bundleSource)()

  if (plugin === null) throw new Error('插件没有调用 __ModuleLoader__.load')

  const registered: Array<{ options: any; component: any }> = []
  const dicts: Array<{ ns: string; dict: { zh: Record<string, string> } }> = []

  const ctx = {
    effect(fn: () => unknown) {
      const cleanup = fn()
      return typeof cleanup === 'function' ? cleanup : () => {}
    },
    locale: {
      register(ns: string, dict: any) {
        dicts.push({ ns, dict })
      },
      bind() {
        return makeT(dicts)
      },
    },
    slots: {
      inject(_name: string, cb: () => void) {
        cb()
      },
      register(options: any, component: any) {
        registered.push({ options, component })
        return () => {}
      },
    },
  }

  plugin.apply(ctx)

  const t = makeT(dicts)
  const main = registered.find((item) => item.options.name === 'main')
  const sidebar = registered.find((item) => item.options.name === 'sidebar.panellist')

  if (!main || !sidebar) throw new Error('插槽没有注册齐全')

  const host = document.getElementById('host')!
  createRoot(host).render(React.createElement(main.component, { t }))

  // 第二份不带 t 挂载：验证宿主没投影 t 时不会白屏
  const bare = document.getElementById('bare')
  if (bare !== null) {
    createRoot(bare).render(React.createElement(main.component, {}))
  }

  const bar = document.getElementById('sidebar')!
  createRoot(bar).render(
    React.createElement(
      'div',
      { style: { padding: 12, background: '#111' } },
      React.createElement(sidebar.component, { size: 24, active: true })
    )
  )

  ;(window as any).__e2e = {
    registered,
    dicts,
    panelId: main.options.key,
    sidebarId: sidebar.options.id,
    label: typeof sidebar.options.label === 'function' ? sidebar.options.label() : null,
  }
}
