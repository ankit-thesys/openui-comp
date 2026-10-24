/**
 * Browser entry for the runnable legacy consumer.
 *
 * Styles: the legacy .tsx files do not import their own SCSS. The package
 * aggregates every component stylesheet in src/components/index.scss (itself
 * auto-generated, and it @use's ../openui-defaults.scss), and ships the result
 * as a separate CSS artifact. This entry imports that index explicitly. The
 * components are unchanged either way — only the stylesheet wiring lives here.
 */
import { createRoot } from "react-dom/client";
import "../../../packages/react-ui/src/components/index.scss";
import { LegacyConsumerApp } from "../fixtures/LegacyConsumerApp";
import "./consumer.css";

const root = document.getElementById("root");
if (!root) throw new Error("#root missing");

createRoot(root).render(<LegacyConsumerApp />);
