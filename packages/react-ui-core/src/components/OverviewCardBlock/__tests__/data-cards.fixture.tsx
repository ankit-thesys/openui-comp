import * as Core from "@openuidev/react-ui-core";
import { useRef, useState } from "react";
import { createRoot } from "react-dom/client";

type Configuration = {
  theme: string;
  nested: boolean;
  overrides: boolean;
  visible: boolean;
  size: "default" | "small";
  variant: "number" | "icon" | "image";
  count: number;
  width: number;
  layout: "grid" | "carousel";
  responsive: boolean;
  gap: number | string;
  clickable: boolean;
  subtitle: boolean;
  updated: boolean;
  truncate: boolean;
  rhsLong: boolean;
};
type RecordedEvent = { kind: string; index: number; id?: string; sameItem?: boolean };
declare global {
  interface Window {
    mountDataCards: () => void;
    configure: (next: Partial<Configuration>) => void;
    readRefs: () => Record<string, boolean>;
    readEvents: () => RecordedEvent[];
    clearEvents: () => void;
  }
}
const custom = {
  foreground: "rgb(230,240,250)",
  textNeutralPrimary: "rgb(40,70,90)",
  textNeutralSecondary: "rgb(60,80,100)",
  spaceM: "18px",
  spaceL: "22px",
  radius2xl: "17px",
  textNumbersDefaultHeavy: '560 19px/1.6 "Inter", sans-serif',
};
function App() {
  const query = new URLSearchParams(location.search);
  const kind = query.get("case") || "leaves";
  const framework = query.get("framework");
  const [config, setConfig] = useState<Configuration>({
    theme: "light",
    nested: false,
    overrides: false,
    visible: true,
    size: "default",
    variant: "number",
    count: 5,
    width: 900,
    layout: "grid",
    responsive: true,
    gap: 0,
    clickable: true,
    subtitle: true,
    updated: false,
    truncate: true,
    rhsLong: false,
  });
  const [events, setEvents] = useState<RecordedEvent[]>([]);
  const refs = {
    metric: useRef<HTMLDivElement>(null),
    inline: useRef<HTMLDivElement>(null),
    entity: useRef<HTMLDivElement>(null),
    list: useRef<HTMLDivElement>(null),
    item: useRef<HTMLDivElement>(null),
    overview: useRef<HTMLDivElement>(null),
    snippet: useRef<HTMLDivElement>(null),
  };
  Object.assign(window, {
    configure: (next: Partial<Configuration>) => setConfig((old) => ({ ...old, ...next })),
    readEvents: () => events,
    clearEvents: () => setEvents([]),
    readRefs: () =>
      Object.fromEntries(
        Object.entries(refs)
          .filter(([name]) =>
            kind === "leaves"
              ? !["overview", "snippet"].includes(name)
              : ["overview", "snippet"].includes(name),
          )
          .map(([name, ref]) => [
            name,
            config.visible
              ? ref.current === document.querySelector(`#${name}-case > div`)
              : ref.current === null,
          ]),
      ),
  });
  const record = (event: RecordedEvent) => setEvents((old) => [...old, event]);
  const override = !config.overrides
    ? undefined
    : framework === "tailwind3"
      ? "!bg-red-500 !text-white !p-8 !rounded-none !border-0 hover:!bg-green-500"
      : framework === "tailwind4"
        ? "bg-red-500! text-white! p-8! rounded-none! border-0! hover:bg-green-500!"
        : "explicit";
  const title = config.updated ? "Updated title" : "Primary title";
  const detail = config.subtitle ? "Secondary details" : undefined;
  const overviewItems = Array.from({ length: config.count }, (_, index) => ({
    id: `overview-${index}`,
    top: (
      <Core.TextBlockView
        primary={`${title} ${index + 1}`}
        secondary={detail}
        variant="text-subtext"
        size="xs"
      />
    ),
    bottom: {
      value: `${index + 1}K`,
      subtext: "today",
      trend: { direction: index % 2 ? ("down" as const) : ("up" as const), value: index },
    },
  }));
  const long = config.truncate
    ? "A long heading and detail that must overflow its constrained card width ".repeat(4)
    : "Short";
  const snippetItems = Array.from({ length: config.count }, (_, index) => ({
    id: `snippet-${index}`,
    lhs: (
      <Core.TextBlockView
        primary={config.rhsLong ? "Label" : `${title} ${index + 1} ${long}`}
        secondary={config.rhsLong ? "Details" : long}
        variant="text-subtext"
        size="xs"
      />
    ),
    rhs:
      index % 2 ? undefined : (
        <Core.TextBlockView
          primary={config.rhsLong ? long : "42"}
          secondary={config.rhsLong ? "Value details" : "Value"}
          variant="number"
          size="xs"
          align="left"
        />
      ),
    lhsTooltip: { heading: `Full heading ${index + 1}`, content: `Full description ${index + 1}` },
    rhsTooltip: { heading: `Full value ${index + 1}`, content: `Value description ${index + 1}` },
  }));
  const leaves = (
    <>
      <div id="metric-case">
        <Core.MetricIndicatorWithStrikethrough
          ref={refs.metric}
          value={config.updated ? "84" : "42"}
          previousValue="50"
          subtext={detail}
          trend={{ direction: "down", value: -2 }}
          className={override}
        />
      </div>
      <div id="inline-case">
        <Core.MetricIndicatorInline
          ref={refs.inline}
          value="0"
          subtext={detail}
          trend={{ direction: "up", value: 0 }}
          className={override}
        />
      </div>
      <div id="entity-case">
        <Core.EntityList
          ref={refs.entity}
          className={override}
          size={config.size}
          header={{ left: "Header", right: "Amount" }}
          footer={{ left: "Total", right: "30", rightVariant: "number" }}
          rows={[
            { left: `**${title}**`, right: "[Details](/navigation/details)" },
            { left: "Count", right: "30", rightVariant: "number" },
          ]}
        />
      </div>
      <div id="list-case">
        <Core.ListBlock
          ref={refs.list}
          className={override}
          size={config.size}
          variant={config.variant}
        >
          {Array.from({ length: config.count }, (_, index) => (
            <Core.ListItem
              key={index}
              title={`${title} ${index + 1}`}
              subtitle={index === 0 ? detail : undefined}
              icon={<span aria-hidden="true">★</span>}
              image={{ src: "/image.svg", alt: `List image ${index + 1}` }}
              actionLabel="Open"
              actionIcon={<span aria-hidden="true">→</span>}
              onClick={config.clickable ? () => record({ kind: "list", index }) : undefined}
            />
          ))}
        </Core.ListBlock>
      </div>
      <div id="item-case">
        <Core.ListItem
          ref={refs.item}
          className={override}
          title="Standalone"
          subtitle={detail}
          variant={config.variant}
          size={config.size}
          index={2}
          icon={<span aria-hidden="true">★</span>}
          image={{ src: "/image.svg", alt: "Standalone image" }}
          actionLabel="Open"
          onClick={config.clickable ? () => record({ kind: "item", index: 2 }) : undefined}
        />
      </div>
    </>
  );
  const cards = (
    <>
      <div id="overview-case">
        <Core.OverviewCardBlock
          ref={refs.overview}
          items={overviewItems}
          className={override}
          responsive={config.responsive}
          layout={config.layout}
          gap={config.gap}
          clickable={config.clickable}
          onItemClick={(item, index) =>
            record({
              kind: "overview",
              index,
              id: item.id,
              sameItem: item === overviewItems[index],
            })
          }
        />
      </div>
      <div id="snippet-case">
        <Core.SnippetCardBlock
          ref={refs.snippet}
          items={snippetItems}
          className={override}
          responsive={config.responsive}
          gap={config.gap}
          clickable={config.clickable}
          onItemClick={(item, index) =>
            record({ kind: "snippet", index, id: item.id, sameItem: item === snippetItems[index] })
          }
        />
      </div>
    </>
  );
  const content = (
    <div
      id="specimens"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 18,
        width: config.width,
        maxWidth: "100%",
      }}
    >
      {kind === "leaves" ? leaves : cards}
    </div>
  );
  return (
    <>
      <div id="unrelated">Host content</div>
      <button id="outside">Outside</button>
      <section id="zone" data-ready data-config={JSON.stringify(config)}>
        {config.visible &&
          (config.theme === "none" ? (
            content
          ) : (
            <Core.ThemeProvider
              cssSelector="#zone"
              mode={config.theme.includes("dark") ? "dark" : "light"}
              lightTheme={config.theme.startsWith("custom") ? custom : undefined}
              darkTheme={config.theme.startsWith("custom") ? custom : undefined}
            >
              <span id="outer-color" style={{ color: "var(--openui-text-neutral-primary)" }}>
                Outer scope
              </span>
              <div id="nested-owner">
                {config.nested ? (
                  <Core.ThemeProvider cssSelector="#nested-owner" mode="dark" darkTheme={custom}>
                    {content}
                  </Core.ThemeProvider>
                ) : (
                  content
                )}
              </div>
            </Core.ThemeProvider>
          ))}
      </section>
      <section id="independent">
        <Core.ThemeProvider cssSelector="#independent" mode="light">
          <span id="independent-color" style={{ color: "var(--openui-text-neutral-primary)" }}>
            Independent scope
          </span>
        </Core.ThemeProvider>
      </section>
      <output id="events">{JSON.stringify(events)}</output>
    </>
  );
}
const root = createRoot(document.getElementById("app")!);
window.mountDataCards = () => root.render(<App />);
