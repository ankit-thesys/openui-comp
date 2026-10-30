import { ComponentStyles } from "@openuidev/react-components/styles";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Signal House — Your voice, a little louder",
  description: "An independent podcast studio for your next good conversation.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ComponentStyles layer="openui" />
        {children}
      </body>
    </html>
  );
}
