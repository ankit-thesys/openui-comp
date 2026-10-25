import clsx from "clsx";
import { css } from "goober";
import React from "react";
import { cardStyles } from "./card.styles";

const componentClass = css(cardStyles);

type CardVariant = "clear" | "card" | "sunk";
type CardWidth = "standard" | "full";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  width?: CardWidth;
}

const variantMap: Record<CardVariant, string> = {
  clear: "openui-card-clear",
  card: "openui-card-card",
  sunk: "openui-card-sunk",
};

const widthMap: Record<CardWidth, string> = {
  standard: "openui-card-standard",
  full: "openui-card-full",
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>((props, ref) => {
  const { className, children, variant = "card", width = "standard", ...rest } = props;

  return (
    <div
      ref={ref}
      className={clsx(
        componentClass,
        "openui-card",
        className,
        variantMap[variant],
        widthMap[width],
      )}
      {...rest}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";
