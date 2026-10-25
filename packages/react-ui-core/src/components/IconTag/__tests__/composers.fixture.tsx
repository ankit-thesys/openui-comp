import * as Core from "@openuidev/react-ui-core";
import { useRef, useState } from "react";
import { createRoot } from "react-dom/client";

const custom = {
  foreground: "rgb(230,240,250)",
  textNeutralPrimary: "rgb(40,70,90)",
  textNeutralSecondary: "rgb(60,80,100)",
  spaceM: "18px",
  radiusM: "11px",
  textBodySmHeavy: '560 15px/1.6 "Inter", sans-serif',
};
function App() {
  const framework = new URLSearchParams(location.search).get("framework");
  const [config, setConfig] = useState({
    theme: "light",
    nested: false,
    overrides: false,
    visible: true,
    variant: "neutral",
    iconVariant: "neutral",
    iconSize: "m",
    icon: "globe",
    layout: "horizontal",
    bold: false,
    subtitle: true,
    updated: false,
    imageSize: -1,
    src: "/image.svg",
    altMode: "fallback",
    width: 560,
  });
  const refs = {
    badge: useRef<HTMLDivElement>(null),
    icon: useRef<HTMLDivElement>(null),
    image: useRef<HTMLDivElement>(null),
    banner: useRef<HTMLDivElement>(null),
  };
  Object.assign(window, {
    configure: (next: Partial<typeof config>) => setConfig((old) => ({ ...old, ...next })),
    readRefs: () =>
      Object.fromEntries(
        Object.entries(refs).map(([name, ref]) => [
          name,
          ref.current === document.querySelector(`#${name}-case > div`),
        ]),
      ),
  });
  const override = !config.overrides
    ? undefined
    : framework === "tailwind3"
      ? "!bg-red-500 !text-white !p-8 !rounded-none !border-0 hover:!bg-green-500"
      : framework === "tailwind4"
        ? "bg-red-500! text-white! p-8! rounded-none! border-0! hover:bg-green-500!"
        : "explicit";
  const title = config.updated ? "**Updated revenue** [2]" : "**Revenue** [1]";
  const subtitle = config.subtitle ? `[Details](${location.origin}/navigation/details)` : undefined;
  const icon = { name: config.icon, category: "finance" };
  const alt =
    config.altMode === "fallback"
      ? undefined
      : config.altMode === "decorative"
        ? ""
        : "Preview photograph";
  const content = (
    <Core.CardSourceProvider
      sources={[
        {
          title: "First reference",
          sourceName: "Docs one",
          url: `${location.origin}/navigation/1`,
        },
        {
          title: "Second reference",
          sourceName: "Docs two",
          url: `${location.origin}/navigation/2`,
        },
      ]}
    >
      <div
        id="composers"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 18,
          width: config.width,
          maxWidth: "100%",
        }}
      >
        <div id="badge-case">
          <Core.IconTag
            ref={refs.badge}
            icon={icon}
            size={config.iconSize as any}
            variant={config.variant as any}
            className={override}
          />
        </div>
        <div id="icon-case">
          <Core.IconText
            ref={refs.icon}
            icon={icon}
            title={title}
            subtitle={subtitle}
            iconVariant={config.iconVariant as any}
            layout={config.layout as any}
            bold={config.bold}
            className={override}
          />
        </div>
        <div id="image-case">
          <Core.ImageText
            ref={refs.image}
            title={title}
            subtitle={subtitle}
            src={config.src}
            alt={alt}
            layout={config.layout as any}
            bold={config.bold}
            imageSize={config.imageSize === -1 ? undefined : config.imageSize}
            className={override}
          />
        </div>
        <div id="banner-case">
          <Core.ImageTextLarge
            ref={refs.banner}
            title={title}
            subtitle={subtitle}
            src={config.src}
            alt={alt}
            className={override}
          />
        </div>
      </div>
    </Core.CardSourceProvider>
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
    </>
  );
}
createRoot(document.getElementById("app")!).render(<App />);
