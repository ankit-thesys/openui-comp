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
import { useEffect, useState } from "react";
import { compatMode } from "./mode";

// All samples arrive through the deferred boundary, after the head has already streamed.
export function Samples({ message }: { message: string }) {
  const [hydrated, setHydrated] = useState(false);
  const [clicks, setClicks] = useState(0);
  useEffect(() => setHydrated(true), []);
  return (
    <ThemeProvider mode="light">
      <main
        className="compat-main"
        data-compat-ready
        data-compat-mode={compatMode}
        data-compat-hydrated={hydrated ? "true" : "false"}
      >
        <h2>{message}</h2>
        <Button onClick={() => setClicks((value) => value + 1)}>Continue: {clicks}</Button>
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
