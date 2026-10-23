import {OwnedElement as __OwnedElement} from "../../../../runtime/adapter";
import {styles as __styles0} from "../../../../runtime/styles/CheckBoxItem";
import * as Checkbox from "@radix-ui/react-checkbox";
import clsx from "clsx";
import { CSSProperties, forwardRef, ReactNode, useId } from "react";
export interface CheckBoxItemProps {
    label?: ReactNode;
    description?: ReactNode;
    className?: string;
    style?: CSSProperties;
    checked?: boolean;
    defaultChecked?: boolean;
    disabled?: boolean;
    required?: boolean;
    name?: string;
    value?: string;
    onChange?: (checked: boolean) => void;
}
const CheckBoxItem = forwardRef<HTMLButtonElement, CheckBoxItemProps>((props, ref) => {
    const { label, description, onChange, className, disabled, required, ...rest } = props;
    const id = useId();
    return (<__OwnedElement $element="label" $styles={[__styles0]} htmlFor={id} className="openui-checkbox-item-container">
      <__OwnedElement $element={Checkbox.Root} $styles={[__styles0]} {...rest} ref={ref} onCheckedChange={onChange} id={id} className={clsx("openui-checkbox-item-root", className)} disabled={disabled} required={required}>
        <__OwnedElement $element={Checkbox.Indicator} $styles={[__styles0]} className="openui-checkbox-item-indicator">
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 1L3.5 6.5L1 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </__OwnedElement>
      </__OwnedElement>
      <__OwnedElement $element="div" $styles={[__styles0]} className="openui-checkbox-item-content">
        {label && (<__OwnedElement $element="label" $styles={[__styles0]} htmlFor={id} className="openui-checkbox-item-label">
            {label}
          </__OwnedElement>)}
        {description && <__OwnedElement $element="p" $styles={[__styles0]} className="openui-checkbox-item-description">{description}</__OwnedElement>}
      </__OwnedElement>
    </__OwnedElement>);
});
CheckBoxItem.displayName = "CheckBoxItem";
export { CheckBoxItem };
