import { getComponentStyles } from "@openuidev/react-components/styles";
import type { ServerResponse } from "node:http";
import { PassThrough } from "node:stream";
import { renderToPipeableStream } from "react-dom/server";
import { App, compatMode } from "./App";

export function render(
  response: ServerResponse,
  assets: { script: string; css: string[]; overrides: string },
) {
  const styles = getComponentStyles(compatMode === "layered" ? { layer: "openui" } : {});
  const order =
    compatMode === "layered"
      ? "<style data-layer-order>@layer theme, base, openui, components, utilities;</style>"
      : "";
  const head = `<!doctype html><html lang="en"><head><meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" href="data:," /><title>OpenUI Vite streaming SSR</title>
    ${order}<style data-openui-styles>${styles}</style>
    ${assets.css.map((href) => `<link rel="stylesheet" href="${href}" />`).join("")}
    <link rel="stylesheet" href="${assets.overrides}" media="not all" data-compat-overrides />
    </head><body><div id="root">`;

  // A new promise per response forces a real second stream flush. The entire sheet is already
  // in the shell; no collecting, registry or sheet insertion happens when this boundary resolves.
  const gate = new Promise<void>((resolve) => setTimeout(resolve, 150));
  let failed = false;
  const stream = renderToPipeableStream(<App gate={gate} />, {
    onShellReady() {
      response.statusCode = failed ? 500 : 200;
      response.setHeader("Content-Type", "text/html; charset=utf-8");
      response.write(head);
      const body = new PassThrough();
      body.pipe(response, { end: false });
      body.on("end", () => {
        clearTimeout(timeout);
        response.end(`</div><script type="module" src="${assets.script}"></script></body></html>`);
      });
      stream.pipe(body);
    },
    onShellError(error) {
      clearTimeout(timeout);
      console.error(error);
      response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("SSR shell failed");
    },
    onError(error) {
      failed = true;
      console.error(error);
    },
  });
  const timeout = setTimeout(() => stream.abort(), 10_000);
  response.on("close", () => {
    clearTimeout(timeout);
    stream.abort();
  });
}
