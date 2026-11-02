"use client";

import clsx from "clsx";
import React, { CSSProperties, ReactNode } from "react";
import { styleRules } from "../../styles/css";
import { listItemStyles, names } from "./listItem.styles";

export type ListItemVariant = "icon" | "image" | "number";
export type ListItemSize = "default" | "small";

export interface ListItemProps {
  className?: string;
  style?: CSSProperties;
  title?: ReactNode;
  subtitle?: ReactNode;
  variant?: ListItemVariant;
  size?: ListItemSize;
  icon?: ReactNode;
  image?: { src?: string; alt: string };
  index?: number;
  listHasSubtitle?: boolean;
  actionLabel?: ReactNode;
  actionIcon?: ReactNode;
  onClick?: () => void;
}

const ListItem = React.forwardRef<HTMLDivElement, ListItemProps>((props, ref) => {
  const {
    className,
    style,
    variant = "number",
    size = "default",
    icon,
    image,
    index = 0,
    listHasSubtitle,
    title,
    subtitle,
    actionIcon,
    actionLabel,
    onClick,
    ...rest
  } = props;

  const styles = listItemStyles;
  const hasAction = !!onClick;

  const rootClass = clsx(
    styles.root,
    names.root,
    styles.size[size],
    names.size[size],
    names.variant[variant],
    listHasSubtitle && styles.listHasSubtitle,
    listHasSubtitle && names.listHasSubtitle,
    className,
  );
  const itemClass = clsx(styles.item, names.item);
  const indicatorClass = clsx(styles.indicator, names.indicator);
  const contentWrapperClass = clsx(styles.contentWrapper, names.contentWrapper);
  const contentClass = clsx(styles.content, names.content);
  return (
    <>
      <div
        ref={ref}
        className={rootClass}
        data-action={hasAction || undefined}
        style={style}
        {...rest}
      >
        <div
          className={itemClass}
          data-action={hasAction || undefined}
          data-subtitle={!!subtitle || undefined}
          onClick={onClick}
          role={hasAction ? "button" : undefined}
          tabIndex={hasAction ? 0 : undefined}
        >
          <div className={indicatorClass}>
            {variant === "number" && (
              <>
                <div className={clsx(styles.indicatorNumber, names.indicatorNumber)}>
                  {index + 1}
                </div>
                {styleRules(clsx(styles.indicatorNumber, names.indicatorNumber))}
              </>
            )}
            {variant === "icon" && icon}
            {variant === "image" && image && (image.src || image.alt) && (
              <>
                <div className={clsx(styles.indicatorImage, names.indicatorImage)}>
                  <img
                    className={clsx(styles.image, names.image)}
                    src={image.src}
                    alt={image.alt}
                    width={40}
                    height={40}
                  />
                  {styleRules(clsx(styles.image, names.image))}
                </div>
                {styleRules(clsx(styles.indicatorImage, names.indicatorImage))}
              </>
            )}
          </div>
          {styleRules(indicatorClass)}
          <div className={contentWrapperClass}>
            <div className={contentClass}>
              {title && (
                <>
                  <div className={clsx(styles.title, names.title)}>{title}</div>
                  {styleRules(clsx(styles.title, names.title))}
                </>
              )}
              {subtitle && (
                <>
                  <div className={clsx(styles.subtitle, names.subtitle)}>{subtitle}</div>
                  {styleRules(clsx(styles.subtitle, names.subtitle))}
                </>
              )}
            </div>
            {styleRules(contentClass)}
            {hasAction && (actionIcon || actionLabel) && (
              <>
                <div className={clsx(styles.action, names.action)}>
                  {actionLabel && (
                    <>
                      <div className={clsx(styles.actionLabel, names.actionLabel)}>
                        {actionLabel}
                      </div>
                      {styleRules(clsx(styles.actionLabel, names.actionLabel))}
                    </>
                  )}
                  {actionIcon && (
                    <>
                      <div className={clsx(styles.actionIcon, names.actionIcon)}>{actionIcon}</div>
                      {styleRules(clsx(styles.actionIcon, names.actionIcon))}
                    </>
                  )}
                </div>
                {styleRules(clsx(styles.action, names.action))}
              </>
            )}
          </div>
          {styleRules(contentWrapperClass)}
        </div>
        {styleRules(itemClass)}
      </div>
      {styleRules(rootClass)}
    </>
  );
});

ListItem.displayName = "ListItem";

export { ListItem };
