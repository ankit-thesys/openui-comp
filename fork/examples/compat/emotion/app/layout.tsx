import { ComponentStyles } from "@openuidev/react-components/styles";
import type { ReactNode } from "react";
import { compatMode } from "./mode";
import Registry from "./registry";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:," />
      </head>
      <body>
        {compatMode === "layered" && (
          <style href="compat-layer-order" precedence="compat-order">
            {"@layer theme, base, openui, components, utilities;"}
          </style>
        )}
        <ComponentStyles layer={compatMode === "layered" ? "openui" : undefined} />
        <Registry>{children}</Registry>
      </body>
    </html>
  );
}
