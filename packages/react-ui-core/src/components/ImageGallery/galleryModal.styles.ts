import { css, keyframes } from "goober";
const fadeIn = keyframes`from {opacity:0;}to {opacity:1;}`;
export const modalClass = css`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: ${fadeIn} 0.3s ease;
  backdrop-filter: blur(3px);
  background-color: var(--openui-overlay, oklch(0 0 0 / 0.4));
`;
export const contentClass = css`
  width: calc(100% - 80px);
  height: calc(100% - 80px);
  max-width: 720px;
  max-height: 640px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  border: 1px solid var(--openui-border-default, oklch(0.097 0 0 / 0.06));
  background-color: var(--openui-foreground, oklch(0.994 0 89.876 / 1));
  border-radius: var(--openui-radius-xl, 12px);
  gap: var(--openui-space-xl, 24px);
  padding-top: var(--openui-space-xl, 24px);
  padding-bottom: var(--openui-space-xl, 24px);
  @media (max-width: 768px) {
    width: 100%;
    height: 100%;
    border-radius: 0;
    max-height: none;
    max-width: none;
  }
`;
export const headerClass = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: var(--openui-space-xl, 24px);
  padding-right: var(--openui-space-xl, 24px);
`;
export const headingClass = css`
  font: var(--openui-text-heading-xs, 600 16px/1.25 "Inter", sans-serif);
  letter-spacing: var(--openui-text-heading-xs-letter-spacing, -0.01em);
  color: var(--openui-text-neutral-primary, oklch(0.097 0 0 / 1));
`;
export const mainClass = css`
  flex: 1;
  min-height: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-left: var(--openui-space-xl, 24px);
  padding-right: var(--openui-space-xl, 24px);
  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: var(--openui-radius-s, 6px);
  }
`;
export const carouselContainerClass = css`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`;
export const carouselClass = css`
  display: flex;
  gap: var(--openui-space-s, 8px);
  overflow-x: auto;
  scroll-behavior: smooth;
  scrollbar-width: none;
  padding-left: var(--openui-space-xl, 24px);
  padding-right: var(--openui-space-xl, 24px);
  &::-webkit-scrollbar {
    display: none;
  }
`;
export const buttonContainerClass = css`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--openui-foreground, oklch(0.994 0 89.876 / 1));
  border-radius: var(--openui-radius-xs, 4px);
  overflow: hidden;
`;
export const leftButtonClass = css`
  left: 24px;
`;
export const rightButtonClass = css`
  right: 24px;
`;
export const thumbnailClass = css`
  flex: 1;
  height: 116px;
  min-width: 174px;
  cursor: pointer;
  opacity: 0.6;
  border-radius: var(--openui-radius-s, 6px);
  border: 1px solid transparent;
  overflow: hidden;
  transition: opacity 0.2s ease;
  box-sizing: border-box;
  &:hover {
    opacity: 0.8;
  }
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;
export const activeThumbnailClass = css`
  opacity: 1;
  border-color: var(--openui-border-interactive-selected, oklch(0.097 0 0 / 1));
  border-radius: var(--openui-radius-s, 6px);
`;
