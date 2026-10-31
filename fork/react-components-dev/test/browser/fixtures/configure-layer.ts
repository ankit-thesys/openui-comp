// `?layer=<name>` configures the app-wide component sheet. Import this module first: the sheet is
// append-only, so rules the browser writes before configuration stay unlayered, and the contract
// list (test/unit/contract/components.tsx) awaits at top level, which lets import-time rules be
// written before the importing fixture's own body runs.
import { configureStyles } from "@openuidev/react-components";

export const layer = new URLSearchParams(location.search).get("layer") ?? undefined;
configureStyles({ layer });
