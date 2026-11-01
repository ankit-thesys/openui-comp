"use client";
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
import styled, { createGlobalStyle } from "styled-components";
const Global = createGlobalStyle`.host-global { color: rgb(17, 34, 51); }`;
const Host = styled.div<{ $active?: boolean }>`
  background-color: ${(props) => (props.$active ? "rgb(65, 43, 21)" : "rgb(21, 43, 65)")};
  padding: 13px;
`;

export default function Fixture() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/overrides.css";
    link.media = "not all";
    link.dataset["compatOverrides"] = "";
    document.head.append(link);
    return () => link.remove();
  }, []);
  return (
    <ThemeProvider mode="light">
      <main className="compat-main" data-compat-ready data-compat-mode={compatMode}>
        <h1>styled-components: {compatMode}</h1>
        <Global />
        <p className="host-global" data-host-global>
          Global host
        </p>
        <Host data-host-styled>Styled host</Host>
        <Host data-host-dynamic $active={count > 0}>
          {count > 0 ? "Updated host" : "Initial host"}
        </Host>
        <button onClick={() => setCount(count + 1)}>Update host</button>
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
