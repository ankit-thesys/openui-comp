import {
  Button,
  CompositeCard,
  ContextCard,
  OptionCards,
  OverviewCardBlock,
  SnippetCardBlock,
  TextBlockView,
  ThemeProvider,
  VisualCard,
} from "openui-under-test";
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { CardCases, type CardFamily } from "./card-blocks-cases";
const params = new URLSearchParams(location.search);
function App() {
  const [selected, setSelected] = useState<string[]>([]);
  const [activated, setActivated] = useState(0);
  const activate = () => setActivated((value) => value + 1);
  return (
    <ThemeProvider cssLayer={params.get("layer") || undefined}>
      <div data-activation-count={activated} style={{ font: "14px/21px sans-serif" }}>
        <CompositeCard item={{ header: "Composite" }} clickable onClick={activate} />
        <ContextCard item={{ title: "Context", body: "Body" }} clickable onClick={activate} />
        <VisualCard item={{ body: "Visual" }} clickable onClick={activate} />
        <OverviewCardBlock items={[{ top: "Overview" }]} clickable onItemClick={activate} />
        <SnippetCardBlock items={[{ lhs: "Snippet" }]} clickable onItemClick={activate} />
      </div>
      <OptionCards
        items={[
          { value: "one", title: "One", subtitle: "First" },
          { value: "two", title: "Two", subtitle: "Second", disabled: true },
        ]}
        selected={selected}
        onToggle={(value) => setSelected((values) => (values.includes(value) ? [] : [value]))}
      />
      <div style={{ width: 180 }} data-truncated-snippet>
        <SnippetCardBlock
          responsive
          items={[
            {
              lhs: (
                <TextBlockView
                  primary="A long truncated heading with more content than fits"
                  secondary="A long truncated secondary line"
                />
              ),
              lhsTooltip: { heading: "Full heading", content: "Full content" },
            },
          ]}
        />
      </div>
      <Button>After cards</Button>
      <CardCases family={(params.get("family") ?? "context-card-block") as CardFamily} />
    </ThemeProvider>
  );
}
(window as Window & { mountFixture: () => void }).mountFixture = () =>
  createRoot(document.getElementById("root")!).render(<App />);
if (!params.has("lazy")) (window as Window & { mountFixture: () => void }).mountFixture();
