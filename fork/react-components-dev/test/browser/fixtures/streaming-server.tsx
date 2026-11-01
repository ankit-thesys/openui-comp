import type { ServerResponse } from "node:http";
import { Writable } from "node:stream";
import { getComponentStyles } from "openui-under-test";
import { renderToPipeableStream } from "react-dom/server";
import { StreamingApp } from "./streaming-app";

const releases = new Map<string, () => void>();
let serial = 0;

export function releaseStream(response: string) {
  releases.get(response)?.();
}

// The whole component sheet goes in the shell's <head>, once. Later flushes carry markup only:
// style modules register at import, so the sheet is complete before anything renders.
export function streamPage(res: ServerResponse, layer?: string) {
  const response = String(++serial);
  let resolved = false;
  const gate = new Promise<void>((resolve) => {
    releases.set(response, () => {
      resolved = true;
      releases.delete(response);
      resolve();
    });
  });
  const wait = () => {
    if (!resolved) throw gate;
  };
  const { pipe, abort } = renderToPipeableStream(<StreamingApp response={response} wait={wait} />, {
    onShellReady() {
      res.writeHead(200, { "content-type": "text/html", "x-streaming-response": response });
      res.write(
        `<!doctype html><html><head><meta charset="utf-8">` +
          (layer ? `<style>@layer openui,app;</style>` : "") +
          `<style data-openui-styles data-layer="${layer ?? ""}">${getComponentStyles({ layer })}</style>` +
          `<style id="consumer">.streaming-late{background-color:rgb(4,5,6)}</style>` +
          `</head><body><div id="root" data-response="${response}">`,
      );
      pipe(
        new Writable({
          write(chunk, _encoding, callback) {
            res.write(chunk);
            callback();
          },
          final(callback) {
            res.end(
              `</div><script type="module">import { streamingFixture } from "/streaming.js"; streamingFixture.hydrate();</script></body></html>`,
            );
            callback();
          },
        }),
      );
    },
    onError(error) {
      console.error(error);
    },
  });
  res.on("close", () => {
    releases.delete(response);
    abort();
  });
}
