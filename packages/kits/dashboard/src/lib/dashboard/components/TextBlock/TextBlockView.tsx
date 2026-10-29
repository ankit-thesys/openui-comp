"use client";

import clsx from "clsx";
import { C1_CLASS_PREFIX } from "../../../shared/classPrefix";
import type { TextBlockProps } from "./schema";

export function TextBlockView(props: TextBlockProps) {
  const secondaryStyle =
    props.secondaryMaxLines !== undefined
      ? {
          display: "-webkit-box",
          WebkitLineClamp: props.secondaryMaxLines,
          WebkitBoxOrient: "vertical" as const,
          overflow: "hidden",
          textOverflow: "ellipsis",
        }
      : undefined;

  return (
    <div
      className={clsx(
        `${C1_CLASS_PREFIX}-dashboard-text-block`,
        `${C1_CLASS_PREFIX}-dashboard-text-block--${props.variant}`,
        `${C1_CLASS_PREFIX}-dashboard-text-block--size-${props.size}`,
        `${C1_CLASS_PREFIX}-dashboard-text-block--align-${props.align}`,
        `${C1_CLASS_PREFIX}-dashboard-text-block--type-${props.type}`,
      )}
    >
      <div className={`${C1_CLASS_PREFIX}-dashboard-text-block__primary`}>{props.primary}</div>
      {props.secondary && (
        <div
          className={clsx(
            `${C1_CLASS_PREFIX}-dashboard-text-block__secondary`,
            props.secondaryTone &&
              `${C1_CLASS_PREFIX}-dashboard-text-block__secondary--${props.secondaryTone}`,
          )}
          style={secondaryStyle}
        >
          {props.secondary}
        </div>
      )}
      {props.tertiary && (
        <div className={`${C1_CLASS_PREFIX}-dashboard-text-block__tertiary`}>{props.tertiary}</div>
      )}
    </div>
  );
}
