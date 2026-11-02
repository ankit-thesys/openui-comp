import { configureStyles } from "@openuidev/react-components";
import { AsyncLocalStorage } from "node:async_hooks";
import { Writable } from "node:stream";
import { renderToPipeableStream } from "react-dom/server";
import { App } from "./App";
import { layers } from "./configure";
export const mode = __COMPAT_MODE__;

// Each request's style nonce, scoped to its render so concurrent requests keep their own. React
// keeps a hoisted tag's rules only when the tag carries the nonce passed as `nonce: { style }`.
const requestNonce = new AsyncLocalStorage<string>();
configureStyles({ ...layers, nonce: () => requestNonce.getStore() });

export function render(
  initialTheme: "light" | "dark",
  nonce: string,
): Promise<{ sheet: string; html: string }> {
  return requestNonce.run(
    nonce,
    () =>
      new Promise((resolve, reject) => {
        let html = "";
        const sink = new Writable({
          write(chunk, _encoding, done) {
            html += chunk;
            done();
          },
        });
        sink.on("finish", () => resolve({ sheet: "", html }));
        const stream = renderToPipeableStream(<App initialTheme={initialTheme} />, {
          nonce: { style: nonce },
          onAllReady: () => stream.pipe(sink),
          onError: reject,
        });
      }),
  );
}
