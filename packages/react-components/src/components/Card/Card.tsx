"use client";

import clsx from "clsx";
import React from "react";
import { styleRules } from "../../styles/css";
import { cardStyles, names } from "./card.styles";

type CardVariant = "clear" | "card" | "sunk";
type CardWidth = "standard" | "full";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  width?: CardWidth;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>((props, ref) => {
  const { className, children, variant = "card", width = "standard", ...rest } = props;

  const styles = cardStyles;
  const rootClass = clsx(
    styles.root,
    names.root,
    className,
    styles.variant[variant],
    names.variant[variant],
    styles.width[width],
    names.width[width],
  );
  return (
    <>
      <div ref={ref} className={rootClass} {...rest}>
        {children}
      </div>
      {styleRules(rootClass)}
    </>
  );
});

Card.displayName = "Card";
