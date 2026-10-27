import * as AccordionPrimitive from "@radix-ui/react-accordion";
import clsx from "clsx";
import { css } from "goober";
import { ChevronRight } from "lucide-react";
import React, { forwardRef } from "react";
import { IconButton } from "../IconButton";
import { Separator } from "../Separator";
import {
  contentStyles,
  headerStyles,
  itemStyles,
  rootStyles,
  triggerStyles,
} from "./foldableSection.styles";

const rootClass = "openui-section-block-foldable-section-root";
const itemClass = "openui-section-block-foldable-section-item";
const headerClass = "openui-section-block-foldable-section-header";
const triggerClass = "openui-section-block-foldable-section-trigger";
const contentClass = "openui-section-block-foldable-section-content";

export type FoldableSectionRootProps = AccordionPrimitive.AccordionMultipleProps;

export const FoldableSectionRoot = forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Root>,
  FoldableSectionRootProps
>(({ className, style, ...props }, ref) => (
  <AccordionPrimitive.Root
    ref={ref}
    className={clsx(rootClass, "openui-foldable-section-root", className)}
    style={style}
    {...props}
  />
));
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
>(({ className, style, value, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={clsx(itemClass, "openui-foldable-section-item", className)}
    style={style}
    value={value}
    {...props}
  />
));
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
>(({ className, style, text, ...props }, ref) => (
  <AccordionPrimitive.Header className={clsx(headerClass, "openui-foldable-section-header")}>
    <AccordionPrimitive.Trigger
      ref={ref}
      className={clsx(triggerClass, "openui-foldable-section-trigger", className)}
      style={style}
      {...props}
    >
      <div className="openui-foldable-section-trigger-content-wrapper">
        <Separator className="openui-foldable-section-trigger-content-separator" />
        <div className="openui-foldable-section-trigger-content-icon-button-wrapper">
          <IconButton
            asChild
            icon={
              <ChevronRight className="openui-foldable-section-trigger-content-icon-button-icon" />
            }
            size="3-extra-small"
            variant="secondary"
            className="openui-foldable-section-trigger-content-icon-button"
          >
            <span aria-hidden="true" />
          </IconButton>
          <div className="openui-foldable-section-trigger-content-text">{text}</div>
        </div>
      </div>
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
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
>(({ className, style, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={clsx(contentClass, "openui-foldable-section-content", className)}
    style={style}
    {...props}
  >
    {children}
  </AccordionPrimitive.Content>
));
FoldableSectionContent.displayName = "FoldableSectionContent";

const stylesheetScope = css`
  :where(&:root) {
    .openui-section-block-foldable-section-root {
      ${rootStyles}
    }
    .openui-section-block-foldable-section-item {
      ${itemStyles}
    }
    .openui-section-block-foldable-section-header {
      ${headerStyles}
    }
    .openui-section-block-foldable-section-trigger {
      ${triggerStyles}
    }
    .openui-section-block-foldable-section-content {
      ${contentStyles}
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}
