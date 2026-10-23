import {OwnedElement as __OwnedElement} from "../../../../../runtime/adapter";
import {styles as __style156} from "../../../../../runtime/styles/Chat_openui_agent_ambient_loader";
import {styles as __style157} from "../../../../../runtime/styles/Chat_openui_agent_ambient_loader__status";
import {styles as __style158} from "../../../../../runtime/styles/Chat_openui_agent_ambient_loader__label";
import clsx from "clsx";
import { MascotLoader } from "./MascotLoader";
/**
 * Loading state for AgentInterface surfaces: the OpenUI mascot loader, centred
 * in whatever panel hosts it (min 280px tall), with a contextual label for
 * screen readers. Holds still under `prefers-reduced-motion`.
 *
 * The label is required on purpose — every loading surface should say what is
 * actually happening ("Loading artifacts…"), never a bare "Loading…".
 */
export const AmbientLoader = ({ label, className }: {
    label: string;
    className?: string;
}) => (<__OwnedElement $element="div" $styles={[__style156]} className={clsx("openui-agent-ambient-loader", className)} role="status" aria-live="polite">
    <__OwnedElement $element="span" $styles={[__style157]} className="openui-agent-ambient-loader__status">
      <MascotLoader size={40}/>
      {/* Announced, not shown: the mascot alone is the visible state. */}
      <__OwnedElement $element="span" $styles={[__style158]} className="openui-agent-ambient-loader__label">{label}</__OwnedElement>
    </__OwnedElement>
  </__OwnedElement>);
