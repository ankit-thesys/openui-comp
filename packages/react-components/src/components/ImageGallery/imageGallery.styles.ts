import { css } from "goober";
export const galleryClass = "openui-image-gallery-gallery";
export const gridClass = "openui-image-gallery-grid";
export const layoutClasses = {
  "openui-gallery--single": "openui-image-gallery-layout-openui-gallery-single",
  "openui-gallery--double": "openui-image-gallery-layout-openui-gallery-double",
  "openui-gallery--triple": "openui-image-gallery-layout-openui-gallery-triple",
  "openui-gallery--quad": "openui-image-gallery-layout-openui-gallery-quad",
  "openui-gallery--default": "openui-image-gallery-layout-openui-gallery-default",
};
export const imageClass = "openui-image-gallery-image";
export const mainImageClass = "openui-image-gallery-main-image";
export const showAllClass = "openui-image-gallery-show-all";

const stylesheetScope = css`
  :where(&:root) {
    .openui-image-gallery-gallery {
      display: flex;
      flex-direction: column;
      width: 100%;
      overflow: hidden;
      position: relative;
      border-radius: var(--openui-radius-m, 8px);
    }
    .openui-image-gallery-grid {
      display: grid;
      width: 100%;
      max-height: 376px;
      grid-gap: var(--openui-space-s, 8px);
    }
    .openui-image-gallery-layout-openui-gallery-single {
      & .openui-gallery__grid {
        grid-template-columns: 1fr;
      }
    }
    .openui-image-gallery-layout-openui-gallery-double {
      & .openui-gallery__grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    .openui-image-gallery-layout-openui-gallery-triple {
      & .openui-gallery__grid {
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;
        .openui-gallery__image:first-child {
          grid-row: 1 / -1;
        }
      }
      @media (max-width: 768px) {
        & .openui-gallery__grid {
          grid-template-columns: repeat(2, 1fr);
          grid-template-rows: repeat(2, 1fr);
          grid-template-areas: "img1 img1" "img2 img3";
          .openui-gallery__image:nth-child(1) {
            grid-area: img1;
          }
          .openui-gallery__image:nth-child(2) {
            grid-area: img2;
          }
          .openui-gallery__image:nth-child(3) {
            grid-area: img3;
          }
        }
      }
    }
    .openui-image-gallery-layout-openui-gallery-quad {
      & .openui-gallery__grid {
        grid-template-columns: repeat(4, 1fr);
        grid-template-rows: repeat(2, 1fr);
        grid-template-areas: "img1 img1 img2 img2" "img1 img1 img3 img4";
        .openui-gallery__image:nth-child(1) {
          grid-area: img1;
        }
        .openui-gallery__image:nth-child(2) {
          grid-area: img2;
        }
        .openui-gallery__image:nth-child(3) {
          grid-area: img3;
        }
        .openui-gallery__image:nth-child(4) {
          grid-area: img4;
        }
      }
    }
    .openui-image-gallery-layout-openui-gallery-default {
      & .openui-gallery__grid {
        grid-template-columns: 2fr 1fr 1fr;
        grid-template-rows: 1fr 1fr;
        .openui-gallery__image:first-child {
          grid-row: 1 / -1;
        }
      }
      @media (max-width: 768px) {
        & .openui-gallery__grid {
          grid-template-columns: repeat(6, 1fr);
          grid-template-rows: repeat(2, 1fr);
          grid-template-areas: "img1 img1 img1 img2 img2 img2" "img3 img3 img4 img4 img5 img5";
          .openui-gallery__image:nth-child(1) {
            grid-area: img1;
          }
          .openui-gallery__image:nth-child(2) {
            grid-area: img2;
          }
          .openui-gallery__image:nth-child(3) {
            grid-area: img3;
          }
          .openui-gallery__image:nth-child(4) {
            grid-area: img4;
          }
          .openui-gallery__image:nth-child(5) {
            grid-area: img5;
          }
        }
      }
    }
    .openui-image-gallery-image {
      position: relative;
      overflow: hidden;
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
        &:hover {
          transform: scale(1.05);
        }
      }
    }
    .openui-image-gallery-main-image {
      img {
        height: 100%;
      }
    }
    .openui-image-gallery-show-all {
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      bottom: 5px;
      right: 5px;
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}
