import { css } from "goober";
import { C1_CLASS_PREFIX as P } from "../../../shared/classPrefix";

const BLOCK = `${P}-small-card-block`;

/** The KPI grid / carousel that holds the overview cards. */
export const smallCardBlockClass = css`
  /*
   * Custom-property values were plain text to Sass, so this had to be
   * interpolated there; here it is just the token.
   */
  --${P}-small-card-gap: var(--openui-space-m);
  width: 100%;
  container-type: inline-size;

  &[data-layout="carousel"] {
    padding: 0;
  }

  & .${BLOCK}__grid {
    display: flex;
    flex-direction: column;
    gap: var(--${P}-small-card-gap);
    width: 100%;
  }

  & .${BLOCK}__row {
    display: grid;
    gap: var(--${P}-small-card-gap);
    width: 100%;
    align-items: stretch;
  }

  & .${BLOCK}__row--1 {
    grid-template-columns: 1fr;
  }
  & .${BLOCK}__row--2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  & .${BLOCK}__row--3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  & .${BLOCK}__item {
    display: grid;
    width: 100%;
    min-width: 0;
  }

  /* ── Carousel ── */
  & .${BLOCK}__carousel {
    width: 100%;
    overflow-x: auto;
    overflow-y: visible;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  & .${BLOCK}__carousel::-webkit-scrollbar {
    display: none;
  }

  & .${BLOCK}__carousel--mask-left.${BLOCK}__carousel--mask-right {
    mask-image: linear-gradient(to right, #0000, #000 48px, #000 calc(100% - 48px), #0000);
    -webkit-mask-image: linear-gradient(to right, #0000, #000 48px, #000 calc(100% - 48px), #0000);
  }
  & .${BLOCK}__carousel--mask-left:not(.${BLOCK}__carousel--mask-right) {
    mask-image: linear-gradient(to right, #0000, #000 48px, #000);
    -webkit-mask-image: linear-gradient(to right, #0000, #000 48px, #000);
  }
  & .${BLOCK}__carousel--mask-right:not(.${BLOCK}__carousel--mask-left) {
    mask-image: linear-gradient(to left, #0000, #000 48px, #000);
    -webkit-mask-image: linear-gradient(to left, #0000, #000 48px, #000);
  }

  & .${BLOCK}__carousel-track {
    display: flex;
    gap: var(--${P}-small-card-gap);
    padding: var(--openui-space-2xs) 0;
    width: max-content;
  }

  & .${BLOCK}__carousel-item {
    display: grid;
    flex-shrink: 0;
    width: 17.5rem;
  }

  /* ── Responsive ── */
  @container (max-width: 48rem) {
    & .${BLOCK}__grid--responsive {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    & .${BLOCK}__grid--responsive .${BLOCK}__row {
      display: contents;
    }
    & .${BLOCK}__grid--odd-count .${BLOCK}__row:last-child > .${BLOCK}__item:last-child {
      grid-column: 1 / -1;
    }
  }
  @container (max-width: 30rem) {
    & .${BLOCK}__grid--responsive {
      grid-template-columns: 1fr;
    }
    & .${BLOCK}__carousel--responsive .${BLOCK}__carousel-item {
      width: 15rem;
    }
  }

  &.${BLOCK}--overview-card.${BLOCK}--carousel .${BLOCK}__carousel-item {
    width: 15rem;
  }
  @container (max-width: 30rem) {
    &.${BLOCK}--overview-card.${BLOCK}--carousel .${BLOCK}__carousel-item {
      width: 12.5rem;
    }
  }
`;

/** One KPI card inside the block. */
export const overviewCardClass = css`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 158px;
  padding: var(--openui-space-s-m);
  border: 1px solid var(--openui-border-default);
  border-radius: var(--openui-radius-2xl);
  background-color: var(--openui-sunk-light);
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;

  &.${P}-overview-card--clickable {
    background-color: var(--openui-foreground);
    border-color: var(--openui-border-interactive);
    box-shadow: var(--openui-shadow-m);
    cursor: pointer;
  }
  &.${P}-overview-card--clickable:hover {
    box-shadow: none;
    transform: scale(0.995);
  }
  &.${P}-overview-card--clickable:focus-visible {
    outline: 2px solid var(--openui-border-accent);
    outline-offset: 2px;
  }

  & .${P}-overview-card__vertical {
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: space-between;
    gap: var(--openui-space-l);
    min-width: 0;
    min-height: 0;
  }

  & .${P}-overview-card__top-row {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--openui-space-s);
    width: 100%;
    min-width: 0;
  }

  & .${P}-overview-card__slot {
    width: 100%;
    min-width: 0;
  }

  & .${P}-overview-card__slot--top {
    flex: 1;
    min-width: 0;
    width: auto;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--openui-space-s);
    min-height: var(--openui-space-xl);
  }

  & .${P}-overview-card__slot--bottom {
    display: flex;
    flex-direction: column;
    gap: var(--openui-space-2xs);
  }

  & .${P}-overview-card__icon-badge {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  & .${P}-overview-card__icon-badge-text {
    color: var(--openui-text-neutral-primary);
    font: var(--openui-text-body-sm-heavy);
  }
`;

/** The icon/image + text pairing used inside an overview card. */
export const imageTextClass = css`
  display: flex;
  gap: var(--openui-space-m);

  & .${P}-image-text__image-container {
    position: relative;
    width: 40px;
    height: 40px;
    border-radius: var(--openui-radius-m);
    overflow: hidden;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--openui-sunk);
  }

  & .${P}-image-text__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &.${P}-image-text--vertical {
    flex-direction: column;
    align-items: flex-start;
  }

  &.${P}-image-text--horizontal {
    flex-direction: row;
    align-items: center;
  }

  &.${P}-image-text--horizontal .${P}-dashboard-text-block__primary {
    font-size: var(--openui-font-size-sm);
    font-weight: var(--openui-font-weight-heavy);
  }

  &.${P}-image-text--horizontal .${P}-image-text__content {
    padding-top: var(--openui-space-3xs);
  }

  & .${P}-image-text__content {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
`;
