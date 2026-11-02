"use client";
// The layer and its order, set in code both the server and the browser run (#178).
import { configureStyles } from "@openuidev/react-components";
import { layered } from "../compat";

if (layered)
  configureStyles({ layer: "openui", order: "theme, base, openui, components, utilities" });

export function ConfigureStyles() {
  return null;
}
