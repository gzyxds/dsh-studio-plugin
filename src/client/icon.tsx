import type { CSSProperties } from 'react'

/** 侧边栏面板图标收到的 owner props。 */
export interface SidebarIconProps {
  /** 图标边长（px）。 */
  size: number
  /** 当前面板是否处于选中态。 */
  active: boolean
}

/**
 * 侧边栏入口图标。
 *
 * 用内联 SVG 而非图标字体：插槽只给一个 `size`，内联 SVG 能精确跟随主题的
 * 选中态着色，也不必依赖任何外部图标集。
 *
 * @param props - 边长与选中态。
 * @returns 侧边栏按钮里的图标。
 */
export function StudioIcon({ size, active }: SidebarIconProps) {
  const style: CSSProperties = { display: 'block', width: size, height: size }

  return (
    <svg
      style={style}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="2.75"
        y="2.75"
        width="18.5"
        height="18.5"
        rx="5"
        fill={active ? 'var(--dsw-alias-brand-primary)' : 'var(--dsw-alias-bg-layer-2)'}
        stroke={active ? 'var(--dsw-alias-brand-primary)' : 'var(--dsw-alias-border-l2)'}
        strokeWidth="1.4"
      />
      <rect
        x="7"
        y="6.4"
        width="10"
        height="11.2"
        rx="1.8"
        fill={active ? '#fff' : 'var(--dsw-alias-label-secondary)'}
        fillOpacity={active ? 0.94 : 0.22}
      />
      <rect
        x="9"
        y="8.9"
        width="6"
        height="1.3"
        rx="0.65"
        fill={active ? 'var(--dsw-alias-brand-primary)' : 'var(--dsw-alias-label-secondary)'}
        fillOpacity={active ? 0.9 : 0.75}
      />
      <rect
        x="9"
        y="11.4"
        width="4.2"
        height="1.1"
        rx="0.55"
        fill={active ? 'var(--dsw-alias-brand-primary)' : 'var(--dsw-alias-label-secondary)'}
        fillOpacity={active ? 0.55 : 0.45}
      />
      <rect
        x="9"
        y="13.6"
        width="5.2"
        height="1.1"
        rx="0.55"
        fill={active ? 'var(--dsw-alias-brand-primary)' : 'var(--dsw-alias-label-secondary)'}
        fillOpacity={active ? 0.55 : 0.45}
      />
    </svg>
  )
}
