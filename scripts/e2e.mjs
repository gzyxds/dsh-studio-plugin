/**
 * 真浏览器端到端验证。
 *
 * 离线冒烟只能证明「模块能加载、组件能渲染成字符串」；canvas 出图、剪贴板、
 * 真实点击必须在真浏览器里跑。这里用 scripts/harness.ts 搭一个最小宿主壳
 * （真 react / react-dom / jsx-runtime），把 lib/client.js 当成第三方脚本加载。
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

import { build } from 'esbuild'

// playwright 装在 urlka.cn 那份 checkout 里，本包不重复安装（省 300MB 浏览器）
const requireFromUrlka = createRequire('D:/github/urlka.cn/package.json')
const { chromium } = requireFromUrlka('playwright')

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, '.tmp-e2e')

const failures = []

/**
 * 断言辅助。
 *
 * @param ok - 断言结果。
 * @param message - 说明。
 */
function check(ok, message) {
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${message}`)
  if (!ok) failures.push(message)
}

// ---------- 准备宿主壳 ----------
const harness = await build({
  entryPoints: [join(ROOT, 'scripts', 'harness.ts')],
  bundle: true,
  write: false,
  format: 'iife',
  globalName: '__harness',
  platform: 'browser',
  target: ['es2022'],
  jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"development"' },
  logLevel: 'error',
})

const harnessJs = harness.outputFiles[0].text
const pluginJs = await readFile(join(ROOT, 'lib', 'client.js'), 'utf8')

// 插件源码里有反引号和 ${}，用 JSON.stringify 传参比内联安全
const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>dsh-studio e2e</title>
<style>
  :root {
    --dsw-alias-bg-base: #ffffff;
    --dsw-alias-bg-layer-1: #f7f8fa;
    --dsw-alias-bg-layer-2: #eef0f4;
    --dsw-alias-bg-overlay: rgba(0,0,0,.04);
    --dsw-alias-border-l1: #e3e6ec;
    --dsw-alias-border-l2: #cfd4de;
    --dsw-alias-brand-primary: #f4521e;
    --dsw-alias-label-primary: #16181d;
    --dsw-alias-label-secondary: #6b7280;
    --dsw-alias-state-error-primary: #d92d20;
    --dsw-alias-state-warn-primary: #b54708;
    --dsw-alias-state-success-primary: #067647;
  }
  body { margin: 0; background: #fff; font-family: system-ui, "Microsoft YaHei", sans-serif; }
</style>
</head>
<body>
<div id="host"></div>
<div id="bare" style="display:none"></div>
<div id="sidebar" style="position:fixed;right:0;top:0;z-index:9"></div>
<script>${harnessJs}</script>
<script>__harness.boot(${JSON.stringify(pluginJs)});</script>
</body>
</html>`

await mkdir(OUT, { recursive: true })
const hostPath = join(OUT, 'host.html')
await writeFile(hostPath, html, 'utf8')

// ---------- 跑浏览器 ----------
const browser = await chromium.launch({ channel: 'msedge' })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })

const errors = []
page.on('pageerror', (error) => errors.push(String(error)))
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text())
})

await page.goto(`file:///${hostPath.replace(/\\/g, '/')}`)
await page.waitForSelector('#host .ds-studio-root', { timeout: 20000 })

const sidebarTab = () => page.locator('.ds-tab', { hasText: '卡片图' })
const copyTab = () => page.locator('.ds-tab', { hasText: '推广文案' })

console.log('\n[1] 首屏')
check(errors.length === 0, `无控制台错误${errors.length ? `（${errors[0].slice(0, 160)}）` : ''}`)
check(await page.locator('#host .ds-studio-root').isVisible(), '主面板已挂载')
check((await page.locator('#sidebar svg').count()) > 0, '侧边栏图标已渲染')
check((await page.locator('style[data-plugin-css]').count()) > 0, '样式表已注入')

const meta = await page.evaluate(() => window.__e2e)
check(meta.panelId === 'studio' && meta.sidebarId === 'studio', '面板 key 与侧边栏 id 一致')
check(meta.label === '推广创作台', `侧边栏 label 取到中文（实际 ${meta.label}）`)

// 宿主没投影 t 时应当退回自带字典，而不是白屏或露出裸 key
const bareHtml = await page.locator('#bare').innerHTML()
check(bareHtml.includes('推广创作台'), '未注入 t 时仍能渲染中文标题')
check(!bareHtml.includes('section.'), '未注入 t 时没有裸露 key')

// 验证完就摘掉，否则两份面板会让后面所有 locator 撞 strict mode
await page.evaluate(() => document.getElementById('bare')?.remove())

await page.screenshot({ path: join(OUT, '01-empty.png') })

console.log('\n[2] 解析商品原文')
await page.locator('.ds-textarea').first().fill(
  `【实体卡】重庆联通49元200G
产品套餐：49元200G
激活首充200元话费,生效套餐39元200G全国通用流量+300分钟通话+10元云盘包;
首月按天折算,套餐外及其他业务资费,国内语音拨打0.15元/分钟,短信0.1元/条,国内流量5元/GB,赠送来显。
办卡年龄 18-60周岁
合约期 12个月
不发货地区 仅发重庆
快递方式 上门
激活方式 面对面激活`
)
await page.getByRole('button', { name: '解析', exact: true }).click()
await page.waitForTimeout(400)

const fields = await page.evaluate(() => {
  const ids = ['monthlyFee', 'flowGb', 'voiceMinutes', 'firstCharge', 'contractMonths']
  const out = {}
  for (const id of ids) {
    const el = document.getElementById(`ds-${id}`)
    out[id] = el ? el.value : null
  }
  const ship = document.getElementById('ds-ship')
  out.shipRegion = ship ? ship.value : null
  const op = document.getElementById('ds-operator')
  out.operator = op ? op.value : null
  return out
})

