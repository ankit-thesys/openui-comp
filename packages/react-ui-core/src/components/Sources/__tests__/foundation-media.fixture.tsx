import * as Core from "@openuidev/react-ui-core";
import { useState } from "react";
import { createRoot } from "react-dom/client";

const custom = {
  foreground: "rgb(230,240,250)",
  textNeutralPrimary: "rgb(40,70,90)",
  textNeutralSecondary: "rgb(60,80,100)",
  spaceM: "18px",
  radiusM: "11px",
};
function App() {
  const params = new URLSearchParams(location.search);
  const kind = params.get("case"),
    framework = params.get("framework");
  const [config, setConfig] = useState({
    theme: "light",
    nested: false,
    overrides: false,
    visible: true,
    variant: "neutral",
    size: "md",
    duration: 0,
    count: 6,
    src: "/image.svg",
    scale: "fill",
    ratio: "3:2",
    imageLoading: true,
    sourceCount: 7,
    favicon: "/image.svg",
    icon: "globe",
  });
  const [events, setEvents] = useState<string[]>([]);
  const record = (event: string) => setEvents((previous) => [...previous, event]);
  Object.assign(window, {
    configure: (next: Partial<typeof config>) =>
      setConfig((previous) => ({ ...previous, ...next })),
    clearEvents: () => setEvents([]),
  });
  const override = !config.overrides
    ? undefined
    : framework === "tailwind3"
      ? "!bg-red-500 !text-white !p-8 !rounded-none !border-0 hover:!bg-green-500"
      : framework === "tailwind4"
        ? "bg-red-500! text-white! p-8! rounded-none! border-0! hover:bg-green-500!"
        : "explicit";
  const sources = Array.from({ length: config.sourceCount }, (_, index) => ({
    title: `Reference ${index + 1}`,
    sourceName: `Docs ${index + 1}`,
    url: `${location.origin}/navigation/${index + 1}`,
  }));
  const images = Array.from({ length: config.count }, (_, index) => ({
    src: `${config.src}?image=${index}`,
    alt: `Photo ${index + 1}`,
    details: `Detail ${index + 1}`,
  }));
  const presentations = (
    <div id="presentations">
      <Core.Callout
        variant={config.variant as any}
        title="Callout title"
        description="Supporting description"
        duration={config.duration || undefined}
        className={override}
      />
      <Core.TextCallout
        variant={config.variant as any}
        title="Text callout title"
        description="Supporting description"
        className={override}
      />
      <Core.TagBlock className={override}>
        <Core.Tag
          text="A label that can truncate when the container is narrow"
          icon={
            <svg width="14" height="14" viewBox="0 0 14 14">
              <path d="M2 7h10" />
            </svg>
          }
          size={config.size as any}
          variant={config.variant as any}
          className={override}
        />
        <Core.Tag text="Second label" size={config.size as any} variant={config.variant as any} />
      </Core.TagBlock>
      {(["sunk", "card", "clear"] as const).map((variant) => (
        <Core.TextContent key={variant} variant={variant} className={override}>
          <p>Nested content: {variant}</p>
        </Core.TextContent>
      ))}
    </div>
  );
  const media = (
    <div id="media">
      <div style={{ width: 240 }}>
        <Core.Image
          src={config.src}
          alt="Individual photo"
          scale={config.scale as any}
          aspectRatio={config.ratio as any}
          className={override}
          onClick={() => record("image-click")}
        />
      </div>
      <div id="image-block-owner" style={{ width: "100%" }}>
        <Core.ImageBlock
          key={config.imageLoading ? "loading" : "ready"}
          src={config.src}
          alt="Image block photo"
          imageLoading={config.imageLoading}
          className={override}
        />
      </div>
      <Core.ImageGallery images={images} />
    </div>
  );
  const sourceContent = (
    <div id="sources">
      <Core.CardSourceProvider sources={sources}>
        <Core.Sources />
        <div id="inline-citation">
          <Core.TextContentCitation
            node={{
              properties: { "data-component-type": "citation", "data-citation-indices": "1,2,999" },
            }}
          />
        </div>
      </Core.CardSourceProvider>
      <div id="citation-item">
        <Core.CitationItem
          title="Direct reference"
          sourceName="Direct docs"
          faviconUrl={config.favicon}
          url={`${location.origin}/navigation/direct`}
          onClick={() => record("citation-item")}
        />
      </div>
      <div id="listed-item">
        <Core.ListedSourceItem
          title="Keyboard reference"
          sourceName="Keyboard docs"
          faviconUrl={config.favicon}
          url={`${location.origin}/navigation/keyboard`}
          sourceId={9}
          onClick={() => record("listed-item")}
        />
      </div>
      <div id="unsafe-item">
        <Core.CitationItem
          title="Unsafe reference"
          sourceName="Unsafe docs"
          faviconUrl={config.favicon}
          url={"java\tscript:window.__unsafeExecuted=true"}
          onClick={() => record("unsafe-item")}
        />
      </div>
      <div id="favicon-owner">
        <Core.SourceFaviconImage url={config.favicon} alt="Favicon" width={24} height={24} />
      </div>
      <div id="dynamic-icon">
        <Core.IconWrapper name={config.icon} category="finance" size={24} />
      </div>
      <Core.Citation
        sources={sources.slice(0, 2).map((source) => ({ ...source, faviconUrl: config.favicon }))}
        onClick={() => record("citation-trigger-prop")}
      />
    </div>
  );
  const content =
    kind === "presentation" ? presentations : kind === "media" ? media : sourceContent;
  const themed =
    config.theme === "none" ? (
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
    );
  return (
    <>
      <div id="unrelated">Host content</div>
      <button id="outside">Outside</button>
      <section id="zone" data-ready data-config={JSON.stringify(config)}>
        {config.visible && themed}
      </section>
      {config.overrides && (
        <style>{`.openui-gallery__modal-content,.openui-citation-tooltip,.openui-listed-source-item{background:rgb(239,68,68)!important;border-radius:0!important}.openui-citation:hover{background:rgb(34,197,94)!important}`}</style>
      )}
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
createRoot(document.getElementById("app")!).render(<App />);
