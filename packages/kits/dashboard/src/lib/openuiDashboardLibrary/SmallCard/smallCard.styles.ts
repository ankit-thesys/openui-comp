import { css } from "goober";
import { C1_CLASS_PREFIX as P } from "../../../shared/classPrefix";
import { typography } from "../../../shared/typography";

/** The title / metric / trend body of a SmallCard. */
export const smallCardClass = css`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--openui-space-xl);
  min-width: 0;

  & .${P}-small-card__slot {
    min-width: 0;
  }

  & .${P}-small-card__slot--top {
    display: flex;
    align-items: flex-start;
  }

  & .${P}-small-card__slot--bottom {
    display: flex;
    flex-direction: column;
    gap: var(--openui-space-2xs);
  }

  &.${P}-small-card--title-metric {
    gap: var(--openui-space-xl);
  }

  & .${P}-small-card__title {
    color: var(--openui-text-neutral-primary);
    ${typography("body", "default")}
  }

  & .${P}-small-card__metric-row {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: var(--openui-space-xs);
    min-width: 0;
  }

  & .${P}-small-card__metric {
    color: var(--openui-text-neutral-primary);
    ${typography("number", "heading-medium")}
  }

  & .${P}-small-card__trend {
    color: var(--openui-text-neutral-secondary);
    ${typography("number", "small")}
  }

  & .${P}-small-card__trend--success {
    color: var(--openui-text-success-primary);
  }

  & .${P}-small-card__trend--danger {
    color: var(--openui-text-danger-primary);
  }
`;

/** The compact left/right record form of a SmallCard. */
export const smallCardSnippetClass = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--openui-space-m);
  width: 100%;
  min-width: 0;
  padding: 0;
  box-sizing: border-box;
  overflow: hidden;

  & .${P}-small-card-snippet__lhs {
    display: flex;
    align-items: center;
    flex: 1;
    gap: var(--openui-space-m);
    min-width: 0;
  }

  & .${P}-small-card-snippet__image {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    border-radius: var(--openui-radius-m);
    object-fit: cover;
  }

  & .${P}-small-card-snippet__lhs-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-width: 0;
  }

  & .${P}-small-card-snippet__rhs {
    display: flex;
    flex-shrink: 1;
    align-items: center;
    justify-content: flex-end;
    min-width: 0;
    margin-left: var(--openui-space-m);
    color: var(--openui-text-neutral-primary);
  }

  & .${P}-small-card-snippet__rhs-content {
    display: flex;
    justify-content: flex-end;
    min-width: 0;
    max-width: 100%;
  }

  & .${P}-small-card-snippet__lhs > *,
  & .${P}-small-card-snippet__rhs-content, & .${P}-small-card-snippet__rhs-content > *,
  &
    .${P}-small-card-snippet__lhs-content,
    &
    .${P}-small-card-snippet__rhs
    .${P}-dashboard-text-block {
    min-width: 0;
  }

  & .${P}-small-card-snippet__lhs-content, & .${P}-small-card-snippet__rhs-content {
    width: 100%;
    overflow: hidden;
  }

  & .${P}-small-card-snippet__rhs .${P}-dashboard-text-block {
    align-items: flex-end;
    width: auto;
    max-width: 100%;
    overflow: hidden;
    text-align: right;
  }

  &
    .${P}-small-card-snippet__lhs
    .${P}-dashboard-text-block__primary,
    &
    .${P}-small-card-snippet__lhs
    .${P}-dashboard-text-block__secondary,
    &
    .${P}-small-card-snippet__rhs
    .${P}-dashboard-text-block__primary,
    &
    .${P}-small-card-snippet__rhs
    .${P}-dashboard-text-block__secondary {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;
