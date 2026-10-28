"use client";

import clsx from "clsx";
import { CSSProperties, forwardRef, ReactElement } from "react";
import { borderBoxClass } from "../../styles/base";
import { Tag } from "../Tag";
import { blockClass } from "./tagBlock.styles";

export interface TagBlockProps {
  children: ReactElement<typeof Tag> | ReactElement<typeof Tag>[];
  styles?: CSSProperties;
  className?: string;
}

export const TagBlock = forwardRef<HTMLDivElement, TagBlockProps>((props, ref) => {
  return (
    <div
      ref={ref}
      className={clsx(blockClass, borderBoxClass, "openui-tag-block", props.className)}
      style={props.styles}
    >
      {props.children}
    </div>
  );
});

TagBlock.displayName = "TagBlock";
