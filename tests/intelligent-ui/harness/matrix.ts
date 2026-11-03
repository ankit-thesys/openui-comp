/**
 * The host matrix: every way the host page is set up. Each entry is one Playwright project, so a
 * report names the host a failure happened on. The tracer runs one host; #201 adds React 18, dark
 * mode, no ThemeProvider and 390px by adding entries here.
 */
export type Host = {
  /** React major the host is built with. Each version is its own build, served on its own port. */
  react: "19" | "18";
  theme: "light" | "dark";
  /** Whether the library's optional ThemeProvider wraps the output. */
  provider: boolean;
  width: number;
};

export const hosts: Host[] = [
  { react: "19", theme: "light", provider: true, width: 1280 },
  { react: "18", theme: "light", provider: true, width: 1280 },
];

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
