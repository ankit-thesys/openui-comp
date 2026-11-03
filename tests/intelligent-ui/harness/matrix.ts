/**
 * The host matrix: every way the host page is set up. Each entry is one Playwright project, so a
 * report names the host a failure happened on. It is every combination of a React version, a
 * theme, the library's ThemeProvider or not, and a phone or desktop width. None of the hosts has a
 * CSS reset (see host/index.html).
 */
export type Host = {
  /** React major the host is built with. Each version is its own build, served on its own port. */
  react: "19" | "18";
  theme: "light" | "dark";
  /** Whether the library's optional ThemeProvider wraps the output. */
  provider: boolean;
  width: number;
};

const reacts: Host["react"][] = ["19", "18"];
const themes: Host["theme"][] = ["light", "dark"];
const providers = [true, false];
/** A desktop window and a phone. */
export const widths = [1280, 390];

export const hosts: Host[] = reacts.flatMap((react) =>
  themes.flatMap((theme) =>
    providers.flatMap((provider) => widths.map((width) => ({ react, theme, provider, width }))),
  ),
);

export const hostName = (host: Host) =>
  `react${host.react}-${host.theme}-${host.provider ? "provider" : "noprovider"}-${host.width}`;

/**
 * The port each React build is served on. `IU_PORT_OFFSET` moves them, so two checkouts running at
 * once don't reuse each other's servers.
 */
const offset = Number(process.env["IU_PORT_OFFSET"] ?? 0);
export const ports: Record<Host["react"], number> = { "19": 4319 + offset, "18": 4318 + offset };

export const hostUrl = (host: Host, program: string) => {
  const query = new URLSearchParams({
    program,
    theme: host.theme,
    provider: host.provider ? "1" : "0",
  });
  return `http://localhost:${ports[host.react]}/?${query}`;
};
