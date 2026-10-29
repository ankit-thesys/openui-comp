"use client";

import clsx from "clsx";
import { CSSProperties, forwardRef, ReactNode } from "react";
import { useStyles } from "../../styles/useStyles";
import { names, tagStyles } from "./tag.styles";

export type TagSize = "sm" | "md" | "lg";
export type TagVariant = "neutral" | "info" | "success" | "warning" | "danger";

export interface TagProps {
  className?: string;
  styles?: CSSProperties;
  icon?: ReactNode;
  text: ReactNode;
  size?: TagSize;
  variant?: TagVariant;
}

export const Tag = forwardRef<HTMLDivElement, TagProps>((props, ref) => {
  const { className, styles, icon, text, size = "md", variant = "neutral", ...rest } = props;
  const css = useStyles(tagStyles);
  return (
    <div
      ref={ref}
      className={clsx(
        css.root,
        names.root,
        css.size[size],
        names.size[size],
        css.variant[variant],
        names.variant[variant],
        className,
      )}
      style={styles}
      {...rest}
    >
      {icon && <span className={clsx(css.icon, names.icon)}>{icon}</span>}
      <span className={clsx(css.text, names.text)}>{text}</span>
    </div>
  );
});

Tag.displayName = "Tag";
