"use client";

import { getComponentStyles } from "@openuidev/react-components";
import { useServerInsertedHTML } from "next/navigation";
import { useRef, type ReactNode } from "react";

/**
 * Streams the component CSS collected during server rendering into the HTML.
 * The first flush writes the `_goober` tag the browser adopts; later flushes add
 * only the rules registered since. Sheet order does not matter here: the rules sit
 * in `@layer openui`, and globals.css declares the layer order first.
 */
export default function StyleRegistry({ children }: { children: ReactNode }) {
  const sent = useRef("");
  useServerInsertedHTML(() => {
    const sheet = getComponentStyles();
    const first = sent.current === "";
    const css = sheet.startsWith(sent.current) ? sheet.slice(sent.current.length) : sheet;
    sent.current = sheet;
    if (!css) return null;
    return first ? (
      <style id="_goober" dangerouslySetInnerHTML={{ __html: css }} />
    ) : (
      <style dangerouslySetInnerHTML={{ __html: css }} />
    );
  });
  return children;
}
