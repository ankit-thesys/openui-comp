"use client";

import clsx from "clsx";
import React from "react";
import { useStyles } from "../../styles/useStyles";
import { Separator } from "../Separator";
import { names, sectionStyles } from "./sectionV2.styles";

interface SectionV2Props {
  trigger: string;
  children?: React.ReactNode;
}

export const SectionV2 = ({ trigger, children }: SectionV2Props) => {
  const styles = useStyles(sectionStyles);
  return (
    <div className={clsx(styles.root, names.root)}>
      <div className={clsx(styles.wrapper, names.wrapper)}>
        <Separator orientation="horizontal" />
        <div className={clsx(styles.header, names.header)}>
          <div className={clsx(styles.headerTrigger, names.headerTrigger)}>{trigger}</div>
        </div>
        <div className={clsx(styles.content, names.content)}>{children}</div>
      </div>
    </div>
  );
};
