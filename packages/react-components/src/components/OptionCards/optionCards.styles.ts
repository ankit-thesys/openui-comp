import { css } from "goober";

const stylesheetScope = css`
  :where(&:root) {
    .openui-option-cards-root {
      width: 100%;
      container-type: inline-size;
      & :where(.openui-option-cards__grid) {
        display: flex;
        flex-direction: column;
        gap: var(--openui-space-m, 12px);
        width: 100%;
      }
      & :where(.openui-option-cards__row) {
        display: grid;
        gap: var(--openui-space-m, 12px);
        width: 100%;
        align-items: stretch;
      }
      & :where(.openui-option-cards__row--1) {
        grid-template-columns: 1fr;
      }
      & :where(.openui-option-cards__row--2) {
        grid-template-columns: repeat(2, 1fr);
      }
      & :where(.openui-option-cards__row--3) {
        grid-template-columns: repeat(3, 1fr);
      }
      & :where(.openui-option-cards__item) {
        width: 100%;
        min-width: 0;
      }
      & :where(.openui-option-card) {
        display: flex;
        align-items: flex-start;
        justify-content: flex-start;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        padding: var(--openui-space-s-m, 10px);
        border: 1px solid var(--openui-border-interactive, oklch(0.097 0 0 / 0.12));
        border-radius: var(--openui-radius-2xl, 14px);
        background: transparent;
        cursor: pointer;
        text-align: left;
        transition:
          opacity 0.16s ease-out,
          border-color 0.16s ease-out,
          background-color 0.16s ease-out;
      }
      & :hover:not(:disabled):not(.openui-option-card--selected):where(.openui-option-card) {
        border-color: var(--openui-border-interactive-emphasis, oklch(0.097 0 0 / 0.3));
      }
      & :focus-visible:where(.openui-option-card) {
        outline: 2px solid var(--openui-border-accent, oklch(0.546 0.215 262.881 / 0.08));
        outline-offset: 2px;
      }
      & :where(.openui-option-card--selected) {
        background: var(--openui-sunk, oklch(0.097 0 0 / 0.04));
        border-color: var(--openui-border-interactive-selected, oklch(0.097 0 0 / 1));
      }
      & :where(.openui-option-card--disabled) {
        opacity: 0.5;
        cursor: not-allowed;
      }
      & :where(.openui-option-card__content) {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
        gap: var(--openui-space-m, 12px);
        width: 100%;
      }
      & :where(.openui-option-card__top) {
        align-self: flex-start;
        flex-shrink: 0;
      }
      & :where(.openui-option-card__top--icon) {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 2rem;
        height: 2rem;
        border-radius: var(--openui-radius-s, 6px);
        background: var(--openui-sunk, oklch(0.097 0 0 / 0.04));
        color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
      }
      & :where(.openui-option-card__top--image) {
        width: 4.5rem;
        height: 4.5rem;
        border-radius: var(--openui-radius-m, 8px);
        overflow: hidden;
      }
      & img:where(.openui-option-card__top--image img) {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      & :where(.openui-option-card__text) {
        display: flex;
        flex-direction: column;
        gap: var(--openui-space-3xs, 2px);
        min-width: 0;
      }
      & :where(.openui-option-card__title) {
        color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
        word-wrap: break-word;
        overflow-wrap: break-word;
        font: var(--openui-text-body-default-heavy, 560 16px/1.5 "Inter", sans-serif);
        letter-spacing: var(--openui-text-body-default-heavy-letter-spacing, -0.01em);
        font-variation-settings: var(--openui-font-variation-medium, "wght" 560);
      }
      & :where(.openui-option-card__subtitle) {
        color: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
        word-wrap: break-word;
        overflow-wrap: break-word;
        font: var(--openui-text-body-sm, 400 14px/1.5 "Inter", sans-serif);
        letter-spacing: var(--openui-text-body-sm-letter-spacing, -0.01em);
        font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
      }
      & .openui-option-card--disabled :where(.openui-option-card__title),
      & .openui-option-card--disabled :where(.openui-option-card__subtitle) {
        color: var(--openui-text-neutral-tertiary, oklch(0.097 0 0 / 0.2));
      }
      @container (max-width: 768px) {
        & :where(.openui-option-cards__grid--responsive) {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
        }
        & .openui-option-cards__grid--responsive :where(.openui-option-cards__row) {
          display: contents;
        }
      }
      @container (max-width: 480px) {
        & :where(.openui-option-cards__grid--responsive) {
          grid-template-columns: 1fr;
        }
      }
      @container (max-width: 768px) {
        &
          .openui-option-cards__grid--odd-count
          .openui-option-cards__row:last-child
          > :last-child:where(.openui-option-cards__item) {
          grid-column: 1 / -1;
        }
      }
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}

export const rootClass = "openui-option-cards-root";
