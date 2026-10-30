import { ComponentStyles } from "@openuidev/react-components/styles";
import "compat-root.css";
import { layered } from "../compat";
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ComponentStyles layer={layered ? "openui" : undefined} />
        {children}
      </body>
    </html>
  );
}
