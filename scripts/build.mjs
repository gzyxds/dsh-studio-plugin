/**
 * 把 src/client 打包成 DSH 能加载的单文件 client bundle。
 *
 * 产物形态与已发布的 @deepseek-ai/dsh-client-ui-schedule、dsh-better-sidebar 一致：
 * 一个 `window.__ModuleLoader__.load({ id, factory })` 调用，React 由宿主通过
 * `require('react')` 注入，其余依赖（qrcode 等）全部内联进来。
 */
import { build } from 'esbuild'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const ENTRY = join(ROOT, 'src', 'client', 'index.ts')
const OUT_DIR = join(ROOT, 'lib')
const OUT_FILE = join(OUT_DIR, 'client.js')

/** 由宿主 module table 提供，不能打进 bundle。 */
const EXTERNALS = ['react', 'react/jsx-runtime', 'react-dom', 'react-dom/client']

/** 其中必须真的被用到的（其余按需出现，不做存在性校验）。 */
const REQUIRED = ['react', 'react/jsx-runtime']

const pkg = JSON.parse(await readFile(join(ROOT, 'package.json'), 'utf8'))

const result = await build({
  entryPoints: [ENTRY],
  bundle: true,
  write: false,
  format: 'cjs',
  platform: 'browser',
  target: ['es2022'],
  jsx: 'automatic',
  external: EXTERNALS,
  legalComments: 'none',
  logLevel: 'warning',
  minify: false,
})

const code = result.outputFiles[0].text

// 宿主注入的 require 只认这几个包名，漏掉一个会在浏览器里变成 "Cannot find module"
for (const name of REQUIRED) {
  const pattern = new RegExp(`require\\(["']${name.replace(/[/\\]/g, '\\$&')}["']\\)`)
  if (!pattern.test(code)) {
    console.error(`[build] 产物里没有 require("${name}")，宿主将无法解析该依赖`)
    process.exit(1)
  }
}

const wrapped = `window.__ModuleLoader__.load({
	id: ${JSON.stringify(pkg.name)},
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
${code}
		return module.exports;
	},
});
`

// 便宜的语法闸门：编译不通过就不要写出去，免得宿主加载时报一个更难懂的错误
try {
  new Function(wrapped)
} catch (error) {
  console.error('[build] 产物语法错误：', error instanceof Error ? error.message : error)
  process.exit(1)
}

await mkdir(OUT_DIR, { recursive: true })
await writeFile(OUT_FILE, wrapped, 'utf8')

const kb = (wrapped.length / 1024).toFixed(1)
console.log(`[build] ${pkg.name} → lib/client.js (${kb} KB)`)
