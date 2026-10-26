import { css } from "goober";
export const rootClass = css`
  display: flex;
  flex-direction: column;
  gap: var(--openui-space-m, 12px);
  width: 100%;
  &:where(.openui-list-item-wrapper-with-action) {
    border-bottom: 1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06));
    padding-bottom: var(--openui-space-m, 12px);
  }
  &.openui-list-item-wrapper-with-action:hover :where(.openui-list-item-indicator) {
    scale: 1.1;
  }
  &:last-child:where(.openui-list-item-wrapper-with-action) {
    border-bottom: none;
    padding-bottom: 0;
  }
  & :where(.openui-list-item) {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: var(--openui-space-m, 12px);
  }
  & :where(.openui-list-item-clickable) {
    cursor: pointer;
  }
  & :not(:has(.openui-list-item-subtitle)):where(.openui-list-item) {
    align-items: center;
  }
  & :where(.openui-list-item-indicator) {
    margin-top: var(--openui-space-2xs, 4px);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background-color: var(--openui-sunk, oklch(0.097 0 0 / 0.04));
    border-radius: var(--openui-radius-m, 8px);
    color: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
    overflow: hidden;
    transition: background-color 0.2s ease;
    flex-shrink: 0;
  }
  & :where(.openui-list-item-indicator-no-subtitle) {
    height: 24px;
    width: 24px;
    margin-top: 0;
    border-radius: var(--openui-radius-s, 6px);
  }
  & :where(.openui-list-item-indicator-clickable) {
    background-color: var(--openui-sunk, oklch(0.097 0 0 / 0.04));
  }
  & :where(.openui-list-item-indicator-number) {
    color: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
    font: var(--openui-text-label-default, 400 16px/1.25 "Inter", sans-serif);
    letter-spacing: var(--openui-text-label-default-letter-spacing, -0.01em);
    font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
  }
  & :where(.openui-list-item-indicator-image) {
    border-radius: var(--openui-radius-s, 6px);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }
  & img:where(.openui-list-item-indicator-image img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  & :where(.openui-list-item-content-wrapper) {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    width: 100%;
  }
  & :where(.openui-list-item-content) {
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  & :where(.openui-list-item-title) {
    color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
    font: var(--openui-text-body-default, 400 16px/1.5 "Inter", sans-serif);
    letter-spacing: var(--openui-text-body-default-letter-spacing, -0.01em);
    font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
  }
  & :where(.openui-list-item-subtitle) {
    color: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
    font: var(--openui-text-body-default, 400 16px/1.5 "Inter", sans-serif);
    letter-spacing: var(--openui-text-body-default-letter-spacing, -0.01em);
    font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
  }
  & :where(.openui-list-item-action) {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: var(--openui-space-2xs, 4px);
    flex-shrink: 0;
  }
  & :where(.openui-list-item-action-label),
  & :where(.openui-list-item-action-icon) {
    color: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
    font: var(--openui-text-body-default, 400 16px/1.5 "Inter", sans-serif);
    letter-spacing: var(--openui-text-body-default-letter-spacing, -0.01em);
    font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
  }
  & .openui-list-item:hover :where(.openui-list-item-indicator-clickable),
  & .openui-list-item:focus :where(.openui-list-item-indicator-clickable) {
    background-color: var(--openui-highlight-strong, oklch(0.097 0 0 / 0.08));
  }
  & .openui-list-item:hover :where(.openui-list-item-action-label),
  & .openui-list-item:hover :where(.openui-list-item-action-icon),
  & .openui-list-item:focus :where(.openui-list-item-action-label),
  & .openui-list-item:focus :where(.openui-list-item-action-icon) {
    color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
  }
  &:where(.openui-list-item-wrapper--small) {
    gap: var(--openui-space-s, 8px);
  }
  &.openui-list-item-wrapper--small :where(.openui-list-item) {
    gap: var(--openui-space-s-m, 10px);
  }
  &.openui-list-item-wrapper--small :where(.openui-list-item-indicator) {
    width: 36px;
    height: 36px;
  }
  &.openui-list-item-wrapper--small :where(.openui-list-item-indicator-no-subtitle) {
    width: 20px;
    height: 20px;
  }
  &.openui-list-item-wrapper--small :where(.openui-list-item-indicator-number) {
    font: var(--openui-text-numbers-sm, 400 14px/1.5 "Inter", sans-serif);
    letter-spacing: var(--openui-text-numbers-sm-letter-spacing, -0.01em);
    font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
  }
  &.openui-list-item-wrapper--small :where(.openui-list-item-title),
  &.openui-list-item-wrapper--small :where(.openui-list-item-subtitle),
  &.openui-list-item-wrapper--small :where(.openui-list-item-action-label),
  &.openui-list-item-wrapper--small :where(.openui-list-item-action-icon) {
    font: var(--openui-text-body-sm, 400 14px/1.5 "Inter", sans-serif);
    letter-spacing: var(--openui-text-body-sm-letter-spacing, -0.01em);
    font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
  }
`;
