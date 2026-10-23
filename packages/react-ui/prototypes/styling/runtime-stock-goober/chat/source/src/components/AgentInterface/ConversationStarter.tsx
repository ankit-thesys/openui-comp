import {OwnedElement as __OwnedElement} from "../../../../runtime/adapter";
import {styles as __style120} from "../../../../runtime/styles/Chat_openui_agent_conversation_starter_item_short";
import {styles as __style121} from "../../../../runtime/styles/Chat_openui_agent_conversation_starter_item_short__icon";
import {styles as __style122} from "../../../../runtime/styles/Chat_openui_agent_conversation_starter_item_short__text";
import {styles as __style128} from "../../../../runtime/styles/Chat_openui_agent_conversation_starter_item_card";
import {styles as __style129} from "../../../../runtime/styles/Chat_openui_agent_conversation_starter_item_card__icon";
import {styles as __style130} from "../../../../runtime/styles/Chat_openui_agent_conversation_starter_item_card__text";
import {styles as __style123} from "../../../../runtime/styles/Chat_openui_agent_conversation_starter_item_long";
import {styles as __style124} from "../../../../runtime/styles/Chat_openui_agent_conversation_starter_item_long__content";
import {styles as __style125} from "../../../../runtime/styles/Chat_openui_agent_conversation_starter_item_long__icon";
import {styles as __style126} from "../../../../runtime/styles/Chat_openui_agent_conversation_starter_item_long__text";
import {styles as __style127} from "../../../../runtime/styles/Chat_openui_agent_conversation_starter_item_long__arrow";
import {styles as __style51} from "../../../../runtime/styles/Chat_openui_agent_conversation_starter";
import {styles as __style116} from "../../../../runtime/styles/Chat_openui_agent_conversation_starter__long";
import {styles as __style117} from "../../../../runtime/styles/Chat_openui_agent_conversation_starter__card";
import {styles as __style115} from "../../../../runtime/styles/Chat_openui_agent_conversation_starter__short";
import {styles as __style118} from "../../../../runtime/styles/Chat_openui_agent_conversation_starter__carousel_content";
import {styles as __style119} from "../../../../runtime/styles/Chat_openui_agent_conversation_starter__separator";
import { useThread } from "@openuidev/react-headless";
import clsx from "clsx";
import { ArrowUp, Lightbulb } from "lucide-react";
import { Fragment, ReactNode, isValidElement } from "react";
import { ConversationStarterIcon, ConversationStarterProps } from "../../types/ConversationStarter";
import { Carousel, CarouselContent } from "../Carousel";
import { isChatEmpty } from "./_shared/utils";
export type ConversationStarterVariant = "short" | "long" | "card";
interface ConversationStarterItemProps extends ConversationStarterProps {
    onClick: () => void;
    variant: ConversationStarterVariant;
}
/**
 * Renders the appropriate icon based on the icon prop value
 * - undefined: Show default lightbulb icon
 * - ReactNode: Show the provided icon (use <></> or React.Fragment for no icon)
 */
