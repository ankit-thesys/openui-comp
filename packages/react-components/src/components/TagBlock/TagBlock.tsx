"use client";

import clsx from "clsx";
import { CSSProperties, forwardRef, ReactElement } from "react";
import { names as baseNames, baseStyles } from "../../styles/base";
import { useStyles } from "../../styles/useStyles";
import { Tag } from "../Tag";
import { names, tagBlockStyles } from "./tagBlock.styles";

export interface TagBlockProps {
  children: ReactElement<typeof Tag> | ReactElement<typeof Tag>[];
  styles?: CSSProperties;
  className?: string;
}

export const TagBlock = forwardRef<HTMLDivElement, TagBlockProps>((props, ref) => {
  const css = useStyles(tagBlockStyles);
  const base = useStyles(baseStyles);
  return (
    <div
      ref={ref}
      className={clsx(css.root, names.root, base.root, baseNames.root, props.className)}
      style={props.styles}
    >
      {props.children}
    </div>
  );
});

TagBlock.displayName = "TagBlock";
