import { css } from "goober";

/**
 * react-components' card sets width: 100% with padding and a border on a
 * content-box, so it overflows its grid cell by padding + border. Drop this once
 * react-components fixes it.
 */
export const overviewCardBlockClass = css`
  & .openui-overview-card {
    box-sizing: border-box;
  }
`;
