import { createServerFn } from "@tanstack/react-start";
import { compatMode } from "./mode";

export const getServerSheet = createServerFn({ method: "GET" }).handler(async () => {
  const { getComponentStyles } = await import("@openuidev/react-components/styles");
  return getComponentStyles(compatMode === "layered" ? { layer: "openui" } : undefined);
});
