"use client";
import {OwnedElement as __OwnedElement} from "../../../../runtime/adapter";
import {styles as __styles0} from "../../../../runtime/styles/AssistantMessage";
import type { UserMessage } from "@openuidev/react-headless";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { readMessage } from "../../utils/messages";
/**
 * Extracts the first plain object from a message context.
 * The triggerAction context format is: ["action description string", { formState }]
 */
function parseContextForDisplay(context: unknown): Record<string, any> {
    if (Array.isArray(context)) {
        const stateObj = context.find((item) => item !== null && typeof item === "object" && !Array.isArray(item));
        return stateObj ?? {};
    }
    if (typeof context === "object" && context !== null) {
        return context;
    }
    return {};
}
function getEntries(state: Record<string, any>): {
    label: string;
    value: string;
}[] {
    // Detect nested (form-named) shape
    const isNested = Object.values(state).some((v) => v !== null &&
        typeof v === "object" &&
        !("value" in v) &&
        Object.values(v).some((f) => f !== null && typeof f === "object" && "value" in f));
    const entries: {
        label: string;
        value: string;
    }[] = [];
    if (isNested) {
        for (const [, fields] of Object.entries(state)) {
            if (typeof fields !== "object" || fields === null)
                continue;
            for (const [fieldName, field] of Object.entries(fields as Record<string, any>)) {
                if (field && typeof field === "object" && "value" in field) {
                    const val = field.value;
                    if (val !== undefined && val !== null && val !== "") {
                        entries.push({ label: fieldName, value: String(val) });
                    }
                }
            }
        }
    }
    else {
        for (const [fieldName, field] of Object.entries(state)) {
            if (field && typeof field === "object" && "value" in field) {
                const val = field.value;
                if (val !== undefined && val !== null && val !== "") {
                    entries.push({ label: fieldName, value: String(val) });
                }
            }
        }
    }
    return entries;
}
function FormDataAccordion({ state }: {
    state: Record<string, any>;
}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const entries = getEntries(state);
    if (entries.length === 0)
        return null;
    return (<__OwnedElement $element="div" $styles={[__styles0]} className="openui-genui-user-message__form-state">
      <__OwnedElement $element="button" $styles={[__styles0]} className="openui-genui-user-message__form-state-header" onClick={() => setIsExpanded((v) => !v)} type="button">
        <__OwnedElement $element="span" $styles={[__styles0]} className="openui-genui-user-message__form-state-label">
          Form data ({entries.length} {entries.length === 1 ? "field" : "fields"})
        </__OwnedElement>
        <__OwnedElement $element={ChevronDown} $styles={[__styles0]} size={14} className={`openui-genui-user-message__form-state-chevron${isExpanded ? " openui-genui-user-message__form-state-chevron--expanded" : ""}`}/>
      </__OwnedElement>
      {isExpanded && (<__OwnedElement $element="div" $styles={[__styles0]} className="openui-genui-user-message__form-state-content">
          {entries.map(({ label, value }) => (<__OwnedElement $element="div" $styles={[__styles0]} key={label} className="openui-genui-user-message__form-field">
              <__OwnedElement $element="span" $styles={[__styles0]} className="openui-genui-user-message__form-field-label">{label}:</__OwnedElement>
              <__OwnedElement $element="span" $styles={[__styles0]} className="openui-genui-user-message__form-field-value">{value}</__OwnedElement>
            </__OwnedElement>))}
        </__OwnedElement>)}
    </__OwnedElement>);
}
/**
 * Renders a user message, handling both plain text messages and
 * inline-formatted messages from form submissions.
 */
export const GenUIUserMessage = ({ message }: {
    message: UserMessage;
}) => {
    const rawContent = typeof message.content === "string" ? message.content : "";
    const { content: humanText, context } = readMessage(rawContent);
    const formState = parseContextForDisplay(context);
    const hasFormData = Object.keys(formState).length > 0;
    return (<__OwnedElement $element="div" $styles={[__styles0]} className="openui-shell-thread-message-user">
      <__OwnedElement $element="div" $styles={[__styles0]} className="openui-genui-user-message">
        {hasFormData && <FormDataAccordion state={formState}/>}
        <__OwnedElement $element="div" $styles={[__styles0]} className="openui-shell-thread-message-user__content">
          {humanText && <div>{humanText}</div>}
        </__OwnedElement>
      </__OwnedElement>
    </__OwnedElement>);
};
