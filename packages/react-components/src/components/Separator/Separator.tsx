import * as RadixSeparator from "@radix-ui/react-separator";
import clsx from "clsx";
import { css } from "goober";
import { separatorStyles } from "./separator.styles";

const componentClass = "openui-separator-root";

const Separator = ({ className, ...props }: React.ComponentProps<typeof RadixSeparator.Root>) => {
  return (
    <RadixSeparator.Root
      className={clsx(componentClass, "openui-separator", className)}
      {...props}
    />
  );
};

export { Separator };

const stylesheetScope = css`
  :where(&:root) {
    .openui-separator-root {
      ${separatorStyles}
    }
  }
`;

if (typeof document !== "undefined") {
  document.documentElement.classList.add(stylesheetScope);
}