const renderIcon = (icon: ConversationStarterIcon | undefined): ReactNode => {
    if (icon === undefined) {
        return <Lightbulb size={16}/>;
    }
    return icon;
};
const hasRenderableIcon = (icon: ReactNode): boolean => {
    if (icon === null || icon === undefined || icon === false) {
        return false;
    }
    if (isValidElement<{
        children?: ReactNode;
    }>(icon) && icon.type === Fragment) {
        return Boolean(icon.props.children);
    }
    return true;
};
const ConversationStarterItem = ({ displayText, onClick, variant, icon, }: ConversationStarterItemProps) => {
    const renderedIcon = renderIcon(icon);
    const shouldRenderIcon = hasRenderableIcon(renderedIcon);
    if (variant === "short") {
        return (<__OwnedElement $element="button" $styles={[__style120]} type="button" className="openui-agent-conversation-starter-item-short" onClick={onClick}>
        {shouldRenderIcon && (<__OwnedElement $element="span" $styles={[__style121]} className="openui-agent-conversation-starter-item-short__icon">{renderedIcon}</__OwnedElement>)}
        <__OwnedElement $element="span" $styles={[__style122]} className="openui-agent-conversation-starter-item-short__text">{displayText}</__OwnedElement>
      </__OwnedElement>);
    }
    if (variant === "card") {
        return (<__OwnedElement $element="button" $styles={[__style128]} type="button" className="openui-agent-conversation-starter-item-card" onClick={onClick}>
        {shouldRenderIcon && (<__OwnedElement $element="span" $styles={[__style129]} className="openui-agent-conversation-starter-item-card__icon">{renderedIcon}</__OwnedElement>)}
        <__OwnedElement $element="span" $styles={[__style130]} className="openui-agent-conversation-starter-item-card__text">{displayText}</__OwnedElement>
      </__OwnedElement>);
    }
    // Long variant (detailed list style)
    return (<__OwnedElement $element="button" $styles={[__style123]} type="button" className="openui-agent-conversation-starter-item-long" onClick={onClick}>
      <__OwnedElement $element="div" $styles={[__style124]} className="openui-agent-conversation-starter-item-long__content">
        {shouldRenderIcon && (<__OwnedElement $element="span" $styles={[__style125]} className="openui-agent-conversation-starter-item-long__icon">{renderedIcon}</__OwnedElement>)}
        <__OwnedElement $element="span" $styles={[__style126]} className="openui-agent-conversation-starter-item-long__text">{displayText}</__OwnedElement>
      </__OwnedElement>
      <__OwnedElement $element="span" $styles={[__style127]} className="openui-agent-conversation-starter-item-long__arrow">
        <ArrowUp size={16}/>
      </__OwnedElement>
    </__OwnedElement>);
};
export interface ConversationStarterContainerProps {
    starters: ConversationStarterProps[];
    className?: string;
    /**
     * Variant of the conversation starter
     * - "short": Pill-style horizontal buttons (default)
     * - "long": Vertical list items with icons and hover arrow
     * - "card": A row of equal-width cards, icon above text
     */
    variant?: ConversationStarterVariant;
    /**
     * Optional click override. When provided, replaces the default
     * send-to-thread behavior (still guarded by `isRunning`). The prefill-chips
     * welcome uses it to submit contextual starters with the prefilled draft.
     */
    onSelect?: (starter: ConversationStarterProps) => void;
}
export const ConversationStarter = ({ starters, className, variant = "short", onSelect, }: ConversationStarterContainerProps) => {
    const processMessage = useThread((s) => s.processMessage);
    const isRunning = useThread((s) => s.isRunning);
    const messages = useThread((s) => s.messages);
    const isLoadingMessages = useThread((s) => s.isLoadingMessages);
    const handleClick = (starter: ConversationStarterProps) => {
        if (isRunning)
            return;
        if (onSelect) {
            onSelect(starter);
            return;
        }
        processMessage({
            role: "user",
            content: starter.prompt,
        });
    };
    // Only show when there are no messages
    if (!isChatEmpty({ isLoadingMessages, messages })) {
        return null;
    }
    if (starters.length === 0) {
        return null;
    }
    if (variant === "short") {
        return (<__OwnedElement $element={Carousel} $styles={[__style51, __style116, __style117, __style115]} showButtons={false} className={clsx("openui-agent-conversation-starter", "openui-agent-conversation-starter--short", className)}>
        <__OwnedElement $element={CarouselContent} $styles={[__style118]} className="openui-agent-conversation-starter__carousel-content">
          {starters.map((item, index) => (<ConversationStarterItem key={`${item.displayText}-${index}`} displayText={item.displayText} prompt={item.prompt} icon={item.icon} onClick={() => handleClick(item)} variant={variant}/>))}
        </__OwnedElement>
      </__OwnedElement>);
    }
    return (<__OwnedElement $element="div" $styles={[__style51, __style116, __style117]} className={clsx("openui-agent-conversation-starter", `openui-agent-conversation-starter--${variant}`, className)}>
      {starters.map((item, index) => (<Fragment key={`${item.displayText}-${index}`}>
          {index > 0 && variant === "long" && (<__OwnedElement $element="div" $styles={[__style119]} className="openui-agent-conversation-starter__separator" aria-hidden="true"/>)}
          <ConversationStarterItem displayText={item.displayText} prompt={item.prompt} icon={item.icon} onClick={() => handleClick(item)} variant={variant}/>
        </Fragment>))}
    </__OwnedElement>);
};
export default ConversationStarter;
