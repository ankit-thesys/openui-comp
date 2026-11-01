import { createServerFn } from "@tanstack/react-start";

// #1523 has no server rendering: the browser writes component rules.
export const getServerSheet = createServerFn({ method: "GET" }).handler(async () => "");
