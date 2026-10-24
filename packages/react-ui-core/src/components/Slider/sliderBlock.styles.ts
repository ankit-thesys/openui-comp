import type { CSSAttribute } from "goober";
export const sliderBlockStyles = {
  width: "100%",
  "& .openui-slider-block__header": {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "calc(var(--openui-space-s, 8px) + var(--openui-space-xs, 6px))",
  },
  "& .openui-slider-block__header--with-error": {
    alignItems: "flex-start",
    marginBottom: "var(--openui-space-s, 8px)",
  },
  "& .openui-slider-block__label": {
    font: 'var(--openui-text-label-default, 400 16px/1.25 "Inter", sans-serif)',
    letterSpacing: "var(--openui-text-label-default-letter-spacing, -0.01em)",
    fontVariationSettings: 'var(--openui-font-variation-regular, "wght" 440)',
    color: "var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1))",
    paddingTop: "var(--openui-space-xs, 6px)",
  },
  "& .openui-slider-block__controls": {
    display: "flex",
    gap: "var(--openui-space-xs, 6px)",
    position: "relative",
    flexDirection: "column",
    alignItems: "flex-end",
    "& input, & button": { height: "36px" },
  },
  "& .openui-slider-block__controls.is-range .openui-slider-block__validated-input input": {
    width: "64px",
  },
  "& .openui-slider-block__controls.is-range button": { width: "80px" },
  "& .openui-slider-block__controls.is-single .openui-slider-block__validated-input input": {
    width: "80px",
  },
  "& .openui-slider-block__controls.is-single button": { width: "100px" },
  "& .openui-slider-block__content": { display: "flex", alignItems: "center" },
  "& .openui-slider-block__validated-input-container, & .openui-slider-block__validated-select-container":
    { display: "flex", gap: "var(--openui-space-xs, 6px)", alignItems: "center" },
  "& .openui-slider-block__validated-input": {
    position: "relative",
    "& .openui-slider-block__input-error": {
      borderColor: "var(--openui-border-danger-emphasis, oklch(0.577 0.215 27.325 / 1)) !important",
    },
  },
  "& .openui-slider-block__input": {
    "text-align": "right !important",
    paddingLeft: "var(--openui-space-s, 8px) !important",
    paddingRight: "var(--openui-space-s, 8px) !important",
  },
  "& .openui-slider-block__error-message": {
    display: "flex",
    gap: "var(--openui-space-2xs, 4px)",
    alignItems: "center",
    font: 'var(--openui-text-label-sm, 400 14px/1.25 "Inter", sans-serif)',
    letterSpacing: "var(--openui-text-label-sm-letter-spacing, -0.01em)",
    fontVariationSettings: 'var(--openui-font-variation-regular, "wght" 440)',
    color: "var(--openui-text-danger-primary, oklch(0.505 0.19 27.518 / 1))",
    whiteSpace: "nowrap",
    paddingRight: "var(--openui-space-2xs, 4px)",
  },
  "& .openui-slider-block__separator": {
    width: "8px",
    height: "2px",
    backgroundColor: "var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6))",
    flexShrink: 0,
  },
} satisfies CSSAttribute;
