"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import clsx from "clsx";
import { ChevronDownIcon } from "lucide-react";
import React, { forwardRef } from "react";
import { styleRules } from "../../styles/css";
import { accordionStyles, names } from "./accordion.styles";

type AccordionVariant = "clear" | "card" | "sunk";

export type AccordionProps = (
  AccordionPrimitive.AccordionSingleProps | AccordionPrimitive.AccordionMultipleProps
) & {
  variant?: AccordionVariant;
};

export const Accordion = forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Root>,
  AccordionProps
>(({ className, style, variant = "clear", ...props }, ref) => {
  const styles = accordionStyles;
  const rootClass = clsx(
    styles.root,
    names.root,
    styles.variant[variant],
    names.variant[variant],
    className,
  );
  return (
    <>
      <AccordionPrimitive.Root ref={ref} className={rootClass} style={style} {...props} />
      {styleRules(rootClass)}
    </>
  );
});

export interface AccordionItemProps extends React.ComponentPropsWithoutRef<
  typeof AccordionPrimitive.Item
> {
  className?: string;
  style?: React.CSSProperties;
  value: string;
}

export const AccordionItem = forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Item>,
  AccordionItemProps
>(({ className, style, value, ...props }, ref) => {
  const styles = accordionStyles;
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

export interface AccordionTriggerProps extends React.ComponentPropsWithoutRef<
  typeof AccordionPrimitive.Trigger
> {
  className?: string;
  style?: React.CSSProperties;
  icon?: React.ReactNode;
  text: React.ReactNode;
}
export const AccordionTrigger = forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Trigger>,
  AccordionTriggerProps
>(({ className, style, text, icon, ...props }, ref) => {
  const styles = accordionStyles;
  const headerClass = clsx(styles.header, names.header);
  const triggerClass = clsx(styles.trigger, names.trigger, className);
  const triggerContentClass = clsx(styles.triggerContent, names.triggerContent);
  const triggerIconClass = clsx(styles.triggerIcon, names.triggerIcon);
  return (
    <>
      <AccordionPrimitive.Header className={headerClass}>
        <AccordionPrimitive.Trigger ref={ref} className={triggerClass} style={style} {...props}>
          <div className={triggerContentClass}>
            {icon && (
              <>
                <span className={clsx(styles.triggerContentIcon, names.triggerContentIcon)}>
                  {icon}
                </span>
                {styleRules(clsx(styles.triggerContentIcon, names.triggerContentIcon))}
              </>
            )}
            {text}
          </div>
          {styleRules(triggerContentClass)}
          <ChevronDownIcon className={triggerIconClass} />
          {styleRules(triggerIconClass)}
        </AccordionPrimitive.Trigger>
        {styleRules(triggerClass)}
      </AccordionPrimitive.Header>
      {styleRules(headerClass)}
    </>
  );
});

export interface AccordionContentProps extends React.ComponentPropsWithoutRef<
  typeof AccordionPrimitive.Content
> {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
export const AccordionContent = forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Content>,
  AccordionContentProps
>(({ className, style, children, ...props }, ref) => {
  const styles = accordionStyles;
  const contentClass = clsx(styles.content, names.content, className);
  const contentWrapperClass = clsx(styles.contentWrapper, names.contentWrapper);
  return (
    <>
      <AccordionPrimitive.Content ref={ref} className={contentClass} style={style} {...props}>
        <div className={contentWrapperClass}>{children}</div>
        {styleRules(contentWrapperClass)}
      </AccordionPrimitive.Content>
      {styleRules(contentClass)}
    </>
  );
});
