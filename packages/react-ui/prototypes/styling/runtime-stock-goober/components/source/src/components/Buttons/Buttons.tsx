import {OwnedElement as __OwnedElement} from "../../../../runtime/adapter";
import {styles as __styles0} from "../../../../runtime/styles/Buttons";
import clsx from "clsx";
import { CSSProperties, forwardRef, HTMLAttributes, ReactElement } from "react";
import { ButtonProps } from "../Button";
import { IconButtonProps } from "../IconButton";
type ButtonsVariant = "vertical" | "horizontal";
export interface ButtonsProps extends HTMLAttributes<HTMLDivElement> {
    variant?: ButtonsVariant;
    children: ReactElement<ButtonProps | IconButtonProps> | ReactElement<ButtonProps | IconButtonProps>[];
    className?: string;
    style?: CSSProperties;
}
const variantMap: Record<ButtonsVariant, string> = {
    vertical: "openui-buttons-vertical",
    horizontal: "openui-buttons-horizontal",
};
export const Buttons = forwardRef<HTMLDivElement, ButtonsProps>((props, ref) => {
    const { className, style, variant = "horizontal", children, ...rest } = props;
    return (<__OwnedElement $element="div" $styles={[__styles0]} ref={ref} className={clsx("openui-buttons", variantMap[variant], className)} style={style} {...rest}>
      {children}
    </__OwnedElement>);
});
Buttons.displayName = "Buttons";
