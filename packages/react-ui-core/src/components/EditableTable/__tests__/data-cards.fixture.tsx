import * as Core from "@openuidev/react-ui-core";
import { useState } from "react";
import { createRoot } from "react-dom/client";
const image =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='%23345678'/%3E%3C/svg%3E";
const columns = [
  { key: "text", header: "Name", type: "text", width: 180 },
  { key: "number", header: "Amount", type: "number", width: 180 },
  {
    key: "select",
    header: "Choice",
    type: "select",
    width: 180,
    options: [
      { value: "one", label: "One" },
      { value: "two", label: "Two" },
    ],
  },
  { key: "date", header: "Date", type: "date-single", width: 200 },
  { key: "url", header: "URL", type: "url", width: 240 },
];
function Content({ config }: { config: any }) {
  const [data, setData] = useState([
    {
      id: "a",
      text: "Alpha",
      number: 1.5,
      select: "one",
      date: "2026-10-15T00:00:00.000Z",
      url: "https://example.com",
    },
    {
      id: "b",
      text: "Beta",
      number: 0,
      select: "two",
      date: undefined,
      url: "javascript:alert(1)",
    },
  ]);
  const [changes, setChanges] = useState(0);
  window.data = () => data;
  const markdown = <Core.InlineMarkdownRenderer content="**Strong** *em* `code` **_both_**" />;
  const common = {
    layout: config.layout,
    responsive: config.responsive,
    gap: config.gap,
    clickable: config.clickable,
    onItemClick: () => {
      window.cardClicks = (window.cardClicks || 0) + 1;
    },
  };
  return (
    <>
      <div id="table-zone" style={{ width: config.narrow ? 360 : 700 }}>
        <Core.EditableTable
          className={config.override ? "consumer-table" : "owned-table"}
          data={config.empty ? [] : data}
          columns={columns as any}
          onDataChange={(next) => {
            setData(next);
            setChanges((n) => n + 1);
          }}
        />
        <Core.EditableTableChangesBar
          changedCellCount={changes}
          onSave={() => setChanges(0)}
          onReset={() => setChanges(0)}
        />
      </div>
      <div id="cards-zone">
        <Core.CompositeCardBlock
          {...common}
          items={
            config.empty
              ? []
              : Array.from({ length: 4 }, (_, i) => ({
                  id: String(i),
                  header: <Core.TextBlockView primary={`Header ${i}`} />,
                  body: [<div key="body">{markdown}</div>],
                  footer: { price: "$20", button: <Core.Button>Buy</Core.Button> },
                }))
          }
        />
        <Core.ContextCardBlock
          {...common}
          items={
            config.empty
              ? []
              : [undefined, "gray", "info", "success", "warning", "danger"]
                  .map(
                    (bgColor, i) =>
                      ({
                        id: String(i),
                        title: i % 2 ? <Core.Tag text="Tag" /> : "Context title",
                        body: "**Strong** *em* `code`",
                        bgColor,
                      }) as any,
                  )
                  .concat([
                    {
                      id: "image",
                      title: <Core.Tag text="Image" />,
                      body: "Image body",
                      bgImageSrc: image,
                      bgImageAlt: "Illustration",
                    },
                  ])
          }
        />
        <Core.VisualCardBlock
          {...common}
          items={
            config.empty
              ? []
              : [
                  {
                    id: "image",
                    tag: <Core.Tag text="Photo" />,
                    body: markdown,
                    bgImageSrc: image,
                    bgImageAlt: "Illustration",
                  },
                  { id: "plain", body: markdown },
                  {
                    id: "unsafe",
                    bgImageSrc: "javascript:alert(1)",
                    body: "Unsafe image rejected",
                  },
                ]
          }
        />
      </div>
    </>
  );
}
function App() {
  const [config, setConfig] = useState({
    mode: "light",
    custom: false,
    layout: "grid",
    responsive: true,
    gap: 12,
    clickable: true,
    narrow: false,
    empty: false,
    override: false,
  });
  window.configure = (next: any) => setConfig((prev) => ({ ...prev, ...next }));
  return (
    <>
      <div id="unrelated">Host remains unchanged</div>
      <Core.ThemeProvider
        mode={config.mode as any}
        lightTheme={
          config.custom
            ? { textNeutralPrimary: "#123456", spaceM: "13px", radiusXl: "9px" }
            : undefined
        }
      >
        <section id="zone" data-ready={JSON.stringify(config)}>
          <Content config={config} />
          <Core.ThemeProvider mode="dark">
            <div id="nested">
              <Core.ContextCard item={{ title: "Nested", body: "**Body**", bgColor: "info" }} />
            </div>
          </Core.ThemeProvider>
        </section>
      </Core.ThemeProvider>
    </>
  );
}
createRoot(document.getElementById("app")!).render(<App />);
