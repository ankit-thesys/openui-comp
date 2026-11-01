import { Modal, ThemeProvider } from "openui-under-test";
import { useEffect } from "react";
import { createRoot } from "react-dom/client";
export function mountModal(size: "sm" | "md" | "lg") {
  const mode = new URLSearchParams(location.search).get("mode") === "dark" ? "dark" : "light";
  function App() {
    useEffect(() => {
      const content = document.querySelector(".openui-modal-content")!;
      content.setAttribute("data-parity-case", size);
      content.setAttribute(
        "data-parity-parts",
        JSON.stringify({
          overlay: "document:.openui-modal-overlay",
          header: ".openui-modal-header",
          title: ".openui-modal-title",
          close: ".openui-modal-close",
          icon: ".openui-modal-close svg",
          body: ".openui-modal-body",
        }),
      );
    }, []);
    return (
      <ThemeProvider mode={mode}>
        <Modal title="Title" open onOpenChange={() => {}} size={size}>
          Body
        </Modal>
      </ThemeProvider>
    );
  }
  createRoot(document.getElementById("root")!).render(<App />);
}
