import {OwnedElement as __OwnedElement} from "../../../../../runtime/adapter";
import {styles as __style149} from "../../../../../runtime/styles/Chat_openui_agent_prefill_chip";
import {styles as __style150} from "../../../../../runtime/styles/Chat_openui_agent_prefill_chip__icon";
import {styles as __style151} from "../../../../../runtime/styles/Chat_openui_agent_prefill_chip__label";
import {styles as __style52} from "../../../../../runtime/styles/Chat_openui_agent_welcome_screen__desktop_starters";
import {styles as __style146} from "../../../../../runtime/styles/Chat_openui_agent_welcome_screen__starters_layers";
import {styles as __style147} from "../../../../../runtime/styles/Chat_openui_agent_welcome_screen__starters_layer";
import {styles as __style148} from "../../../../../runtime/styles/Chat_openui_agent_welcome_screen__chip_row";
import { Rocket } from "lucide-react";
import { ReactNode } from "react";
import { ConversationStarterProps } from "../../../types/ConversationStarter";
import { PromptTemplate } from "../../../types/PromptTemplate";
import { ConversationStarter, ConversationStarterVariant } from "../ConversationStarter";
interface PrefillTabProps {
    label: string;
    icon?: ReactNode;
    selected: boolean;
    disabled: boolean;
    onClick: () => void;
}
const PrefillTab = ({ label, icon, selected, disabled, onClick }: PrefillTabProps) => (<__OwnedElement $element="button" $styles={[__style149]} type="button" role="tab" aria-selected={selected} className="openui-agent-prefill-chip" disabled={disabled} onClick={onClick}>
    {icon && (<__OwnedElement $element="span" $styles={[__style150]} className="openui-agent-prefill-chip__icon" aria-hidden>
        {icon}
      </__OwnedElement>)}
    <__OwnedElement $element="span" $styles={[__style151]} className="openui-agent-prefill-chip__label">{label}</__OwnedElement>
  </__OwnedElement>);
export interface WelcomePrefillChipsProps {
    chips: PromptTemplate[];
    starters: ConversationStarterProps[];
    starterVariant: ConversationStarterVariant;
    draft: string;
    selectedChip: PromptTemplate | null;
    onChipClick: (chip: PromptTemplate) => void;
    /** Selects the leading starters tab (clears a chip selection). */
    onStartersClick: () => void;
    onContextualSelect: (starter: ConversationStarterProps) => void;
    disabled: boolean;
    /** Label of the leading tab that shows the default starters. */
    startersLabel?: string;
    /** Icon of the leading starters tab. */
    startersIcon?: ReactNode;
}
/**
 * Tab row + starters for the prefill-chips welcome. A leading tab shows the
 * default starters; each prompt template is a tab that drops its stem into the
 * composer and swaps in its completions, which submit the completed prompt
 * (see WelcomeScreen). Free typing hides the row via `visibility` so the
 * layout doesn't jump.
 */
export const WelcomePrefillChips = ({ chips, starters, starterVariant, draft, selectedChip, onChipClick, onStartersClick, onContextualSelect, disabled, startersLabel = "Getting started", startersIcon = <Rocket size={14}/>, }: WelcomePrefillChipsProps) => {
    const isFreeTyping = draft.length > 0 && !selectedChip;
    const contextualVariant: ConversationStarterVariant = starterVariant === "card" ? "card" : "long";
    return (<__OwnedElement $element="div" $styles={[__style52, __style146]} className="openui-agent-welcome-screen__desktop-starters openui-agent-welcome-screen__starters-layers">
      <__OwnedElement $element="div" $styles={[__style147]} className="openui-agent-welcome-screen__starters-layer" data-hidden={isFreeTyping || undefined} aria-hidden={isFreeTyping || undefined}>
        <__OwnedElement $element="div" $styles={[__style148]} className="openui-agent-welcome-screen__chip-row" role="tablist">
          {starters.length > 0 && (<PrefillTab label={startersLabel} icon={startersIcon} selected={!selectedChip} disabled={disabled} onClick={onStartersClick}/>)}
          {chips.map((chip, index) => (<PrefillTab key={`${chip.displayText}-${index}`} label={chip.displayText} icon={chip.icon} selected={selectedChip === chip} disabled={disabled} onClick={() => onChipClick(chip)}/>))}
        </__OwnedElement>
        {selectedChip ? (<ConversationStarter starters={selectedChip.completions} variant={contextualVariant} onSelect={onContextualSelect}/>) : (<ConversationStarter starters={starters} variant={starterVariant}/>)}
      </__OwnedElement>
    </__OwnedElement>);
};
export default WelcomePrefillChips;
