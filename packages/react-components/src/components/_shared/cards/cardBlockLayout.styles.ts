import { css } from "goober";

export const scrollbarClass = "openui-card-layout-scrollbar";

export const layoutClasses = {
  small: "openui-card-layout-layout-small",
  medium: "openui-card-layout-layout-medium",
};

const stylesheetScope = css`
  :where(&:root) {
    .openui-card-layout-scrollbar {
      &::-webkit-scrollbar {
        display: none;
      }
    }
    .openui-card-layout-layout-small {
      --openui-small-card-gap: var(--openui-space-m, 12px);
      width: 100%;
      container-type: inline-size;
      &[data-layout="carousel"] {
        padding: 0;
      }
      & :where(.openui-small-card-block__grid) {
        display: flex;
        flex-direction: column;
        gap: var(--openui-small-card-gap);
        width: 100%;
      }
      & :where(.openui-small-card-block__row) {
        display: grid;
        gap: var(--openui-small-card-gap);
        width: 100%;
        align-items: stretch;
      }
      & :where(.openui-small-card-block__row--1) {
        grid-template-columns: 1fr;
      }
      & :where(.openui-small-card-block__row--2) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      & :where(.openui-small-card-block__row--3) {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
      & :where(.openui-small-card-block__item) {
        display: grid;
        width: 100%;
        min-width: 0;
      }
      & :where(.openui-small-card-block__carousel) {
        width: 100%;
        overflow-x: auto;
        overflow-y: visible;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
      &
        .openui-small-card-block__carousel--mask-left:where(
          .openui-small-card-block__carousel--mask-right
        ) {
        mask-image: linear-gradient(
          to right,
          #0000,
          #000 var(--openui-space-3xl, 48px),
          #000 calc(100% - var(--openui-space-3xl, 48px)),
          #0000
        );
        -webkit-mask-image: linear-gradient(
          to right,
          #0000,
          #000 var(--openui-space-3xl, 48px),
          #000 calc(100% - var(--openui-space-3xl, 48px)),
          #0000
        );
      }
      &
        :not(.openui-small-card-block__carousel--mask-right):where(
          .openui-small-card-block__carousel--mask-left
        ) {
        mask-image: linear-gradient(to right, #0000, #000 var(--openui-space-3xl, 48px), #000);
        -webkit-mask-image: linear-gradient(
          to right,
          #0000,
          #000 var(--openui-space-3xl, 48px),
          #000
        );
      }
      &
        :not(.openui-small-card-block__carousel--mask-left):where(
          .openui-small-card-block__carousel--mask-right
        ) {
        mask-image: linear-gradient(to left, #0000, #000 var(--openui-space-3xl, 48px), #000);
        -webkit-mask-image: linear-gradient(
          to left,
          #0000,
          #000 var(--openui-space-3xl, 48px),
          #000
        );
      }
      & :where(.openui-small-card-block__carousel-track) {
        display: flex;
        gap: var(--openui-small-card-gap);
        padding: var(--openui-space-2xs, 4px) 0;
        width: max-content;
      }
      & :where(.openui-small-card-block__carousel-item) {
        display: grid;
        flex-shrink: 0;
        width: 17.5rem;
      }
      /* Base sizing precedes grouped container-query overrides. */
      &.openui-small-card-block--overview-card.openui-small-card-block--carousel
        :where(.openui-small-card-block__carousel-item) {
        width: 15rem;
      }
      @container (max-width: 48rem) {
        & :where(.openui-small-card-block__grid--responsive) {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: var(--openui-small-card-gap);
        }
        & .openui-small-card-block__grid--responsive :where(.openui-small-card-block__row) {
          display: contents;
        }
      }
      @container (max-width: 30rem) {
        & :where(.openui-small-card-block__grid--responsive) {
          grid-template-columns: 1fr;
        }
      }
      @container (max-width: 48rem) {
        &
          .openui-small-card-block__grid--odd-count
          .openui-small-card-block__row:last-child
          > :last-child:where(.openui-small-card-block__item) {
          grid-column: 1 / -1;
        }
      }
      @container (max-width: 30rem) {
        &
          .openui-small-card-block__carousel--responsive
          :where(.openui-small-card-block__carousel-item) {
          width: 15rem;
        }
      }
      @container (max-width: 30rem) {
        &.openui-small-card-block--overview-card.openui-small-card-block--carousel
          :where(.openui-small-card-block__carousel-item) {
          width: 12.5rem;
        }
      }
    }
    .openui-card-layout-layout-medium {
      --openui-medium-card-gap: var(--openui-space-m, 12px);
      width: 100%;
      container-type: inline-size;
      &[data-layout="carousel"] {
        padding: 0;
      }
      & :where(.openui-medium-card-block__grid) {
        display: flex;
        flex-direction: column;
        gap: var(--openui-medium-card-gap);
        width: 100%;
      }
      & :where(.openui-medium-card-block__row) {
        display: grid;
        gap: var(--openui-medium-card-gap);
        width: 100%;
        align-items: stretch;
      }
      & :where(.openui-medium-card-block__row--1) {
        grid-template-columns: 1fr;
      }
      & :where(.openui-medium-card-block__row--2) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      & :where(.openui-medium-card-block__row--3) {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
      & :where(.openui-medium-card-block__item) {
        width: 100%;
        min-width: 0;
      }
      & :where(.openui-medium-card-block__carousel) {
        width: 100%;
        overflow-x: auto;
        overflow-y: visible;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
      &
        .openui-medium-card-block__carousel--mask-left:where(
          .openui-medium-card-block__carousel--mask-right
        ) {
        mask-image: linear-gradient(
          to right,
          #0000,
          #000 var(--openui-space-3xl, 48px),
          #000 calc(100% - var(--openui-space-3xl, 48px)),
          #0000
        );
        -webkit-mask-image: linear-gradient(
          to right,
          #0000,
          #000 var(--openui-space-3xl, 48px),
          #000 calc(100% - var(--openui-space-3xl, 48px)),
          #0000
        );
      }
      &
        :not(.openui-medium-card-block__carousel--mask-right):where(
          .openui-medium-card-block__carousel--mask-left
        ) {
        mask-image: linear-gradient(to right, #0000, #000 var(--openui-space-3xl, 48px), #000);
        -webkit-mask-image: linear-gradient(
          to right,
          #0000,
          #000 var(--openui-space-3xl, 48px),
          #000
        );
      }
      &
        :not(.openui-medium-card-block__carousel--mask-left):where(
          .openui-medium-card-block__carousel--mask-right
        ) {
        mask-image: linear-gradient(to left, #0000, #000 var(--openui-space-3xl, 48px), #000);
        -webkit-mask-image: linear-gradient(
          to left,
          #0000,
          #000 var(--openui-space-3xl, 48px),
          #000
        );
      }
      & :where(.openui-medium-card-block__carousel-track) {
        display: flex;
        gap: var(--openui-medium-card-gap);
        padding: var(--openui-space-2xs, 4px) 0;
        width: max-content;
      }
      & :where(.openui-medium-card-block__carousel-item) {
        flex-shrink: 0;
        width: 20rem;
      }
      @container (max-width: 48rem) {
        & :where(.openui-medium-card-block__grid--responsive) {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        & .openui-medium-card-block__grid--responsive :where(.openui-medium-card-block__row) {
          display: contents;
        }
      }
      @container (max-width: 30rem) {
        & :where(.openui-medium-card-block__grid--responsive) {
          grid-template-columns: 1fr;
        }
      }
      @container (max-width: 48rem) {
        &
          .openui-medium-card-block__grid--odd-count
          .openui-medium-card-block__row:last-child
          > :last-child:where(.openui-medium-card-block__item) {
          grid-column: 1 / -1;
        }
      }
      @container (max-width: 30rem) {
        &
          .openui-medium-card-block__carousel--responsive
          :where(.openui-medium-card-block__carousel-item) {
          width: 17.5rem;
        }
      }
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}
