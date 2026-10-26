export const loaderStyles = `
  --openui-dot-matrix-loader-grid-size: 5;
  --openui-dot-matrix-loader-size: 36px;
  display: grid;
  grid-template-columns: repeat(var(--openui-dot-matrix-loader-grid-size), 1fr);
  width: var(--openui-dot-matrix-loader-size);
  height: var(--openui-dot-matrix-loader-size);
  & .openui-dot-matrix-loader__dot {
    justify-self: center;
    align-self: center;
    width: 68%;
    aspect-ratio: 1;
    border-radius: 50%;
    background-color: var(--openui-text-neutral-secondary, oklch(0.097 0 0 / 0.6));
    opacity: 0.14;
  }
`;
