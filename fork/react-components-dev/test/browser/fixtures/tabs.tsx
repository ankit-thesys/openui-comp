// Tabs for the override and state specs: an icon-title list with an active and an inactive trigger,
// and an overflowing list that shows its right scroll button.
import { Tabs, TabsContent, TabsList, TabsTrigger } from "openui-under-test";
import { createRoot } from "react-dom/client";

const image =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 4"><rect width="4" height="4" fill="teal"/></svg>',
  );

const Icon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24">
    <circle cx="12" cy="12" r="10" />
  </svg>
);

createRoot(document.getElementById("root")!).render(
  <>
    <Tabs defaultValue="first" data-testid="tabs">
      <TabsList variant="iconTitleSubtext" className="app-list" data-testid="list">
        <TabsTrigger
          value="first"
          text="Overview"
          subtext="Details"
          icon={<Icon />}
          data-testid="active"
        />
        <TabsTrigger value="second" text="Activity" image={image} data-testid="inactive" />
      </TabsList>
      <TabsContent value="first" data-testid="content">
        Panel
      </TabsContent>
    </Tabs>
    <div style={{ width: 240 }}>
      <Tabs defaultValue="t0">
        <TabsList data-testid="overflow">
          {Array.from({ length: 8 }, (_, i) => (
            <TabsTrigger key={i} value={`t${i}`} text={`Section ${i + 1}`} />
          ))}
        </TabsList>
      </Tabs>
    </div>
  </>,
);
