import { Button } from "@openuidev/react-components";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")!).render(
  <>
    <Button>Save</Button>
    <button type="button">Plain</button>
  </>,
);
