// The bench app against the workspace's built @openuidev/react-ui, the package being replaced.
// build-fixtures.ts aliases "react-ui-under-test" to its built entry: react-ui is not a dependency.
import * as m from "react-ui-under-test";
import { hydrateBench } from "./bench-hydrate";

hydrateBench(m);
