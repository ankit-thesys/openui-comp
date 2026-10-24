import * as Core from "@openuidev/react-ui-core";
import { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
const custom = {
  foreground: "rgb(230,240,250)",
  elevated: "rgb(210,225,240)",
  textNeutralPrimary: "rgb(40,70,90)",
  textNeutralSecondary: "rgb(60,80,100)",
  spaceM: "18px",
};
function App() {
  const kind = new URLSearchParams(location.search).get("case"),
    framework = new URLSearchParams(location.search).get("framework");
  const [config, setConfig] = useState({
    size: "md",
    theme: "light",
    nestedTheme: false,
    overrides: false,
    visible: true,
    pinned: false,
    nestedModal: false,
    includeTooltip: false,
    long: false,
    empty: false,
    heading: true,
    content: true,
    side: "bottom",
    align: "start",
    sideOffset: 5,
    alignOffset: 0,
    truncated: false,
    selectors: false,
    width: 140,
    disabled: false,
    delay: 30,
  });
  const [open, setOpen] = useState(false),
    [inner, setInner] = useState(false),
    [events, setEvents] = useState<any[]>([]);
  const triggerRef = useRef<HTMLButtonElement>(null);
  Object.assign(window, {
    configure: (next: any) => setConfig((old) => ({ ...old, ...next })),
    setOpen,
    setInner,
    childRef: () => triggerRef.current,
  });
  const record = (value: any) => setEvents((old) => [...old, value]);
  const override = config.overrides
    ? framework === "tailwind3"
      ? "!bg-red-500 !text-white !p-8 !rounded-none !border-0 hover:!bg-green-500"
      : framework === "tailwind4"
        ? "bg-red-500! text-white! p-8! rounded-none! border-0! hover:bg-green-500!"
        : "explicit"
    : undefined;
  const heading = (
    <span
      className="fixture-heading"
      style={{
        display: "block",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      A long heading that exceeds this trigger width
    </span>
  );
  const content = (
    <span
      className="fixture-content"
      style={{
        display: "block",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      Supporting text that can also become truncated
    </span>
  );
  const tooltip = (
    <Core.TooltipWrapper
      tooltipHeading={config.empty || !config.heading ? undefined : "Tooltip heading"}
      tooltipContent={config.empty || !config.content ? undefined : "Supporting tooltip content"}
      side={config.side as any}
      align={config.align as any}
      sideOffset={config.sideOffset}
      alignOffset={config.alignOffset}
      delayDuration={config.delay}
      showOnlyWhenTruncated={config.truncated}
      headingSelector={config.selectors ? ".fixture-heading" : undefined}
      contentSelector={config.selectors ? ".fixture-content" : undefined}
      className={override}
    >
      <button
        id="tip-trigger"
        ref={triggerRef}
        type="button"
        disabled={config.disabled}
        style={{ width: config.width, margin: "80px min(25vw, 300px)" }}
        onClick={() => record("trigger-click")}
      >
        {config.selectors ? (
          <span className="custom-structure">
            {heading}
            {content}
          </span>
        ) : (
          <>
            {heading}
            {content}
          </>
        )}
      </button>
    </Core.TooltipWrapper>
  );
  const modal = (
    <>
      <button id="modal-opener" type="button" onClick={() => setOpen(true)}>
        Open review
      </button>
      <Core.Modal
        title="Review"
        open={open}
        onOpenChange={(value) => {
          record(["parent", value]);
          if (!config.pinned) setOpen(value);
        }}
        size={config.size as any}
      >
        <p>Review details</p>
        <button id="inside-first" type="button">
          First action
        </button>
        <input aria-label="Modal field" />
        <button id="inside-last" type="button">
          Last action
        </button>
        <span className="openui-modal-sr-only">Screen reader detail</span>
        {config.long &&
          Array.from({ length: 30 }, (_, i) => <p key={i}>Scrollable paragraph {i}</p>)}
        {config.nestedModal && (
          <>
            <button id="nested-opener" type="button" onClick={() => setInner(true)}>
              Open nested
            </button>
            <Core.Modal
              title="Nested review"
              open={inner}
              onOpenChange={(value) => {
                record(["inner", value]);
                setInner(value);
              }}
            >
              <button id="nested-action" type="button">
                Nested action
              </button>
            </Core.Modal>
          </>
        )}
        {config.includeTooltip && tooltip}
      </Core.Modal>
    </>
  );
  const control = kind === "modal" ? modal : tooltip;
  return (
    <>
      <div id="unrelated">Host content</div>
      <button id="outside-before">Outside before</button>
      <section id="zone" data-ready data-config={JSON.stringify(config)}>
        {config.visible &&
          (config.theme === "none" ? (
            control
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
                {config.nestedTheme ? (
                  <Core.ThemeProvider cssSelector="#nested-owner" mode="dark" darkTheme={custom}>
                    {control}
                  </Core.ThemeProvider>
                ) : (
                  control
                )}
              </div>
            </Core.ThemeProvider>
          ))}
      </section>
      <button id="outside-after">Outside after</button>
      {config.overrides && kind === "modal" && (
        <style>
          {
            ".openui-modal-content{padding:32px!important;background:rgb(239,68,68)!important;color:white!important;border:0!important;border-radius:0!important}.openui-modal-close:hover{color:rgb(34,197,94)!important}"
          }
        </style>
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
