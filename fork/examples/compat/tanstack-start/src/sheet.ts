import { createServerFn } from "@tanstack/react-start";

// Component rules travel in React's hoisted tags in the rendered HTML (#178); no separate sheet.
export const getServerSheet = createServerFn({ method: "GET" }).handler(async () => "");
