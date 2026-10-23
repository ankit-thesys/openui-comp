import {OwnedElement as __OwnedElement} from "../../../../runtime/adapter";
import {styles as __styles0} from "../../../../runtime/styles/CardHeader";
import clsx from "clsx";
import { cloneElement, CSSProperties, forwardRef, ReactElement, ReactNode } from "react";
import { ButtonProps } from "../Button";
import { IconButtonProps } from "../IconButton";
export interface CardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
    icon?: ReactNode;
    title?: ReactNode;
    subtitle?: ReactNode;
    actions?: ReactElement<ButtonProps | IconButtonProps> | ReactElement<ButtonProps | IconButtonProps>[];
    className?: string;
    styles?: CSSProperties;
}
export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>((props, ref) => {
    const { icon, title, subtitle, actions, className, styles, ...rest } = props;
    return (<__OwnedElement $element="div" $styles={[__styles0]} ref={ref} className={clsx("openui-header", className)} style={styles} {...rest}>
      <__OwnedElement $element="div" $styles={[__styles0]} className="openui-header-top">
        <__OwnedElement $element="div" $styles={[__styles0]} className="openui-header-top-left">
          {icon && <__OwnedElement $element="span" $styles={[__styles0]} className="openui-header-top-left-icon">{icon}</__OwnedElement>}
          {title}
        </__OwnedElement>
        <__OwnedElement $element="div" $styles={[__styles0]} className="openui-header-top-right">
          {Array.isArray(actions)
            ? actions.map((action, index) => cloneElement(action, { key: index }))
            : actions}
        </__OwnedElement>
      </__OwnedElement>
      {subtitle && <__OwnedElement $element="div" $styles={[__styles0]} className="openui-header-bottom">{subtitle}</__OwnedElement>}
    </__OwnedElement>);
});
CardHeader.displayName = "CardHeader";
