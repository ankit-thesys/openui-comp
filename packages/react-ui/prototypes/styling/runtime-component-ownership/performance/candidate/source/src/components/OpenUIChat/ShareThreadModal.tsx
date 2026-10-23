import {OwnedElement as __OwnedElement} from "../../../../runtime/adapter";
import {styles as __styles0} from "../../../../runtime/styles/AssistantMessage";
import * as Dialog from "@radix-ui/react-dialog";
import clsx from "clsx";
import { Check, Copy, Link, Loader2, X } from "lucide-react";
import { forwardRef, type ReactNode, useCallback, useState } from "react";
import { useLayoutContext } from "../../context/LayoutContext";
import { Button } from "../Button";
import { IconButton } from "../IconButton";
import { Input } from "../Input";
import { useTheme } from "../ThemeProvider/ThemeProvider";
/**
 * Props for {@link ShareThreadModal}.
 *
 * @category Components
 */
export interface ShareThreadModalProps {
    /** Modal title. Defaults to `"Share chat"`. */
    title?: string;
    /** The trigger element that opens the modal. */
    trigger: ReactNode;
    /** Async function that returns a shareable URL. */
    generateLink: () => Promise<string>;
    /** Theme class name for portal targeting. */
    themeClassName?: string;
}
const getErrorMessage = (error: Error) => {
    if (error instanceof DOMException && error.name === "NotAllowedError") {
        return "Clipboard access denied. Please allow clipboard access in your browser settings, or copy the link manually from the text area above.";
    }
    else if (error instanceof DOMException && error.name === "NotSupportedError") {
        return "Clipboard not supported. Please copy the link manually from the text area above.";
    }
    else {
        return "Failed to copy to clipboard. Please copy the link manually from the text area above.";
    }
};
/**
 * Modal dialog for generating and copying a shareable link.
 *
 * @category Components
 */
export const ShareThreadModal = forwardRef<HTMLDivElement, ShareThreadModalProps>(({ title, trigger, generateLink, themeClassName }, _ref) => {
    const { portalThemeClassName } = useTheme();
    const { layout } = useLayoutContext() || {};
    const isMobile = layout === "mobile";
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [generatedLink, setGeneratedLink] = useState<string | null>(null);
    const [hasCopied, setHasCopied] = useState(false);
    const [clipboardError, setClipboardError] = useState<string | null>(null);
    const handleGenerateLink = useCallback(async () => {
        setIsLoading(true);
        try {
            const link = await generateLink();
            setGeneratedLink(link);
        }
        catch (_error) {
            // Consumer handles errors in their generateLink callback
            console.error(_error);
        }
        finally {
            setIsLoading(false);
        }
    }, [generateLink]);
    const handleCopy = useCallback(async () => {
        if (!generatedLink)
            return;
        setClipboardError(null);
        if (!navigator.clipboard) {
            setClipboardError("Clipboard access not available. Please copy the link manually from the text area above.");
            return;
        }
        try {
            await navigator.clipboard.writeText(generatedLink);
            setHasCopied(true);
            setTimeout(() => setHasCopied(false), 2000);
        }
        catch (error) {
            console.warn("Copy to clipboard failed:", error);
            setClipboardError(getErrorMessage(error as Error));
        }
    }, [generatedLink]);
    const handleOnOpenChange = useCallback((open: boolean) => {
        setIsOpen(open);
        if (!open) {
            setTimeout(() => {
                setIsLoading(false);
                setGeneratedLink(null);
                setHasCopied(false);
                setClipboardError(null);
            }, 300);
        }
    }, []);
    const renderActionButton = () => {
        if (isLoading) {
            return (<Button onClick={handleCopy} size="medium" disabled>
            <__OwnedElement $element={Loader2} $styles={[__styles0]} className="openui-share-thread-modal__loading-icon"/>
            Generating...
          </Button>);
        }
        if (generatedLink) {
            return (<Button onClick={handleCopy} size="medium">
            {hasCopied ? <Check /> : <Copy />}
            {hasCopied ? "Copied!" : "Copy link"}
          </Button>);
        }
        return (<Button onClick={handleGenerateLink} size="medium">
          <Link />
          Generate link
        </Button>);
    };
    return (<Dialog.Root open={isOpen} onOpenChange={handleOnOpenChange}>
        <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
        <Dialog.Portal>
          <__OwnedElement $element={Dialog.Overlay} $styles={[__styles0]} className={clsx("openui-share-thread-modal__overlay", themeClassName || portalThemeClassName)}/>
          <__OwnedElement $element={Dialog.Content} $styles={[__styles0]} className={clsx("openui-share-thread-modal__content", isMobile ? "openui-share-thread-modal__content--mobile" : "", themeClassName || portalThemeClassName)}>
            <__OwnedElement $element="div" $styles={[__styles0]} className="openui-share-thread-modal__header">
              <__OwnedElement $element={Dialog.Title} $styles={[__styles0]} className="openui-share-thread-modal__title">
                {title ?? "Share chat"}
              </__OwnedElement>
              <__OwnedElement $element={IconButton} $styles={[__styles0]} icon={<X />} variant="tertiary" size="small" onClick={() => handleOnOpenChange(false)} className="openui-share-thread-modal__close-button"/>
            </__OwnedElement>

            <__OwnedElement $element="div" $styles={[__styles0]} className="openui-share-thread-modal__body">
              <__OwnedElement $element="p" $styles={[__styles0]} className="openui-share-thread-modal__description">
                This conversation may include personal information. Take a moment to check the
                content before sharing the link.
              </__OwnedElement>

              <__OwnedElement $element="div" $styles={[__styles0]} className="openui-share-thread-modal__input-section">
                <__OwnedElement $element="div" $styles={[__styles0]} className="openui-share-thread-modal__input-wrapper">
                  <__OwnedElement $element={Input} $styles={[__styles0]} value={generatedLink || ""} placeholder={generatedLink ? "" : 'Click "Generate link" to create a shareable link'} readOnly className="openui-share-thread-modal__input"/>
                  <__OwnedElement $element="div" $styles={[__styles0]} className="openui-share-thread-modal__button-container">
                    {renderActionButton()}
                  </__OwnedElement>
                </__OwnedElement>

                {clipboardError && (<__OwnedElement $element="p" $styles={[__styles0]} className="openui-share-thread-modal__error-message">{clipboardError}</__OwnedElement>)}
              </__OwnedElement>
            </__OwnedElement>
          </__OwnedElement>
        </Dialog.Portal>
      </Dialog.Root>);
});
ShareThreadModal.displayName = "ShareThreadModal";
