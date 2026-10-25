import type { CSSAttribute } from "goober";
export const tableStyles = {
  padding: "var(--openui-space-s, 8px) 0",
  "& .openui-skeleton-table-row": {
    display: "grid",
    gap: "var(--openui-space-m, 12px)",
    padding: "var(--openui-space-s-m, 10px) var(--openui-space-m, 12px)",
    borderBottom: "1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06))",
    "&:last-child": { borderBottom: 0 },
  },
  "& .openui-skeleton-table-cell": { height: "14px" },
  "& .openui-skeleton-table-cell-short": { width: "60%" },
} satisfies CSSAttribute;
