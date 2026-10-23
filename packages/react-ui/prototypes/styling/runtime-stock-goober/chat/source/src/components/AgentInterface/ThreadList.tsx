import {useTheme as __usePortalTheme} from "../../../../../components/source/src/components/ThemeProvider";
import { OwnedElement as __OwnedElement } from "../../../../runtime/adapter";
import { styles as __style36 } from "../../../../runtime/styles/Chat_openui_agent_thread_list_skeleton";
import { styles as __style37 } from "../../../../runtime/styles/Chat_openui_agent_thread_list_skeleton__group";
import { styles as __style38 } from "../../../../runtime/styles/Chat_openui_agent_thread_list_skeleton__row";
import { styles as __style39 } from "../../../../runtime/styles/Chat_openui_agent_thread_button";
import { styles as __style40 } from "../../../../runtime/styles/Chat_openui_agent_thread_button__selected";
import { styles as __style41 } from "../../../../runtime/styles/Chat_openui_agent_thread_button__actions_open";
import { styles as __style42 } from "../../../../runtime/styles/Chat_openui_agent_thread_button_title";
import { styles as __style43 } from "../../../../runtime/styles/Chat_openui_agent_thread_button_icon";
import { styles as __style44 } from "../../../../runtime/styles/Chat_openui_agent_thread_button_label";
import { styles as __style45 } from "../../../../runtime/styles/Chat_openui_agent_thread_button_dropdown_trigger";
import { styles as __style46 } from "../../../../runtime/styles/Chat_openui_agent_thread_button_dropdown_menu";
import { styles as __style47 } from "../../../../runtime/styles/Chat_openui_agent_thread_button_dropdown_menu_item";
import { styles as __style31 } from "../../../../runtime/styles/Chat_openui_agent_thread_list";
import { styles as __style32 } from "../../../../runtime/styles/Chat_openui_agent_thread_list__mask_top";
import { styles as __style33 } from "../../../../runtime/styles/Chat_openui_agent_thread_list__mask_bottom";
import { styles as __style34 } from "../../../../runtime/styles/Chat_openui_agent_thread_list_content";
import { styles as __style35 } from "../../../../runtime/styles/Chat_openui_agent_thread_list_group";
import { useThreadList } from "@openuidev/react-headless";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import clsx from "clsx";
import { EllipsisIcon, MessageCircle, PencilIcon, Trash2Icon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLayoutContext } from "../../context/LayoutContext";
import { Button } from "../Button";
import { IconButton } from "../IconButton";
import { Skeleton } from "../Skeleton";
import { useOptionalNav } from "./_shared/navContext";
import { useAgentInterfaceStore } from "./_shared/store";
import { RenameChatDialog } from "./RenameChatDialog";
const THREAD_SKELETON_WIDTHS = ["78%", "62%", "86%", "70%"];
const ThreadListSkeleton = () => (<__OwnedElement $element="div" $styles={[__style36]} className="openui-agent-thread-list-skeleton" role="status" aria-live="polite" aria-label="Loading threads">
    <__OwnedElement $element="div" $styles={[__style37]} className="openui-agent-thread-list-skeleton__group" aria-hidden="true">
      <Skeleton height="12px" width="48px"/>
    </__OwnedElement>
    {THREAD_SKELETON_WIDTHS.map((width, index) => (<__OwnedElement $element="div" $styles={[__style38]} key={`${width}-${index}`} className="openui-agent-thread-list-skeleton__row" aria-hidden="true">
        <Skeleton height="14px" width={width}/>
      </__OwnedElement>))}
  </__OwnedElement>);
