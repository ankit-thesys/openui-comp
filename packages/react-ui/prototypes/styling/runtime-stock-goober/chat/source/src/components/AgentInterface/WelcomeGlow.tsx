import {OwnedElement as __OwnedElement} from "../../../../runtime/adapter";
import {styles as __style141} from "../../../../runtime/styles/Chat_openui_agent_welcome_glow";
import {styles as __style142} from "../../../../runtime/styles/Chat_openui_agent_welcome_glow__dither";
import clsx from "clsx";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { WelcomeDither } from "./WelcomeDither";
const WelcomeGlowContext = createContext(false);
// Per page load, shared by every WelcomeGlow.
let ditherPlayed = false;
export const WelcomeGlowProvider = ({ children, enabled, }: {
    children: ReactNode;
    enabled: boolean;
}) => <WelcomeGlowContext.Provider value={enabled}>{children}</WelcomeGlowContext.Provider>;
export interface WelcomeGlowProps {
    children: ReactNode;
    className?: string;
}
/**
 * Positions the optional welcome glow around a custom composer. The animation
 * is enabled by the nearest <AgentInterface.Welcome glowAnimation> ancestor.
 */
export const WelcomeGlow = ({ children, className }: WelcomeGlowProps) => {
    const enabled = useContext(WelcomeGlowContext);
    // The dither greets the first home screen of a visit only: not every new
    // chat or thread switch that lands back on the welcome. Unmounting it once
    // played also stops the frame loop.
    const [ditherDone, setDitherDone] = useState(ditherPlayed);
    // Marked as soon as it starts, so leaving mid-animation doesn't replay it.
    useEffect(() => {
        if (enabled)
            ditherPlayed = true;
    }, [enabled]);
    if (!enabled) {
        return <>{children}</>;
    }
    return (<__OwnedElement $element="div" $styles={[__style141]} className={clsx("openui-agent-welcome-glow", className)}>
      {!ditherDone && (<__OwnedElement $element={WelcomeDither} $styles={[__style142]} className="openui-agent-welcome-glow__dither" onDone={() => setDitherDone(true)}/>)}
      {children}
    </__OwnedElement>);
};
