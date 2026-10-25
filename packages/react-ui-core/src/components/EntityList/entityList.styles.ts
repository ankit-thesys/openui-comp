import { css } from "goober";
export const rootClass = css`
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  & :where(.openui-entity-list__row) {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--openui-space-m, 12px);
    padding: var(--openui-space-m, 12px) 0;
    border-bottom: 1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06));
    color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
  }
  & :last-child:where(.openui-entity-list__row) {
    border-bottom: none;
  }
  & :where(.openui-entity-list__cell-left),
  & :where(.openui-entity-list__cell-right) {
    flex: 1;
    min-width: 0;
    max-width: 50%;
    overflow-wrap: break-word;
    word-wrap: break-word;
  }
  & :where(.openui-entity-list__cell-right) {
    text-align: right;
  }
  &.openui-entity-list--default :where(.openui-entity-list__cell-left) {
    font: var(--openui-text-body-default, 400 16px/1.5 "Inter", sans-serif);
    letter-spacing: var(--openui-text-body-default-letter-spacing, -0.01em);
    font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
  }
  &.openui-entity-list--default :where(.openui-entity-list__cell-right) {
    font: var(--openui-text-body-default-heavy, 560 16px/1.5 "Inter", sans-serif);
    letter-spacing: var(--openui-text-body-default-heavy-letter-spacing, -0.01em);
    font-variation-settings: var(--openui-font-variation-medium, "wght" 560);
  }
  &.openui-entity-list--default
    .openui-entity-list__row--header
    :where(.openui-entity-list__cell-left),
  &.openui-entity-list--default
    .openui-entity-list__row--header
    :where(.openui-entity-list__cell-right) {
    color: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
  }
  &.openui-entity-list--default :where(.openui-entity-list__cell-right--number) {
    font: var(--openui-text-numbers-default-heavy, 560 16px/1.5 "Inter", sans-serif);
    letter-spacing: var(--openui-text-numbers-default-heavy-letter-spacing, -0.01em);
    font-variation-settings: var(--openui-font-variation-medium, "wght" 560);
  }
  &.openui-entity-list--default :where(.openui-entity-list__cell-left--footer) {
    font: var(--openui-text-body-default, 400 16px/1.5 "Inter", sans-serif);
    letter-spacing: var(--openui-text-body-default-letter-spacing, -0.01em);
    font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
  }
  &.openui-entity-list--default
    .openui-entity-list__cell-right--footer:where(.openui-entity-list__cell-right--text) {
    font: var(--openui-text-body-lg-heavy, 560 18px/1.5 "Inter", sans-serif);
    letter-spacing: var(--openui-text-body-lg-heavy-letter-spacing, -0.01em);
    font-variation-settings: var(--openui-font-variation-medium, "wght" 560);
  }
  &.openui-entity-list--default
    .openui-entity-list__cell-right--footer:where(.openui-entity-list__cell-right--number) {
    font: var(--openui-text-numbers-lg-heavy, 560 18px/1.5 "Inter", sans-serif);
    letter-spacing: var(--openui-text-numbers-lg-heavy-letter-spacing, -0.01em);
    font-variation-settings: var(--openui-font-variation-medium, "wght" 560);
  }
  &.openui-entity-list--small :where(.openui-entity-list__cell-left) {
    font: var(--openui-text-body-sm, 400 14px/1.5 "Inter", sans-serif);
    letter-spacing: var(--openui-text-body-sm-letter-spacing, -0.01em);
    font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
  }
  &.openui-entity-list--small :where(.openui-entity-list__cell-right--text) {
    font: var(--openui-text-body-sm-heavy, 560 14px/1.5 "Inter", sans-serif);
    letter-spacing: var(--openui-text-body-sm-heavy-letter-spacing, -0.01em);
    font-variation-settings: var(--openui-font-variation-medium, "wght" 560);
  }
  &.openui-entity-list--small :where(.openui-entity-list__cell-right--number) {
    font: var(--openui-text-numbers-sm-heavy, 560 14px/1.5 "Inter", sans-serif);
    letter-spacing: var(--openui-text-numbers-sm-heavy-letter-spacing, -0.01em);
    font-variation-settings: var(--openui-font-variation-medium, "wght" 560);
  }
`;
