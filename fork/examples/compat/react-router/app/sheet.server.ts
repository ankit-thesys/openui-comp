import { getComponentStyles } from "@openuidev/react-components/styles";
import { compatMode } from "./mode";

export function getServerSheet() {
  return getComponentStyles(compatMode === "layered" ? { layer: "openui" } : undefined);
}
