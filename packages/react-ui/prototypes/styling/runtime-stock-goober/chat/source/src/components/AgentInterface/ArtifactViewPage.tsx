import {OwnedElement as __OwnedElement} from "../../../../runtime/adapter";
import {styles as __style189} from "../../../../runtime/styles/Chat_openui_agent_artifact_view__error";
import {styles as __style190} from "../../../../runtime/styles/Chat_openui_agent_artifact_view__loading";
import {styles as __style185} from "../../../../runtime/styles/Chat_openui_agent_artifact_view";
import {styles as __style186} from "../../../../runtime/styles/Chat_openui_agent_artifact_view__header";
import {styles as __style187} from "../../../../runtime/styles/Chat_openui_agent_artifact_view__title";
import {styles as __style188} from "../../../../runtime/styles/Chat_openui_agent_artifact_view__content";
import { lookupArtifactRendererByType, useArtifactRendererRegistry, useArtifactStorage, useThreadList, type Artifact, type ArtifactRendererControls, } from "@openuidev/react-headless";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../Button";
import { IconButton } from "../IconButton";
import { artifactListPath } from "./_shared/artifactPaths";
import { useNav } from "./_shared/navContext";
import { MascotLoader } from "./components/MascotLoader";
/**
 * Full-page artifact view (reserved path `artifacts/{category}/{id}`),
 * rendered independent of any thread.
 *
 * Fetches the artifact via `ArtifactStorage.get`, resolves the renderer by
 * `artifact.type`, runs the renderer's `parser` with
 * `{ args: undefined, response: artifact.content }` (stored content must have
 * the same shape as the tool-call response), and renders `actual` filling the
 * page. No DetailedView involvement.
 *
 * `controls.close` navigates back to the category list; `open`/`toggle` are
 * no-ops (the page IS the open state). `isStreaming` is always `false`.
 *
 * Internal — rendered by AgentInterface for the reserved `artifacts/` prefix.
 *
 * @internal
 */
export const ArtifactViewPage = ({ artifactId, categoryName, }: {
    artifactId: string;
    categoryName?: string;
}) => {
    const storage = useArtifactStorage();
    const registry = useArtifactRendererRegistry();
    const { navigate } = useNav();
    const selectThread = useThreadList((s) => s.selectThread);
    const [artifact, setArtifact] = useState<Artifact | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const requestIdRef = useRef(0);
    useEffect(() => {
        if (!storage)
            return;
        const requestId = ++requestIdRef.current;
        setArtifact(null);
        setError(null);
        storage
            .get(artifactId)
            .then((a) => {
            if (requestId !== requestIdRef.current)
                return;
            setArtifact(a);
        })
            .catch((e) => {
            if (requestId !== requestIdRef.current)
                return;
            setError(e instanceof Error ? e : new Error(String(e)));
        });
    }, [storage, artifactId]);
    const backToList = () => navigate(artifactListPath(categoryName));
    const goToThread = () => {
        if (!artifact)
            return;
        selectThread(artifact.threadId);
        navigate(undefined);
    };
    const renderer = useMemo(() => {
        if (!artifact || !registry)
            return null;
        return lookupArtifactRendererByType(registry, artifact.type);
    }, [artifact, registry]);
    const parsed = useMemo(() => {
        if (!artifact || !renderer)
            return null;
        return renderer.parser({ args: undefined, response: artifact.content }, { isStreaming: false });
    }, [artifact, renderer]);
    const controls: ArtifactRendererControls = {
        isActive: true,
        isStreaming: false,
        open: () => { },
        close: backToList,
        toggle: backToList,
    };
    let body: React.ReactNode;
    if (!storage) {
        body = null;
    }
    else if (error) {
        body = (<__OwnedElement $element="div" $styles={[__style189]} className="openui-agent-artifact-view__error">
        Failed to load artifact: {error.message}
      </__OwnedElement>);
    }
    else if (!artifact) {
        body = (<__OwnedElement $element="div" $styles={[__style190]} className="openui-agent-artifact-view__loading">
        <MascotLoader size={40}/>
      </__OwnedElement>);
    }
    else if (!renderer) {
        body = (<__OwnedElement $element="div" $styles={[__style189]} className="openui-agent-artifact-view__error">
        No renderer registered for artifact type "{artifact.type}".
      </__OwnedElement>);
    }
    else if (!parsed) {
        body = (<__OwnedElement $element="div" $styles={[__style189]} className="openui-agent-artifact-view__error">
        The renderer could not parse this artifact's content.
      </__OwnedElement>);
    }
    else {
        body = renderer.actual(parsed.props, controls);
    }
    return (<__OwnedElement $element="div" $styles={[__style185]} className="openui-agent-artifact-view">
      <__OwnedElement $element="div" $styles={[__style186]} className="openui-agent-artifact-view__header">
        <IconButton variant="tertiary" size="small" icon={<ArrowLeft size="1em"/>} aria-label="Back" onClick={backToList}/>
        <__OwnedElement $element="span" $styles={[__style187]} className="openui-agent-artifact-view__title">{artifact?.title ?? ""}</__OwnedElement>
        {artifact && (<Button variant="tertiary" size="small" iconLeft={<MessageSquare size={14}/>} onClick={goToThread}>
            Go to thread
          </Button>)}
      </__OwnedElement>
      <__OwnedElement $element="div" $styles={[__style188]} className="openui-agent-artifact-view__content">{body}</__OwnedElement>
    </__OwnedElement>);
};
