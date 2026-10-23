import {OwnedElement as __OwnedElement} from "../../../../runtime/adapter";
import {styles as __style50} from "../../../../runtime/styles/Chat_openui_agent_welcome_screen";
import {styles as __style140} from "../../../../runtime/styles/Chat_openui_agent_welcome_screen__animated";
import {styles as __style133} from "../../../../runtime/styles/Chat_openui_agent_welcome_screen__image";
import {styles as __style139} from "../../../../runtime/styles/Chat_openui_agent_welcome_screen__with_composer";
import {styles as __style131} from "../../../../runtime/styles/Chat_openui_agent_welcome_screen__header";
import {styles as __style132} from "../../../../runtime/styles/Chat_openui_agent_welcome_screen__image_container";
import {styles as __style134} from "../../../../runtime/styles/Chat_openui_agent_welcome_screen__content";
import {styles as __style135} from "../../../../runtime/styles/Chat_openui_agent_welcome_screen__title";
import {styles as __style136} from "../../../../runtime/styles/Chat_openui_agent_welcome_screen__description";
import {styles as __style137} from "../../../../runtime/styles/Chat_openui_agent_welcome_screen__composer_starters_container";
import {styles as __style138} from "../../../../runtime/styles/Chat_openui_agent_welcome_screen__desktop_composer";
import {styles as __style52} from "../../../../runtime/styles/Chat_openui_agent_welcome_screen__desktop_starters";
import { useThread, useThreadList } from "@openuidev/react-headless";
import clsx from "clsx";
import { ReactNode, useEffect, useRef, useState } from "react";
import { ConversationStarterProps } from "../../types/ConversationStarter";
import { PromptTemplate } from "../../types/PromptTemplate";
import { useStartersFromContext } from "./_shared/startersContext";
import { isChatEmpty } from "./_shared/utils";
import { submitStarterPrompt } from "./_shared/utils/welcomePrefill";
import { DesktopWelcomeComposer, WelcomePrefillChips } from "./components";
import { ConversationStarter, ConversationStarterVariant } from "./ConversationStarter";
import { WelcomeGlow, WelcomeGlowProvider } from "./WelcomeGlow";
interface WelcomeScreenBaseProps {
    /**
     * Additional CSS class name
     */
    className?: string;
    /**
     * Plays the one-shot welcome entrance and composer glow animation.
     * @default false
     */
    glowAnimation?: boolean;
}
interface WelcomeScreenWithContentProps extends WelcomeScreenBaseProps {
    /**
     * The greeting/title text to display
     */
    title?: string;
    /**
     * Optional description text to add more context
     */
    description?: string;
    /**
     * Image to display - can be a URL object or a ReactNode
     * - { url: string }: Renders an <img> tag with default styling (64x64, object-fit: cover, rounded)
     * - ReactNode: Renders the provided element directly (for custom icons, styled images, etc.)
     */
    image?: {
        url: string;
    } | ReactNode;
    /**
     * Conversation starters to show below the composer
     */
    starters?: ConversationStarterProps[];
    /**
     * Variant of the conversation starters
     */
    starterVariant?: ConversationStarterVariant;
    /**
     * Fill-in-the-blank prompt templates, rendered as chips between the composer
     * and the starters. Clicking one drops its prompt stem into the composer
     * (instead of sending) and shows the template's completions. Selecting a
     * completion sends the completed prompt immediately.
     */
    promptTemplates?: PromptTemplate[];
    /**
     * Label of the leading tab (shown with `promptTemplates`) that lists the
     * default starters.
     * @default "Getting started"
     */
    startersTabLabel?: string;
    /**
     * Icon of the leading starters tab.
     * @default <Rocket />
     */
    startersTabIcon?: ReactNode;
    /**
     * Children are not allowed when using props-based content
     */
    children?: never;
}
interface WelcomeScreenWithChildrenProps extends WelcomeScreenBaseProps {
    /**
     * Custom content to render inside the welcome screen
     * When children are provided, title, description, and image are ignored
     */
    children: ReactNode;
    title?: never;
    description?: never;
    image?: never;
    starters?: never;
    starterVariant?: never;
    promptTemplates?: never;
    startersTabLabel?: never;
    startersTabIcon?: never;
}
export type WelcomeScreenProps = WelcomeScreenWithContentProps | WelcomeScreenWithChildrenProps;
/**
 * Type guard to check if image is a URL object
 */
