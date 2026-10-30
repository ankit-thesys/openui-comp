"use client";

import { createStyleRegistry } from "@openuidev/react-components";
import { useServerInsertedHTML } from "next/navigation";
import { useState, type ReactNode } from "react";

/**
 * Streams the component CSS collected during server rendering into the HTML: one registry per
 * response, each flush holding only the rules registered since the last one. Every tag keeps the
 * `openui-styles` id; the browser adopts the first, merges the later ones into it and removes
 * them, so each rule ends up in the sheet once. These unlayered rules land after the
 * app's stylesheet, so the app's overrides and utilities carry extra weight (see globals.css and
 * tailwind.config.ts).
 */
export default function StyleRegistry({ children }: { children: ReactNode }) {
  const [registry] = useState(createStyleRegistry);
  useServerInsertedHTML(() => {
    const css = registry.flush();
    return css ? <style id="openui-styles" dangerouslySetInnerHTML={{ __html: css }} /> : null;
  });
  return children;
}
