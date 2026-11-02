import { css } from "@openuidev/react-components";

export const names = { root: "openui-dashboard-list" } as const;

export const styles = {
  root: css`
    display: flex;
    flex-direction: column;
    gap: var(--openui-space-l, 18px);
    width: 100%;
    padding: 16px 0;
  `,
};
