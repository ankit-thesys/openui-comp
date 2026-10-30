// A whole server-rendered document, as React Router, TanStack Start and Next render one: React owns
// <html> and <head>. The app's own first <style> has text children, which React compares when it
// hydrates; the component sheet follows it. document-hydrate.tsx hydrates it; document.spec.ts
// renders it on the server. Written without JSX: Playwright rewrites JSX in files a spec imports.
import { Button } from "@openuidev/react-components";
import { createElement as h, useEffect, useState } from "react";

export function Document({ sheet, layer }: { sheet: string; layer?: string }) {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return h(
    "html",
    { lang: "en" },
    h(
      "head",
      null,
      h("meta", { charSet: "utf-8" }),
      h("title", null, "Document hydration"),
      h(
        "style",
        { "data-app-layer-order": true },
        `@layer theme, base, ${layer ?? "openui"}, utilities;`,
      ),
      h("style", { "data-openui-styles": true, dangerouslySetInnerHTML: { __html: sheet } }),
    ),
    h(
      "body",
      null,
      h(
        "main",
        { "data-hydrated": hydrated ? "true" : undefined },
        h(Button, { "data-testid": "default" } as Record<string, string>, "Default"),
      ),
      h("script", { type: "module", src: "/document-hydrate.js" }),
    ),
  );
}
