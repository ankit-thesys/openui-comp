import {useTheme as __usePortalTheme} from "../../../../../../components/source/src/components/ThemeProvider";
import { OwnedElement as __OwnedElement } from "../../../../../runtime/adapter";
import { styles as __style227 } from "../../../../../runtime/styles/Chat_openui_agent_tooltip";
import * as Tooltip from "@radix-ui/react-tooltip";
import type { ReactElement, ReactNode } from "react";
export interface AgentInterfaceTooltipProps {
    children: ReactElement;
    content: ReactNode;
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
    sideOffset?: number;
}
export const AgentInterfaceTooltip = ({ children, content, side = "bottom", align = "center", sideOffset = 8, }: AgentInterfaceTooltipProps) => {
    const { portalThemeClassName: __portalThemeClassName } = __usePortalTheme();
    return (
    // Provider is hoisted once into <Container> so delay/skip-delay are shared.
    <Tooltip.Root>
    <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
    <Tooltip.Portal>
      <__OwnedElement $element={Tooltip.Content} $styles={[__style227]} className={["openui-agent-tooltip", __portalThemeClassName].join(" ")} side={side} align={align} sideOffset={sideOffset}>
        {content}
      </__OwnedElement>
    </Tooltip.Portal>
  </Tooltip.Root>);
};
