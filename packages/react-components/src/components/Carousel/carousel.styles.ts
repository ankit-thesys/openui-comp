import { css } from "goober";
export const carouselClass = "openui-carousel-carousel";
export const contentClass = "openui-carousel-content-styled";
export const itemClass = "openui-carousel-item-styled";
export const buttonClass = "openui-carousel-button";

const stylesheetScope = css`
  :where(&:root) {
    .openui-carousel-carousel {
      position: relative;
      display: flex;
      @media (max-width: 400px) {
        & .openui-carousel-item {
          width: 248px;
          flex-shrink: 0;
        }
      }
      &.openui-carousel--sunk .openui-carousel-item {
        background-color: var(--openui-highlight-subtle, oklch(0.097 0 0 / 0.02));
      }
    }
    .openui-carousel-content-styled {
      position: relative;
      display: flex;
      flex-direction: row;
      gap: var(--openui-space-m, 12px);
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      ms-overflow-x: hidden;
      scrollbar-width: none;
      &.openui-carousel-content--mask-left.openui-carousel-content--mask-right {
        mask-image: linear-gradient(
          to right,
          transparent,
          black 40px,
          black calc(100% - 40px),
          transparent
        );
        -webkit-mask-image: linear-gradient(
          to right,
          transparent,
          black 40px,
          black calc(100% - 40px),
          transparent
        );
      }
      &.openui-carousel-content--mask-left:not(.openui-carousel-content--mask-right) {
        mask-image: linear-gradient(to right, transparent, black 40px, black);
        -webkit-mask-image: linear-gradient(to right, transparent, black 40px, black);
      }
      &.openui-carousel-content--mask-right:not(.openui-carousel-content--mask-left) {
        mask-image: linear-gradient(to left, transparent, black 40px, black);
        -webkit-mask-image: linear-gradient(to left, transparent, black 40px, black);
      }
      & .openui-carousel-content-wrapper {
        display: flex;
        gap: var(--openui-space-m, 12px);
      }
      &::-webkit-scrollbar {
        display: none;
      }
      & > * {
        box-sizing: border-box;
        scroll-snap-align: start;
      }
    }
    .openui-carousel-item-styled {
      font: var(--openui-text-body-default, 400 16px/1.5 "Inter", sans-serif);
      letter-spacing: var(--openui-text-body-default-letter-spacing, -0.01em);
      font-variation-settings: var(--openui-font-variation-regular, "wght" 440);
      display: flex;
      flex-direction: column;
      gap: var(--openui-space-m, 12px);
      width: 280px;
      flex-shrink: 0;
      border-radius: var(--openui-radius-2xl, 14px);
      background-color: var(--openui-foreground, oklch(0.994 0 89.876 / 1));
      padding: var(--openui-space-m, 12px);
      border: 1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06));
    }
    .openui-carousel-button {
      position: absolute;
      top: 50%;
      z-index: 10;
      transform: translateY(-50%);
      background: var(--openui-foreground, oklch(0.994 0 89.876 / 1));
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--openui-radius-s, 6px);
      &.openui-carousel-button-left {
        left: -12px;
      }
      &.openui-carousel-button-right {
        right: -12px;
      }
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}
