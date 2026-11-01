import { Host } from "./host";
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
import { compatMode } from "./mode";

export function App() {
  const [active, setActive] = useState(false);
  return (
    <ThemeProvider mode="light">
      <main className="compat-main" data-compat-ready data-compat-mode={compatMode}>
        <h1>Host Goober SSR: {compatMode}</h1>
        <p className="host-global" data-host-global>
          Global host
        </p>
        <Host data-host-styled $active={active}>
          Styled host
        </Host>
        <button onClick={() => setActive(!active)}>Update host</button>
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
    </ThemeProvider>
  );
}
