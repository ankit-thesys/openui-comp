import {OwnedElement as __OwnedElement} from "../../../../runtime/adapter";
import {styles as __style209} from "../../../../runtime/styles/Chat_openui_agent_workspace_sidebar__overlay";
import {styles as __style210} from "../../../../runtime/styles/Chat_openui_agent_workspace_sidebar__overlay__collapsed";
import {styles as __style191} from "../../../../runtime/styles/Chat_openui_agent_workspace_sidebar";
import {styles as __style195} from "../../../../runtime/styles/Chat_openui_agent_workspace_sidebar__tabs";
import {styles as __style196} from "../../../../runtime/styles/Chat_openui_agent_workspace_sidebar__tab_indicator";
import {styles as __style197} from "../../../../runtime/styles/Chat_openui_agent_workspace_sidebar__tab";
import {styles as __style198} from "../../../../runtime/styles/Chat_openui_agent_workspace_sidebar__tab__active";
import {styles as __style200} from "../../../../runtime/styles/Chat_openui_agent_workspace_sidebar__empty";
import {styles as __style192} from "../../../../runtime/styles/Chat_openui_agent_workspace_sidebar__collapsed";
import {styles as __style193} from "../../../../runtime/styles/Chat_openui_agent_workspace_sidebar__header";
import {styles as __style194} from "../../../../runtime/styles/Chat_openui_agent_workspace_sidebar__title";
import {styles as __style199} from "../../../../runtime/styles/Chat_openui_agent_workspace_sidebar__content";
import {styles as __style201} from "../../../../runtime/styles/Chat_openui_agent_workspace_sidebar__section_empty";
import {styles as __style202} from "../../../../runtime/styles/Chat_openui_agent_workspace_sidebar__list";
import {styles as __style203} from "../../../../runtime/styles/Chat_openui_agent_workspace_sidebar__item";
import {styles as __style204} from "../../../../runtime/styles/Chat_openui_agent_workspace_sidebar__item__active";
import {styles as __style205} from "../../../../runtime/styles/Chat_openui_agent_workspace_sidebar__item_icon";
import {styles as __style207} from "../../../../runtime/styles/Chat_openui_agent_workspace_sidebar__item_body";
import {styles as __style206} from "../../../../runtime/styles/Chat_openui_agent_workspace_sidebar__item_label";
import {styles as __style208} from "../../../../runtime/styles/Chat_openui_agent_workspace_sidebar__item_meta";
import { artifactViewId, useActiveDetailedView, useArtifactCategories, useArtifactList, useDetailedView, useDetailedViewStore, type ArtifactEntry, } from "@openuidev/react-headless";
import clsx from "clsx";
import { useEffect, type ReactNode } from "react";
import { useLayoutContext } from "../../context/LayoutContext";
import { formatArtifactUpdatedAt, useArtifactIcon, useArtifactTypeLabel, } from "./ArtifactBrowserPage";
import { useAgentInterfaceLabels } from "./_shared/labelsContext";
import { useAgentInterfaceStore } from "./_shared/store";
export interface WorkspaceProps {
    className?: string;
    /** Mode C — replaces the entire rail (you own the chrome and visibility). */
    children?: ReactNode;
}
/**
 * Per-thread workspace rail (right edge of the layout) listing the artifacts
 * registered in the active thread.
 *
 * - Renders nothing while the registry is empty — drop-in users without
 *   artifact renderers never see it. Visibility is controlled by the header
 *   workspace toggle.
 * - Lists every registered artifact, grouped into one section per
 *   `artifactCategories` entry configured on `<AgentInterface>`; a single
 *   "Artifacts" section lists everything when no categories are configured.
 *   There are no tabs or filtering — the rail shows it all.
 * - Item click activates the corresponding DetailedView; the rail closes while
 *   a DetailedView is open.
 * - Rendered only in the thread view — hidden on Route pages and the
 *   artifact browser. Hidden on mobile.
 *
 * Modes: A (omit → default above) and C (children replace the rail).
 *
 * @category Components
 */
