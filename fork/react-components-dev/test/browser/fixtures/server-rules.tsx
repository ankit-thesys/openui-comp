import { hydrateRoot } from "react-dom/client";
import { ServerRulesApp } from "./server-rules-app";

hydrateRoot(document, <ServerRulesApp />, {
  onRecoverableError: (error) => console.error(error),
});
