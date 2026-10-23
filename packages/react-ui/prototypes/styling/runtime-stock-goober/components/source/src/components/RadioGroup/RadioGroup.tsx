import {OwnedElement as __OwnedElement} from "../../../../runtime/adapter";
import {styles as __styles0} from "../../../../runtime/styles/RadioGroup";
import * as Radio from "@radix-ui/react-radio-group";
import clsx from "clsx";
import { CSSProperties, forwardRef, ReactElement } from "react";
import { RadioItemProps } from "../RadioItem";
type RadioGroupVariant = "clear" | "card" | "sunk";
interface RadioGroupProps extends Radio.RadioGroupProps {
    children: ReactElement<RadioItemProps> | ReactElement<RadioItemProps>[];
    variant?: RadioGroupVariant;
    className?: string;
    style?: CSSProperties;
}
const variants: Record<RadioGroupVariant, string> = {
    clear: "openui-radio-group-clear",
    card: "openui-radio-group-card",
    sunk: "openui-radio-group-sunk",
};
const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>((props, ref) => {
    const { children, className, style, variant = "clear", ...rest } = props;
    return (<__OwnedElement $element={Radio.Root} $styles={[__styles0]} ref={ref} className={clsx("openui-radio-group", variants[variant], className)} style={style} {...rest}>
      {children}
    </__OwnedElement>);
});
RadioGroup.displayName = "RadioGroup";
export { RadioGroup, type RadioGroupProps };
