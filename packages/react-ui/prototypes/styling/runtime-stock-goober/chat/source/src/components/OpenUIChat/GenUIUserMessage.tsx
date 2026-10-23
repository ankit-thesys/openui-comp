"use client";
import {OwnedElement as __OwnedElement} from "../../../../runtime/adapter";
import {styles as __style83} from "../../../../runtime/styles/Chat_openui_genui_user_message__form_state";
import {styles as __style84} from "../../../../runtime/styles/Chat_openui_genui_user_message__form_state_header";
import {styles as __style85} from "../../../../runtime/styles/Chat_openui_genui_user_message__form_state_label";
import {styles as __style87} from "../../../../runtime/styles/Chat_openui_genui_user_message__form_state_chevron__expanded";
import {styles as __style88} from "../../../../runtime/styles/Chat_openui_genui_user_message__form_state_content";
import {styles as __style89} from "../../../../runtime/styles/Chat_openui_genui_user_message__form_field";
import {styles as __style90} from "../../../../runtime/styles/Chat_openui_genui_user_message__form_field_label";
import {styles as __style91} from "../../../../runtime/styles/Chat_openui_genui_user_message__form_field_value";
import {styles as __style82} from "../../../../runtime/styles/Chat_openui_genui_user_message";
import {styles as __style86} from "../../../../runtime/styles/Chat_openui_genui_user_message__form_state_chevron";
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
    return (<__OwnedElement $element="div" $styles={[__style83]} className="openui-genui-user-message__form-state">
      <__OwnedElement $element="button" $styles={[__style84]} className="openui-genui-user-message__form-state-header" onClick={() => setIsExpanded((v) => !v)} type="button">
        <__OwnedElement $element="span" $styles={[__style85]} className="openui-genui-user-message__form-state-label">
          Form data ({entries.length} {entries.length === 1 ? "field" : "fields"})
        </__OwnedElement>
        <__OwnedElement $element={ChevronDown} $styles={[__style87]} size={14} className={`openui-genui-user-message__form-state-chevron${isExpanded ? " openui-genui-user-message__form-state-chevron--expanded" : ""}`}/>
      </__OwnedElement>
      {isExpanded && (<__OwnedElement $element="div" $styles={[__style88]} className="openui-genui-user-message__form-state-content">
          {entries.map(({ label, value }) => (<__OwnedElement $element="div" $styles={[__style89]} key={label} className="openui-genui-user-message__form-field">
              <__OwnedElement $element="span" $styles={[__style90]} className="openui-genui-user-message__form-field-label">{label}:</__OwnedElement>
              <__OwnedElement $element="span" $styles={[__style91]} className="openui-genui-user-message__form-field-value">{value}</__OwnedElement>
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
    return (<div className="openui-shell-thread-message-user">
      <__OwnedElement $element="div" $styles={[__style82, __style86]} className="openui-genui-user-message">
        {hasFormData && <FormDataAccordion state={formState}/>}
        <div className="openui-shell-thread-message-user__content">
          {humanText && <div>{humanText}</div>}
        </div>
      </__OwnedElement>
    </div>);
};
