import { css } from "goober";
export const galleryClass = css`
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: hidden;
  position: relative;
  border-radius: var(--openui-radius-m, 8px);
`;
export const gridClass = css`
  display: grid;
  width: 100%;
  max-height: 376px;
  grid-gap: var(--openui-space-s, 8px);
`;
export const layoutClasses = {
  "openui-gallery--single": css`
    & .openui-gallery__grid {
      grid-template-columns: 1fr;
    }
  `,
  "openui-gallery--double": css`
    & .openui-gallery__grid {
      grid-template-columns: repeat(2, 1fr);
    }
  `,
  "openui-gallery--triple": css`
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
  `,
  "openui-gallery--quad": css`
    & .openui-gallery__grid {
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: repeat(2, 1fr);
      grid-template-areas: "img1 img1 img2 img2 " "img1 img1 img3 img4";
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
  `,
  "openui-gallery--default": css`
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
        grid-template-areas: "img1 img1 img1  img2 img2 img2 " "img3 img3 img4  img4 img5 img5";
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
  `,
};
export const imageClass = css`
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
`;
export const mainImageClass = css`
  img {
    height: 100%;
  }
`;
export const showAllClass = css`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  bottom: 5px;
  right: 5px;
`;
