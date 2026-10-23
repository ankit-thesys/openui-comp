import {OwnedElement as __OwnedElement} from "../../../../runtime/adapter";
import {styles as __style108} from "../../../../runtime/styles/Chat_openui_agent_mobile_header";
import {styles as __style110} from "../../../../runtime/styles/Chat_openui_agent_mobile_header_logo";
import {styles as __style111} from "../../../../runtime/styles/Chat_openui_agent_mobile_header_agent_name";
import {styles as __style109} from "../../../../runtime/styles/Chat_openui_agent_mobile_header_logo_container";
import {styles as __style112} from "../../../../runtime/styles/Chat_openui_agent_mobile_header_actions";
import { useThreadList } from "@openuidev/react-headless";
import clsx from "clsx";
import { PanelLeft, SquarePen } from "lucide-react";
import type { ReactNode } from "react";
import { IconButton } from "../IconButton";
import { useAgentInterfaceStore } from "./_shared/store";
export interface MobileHeaderProps {
    className?: string;
    logo?: ReactNode;
    agentName?: ReactNode;
    menuButton?: ReactNode | false;
    newChatButton?: ReactNode | false;
    actions?: ReactNode;
    children?: ReactNode;
}
export const MobileHeader = ({ className, logo, agentName: agentNameProp, menuButton, newChatButton, actions, children, }: MobileHeaderProps) => {
    const switchToNewThread = useThreadList((s) => s.switchToNewThread);
    const { agentName: ctxAgentName, setIsSidebarOpen } = useAgentInterfaceStore((state) => ({
        agentName: state.agentName,
        setIsSidebarOpen: state.setIsSidebarOpen,
    }));
    if (children != null) {
        if (typeof process !== "undefined" &&
            process.env?.["NODE_ENV"] !== "production" &&
            (logo !== undefined ||
                agentNameProp !== undefined ||
                menuButton !== undefined ||
                newChatButton !== undefined ||
                actions !== undefined)) {
            console.warn("[AgentInterface] <AgentInterface.MobileHeader> received both children and override props; children win.");
        }
        return <__OwnedElement $element="div" $styles={[__style108, __style110]} className={clsx("openui-agent-mobile-header", className)}>{children}</__OwnedElement>;
    }
    const defaultMenuButton = (<IconButton size="medium" icon={<PanelLeft size="1em" strokeWidth={2}/>} onClick={() => setIsSidebarOpen(true)} variant="tertiary" aria-label="Open sidebar"/>);
    const defaultAgentName = (<__OwnedElement $element="span" $styles={[__style111]} className="openui-agent-mobile-header-agent-name">{ctxAgentName}</__OwnedElement>);
    // The same filled round button as the collapsed rail's New chat.
    const defaultNewChatButton = (<IconButton size="medium" icon={<SquarePen size="1em"/>} className="openui-agent-mobile-header-new-chat" onClick={switchToNewThread} variant="primary" aria-label="New chat"/>);
    return (<__OwnedElement $element="div" $styles={[__style108, __style110]} className={clsx("openui-agent-mobile-header", className)}>
      {menuButton === false ? null : (menuButton ?? defaultMenuButton)}
      <__OwnedElement $element="div" $styles={[__style109]} className="openui-agent-mobile-header-logo-container">
        {logo}
        {agentNameProp ?? defaultAgentName}
      </__OwnedElement>
      <__OwnedElement $element="div" $styles={[__style112]} className="openui-agent-mobile-header-actions">
        {newChatButton === false ? null : (newChatButton ?? defaultNewChatButton)}
        {actions}
      </__OwnedElement>
    </__OwnedElement>);
};
