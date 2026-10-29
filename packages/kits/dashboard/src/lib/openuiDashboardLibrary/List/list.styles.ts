import { css } from "goober";
import { typography } from "../../../shared/typography";

export const listClass = css`
  display: flex;
  flex-direction: column;
  gap: var(--openui-space-l);
  /*
   * Pre-unification, dashboard and report shared one list block name, so
   * report's root rule leaked these two declarations onto dashboard lists —
   * the shipped look bakes them in. Keep them now that the blocks are
   * de-collided; remove deliberately if dashboard lists should drop the
   * outer padding.
   */
  width: 100%;
  padding: 16px 0;
`;

/** Applied alongside `listClass` for the `small` size. */
export const listSmallClass = css`
  gap: var(--openui-space-m);

  & .openui-list-block {
    gap: var(--openui-space-m);
  }

  & .openui-list-item-wrapper {
    gap: var(--openui-space-s);
  }

  & .openui-list-item {
    gap: var(--openui-space-s-m);
  }

  & .openui-list-item-indicator {
    width: 36px;
    height: 36px;
  }

  & .openui-list-item-indicator-no-subtitle {
    width: 20px;
    height: 20px;
  }

  & .openui-list-item-indicator-number {
    ${typography("number", "small")}
  }

  & .openui-list-item-title,
  & .openui-list-item-subtitle,
  & .openui-list-item-action-label,
  & .openui-list-item-action-icon {
    ${typography("body", "small")}
  }
`;
