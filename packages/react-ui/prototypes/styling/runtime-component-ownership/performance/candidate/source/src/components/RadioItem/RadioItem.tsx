import {OwnedElement as __OwnedElement} from "../../../../runtime/adapter";
import {styles as __styles0} from "../../../../runtime/styles/RadioItem";
import * as Radio from "@radix-ui/react-radio-group";
import clsx from "clsx";
import { CSSProperties, forwardRef, ReactNode, useId } from "react";
export interface RadioItemProps {
    label?: ReactNode;
    description?: ReactNode;
    className?: string;
    style?: CSSProperties;
    disabled?: boolean;
    required?: boolean;
    value: string;
}
const RadioItem = forwardRef<HTMLButtonElement, RadioItemProps>((props, ref) => {
    const { label, description, className, style, disabled, required, value } = props;
    const id = useId();
    return (<__OwnedElement $element="label" $styles={[__styles0]} htmlFor={id} className="openui-radio-item-container">
      <__OwnedElement $element={Radio.Item} $styles={[__styles0]} ref={ref} id={id} className={clsx("openui-radio-item-root", className)} value={value} disabled={disabled} required={required} style={style}>
        <__OwnedElement $emitResources={false} $element="svg" $styles={[__styles0]} width={16} height={16} fill="none" viewBox="0 0 16 16" className="openui-radio-item-svg">
          <__OwnedElement $emitResources={false} $element="path" $styles={[__styles0]} fill="currentColor" d="M1 8a7 7 0 1 1 14 0A7 7 0 0 1 1 8Z" className="openui-radio-item-svg-path"/>
          <__OwnedElement $emitResources={false} $element="path" $styles={[__styles0]} stroke="currentColor" d="M1.5 8a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-13 0Z" className="openui-radio-item-svg-border"/>
          <__OwnedElement $emitResources={false} $element="path" $styles={[__styles0]} fill="currentColor" d="M4 8a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z" className="openui-radio-item-svg-inner"/>
        </__OwnedElement>
      </__OwnedElement>
      <__OwnedElement $element="div" $styles={[__styles0]} className="openui-radio-item-content">
        {label && (<__OwnedElement $element="label" $styles={[__styles0]} htmlFor={id} className="openui-radio-item-label">
            {label}
          </__OwnedElement>)}
        {description && <__OwnedElement $element="p" $styles={[__styles0]} className="openui-radio-item-description">{description}</__OwnedElement>}
      </__OwnedElement>
    </__OwnedElement>);
});
RadioItem.displayName = "RadioItem";
export { RadioItem };
