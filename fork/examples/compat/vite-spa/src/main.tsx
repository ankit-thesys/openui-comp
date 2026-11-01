import {
  Button,
  Card,
  Input,
  MiniLineChart,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ThemeProvider,
} from "@openuidev/react-components";
import { createRoot } from "react-dom/client";
import "./app.css";
import { compatMode } from "./configure";
import overrideUrl from "./overrides.css?url";

// A real app stylesheet, loaded after the component sheet. The smoke helper enables its media
// only after checking the untouched default theme. It never injects replacement test CSS.
const overrides = document.createElement("link");
overrides.rel = "stylesheet";
overrides.href = overrideUrl;
overrides.media = "not all";
overrides.dataset["compatOverrides"] = "";
document.head.append(overrides);

createRoot(document.getElementById("root")!).render(
  <ThemeProvider mode="light">
    <main className="compat-main" data-compat-ready data-compat-mode={compatMode}>
      <h1>Vite SPA: {compatMode}</h1>
      <Button>Continue</Button>
      <Card variant="clear">Card content</Card>
      <Input aria-label="Name" placeholder="Name" />
      <Select>
        <SelectTrigger aria-label="Choose an option">
          <SelectValue placeholder="Choose" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="one">One</SelectItem>
          <SelectItem value="two">Two</SelectItem>
        </SelectContent>
      </Select>
      <Tabs defaultValue="overview">
        <TabsList variant="title">
          <TabsTrigger value="overview" text="Overview" />
          <TabsTrigger value="activity" text="Activity" />
        </TabsList>
        <TabsContent value="overview">Overview panel</TabsContent>
        <TabsContent value="activity">Activity panel</TabsContent>
      </Tabs>
      <MiniLineChart data={[1, -2, 3]} variant="linear" size={120} isAnimationActive={false} />
    </main>
  </ThemeProvider>,
);
