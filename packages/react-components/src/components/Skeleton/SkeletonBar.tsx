"use client";

import clsx from "clsx";
import { css } from "goober";
import { useStyles } from "../../styles/useStyles";
import { barStyles } from "./skeleton.styles";
import { names as pulseNames, skeletonPulseStyles } from "./skeletonPulse";
const componentClass = "openui-skeleton-bar-root";
interface SkeletonBarProps {
  height: string;
  width: string;
  borderRadius?: string;
}

export function SkeletonBar({ height, width, borderRadius }: SkeletonBarProps) {
  const pulse = useStyles(skeletonPulseStyles);
  return (
    <div
      className={clsx(componentClass, "openui-skeleton-bar", pulse.root, pulseNames.root)}
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
