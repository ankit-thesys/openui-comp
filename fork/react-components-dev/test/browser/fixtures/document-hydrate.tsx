// Hydrates the whole document document.spec.ts server-renders, reading the server sheet back so
// the client renders the same props.
import { configureStyles } from "@openuidev/react-components";
import { hydrateRoot } from "react-dom/client";
import { Document } from "./document-app";

const layer = new URLSearchParams(location.search).get("layer") || undefined;
configureStyles({ layer });
const sheet = document.querySelector("style[data-openui-styles]")?.innerHTML ?? "";

hydrateRoot(document, <Document sheet={sheet} layer={layer} />, {
  onRecoverableError: (error) => console.error(`recoverable: ${String(error)}`),
});
