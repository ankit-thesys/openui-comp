"use client";

import clsx from "clsx";
import type { CSSProperties } from "react";
import { styleRules } from "../../styles/css";
import { names as pulseNames, skeletonPulseStyles } from "../SkeletonPulse/skeletonPulse.styles";
import { names, skeletonBarStyles } from "./skeleton.styles";
interface SkeletonBarProps {
  height: string;
  width: string;
  borderRadius?: string;
}

export function SkeletonBar({ height, width, borderRadius }: SkeletonBarProps) {
  const styles = skeletonBarStyles;
  const pulse = skeletonPulseStyles;
  const rootClass = clsx(styles.root, names.bar, pulse.root, pulseNames.root);
  return (
    <>
      <div
        className={rootClass}
        style={
          {
            "--_openui-skeleton-bar-height": height,
            "--_openui-skeleton-bar-width": width,
            ...(borderRadius ? { "--_openui-skeleton-bar-border-radius": borderRadius } : {}),
          } as CSSProperties
        }
      />
      {styleRules(rootClass)}
    </>
  );
}
