import { css } from "goober";
import { C1_CLASS_PREFIX as P } from "../../shared/classPrefix";

const GAP = `var(--${P}-card-row-gap)`;

export const cardRowClass = css`
  --${P}-card-row-gap: var(--openui-space-m-l);

  display: flex;
  flex-wrap: wrap;
  gap: ${GAP};
  width: 100%;

  &.${P}-card-row--align-start {
    align-items: flex-start;
  }

  &.${P}-card-row--align-stretch {
    align-items: stretch;
  }

  &.${P}-card-row--type-small,
  &.${P}-card-row--type-medium,
  &.${P}-card-row--type-medium-large,
  &.${P}-card-row--type-large {
    width: 100%;
  }

  & > .${P}-shell-card {
    flex: 1 1 0;
    max-width: none;
  }

  &.${P}-card-row--type-small > .${P}-shell-card--small {
    flex-basis: 220px;
  }

  &.${P}-card-row--type-medium > .${P}-shell-card--medium {
    flex-basis: 360px;
  }

  &.${P}-card-row--type-large > .${P}-shell-card--large {
    flex-basis: 100%;
  }

  &.${P}-card-row--type-medium-large > .${P}-shell-card--medium {
    flex: 1 1 360px;
  }

  &.${P}-card-row--type-medium-large > .${P}-shell-card--large {
    flex: 2 1 832px;
  }

  @media (min-width: 1080px) and (max-width: 1279px) {
    &.${P}-card-row--type-small.${P}-card-row--count-5 > .${P}-shell-card--small {
      flex-basis: calc((100% - ${GAP} - ${GAP}) / 3);
    }

    &.${P}-card-row--type-small.${P}-card-row--count-4 > .${P}-shell-card--small {
      flex-basis: calc((100% - ${GAP} - ${GAP} - ${GAP}) / 4);
    }

    &.${P}-card-row--type-medium > .${P}-shell-card--medium {
      flex-basis: 320px;
    }

    &.${P}-card-row--type-medium-large > .${P}-shell-card--medium {
      flex: 1 1 320px;
    }

    &.${P}-card-row--type-medium-large > .${P}-shell-card--large {
      flex: 2 1 720px;
    }
  }

  @media (max-width: 1079px) {
    &.${P}-card-row--type-small > .${P}-shell-card--small,
    &.${P}-card-row--type-medium > .${P}-shell-card--medium {
      flex-basis: calc((100% - ${GAP}) / 2);
    }

    &.${P}-card-row--type-large > .${P}-shell-card--large,
    &.${P}-card-row--type-medium-large > .${P}-shell-card--large,
    &.${P}-card-row--type-medium-large > .${P}-shell-card--medium {
      flex-basis: 100%;
    }
  }

  @media (max-width: 768px) {
    & > .${P}-shell-card {
      flex-basis: 100%;
    }
  }
`;
