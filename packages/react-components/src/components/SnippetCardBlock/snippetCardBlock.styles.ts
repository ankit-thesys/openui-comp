import { css } from "goober";
export const rootClass = "openui-snippet-card-block-root";

const stylesheetScope = css`
  :where(&:root) {
    .openui-snippet-card-block-root {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--openui-space-m, 12px);
      width: 100%;
      min-width: 0;
      padding: var(--openui-space-s-m, 10px);
      box-sizing: border-box;
      border: 1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06));
      border-radius: var(--openui-radius-2xl, 14px);
      background-color: var(--openui-sunk-light, oklch(0.097 0 0 / 0.02));
      position: relative;
      overflow: hidden;
      transition:
        background-color 0.2s ease,
        border-color 0.2s ease,
        box-shadow 0.2s ease,
        transform 0.2s ease;
      &:where(.openui-value-card--static) {
        background-color: var(--openui-sunk-light, oklch(0.097 0 0 / 0.02));
        border-color: var(--openui-border-default, oklch(0.097 0 0 / 0.06));
        box-shadow: none;
      }
      &:where(.openui-value-card--clickable) {
        background-color: var(--openui-foreground, oklch(0.994 0 89.876 / 1));
        border-color: var(--openui-border-interactive, oklch(0.097 0 0 / 0.12));
        box-shadow: var(
          --openui-shadow-s,
          0 1px 3px -2px oklch(0 0 0 / 0.02),
          0 2px 5px -2px oklch(0 0 0 / 0.04)
        );
        cursor: pointer;
      }
      &:hover:where(.openui-value-card--clickable) {
        box-shadow: none;
        transform: scale(0.995);
      }
      &:focus-visible:where(.openui-value-card--clickable) {
        outline: 2px solid var(--openui-border-accent, oklch(0.546 0.215 262.881 / 0.08));
        outline-offset: 2px;
      }
      & :where(.openui-value-card__lhs) {
        display: flex;
        align-items: center;
        min-width: 0;
        flex: 1;
      }
      & :where(.openui-value-card__lhs > *) {
        min-width: 0;
      }
      & :where(.openui-value-card__rhs) {
        flex-shrink: 1;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        min-width: 0;
        margin-left: var(--openui-space-m, 12px);
        color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
        font: var(--openui-text-numbers-lg-heavy, 560 18px/1.5 "Inter", sans-serif);
        letter-spacing: var(--openui-text-numbers-lg-heavy-letter-spacing, -0.01em);
        font-variation-settings: var(--openui-font-variation-medium, "wght" 560);
      }
      & :where(.openui-value-card__rhs-content) {
        display: flex;
        justify-content: flex-end;
        min-width: 0;
        max-width: 100%;
      }
      & .openui-value-card__lhs :where(.openui-icon-text),
      & .openui-value-card__lhs :where(.openui-image-text),
      & .openui-value-card__lhs :where(.openui-icon-text__content),
      & .openui-value-card__lhs :where(.openui-image-text__content),
      & .openui-value-card__lhs :where(.openui-text-block),
      & :where(.openui-value-card__rhs-content),
      & :where(.openui-value-card__rhs-content > *),
      & .openui-value-card__rhs :where(.openui-text-block) {
        min-width: 0;
      }
      & .openui-value-card__lhs :where(.openui-icon-text),
      & .openui-value-card__lhs :where(.openui-image-text),
      & .openui-value-card__lhs :where(.openui-text-block),
      & :where(.openui-value-card__rhs-content) {
        width: 100%;
        overflow: hidden;
      }
      & .openui-value-card__rhs :where(.openui-text-block) {
        align-items: flex-end;
        width: auto;
        max-width: 100%;
        overflow: hidden;
        text-align: right;
      }
      & .openui-value-card__lhs :where(.openui-text-block__primary),
      & .openui-value-card__lhs :where(.openui-text-block__secondary),
      & .openui-value-card__rhs :where(.openui-text-block__primary),
      & .openui-value-card__rhs :where(.openui-text-block__secondary) {
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      & .openui-value-card__rhs :where(.openui-text-block--align-left) {
        align-items: flex-end;
        text-align: right;
      }
      & :where(.openui-value-card__chevron) {
        color: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}
