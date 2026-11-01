"use client";
// #1523 has no server sheet to read the layer from, so the browser configures it.
import { configureStyles } from "@openuidev/react-components";
import { layered } from "../compat";

if (layered) configureStyles({ layer: "openui" });

export function ConfigureStyles() {
  return null;
}
