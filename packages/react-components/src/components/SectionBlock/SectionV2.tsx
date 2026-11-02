"use client";

import clsx from "clsx";
import React from "react";
import { styleRules } from "../../styles/css";
import { Separator } from "../Separator";
import { names, sectionStyles } from "./sectionV2.styles";

interface SectionV2Props {
  trigger: string;
  children?: React.ReactNode;
}

export const SectionV2 = ({ trigger, children }: SectionV2Props) => {
  const styles = sectionStyles;
  const rootClass = clsx(styles.root, names.root);
  const wrapperClass = clsx(styles.wrapper, names.wrapper);
  const headerClass = clsx(styles.header, names.header);
  const headerTriggerClass = clsx(styles.headerTrigger, names.headerTrigger);
  const contentClass = clsx(styles.content, names.content);
  return (
    <>
      <div className={rootClass}>
        <div className={wrapperClass}>
          <Separator orientation="horizontal" />
          <div className={headerClass}>
            <div className={headerTriggerClass}>{trigger}</div>
            {styleRules(headerTriggerClass)}
          </div>
          {styleRules(headerClass)}
          <div className={contentClass}>{children}</div>
          {styleRules(contentClass)}
        </div>
        {styleRules(wrapperClass)}
      </div>
      {styleRules(rootClass)}
    </>
  );
};
