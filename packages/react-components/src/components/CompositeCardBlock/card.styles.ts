import { css } from "goober";
export const wrapperClass = "openui-composite-card-block-card-wrapper";
export const rootClass = "openui-composite-card-block-card-root";

const stylesheetScope = css`
  :where(&:root) {
    .openui-composite-card-block-card-wrapper {
      height: 100%;
    }
    .openui-composite-card-block-card-root {
      & {
        display: flex;
        flex-direction: column;
        gap: var(--openui-space-m, 12px);
        min-width: 15rem;
        height: 100%;
        padding: var(--openui-space-m, 12px);
        border: 1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06));
        border-radius: var(--openui-radius-3xl, 16px);
        box-sizing: border-box;
        background: var(--openui-sunk-light, oklch(0.097 0 0 / 0.02));
      }
      &:where(.openui-composite-card--clickable) {
        background: var(--openui-foreground, oklch(0.994 0 89.876 / 1));
        border-color: var(--openui-border-interactive, oklch(0.097 0 0 / 0.12));
        box-shadow: var(
          --openui-shadow-m,
          0 4px 6px -2px oklch(0 0 0 / 0.025),
          0 2px 2px -2px oklch(0 0 0 / 0.05)
        );
        cursor: pointer;
        transition:
          transform 0.2s ease,
          box-shadow 0.2s ease;
      }
      &:hover:where(.openui-composite-card--clickable) {
        transform: scale(0.995);
        box-shadow: none;
      }
      &:focus-visible:where(.openui-composite-card--clickable) {
        outline: 2px solid var(--openui-border-accent, oklch(0.546 0.215 262.881 / 0.08));
        outline-offset: 2px;
      }
      & :where(.openui-composite-card__header) {
        display: flex;
        flex-direction: column;
        gap: var(--openui-space-m, 12px);
        flex-shrink: 0;
      }
      & :where(.openui-composite-card__body) {
        display: flex;
        flex: 1;
        flex-direction: column;
        gap: var(--openui-space-m, 12px);
        min-height: 0;
      }
      & .openui-inline-markdown-renderer strong,
      & .openui-inline-markdown-renderer em {
        font: inherit;
        letter-spacing: inherit;
      }
      & .openui-inline-markdown-renderer strong,
      & .openui-inline-markdown-renderer strong em,
      & .openui-inline-markdown-renderer em strong {
        font-weight: var(--openui-font-weight-medium, 560);
        font-variation-settings: var(--openui-font-variation-medium, "wght" 560);
      }
      & .openui-inline-markdown-renderer em,
      & .openui-inline-markdown-renderer strong em,
      & .openui-inline-markdown-renderer em strong {
        font-style: italic;
      }
      & .openui-inline-markdown-renderer code {
        font: var(--openui-text-code-sm, 400 12px/1.5 "SFMono-Regular", Menlo, monospace);
        letter-spacing: var(--openui-text-code-sm-letter-spacing, 0);
        line-height: 1;
      }
      & :where(.openui-composite-card__footer) {
        display: flex;
        flex-shrink: 0;
        margin-top: auto;
      }
      & :where(.openui-composite-card__footer > *) {
        width: 100%;
      }
      & :where(.openui-composite-card__footer-content) {
        display: flex;
        flex-direction: column;
        gap: var(--openui-space-s, 8px);
        width: 100%;
      }
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}
