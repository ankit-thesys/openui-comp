// The layer and its order, set in code both the server and the browser run (#178).
import { configureStyles, type ConfigureStylesOptions } from "@openuidev/react-components";

export const layers: ConfigureStylesOptions =
  __COMPAT_MODE__ === "layered"
    ? { layer: "openui", order: "theme, base, openui, components, utilities" }
    : {};

configureStyles(layers);
