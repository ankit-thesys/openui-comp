import clsx from "clsx";
import { css } from "goober";
import { barStyles } from "./skeleton.styles";
const componentClass = css(barStyles);
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
