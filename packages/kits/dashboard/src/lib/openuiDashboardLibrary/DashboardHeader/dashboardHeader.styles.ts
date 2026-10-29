import { css } from "goober";
import { C1_CLASS_PREFIX as P } from "../../../shared/classPrefix";
import { typography } from "../../../shared/typography";

export const dashboardHeaderClass = css`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--openui-space-l);
  width: 100%;
  max-width: 1440px;
  padding: var(--openui-space-l) 0 var(--openui-space-m);
  margin: 0 auto;

  & .${P}-dashboard-header__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    gap: var(--openui-space-m);
  }

  & .${P}-dashboard-header__title {
    ${typography("heading", "large")}
    color: var(--openui-text-neutral-primary);
  }

  & .${P}-dashboard-header__subtitle {
    ${typography("body", "default")}
    max-width: 720px;
    color: var(--openui-text-neutral-secondary);
  }

  & .${P}-dashboard-header__controls {
    display: flex;
    flex-wrap: wrap;
    flex-shrink: 0;
    align-items: center;
    justify-content: flex-end;
    gap: var(--openui-space-m);
  }

  @media (max-width: 768px) {
    flex-direction: column;

    & .${P}-dashboard-header__controls {
      justify-content: flex-start;
      width: 100%;
      padding-top: 0;
    }
  }
`;
