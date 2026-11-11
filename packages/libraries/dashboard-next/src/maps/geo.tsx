"use client";

import { defineComponent, type ComponentRenderProps } from "@openuidev/react-lang";
import { geoAlbersUsa, geoNaturalEarth1, geoPath } from "d3-geo";
import type { FeatureCollection, Geometry } from "geojson";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod/v4";

import { formatSchema, formatValue } from "../format";
import { goodWhenSchema } from "../schema";
import {
  Empty,
  Legend,
  PartNote,
  placeLabels,
  PointLabels,
  RampKey,
  RankedList,
  SrTable,
  toNumbers,
  TooltipCard,
  toStrings,
  useRowHover,
  ViewSwitch,
} from "../shared";
import { MUTED_COLOR, sequentialColor, seriesColor } from "../theme";
import { loadShapes, retryShapes, type Shape } from "./atlas";
import { dotFill, ScatterMark } from "./scatterMark";

/* ---------- Region matching ---------- */

const normalize = (name: string) => name.toLowerCase().replace(/[^a-z]/g, "");

/** Common names and ISO codes → the names used by world-atlas. */
const COUNTRY_ALIASES: Record<string, string> = {
  us: "United States of America",
  usa: "United States of America",
  unitedstates: "United States of America",
  uk: "United Kingdom",
  gb: "United Kingdom",
  gbr: "United Kingdom",
  greatbritain: "United Kingdom",
  england: "United Kingdom",
  de: "Germany",
  deu: "Germany",
  fr: "France",
  fra: "France",
  ca: "Canada",
  can: "Canada",
  au: "Australia",
  aus: "Australia",
  in: "India",
  ind: "India",
  br: "Brazil",
  bra: "Brazil",
  jp: "Japan",
  jpn: "Japan",
  cn: "China",
  chn: "China",
  es: "Spain",
  esp: "Spain",
  it: "Italy",
  ita: "Italy",
  nl: "Netherlands",
  nld: "Netherlands",
  holland: "Netherlands",
  se: "Sweden",
  swe: "Sweden",
  no: "Norway",
  nor: "Norway",
  dk: "Denmark",
  dnk: "Denmark",
  fi: "Finland",
  fin: "Finland",
  ie: "Ireland",
  irl: "Ireland",
  pl: "Poland",
  pol: "Poland",
  pt: "Portugal",
  prt: "Portugal",
  ch: "Switzerland",
  che: "Switzerland",
  at: "Austria",
  aut: "Austria",
  be: "Belgium",
  bel: "Belgium",
  mx: "Mexico",
  mex: "Mexico",
  ar: "Argentina",
  arg: "Argentina",
  co: "Colombia",
  col: "Colombia",
  cl: "Chile",
  chl: "Chile",
  za: "South Africa",
  zaf: "South Africa",
  ng: "Nigeria",
  nga: "Nigeria",
  eg: "Egypt",
  egy: "Egypt",
  ke: "Kenya",
  ken: "Kenya",
  sg: "Singapore",
  sgp: "Singapore",
  id: "Indonesia",
  idn: "Indonesia",
  ph: "Philippines",
  phl: "Philippines",
  vn: "Vietnam",
  vnm: "Vietnam",
  th: "Thailand",
  tha: "Thailand",
  my: "Malaysia",
  mys: "Malaysia",
  kr: "South Korea",
  kor: "South Korea",
  korea: "South Korea",
  southkorea: "South Korea",
  tw: "Taiwan",
  twn: "Taiwan",
  il: "Israel",
  isr: "Israel",
  tr: "Turkey",
  tur: "Turkey",
  turkiye: "Turkey",
  ae: "United Arab Emirates",
  are: "United Arab Emirates",
  uae: "United Arab Emirates",
  sa: "Saudi Arabia",
  sau: "Saudi Arabia",
  ru: "Russia",
  rus: "Russia",
  russianfederation: "Russia",
  ua: "Ukraine",
  ukr: "Ukraine",
  nz: "New Zealand",
  nzl: "New Zealand",
  cz: "Czechia",
  cze: "Czechia",
  czechrepublic: "Czechia",
  ro: "Romania",
  rou: "Romania",
  hu: "Hungary",
  hun: "Hungary",
  gr: "Greece",
  grc: "Greece",
  pk: "Pakistan",
  pak: "Pakistan",
  bd: "Bangladesh",
  bgd: "Bangladesh",
  pe: "Peru",
  per: "Peru",
};

