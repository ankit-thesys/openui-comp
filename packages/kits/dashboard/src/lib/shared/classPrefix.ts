/**
 * Brand prefix for non-chart c1 product class names and DOM markers.
 * SCSS can't read TS constants: `src/_prefix.scss` mirrors this as `$prefix`.
 * Change BOTH mirrors together to keep styles aligned with emitted DOM.
 */
export const C1_CLASS_PREFIX = "c1" as const;
