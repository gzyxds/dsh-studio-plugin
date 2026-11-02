/**
 * 离线冒烟测试：不启 DSH，直接验证 bundle 能被加载、apply 能注册插槽、面板能渲染。
 *
 * 这里覆盖的是「装上之后到底能不能跑」这件事——浏览器里报错只能看到一句
 * Cannot find module，看不到是哪一环断的，所以先在 node 里把整条链路走通。
 */
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(import.meta.url)

const failures = []

/**
 * 断言辅助。
 *
 * @param ok - 断言结果。
 * @param message - 失败说明。
 */
function check(ok, message) {
  if (ok) {
    console.log(`  ok   ${message}`)
  } else {
    console.log(`  FAIL ${message}`)
    failures.push(message)
  }
}

// ---------- 1. 引擎链路 ----------
console.log('\n[1] 引擎链路')

const { parseProductText } = await import('../src/lib/studio/parse.ts')
const { checkCompliance } = await import('../src/lib/studio/compliance.ts')
const { generateVariants } = await import('../src/lib/studio/copy.ts')
const { buildTags } = await import('../src/lib/studio/tags.ts')

const SAMPLE = `【实体卡】重庆联通49元200G
产品套餐：49元200G
激活首充200元话费,生效套餐39元200G全国通用流量+300分钟通话+10元云盘包;
首月按天折算,套餐外及其他业务资费,国内语音拨打0.15元/分钟,短信0.1元/条,国内流量5元/GB,赠送来显。
办卡年龄 18-60周岁
合约期 12个月
不发货地区 仅发重庆
快递方式 上门
激活方式 面对面激活`

const parsed = parseProductText(SAMPLE)
const spec = parsed.spec

check(spec.monthlyFee === 49, `月租识别为 49（实际 ${spec.monthlyFee}）`)
check(spec.flowGb === 200, `通用流量识别为 200（实际 ${spec.flowGb}）`)
check(spec.voiceMinutes === 300, `通话识别为 300（实际 ${spec.voiceMinutes}）`)
check(spec.firstCharge === 200, `首充识别为 200（实际 ${spec.firstCharge}）`)
check(spec.contractMonths === 12, `合约期识别为 12（实际 ${spec.contractMonths}）`)
check(spec.operator === 'unicom', `运营商识别为 unicom（实际 ${spec.operator}）`)
check(spec.shipRegion.includes('重庆'), `发货地区含重庆（实际 ${spec.shipRegion}）`)

const report = checkCompliance('月租永久19元，不限量流量，官方授权渠道，仅剩最后一天')
check(report.level === 'block', `违规原文判为 block（实际 ${report.level}）`)
check(report.issues.length >= 3, `命中至少 3 条规则（实际 ${report.issues.length}）`)

const variants = generateVariants(spec, 'xiaohongshu', 'seed', { count: 3, brand: '号卡之家' })
check(variants.length === 3, `生成 3 条小红书文案（实际 ${variants.length}）`)
check(
  variants.every((item) => item.full.includes('49')),
  '每条文案都带月租 49'
)
check(
  variants.every((item) => checkCompliance(item.full).level !== 'block'),
  '生成结果自身不含 block 级表述'
)

const tags = buildTags(spec, 'douyin')
check(tags.length >= 5, `抖音标签至少 5 个（实际 ${tags.length}）`)
check(
  tags.every((tag) => tag.startsWith('#')),
  '标签都带 # 前缀'
)

// ---------- 2. bundle 加载 ----------
console.log('\n[2] bundle 加载')

const bundle = await readFile(join(ROOT, 'lib', 'client.js'), 'utf8')

let loaded = null
globalThis.window = {
  __ModuleLoader__: {
    load(entry) {
      loaded = entry
    },
  },
}

// bundle 是普通脚本，不是 ESM：用 Function 执行，模拟宿主的 <script> 加载。
// 不要在这里传 document 形参——那会遮蔽 globalThis.document，样式注入就会静默跳过。
new Function('window', bundle)(globalThis.window)

