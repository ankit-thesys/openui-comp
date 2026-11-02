// The layer and its order, set in code both the server and the browser run (#178).
import { configureStyles } from "@openuidev/react-components";

declare const __COMPAT_MODE__: "layered" | "unlayered";
if (__COMPAT_MODE__ === "layered")
  configureStyles({ layer: "openui", order: "theme, base, openui, components, utilities" });
