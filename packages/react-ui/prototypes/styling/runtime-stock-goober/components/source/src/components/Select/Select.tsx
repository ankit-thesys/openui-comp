import {OwnedElement as __OwnedElement} from "../../../../runtime/adapter";
import {styles as __styles0} from "../../../../runtime/styles/Select";
import * as SelectPrimitive from "@radix-ui/react-select";
import clsx from "clsx";
import { Check, ChevronDown } from "lucide-react";
import React, { createContext, forwardRef, useContext, useEffect, useMemo, useState } from "react";
import { useTheme } from "../ThemeProvider";
type SelectSize = "sm" | "md" | "lg";
interface SelectSizeContextType {
    size: SelectSize;
    setSize: (size: SelectSize) => void;
}
const SelectSizeContext = createContext<SelectSizeContextType | null>(null);
const useSelectSizeContext = () => useContext(SelectSizeContext);
export interface SelectProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root> {
    size?: SelectSize;
}
export const Select = ({ size = "md", ...props }: SelectProps) => {
    const [currentSize, setCurrentSize] = useState<SelectSize>(size);
    useEffect(() => {
        setCurrentSize(size);
    }, [size]);
    const contextValue = useMemo(() => ({ size: currentSize, setSize: setCurrentSize }), [currentSize]);
    return (<SelectSizeContext.Provider value={contextValue}>
      <SelectPrimitive.Root {...props}/>
    </SelectSizeContext.Provider>);
};
export interface SelectGroupProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Group> {
    className?: string;
    style?: React.CSSProperties;
}
export const SelectGroup = forwardRef<React.ComponentRef<typeof SelectPrimitive.Group>, SelectGroupProps>(({ className, style, ...props }, ref) => (<__OwnedElement $element={SelectPrimitive.Group} $styles={[__styles0]} ref={ref} className={clsx("openui-select-group", className)} style={style} {...props}/>));
export const SelectValue = SelectPrimitive.Value;
export interface SelectTriggerProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> {
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
    hideDropdownIcon?: boolean;
    size?: SelectSize;
}
const sizeMap: Record<string, string> = {
    sm: "openui-select-trigger-sm",
    md: "openui-select-trigger-md",
    lg: "openui-select-trigger-lg",
};
export const SelectTrigger = forwardRef<React.ComponentRef<typeof SelectPrimitive.Trigger>, SelectTriggerProps>(({ className, style, children, hideDropdownIcon, size, ...props }, ref) => {
    const sizeContext = useSelectSizeContext();
    const resolvedSize = size ?? sizeContext?.size ?? "md";
    useEffect(() => {
        if (sizeContext && sizeContext.size !== resolvedSize) {
            sizeContext.setSize(resolvedSize);
        }
    }, [resolvedSize, sizeContext]);
    return (<__OwnedElement $element={SelectPrimitive.Trigger} $styles={[__styles0]} ref={ref} className={clsx("openui-select-trigger", sizeMap[resolvedSize], className)} style={style} {...props}>
      {children}
      <SelectPrimitive.Icon asChild>
        {!hideDropdownIcon && <__OwnedElement $element={ChevronDown} $styles={[__styles0]} className="openui-select-trigger-icon"/>}
      </SelectPrimitive.Icon>
    </__OwnedElement>);
});
export interface SelectContentProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> {
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
    position?: "item-aligned" | "popper";
}
export const SelectContent = forwardRef<React.ComponentRef<typeof SelectPrimitive.Content>, SelectContentProps>(({ className, children, position = "popper", ...props }, ref) => {
    const { portalThemeClassName } = useTheme();
    const sizeContext = useSelectSizeContext();
    return (<SelectPrimitive.Portal>
      <__OwnedElement $element={SelectPrimitive.Content} $styles={[__styles0]} ref={ref} className={clsx("openui-select-content", sizeContext && `openui-select-content-${sizeContext.size}`, className, portalThemeClassName)} position={position} sideOffset={2} {...props}>
        <__OwnedElement $element={SelectPrimitive.Viewport} $styles={[__styles0]} className="openui-select-viewport" data-position={position}>
          {children}
        </__OwnedElement>
      </__OwnedElement>
    </SelectPrimitive.Portal>);
});
export interface SelectLabelProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label> {
    className?: string;
    style?: React.CSSProperties;
}
export const SelectLabel = forwardRef<React.ComponentRef<typeof SelectPrimitive.Label>, SelectLabelProps>(({ className, style, ...props }, ref) => (<__OwnedElement $element={SelectPrimitive.Label} $styles={[__styles0]} ref={ref} className={clsx("openui-select-label", className)} style={style} {...props}/>));
export interface SelectItemProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> {
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
    textValue?: string;
    showTick?: boolean;
}
export const SelectItem = forwardRef<React.ComponentRef<typeof SelectPrimitive.Item>, SelectItemProps>(({ className, style, children, showTick = true, textValue, ...props }, ref) => (<__OwnedElement $element={SelectPrimitive.Item} $styles={[__styles0]} ref={ref} className={clsx("openui-select-item", showTick ? "openui-select-item--with-tick" : "openui-select-item--without-tick", className)} style={style} {...props}>
    {showTick && (<__OwnedElement $element="span" $styles={[__styles0]} className="openui-select-item-check-wrapper">
        <SelectPrimitive.ItemIndicator>
          <__OwnedElement $element={Check} $styles={[__styles0]} className="openui-select-item-check-icon"/>
        </SelectPrimitive.ItemIndicator>
      </__OwnedElement>)}
    <__OwnedElement $element={SelectPrimitive.ItemText} $styles={[__styles0]} className="openui-select-item-text">
      {children}
    </__OwnedElement>
    {textValue && <__OwnedElement $element="span" $styles={[__styles0]} className="openui-select-item-text-value">{textValue}</__OwnedElement>}
  </__OwnedElement>));
export interface SelectSeparatorProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator> {
    className?: string;
    style?: React.CSSProperties;
}
export const SelectSeparator = forwardRef<React.ComponentRef<typeof SelectPrimitive.Separator>, SelectSeparatorProps>(({ className, style, ...props }, ref) => (<__OwnedElement $element={SelectPrimitive.Separator} $styles={[__styles0]} ref={ref} className={clsx("openui-select-separator", className)} style={style} {...props}/>));