const US_STATES: Record<string, string> = {
  al: "Alabama",
  ak: "Alaska",
  az: "Arizona",
  ar: "Arkansas",
  ca: "California",
  co: "Colorado",
  ct: "Connecticut",
  de: "Delaware",
  dc: "District of Columbia",
  fl: "Florida",
  ga: "Georgia",
  hi: "Hawaii",
  id: "Idaho",
  il: "Illinois",
  in: "Indiana",
  ia: "Iowa",
  ks: "Kansas",
  ky: "Kentucky",
  la: "Louisiana",
  me: "Maine",
  md: "Maryland",
  ma: "Massachusetts",
  mi: "Michigan",
  mn: "Minnesota",
  ms: "Mississippi",
  mo: "Missouri",
  mt: "Montana",
  ne: "Nebraska",
  nv: "Nevada",
  nh: "New Hampshire",
  nj: "New Jersey",
  nm: "New Mexico",
  ny: "New York",
  nc: "North Carolina",
  nd: "North Dakota",
  oh: "Ohio",
  ok: "Oklahoma",
  or: "Oregon",
  pa: "Pennsylvania",
  ri: "Rhode Island",
  sc: "South Carolina",
  sd: "South Dakota",
  tn: "Tennessee",
  tx: "Texas",
  ut: "Utah",
  vt: "Vermont",
  va: "Virginia",
  wa: "Washington",
  wv: "West Virginia",
  wi: "Wisconsin",
  wy: "Wyoming",
};

function shapeName(label: string, region: "world" | "us") {
  const key = normalize(label);
  if (region === "us") return US_STATES[key] ?? label;
  return COUNTRY_ALIASES[key] ?? label;
}

/** Readable name for the ranked list: "US" → "United States", "NY" → "New York". */
function displayName(label: string, region: "world" | "us") {
  const name = shapeName(label, region);
  if (name === label) return label;
  return name === "United States of America" ? "United States" : name;
}

/* ---------- Shapes, loaded on first use ---------- */

/** The region's shapes; failed once the atlas couldn't load, so the card says so instead of loading forever. */
function useShapes(region: "world" | "us") {
  const [shapes, setShapes] = useState<Shape[] | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let live = true;
    setFailed(false);
    loadShapes(region).then(
      (loaded) => live && setShapes(loaded),
      () => {
        retryShapes(region); // try again on the next mount
        if (live) setFailed(true);
      },
    );
    return () => {
      live = false;
    };
  }, [region]);
  return { shapes, failed };
}

function MapFailed() {
  return (
    <Empty
      state="error"
      title="The map didn’t load"
      hint="The values are in the list."
      height={280}
    />
  );
}

/* ---------- GeoMap ---------- */

const geoMapSchema = z.object({
  region: z.enum(["world", "us"]),
  labels: z.array(z.string()),
  values: z.array(z.number()),
  format: formatSchema.optional(),
  previous: z.array(z.number()).optional(),
  goodWhen: goodWhenSchema.optional(),
  limit: z.number().optional(),
  view: z.enum(["count", "total"]).optional(),
});

type GeoView = "count" | "total";
const GEO_VIEWS: { value: GeoView; label: string }[] = [
  { value: "count", label: "Count" },
  { value: "total", label: "% of total" },
];

const WIDTH = 760;

