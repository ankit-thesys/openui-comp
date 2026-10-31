import { configureStyles } from "@openuidev/react-components";

declare const __COMPAT_MODE__: "layered" | "unlayered";

export const compatMode = __COMPAT_MODE__;
if (compatMode === "layered") configureStyles({ layer: "openui" });
