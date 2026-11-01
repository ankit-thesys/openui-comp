// #1523 has no server sheet to read the layer from, so the browser configures it.
import { configureStyles } from "@openuidev/react-components";
import { layered } from "./compat";

if (layered) configureStyles({ layer: "openui", order: "theme, base, openui, components, utilities" });
