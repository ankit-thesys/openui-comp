import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from "react-router";
import { compatMode } from "./mode";
import { getServerSheet } from "./sheet.server";
import appCss from "./app.css?url";
import overridesCss from "./overrides.css?url";

export function loader() {
  return { sheet: getServerSheet() };
}

export default function Root() {
  const { sheet } = useLoaderData<typeof loader>();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>React Router streaming compatibility</title>
        {compatMode === "layered" && (
          <style data-compat-layer-order>
            {"@layer theme, base, openui, components, utilities;"}
          </style>
        )}
        <style data-openui-styles dangerouslySetInnerHTML={{ __html: sheet }} />
        <link rel="stylesheet" href={appCss} data-compat-app-css />
        <link rel="stylesheet" href={overridesCss} media="not all" data-compat-overrides />
        <Meta />
        <Links />
      </head>
      <body>
        <h1>React Router: {compatMode}</h1>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
