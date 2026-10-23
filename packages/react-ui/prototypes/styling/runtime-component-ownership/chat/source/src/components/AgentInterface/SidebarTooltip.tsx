import {useTheme as __usePortalTheme} from "../../../../../openui-runtime-owned-components/source/src/components/ThemeProvider";
import { OwnedElement as __OwnedElement } from "../../../../runtime/adapter";
import { styles as __style228 } from "../../../../runtime/styles/Chat_openui_agent_sidebar_tooltip";
import * as Tooltip from "@radix-ui/react-tooltip";
import type { ReactElement, ReactNode } from "react";
export interface SidebarTooltipProps {
    children: ReactElement;
    content: ReactNode;
    disabled?: boolean;
}
export const SidebarTooltip = ({ children, content, disabled = false }: SidebarTooltipProps) => {
    const { portalThemeClassName: __portalThemeClassName } = __usePortalTheme();
    if (disabled)
        return children;
    // Provider is hoisted once into <Container> so delay/skip-delay are shared.
    return (<Tooltip.Root>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <__OwnedElement $element={Tooltip.Content} $styles={[__style228]} className={["openui-agent-sidebar-tooltip", __portalThemeClassName].join(" ")} side="right" align="center" sideOffset={8}>
          {content}
        </__OwnedElement>
      </Tooltip.Portal>
    </Tooltip.Root>);
};
