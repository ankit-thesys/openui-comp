import { css } from "goober";
import { C1_CLASS_PREFIX as P } from "../../shared/classPrefix";
import { dashboardTypography, typography } from "../../shared/typography";

const B = `${P}-dashboard-text-block`;

/**
 * One block, nested in the source order of the stylesheet it replaces: the
 * variant rules come first, then the size overrides that must win over them,
 * then alignment. Every rule gains the same single class, so their relative
 * specificity — and therefore which one wins — is unchanged.
 */
export const textBlockClass = css`
  display: flex;
  flex-direction: column;
  gap: var(--openui-space-3xs);
  align-items: flex-start;
  text-align: left;

  & .${B}__primary {
    color: var(--openui-text-neutral-primary);
  }

  & .${B}__secondary {
    color: var(--openui-text-neutral-secondary);
  }

  & .${B}__secondary--positive {
    color: var(--openui-text-success-primary);
  }

  & .${B}__secondary--negative {
    color: var(--openui-text-danger-primary);
  }

  & .${B}__tertiary {
    display: none;
  }

  /* ── Variant: text-subtext ── */
  &.${B}--text-subtext .${B}__primary {
    ${typography("body", "default")}
  }
  &.${B}--text-subtext .${B}__secondary {
    ${typography("body", "small")}
  }

  /* ── Variant: highlight-text-number-subtext ── */
  &.${B}--highlight-text-number-subtext {
    gap: 0;
  }
  &.${B}--highlight-text-number-subtext .${B}__primary {
    ${dashboardTypography("highlight")}
  }
  &.${B}--highlight-text-number-subtext .${B}__secondary {
    ${typography("body", "small")}
  }

  /* ── Variant: text ── */
  &.${B}--text .${B}__primary {
    ${typography("body", "default")}
  }

  /* ── Variant: highlight-text ── */
  &.${B}--highlight-text .${B}__primary {
    ${dashboardTypography("highlight")}
  }

  /* ── Variant: number ── */
  &.${B}--number .${B}__primary {
    ${dashboardTypography("metric")}
  }

  /* ── Variant: highlight-number ── */
  &.${B}--highlight-number .${B}__primary {
    ${dashboardTypography("metric", "lg")}
  }

  /* ── Size: xs ── */
  &.${B}--size-xs.${B}--text-subtext, &.${B}--size-xs.${B}--highlight-text-number-subtext {
    gap: 0;
  }
  &.${B}--size-xs.${B}--text-subtext .${B}__primary, &.${B}--size-xs.${B}--text .${B}__primary {
    font-size: var(--openui-font-size-sm);
    font-weight: var(--openui-font-weight-regular);
  }
  &.${B}--size-xs.${B}--text.${B}--type-number
    .${B}__primary,
    &.${B}--size-xs.${B}--number
    .${B}__primary {
    font-size: var(--openui-font-size-sm);
    font-weight: var(--openui-font-weight-bold);
  }
  &.${B}--size-xs.${B}--highlight-text-number-subtext
    .${B}__primary,
    &.${B}--size-xs.${B}--highlight-text
    .${B}__primary,
    &.${B}--size-xs.${B}--highlight-number
    .${B}__primary {
    font-size: var(--openui-font-size-sm);
    font-weight: var(--openui-font-weight-heavy);
  }
  &.${B}--size-xs.${B}--text-subtext
    .${B}__secondary,
    &.${B}--size-xs.${B}--highlight-text-number-subtext
    .${B}__secondary {
    font-size: var(--openui-font-size-sm);
    font-weight: var(--openui-font-weight-regular);
  }

  /* ── Size: sm (default) — uses the base variant styles ── */

  /* ── Size: md ── */
  &.${B}--size-md.${B}--text-subtext,
    &.${B}--size-md.${B}--highlight-text,
    &.${B}--size-md.${B}--highlight-text-number-subtext {
    gap: 0;
  }

  /* ── Size: lg ── */
  &.${B}--size-lg.${B}--text .${B}__primary {
    font-size: var(--openui-font-size-md);
  }
  &.${B}--size-lg.${B}--highlight-text .${B}__primary {
    font-size: var(--openui-font-size-md);
    font-weight: var(--openui-font-weight-heavy);
  }
  &.${B}--size-lg.${B}--highlight-number .${B}__primary {
    font-size: var(--openui-font-size-2xl);
    font-weight: var(--openui-font-weight-heavy);
  }
  &.${B}--size-lg.${B}--text-subtext, &.${B}--size-lg.${B}--highlight-text-number-subtext {
    gap: 0;
  }

  /* ── Alignment ── */
  &.${B}--align-left {
    align-items: flex-start;
    text-align: left;
  }
  &.${B}--align-center {
    align-items: center;
    text-align: center;
  }
  &.${B}--align-right {
    align-items: flex-end;
    text-align: right;
  }
`;
