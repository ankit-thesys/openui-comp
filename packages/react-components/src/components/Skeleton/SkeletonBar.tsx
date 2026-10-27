import clsx from "clsx";
import { css } from "goober";
import { barStyles } from "./skeleton.styles";
const componentClass = "openui-skeleton-bar-root";
interface SkeletonBarProps {
  height: string;
  width: string;
  borderRadius?: string;
}

export function SkeletonBar({ height, width, borderRadius }: SkeletonBarProps) {
  return (
    <div
      className={clsx(componentClass, "openui-skeleton-bar")}
      style={{
        height,
        width,
        ...(borderRadius ? { borderRadius } : {}),
      }}
    />
  );
}

const stylesheetScope = css`
  :where(&:root) {
    .openui-skeleton-bar-root {
      ${barStyles}
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}