check(fields.monthlyFee === '49', `月租 49（实际 ${fields.monthlyFee}）`)
check(fields.flowGb === '200', `通用流量 200（实际 ${fields.flowGb}）`)
check(fields.voiceMinutes === '300', `通话 300（实际 ${fields.voiceMinutes}）`)
check(fields.firstCharge === '200', `首充 200（实际 ${fields.firstCharge}）`)
check(fields.contractMonths === '12', `合约 12（实际 ${fields.contractMonths}）`)
check(fields.operator === 'unicom', `运营商 unicom（实际 ${fields.operator}）`)
check(String(fields.shipRegion).includes('重庆'), `发货地含重庆（实际 ${fields.shipRegion}）`)

const leftText = await page.locator('.ds-studio-col').first().innerText()
check(leftText.includes('合规体检'), '合规体检区已出现')

await page.screenshot({ path: join(OUT, '02-parsed.png') })

console.log('\n[3] 生成文案')
await page.getByRole('button', { name: '生成文案' }).click()
await page.waitForTimeout(500)

const variants = page.locator('.ds-variant')
const variantCount = await variants.count()
check(variantCount === 3, `生成 3 条文案（实际 ${variantCount}）`)

const firstText = await variants.first().innerText()
check(firstText.includes('49'), '第一条含月租 49')
check(firstText.includes('#'), '第一条含 # 标签')
check(firstText.length > 120, `第一条长度 > 120（实际 ${firstText.length}）`)

await page.screenshot({ path: join(OUT, '03-copy.png'), fullPage: true })

console.log('\n[4] 卡片图 9:16')
await sidebarTab().click()
await page.waitForTimeout(200)
await page.getByRole('button', { name: '生成卡片图' }).click()
await page.waitForSelector('.ds-preview img', { timeout: 25000 })
await page.waitForTimeout(500)

const first = await page.locator('.ds-preview img').evaluate((img) => ({
  src: img.src,
  w: img.naturalWidth,
  h: img.naturalHeight,
}))
check(first.src.startsWith('data:image/png;base64,'), '预览是 PNG dataURL')
check(first.w === 1080 && first.h === 1920, `9:16 @2x → 1080×1920（实际 ${first.w}×${first.h}）`)

await writeFile(
  join(OUT, 'poster-9x16.png'),
  Buffer.from(first.src.slice(first.src.indexOf(',') + 1), 'base64')
)
await page.screenshot({ path: join(OUT, '04-poster.png'), fullPage: true })

console.log('\n[5] 切换 16:9')
await page.locator('.ds-pill', { hasText: '16:9' }).click()
await page.waitForTimeout(150)
await page.getByRole('button', { name: '生成卡片图' }).click()
await page.waitForTimeout(1500)

const second = await page.locator('.ds-preview img').evaluate((img) => ({
  src: img.src,
  w: img.naturalWidth,
  h: img.naturalHeight,
}))
check(second.w === 1920 && second.h === 1080, `16:9 @2x → 1920×1080（实际 ${second.w}×${second.h}）`)
await writeFile(
  join(OUT, 'poster-16x9.png'),
  Buffer.from(second.src.slice(second.src.indexOf(',') + 1), 'base64')
)

console.log('\n[6] 复制')
await copyTab().click()
await page.waitForTimeout(200)
await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
await page.locator('.ds-variant').first().getByRole('button', { name: '复制全文' }).click()
await page.waitForTimeout(400)

const toast = await page.locator('.ds-toast').innerText().catch(() => '')
check(toast.includes('已复制'), `复制后有轻提示（实际 "${toast}"）`)

const clip = await page.evaluate(() => navigator.clipboard.readText())
check(clip.includes('49') && clip.includes('#'), '剪贴板内容含月租与标签')

console.log('\n[7] 其余尺寸')
for (const size of ['1:1', '4:3', '3:4']) {
  await sidebarTab().click()
  await page.waitForTimeout(100)
  await page.locator('.ds-pill', { hasText: size }).first().click()
  await page.waitForTimeout(150)
  await page.getByRole('button', { name: '生成卡片图' }).click()
  await page.waitForTimeout(1200)
  const dims = await page.locator('.ds-preview img').evaluate((img) => ({
    w: img.naturalWidth,
    h: img.naturalHeight,
  }))
  check(dims.w > 0 && dims.h > 0, `${size} 出图 ${dims.w}×${dims.h}`)
  await writeFile(
    join(OUT, `poster-${size.replace(':', 'x')}.png`),
    Buffer.from(
      (await page.locator('.ds-preview img').getAttribute('src')).split(',')[1],
      'base64'
    )
  )
}

console.log('\n[8] 换平台与体裁')
await copyTab().click()
await page.locator('.ds-pill', { hasText: '抖音' }).click()
await page.waitForTimeout(150)
await page.getByRole('button', { name: '生成文案' }).click()
await page.waitForTimeout(400)
const douyinCount = await page.locator('.ds-variant').count()
check(douyinCount === 3, `抖音生成 3 条（实际 ${douyinCount}）`)
const douyinText = await page.locator('.ds-variant').first().innerText()
check(douyinText.length > 60, `抖音文案长度 > 60（实际 ${douyinText.length}）`)
await page.screenshot({ path: join(OUT, '05-douyin.png'), fullPage: true })

check(errors.length === 0, `全程无控制台错误${errors.length ? `（${errors.slice(0, 2).join(' | ').slice(0, 300)}）` : ''}`)

await browser.close()

console.log('')
if (failures.length > 0) {
  console.error(`✗ ${failures.length} 项失败`)
  process.exit(1)
}
console.log(`✓ 全部通过，截图在 ${OUT}`)
