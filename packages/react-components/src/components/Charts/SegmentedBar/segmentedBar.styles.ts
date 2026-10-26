import { css } from "goober";
export const rootClass = css`
  & {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    position: relative;
  }

  & {
    justify-content: center;
  }
  &:where(.openui-segmented-bar-container--gap) {
    gap: var(--openui-space-m, 12px);
  }

  & :where(.openui-segmented-bar) {
    width: 100%;
    box-sizing: border-box;
    height: 20px;
    font-family: inherit;
    background-color: var(--openui-background, oklch(0.97 0 89.876 / 1));
    border-radius: var(--openui-radius-s, 6px);
    overflow: hidden;
    box-shadow: var(
      --openui-shadow-s,
      0 1px 3px -2px oklch(0 0 0 / 0.02),
      0 2px 5px -2px oklch(0 0 0 / 0.04)
    );
    display: flex;
    padding: var(--openui-space-2xs, 4px);
    gap: var(--openui-space-3xs, 2px);
  }

  & :where(.openui-segmented-bar-segment) {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 2px;
    box-shadow: var(
      --openui-shadow-s,
      0 1px 3px -2px oklch(0 0 0 / 0.02),
      0 2px 5px -2px oklch(0 0 0 / 0.04)
    );
    position: relative;
    overflow: hidden;
    transition:
      box-shadow 0.2s ease,
      filter 0.2s ease,
      opacity 0.2s ease;
  }
  & :first-child:where(.openui-segmented-bar-segment) {
    border-radius: var(--openui-radius-xs, 4px) 0 0 var(--openui-radius-xs, 4px);
  }
  & :last-child:where(.openui-segmented-bar-segment) {
    border-radius: 0 var(--openui-radius-xs, 4px) var(--openui-radius-xs, 4px) 0;
  }
  & :where(.openui-segmented-bar-segment-line) {
    position: absolute;
    transform: translateY(-50%);
    background-color: var(--openui-border-accent-emphasis, oklch(0.546 0.215 262.881 / 0.3));
    top: 50%;
    left: 5px;
    width: calc(100% - 10px);
    height: 1px;
    z-index: 1;
    min-width: 2px;
  }
  & :where(.openui-segmented-bar-segment--animated) {
    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  & :where(.openui-segmented-bar-stacked-legend) {
    margin-top: var(--openui-space-s, 8px);
  }
`;
