import {useTheme as __usePortalTheme} from "../../../../../openui-runtime-owned-components/source/src/components/ThemeProvider";
import { OwnedElement as __OwnedElement } from "../../../../runtime/adapter";
import { styles as __style225 } from "../../../../runtime/styles/Chat_openui_agent_history_button";
import { styles as __style24 } from "../../../../runtime/styles/Chat_openui_agent_history_menu";
import { styles as __style25 } from "../../../../runtime/styles/Chat_openui_agent_history_menu__label";
import { styles as __style29 } from "../../../../runtime/styles/Chat_openui_agent_history_menu__empty";
import { styles as __style26 } from "../../../../runtime/styles/Chat_openui_agent_history_menu__item";
import { styles as __style27 } from "../../../../runtime/styles/Chat_openui_agent_history_menu__item__selected";
import { styles as __style28 } from "../../../../runtime/styles/Chat_openui_agent_history_menu__title";
import { useThreadList } from "@openuidev/react-headless";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import clsx from "clsx";
import { Clock } from "lucide-react";
import { useState } from "react";
import { useLayoutContext } from "../../context/LayoutContext";
import { useOptionalSidebarVisualState } from "./Sidebar";
import { SidebarTooltip } from "./SidebarTooltip";
import { useOptionalNav } from "./_shared/navContext";
import { useAgentInterfaceStore } from "./_shared/store";
/**
 * Collapsed-rail shortcut to the thread history. Opens a menu of threads beside
 * the rail; picking one switches to it without expanding the sidebar. The
 * expanded sidebar already lists threads, so the button only renders on the
 * collapsed desktop rail.
 */
export const HistoryButton = ({ className }: {
    className?: string;
}) => {
    const { portalThemeClassName: __portalThemeClassName } = __usePortalTheme();
    const { isSidebarOpen } = useAgentInterfaceStore((state) => ({
        isSidebarOpen: state.isSidebarOpen,
    }));
    const sidebarVisualState = useOptionalSidebarVisualState();
    const isCollapsed = sidebarVisualState ? sidebarVisualState.isCollapsedLayout : !isSidebarOpen;
    const { layout } = useLayoutContext();
    const threads = useThreadList((s) => s.threads);
    const isLoadingThreads = useThreadList((s) => s.isLoadingThreads);
    const selectThread = useThreadList((s) => s.selectThread);
    const selectedThreadId = useThreadList((s) => s.selectedThreadId);
    const nav = useOptionalNav();
    const [open, setOpen] = useState(false);
    if (layout === "mobile" || !isCollapsed)
        return null;
    const handleSelect = (id: string) => {
        selectThread(id);
        if (nav && nav.path !== undefined) {
            nav.navigate(undefined);
        }
    };
    return (<DropdownMenu.Root open={open} onOpenChange={setOpen} modal={false}>
      <SidebarTooltip content="History" disabled={open}>
        <DropdownMenu.Trigger asChild>
          <__OwnedElement $element="button" $styles={[__style225]} type="button" className={clsx("openui-agent-history-button", className)} aria-label="Chat history">
            <Clock size="1em" aria-hidden="true"/>
          </__OwnedElement>
        </DropdownMenu.Trigger>
      </SidebarTooltip>
      <DropdownMenu.Portal>
        <__OwnedElement $element={DropdownMenu.Content} $styles={[__style24]} className={["openui-agent-history-menu", __portalThemeClassName].join(" ")} side="right" align="start" sideOffset={8} collisionPadding={12}>
          <__OwnedElement $element={DropdownMenu.Label} $styles={[__style25]} className="openui-agent-history-menu__label">
            Recent chats
          </__OwnedElement>
          {threads.length === 0 ? (<__OwnedElement $element="div" $styles={[__style29]} className="openui-agent-history-menu__empty">
              {isLoadingThreads ? "Loading…" : "No chats yet"}
            </__OwnedElement>) : (threads.map((thread) => (<__OwnedElement $element={DropdownMenu.Item} $styles={[__style26, __style27]} key={thread.id} className={clsx("openui-agent-history-menu__item", {
                "openui-agent-history-menu__item--selected": thread.id === selectedThreadId,
            })} onSelect={() => handleSelect(thread.id)}>
                <__OwnedElement $element="span" $styles={[__style28]} className="openui-agent-history-menu__title">{thread.title}</__OwnedElement>
              </__OwnedElement>)))}
        </__OwnedElement>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>);
};
