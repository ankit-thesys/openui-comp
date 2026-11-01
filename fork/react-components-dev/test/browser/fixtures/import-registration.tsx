// Imports the whole public package and renders nothing until the spec calls `renderButton()`.
// Keeping every export reachable stops the bundler from dropping any component module.
import * as library from "openui-under-test";
import { createRoot } from "react-dom/client";

const page = window as Window & { exportCount?: number; renderButton?: () => void };
page.exportCount = Object.keys(library).length;
page.renderButton = () =>
  createRoot(document.getElementById("root")!).render(<library.Button>Save</library.Button>);
