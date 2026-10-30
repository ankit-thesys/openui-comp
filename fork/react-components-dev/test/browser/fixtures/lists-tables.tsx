// Public-package fixture for #99: variants, measured scroll controls and real editing portals.
// Configuration comes first, ahead of the contract list's top-level await.
import "./configure-layer";

import { Button, EditableTable, ThemeProvider } from "openui-under-test";
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { migratedComponents } from "../../unit/contract/components";

const folders = [
  "ListItem",
  "ListBlock",
  "EntityList",
  "Table",
  "EditableTable",
  "MetricIndicator",
];
const params = new URLSearchParams(location.search);
function EditingExample() {
  const [data, setData] = useState([
    {
      id: "1",
      name: "Ada",
      amount: 42,
      url: "https://example.com",
      status: "ready",
      date: "2026-01-15T12:00:00.000Z",
    },
  ]);
  return (
    <section data-testid="editing" style={{ width: 680 }}>
      <EditableTable
        data={data}
        onDataChange={(next) => setData(next as typeof data)}
        columns={[
          { key: "name", header: "Name", type: "text" },
          { key: "amount", header: "Amount", type: "number" },
          { key: "url", header: "URL", type: "url" },
          {
            key: "status",
            header: "Status",
            type: "select",
            options: [
              { value: "ready", label: "Ready" },
              { value: "pending", label: "Pending" },
            ],
          },
          { key: "date", header: "Date", type: "date-single" },
        ]}
      />
      <Button data-testid="outside">Outside</Button>
      <output data-testid="saved" style={{ font: "14px/1.5 sans-serif" }}>
        {JSON.stringify(data)}
      </output>
    </section>
  );
}
createRoot(document.getElementById("root")!).render(
  <ThemeProvider mode={params.get("mode") === "dark" ? "dark" : "light"}>
    {migratedComponents
      .filter((entry) => folders.includes(entry.folder))
      .map((entry) => (
        <section key={entry.folder} data-family={entry.folder} style={{ width: 720 }}>
          {entry.elements()}
        </section>
      ))}
    <EditingExample />
  </ThemeProvider>,
);
