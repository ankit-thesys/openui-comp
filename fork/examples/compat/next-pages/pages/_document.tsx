import { Head, Html, Main, NextScript } from "next/document";
import { layered } from "../compat";
export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {layered && <style>{"@layer theme, base, openui, components, utilities;"}</style>}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
