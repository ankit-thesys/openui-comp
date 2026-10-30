"use client";

import { configureStyles, createStyleRegistry } from "@openuidev/react-components";
import { useServerInsertedHTML } from "next/navigation";
import { useState, type ReactNode } from "react";

// One app-wide cascade layer, on the server and in the browser (this module runs in both).
configureStyles({ layer: "openui" });

/**
 * Streams the component CSS collected during server rendering into the HTML: one registry per
 * response, each flush holding only the rules registered since the last one. Every tag keeps the
 * `openui-styles` id; the browser adopts the first, merges the later ones into it and removes
 * them, so each rule ends up in the sheet once. The rules sit in `@layer openui`,
 * so where Next places these tags does not matter: the layout's head declares the layer order.
 */
export default function StyleRegistry({ children }: { children: ReactNode }) {
  const [registry] = useState(createStyleRegistry);
  useServerInsertedHTML(() => {
    const css = registry.flush();
    return css ? <style id="openui-styles" dangerouslySetInnerHTML={{ __html: css }} /> : null;
  });
  return children;
}
