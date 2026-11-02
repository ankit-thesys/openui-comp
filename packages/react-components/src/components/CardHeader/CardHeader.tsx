"use client";

import clsx from "clsx";
import { cloneElement, CSSProperties, forwardRef, ReactElement, ReactNode } from "react";
import { styleRules } from "../../styles/css";
import { ButtonProps } from "../Button";
import { IconButtonProps } from "../IconButton";
import { cardHeaderStyles, names } from "./cardHeader.styles";

export interface CardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  icon?: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?:
    ReactElement<ButtonProps | IconButtonProps> | ReactElement<ButtonProps | IconButtonProps>[];
  className?: string;
  styles?: CSSProperties;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>((props, ref) => {
  const { icon, title, subtitle, actions, className, styles: inlineStyles, ...rest } = props;
  const styles = cardHeaderStyles;
  const rootClass = clsx(styles.root, names.root, className);
  const topClass = clsx(styles.top, names.top);
  const topLeftClass = clsx(styles.topLeft, names.topLeft);
  const topRightClass = clsx(styles.topRight, names.topRight);
  return (
    <>
      <div ref={ref} className={rootClass} style={inlineStyles} {...rest}>
        <div className={topClass}>
          <div className={topLeftClass}>
            {icon && (
              <>
                <span className={clsx(styles.topLeftIcon, names.topLeftIcon)}>{icon}</span>
                {styleRules(clsx(styles.topLeftIcon, names.topLeftIcon))}
              </>
            )}
            {title}
          </div>
          {styleRules(topLeftClass)}
          <div className={topRightClass}>
            {Array.isArray(actions)
              ? actions.map((action, index) => cloneElement(action, { key: index }))
              : actions}
          </div>
          {styleRules(topRightClass)}
        </div>
        {styleRules(topClass)}
        {subtitle && (
          <>
            <div className={clsx(styles.bottom, names.bottom)}>{subtitle}</div>
            {styleRules(clsx(styles.bottom, names.bottom))}
          </>
        )}
      </div>
      {styleRules(rootClass)}
    </>
  );
});

CardHeader.displayName = "CardHeader";
