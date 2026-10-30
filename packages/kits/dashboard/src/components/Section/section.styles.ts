import { css } from "goober";
import { C1_CLASS_PREFIX as P } from "../../shared/classPrefix";

export const sectionClass = css`
  display: flex;
  flex-direction: column;
  gap: var(--openui-space-xl);
  width: 100%;

  & .${P}-section__filter, & .${P}-section__rows {
    width: 100%;
    max-width: 1440px;
    margin: 0 auto;
  }

  & .${P}-section__filter {
    margin-bottom: var(--openui-space-s);
  }

  & .${P}-section__rows {
    display: flex;
    flex-direction: column;
    gap: var(--openui-space-xl);
  }
`;
