import { css } from "goober";
import { C1_CLASS_PREFIX as P } from "../../shared/classPrefix";
import { MODAL } from "../../shared/zIndex";

const MODAL_MAX_WIDTH = "1120px";
const COLLAPSE_FADE_HEIGHT = "72px";

/**
 * The card frame every Small/Medium/Large card renders into, plus the expand
 * modal it opens (rendered inline, not through a portal, so it stays inside
 * this block).
 */
export const shellCardClass = css`
  position: relative;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  min-height: 0;

  &.${P}-shell-card--small {
    min-width: 220px;
  }

  &.${P}-shell-card--small.openui-card-card {
    padding: var(--openui-space-m-l);
    border-color: var(--openui-border-default);
    border-radius: var(--openui-radius-3xl);
    background-color: var(--openui-foreground);
  }

  &.${P}-shell-card--medium {
    --${P}-shell-card-collapsed-preview-height: 240px;

    min-width: 360px;
  }

  &.${P}-shell-card--medium.openui-card-card {
    gap: var(--openui-space-l);
    padding: var(--openui-space-l);
    border-color: var(--openui-border-default);
    border-radius: var(--openui-radius-4xl);
    background-color: var(--openui-foreground);
  }

  &.${P}-shell-card--large {
    --${P}-shell-card-collapsed-preview-height: 280px;

    min-width: min(832px, 100%);
  }

  &.${P}-shell-card--large.openui-card-card {
    gap: var(--openui-space-l);
    padding: var(--openui-space-l);
    border-color: var(--openui-border-default);
    border-radius: var(--openui-radius-3xl);
    background-color: var(--openui-foreground);
  }

  &.${P}-shell-card--small-snippet.openui-card-card {
    align-items: stretch;
    justify-content: center;
  }

  & .${P}-shell-card__content-wrap {
    position: relative;
    flex: 1 1 auto;
    width: 100%;
    min-width: 0;
    min-height: 0;
  }

  & .${P}-shell-card__content {
    display: flex;
    flex-direction: column;
    gap: var(--openui-space-l);
    width: 100%;
    min-width: 0;
  }

  /*
   * flex: 1 1 0 here resolved to a ZERO-height preview: the card is a flex
   * column with no definite height, so there is no free space for a zero-basis
   * item to grow into. The body rendered empty and, because the overflow probe
   * requires wrapElement.clientHeight > 0, the Expand control — and with it the
   * whole modal below — could never appear. 0 1 auto lets the wrap take its
   * content height, which max-height then clips to the preview.
   */
  &.${P}-shell-card--collapsed > .${P}-shell-card__content-wrap {
    flex: 0 1 auto;
    max-height: var(--${P}-shell-card-collapsed-preview-height);
    overflow: hidden;
  }

  & .${P}-shell-card__collapse-fade {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    height: ${COLLAPSE_FADE_HEIGHT};
    pointer-events: none;
    background: linear-gradient(180deg, transparent, var(--openui-foreground) 96px);
  }

  & .${P}-shell-card__collapse-control {
    display: flex;
    justify-content: center;
    width: 100%;
  }

  & .${P}-shell-card-modal {
    position: fixed;
    inset: 0;
    z-index: ${MODAL};
  }

  & .${P}-shell-card-modal__overlay {
    all: unset;
    position: fixed;
    inset: 0;
    cursor: default;
    background: var(--openui-overlay);
  }

  & .${P}-shell-card-modal__frame {
    position: fixed;
    top: 50%;
    left: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--openui-space-s);
    width: min(${MODAL_MAX_WIDTH}, calc(100vw - 48px));
    max-height: calc(100vh - 48px);
    transform: translate(-50%, -50%);
  }

  & .${P}-shell-card-modal__minimize {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--openui-radius-m);
    background: var(--openui-foreground);
    box-shadow: var(--openui-shadow-s);
  }

  & .${P}-shell-card-modal__content {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-height: calc(100vh - 96px);
    overflow: hidden;
    border: 1px solid var(--openui-border-default);
    border-radius: var(--openui-radius-4xl);
    background: var(--openui-foreground);
    box-shadow: var(--openui-shadow-xl);
  }

  & .${P}-shell-card-modal__body {
    flex: 1;
    min-height: 0;
    padding: var(--openui-space-l);
    overflow-y: auto;
  }

  @media (min-width: 1080px) and (max-width: 1279px) {
    &.${P}-shell-card--medium {
      min-width: 320px;
    }

    &.${P}-shell-card--large {
      min-width: 720px;
    }
  }

  @media (max-width: 1079px) {
    &.${P}-shell-card--large {
      min-width: 100%;
    }
  }

  @media (max-width: 768px) {
    &.${P}-shell-card--large,
    &.${P}-shell-card--medium,
    &.${P}-shell-card--small {
      min-width: 100%;
    }
  }
`;
