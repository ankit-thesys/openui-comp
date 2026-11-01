// #1523 has no server sheet to read the layer from, so the browser configures it.
import { configureStyles } from "@openuidev/react-components";

declare const __COMPAT_MODE__: "layered" | "unlayered";
if (__COMPAT_MODE__ === "layered") configureStyles({ layer: "openui", order: "theme, base, openui, components, utilities" });
