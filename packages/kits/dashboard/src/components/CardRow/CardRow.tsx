import clsx from "clsx";
import type { ReactNode } from "react";
import { C1_CLASS_PREFIX } from "../../shared/classPrefix";
import { cardRowClass } from "./cardRow.styles";

export type CardRowType = "small" | "medium" | "medium-large" | "large";

export interface CardRowProps {
  align?: "start" | "stretch";
  /** Which card sizes the row holds; drives its responsive flex basis. */
  type?: CardRowType;
  /** Number of cards in the row. */
  count: number;
  children?: ReactNode;
}

export function CardRow({ align = "stretch", type, count, children }: CardRowProps) {
  return (
    <div
      className={clsx(
        cardRowClass,
        `${C1_CLASS_PREFIX}-card-row`,
        `${C1_CLASS_PREFIX}-card-row--align-${align}`,
        type && `${C1_CLASS_PREFIX}-card-row--type-${type}`,
        `${C1_CLASS_PREFIX}-card-row--count-${count}`,
      )}
    >
      {children}
    </div>
  );
}
