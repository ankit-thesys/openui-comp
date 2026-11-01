import { getComponentStyles } from "openui-under-test";
import { hydrateRoot } from "react-dom/client";
import { lateStyles, StreamingApp } from "./streaming-app";

export const streamingFixture = {
  getComponentStyles,
  registerLate() {
    return lateStyles(document.getElementById("root")!.dataset["response"]!);
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
