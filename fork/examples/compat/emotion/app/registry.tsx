"use client";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { useServerInsertedHTML } from "next/navigation";
import { useState, type ReactNode } from "react";

export default function Registry({ children }: { children: ReactNode }) {
  const [{ cache, flush }] = useState(() => {
    const cache = createCache({ key: "host" });
    // Retain server CSS strings for the streaming flush rather than emitting body style tags.
    cache.compat = true;
    const insert = cache.insert;
    let pending: string[] = [];
    cache.insert = (...args) => {
      const serialized = args[1];
      if (cache.inserted[serialized.name] === undefined) pending.push(serialized.name);
      return insert(...args);
    };
    return {
      cache,
      flush() {
        const names = pending;
        pending = [];
        return names;
      },
    };
  });
  useServerInsertedHTML(() => {
    const names = flush();
    if (!names.length) return null;
    const css = names.map((name) => cache.inserted[name]).join("");
    return (
      <style
        data-emotion={`${cache.key} ${names.join(" ")}`}
        dangerouslySetInnerHTML={{ __html: css }}
      />
    );
  });
  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
