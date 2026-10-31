import { hydrateRoot } from "react-dom/client";
import { App } from "./App";
import "./app.css";
const root = document.getElementById("root")!;
const initialTheme = root.dataset["theme"] === "dark" ? "dark" : "light";
hydrateRoot(root, <App initialTheme={initialTheme} />, {
  onRecoverableError(error) {
    window.__compat.recoverable.push(String(error));
  },
});
