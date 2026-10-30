import {
  Button,
  Card,
  CardHeader,
  CompositeCard,
  configureStyles,
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
configureStyles({ layer: params.get("layer") || undefined });
// Isolate this batch's styles from composed components that still register during rendering.
function Registration() {
  return (
    <>
      <Card>
        <CardHeader title="Title" subtitle="Subtitle" icon={<span>Icon</span>} />
      </Card>
      <CompositeCard item={{ header: "Composite", body: ["Body"], footer: { price: "42" } }} />
      <ContextCard item={{ title: "Context" }} clickable />
      <VisualCard item={{ body: "Visual" }} clickable />
      <OverviewCardBlock items={[{ top: "Overview" }]} clickable />
      <SnippetCardBlock items={[{ lhs: null }]} clickable />
      <OptionCards items={[]} />
    </>
  );
}
function App() {
  const [selected, setSelected] = useState<string[]>([]);
  const [activated, setActivated] = useState(0);
  const activate = () => setActivated((value) => value + 1);
  return (
    <ThemeProvider>
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
  createRoot(document.getElementById("root")!).render(
    params.has("registration") ? <Registration /> : <App />,
  );
if (!params.has("lazy")) (window as Window & { mountFixture: () => void }).mountFixture();