check(loaded !== null, 'bundle 调用了 window.__ModuleLoader__.load')
check(loaded?.id === 'dsh-studio', `bundle id 为 dsh-studio（实际 ${loaded?.id}）`)

const hostRequire = (name) => {
  if (name === 'react') return React
  if (name === 'react/jsx-runtime') return require('react/jsx-runtime')
  if (name === 'react-dom') return require('react-dom')
  throw new Error(`宿主未提供模块：${name}`)
}

const mod = loaded.factory(hostRequire)
check(typeof mod.apply === 'function', '导出 apply')
check(Array.isArray(mod.inject), '导出 inject 数组')

// ---------- 3. apply 注册插槽 ----------
console.log('\n[3] apply 注册插槽')

const registered = []
const dicts = []
let styleTag = null

const fakeCtx = {
  effect(fn, label) {
    const cleanup = fn()
    return typeof cleanup === 'function' ? cleanup : () => {}
  },
  locale: {
    register(ns, dict) {
      dicts.push({ ns, dict })
    },
    bind(ns) {
      return (key) => dicts[0]?.dict.zh?.[key] ?? key
    },
  },
  slots: {
    inject(name, cb) {
      cb()
    },
    register(options, component) {
      registered.push({ options, component })
      return () => {}
    },
  },
}

globalThis.document = {
  querySelector: () => styleTag,
  querySelectorAll: () => (styleTag === null ? [] : [styleTag]),
  createElement: () => ({ dataset: {}, textContent: '', remove() {} }),
  head: {
    appendChild(tag) {
      styleTag = tag
    },
  },
}

mod.apply(fakeCtx)

check(dicts.length === 1 && dicts[0].ns === 'studio', '注册了 studio 词典')
check(
  dicts[0].dict.zh !== undefined && Object.keys(dicts[0].dict.zh).length > 40,
  `中文字典键数 > 40（实际 ${Object.keys(dicts[0]?.dict.zh ?? {}).length}）`
)
check(
  JSON.stringify(Object.keys(dicts[0].dict.zh).sort()) ===
    JSON.stringify(Object.keys(dicts[0].dict.en).sort()),
  '中英文字典键集合一致'
)
check(styleTag !== null && styleTag.textContent.length > 1000, '样式表已注入')

const main = registered.find((item) => item.options.name === 'main')
const sidebar = registered.find((item) => item.options.name === 'sidebar.panellist')

check(main?.options.key === 'studio', 'main 注册 key=studio')
check(sidebar?.options.id === 'studio', 'sidebar.panellist 注册 id=studio')
check(main.options.key === sidebar.options.id, 'main.key 与 sidebar.id 一致（互相寻址）')
check(typeof sidebar.options.label === 'function', 'sidebar label 是 thunk（跟随语言切换）')

// ---------- 4. 面板渲染 ----------
console.log('\n[4] 面板渲染')

const t = (key) => dicts[0].dict.zh[key] ?? key

const mainHtml = renderToStaticMarkup(React.createElement(main.component, { t }))
const sidebarHtml = renderToStaticMarkup(
  React.createElement(sidebar.component, { size: 20, active: true })
)

check(mainHtml.includes('推广创作台'), '主面板渲染出标题')
check(mainHtml.includes('ds-studio-root'), '主面板带根 class')
check(mainHtml.includes('商品原文'), '主面板含输入区')
check(!/\bundefined\b/.test(mainHtml), '渲染结果里没有 undefined')
check(!mainHtml.includes('section.'), '渲染结果里没有裸露的 i18n key')
check(sidebarHtml.includes('<svg'), '侧边栏图标是内联 svg')

// ---------- 汇总 ----------
console.log('')
if (failures.length > 0) {
  console.error(`✗ ${failures.length} 项失败`)
  process.exit(1)
}
console.log('✓ 全部通过')
