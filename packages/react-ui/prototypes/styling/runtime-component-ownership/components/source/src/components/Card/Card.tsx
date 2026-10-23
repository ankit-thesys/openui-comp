import {OwnedElement as __OwnedElement} from "../../../../runtime/adapter";
import {styles as __styles0} from "../../../../runtime/styles/Card";
import clsx from "clsx";
import React from "react";
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
    return (<__OwnedElement $element="div" $styles={[__styles0]} ref={ref} className={clsx("openui-card", className, variantMap[variant], widthMap[width])} {...rest}>
      {children}
    </__OwnedElement>);
});
Card.displayName = "Card";
