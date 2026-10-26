import { css, keyframes } from "goober";
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;
const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translate(-50%, -48%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
`;
export const rootClass = css`
  position: relative;
  z-index: 9999;
  & :where(.openui-modal-sr-only) {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`;
export const overlayClass = css`
  position: fixed;
  inset: 0;
  background: var(--openui-overlay, oklch(0 0 0 / 0.4));
  z-index: 9999;
  animation: ${fadeIn} 0.15s ease-out;
`;
export const contentClass = css`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10000;
  background: var(--openui-foreground, oklch(0.994 0 89.876 / 1));
  color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
  border: 1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06));
  border-radius: 12px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  max-height: 85vh;
  animation: ${slideIn} 0.15s ease-out;
  &:focus {
    outline: none;
  }
  &:where(.openui-modal-sm) {
    width: 400px;
    max-width: 90vw;
  }
  &:where(.openui-modal-md) {
    width: 560px;
    max-width: 90vw;
  }
  &:where(.openui-modal-lg) {
    width: 720px;
    max-width: 90vw;
  }
`;
export const headerClass = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--openui-space-m, 12px);
  border-bottom: 1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06));
`;
export const titleClass = css`
  font: var(--openui-text-body-default-heavy, 560 16px/1.5 "Inter", sans-serif);
  letter-spacing: var(--openui-text-body-default-heavy-letter-spacing, -0.01em);
  font-variation-settings: var(--openui-font-variation-medium, "wght" 560);
  margin: 0;
`;
export const closeClass = css`
  all: unset;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  color: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
  &:hover {
    color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
  }
`;
export const bodyClass = css`
  padding: var(--openui-space-m, 12px);
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--openui-space-m, 12px);
`;
