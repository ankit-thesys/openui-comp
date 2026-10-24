import type { CSSAttribute } from "goober";
export const loaderStyles = {
  "--openui-dot-matrix-loader-grid-size": 5,
  "--openui-dot-matrix-loader-size": "36px",
  display: "grid",
  gridTemplateColumns: "repeat(var(--openui-dot-matrix-loader-grid-size), 1fr)",
  width: "var(--openui-dot-matrix-loader-size)",
  height: "var(--openui-dot-matrix-loader-size)",
  "& .openui-dot-matrix-loader__dot": {
    justifySelf: "center",
    alignSelf: "center",
    width: "68%",
    aspectRatio: 1,
    borderRadius: "50%",
    backgroundColor: "var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6))",
    opacity: 0.14,
  },
} satisfies CSSAttribute;