export const Workspace = ({ className, children }: WorkspaceProps) => {
    if (children != null)
        return <>{children}</>;
    return <DefaultWorkspace className={className}/>;
};
const DefaultWorkspace = ({ className }: {
    className?: string;
}) => {
    const { isWorkspaceOpen, setIsWorkspaceOpen } = useAgentInterfaceStore((state) => ({
        isWorkspaceOpen: state.isWorkspaceOpen,
        setIsWorkspaceOpen: state.setIsWorkspaceOpen,
    }));
    const { isDetailedViewActive } = useActiveDetailedView();
    const { layout } = useLayoutContext();
    const categories = useArtifactCategories();
    const all = useArtifactList();
    const { workspaceToggle } = useAgentInterfaceLabels();
    const entries = latestPerId(all);
    const shouldShowWorkspace = isWorkspaceOpen && !isDetailedViewActive;
    useEffect(() => {
        if (isDetailedViewActive && isWorkspaceOpen) {
            setIsWorkspaceOpen(false);
        }
    }, [isDetailedViewActive, isWorkspaceOpen, setIsWorkspaceOpen]);
    // Nothing renders while the registry is empty; the header controls open state.
    if (entries.length === 0)
        return null;
    return (<>
      {layout === "mobile" && (<__OwnedElement $element="div" $styles={[__style209, __style210]} className={clsx("openui-agent-workspace-sidebar__overlay", {
                "openui-agent-workspace-sidebar__overlay--collapsed": !shouldShowWorkspace,
            })} onClick={() => setIsWorkspaceOpen(false)}/>)}
      <__OwnedElement $element="div" $styles={[__style191, __style195, __style196, __style197, __style198, __style200, __style192]} className={clsx("openui-agent-workspace-sidebar", { "openui-agent-workspace-sidebar--collapsed": !shouldShowWorkspace }, className)}>
        <__OwnedElement $element="div" $styles={[__style193]} className="openui-agent-workspace-sidebar__header">
          <__OwnedElement $element="h2" $styles={[__style194]} className="openui-agent-workspace-sidebar__title">{workspaceToggle}</__OwnedElement>
        </__OwnedElement>
        <__OwnedElement $element="div" $styles={[__style199]} className="openui-agent-workspace-sidebar__content">
          {categories.length > 0 ? (<WorkspaceSections categories={categories} entries={entries}/>) : (<WorkspaceSection entries={entries}/>)}
        </__OwnedElement>
      </__OwnedElement>
    </>);
};
const WorkspaceSections = ({ categories, entries, }: {
    categories: ReturnType<typeof useArtifactCategories>;
    entries: ReadonlyArray<ArtifactEntry>;
}) => {
    // Show every category that has registered entries — no tab filtering.
    const visibleCategories = categories.filter((category) => entries.some((entry) => entryMatchesCategory(entry, category)));
    // Entries matching no configured category are still shown (never dropped),
    // in a fallback section after the categorized ones.
    const uncategorized = entries.filter((entry) => !categories.some((category) => entryMatchesCategory(entry, category)));
    return (<>
      {visibleCategories.map((category) => (<WorkspaceSection key={category.name} entries={entries.filter((entry) => entryMatchesCategory(entry, category))}/>))}
      {uncategorized.length > 0 && (<WorkspaceSection key="__uncategorized__" entries={uncategorized}/>)}
    </>);
};
const WorkspaceSection = ({ entries, emptyHint, }: {
    entries: ReadonlyArray<ArtifactEntry>;
    emptyHint?: string;
}) => {
    if (entries.length === 0) {
        if (!emptyHint)
            return null;
        return <__OwnedElement $element="div" $styles={[__style201]} className="openui-agent-workspace-sidebar__section-empty">{emptyHint}</__OwnedElement>;
    }
    return (<__OwnedElement $element="ul" $styles={[__style202]} className="openui-agent-workspace-sidebar__list">
      {entries.map((entry) => (<WorkspaceItem key={entry.id} entry={entry}/>))}
    </__OwnedElement>);
};
const WorkspaceItem = ({ entry }: {
    entry: ArtifactEntry;
}) => {
    const viewId = artifactViewId(entry.id, entry.version);
    const { isActive } = useDetailedView(viewId);
    const store = useDetailedViewStore();
    const onClick = () => store.getState().setActiveDetailedView(viewId);
    const icon = useArtifactIcon(entry.type);
    const updatedAt = formatArtifactUpdatedAt(entry.updatedAt);
    const metadata = [useArtifactTypeLabel(entry.type), updatedAt].filter(Boolean).join(" · ");
    return (<li>
      <__OwnedElement $element="button" $styles={[__style203, __style204]} type="button" onClick={onClick} aria-pressed={isActive} className={clsx("openui-agent-workspace-sidebar__item", {
            "openui-agent-workspace-sidebar__item--active": isActive,
        })}>
        <__OwnedElement $element="span" $styles={[__style205]} className="openui-agent-workspace-sidebar__item-icon">{icon}</__OwnedElement>
        <__OwnedElement $element="span" $styles={[__style207]} className="openui-agent-workspace-sidebar__item-body">
          <__OwnedElement $element="span" $styles={[__style206]} className="openui-agent-workspace-sidebar__item-label">{entry.heading}</__OwnedElement>
          {metadata && (<__OwnedElement $element="span" $styles={[__style208]} className="openui-agent-workspace-sidebar__item-meta">{metadata}</__OwnedElement>)}
        </__OwnedElement>
      </__OwnedElement>
    </li>);
};
/** Picks the latest version (highest version number, kept as the last element after sort). */
function latestPerId<T extends {
    id: string;
    version: number;
}>(registry: Record<string, T[]>): T[] {
    return Object.values(registry)
        .map((versions) => versions[versions.length - 1])
        .filter((entry): entry is T => entry !== undefined);
}
type ArtifactCategory = ReturnType<typeof useArtifactCategories>[number];
function entryMatchesCategory(entry: ArtifactEntry, category: ArtifactCategory) {
    return category.filter.type.includes(entry.type);
}
