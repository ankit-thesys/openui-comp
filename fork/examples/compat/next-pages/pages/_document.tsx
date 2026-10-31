import { getComponentStyles } from "@openuidev/react-components/styles";
import { Head, Html, Main, NextScript } from "next/document";
import { layered } from "../compat";
export default function Document() {
  const css = getComponentStyles({ layer: layered ? "openui" : undefined });
  return (
    <Html lang="en">
      <Head>
        {layered && <style>{"@layer theme, base, openui, components, utilities;"}</style>}
        <style data-openui-styles dangerouslySetInnerHTML={{ __html: css }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
