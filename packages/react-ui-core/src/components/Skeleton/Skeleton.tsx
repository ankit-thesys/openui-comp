import clsx from "clsx";
import { css } from "goober";
import { stackStyles } from "./skeleton.styles";
import { SkeletonBar } from "./SkeletonBar";
const componentClass = css(stackStyles);
export function Skeleton({
  count = 1,
  height = "16px",
  width = "100%",
  borderRadius,
  className,
}: {
  count?: number;
  height?: string;
  width?: string;
  borderRadius?: string;
  className?: string;
}) {
  return (
    <div className={clsx(componentClass, "openui-skeleton-stack", className)}>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonBar key={i} height={height} width={width} borderRadius={borderRadius} />
      ))}
    </div>
  );
}
