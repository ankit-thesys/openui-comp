import {OwnedElement as __OwnedElement} from "../../../../runtime/adapter";
import {styles as __style226} from "../../../../runtime/styles/Chat_openui_agent_new_chat_floating_button";
import {styles as __style221} from "../../../../runtime/styles/Chat_openui_agent_new_chat_button";
import {styles as __style222} from "../../../../runtime/styles/Chat_openui_agent_new_chat_button__collapsed";
import {styles as __style223} from "../../../../runtime/styles/Chat_openui_agent_new_chat_button__icon";
import {styles as __style224} from "../../../../runtime/styles/Chat_openui_agent_new_chat_button__label";
import { useThreadList } from "@openuidev/react-headless";
import clsx from "clsx";
import { SquarePen } from "lucide-react";
import type { MouseEvent } from "react";
import { useLayoutContext } from "../../context/LayoutContext";
import { Button } from "../Button";
import { useOptionalSidebarVisualState } from "./Sidebar";
import { SidebarTooltip } from "./SidebarTooltip";
import { useOptionalNav } from "./_shared/navContext";
import { useAgentInterfaceStore } from "./_shared/store";
export const NewChatButton = ({ className }: {
    className?: string;
}) => {
    const switchToNewThread = useThreadList((s) => s.switchToNewThread);
    // A fresh chat has no thread yet, so the New Chat row is the current place.
    const isNewChatActive = useThreadList((s) => !s.selectedThreadId);
    const { isSidebarOpen } = useAgentInterfaceStore((state) => ({
        isSidebarOpen: state.isSidebarOpen,
    }));
    const sidebarVisualState = useOptionalSidebarVisualState();
    const showExpandedButton = sidebarVisualState
        ? !sidebarVisualState.isCollapsedLayout
        : isSidebarOpen;
    const nav = useOptionalNav();
    const { layout } = useLayoutContext();
    const isMobile = layout === "mobile";
    const handleNewChat = (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        switchToNewThread();
        if (nav && nav.path !== undefined) {
            nav.navigate(undefined);
        }
    };
    if (isMobile) {
        return (<__OwnedElement $element={Button} $styles={[__style226]} variant="primary" size="large" iconLeft={<SquarePen size="1em"/>} className={clsx("openui-agent-new-chat-floating-button", className)} onClick={handleNewChat} aria-label="New chat">
        New Chat
      </__OwnedElement>);
    }
    return (<SidebarTooltip content="New Chat" disabled={showExpandedButton}>
      <__OwnedElement $element="button" $styles={[__style221, __style222]} type="button" className={clsx("openui-agent-new-chat-button", {
            "openui-agent-new-chat-button--collapsed": !showExpandedButton,
            "openui-agent-new-chat-button--selected": isNewChatActive,
        }, className)} onClick={handleNewChat} aria-label="New chat">
        <__OwnedElement $element="div" $styles={[__style223]} className="openui-agent-new-chat-button__icon" aria-hidden="true">
          <SquarePen size="1em"/>
        </__OwnedElement>
        <__OwnedElement $element="div" $styles={[__style224]} className="openui-agent-new-chat-button__label">New Chat</__OwnedElement>
      </__OwnedElement>
    </SidebarTooltip>);
};
