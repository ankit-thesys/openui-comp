import {OwnedElement as __OwnedElement} from "../../../../runtime/adapter";
import {styles as __styles0} from "../../../../runtime/styles/AssistantMessage";
import clsx from "clsx";
import React from "react";
import { useShellStore } from "../_shared/store";
/**
 * Wraps a GenUI assistant message with the assistant logo + content layout.
 *
 * Extracted from the (now-deleted) Shell so the kept `GenUIAssistantMessage`
 * keeps rendering under `AgentInterface`. `logoUrl`/`showAssistantLogo` come
 * from the library-wide shell store, which `AgentInterface`'s `Container`
 * provides via `ShellStoreProvider`.
 */
export const AssistantMessageContainer = ({ children, className, }: {
    children?: React.ReactNode;
    className?: string;
}) => {
    const { logoUrl, showAssistantLogo } = useShellStore((store) => ({
        logoUrl: store.logoUrl,
        showAssistantLogo: store.showAssistantLogo,
    }));
    return (<__OwnedElement $element="div" $styles={[__styles0]} className={clsx("openui-shell-thread-message-assistant", className, {
            "openui-shell-thread-message-assistant--without-logo": !showAssistantLogo,
        })}>
      {showAssistantLogo && (<__OwnedElement $element="img" $styles={[__styles0]} src={logoUrl} alt="Assistant" className="openui-shell-thread-message-assistant__logo"/>)}
      <__OwnedElement $element="div" $styles={[__styles0]} className="openui-shell-thread-message-assistant__content">{children}</__OwnedElement>
    </__OwnedElement>);
};
