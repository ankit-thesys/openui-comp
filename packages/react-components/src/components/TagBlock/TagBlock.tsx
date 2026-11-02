"use client";

import clsx from "clsx";
import { CSSProperties, forwardRef, ReactElement } from "react";
import { styleRules } from "../../styles/css";
import { names as baseNames, baseStyles } from "../SharedBase/base.styles";
import { Tag } from "../Tag";
import { names, tagBlockStyles } from "./tagBlock.styles";

export interface TagBlockProps {
  children: ReactElement<typeof Tag> | ReactElement<typeof Tag>[];
  styles?: CSSProperties;
  className?: string;
}

export const TagBlock = forwardRef<HTMLDivElement, TagBlockProps>((props, ref) => {
  const css = tagBlockStyles;
  const base = baseStyles;
  const rootClass = clsx(css.root, names.root, base.root, baseNames.root, props.className);
  return (
    <>
      <div ref={ref} className={rootClass} style={props.styles}>
        {props.children}
      </div>
      {styleRules(rootClass)}
    </>
  );
});

TagBlock.displayName = "TagBlock";
