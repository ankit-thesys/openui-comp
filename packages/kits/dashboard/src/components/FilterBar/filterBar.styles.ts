import { css } from "goober";
import { C1_CLASS_PREFIX as P } from "../../shared/classPrefix";
import { typography } from "../../shared/typography";

export const filterBarClass = css`
  display: flex;
  flex-wrap: nowrap;
  align-items: flex-end;
  gap: var(--openui-space-s);
  width: 100%;
  min-width: 0;
  overflow: visible;

  &.${P}-filter-bar--compact {
    gap: var(--openui-space-xs);
  }

  & .${P}-filter-bar__side {
    display: flex;
    flex-wrap: nowrap;
    align-items: flex-end;
    gap: var(--openui-space-s);
    min-width: 0;
    overflow: visible;
  }

  & .${P}-filter-bar__side > * {
    flex: 0 0 auto;
  }

  & .openui-date-picker-renderer-floating-container {
    width: 180px;
    align-self: flex-end;
  }

  & .openui-date-picker-renderer-floating-input-container {
    height: 32px;
    padding: 0 var(--openui-space-s);
    border-color: var(--openui-border-interactive);
    border-radius: var(--openui-radius-m);
    background: var(--openui-foreground);
    box-shadow: none;
    ${typography("label", "small")}
  }

  & .openui-date-picker-renderer-floating-input-container-text {
    font: inherit;
    letter-spacing: inherit;
  }

  & .openui-date-picker-renderer-floating-input-container-has-no-selected-date {
    color: var(--openui-text-neutral-secondary);
  }

  & .${P}-filter-bar__side--left {
    flex: 1 1 auto;
  }

  & .${P}-filter-bar__side--right {
    flex: 0 0 auto;
    justify-content: flex-end;
    margin-left: auto;
  }

  &.${P}-filter-bar--compact
    .${P}-filter-bar__side,
    &.${P}-filter-bar--compact
    .${P}-filter-bar__actions {
    gap: var(--openui-space-xs);
  }
`;
