import {OwnedElement as __OwnedElement} from "../../../../runtime/adapter";
import {styles as __styles0} from "../../../../runtime/styles/SwitchItem";
import * as Switch from "@radix-ui/react-switch";
import clsx from "clsx";
import { CSSProperties, forwardRef, ReactNode, useId } from "react";
interface SwitchItemProps {
    label?: ReactNode;
    description?: ReactNode;
    className?: string;
    style?: CSSProperties;
    checked?: boolean;
    disabled?: boolean;
    defaultChecked?: boolean;
    required?: boolean;
    name?: string;
    value?: string;
    onChange?: (value: boolean) => void;
}
const SwitchItem = forwardRef<HTMLButtonElement, SwitchItemProps>((props, ref) => {
    const { label, description, onChange, className, disabled, required, ...rest } = props;
    const id = useId();
    return (<__OwnedElement $element="div" $styles={[__styles0]} className="openui-switch-item-container">
      <__OwnedElement $element={Switch.Root} $styles={[__styles0]} ref={ref} onCheckedChange={onChange} id={id} className={clsx("openui-switch-item-root", className)} disabled={disabled} required={required} {...rest}>
        <__OwnedElement $element={Switch.Thumb} $styles={[__styles0]} className="openui-switch-item-thumb"/>
      </__OwnedElement>
      <__OwnedElement $element="div" $styles={[__styles0]} className="openui-switch-item-content">
        {label && (<__OwnedElement $element="label" $styles={[__styles0]} htmlFor={id} className="openui-switch-item-label">
            {label}
          </__OwnedElement>)}
        {description && <__OwnedElement $element="p" $styles={[__styles0]} className="openui-switch-item-description">{description}</__OwnedElement>}
      </__OwnedElement>
    </__OwnedElement>);
});
SwitchItem.displayName = "SwitchItem";
export { SwitchItem, type SwitchItemProps };
