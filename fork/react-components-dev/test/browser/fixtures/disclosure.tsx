import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  configureStyles,
  FoldableSectionContent,
  FoldableSectionItem,
  FoldableSectionRoot,
  FoldableSectionTrigger,
  Modal,
  ThemeProvider,
  TooltipWrapper,
} from "openui-under-test";
import { useState } from "react";
import { createRoot } from "react-dom/client";
const params = new URLSearchParams(location.search);
configureStyles({ layer: params.get("layer") ?? undefined });
function App() {
  const [open, setOpen] = useState(false);
  return (
    <ThemeProvider mode={params.get("mode") === "dark" ? "dark" : "light"}>
      <Accordion type="single" collapsible>
        <AccordionItem value="one">
          <AccordionTrigger text="Accordion" />
          <AccordionContent forceMount>Accordion body</AccordionContent>
        </AccordionItem>
      </Accordion>
      {!params.has("primitives") && (
        <FoldableSectionRoot type="multiple">
          <FoldableSectionItem value="one">
            <FoldableSectionTrigger text="Foldable" />
            <FoldableSectionContent forceMount>Foldable body</FoldableSectionContent>
          </FoldableSectionItem>
        </FoldableSectionRoot>
      )}
      <button onClick={() => setOpen(true)}>Open modal</button>
      <Modal title="Modal title" open={open} onOpenChange={setOpen}>
        Modal body
      </Modal>
      <TooltipWrapper
        tooltipHeading="Heading"
        tooltipContent="Tooltip body"
        delayDuration={0}
        side={(params.get("side") as "top") ?? "bottom"}
      >
        <button>Show tooltip</button>
      </TooltipWrapper>
    </ThemeProvider>
  );
}
(window as Window & { mountFixture: () => void }).mountFixture = () =>
  createRoot(document.getElementById("root")!).render(<App />);
if (!params.has("lazy")) (window as Window & { mountFixture: () => void }).mountFixture();
