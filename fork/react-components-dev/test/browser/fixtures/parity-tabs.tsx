// Every TabsList variant with an active and an inactive trigger, plus an overflowing list that
// shows its scroll button, for the parity snapshot. Bundled twice: against the current package and
// against the #72 baseline source. Part classes are the same in both, so parts are named by them.
import { Tabs, TabsContent, TabsList, TabsTrigger, ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";

const variants = [
  "title",
  "iconTitle",
  "iconTitleSubtext",
  "imageTitle",
  "imageTitleSubtext",
] as const;
const mode = new URLSearchParams(location.search).get("mode") === "dark" ? "dark" : "light";
const image =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 4"><rect width="4" height="4" fill="teal"/></svg>',
  );

const tabsParts = JSON.stringify({
  container: ".openui-tabs-list-container",
  list: ".openui-tabs-list",
  indicator: ".openui-tabs-indicator",
  content: ".openui-tabs-content",
  inner: ".openui-tabs-content-inner",
  scrollContainer: ".openui-tabs-scroll-button-container-right",
  scrollButton: ".openui-tabs-scroll-button",
});
const triggerParts = JSON.stringify({
  image: ".openui-tabs-trigger-image",
  img: ".openui-tabs-trigger-image img",
  icon: ".openui-tabs-trigger-icon",
  svg: ".openui-tabs-trigger-icon svg",
  content: ".openui-tabs-trigger-content",
  text: ".openui-tabs-trigger-text",
  subtext: ".openui-tabs-trigger-subtext",
});

const Icon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24">
    <circle cx="12" cy="12" r="10" />
  </svg>
);

const parts = (variant: (typeof variants)[number]) => ({
  icon: variant.startsWith("icon") ? <Icon /> : undefined,
  image: variant.startsWith("image") ? image : undefined,
  subtext: variant.endsWith("Subtext") ? "Details" : undefined,
});

createRoot(document.getElementById("root")!).render(
  <ThemeProvider mode={mode}>
    {variants.map((variant) => (
      <Tabs
        key={variant}
        defaultValue="first"
        data-parity-case={`${variant}/tabs`}
        data-parity-parts={tabsParts}
      >
        <TabsList variant={variant}>
          {(["first", "second"] as const).map((value) => (
            <TabsTrigger
              key={value}
              value={value}
              text={value === "first" ? "Overview" : "Activity"}
              {...parts(variant)}
              data-parity-case={`${variant}/trigger-${value === "first" ? "active" : "inactive"}`}
              data-parity-parts={triggerParts}
            />
          ))}
        </TabsList>
        <TabsContent value="first">Panel</TabsContent>
      </Tabs>
    ))}
    <div style={{ width: 240 }}>
      <Tabs defaultValue="t0" data-parity-case="overflow/tabs" data-parity-parts={tabsParts}>
        <TabsList>
          {Array.from({ length: 8 }, (_, i) => (
            <TabsTrigger key={i} value={`t${i}`} text={`Section ${i + 1}`} />
          ))}
        </TabsList>
      </Tabs>
    </div>
  </ThemeProvider>,
);
