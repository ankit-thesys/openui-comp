// #1523 has no server sheet to read the layer from, so the browser configures it.
import { configureStyles } from "@openuidev/react-components";
import { compatMode } from "./mode";

if (compatMode === "layered") configureStyles({ layer: "openui" });
