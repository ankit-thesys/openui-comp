import { ComponentStyles } from "@openuidev/react-components/styles";
import type { ReactNode } from "react";
import { compatMode } from "./mode";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:," />
        {compatMode === "layered" && (
          <style>{"@layer theme, base, openui, components, utilities;"}</style>
        )}
      </head>
      <body>
        <ComponentStyles layer={compatMode === "layered" ? "openui" : undefined} />
        {children}
      </body>
    </html>
  );
}
