/**
 * 工作台样式表。
 *
 * 全部颜色取自 DSH 主题令牌（--dsw-alias-*），因此浅色 / 深色主题切换时无需
 * 重新计算任何颜色；只有强调色上的文字色固定为白色，因为强调色本身在明暗
 * 两套主题下都足够深。
 */
export const CSS = `
.ds-studio-root {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-primary);
  font-size: 13px;
  line-height: 1.6;
}

.ds-studio-head {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 20px 24px 14px;
  border-bottom: 1px solid var(--dsw-alias-border-l1);
  flex: none;
}

.ds-studio-head h1 {
  margin: 0;
  font-size: 17px;
  font-weight: 650;
  letter-spacing: 0.2px;
}

.ds-studio-head p {
  margin: 3px 0 0;
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
}

.ds-studio-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: grid;
  grid-template-columns: minmax(300px, 380px) minmax(0, 1fr);
  gap: 16px;
  padding: 16px 24px 28px;
  align-items: start;
}

@media (max-width: 1080px) {
  .ds-studio-body { grid-template-columns: minmax(0, 1fr); }
}

.ds-studio-col {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}

.ds-card {
  background: var(--dsw-alias-bg-layer-1);
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 12px;
  padding: 14px 16px;
}

.ds-card-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 600;
}

.ds-hint {
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  font-weight: 400;
}

.ds-textarea,
.ds-input,
.ds-select {
  width: 100%;
  box-sizing: border-box;
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-primary);
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 8px;
  padding: 8px 10px;
  font: inherit;
  font-size: 12px;
  outline: none;
}

.ds-textarea {
  min-height: 148px;
  resize: vertical;
  line-height: 1.55;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

.ds-textarea:focus,
.ds-input:focus,
.ds-select:focus {
  border-color: var(--dsw-alias-brand-primary);
}

.ds-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.ds-btn {
  appearance: none;
  border: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-primary);
  border-radius: 8px;
  padding: 6px 12px;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
  transition: border-color 0.12s ease, background 0.12s ease;
}

.ds-btn:hover { border-color: var(--dsw-alias-border-l2); }

.ds-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ds-btn-primary {
  background: var(--dsw-alias-brand-primary);
  border-color: var(--dsw-alias-brand-primary);
  color: #fff;
  font-weight: 600;
}

.ds-btn-primary:hover { filter: brightness(1.06); }

.ds-btn-ghost {
  background: transparent;
  border-color: transparent;
  color: var(--dsw-alias-label-secondary);
  padding: 4px 8px;
}

.ds-btn-ghost:hover {
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-primary);
}

.ds-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.ds-pill {
  appearance: none;
  border: 1px solid var(--dsw-alias-border-l1);
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  border-radius: 999px;
  padding: 4px 11px;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
}

.ds-pill:hover { border-color: var(--dsw-alias-border-l2); color: var(--dsw-alias-label-primary); }

.ds-pill[data-active='true'] {
  background: var(--dsw-alias-brand-primary);
  border-color: var(--dsw-alias-brand-primary);
  color: #fff;
  font-weight: 600;
}

.ds-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 10px;
}

.ds-field {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.ds-field > label {
  color: var(--dsw-alias-label-secondary);
  font-size: 11px;
}

.ds-field-wide { grid-column: 1 / -1; }

.ds-stat {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.ds-stat b {
  font-size: 15px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
}

.ds-stat span { color: var(--dsw-alias-label-secondary); font-size: 11px; }

.ds-chip {
  display: inline-block;
  border-radius: 6px;
  padding: 1px 7px;
  font-size: 11px;
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-secondary);
  border: 1px solid var(--dsw-alias-border-l1);
}

.ds-level-pass { color: var(--dsw-alias-state-success-primary); }
.ds-level-warn { color: var(--dsw-alias-state-warn-primary); }
.ds-level-block { color: var(--dsw-alias-state-error-primary); }

.ds-issue {
  border-left: 3px solid var(--dsw-alias-border-l2);
  padding: 6px 0 6px 10px;
  margin-bottom: 8px;
}

.ds-issue[data-level='warn'] { border-left-color: var(--dsw-alias-state-warn-primary); }
.ds-issue[data-level='block'] { border-left-color: var(--dsw-alias-state-error-primary); }

.ds-issue b { font-size: 12px; }

.ds-issue p {
  margin: 2px 0 0;
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
}

.ds-issue code {
  background: var(--dsw-alias-bg-layer-2);
  border-radius: 4px;
  padding: 0 4px;
  font-size: 11px;
}

.ds-variant {
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 10px;
  padding: 12px 14px;
  background: var(--dsw-alias-bg-layer-1);
  margin-bottom: 10px;
}

.ds-variant-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.ds-variant-body {
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 12.5px;
  line-height: 1.7;
}

.ds-tags {
  margin-top: 8px;
  color: var(--dsw-alias-brand-primary);
  font-size: 12px;
  word-break: break-word;
}

.ds-notes {
  margin: 8px 0 0;
  padding: 8px 10px;
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-secondary);
  font-size: 11.5px;
  white-space: pre-wrap;
}

.ds-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-2);
  border: 1px dashed var(--dsw-alias-border-l2);
  min-height: 200px;
}

.ds-preview img {
  max-width: 100%;
  max-height: 460px;
  border-radius: 8px;
  display: block;
}

.ds-empty {
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  text-align: center;
  padding: 24px 8px;
}

.ds-tabs {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid var(--dsw-alias-border-l1);
  margin-bottom: 12px;
}

.ds-tab {
  appearance: none;
  border: none;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  border-bottom: 2px solid transparent;
  padding: 6px 12px;
  font: inherit;
  font-size: 12.5px;
  cursor: pointer;
  margin-bottom: -1px;
}

.ds-tab[data-active='true'] {
  color: var(--dsw-alias-label-primary);
  border-bottom-color: var(--dsw-alias-brand-primary);
  font-weight: 600;
}

.ds-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11.5px;
}

.ds-toast {
  position: fixed;
  left: 50%;
  bottom: 32px;
  transform: translateX(-50%);
  background: var(--dsw-alias-bg-overlay, var(--dsw-alias-bg-layer-2));
  color: var(--dsw-alias-label-primary);
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 12px;
  z-index: 60;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
}
`
