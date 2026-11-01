import "compat-root.css";
import { ConfigureStyles } from "./configure-styles";
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ConfigureStyles />
        {children}
      </body>
    </html>
  );
}
