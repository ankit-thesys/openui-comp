"use client";

import clsx from "clsx";
import { C1_CLASS_PREFIX } from "../../../shared/classPrefix";
import { IconWrapper } from "../Icon/IconWrapper";
import { type IconTagProps } from "./schema";

export function IconTagView(props: IconTagProps) {
  const icon = props.icon;
  const iconName = icon?.props?.name ?? (typeof icon === "string" ? icon : "");
  const iconCategory = icon?.props?.category;

  if (!iconName) return null;

  return (
    <div
      className={clsx(
        `${C1_CLASS_PREFIX}-icon-tag`,
        `${C1_CLASS_PREFIX}-icon-tag--${props.size}`,
        `${C1_CLASS_PREFIX}-icon-tag--${props.variant}`,
      )}
    >
      <IconWrapper name={iconName} category={iconCategory} />
    </div>
  );
}
