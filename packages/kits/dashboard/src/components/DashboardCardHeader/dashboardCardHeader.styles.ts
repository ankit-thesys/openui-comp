import { css } from "goober";
import { C1_CLASS_PREFIX as P } from "../../shared/classPrefix";
import { typography } from "../../shared/typography";

export const dashboardCardHeaderClass = css`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
  min-width: 0;
  gap: var(--openui-space-m);

  & .${P}-dashboard-card-header__main {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: flex-start;
    min-width: 0;
  }

  & .${P}-dashboard-card-header__content {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  & .${P}-dashboard-card-header__content .openui-text-block {
    gap: var(--openui-space-3xs);
  }

  &
    .${P}-dashboard-card-header__content
    .openui-text-block--title-text
    .openui-text-block__primary {
    color: var(--openui-text-neutral-primary);
    ${typography("body", "large-heavy")}
  }

  &
    .${P}-dashboard-card-header__content
    .openui-text-block--number-title-text
    .openui-text-block__primary {
    color: var(--openui-text-neutral-primary);
    ${typography("number", "heading-medium")}
  }

  &
    .${P}-dashboard-card-header__content
    .openui-text-block--size-xs.openui-text-block--title-text
    .openui-text-block__secondary,
  &
    .${P}-dashboard-card-header__content
    .openui-text-block--size-xs.openui-text-block--number-title-text
    .openui-text-block__secondary {
    color: var(--openui-text-neutral-secondary);
    ${typography("body", "default")}
  }

  & .${P}-dashboard-card-header__controls {
    display: flex;
    flex-shrink: 0;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: var(--openui-space-2xs);
  }
`;
