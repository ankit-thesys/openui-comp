"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import clsx from "clsx";
import { ChevronRight } from "lucide-react";
import React, { forwardRef } from "react";
import { styleRules } from "../../styles/css";
import { IconButton } from "../IconButton";
import { Separator } from "../Separator";
import { foldableSectionStyles, names } from "./foldableSection.styles";

export type FoldableSectionRootProps = AccordionPrimitive.AccordionMultipleProps;

export const FoldableSectionRoot = forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Root>,
  FoldableSectionRootProps
>(({ className, style, ...props }, ref) => {
  const styles = foldableSectionStyles;
  const rootClass = clsx(styles.root, names.root, className);
  return (
    <>
      <AccordionPrimitive.Root ref={ref} className={rootClass} style={style} {...props} />
      {styleRules(rootClass)}
    </>
  );
});
FoldableSectionRoot.displayName = "FoldableSectionRoot";

export interface FoldableSectionItemProps extends React.ComponentPropsWithoutRef<
  typeof AccordionPrimitive.Item
> {
  className?: string;
  style?: React.CSSProperties;
  value: string;
}

export const FoldableSectionItem = forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Item>,
  FoldableSectionItemProps
>(({ className, style, value, ...props }, ref) => {
  const styles = foldableSectionStyles;
  const itemClass = clsx(styles.item, names.item, className);
  return (
    <>
      <AccordionPrimitive.Item
        ref={ref}
        className={itemClass}
        style={style}
        value={value}
        {...props}
      />
      {styleRules(itemClass)}
    </>
  );
});
FoldableSectionItem.displayName = "FoldableSectionItem";

export interface FoldableSectionTriggerProps extends React.ComponentPropsWithoutRef<
  typeof AccordionPrimitive.Trigger
> {
  className?: string;
  style?: React.CSSProperties;
  text: React.ReactNode;
}

export const FoldableSectionTrigger = forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Trigger>,
  FoldableSectionTriggerProps
>(({ className, style, text, ...props }, ref) => {
  const styles = foldableSectionStyles;
  const headerClass = clsx(styles.header, names.header);
  const triggerClass = clsx(styles.trigger, names.trigger, className);
  const triggerContentWrapperClass = clsx(
    styles.triggerContentWrapper,
    names.triggerContentWrapper,
  );
  const triggerContentSeparatorClass = clsx(
    styles.triggerContentSeparator,
    names.triggerContentSeparator,
  );
  const triggerContentIconButtonWrapperClass = clsx(
    styles.triggerContentIconButtonWrapper,
    names.triggerContentIconButtonWrapper,
  );
  const triggerContentIconButtonClass = clsx(
    styles.triggerContentIconButton,
    names.triggerContentIconButton,
  );
  const triggerContentIconButtonIconClass = clsx(
    styles.triggerContentIconButtonIcon,
    names.triggerContentIconButtonIcon,
  );
  const triggerContentTextClass = clsx(styles.triggerContentText, names.triggerContentText);
  return (
    <>
      <AccordionPrimitive.Header className={headerClass}>
        <AccordionPrimitive.Trigger ref={ref} className={triggerClass} style={style} {...props}>
          <div className={triggerContentWrapperClass}>
            <Separator className={triggerContentSeparatorClass} />
            {styleRules(triggerContentSeparatorClass)}
            <div className={triggerContentIconButtonWrapperClass}>
              <IconButton
                asChild
                icon={
                  <>
                    <ChevronRight className={triggerContentIconButtonIconClass} />
                    {styleRules(triggerContentIconButtonIconClass)}
                  </>
                }
                size="3-extra-small"
                variant="secondary"
                className={triggerContentIconButtonClass}
              >
                <span aria-hidden="true" />
              </IconButton>
              {styleRules(triggerContentIconButtonClass)}
              <div className={triggerContentTextClass}>{text}</div>
              {styleRules(triggerContentTextClass)}
            </div>
            {styleRules(triggerContentIconButtonWrapperClass)}
          </div>
          {styleRules(triggerContentWrapperClass)}
        </AccordionPrimitive.Trigger>
        {styleRules(triggerClass)}
      </AccordionPrimitive.Header>
      {styleRules(headerClass)}
    </>
  );
});
FoldableSectionTrigger.displayName = "FoldableSectionTrigger";

export interface FoldableSectionContentProps extends React.ComponentPropsWithoutRef<
  typeof AccordionPrimitive.Content
> {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const FoldableSectionContent = forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Content>,
  FoldableSectionContentProps
>(({ className, style, children, ...props }, ref) => {
  const styles = foldableSectionStyles;
  const contentClass = clsx(styles.content, names.content, className);
  return (
    <>
      <AccordionPrimitive.Content ref={ref} className={contentClass} style={style} {...props}>
        {children}
      </AccordionPrimitive.Content>
      {styleRules(contentClass)}
    </>
  );
});
FoldableSectionContent.displayName = "FoldableSectionContent";
