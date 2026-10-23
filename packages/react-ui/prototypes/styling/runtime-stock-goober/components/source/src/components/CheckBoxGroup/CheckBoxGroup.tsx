import {OwnedElement as __OwnedElement} from "../../../../runtime/adapter";
import {styles as __styles0} from "../../../../runtime/styles/CheckBoxGroup";
import clsx from "clsx";
import React from "react";
import { CheckBoxItemProps } from "../CheckBoxItem";
type CheckBoxGroupVariant = "clear" | "card" | "sunk";
interface CheckBoxGroupProps {
    children: React.ReactElement<CheckBoxItemProps> | React.ReactElement<CheckBoxItemProps>[];
    className?: string;
    style?: React.CSSProperties;
    variant?: CheckBoxGroupVariant;
}
const variantMap: Record<CheckBoxGroupVariant, string> = {
    clear: "openui-checkbox-group-clear",
    card: "openui-checkbox-group-card",
    sunk: "openui-checkbox-group-sunk",
};
const CheckBoxGroup = React.forwardRef<HTMLDivElement, CheckBoxGroupProps>((props, ref) => {
    const { children, className, style, variant = "clear" } = props;
    return (<__OwnedElement $element="div" $styles={[__styles0]} ref={ref} className={clsx("openui-checkbox-group", variantMap[variant], className)} style={style}>
      {children}
    </__OwnedElement>);
});
CheckBoxGroup.displayName = "CheckBoxGroup";
export { CheckBoxGroup, type CheckBoxGroupProps };
