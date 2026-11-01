import * as components from "@openuidev/react-components";
import "./main";

// Make every export observable so the comparison build really retains the entire public API.
Object.assign(window, { openuiComparison: components });
