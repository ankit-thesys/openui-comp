import type { ServerResponse } from "node:http";
import { Writable } from "node:stream";
import { configureStyles, createStyleRegistry } from "openui-under-test";
import { renderToPipeableStream } from "react-dom/server";
import { StreamingApp } from "./streaming-app";

const releases = new Map<string, () => void>();
const completions = new Map<string, () => void>();
// Kept after the response closes: the spec reads it once the page has finished loading.
const firstSheets = new Map<string, string>();
let serial = 0;

export function releaseStream(response: string) {
  releases.get(response)?.();
}

export function completeStyle(response: string) {
  completions.get(response)?.();
  completions.delete(response);
}

/** The first registry flush a response sent, so a spec can check that none of its rules is lost. */
export function firstSheet(response: string) {
  return firstSheets.get(response) ?? "";
}

// `splitFirst` sends the first registry tag in two writes, with an async script ahead of it in
// <head>, so the library can load while that tag's text is still incomplete.
export function streamPage(
  res: ServerResponse,
  layer?: string,
  adoptEarly = false,
  splitFirst = false,
) {
  configureStyles({ layer });
  const registry = createStyleRegistry();
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
  const insertStyles = () => {
    const text = registry.flush();
    return text ? `<style id="openui-styles">${text}</style>` : "";
  };
  const { pipe, abort } = renderToPipeableStream(<StreamingApp response={response} wait={wait} />, {
    onShellReady() {
      res.writeHead(200, { "content-type": "text/html", "x-streaming-response": response });
      const first = insertStyles();
      firstSheets.set(
        response,
        first.slice('<style id="openui-styles">'.length, -"</style>".length),
      );
      const rest =
        `<style id="consumer">.streaming-late{background-color:rgb(4,5,6)}</style>` +
        `</head><body>` +
        (adoptEarly ? `<script type="module" async src="/streaming.js"></script>` : "") +
        `<div id="root" data-response="${response}" data-layer="${layer ?? ""}">`;
      res.write(
        `<!doctype html><html><head>` +
          (layer ? `<style>@layer openui,app;</style>` : "") +
          (splitFirst ? `<script type="module" async src="/streaming.js"></script>` : ""),
      );
      if (splitFirst) {
        // Cut the first tag's text in the middle of a rule; the rest waits for /streaming-complete.
        const cut = Math.floor(first.length / 2);
        res.write(first.slice(0, cut));
        completions.set(response, () => {
          res.write(first.slice(cut) + rest);
          stream();
        });
        return;
      }
      res.write(first + rest);
      stream();
    },
    onError(error) {
      console.error(error);
    },
  });
  function stream() {
    pipe(
      new Writable({
        write(chunk, _encoding, callback) {
          // The registry runs for each React flush, before that flush's markup reaches the page.
          const styles = insertStyles();
          if (adoptEarly && resolved && styles) {
            // Deliberately split the opening tag from its text across separate HTTP writes.
            res.write('<style id="openui-styles">');
            completions.set(response, () => {
              res.write(styles.slice('<style id="openui-styles">'.length));
              res.write(chunk);
              callback();
            });
            return;
          }
          res.write(styles);
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
  }
  res.on("close", () => {
    releases.delete(response);
    completions.delete(response);
    abort();
  });
}
