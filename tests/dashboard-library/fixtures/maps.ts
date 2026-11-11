// Copied from preview/src/catalog.ts in dashboards-ui-library-src.
import type { ComponentDoc, RenderFixture } from "./catalog";

const card = (inner: string) => `root = Dashboard([Section("", [Row([${inner}])])])`;

export const mapsCatalog: ComponentDoc[] = [
  {
    slug: "geomap",
    name: "GeoMap",
    group: "Maps",
    summary:
      'A choropleth with a ranked list beside it, linked on hover. Region "world" takes country names or ISO codes; "us" takes state names or codes. Values colour on the sequential ramp and read as counts or shares; give it width two-thirds or full.',
    components: ["GeoMap"],
    notes: {
      region: '"world" for countries, "us" for states',
      labels: "country or state names or codes",
      format: "how values and changes read; default number",
      previous: "draws the change in the list and the tooltips",
      goodWhen:
        'colours that change: default "up", "down" when a fall is good, "neutral" for neither',
      limit: "keeps only the top N; by default the list shows every region and scrolls",
      view: '"count" (default) or "total": which reading the switch opens on',
    },
    // The specimen is built by its controls (controls.ts); this program stays as the default.
    variants: [
      {
        title: "Default",
        program: card(
          String.raw`Card("Signups by country", [GeoMap("world", ["United States", "United Kingdom", "Germany", "India", "Canada", "France", "Brazil", "Australia", "Netherlands", "Japan"], [4120, 1380, 1210, 1890, 860, 740, 690, 610, 420, 380], "number", [3820, 1290, 1150, 1520, 840, 760, 610, 590, 380, 400])], "full", "Last 30 days")`,
        ),
      },
    ],
  },
  {
    slug: "pointmap",
    name: "PointMap",
    group: "Maps",
    summary:
      "Values at places (stores, cities, offices) as circles sized by value on a world or US map, with a ranked list beside it. Places can carry a type and a previous value.",
    components: ["PointMap"],
    notes: {
      lats: "degrees",
      lons: "degrees",
      values: "circle area",
      valueLabel: "names the measure in the tooltip, list and size key",
      groups: "a type per place, drawn as its own colour and shape",
      previous: "each place’s change, in the list and the tooltip",
      goodWhen: "colours the change",
    },
    // The specimen is built by its controls (controls.ts); this program stays as the default.
    variants: [
      {
        title: "Default",
        program: card(
          String.raw`Card("Headcount by office", [PointMap("world", ["San Francisco", "Bangalore", "New York", "London", "Berlin", "Toronto", "Singapore", "Tokyo", "São Paulo", "Sydney"], [37.77, 12.97, 40.71, 51.51, 52.52, 43.65, 1.35, 35.68, -23.55, -33.87], [-122.42, 77.59, -74.01, -0.13, 13.4, -79.38, 103.82, 139.69, -46.63, 151.21], [880, 610, 540, 420, 260, 220, 180, 160, 140, 120], "number")], "full", "People · today")`,
        ),
      },
    ],
  },
];

export const mapsFixtures: RenderFixture[] = [
  { name: "GeoMap", program: mapsCatalog[0]!.variants[0]!.program, text: "4,120" },
  { name: "PointMap", program: mapsCatalog[1]!.variants[0]!.program, text: "San Francisco" },
];
