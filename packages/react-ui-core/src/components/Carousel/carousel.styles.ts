import { css, type CSSAttribute } from "goober";
export const carouselClass = css({
  position: "relative",
  display: "flex",
  "@media (max-width: 400px)": { "& .openui-carousel-item": { width: "248px", flexShrink: 0 } },
  "&.openui-carousel--sunk .openui-carousel-item": {
    backgroundColor: "var(--openui-highlight-subtle, oklch(0.097 0 0 / 0.02))",
  },
} satisfies CSSAttribute);
export const contentClass = css({
  position: "relative",
  display: "flex",
  flexDirection: "row",
  gap: "var(--openui-space-m, 12px)",
  overflowX: "auto",
  scrollSnapType: "x mandatory",
  msOverflowX: "hidden",
  scrollbarWidth: "none",
  "&.openui-carousel-content--mask-left.openui-carousel-content--mask-right": {
    maskImage:
      "linear-gradient(to right, transparent, black 40px, black calc(100% - 40px), transparent)",
    WebkitMaskImage:
      "linear-gradient(to right, transparent, black 40px, black calc(100% - 40px), transparent)",
  },
  "&.openui-carousel-content--mask-left:not(.openui-carousel-content--mask-right)": {
    maskImage: "linear-gradient(to right, transparent, black 40px, black)",
    WebkitMaskImage: "linear-gradient(to right, transparent, black 40px, black)",
  },
  "&.openui-carousel-content--mask-right:not(.openui-carousel-content--mask-left)": {
    maskImage: "linear-gradient(to left, transparent, black 40px, black)",
    WebkitMaskImage: "linear-gradient(to left, transparent, black 40px, black)",
  },
  "& .openui-carousel-content-wrapper": { display: "flex", gap: "var(--openui-space-m, 12px)" },
  "&::-webkit-scrollbar": { display: "none" },
  "& > *": { boxSizing: "border-box", scrollSnapAlign: "start" },
} satisfies CSSAttribute);
export const itemClass = css({
  font: 'var(--openui-text-body-default, 400 16px/1.5 "Inter", sans-serif)',
  letterSpacing: "var(--openui-text-body-default-letter-spacing, -0.01em)",
  fontVariationSettings: 'var(--openui-font-variation-regular, "wght" 440)',
  display: "flex",
  flexDirection: "column",
  gap: "var(--openui-space-m, 12px)",
  width: "280px",
  flexShrink: 0,
  borderRadius: "var(--openui-radius-2xl, 14px)",
  backgroundColor: "var(--openui-foreground, oklch(0.994 0 89.876 / 1))",
  padding: "var(--openui-space-m, 12px)",
  border: "1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06))",
} satisfies CSSAttribute);
export const buttonClass = css({
  position: "absolute",
  top: "50%",
  zIndex: 10,
  transform: "translateY(-50%)",
  background: "var(--openui-foreground, oklch(0.994 0 89.876 / 1))",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "var(--openui-radius-s, 6px)",
  "&.openui-carousel-button-left": { left: "-12px" },
  "&.openui-carousel-button-right": { right: "-12px" },
} satisfies CSSAttribute);
