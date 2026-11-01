import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server";
import { createServerEntry } from "@tanstack/react-start/server-entry";

// Keep Start's streaming renderer explicit; the Node adapter pipes its Response body.
export default createServerEntry({ fetch: createStartHandler(defaultStreamHandler) });
