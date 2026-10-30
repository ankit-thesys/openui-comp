import { css } from "../../../../../styles/css";

import { iconButtonStyles } from "../../../../IconButton/iconButton.styles";

export const names = {
  root: "openui-scroll-buttons-vertical",
  button: "openui-scroll-buttons-vertical-button",
  icon: "openui-scroll-buttons-vertical-icon",
  up: "openui-scroll-buttons-vertical-up",
  down: "openui-scroll-buttons-vertical-down",
} as const;

export const scrollButtonsVerticalStyles = /*#__PURE__*/ (() => {
  // Register composed controls first so these equal-weight part rules also win on first render.
  iconButtonStyles(css);
  return {
    root: css`
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      width: 36px;
      height: calc(100% - 44px);
      flex-shrink: 0;
      padding-left: var(--openui-space-2xs, 4px);
    `,
    button: css`
      pointer-events: auto;
      background-color: var(--openui-foreground, oklch(0.994 0 89.876 / 1));
      &:disabled {
        visibility: hidden;
        cursor: not-allowed;
        transition: visibility 0.1s linear;
      }
    `,
  };
})();
