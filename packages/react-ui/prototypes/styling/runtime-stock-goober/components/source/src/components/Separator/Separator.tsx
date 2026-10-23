import {OwnedElement as __OwnedElement} from "../../../../runtime/adapter";
import {styles as __styles0} from "../../../../runtime/styles/Separator";
import * as RadixSeparator from "@radix-ui/react-separator";
import clsx from "clsx";
const Separator = ({ className, ...props }: React.ComponentProps<typeof RadixSeparator.Root>) => {
    return <__OwnedElement $element={RadixSeparator.Root} $styles={[__styles0]} className={clsx("openui-separator", className)} {...props}/>;
};
export { Separator };
