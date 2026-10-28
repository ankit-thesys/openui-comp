// The bench app against the workspace's built @openuidev/react-ui, the package being replaced.
// Imported by path: react-ui is not a dependency of this package.
import * as m from "../../../../react-ui/dist/index.mjs";
import { hydrateBench } from "./bench-hydrate";

hydrateBench(m);
