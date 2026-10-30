import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { compatMode } from "../mode";
import { getServerSheet } from "../sheet";
import appCss from "../app.css?url";
import overridesCss from "../overrides.css?url";

export const Route = createRootRoute({
  loader: () => getServerSheet(),
  component: Root,
});

function Root() {
  const sheet = Route.useLoaderData();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>TanStack Start streaming compatibility</title>
        {compatMode === "layered" && (
          <style data-compat-layer-order>
            {"@layer theme, base, openui, components, utilities;"}
          </style>
        )}
        <style data-openui-styles dangerouslySetInnerHTML={{ __html: sheet }} />
        <link rel="stylesheet" href={appCss} data-compat-app-css />
        <link rel="stylesheet" href={overridesCss} media="not all" data-compat-overrides />
        <HeadContent />
      </head>
      <body>
        <h1>TanStack Start: {compatMode}</h1>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
