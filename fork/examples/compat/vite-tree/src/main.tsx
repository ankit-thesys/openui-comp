import { Button } from "@openuidev/react-components";
import { createRoot } from "react-dom/client";
import "./app.css";
import { compatMode } from "./configure";
import overrideUrl from "./overrides.css?url";

const overrides = document.createElement("link");
overrides.rel = "stylesheet";
overrides.href = overrideUrl;
overrides.media = "not all";
overrides.dataset["compatOverrides"] = "";
document.head.append(overrides);

// Button is the only component import. Root token defaults provide the fixed light theme;
// importing ThemeProvider here would add another component to the tree-shaking experiment.
createRoot(document.getElementById("root")!).render(
  <main className="compat-main" data-compat-ready data-compat-mode={compatMode}>
    <h1>Vite Button-only bundle: {compatMode}</h1>
    <Button>Continue</Button>
  </main>,
);
