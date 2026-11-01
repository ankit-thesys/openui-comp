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
import styles from "./fixture.module.css";

export default function Fixture() {
  const [override, setOverride] = useState("");
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
        <h1>next-tw3-modules: {compatMode}</h1>
        <p className="bg-[rgb(21,43,65)] p-[13px]" data-host-utility>
          Tailwind host
        </p>
        <p className={styles.host} data-host-module>
          CSS Module host
        </p>
        <button onClick={() => setOverride("tailwind")}>Use Tailwind override</button>
        <button onClick={() => setOverride("module")}>Use Module override</button>
        <Button
          className={
            override === "tailwind"
              ? "bg-[rgb(12,34,56)]"
              : override === "module"
                ? styles.component
                : undefined
          }
        >
          Continue
        </Button>
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
