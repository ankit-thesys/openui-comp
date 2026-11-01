import { renderToPipeableStream } from "react-dom/server";
import { Writable } from "node:stream";
import { App } from "./App";
export const mode = __COMPAT_MODE__;
// PROTOTYPE: React writes the component rules it hoists with the request's style nonce.
export function render(initialTheme: "light" | "dark", nonce: string): Promise<{ sheet: string; html: string }> {
  return new Promise((resolve, reject) => {
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
  });
}
