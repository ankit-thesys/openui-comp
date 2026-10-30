import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import StyleRegistry from "./style-registry";

export const metadata: Metadata = {
  title: "Signal House — Your voice, a little louder",
  description: "An independent podcast studio for your next good conversation.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* The layer order, then the library's sheet, as the library README's recipe puts them.
            Next hoists globals.css's <link> above these, and that sheet opens with the same
            order, so the order holds either way; these keep it if the link ever comes later. */}
        <style>{"@layer theme, base, openui, components, utilities;"}</style>
        <style id="openui-styles" />
      </head>
      <body>
        <StyleRegistry>{children}</StyleRegistry>
      </body>
    </html>
  );
}
