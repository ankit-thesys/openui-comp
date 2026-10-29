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
      <body>
        <StyleRegistry>{children}</StyleRegistry>
      </body>
    </html>
  );
}
