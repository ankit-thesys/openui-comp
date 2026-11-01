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
import { Suspense, use, useEffect, useState } from "react";

declare const __COMPAT_MODE__: "layered" | "unlayered";
export const compatMode = __COMPAT_MODE__;

export function App({ gate }: { gate?: Promise<void> }) {
  return (
    <ThemeProvider mode="light">
      <main className="compat-main" data-compat-ready data-compat-mode={compatMode}>
        <h1>Vite streaming SSR: {compatMode}</h1>
        <Button>Continue</Button>
        <Suspense fallback={<p data-stream-fallback>Waiting for samples…</p>}>
          <StreamedSamples gate={gate} />
        </Suspense>
      </main>
    </ThemeProvider>
  );
}

function StreamedSamples({ gate }: { gate?: Promise<void> }) {
  if (gate) use(gate);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return (
    <section data-streamed data-hydrated={hydrated}>
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
    </section>
  );
}
