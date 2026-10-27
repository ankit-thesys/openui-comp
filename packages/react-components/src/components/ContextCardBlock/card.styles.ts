import { css } from "goober";
export const imageClass = "openui-context-card-block-card-image";
export const rootClass = "openui-context-card-block-card-root";

const stylesheetScope = css`
  :where(&:root) {
    .openui-context-card-block-card-image {
      & > * {
        position: relative;
        z-index: 2;
      }
      &::before {
        content: "";
        position: absolute;
        inset: 0;
        background: var(--openui-overlay, oklch(0 0 0 / 0.4));
        z-index: 1;
      }
    }
    .openui-context-card-block-card-root {
      & {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        width: 100%;
        min-width: 196px;
        padding: var(--openui-space-m, 12px);
        border: none;
        border-radius: var(--openui-radius-xl, 12px);
        box-sizing: border-box;
        overflow: hidden;
        position: relative;
        transition:
          background-color 0.2s ease,
          box-shadow 0.2s ease,
          transform 0.2s ease;
      }
      &:where(.openui-context-card--clickable) {
        background-color: var(--openui-highlight, oklch(0.097 0 0 / 0.04));
        cursor: pointer;
      }
      &:hover:where(.openui-context-card--clickable) {
        transform: scale(0.995);
      }
      &:focus-visible:where(.openui-context-card--clickable) {
        outline: 2px solid var(--openui-border-accent, oklch(0.546 0.215 262.881 / 0.08));
        outline-offset: 2px;
      }
      &:where(.openui-context-card--static) {
        background-color: var(--openui-highlight-subtle, oklch(0.097 0 0 / 0.02));
        box-shadow: none;
      }
      &:where(.openui-context-card--variant-gray) {
        background-color: var(--openui-highlight, oklch(0.097 0 0 / 0.04));
        color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
      }
      &:where(.openui-context-card--variant-info) {
        background-color: var(--openui-info-background, oklch(0.623 0.188 259.815 / 0.12));
        color: var(--openui-text-info-primary, oklch(0.424 0.181 265.638 / 1));
      }
      &.openui-context-card--variant-info :where(.openui-context-card__title-text) {
        color: var(--openui-text-info-primary, oklch(0.424 0.181 265.638 / 1));
        opacity: 0.8;
      }
      &.openui-context-card--variant-info :where(.openui-context-card__body-text) {
        color: var(--openui-text-info-primary, oklch(0.424 0.181 265.638 / 1));
      }
      &.openui-context-card--variant-info :where(.openui-context-card__tag) {
        background-color: var(--openui-elevated, oklch(0.097 0 0 / 0.08));
      }
      &:where(.openui-context-card--variant-success) {
        background-color: var(--openui-success-background, oklch(0.627 0.17 149.214 / 0.12));
        color: var(--openui-text-success-primary, oklch(0.448 0.108 151.328 / 1));
      }
      &.openui-context-card--variant-success :where(.openui-context-card__title-text) {
        color: var(--openui-text-success-primary, oklch(0.448 0.108 151.328 / 1));
        opacity: 0.8;
      }
      &.openui-context-card--variant-success :where(.openui-context-card__body-text) {
        color: var(--openui-text-success-primary, oklch(0.448 0.108 151.328 / 1));
      }
      &.openui-context-card--variant-success :where(.openui-context-card__tag) {
        background-color: var(--openui-elevated, oklch(0.097 0 0 / 0.08));
      }
      &:where(.openui-context-card--variant-warning) {
        background-color: var(--openui-alert-background, oklch(0.795 0.162 86.047 / 0.16));
        color: var(--openui-text-alert-primary, oklch(0.476 0.103 61.907 / 1));
      }
      &.openui-context-card--variant-warning :where(.openui-context-card__title-text) {
        color: var(--openui-text-alert-primary, oklch(0.476 0.103 61.907 / 1));
        opacity: 0.8;
      }
      &.openui-context-card--variant-warning :where(.openui-context-card__body-text) {
        color: var(--openui-text-alert-primary, oklch(0.476 0.103 61.907 / 1));
      }
      &.openui-context-card--variant-warning :where(.openui-context-card__tag) {
        background-color: var(--openui-elevated, oklch(0.097 0 0 / 0.08));
      }
      &:where(.openui-context-card--variant-danger) {
        background-color: var(--openui-danger-background, oklch(0.577 0.215 27.325 / 0.12));
        color: var(--openui-text-danger-primary, oklch(0.505 0.19 27.518 / 1));
      }
      &.openui-context-card--variant-danger :where(.openui-context-card__title-text) {
        color: var(--openui-text-danger-primary, oklch(0.505 0.19 27.518 / 1));
        opacity: 0.8;
      }
      &.openui-context-card--variant-danger :where(.openui-context-card__body-text) {
        color: var(--openui-text-danger-primary, oklch(0.505 0.19 27.518 / 1));
      }
      &.openui-context-card--variant-danger :where(.openui-context-card__tag) {
        background-color: var(--openui-elevated, oklch(0.097 0 0 / 0.08));
      }
      &:where(.openui-context-card--variant-image) {
        background-position: center;
        background-size: cover;
        color: var(--openui-text-white, oklch(1 0 89.876 / 1));
      }
      &.openui-context-card--variant-image :where(.openui-context-card__title-text) {
        color: var(--openui-text-white, oklch(1 0 89.876 / 1));
        opacity: 0.6;
      }
      &.openui-context-card--variant-image .openui-context-card__tag :where(.openui-tag) {
        background-color: rgba(0, 0, 0, 0.4);
        color: var(--openui-text-white, oklch(1 0 89.876 / 1));
        backdrop-filter: blur(2px);
        -webkit-backdrop-filter: blur(2px);
      }
      & :where(.openui-context-card__vertical) {
        display: flex;
        flex: 1;
        flex-direction: column;
        justify-content: space-between;
        min-width: 0;
        height: 100%;
        gap: var(--openui-space-l, 18px);
      }
      & :where(.openui-context-card__slot) {
        width: 100%;
        border-radius: var(--openui-radius-m, 8px);
      }
      & :where(.openui-context-card__slot--top) {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: var(--openui-space-s, 8px);
        min-height: var(--openui-space-xl, 24px);
      }
      & :where(.openui-context-card__slot--bottom) {
        display: flex;
        flex-direction: column;
        gap: var(--openui-space-2xs, 4px);
      }
      & :where(.openui-context-card__title-text) {
        font: var(--openui-text-body-sm, 400 14px/1.5 "Inter", sans-serif);
        letter-spacing: var(--openui-text-body-sm-letter-spacing, -0.01em);
        font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
        color: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
      }
      & :where(.openui-context-card__body-text) {
        font: var(--openui-text-body-default-heavy, 560 16px/1.5 "Inter", sans-serif);
        letter-spacing: var(--openui-text-body-default-heavy-letter-spacing, -0.01em);
        font-variation-settings: var(--openui-font-variation-medium, "wght" 560);
      }
      & :where(.openui-context-card__chevron) {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        color: currentColor;
        opacity: 0.7;
      }
      & :where(.openui-context-card__tag-wrapper) {
        display: flex;
        align-items: center;
        width: 100%;
        pointer-events: none;
      }
      & :where(.openui-context-card__tag) {
        border: none;
      }
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}
