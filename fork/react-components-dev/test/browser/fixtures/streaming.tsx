import { configureStyles, getComponentStyles } from "openui-under-test";
import { hydrateRoot } from "react-dom/client";
import { lateStyles, StreamingApp } from "./streaming-app";

configureStyles({ layer: new URLSearchParams(location.search).get("layer") || undefined });
getComponentStyles();

export const streamingFixture = {
  getComponentStyles,
  // `response` for a spec that registers before #root is parsed.
  registerLate(response = document.getElementById("root")!.dataset["response"]!) {
    return lateStyles(response);
  },
  hydrate() {
    const root = document.getElementById("root")!;
    hydrateRoot(
      root,
      <StreamingApp
        response={root.dataset["response"]!}
        hydrated={() => (root.dataset["hydrated"] = "true")}
      />,
      { onRecoverableError: (error) => console.error(error) },
    );
  },
};
(window as Window & { streamingFixture?: typeof streamingFixture }).streamingFixture =
  streamingFixture;