export const GeoMap = defineComponent({
  name: "GeoMap",
  props: geoMapSchema,
  description:
    'Choropleth with a ranked list of every region (limit keeps the top N). region "world" takes country names or ISO codes ("DE", "GBR"); "us" takes state names or codes ("NY"). A switch reads regions as counts or % of total (view "total" opens on shares); hovering the map or the list highlights the same region in both. Use width "two-thirds" or "full".',
  component: function GeoMapView({ props }: ComponentRenderProps<z.infer<typeof geoMapSchema>>) {
    const region = props.region === "us" ? "us" : "world";
    const { shapes, failed } = useShapes(region);
    const [hover, setHover] = useState<{ name: string; x: number; y: number } | null>(null);
    // Hooks stay above the early return: a map can render empty mid-stream, then fill.
    const [desc, setDesc] = useState(true);
    const [viewChoice, setView] = useState<GeoView | null>(null);
    const view: GeoView = viewChoice ?? props.view ?? "count";
    const listHover = useRowHover();

    const labels = toStrings(props.labels);
    // Keyed on the props themselves: toStrings and toNumbers return new arrays every render.
    const byName = useMemo(() => {
      const values = toNumbers(props.values);
      const previous = toNumbers(props.previous);
      const map = new Map<string, { label: string; value: number; previous: number | null }>();
      toStrings(props.labels).forEach((label, i) => {
        const value = values[i];
        if (typeof value === "number")
          map.set(normalize(shapeName(label, region)), {
            label,
            value,
            previous: previous[i] ?? null,
          });
      });
      return map;
    }, [props.labels, props.values, props.previous, region]);

    const height = region === "us" ? 440 : 380;
    const paths = useMemo(() => {
      if (!shapes) return [];
      const collection = { type: "FeatureCollection", features: shapes } as FeatureCollection<
        Geometry,
        { name: string }
      >;
      const projection = (region === "us" ? geoAlbersUsa() : geoNaturalEarth1()).fitSize(
        [WIDTH, height],
        collection,
      );
      const path = geoPath(projection);
      return shapes.map((shape) => ({ name: shape.properties.name, d: path(shape) ?? "" }));
    }, [shapes, region, height]);

    const mapped = new Set(paths.map((shape) => normalize(shape.name)));
    if (!labels.length) return <Empty />;
    const known = [...byName.values()];
    // Count, or each region's share of the whole (and of the previous whole, for its change).
    const switchable = known.every((entry) => entry.value >= 0);
    const shown: GeoView = switchable ? view : "count";
    const total = known.reduce((sum, entry) => sum + entry.value, 0) || 1;
    const prevTotal = known.reduce((sum, entry) => sum + (entry.previous ?? 0), 0) || 1;
    const read = (entry: { value: number }) =>
      shown === "total" ? (entry.value / total) * 100 : entry.value;
    const readPrev = (entry: { previous: number | null }) =>
      entry.previous === null
        ? null
        : shown === "total"
          ? (entry.previous / prevTotal) * 100
          : entry.previous;
    const format = shown === "total" ? "percent" : props.format;
    const min = Math.min(...known.map(read));
    const max = Math.max(...known.map(read));
    // Every region, as on the Leaderboard; limit keeps the top N only when a program sets it.
    const top = [...known].sort((a, b) => b.value - a.value).slice(0, props.limit ?? undefined);
    const hovered = hover ? byName.get(normalize(hover.name)) : undefined;
    // Linked hover: a hovered country lights its list row, a hovered row outlines its country.
    const keyOf = (label: string) => normalize(shapeName(label, region));
    const activeKey = hover
      ? normalize(hover.name)
      : listHover.active !== null
        ? keyOf(listHover.active)
        : null;
    const tip = (entry: { label: string; value: number; previous: number | null }) => (
      <TooltipCard
        title={displayName(entry.label, region)}
        format={format}
        goodWhen={props.goodWhen}
        rows={[
          {
            name: "Now",
            color: "var(--openui-dashboard-series-1)",
            value: read(entry),
            previous: readPrev(entry),
          },
          ...(entry.previous !== null
            ? [{ name: "Previous", color: MUTED_COLOR, value: readPrev(entry) }]
            : []),
          ...(shown === "count" && switchable
            ? [
                {
                  name: "Share of total",
                  color: "transparent",
                  value: (entry.value / total) * 100,
                  format: "percent" as const,
                  mark: <span className="openui-dashboard-tip-dot" />,
                },
              ]
            : []),
        ]}
      />
    );
    const activePath = activeKey
      ? paths.find((shape) => normalize(shape.name) === activeKey)
      : undefined;

    return (
      <div className="openui-dashboard-geo">
        {switchable ? (
          <ViewSwitch label="Show regions as" options={GEO_VIEWS} value={view} onChange={setView} />
        ) : null}
        <div className="openui-dashboard-geo-body">
          <div className="openui-dashboard-geo-map" onMouseLeave={() => setHover(null)}>
            {shapes ? (
              <svg
                viewBox={`0 0 ${WIDTH} ${height}`}
                style={{ width: "100%", height: "auto", display: "block" }}
                role="img"
                aria-label="Map"
              >
                {paths.map((shape) => {
                  const entry = byName.get(normalize(shape.name));
                  const fill = entry
                    ? sequentialColor(read(entry), min, max).background
                    : "var(--openui-dashboard-map-land)";
                  return (
                    <path
                      key={shape.name}
                      d={shape.d}
                      fill={fill}
                      stroke="var(--openui-dashboard-surface)"
                      strokeWidth={0.75}
                      style={{
                        transition: "opacity 120ms",
                        opacity: activeKey && activeKey !== normalize(shape.name) ? 0.75 : 1,
                      }}
                      onMouseMove={(event) => {
                        const box = (
                          event.currentTarget.ownerSVGElement?.parentElement ?? event.currentTarget
                        ).getBoundingClientRect();
                        setHover({
                          name: shape.name,
                          x: event.clientX - box.left,
                          y: event.clientY - box.top,
                        });
                      }}
                    />
                  );
                })}
                {/* The active country outlined in ink on top, whether it's hovered on the map or in the list. */}
                {activePath ? (
                  <path
                    d={activePath.d}
                    fill="none"
                    stroke="var(--openui-dashboard-ink)"
                    strokeOpacity={0.35}
                    strokeWidth={0.75}
                    strokeLinejoin="round"
                    pointerEvents="none"
                  />
                ) : null}
              </svg>
            ) : failed ? (
              <MapFailed />
            ) : (
              <div className="openui-dashboard-skel" style={{ height: 280 }} role="status">
                <span className="openui-dashboard-sr-only">Loading map</span>
              </div>
            )}
            {hover ? (
              <div
                style={{
                  position: "absolute",
                  left: hover.x + 12,
                  top: hover.y + 12,
                  pointerEvents: "none",
                  zIndex: 5,
                }}
              >
                {hovered ? (
                  tip(hovered)
                ) : (
                  <TooltipCard
                    title={hover.name}
                    rows={[
                      { name: "No data", color: "var(--openui-dashboard-map-land)", value: null },
                    ]}
                  />
                )}
              </div>
            ) : null}
          </div>
          {/* The sort flips the reading order of the same top entries; a hovered row outlines its region. */}
          <RankedList
            side
            title={
              props.limit
                ? region === "us"
                  ? "Top states"
                  : "Top countries"
                : region === "us"
                  ? "States"
                  : "Countries"
            }
            hover={listHover}
            items={top.map((entry) => ({
              key: entry.label,
              name: (
                <>
                  {displayName(entry.label, region)}
                  {shapes && !mapped.has(keyOf(entry.label)) ? (
                    <span
                      style={{
                        marginLeft: 6,
                        fontWeight: 400,
                        fontSize: 11,
                        color: "var(--openui-dashboard-ink-muted)",
                      }}
                    >
                      not on map
                    </span>
                  ) : null}
                </>
              ),
              value: read(entry),
              previous: readPrev(entry),
              linked: activeKey === keyOf(entry.label),
              tip: () => tip(entry),
            }))}
            max={max}
            format={format}
            goodWhen={props.goodWhen}
            desc={desc}
            onSort={() => setDesc((value) => !value)}
            watch={shown}
          />
        </div>
        <RampKey
          className="openui-dashboard-geo-legend"
          low={formatValue(min, format, { axis: true })}
          high={formatValue(max, format, { axis: true })}
          ramp="seq"
        />
      </div>
    );
  },
});

