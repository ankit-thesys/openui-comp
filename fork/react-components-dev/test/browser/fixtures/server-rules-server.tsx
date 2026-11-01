import type { ServerResponse } from "node:http";
import { renderToPipeableStream } from "react-dom/server";
import { ServerRulesApp } from "./server-rules-app";

// Streams the document: the shell first, the Suspense boundary a moment later.
export function serverRulesPage(res: ServerResponse) {
  let ready = false;
  const gate = new Promise<void>((resolve) =>
    setTimeout(() => {
      ready = true;
      resolve();
    }, 300),
  );
  const wait = () => {
    if (!ready) throw gate;
  };
  const { pipe, abort } = renderToPipeableStream(<ServerRulesApp wait={wait} />, {
    bootstrapModules: ["/server-rules.js"],
    onShellReady() {
      res.writeHead(200, { "content-type": "text/html" });
      pipe(res);
    },
    onError(error) {
      console.error(error);
    },
  });
  res.on("close", abort);
}
