import {OwnedElement as __OwnedElement} from "../../../../runtime/adapter";
import {styles as __styles0} from "../../../../runtime/styles/Accordion";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import clsx from "clsx";
import { ChevronDownIcon } from "lucide-react";
import React, { forwardRef } from "react";
type AccordionVariant = "clear" | "card" | "sunk";
export type AccordionProps = (AccordionPrimitive.AccordionSingleProps | AccordionPrimitive.AccordionMultipleProps) & {
    variant?: AccordionVariant;
};
const variantMap: Record<AccordionVariant, string> = {
    clear: "openui-accordion-clear",
    card: "openui-accordion-card",
    sunk: "openui-accordion-sunk",
};
export const Accordion = forwardRef<React.ComponentRef<typeof AccordionPrimitive.Root>, AccordionProps>(({ className, style, variant = "clear", ...props }, ref) => (<__OwnedElement $element={AccordionPrimitive.Root} $styles={[__styles0]} ref={ref} className={clsx("openui-accordion", variantMap[variant], className)} style={style} {...props}/>));
export interface AccordionItemProps extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item> {
    className?: string;
    style?: React.CSSProperties;
    value: string;
}
export const AccordionItem = forwardRef<React.ComponentRef<typeof AccordionPrimitive.Item>, AccordionItemProps>(({ className, style, value, ...props }, ref) => (<__OwnedElement $element={AccordionPrimitive.Item} $styles={[__styles0]} ref={ref} className={clsx("openui-accordion-item", className)} style={style} value={value} {...props}/>));
export interface AccordionTriggerProps extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> {
    className?: string;
    style?: React.CSSProperties;
    icon?: React.ReactNode;
    text: React.ReactNode;
}
export const AccordionTrigger = forwardRef<React.ComponentRef<typeof AccordionPrimitive.Trigger>, AccordionTriggerProps>(({ className, style, text, icon, ...props }, ref) => (<__OwnedElement $element={AccordionPrimitive.Header} $styles={[__styles0]} className={clsx("openui-accordion-header")}>
    <__OwnedElement $element={AccordionPrimitive.Trigger} $styles={[__styles0]} ref={ref} className={clsx("openui-accordion-trigger", className)} style={style} {...props}>
      <__OwnedElement $element="div" $styles={[__styles0]} className="openui-accordion-trigger-content">
        {icon && <__OwnedElement $element="span" $styles={[__styles0]} className="openui-accordion-trigger-content-icon">{icon}</__OwnedElement>}
        {text}
      </__OwnedElement>
      <__OwnedElement $element={ChevronDownIcon} $styles={[__styles0]} className="openui-accordion-trigger-icon"/>
    </__OwnedElement>
  </__OwnedElement>));
export interface AccordionContentProps extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content> {
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
}
export const AccordionContent = forwardRef<React.ComponentRef<typeof AccordionPrimitive.Content>, AccordionContentProps>(({ className, style, children, ...props }, ref) => (<__OwnedElement $element={AccordionPrimitive.Content} $styles={[__styles0]} ref={ref} className={clsx("openui-accordion-content", className)} style={style} {...props}>
    <__OwnedElement $element="div" $styles={[__styles0]} className="openui-accordion-content-wrapper">{children}</__OwnedElement>
  </__OwnedElement>));
