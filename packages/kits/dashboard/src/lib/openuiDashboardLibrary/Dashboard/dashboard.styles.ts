import { css } from "goober";

/**
 * The dashboard root's LAYOUT. The token scope it used to sit beside
 * (`.c1-dashboard-theme`, ~100 custom properties) lives in TypeScript —
 * `components/DashboardThemeProvider` — so consumers can override tokens
 * through the `lightTheme` / `darkTheme` props.
 */
export const dashboardClass = css`
  display: flex;
  flex-direction: column;
  gap: var(--openui-space-l);
`;
