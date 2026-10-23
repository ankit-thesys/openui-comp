import {useTheme as __usePortalTheme} from "../../../../../openui-runtime-owned-components/source/src/components/ThemeProvider";
import { OwnedElement as __OwnedElement } from "../../../../runtime/adapter";
import { styles as __style96 } from "../../../../runtime/styles/Chat_openui_agent_thread_header__title";
import { styles as __style97 } from "../../../../runtime/styles/Chat_openui_agent_thread_header__title_text";
import { styles as __style98 } from "../../../../runtime/styles/Chat_openui_agent_thread_header__actions_trigger";
import { styles as __style99 } from "../../../../runtime/styles/Chat_openui_agent_thread_header__actions_menu";
import { styles as __style100 } from "../../../../runtime/styles/Chat_openui_agent_thread_header__actions_item";
import { styles as __style101 } from "../../../../runtime/styles/Chat_openui_agent_thread_header__actions_item__destructive";
import { styles as __style92 } from "../../../../runtime/styles/Chat_openui_agent_thread_header";
import { styles as __style93 } from "../../../../runtime/styles/Chat_openui_agent_thread_header__start";
import { styles as __style94 } from "../../../../runtime/styles/Chat_openui_agent_thread_header__center";
import { styles as __style95 } from "../../../../runtime/styles/Chat_openui_agent_thread_header__end";
import { useThreadList } from "@openuidev/react-headless";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import clsx from "clsx";
import { EllipsisIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { IconButton } from "../IconButton";
import { RenameChatDialog } from "./RenameChatDialog";
import { WorkspaceToggleButton } from "./Thread";
export interface ThreadHeaderProps {
    /** Content pinned to the leading edge (e.g. a model switcher). */
    start?: ReactNode;
    /** Content centred in the header; defaults to the selected chat's title. */
    center?: ReactNode;
    /** Content pinned to the trailing edge, before the chat actions menu. */
    end?: ReactNode;
    /** Shorthand for `end`, so existing trailing children keep their place. */
    children?: ReactNode;
    /**
     * Show the selected chat's title in the centre (when `center` is unset).
     * @default true
     */
    showChatTitle?: boolean;
    /**
     * Show a trailing "…" menu with chat actions for the selected chat: Delete,
     * plus Rename while the chat title is shown (`showChatTitle` and no
     * `center`).
     * @default true
     */
    showChatActions?: boolean;
    className?: string;
}
const useSelectedThread = () => {
    const selectedThreadId = useThreadList((s) => s.selectedThreadId);
    const threads = useThreadList((s) => s.threads);
    if (!selectedThreadId)
        return null;
    return threads.find((thread) => thread.id === selectedThreadId) ?? null;
};
const ChatTitle = ({ title }: {
    title: string;
}) => (<__OwnedElement $element="div" $styles={[__style96]} className="openui-agent-thread-header__title" title={title}>
    <__OwnedElement $element="span" $styles={[__style97]} className="openui-agent-thread-header__title-text">{title}</__OwnedElement>
  </__OwnedElement>);
const ChatActions = ({ threadId, canRename }: {
    threadId: string;
    canRename: boolean;
}) => {
    const { portalThemeClassName: __portalThemeClassName } = __usePortalTheme();
    const deleteThread = useThreadList((s) => s.deleteThread);
    const [isRenameOpen, setIsRenameOpen] = useState(false);
    return (<>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <__OwnedElement $element={IconButton} $styles={[__style98]} className="openui-agent-thread-header__actions-trigger" icon={<EllipsisIcon size="1em"/>} size="small" variant="tertiary" aria-label="Chat actions"/>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <__OwnedElement $element={DropdownMenu.Content} $styles={[__style99]} className={["openui-agent-thread-header__actions-menu", __portalThemeClassName].join(" ")} side="bottom" align="end" sideOffset={4} 
    // Let the rename dialog keep focus instead of returning it here.
    onCloseAutoFocus={(e) => {
            if (isRenameOpen)
                e.preventDefault();
        }}>
            {canRename && (<__OwnedElement $element={DropdownMenu.Item} $styles={[__style100]} className="openui-agent-thread-header__actions-item" onSelect={() => setIsRenameOpen(true)}>
                <PencilIcon size={14} aria-hidden/>
                Rename
              </__OwnedElement>)}
            <__OwnedElement $element={DropdownMenu.Item} $styles={[__style100, __style101]} className="openui-agent-thread-header__actions-item openui-agent-thread-header__actions-item--destructive" onSelect={() => deleteThread(threadId)}>
              <Trash2Icon size={14} aria-hidden/>
              Delete
            </__OwnedElement>
          </__OwnedElement>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      {canRename && (<RenameChatDialog threadId={threadId} open={isRenameOpen} onOpenChange={setIsRenameOpen}/>)}
    </>);
};
/**
 * Desktop header for the thread card. Its 32px row shares a vertical centre
 * with the sidebar's logo row, and its leading inset matches its top inset,
 * so controls placed here line up with the rail's brand mark. Lays out
 * `start` content on the left, the selected chat's title in the centre, and
 * the workspace toggle plus a chat actions menu on the right. Hidden on
 * mobile (use `MobileHeader`).
 */
export const ThreadHeader = ({ start, center, end, children, showChatTitle = true, showChatActions = true, className, }: ThreadHeaderProps) => {
    const thread = useSelectedThread();
    // Rename only edits what the header shows, so it goes when the title does.
    const isTitleShown = center === undefined && showChatTitle;
    return (<__OwnedElement $element="header" $styles={[__style92]} className={clsx("openui-agent-thread-header", className)}>
      <__OwnedElement $element="div" $styles={[__style93]} className="openui-agent-thread-header__start">{start}</__OwnedElement>
      <__OwnedElement $element="div" $styles={[__style94]} className="openui-agent-thread-header__center">
        {center ?? (isTitleShown && thread?.title && <ChatTitle title={thread.title}/>)}
      </__OwnedElement>
      <__OwnedElement $element="div" $styles={[__style95]} className="openui-agent-thread-header__end">
        {end ?? children}
        <WorkspaceToggleButton />
        {showChatActions && thread && <ChatActions threadId={thread.id} canRename={isTitleShown}/>}
      </__OwnedElement>
    </__OwnedElement>);
};
export default ThreadHeader;
