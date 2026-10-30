import { ComponentStyles } from "@openuidev/react-components/styles";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Common Ground — A good place to do your own thing",
  description: "A neighborhood workspace for independent work and shared company.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ComponentStyles />
        {children}
      </body>
    </html>
  );
}
