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
import { useEffect, useState, type ComponentType } from "react";
import { PriceCard } from "./tiny-library";
export function App({ initialTheme }: { initialTheme: "light" | "dark" }) {
  const [theme, setTheme] = useState(initialTheme);
  const [LazyComponent, setLazy] = useState<ComponentType | null>(null);
  useEffect(() => {
    window.__compat.hydrated = true;
  }, []);
  return (
    <ThemeProvider mode={theme}>
      <main
        className="compat-main"
        data-compat-ready
        data-compat-mode={__COMPAT_MODE__}
        data-theme={theme}
      >
        <h1>lib-on-top: {__COMPAT_MODE__}</h1>
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
        <PriceCard />
        <button
          onClick={async () => {
            const module = await import("./Lazy");
            setLazy(() => module.default);
          }}
        >
          Load browser component
        </button>
        {LazyComponent && <LazyComponent />}
      </main>
    </ThemeProvider>
  );
}
