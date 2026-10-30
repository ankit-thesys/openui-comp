import { hydrateRoot } from "react-dom/client";
import { App } from "./App";
import "./app.css";

hydrateRoot(document.getElementById("root")!, <App />, {
  onRecoverableError(error) {
    console.error(error);
  },
});