/* ---------- PointMap: values at places ---------- */

const pointMapSchema = z.object({
  region: z.enum(["world", "us"]),
  labels: z.array(z.string()),
  lats: z.array(z.number()),
  lons: z.array(z.number()),
  values: z.array(z.number()),
  format: formatSchema.optional(),
  valueLabel: z.string().optional(),
  groups: z.array(z.string()).optional(),
  previous: z.array(z.number()).optional(),
  goodWhen: goodWhenSchema.optional(),
});

export const PointMap = defineComponent({
  name: "PointMap",
  props: pointMapSchema,
  description:
    'Values at places (stores, cities, offices, data centres) as circles sized by value (area, not radius) on a world or US map, with a ranked list beside it. lats/lons in degrees. valueLabel names the measure ("Headcount"). groups gives each place a type, drawn as its own colour and shape. previous adds each place\'s change, coloured by goodWhen. The 8 biggest places label themselves. For values by country or US state, use GeoMap; give it width two-thirds or full.',
  component: function PointMapView({
    props,
  }: ComponentRenderProps<z.infer<typeof pointMapSchema>>) {
    const region = props.region === "us" ? "us" : "world";
    const { shapes, failed } = useShapes(region);
    const [hover, setHover] = useState<number | null>(null);
    const [activeGroup, setActiveGroup] = useState<string | null>(null);
    const [desc, setDesc] = useState(true);
    const listHover = useRowHover();

    const labels = toStrings(props.labels);
    const lats = toNumbers(props.lats);
    const lons = toNumbers(props.lons);
    const values = toNumbers(props.values);
    const previous = toNumbers(props.previous);
    const groupOf = props.groups ? toStrings(props.groups) : null;
    const height = region === "us" ? 440 : 380;
    const projected = useMemo(() => {
      if (!shapes) return null;
      const collection = { type: "FeatureCollection", features: shapes } as FeatureCollection<
        Geometry,
        { name: string }
      >;
      const projection = (region === "us" ? geoAlbersUsa() : geoNaturalEarth1()).fitSize(
        [WIDTH, height],
        collection,
      );
      const path = geoPath(projection);
      return {
        land: shapes.map((shape) => ({ name: shape.properties.name, d: path(shape) ?? "" })),
        project: projection,
      };
    }, [shapes, region, height]);

    if (!labels.length) return <Empty />;
    const known = values.filter((v): v is number => v !== null && v > 0);
    const max = known.length ? Math.max(...known) : 1;
    // Area encodes value: radius grows with the square root.
    const radius = (value: number) => 3 + Math.sqrt(value / max) * 18;
    // Groups take a colour each, in first-seen order; past eight, the rest share a grey Other.
    const seen = groupOf ? [...new Set(groupOf.filter(Boolean))] : [];
    const groups = seen.length > 8 ? seen.slice(0, 7) : seen;
    const folded = seen.length > 8;
    const groupIndex = (i: number) => (groupOf ? groups.indexOf(groupOf[i] ?? "") : 0);
    const colorOf = (i: number) => (groupIndex(i) < 0 ? MUTED_COLOR : seriesColor(groupIndex(i))!);
    const places = labels
      .map((label, i) => {
        const lat = lats[i]!;
        const lon = lons[i]!;
        const value = values[i]!;
        if (lat === null || lon === null || value === null || !projected) return null;
        const at = projected.project([lon, lat]);
        const group = groupOf?.[i] ?? "";
        return at
          ? {
              label,
              value,
              previous: previous[i] ?? null,
              group: folded && !groups.includes(group) ? "Other" : group,
              x: at[0],
              y: at[1],
              i,
            }
          : null;
      })
      .filter(
        (
          point,
        ): point is {
          label: string;
          value: number;
          previous: number | null;
          group: string;
          x: number;
          y: number;
          i: number;
        } => point !== null,
      );
    // Places with a value but no position on this map (missing coordinates, or outside the US projection) are named, not dropped.
    const placedSet = new Set(places.map((point) => point.i));
    const unplaced = projected
      ? labels.filter((_, i) => values[i] !== null && !placedSet.has(i))
      : [];
    // Largest first, so small circles stay on top and hoverable.
    const points = [...places].sort((a, b) => b.value - a.value);
    const labelled = new Set(points.slice(0, 8).map((point) => point.i));
    // Hovering a dot, a list row or a legend key lights the same place (or group) everywhere.
    const listActive = listHover.active !== null ? labels.indexOf(listHover.active) : null;
    const active = hover ?? listActive;
    const lit = (point: { i: number; group: string }) =>
      active !== null
        ? active === point.i
        : activeGroup !== null
          ? point.group === activeGroup
          : true;
    const anyActive = active !== null || activeGroup !== null;
    const hovered = hover === null ? null : (points.find((point) => point.i === hover) ?? null);
    const name = props.valueLabel ?? "Value";
    const tip = (point: {
      label: string;
      value: number;
      previous: number | null;
      group: string;
      i: number;
    }) => (
      <TooltipCard
        title={point.group ? `${point.label} · ${point.group}` : point.label}
        format={props.format}
        goodWhen={props.goodWhen}
        rows={[
          { name, color: colorOf(point.i), value: point.value, previous: point.previous },
          ...(point.previous !== null
            ? [{ name: "Previous", color: MUTED_COLOR, value: point.previous }]
            : []),
        ]}
      />
    );
    // The size key: three dots at the smallest, middle and largest values, drawn like the map's.
    const sorted = [...known].sort((a, b) => a - b);
    const steps = sorted.length
      ? [
          ...new Set([
            sorted[0]!,
            sorted[Math.floor(sorted.length / 2)]!,
            sorted[sorted.length - 1]!,
          ]),
        ]
      : [];

    return (
      <div className="openui-dashboard-geo">
        {groups.length ? (
          <Legend
            entries={[
              ...groups.map((group, g) => ({ name: group, color: seriesColor(g)! })),
              ...(folded ? [{ name: "Other", color: MUTED_COLOR }] : []),
            ]}
            onHover={setActiveGroup}
          />
        ) : null}
        <SrTable
          caption="Values by place"
          head={["Place", name]}
          rows={labels.map((label, i) => [label, formatValue(values[i], props.format)])}
        />
        <div className="openui-dashboard-geo-body">
          <div className="openui-dashboard-geo-map" onMouseLeave={() => setHover(null)}>
            {projected ? (
              <svg
                viewBox={`0 0 ${WIDTH} ${height}`}
                style={{ width: "100%", height: "auto", display: "block" }}
                role="img"
                aria-label="Map of values by place"
              >
                {projected.land.map((shape) => (
                  <path
                    key={shape.name}
                    d={shape.d}
                    fill="var(--openui-dashboard-map-land)"
                    stroke="var(--openui-dashboard-surface)"
                    strokeWidth={0.75}
                  />
                ))}
                {points.map((point) => {
                  const r = radius(point.value);
                  return (
                    <g
                      key={point.label}
                      onMouseEnter={() => setHover(point.i)}
                      style={{ transition: "opacity 150ms" }}
                    >
                      {/* Scatter's dot: fill fading with size, a subtle outline, a tiny centre; others fade to 35% on hover. */}
                      <ScatterMark
                        cx={point.x}
                        cy={point.y}
                        size={Math.PI * r * r}
                        fill={colorOf(point.i)}
                        fillOpacity={anyActive && !lit(point) ? 0.75 * 0.35 : 0.75}
                        type="circle"
                      />
                      {active === point.i ? (
                        <circle
                          cx={point.x}
                          cy={point.y}
                          r={r + 4}
                          fill="none"
                          stroke={colorOf(point.i)}
                          strokeOpacity={0.3}
                          strokeWidth={4}
                          pointerEvents="none"
                        />
                      ) : null}
                    </g>
                  );
                })}
                {/* The biggest places name themselves, on a surface halo, as Scatter's points do. */}
                {/* Names on the top 8 places, placed so none collide: bigger places first, a crowded one steps aside on a leader. */}
                <PointLabels
                  labels={placeLabels(
                    points
                      .filter((point) => labelled.has(point.i))
                      .map((point) => ({
                        key: point.i,
                        x: point.x,
                        y: point.y,
                        r: radius(point.value),
                        text: point.label,
                      })),
                    11,
                    { x: 0, y: 0, width: WIDTH, height },
                  )}
                  opacityOf={(key) =>
                    anyActive && !lit(points.find((point) => point.i === key)!) ? 0.35 : 1
                  }
                />
              </svg>
            ) : failed ? (
              <MapFailed />
            ) : (
              <div className="openui-dashboard-skel" style={{ height: 280 }} role="status">
                <span className="openui-dashboard-sr-only">Loading map</span>
              </div>
            )}
            {hovered ? (
              <div
                style={{
                  position: "absolute",
                  left: `${(hovered.x / WIDTH) * 100}%`,
                  top: `${(hovered.y / height) * 100}%`,
                  transform: "translate(12px, 12px)",
                  pointerEvents: "none",
                  zIndex: 5,
                }}
              >
                {tip(hovered)}
              </div>
            ) : null}
          </div>
          {/* The ranked list, as on GeoMap: every place by value, linked to the map both ways. */}
          <RankedList
            side
            title="Places"
            hover={listHover}
            items={points.map((point) => ({
              key: point.label,
              name: point.label,
              value: point.value,
              previous: point.previous,
              color: colorOf(point.i),
              linked: hover === point.i,
              tip: () => tip(point),
            }))}
            max={max}
            format={props.format}
            goodWhen={props.goodWhen}
            desc={desc}
            onSort={() => setDesc((value) => !value)}
          />
        </div>
        {/* The size key under the map, where GeoMap keeps its colour key: the measure's name and three graduated dots. */}
        {steps.length ? (
          <div className="openui-dashboard-legend openui-dashboard-geo-legend">
            <span
              className="openui-dashboard-size-key"
              aria-label={`${name}: ${steps[0]} to ${steps[steps.length - 1]}`}
            >
              <span className="openui-dashboard-size-name">{name}</span>
              {steps.map((v) => {
                const r = radius(v);
                return (
                  <span key={v} className="openui-dashboard-size-step">
                    <span
                      className="openui-dashboard-size-dot"
                      style={{
                        width: r * 2,
                        height: r * 2,
                        ["--openui-dashboard-dot" as string]: groups.length
                          ? MUTED_COLOR
                          : seriesColor(0),
                        ["--openui-dashboard-dot-fill" as string]: `${Math.round(dotFill(Math.PI * r * r) * 100)}%`,
                      }}
                    />
                    {formatValue(v, props.format, { axis: true })}
                  </span>
                );
              })}
            </span>
          </div>
        ) : null}
        {unplaced.length ? (
          <PartNote>
            {unplaced.length === 1
              ? `1 place not on the map: ${unplaced[0]}`
              : `${unplaced.length} places not on the map: ${unplaced.join(", ")}`}
          </PartNote>
        ) : null}
      </div>
    );
  },
});
