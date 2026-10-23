import {useTheme as __usePortalTheme} from "../../../../../components/source/src/components/ThemeProvider";
import { OwnedElement as __OwnedElement } from "../../../../runtime/adapter";
import { styles as __style102 } from "../../../../runtime/styles/Chat_openui_agent_rename_dialog__overlay";
import { styles as __style103 } from "../../../../runtime/styles/Chat_openui_agent_rename_dialog";
import { styles as __style104 } from "../../../../runtime/styles/Chat_openui_agent_rename_dialog__form";
import { styles as __style105 } from "../../../../runtime/styles/Chat_openui_agent_rename_dialog__title";
import { styles as __style106 } from "../../../../runtime/styles/Chat_openui_agent_rename_dialog__input";
import { styles as __style107 } from "../../../../runtime/styles/Chat_openui_agent_rename_dialog__actions";
import { useThreadList } from "@openuidev/react-headless";
import * as Dialog from "@radix-ui/react-dialog";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Button } from "../Button";
import { Input } from "../Input";
export interface RenameChatDialogProps {
    /** The chat (thread) to rename. */
    threadId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}
/**
 * Small dialog for renaming a chat: a title field prefilled with the current
 * name, Save / Cancel. Enter saves, Escape closes. Shared by the sidebar thread
 * menu and the ThreadHeader actions menu.
 */
export const RenameChatDialog = ({ threadId, open, onOpenChange }: RenameChatDialogProps) => {
    const { portalThemeClassName: __portalThemeClassName } = __usePortalTheme();
    const thread = useThreadList((s) => s.threads.find((t) => t.id === threadId));
    const updateThread = useThreadList((s) => s.updateThread);
    const [title, setTitle] = useState(thread?.title ?? "");
    const inputRef = useRef<HTMLInputElement>(null);
    // Re-seed the field from the current title each time the dialog opens.
    useEffect(() => {
        if (open)
            setTitle(thread?.title ?? "");
    }, [open, thread?.title]);
    const trimmed = title.trim();
    const canSave = !!thread && trimmed.length > 0 && trimmed !== thread.title;
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!thread)
            return;
        if (canSave)
            updateThread({ ...thread, title: trimmed });
        onOpenChange(false);
    };
    return (<Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <__OwnedElement $element={Dialog.Overlay} $styles={[__style102]} className={["openui-agent-rename-dialog__overlay", __portalThemeClassName].join(" ")}/>
        <__OwnedElement $element={Dialog.Content} $styles={[__style103]} className={["openui-agent-rename-dialog", __portalThemeClassName].join(" ")} aria-describedby={undefined} onOpenAutoFocus={(e) => {
            e.preventDefault();
            inputRef.current?.focus();
            inputRef.current?.select();
        }}>
          <__OwnedElement $element="form" $styles={[__style104]} className="openui-agent-rename-dialog__form" onSubmit={handleSubmit}>
            <__OwnedElement $element={Dialog.Title} $styles={[__style105]} className="openui-agent-rename-dialog__title">Rename chat</__OwnedElement>
            <__OwnedElement $element={Input} $styles={[__style106]} ref={inputRef} value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Chat title" placeholder="Chat title" className="openui-agent-rename-dialog__input"/>
            <__OwnedElement $element="div" $styles={[__style107]} className="openui-agent-rename-dialog__actions">
              <Dialog.Close asChild>
                <Button type="button" variant="tertiary" size="small">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button type="submit" variant="primary" size="small" disabled={!canSave}>
                Save
              </Button>
            </__OwnedElement>
          </__OwnedElement>
        </__OwnedElement>
      </Dialog.Portal>
    </Dialog.Root>);
};
export default RenameChatDialog;
