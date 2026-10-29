/**
 * AI-integration surface for the dashboard kit.
 *
 * The underlying library is genui-sdk's dashboard library — root `Dashboard`,
 * with the layout grammar (Section, CardRow, the three card sizes) and the
 * filter system that make a model emit dashboards rather than a vertical stack
 * of cards. The five `openui*` names below are the kit convention, matching
 * what `@openuidev/chat-kit/lib` exports.
 */
import { dashboardLibrary } from "./dashboard/library";
import { dashboardPromptOptions } from "./dashboard/promptOptions";

export { dashboardComponents } from "./dashboard/defineComponents";

export const openuiLibrary = dashboardLibrary;
export const openuiComponentGroups = dashboardLibrary.componentGroups;
// The source keeps these inside the options object; the kit surfaces them
// separately because chat-kit does, and callers compose their own prompts.
export const openuiExamples = dashboardPromptOptions.examples ?? [];
export const openuiAdditionalRules = dashboardPromptOptions.additionalRules ?? [];
export const openuiPromptOptions = dashboardPromptOptions;
