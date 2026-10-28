import { Button } from "openui-under-test";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")!).render(
  <>
    <Button>Save</Button>
    <button type="button">Plain</button>
  </>,
);