export const ThreadButton = ({ id, title, className, }: {
    id: string;
    title: string;
    className?: string;
}) => {
    const { portalThemeClassName: __portalThemeClassName } = __usePortalTheme();
    const selectThread = useThreadList((s) => s.selectThread);
    const deleteThread = useThreadList((s) => s.deleteThread);
    const selectedThreadId = useThreadList((s) => s.selectedThreadId);
    const { isSidebarOpen, setIsSidebarOpen } = useAgentInterfaceStore((state) => ({
        isSidebarOpen: state.isSidebarOpen,
        setIsSidebarOpen: state.setIsSidebarOpen,
    }));
    const { layout } = useLayoutContext();
    const nav = useOptionalNav();
    const [isActionsOpen, setIsActionsOpen] = useState(false);
    const [isRenameOpen, setIsRenameOpen] = useState(false);
    return (<__OwnedElement $element="div" $styles={[__style39, __style40, __style41]} className={clsx("openui-agent-thread-button", {
            "openui-agent-thread-button--selected": selectedThreadId === id,
            "openui-agent-thread-button--actions-open": isActionsOpen,
        }, className)}>
      <__OwnedElement $element="button" $styles={[__style42]} className="openui-agent-thread-button-title" onClick={() => {
            if (layout === "mobile") {
                setIsSidebarOpen(!isSidebarOpen);
            }
            selectThread(id);
            // Auto-clear any active route so the thread view surfaces.
            if (nav && nav.path !== undefined) {
                nav.navigate(undefined);
            }
        }}>
        <__OwnedElement $element={MessageCircle} $styles={[__style43]} className="openui-agent-thread-button-icon" size="1em" aria-hidden="true"/>
        <__OwnedElement $element="span" $styles={[__style44]} className="openui-agent-thread-button-label">{title}</__OwnedElement>
      </__OwnedElement>
      <DropdownMenu.Root open={isActionsOpen} onOpenChange={setIsActionsOpen}>
        <DropdownMenu.Trigger asChild>
          <__OwnedElement $element={IconButton} $styles={[__style45]} className="openui-agent-thread-button-dropdown-trigger" icon={<EllipsisIcon size="1em"/>} size="2-extra-small" variant="tertiary" aria-label="Thread actions"/>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <__OwnedElement $element={DropdownMenu.Content} $styles={[__style46]} className={["openui-agent-thread-button-dropdown-menu", __portalThemeClassName].join(" ")} side="bottom" align="start" sideOffset={4} onCloseAutoFocus={(e) => {
            if (isRenameOpen)
                e.preventDefault();
        }}>
            <DropdownMenu.Item asChild onSelect={() => setIsRenameOpen(true)}>
              <__OwnedElement $element={Button} $styles={[__style47]} className="openui-agent-thread-button-dropdown-menu-item" iconLeft={<PencilIcon size="1em"/>} size="extra-small" variant="tertiary">
                Rename
              </__OwnedElement>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild onSelect={() => {
            deleteThread(id);
        }}>
              <__OwnedElement $element={Button} $styles={[__style47]} buttonType="destructive" className="openui-agent-thread-button-dropdown-menu-item" iconLeft={<Trash2Icon size="1em"/>} size="extra-small" variant="tertiary">
                Delete
              </__OwnedElement>
            </DropdownMenu.Item>
          </__OwnedElement>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      <RenameChatDialog threadId={id} open={isRenameOpen} onOpenChange={setIsRenameOpen}/>
    </__OwnedElement>);
};
export const ThreadList = ({ className }: {
    className?: string;
}) => {
    const threads = useThreadList((s) => s.threads);
    const isLoadingThreads = useThreadList((s) => s.isLoadingThreads);
    const loadThreads = useThreadList((s) => s.loadThreads);
    const [hasRequestedThreads, setHasRequestedThreads] = useState(false);
    const [scrollMasks, setScrollMasks] = useState({ top: false, bottom: false });
    const listRef = useRef<HTMLDivElement>(null);
    const updateScrollMasks = useCallback(() => {
        const list = listRef.current;
        if (!list)
            return;
        const maxScrollTop = list.scrollHeight - list.clientHeight;
        const nextMasks = {
            top: maxScrollTop > 0 && list.scrollTop > 1,
            bottom: maxScrollTop > 0 && list.scrollTop < maxScrollTop - 1,
        };
        setScrollMasks((current) => current.top === nextMasks.top && current.bottom === nextMasks.bottom ? current : nextMasks);
    }, []);
    useEffect(() => {
        setHasRequestedThreads(true);
        loadThreads();
    }, []);
    useEffect(() => {
        const list = listRef.current;
        if (!list)
            return;
        updateScrollMasks();
        const resizeObserver = new ResizeObserver(updateScrollMasks);
        resizeObserver.observe(list);
        const mutationObserver = new MutationObserver(updateScrollMasks);
        mutationObserver.observe(list, { childList: true, subtree: true });
        list.addEventListener("scroll", updateScrollMasks, { passive: true });
        return () => {
            resizeObserver.disconnect();
            mutationObserver.disconnect();
            list.removeEventListener("scroll", updateScrollMasks);
        };
    }, [updateScrollMasks]);
    const showSkeleton = !hasRequestedThreads || isLoadingThreads;
    return (<__OwnedElement $element="div" $styles={[__style31, __style32, __style33]} ref={listRef} className={clsx("openui-agent-thread-list", {
            "openui-agent-thread-list--mask-top": scrollMasks.top,
            "openui-agent-thread-list--mask-bottom": scrollMasks.bottom,
        }, className)}>
      {showSkeleton ? (<ThreadListSkeleton />) : (<__OwnedElement $element="div" $styles={[__style34]} className="openui-agent-thread-list-content">
          {threads.length > 0 && <__OwnedElement $element="div" $styles={[__style35]} className="openui-agent-thread-list-group">Threads</__OwnedElement>}
          {threads.map((thread) => (<ThreadButton key={thread.id} id={thread.id} title={thread.title}/>))}
        </__OwnedElement>)}
    </__OwnedElement>);
};
