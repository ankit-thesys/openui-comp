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
import { useState } from "react";
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

function App() {
  const [utilities, setUtilities] = useState(false);
  return (
    <ThemeProvider mode="light">
      <main className="compat-main" data-compat-ready data-compat-mode={compatMode}>
        <h1>Vite + Tailwind 4: {compatMode}</h1>
        <Button className={utilities ? "bg-red-500 rounded-none px-8" : undefined}>Continue</Button>
        <div className="bg-red-500 rounded-none px-8" data-utility-reference>
          Utility reference
        </div>
        <button type="button" data-preflight onClick={() => setUtilities(true)}>
          Enable utilities
        </button>
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
    </ThemeProvider>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
