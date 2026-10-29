"use client";

import clsx from "clsx";
import { C1_CLASS_PREFIX } from "../../shared/classPrefix";

/**
 * Standalone props. `openuiDashboardLibrary/TextBlock/schema.ts` holds the zod
 * schema the model's output is validated against; that wrapper spreads the
 * parsed props into this component, so the compiler rejects the two drifting
 * apart.
 */
export type TextBlockVariant =
  | "title-text"
  | "number-title-text"
  | "text-subtext"
  | "highlight-text-number-subtext"
  | "text"
  | "highlight-text"
  | "number"
  | "highlight-number";

export interface TextBlockProps {
  variant: TextBlockVariant;
  primary: string;
  secondary?: string | undefined;
  tertiary?: string | undefined;
  type: "text" | "number" | "textOnly";
  size: "xs" | "sm" | "md" | "lg";
  align: "left" | "center" | "right";
  secondaryMaxLines?: number | undefined;
  secondaryTone?: "positive" | "negative" | undefined;
}
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
