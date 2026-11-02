import { hydrateRoot } from "react-dom/client";
import { ServerRulesApp } from "./server-rules-app";

const emptyShell = new URLSearchParams(location.search).has("empty-shell");

hydrateRoot(document, <ServerRulesApp emptyShell={emptyShell} />, {
  onRecoverableError: (error) => console.error(error),
});