const isImageUrl = (image: {
    url: string;
} | ReactNode): image is {
    url: string;
} => {
    return typeof image === "object" && image !== null && "url" in image;
};
export const WelcomeScreen = (props: WelcomeScreenProps) => {
    const { className, glowAnimation = false } = props;
    const fromCtx = useStartersFromContext();
    const ownStarters = "starters" in props ? props.starters : undefined;
    const ownVariant = "starterVariant" in props ? props.starterVariant : undefined;
    const starters = ownStarters ?? fromCtx.starters ?? [];
    const starterVariant = ownVariant ?? fromCtx.starterVariant ?? "long";
    const promptTemplates = ("promptTemplates" in props ? props.promptTemplates : undefined) ?? [];
    const hasChips = promptTemplates.length > 0;
    const messages = useThread((s) => s.messages);
    const isLoadingMessages = useThread((s) => s.isLoadingMessages);
    const isRunning = useThread((s) => s.isRunning);
    const processMessage = useThread((s) => s.processMessage);
    // Prefill-chips draft state — owned here (not in the composer) so chips can
    // write into the draft. Hooks stay unconditional; unused without chips.
    const [draft, setDraft] = useState("");
    const [selectedChip, setSelectedChip] = useState<PromptTemplate | null>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const selectedThreadId = useThreadList((s) => s.selectedThreadId);
    // The welcome renders unkeyed across thread switches, so a chip-prefilled
    // draft would otherwise leak into the next empty thread.
    useEffect(() => {
        setDraft("");
        setSelectedChip(null);
    }, [selectedThreadId]);
    // Only show when there are no messages
    if (!isChatEmpty({ isLoadingMessages, messages })) {
        return null;
    }
    // Check if children are provided
    if ("children" in props && props.children) {
        return (<WelcomeGlowProvider enabled={glowAnimation}>
        <__OwnedElement $element="div" $styles={[__style50, __style140]} className={clsx("openui-agent-welcome-screen", className, {
                "openui-agent-welcome-screen--animated": glowAnimation,
            })}>
          {props.children}
        </__OwnedElement>
      </WelcomeGlowProvider>);
    }
    // Props-based content
    const { title, description, image, startersTabLabel, startersTabIcon } = props as WelcomeScreenWithContentProps;
    const renderImage = () => {
        if (!image)
            return null;
        if (isImageUrl(image)) {
            return (<__OwnedElement $element="img" $styles={[__style133]} src={image.url} alt={title || ""} className="openui-agent-welcome-screen__image"/>);
        }
        return image;
    };
    const handleDraftChange = (value: string) => {
        setDraft(value);
        if (!value) {
            setSelectedChip(null);
        }
    };
    const handleChipClick = (chip: PromptTemplate) => {
        if (isRunning)
            return;
        setDraft(chip.prompt);
        setSelectedChip(chip);
        const input = inputRef.current;
        if (!input)
            return;
        input.focus();
        // Caret to the end once React has applied the new value.
        requestAnimationFrame(() => {
            input.setSelectionRange(chip.prompt.length, chip.prompt.length);
        });
    };
    const handleStartersClick = () => {
        if (isRunning || !selectedChip)
            return;
        // Drop the chip's stem only if the user hasn't extended it.
        if (draft === selectedChip.prompt)
            setDraft("");
        setSelectedChip(null);
    };
    const handleContextualSelect = (starter: ConversationStarterProps) => {
        submitStarterPrompt(processMessage, draft, starter.prompt);
        // Clear at submit time like the composer's own submit path — the
        // thread-switch reset above won't fire when selectedThreadId doesn't
        // change (e.g. thread creation fails on a fresh chat and it stays null),
        // and the stale stem would resurface if the welcome shows again.
        setDraft("");
        setSelectedChip(null);
    };
    return (<WelcomeGlowProvider enabled={glowAnimation}>
      <__OwnedElement $element="div" $styles={[__style50, __style139, __style140]} className={clsx("openui-agent-welcome-screen", "openui-agent-welcome-screen--with-composer", className, {
            "openui-agent-welcome-screen--animated": glowAnimation,
        })}>
        <__OwnedElement $element="div" $styles={[__style131]} className="openui-agent-welcome-screen__header">
          {image && (<__OwnedElement $element="div" $styles={[__style132]} className="openui-agent-welcome-screen__image-container">{renderImage()}</__OwnedElement>)}
          {(title || description) && (<__OwnedElement $element="div" $styles={[__style134]} className="openui-agent-welcome-screen__content">
              {title && <__OwnedElement $element="h2" $styles={[__style135]} className="openui-agent-welcome-screen__title">{title}</__OwnedElement>}
              {description && (<__OwnedElement $element="p" $styles={[__style136]} className="openui-agent-welcome-screen__description">{description}</__OwnedElement>)}
            </__OwnedElement>)}
        </__OwnedElement>
        {/* Desktop-only welcome composer */}
        <__OwnedElement $element="div" $styles={[__style137]} className="openui-agent-welcome-screen__composer-starters-container" data-has-prefill-chips={(hasChips && (draft.length === 0 || !!selectedChip)) || undefined}>
          <__OwnedElement $element="div" $styles={[__style138]} className="openui-agent-welcome-screen__desktop-composer">
            <WelcomeGlow>
              {hasChips ? (<DesktopWelcomeComposer value={draft} onChange={handleDraftChange} drafting={draft.length > 0 && !selectedChip} inputRef={inputRef}/>) : (<DesktopWelcomeComposer />)}
            </WelcomeGlow>
          </__OwnedElement>
          {hasChips ? (<WelcomePrefillChips chips={promptTemplates} starters={starters} starterVariant={starterVariant} draft={draft} selectedChip={selectedChip} onChipClick={handleChipClick} onStartersClick={handleStartersClick} startersLabel={startersTabLabel} startersIcon={startersTabIcon} onContextualSelect={handleContextualSelect} disabled={isRunning}/>) : (
        /* Desktop-only conversation starters */
        starters.length > 0 && (<__OwnedElement $element="div" $styles={[__style52]} className="openui-agent-welcome-screen__desktop-starters">
                <ConversationStarter starters={starters} variant={starterVariant}/>
              </__OwnedElement>))}
        </__OwnedElement>
      </__OwnedElement>
    </WelcomeGlowProvider>);
};
export default WelcomeScreen;
