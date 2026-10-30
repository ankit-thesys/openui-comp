import { hydrateRoot } from "react-dom/client";
import { App } from "./app";
import "./app.css";
hydrateRoot(document.getElementById("root")!, <App />);
