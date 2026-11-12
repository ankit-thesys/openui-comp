import { inSchema } from "../catalogCoverage";
// Copied from preview/src/examples.ts in dashboards-ui-library-src.
// Only the generator has strict indexed-access annotations; the dashboard programs are verbatim.
/**
 * Rich example dashboards for testing the whole experience: diverse domains,
 * dense data, varied layouts, and every component family in realistic use.
 *
 * Every filter changes what is shown. With data written into the program, a
 * filter's $variable keys the data it changes (k[$period][$channel].rev), so
 * the lookups below are generated once from a few base numbers, with seeded
 * variation: they read as measured, but never change between loads.
 */

export type Example = { slug: string; title: string; description: string; source: string };

const w12 = `w = ["Aug 10", "Aug 17", "Aug 24", "Aug 31", "Sep 7", "Sep 14", "Sep 21", "Sep 28", "Oct 5", "Oct 12", "Oct 19", "Oct 26"]`;

/* ---------- Writing generated data as OpenUI Lang ---------- */

/** A small deterministic generator, as in controls.ts. */
const seeded = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

/** A lookup keyed by a filter's values; its keys are written quoted, as the hand-written programs do. */
class Lookup {
  readonly entries: Record<string, unknown>;
  constructor(entries: Record<string, unknown>) {
    this.entries = entries;
  }
}
const by = <K extends string>(keys: readonly K[], value: (key: K, i: number) => unknown) =>
  new Lookup(Object.fromEntries(keys.map((key, i) => [key, value(key, i)])));

/** A value as OpenUI Lang: lookups with quoted keys, records with bare ones. */
const lit = (value: unknown): string => {
  if (value instanceof Lookup)
    return `{${Object.entries(value.entries)
      .map(([k, v]) => `"${k}": ${lit(v)}`)
      .join(", ")}}`;
  if (Array.isArray(value)) return `[${value.map(lit).join(", ")}]`;
  if (value && typeof value === "object")
    return `{${Object.entries(value)
      .map(([k, v]) => `${k}: ${lit(v)}`)
      .join(", ")}}`;
  return typeof value === "string" ? JSON.stringify(value) : String(value);
};

const dp = (value: number, digits = 0) => Number(value.toFixed(digits));
const to = (value: number, step: number) => Math.round(value / step) * step;
const sum = (values: number[]) => values.reduce((total, v) => total + v, 0);
const sumEach = (arrays: number[][]) => arrays[0]!.map((_, i) => sum(arrays.map((a) => a[i]!)));

/* ---------- Retail: period × channel, region, compare ---------- */

const RETAIL_PERIODS = ["7d", "30d", "90d"] as const;
const RETAIL_FILTER = ["all", "online", "stores"] as const;
/** "All channels" also counts the marketplace, which has no chip of its own. */
const RETAIL_CHANNELS = ["online", "stores", "marketplace"] as const;
type RetailChannel = (typeof RETAIL_CHANNELS)[number];
const CMP = ["off", "prev", "yoy", "y2", "plan"] as const;
type Cmp = Exclude<(typeof CMP)[number], "off">;
/** Each comparison as a share of now, by channel: online grew fastest; stores run just under plan. */
const CMP_RATIO: Record<RetailChannel, Record<Cmp, number>> = {
  online: { prev: 0.93, yoy: 0.84, y2: 0.72, plan: 0.97 },
  stores: { prev: 0.96, yoy: 0.92, y2: 0.86, plan: 1.02 },
  marketplace: { prev: 0.9, yoy: 0.78, y2: 0.61, plan: 0.95 },
};
/** "off" reads like the first comparison, as CompareToggle's deltas do while it's off. */
const cmpKey = (key: (typeof CMP)[number]): Cmp => (key === "off" ? "prev" : key);
/** A lookup by comparison, each worked out once, with "off" the same as "prev". */
const perCmp = (value: (key: Cmp) => unknown) => {
  const once = Object.fromEntries(
    (["prev", "yoy", "y2", "plan"] as Cmp[]).map((key) => [key, value(key)]),
  );
  return by(CMP, (key) => once[cmpKey(key)]);
};
/** Weekly revenue by channel, USD thousands, Aug 10 to Oct 26. */
const RETAIL_WEEKS: Record<RetailChannel, number[]> = {
  online: [318, 325, 333, 329, 341, 347, 343, 354, 358, 364, 368, 374],
  stores: [244, 247, 252, 249, 255, 258, 256, 262, 265, 268, 270, 274],
  marketplace: [78, 80, 82, 81, 84, 86, 85, 88, 90, 92, 93, 96],
};
const AOV: Record<RetailChannel, number> = { online: 70.4, stores: 79.2, marketplace: 64.8 };
const CONVERSION: Record<RetailChannel, number> = { online: 2.6, stores: 4.1, marketplace: 3.4 };
const RETURNS: Record<RetailChannel, number> = { online: 9.2, stores: 3.4, marketplace: 7.1 };
/** A period is its last weeks, scaled to its days: 7 days one week, 30 days four, 90 days twelve. */
const SPAN: Record<(typeof RETAIL_PERIODS)[number], [number, number]> = {
  "7d": [1, 1],
  "30d": [4, 30 / 28],
  "90d": [12, 90 / 84],
};

const retail = (() => {
  const rand = seeded(3);
  const wobble = (spread: number) => 1 + (rand() - 0.5) * spread;
  const prevWeeks = Object.fromEntries(
    RETAIL_CHANNELS.map((c) => [
      c,
      Object.fromEntries(
        (["prev", "yoy", "y2", "plan"] as Cmp[]).map((k) => [
          k,
          RETAIL_WEEKS[c].map((v) => Math.round(v * CMP_RATIO[c][k] * wobble(0.05))),
        ]),
      ),
    ]),
  ) as Record<RetailChannel, Record<Cmp, number[]>>;
  const members = (c: (typeof RETAIL_FILTER)[number]): RetailChannel[] =>
    c === "all" ? [...RETAIL_CHANNELS] : [c];
  const weeks = (c: (typeof RETAIL_FILTER)[number]) =>
    sumEach(members(c).map((m) => RETAIL_WEEKS[m]));
  const weeksPrev = (c: (typeof RETAIL_FILTER)[number], k: Cmp) =>
    sumEach(members(c).map((m) => prevWeeks[m][k]));
  const total = (series: number[], p: (typeof RETAIL_PERIODS)[number]) =>
    to(sum(series.slice(-SPAN[p][0])) * SPAN[p][1] * 1000, 1000);

  // Per period and channel: revenue and orders, then rates. A rate moves less than a volume between periods.
  const leaf = (p: (typeof RETAIL_PERIODS)[number], c: (typeof RETAIL_FILTER)[number]) => {
    const parts = members(c).map((m) => {
      const aov = AOV[m] * wobble(0.03);
      const rev = total(RETAIL_WEEKS[m], p);
      const prev = (k: Cmp) => total(prevWeeks[m][k], p);
      return {
        m,
        rev,
        prev,
        orders: rev / aov,
        ordersPrev: (k: Cmp) => prev(k) / (aov * (1 - (1 - CMP_RATIO[m][k]) * 0.3)),
      };
    });
    const rev = sum(parts.map((x) => x.rev));
    const orders = to(sum(parts.map((x) => x.orders)), 10);
    const share = (x: (typeof parts)[number]) => x.rev / rev;
    const blend = (table: Record<RetailChannel, number>) =>
      sum(parts.map((x) => table[x.m] * share(x)));
    const conv = dp(blend(CONVERSION) * wobble(0.06), 1);
    const ret = dp(blend(RETURNS) * wobble(0.06), 1);
    const ratio = (k: Cmp) => sum(parts.map((x) => CMP_RATIO[x.m][k] * share(x)));
    return {
      rev,
      revPrev: perCmp((k) => sum(parts.map((x) => x.prev(k)))),
      orders,
      ordersPrev: perCmp((k) => to(sum(parts.map((x) => x.ordersPrev(k))), 10)),
      aov: dp(rev / orders, 2),
      aovPrev: perCmp((k) => dp((rev / orders) * (1 - (1 - ratio(k)) * 0.3) * wobble(0.01), 2)),
      conv,
      convPrev: perCmp((k) => dp(conv * (1 - (1 - ratio(k)) * 0.5) * wobble(0.03), 1)),
      ret,
      retPrev: perCmp((k) => dp(ret * (1 + (1 - ratio(k)) * 0.6) * wobble(0.04), 1)),
    };
  };
  const k = by(RETAIL_PERIODS, (p) => by(RETAIL_FILTER, (c) => leaf(p, c)));

  // The weekly revenue card and the Revenue sparkline: this week, the trend, and a plan line.
  const wk = by(RETAIL_FILTER, (c) => {
    const values = weeks(c);
    return {
      values,
      prev: perCmp((key) => weeksPrev(c, key)),
      now: values[values.length - 1]! * 1000,
      nowPrev: perCmp((key) => weeksPrev(c, key).slice(-1)[0]! * 1000),
      plan: to(weeksPrev(c, "plan").slice(-1)[0]!, 5),
    };
  });

  // Orders by channel, weekly: revenue over each channel's average order.
  const ordersByWeek = RETAIL_CHANNELS.map((c) =>
    RETAIL_WEEKS[c].map((v) => to((v * 1000) / (AOV[c] * wobble(0.04)), 10)),
  );

  // Channel mix: the period's revenue by channel, USD thousands. It compares channels, so the channel chip leaves it alone.
  const mix = by(RETAIL_PERIODS, (p) =>
    RETAIL_CHANNELS.map((c) => total(RETAIL_WEEKS[c], p) / 1000),
  );

  // Categories over 30 days: each channel sells its own mix.
  const CATEGORY_MIX: Record<RetailChannel, number[]> = {
    online: [0.22, 0.19, 0.15, 0.13, 0.14, 0.17],
    stores: [0.27, 0.18, 0.17, 0.15, 0.1, 0.13],
    marketplace: [0.2, 0.22, 0.14, 0.12, 0.12, 0.2],
  };
  const categories = (m: RetailChannel, k?: Cmp) =>
    CATEGORY_MIX[m].map((share) =>
      to(total(k ? prevWeeks[m][k] : RETAIL_WEEKS[m], "30d") * share * wobble(0.08), 1000),
    );
  const cat = by(RETAIL_FILTER, (c) => ({
    values: sumEach(members(c).map((m) => categories(m))),
    prev: perCmp((key) => sumEach(members(c).map((m) => categories(m, key)))),
  }));
  return { k, wk, ordersByWeek, mix, cat };
})();

/** The region filter narrows the map to its states and the leaderboard to its stores. */
const RETAIL_REGIONS = ["all", "west", "east", "central"] as const;
const STATE_REVENUE: [string, string, number][] = [
  ["CA", "west", 452000],
  ["TX", "central", 349000],
  ["NY", "east", 322000],
  ["FL", "east", 243000],
  ["WA", "west", 202000],
  ["IL", "central", 178000],
  ["MA", "east", 155000],
  ["GA", "east", 141000],
  ["CO", "west", 106000],
  ["NC", "east", 97000],
  ["OR", "west", 81000],
  ["AZ", "west", 76000],
  ["MN", "central", 67000],
  ["OH", "central", 64000],
  ["MO", "central", 46000],
];
const STORE_REVENUE: [string, string, number][] = [
  ["SoHo NYC", "east", 184000],
  ["Austin Domain", "central", 162000],
  ["Santa Monica", "west", 148000],
  ["Chicago Loop", "central", 131000],
  ["Seattle Cap Hill", "west", 118000],
  ["Boston Seaport", "east", 104000],
  ["Denver Union", "west", 96000],
  ["Miami Beach", "east", 88000],
  ["Dallas Uptown", "central", 79000],
  ["Atlanta Midtown", "east", 72000],
  ["Portland Pearl", "west", 66000],
  ["Minneapolis North Loop", "central", 58000],
];
const regional = (() => {
  const rand = seeded(9);
  const blended: Record<Cmp, number> = { prev: 0.945, yoy: 0.88, y2: 0.79, plan: 0.99 };
  const prevOf = (rows: [string, string, number][]) =>
    Object.fromEntries(
      (["prev", "yoy", "y2", "plan"] as Cmp[]).map((k) => [
        k,
        rows.map(([, , v]) => to(v * blended[k] * (1 + (rand() - 0.5) * 0.12), 1000)),
      ]),
    ) as Record<Cmp, number[]>;
  const statePrev = prevOf(STATE_REVENUE);
  const storePrev = prevOf(STORE_REVENUE);
  const pick = (rows: [string, string, number][], prev: Record<Cmp, number[]>, region: string) => {
    const keep = rows
      .map((row, i) => [row, i] as const)
      .filter(([[, r]]) => region === "all" || r === region);
    return {
      labels: keep.map(([[name]]) => name),
      values: keep.map(([[, , v]]) => v),
      prev: perCmp((key) => keep.map(([, i]) => prev[key][i])),
    };
  };
  return {
    states: by(RETAIL_REGIONS, (r) => pick(STATE_REVENUE, statePrev, r)),
    stores: by(RETAIL_REGIONS, (r) => pick(STORE_REVENUE, storePrev, r)),
  };
})();

const PERIOD_LABELS = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  "12m": "Last 12 months",
} as const;
const periodLabels = (periods: readonly (keyof typeof PERIOD_LABELS)[]) =>
  by(periods, (p) => PERIOD_LABELS[p]);

/* ---------- Marketing: period × channel ---------- */

const MKT_PERIODS = ["7d", "30d", "90d"] as const;
const MKT_CHANNELS = ["search", "social", "email", "affiliate", "organic"] as const;
type MktChannel = (typeof MKT_CHANNELS)[number];
const MKT_FILTER = ["all", ...MKT_CHANNELS] as const;
/** 30 days by channel. Organic's spend is content production; its return is the best. */
const MKT_30D: Record<
  MktChannel,
  { spend: number; visits: number; mqls: number; won: number; roas: number; prev: number }
> = {
  search: { spend: 128000, visits: 48200, mqls: 1480, won: 168, roas: 3.6, prev: 0.93 },
  social: { spend: 94000, visits: 54200, mqls: 1020, won: 96, roas: 2.4, prev: 0.97 },
  email: { spend: 24000, visits: 14100, mqls: 640, won: 74, roas: 7.1, prev: 0.88 },
  affiliate: { spend: 38000, visits: 11800, mqls: 380, won: 41, roas: 2.9, prev: 0.9 },
  organic: { spend: 12000, visits: 48000, mqls: 900, won: 112, roas: 11.8, prev: 0.86 },
};
const MKT_SCALE = { "7d": 0.24, "30d": 1, "90d": 2.92 } as const;

const marketing = (() => {
  const rand = seeded(13);
  const wobble = (spread: number) => 1 + (rand() - 0.5) * spread;
  // One channel in one period: the funnel's six steps now and last period, plus spend and attributed revenue.
  const base = (p: (typeof MKT_PERIODS)[number], c: MktChannel) => {
    const b = MKT_30D[c];
    const scale = MKT_SCALE[p] * wobble(0.08);
    const mqls = b.mqls * scale;
    const steps = [
      b.visits * scale * wobble(0.04),
      mqls * 2.35 * wobble(0.08),
      mqls,
      mqls * 0.44 * wobble(0.1),
      mqls * 0.22 * wobble(0.12),
      b.won * scale,
    ];
    // Last period: each step its own share of now, so step conversions move too.
    const prevSteps = steps.map((v) => v * b.prev * wobble(0.1));
    const spend = b.spend * MKT_SCALE[p] * wobble(0.05);
    const spendPrev = spend * wobble(0.12) * 0.96;
    return {
      steps,
      prevSteps,
      spend,
      spendPrev,
      revenue: spend * b.roas * wobble(0.1),
      revenuePrev: spendPrev * b.roas * wobble(0.14) * 0.94,
    };
  };
  const cells = Object.fromEntries(
    MKT_PERIODS.map((p) => [p, Object.fromEntries(MKT_CHANNELS.map((c) => [c, base(p, c)]))]),
  ) as Record<string, Record<MktChannel, ReturnType<typeof base>>>;
  const combine = (p: string, c: (typeof MKT_FILTER)[number]) => {
    const parts = c === "all" ? MKT_CHANNELS.map((m) => cells[p]![m]) : [cells[p]![c]];
    return {
      steps: sumEach(parts.map((x) => x.steps)),
      prevSteps: sumEach(parts.map((x) => x.prevSteps)),
      spend: sum(parts.map((x) => x.spend)),
      spendPrev: sum(parts.map((x) => x.spendPrev)),
      revenue: sum(parts.map((x) => x.revenue)),
      revenuePrev: sum(parts.map((x) => x.revenuePrev)),
    };
  };
  const k = by(MKT_PERIODS, (p) =>
    by(MKT_FILTER, (c) => {
      const x = combine(p, c);
      const steps = x.steps.map((v) => Math.round(v));
      const prevSteps = x.prevSteps.map((v) => Math.round(v));
      return {
        spend: to(x.spend, 100),
        spendPrev: to(x.spendPrev, 100),
        mqls: steps[2],
        mqlsPrev: prevSteps[2],
        cac: Math.round(x.spend / steps[5]!),
        cacPrev: Math.round(x.spendPrev / prevSteps[5]!),
        roas: dp(x.revenue / x.spend, 1),
        roasPrev: dp(x.revenuePrev / x.spendPrev, 1),
        rate: dp((steps[2]! / steps[0]!) * 100, 2),
        ratePrev: dp((prevSteps[2]! / prevSteps[0]!) * 100, 2),
        steps,
        prevSteps,
      };
    }),
  );
  // Weekly spend for the Spend sparkline, USD thousands: ten weeks, rising into the quarter.
  const weekly = by(MKT_FILTER, (c) => {
    const spend = c === "all" ? sum(MKT_CHANNELS.map((m) => MKT_30D[m].spend)) : MKT_30D[c].spend;
    return Array.from({ length: 10 }, (_, i) =>
      dp(((spend * 7) / 30 / 1000) * (0.84 + i * 0.018) * wobble(0.06), 1),
    );
  });
  // Spend by channel and two blended rates, for the period: they compare channels, so the channel filter leaves them alone.
  const mix = by(MKT_PERIODS, (p) => {
    const all = combine(p, "all");
    const paid = (steps: "steps" | "prevSteps") =>
      sum((["search", "social", "affiliate"] as MktChannel[]).map((m) => cells[p]![m][steps][2]!)) /
      all[steps][2]!;
    return {
      spend: MKT_CHANNELS.map((m) => to(cells[p]![m].spend, 100)),
      cpl: dp(all.spend / all.steps[1]!, 2),
      cplPrev: dp(all.spendPrev / all.prevSteps[1]!, 2),
      paid: dp(paid("steps") * 100, 1),
      paidPrev: dp(paid("prevSteps") * 100, 1),
    };
  });
  return { k, weekly, mix };
})();

/* ---------- Product: period × platform ---------- */

const PRODUCT_PERIODS = ["30d", "90d", "12m"] as const;
type ProductPeriod = (typeof PRODUCT_PERIODS)[number];
const PLATFORMS = ["web", "ios", "android", "desktop"] as const;
type Platform = (typeof PLATFORMS)[number];
const PLATFORM_FILTER = ["all", "web", "ios", "android"] as const;
type PlatformFilter = (typeof PLATFORM_FILTER)[number];
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
/** Weeks ending on Sundays, back from Oct 26, 2026. */
const weekLabel = (weeksAgo: number) => {
  const day = new Date(Date.UTC(2026, 9, 26 - weeksAgo * 7));
  return `${MONTH_NAMES[day.getUTCMonth()]} ${day.getUTCDate()}`;
};
/** Twelve months as 52 weeks: every third month takes five. */
const MONTH_WEEKS = [4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5];

const product = (() => {
  const rand = seeded(21);
  const wobble = (spread: number) => 1 + (rand() - 0.5) * spread;
  // Two years of weekly active users by platform: growth from about 6K, mobile gaining share.
  const WEEKS = 104;
  const shares = (t: number): Record<Platform, number> => {
    const f = t / (WEEKS - 1);
    const ios = 0.17 + f * 0.058;
    const android = 0.11 + f * 0.048;
    const desktop = 0.075 - f * 0.024;
    return { web: 1 - ios - android - desktop, ios, android, desktop };
  };
  const wau: Record<Platform, number[]> = { web: [], ios: [], android: [], desktop: [] };
  for (let t = 0; t < WEEKS; t++) {
    const total = 5900 * (18400 / 5900) ** (t / (WEEKS - 1)) * wobble(0.035);
    for (const p of PLATFORMS) wau[p].push(total * shares(t)[p] * wobble(0.03));
  }
  const series = (f: PlatformFilter) =>
    f === "all" ? sumEach(PLATFORMS.map((p) => wau[p])) : wau[f];
  const daily = (values: number[]) => values.map((v) => v * 0.41 * wobble(0.05));
  /** A window of weeks, or months of weeks for 12m, in thousands; back = how many periods before now. */
  const windowOf = (values: number[], period: ProductPeriod, back: number) => {
    if (period === "12m") {
      const end = values.length - back * 52;
      const months: number[] = [];
      let at = end - 52;
      for (const n of MONTH_WEEKS) {
        months.push(sum(values.slice(at, at + n)) / n);
        at += n;
      }
      return months.map((v) => dp(v / 1000, 1));
    }
    const n = period === "30d" ? 5 : 13;
    const end = values.length - back * n;
    return values.slice(end - n, end).map((v) => dp(v / 1000, 1));
  };
  const labels = by(PRODUCT_PERIODS, (p) => {
    if (p === "12m") return Array.from({ length: 12 }, (_, i) => MONTH_NAMES[(10 + i) % 12]);
    const n = p === "30d" ? 5 : 13;
    return Array.from({ length: n }, (_, i) => weekLabel(n - 1 - i));
  });
  const au = by(PRODUCT_PERIODS, (p) =>
    by(PLATFORM_FILTER, (f) => {
      const values = series(f);
      return {
        weekly: windowOf(values, p, 0),
        previous: windowOf(values, p, 1),
        daily: windowOf(daily(values), p, 0),
      };
    }),
  );

  // Rates by platform, and how far each moved over a period of that length.
  const RATES: Record<
    PlatformFilter,
    { activation: number; d7: number; ttv: number; nps: number }
  > = {
    all: { activation: 41.2, d7: 27.9, ttv: 1080, nps: 44 },
    web: { activation: 43.1, d7: 29.4, ttv: 960, nps: 46 },
    ios: { activation: 38.2, d7: 27.1, ttv: 1380, nps: 41 },
    android: { activation: 35.6, d7: 23.8, ttv: 1500, nps: 37 },
  };
  const MOVE: Record<ProductPeriod, number> = { "30d": 1, "90d": 1.8, "12m": 3.6 };
  const AGO: Record<ProductPeriod, number> = { "30d": 4, "90d": 13, "12m": 52 };
  const SIGNUPS: Record<ProductPeriod, number> = { "30d": 4820, "90d": 13900, "12m": 47200 };
  const SIGNUP_SHARE: Record<Platform, number> = {
    web: 0.58,
    ios: 0.22,
    android: 0.15,
    desktop: 0.05,
  };
  const STEP_RATES: Record<Platform, number[]> = {
    web: [0.78, 0.82, 0.71, 0.44],
    ios: [0.69, 0.77, 0.64, 0.38],
    android: [0.66, 0.74, 0.6, 0.35],
    desktop: [0.8, 0.83, 0.73, 0.47],
  };
  const PREV_SIGNUPS: Record<ProductPeriod, number> = { "30d": 0.915, "90d": 0.87, "12m": 0.62 };
  const funnelOf = (period: ProductPeriod, p: Platform, before: boolean) => {
    let n = SIGNUPS[period] * SIGNUP_SHARE[p] * wobble(0.06) * (before ? PREV_SIGNUPS[period] : 1);
    const steps = [n];
    for (const rate of STEP_RATES[p]) {
      n *= rate * (before ? 1 - 0.04 * MOVE[period] * wobble(0.6) : wobble(0.03));
      steps.push(n);
    }
    return steps;
  };
  const k = by(PRODUCT_PERIODS, (period) =>
    by(PLATFORM_FILTER, (f) => {
      const values = series(f);
      const now = values[values.length - 1]!;
      const r = RATES[f];
      const m = MOVE[period] * wobble(0.3);
      const members: Platform[] = f === "all" ? [...PLATFORMS] : [f];
      return {
        wau: to(now, 10),
        wauPrev: to(values[values.length - 1 - AGO[period]]!, 10),
        wauTrend: windowOf(values, period === "12m" ? "12m" : "90d", 0).slice(
          period === "30d" ? -8 : 0,
        ),
        activation: dp(r.activation * wobble(0.02), 1),
        activationPrev: dp((r.activation - 2.4 * m) * wobble(0.01), 1),
        d7: dp(r.d7 * wobble(0.02), 1),
        d7Prev: dp((r.d7 - 1.3 * m) * wobble(0.01), 1),
        ttv: to(r.ttv * wobble(0.04), 10),
        ttvPrev: to(r.ttv * (1 + 0.22 * m), 10),
        nps: Math.round(r.nps * wobble(0.04)),
        npsPrev: Math.round(r.nps - 4 * m),
        steps: sumEach(members.map((p) => funnelOf(period, p, false))).map((v) => Math.round(v)),
        prevSteps: sumEach(members.map((p) => funnelOf(period, p, true))).map((v) => Math.round(v)),
      };
    }),
  );

  // Daily signups, Oct 18 to 31, with the six days before for the 7-day average.
  const DAILY = [
    154, 160, 149, 171, 166, 94, 162, 171, 158, 183, 176, 98, 91, 188, 194, 181, 203, 197, 112, 104,
  ];
  const sg = by(PLATFORM_FILTER, (f) => {
    const days = f === "all" ? DAILY : DAILY.map((v) => v * SIGNUP_SHARE[f] * wobble(0.12));
    const avg = days.slice(6).map((_, i) => sum(days.slice(i, i + 7)) / 7);
    return {
      daily: days.slice(6).map((v) => Math.round(v)),
      avg: avg.map((v) => dp(v, f === "all" ? 0 : 1)),
    };
  });
  const span = by(PRODUCT_PERIODS, (p) => ({
    label: PERIOD_LABELS[p],
    active:
      p === "12m"
        ? "Monthly average of weekly and daily users · thousands"
        : "Weekly and daily average · thousands",
  }));
  return { labels, au, k, sg, span };
})();

const HIS_EXAMPLES: Example[] = [
  {
    slug: "retail",
    title: "Retail sales",
    description: "Revenue, stores, merchandising and fulfilment for a multi-channel retailer.",
    source: String.raw`${w12}
$period = "30d"
$channel = "all"
$region = "all"
$compare = "off"
cmp = [{value: "prev", label: "Previous period"}, {value: "yoy", label: "Last year"}, {value: "y2", label: "2 years ago"}, {value: "plan", label: "Plan"}]
k = ${lit(retail.k)}
wk = ${lit(retail.wk)}
mix = ${lit(retail.mix)}
cat = ${lit(retail.cat)}
rg = ${lit(regional.states)}
st = ${lit(regional.stores)}
lbl = ${lit(periodLabels(RETAIL_PERIODS))}
root = Dashboard([fb, s1, s2, s3, s4, s5])
fb = FilterBar([PeriodPicker("period", [{value: "7d", label: "7D"}, {value: "30d", label: "30D"}, {value: "90d", label: "90D"}], $period), ChipFilter("channel", [{value: "all", label: "All channels"}, {value: "online", label: "Online"}, {value: "stores", label: "Stores"}], $channel), SelectFilter("region", "Region", [{value: "all", label: "All"}, {value: "west", label: "West"}, {value: "east", label: "East"}, {value: "central", label: "Central"}], $region), CompareToggle("Previous period", false, cmp, "compare", $compare)])
s1 = Section("", [Kpis([Kpi("Revenue", k[$period][$channel].rev, "currency-compact", k[$period][$channel].revPrev[$compare], null, null, wk[$channel].values, wk[$channel].prev[$compare]), Kpi("Orders", k[$period][$channel].orders, "compact", k[$period][$channel].ordersPrev[$compare]), Kpi("Average order", k[$period][$channel].aov, "currency-precise", k[$period][$channel].aovPrev[$compare]), Kpi("Conversion", k[$period][$channel].conv, "percent", k[$period][$channel].convPrev[$compare]), Kpi("Return rate", k[$period][$channel].ret, "percent", k[$period][$channel].retPrev[$compare], "down")])])
s2 = Section("Trends", [Row([Card("Revenue by week", [Stat(wk[$channel].now, "currency-compact", wk[$channel].nowPrev[$compare], null, "This week"), TimeSeries(w, [Series("Revenue", wk[$channel].values, wk[$channel].prev[$compare])], "area", {type: "currency", suffix: "K"}, false, [Reference("Plan", wk[$channel].plan)])], "two-thirds", "Weekly · USD thousands"), Card("Channel mix", [Donut(["Online", "Stores", "Marketplace"], mix[$period], {type: "currency", suffix: "K"}, "Revenue")], "third", lbl[$period])]), Row([Card("Orders by channel", [TimeSeries(w, [Series("Online", ${lit(retail.ordersByWeek[0])}), Series("Stores", ${lit(retail.ordersByWeek[1])}), Series("Marketplace", ${lit(retail.ordersByWeek[2])})], "bar", "number", true)], "half", "Weekly · stacked"), Card("Average order value", [TimeSeries(w, [Series("Online", [68.4, 68.9, 69.2, 70.1, 70.4, 71.2, 71.8, 72.1, 72.6, 73.0, 73.4, 73.9]), Series("Stores", [81.2, 81.0, 81.9, 82.4, 82.1, 83.0, 83.4, 83.8, 84.1, 84.6, 85.0, 85.3])], "line", "currency-precise")], "half", "Weekly")])], "Revenue, orders and average order value by week")
s3 = Section("Where it sells", [Row([Card("Revenue by state", [GeoMap("us", rg[$region].labels, rg[$region].values, "currency-compact", rg[$region].prev[$compare])], "two-thirds", "Last 30 days"), Card("Top stores", [Leaderboard(st[$region].labels, st[$region].values, "currency-compact", st[$region].prev[$compare])], "third", "Revenue · last 30 days")])], "Revenue by state and the top stores in the chosen region")
s4 = Section("Merchandising", [Row([Card("Revenue by category", [Bars(["Outerwear", "Footwear", "Denim", "Knits", "Accessories", "Activewear"], [Series("Revenue", cat[$channel].values, cat[$channel].prev[$compare])], "currency-compact")], "half", "Last 30 days"), Card("Basket size", [Bars(["1 item", "2 items", "3–4", "5–7", "8+"], [Series("Orders", [16200, 11400, 7300, 2600, 900])], "compact", "vertical")], "half", "Distribution")]), Row([Card("Store traffic by hour", [Heatmap(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], ["9", "11", "13", "15", "17", "19", "21"], [[42, 61, 88, 94, 121, 148, 96], [38, 58, 84, 91, 118, 141, 92], [41, 62, 91, 98, 124, 152, 101], [44, 66, 94, 102, 131, 160, 108], [52, 78, 110, 121, 158, 196, 134], [88, 132, 171, 184, 201, 214, 152], [71, 108, 141, 149, 161, 142, 88]], "number")], "full", "Average visitors per store · local time")])], "Categories, baskets and store traffic")
s5 = Section("Detail", [Row([Card("Revenue bridge", [Waterfall(["September", "Volume", "Price", "Returns", "Discounts"], [3020000, 240000, 85000, -62000, -73000], "currency-compact", "October")], "half", "Net revenue · September to October"), Card("Holiday targets", [Goal("Q4 revenue", 8120000, 12400000, "currency-compact", 0.46), Goal("Online share", 50.0, 55, "percent", 0.46), Goal("Return rate", 6.8, 6, "percent", null, "down"), Goal("Stockouts", 3.2, 3, "percent", null, "down")], "half", "46% through the quarter · returns and stockouts are ceilings")]), Row([Card("Top products", [Table([Column("Product", ["Alpine parka", "Trail runner", "Selvedge jean", "Merino crew", "Canvas tote", "Puffer vest", "Chelsea boot", "Rib beanie"], "primary"), Column("Stock", ["Healthy", "Healthy", "Low", "Healthy", "Backorder", "Low", "Healthy", "Healthy"], "badge", null, {"Healthy": "good", "Low": "warning", "Backorder": "bad"}), Column("Units", [4820, 4110, 3480, 3120, 2890, 2410, 2180, 1960], "bar", "number", null, null, "sum"), Column("Revenue", [912000, 534000, 418000, 281000, 87000, 241000, 392000, 59000], "number", "currency-compact", null, null, "sum"), Column("Margin", [48.2, 41.8, 52.1, 46.4, 38.9, 44.0, 51.2, 47.8], "number", "percent"), Column("Δ units", [8.4, 12.1, -4.2, 6.8, 22.4, -8.1, 3.9, 1.2], "delta", "percent"), Column("Trend", [[380, 392, 405, 398, 414, 421], [310, 322, 318, 336, 348, 352], [301, 296, 288, 292, 284, 279], [248, 252, 261, 258, 266, 271], [160, 182, 204, 231, 252, 266], [221, 214, 208, 199, 196, 190], [168, 171, 176, 181, 179, 185], [148, 151, 155, 158, 161, 163]], "sparkline")], 8, true)], "full", "Last 30 days")])])`,
  },
  {
    slug: "marketing",
    title: "Marketing funnel",
    description: "Spend to pipeline: acquisition funnel, channel efficiency and creative tests.",
    source: String.raw`$period = "30d"
$channel = "all"
$q = ""
k = ${lit(marketing.k)}
sp = ${lit(marketing.weekly)}
mix = ${lit(marketing.mix)}
lbl = ${lit(periodLabels(MKT_PERIODS))}
root = Dashboard([fb, s1, s2, s3, s4, s5])
fb = FilterBar([PeriodPicker("period", [{value: "7d", label: "7D"}, {value: "30d", label: "30D"}, {value: "90d", label: "90D"}], $period), SelectFilter("channel", "Channel", [{value: "all", label: "All"}, {value: "search", label: "Paid search"}, {value: "social", label: "Paid social"}, {value: "email", label: "Email"}, {value: "affiliate", label: "Affiliate"}, {value: "organic", label: "Organic"}], $channel), SearchFilter("q", "Search campaigns", $q), CompareToggle("Previous period")])
s1 = Section("", [Kpis([Kpi("Spend", k[$period][$channel].spend, "currency-compact", k[$period][$channel].spendPrev, "neutral", null, sp[$channel]), Kpi("MQLs", k[$period][$channel].mqls, "number", k[$period][$channel].mqlsPrev), Kpi("CAC", k[$period][$channel].cac, "currency", k[$period][$channel].cacPrev, "down"), Kpi("ROAS", k[$period][$channel].roas, "multiplier", k[$period][$channel].roasPrev), Kpi("Visit → MQL", k[$period][$channel].rate, "percent", k[$period][$channel].ratePrev)])])
s2 = Section("Funnel", [Row([Card("Acquisition funnel", [Funnel(["Visited", "Lead captured", "MQL", "SQL", "Opportunity", "Closed won"], k[$period][$channel].steps, k[$period][$channel].prevSteps)], "two-thirds", lbl[$period]), Card("Spend by channel", [Donut(["Paid search", "Paid social", "Email", "Affiliate", "Organic"], mix[$period].spend, "currency-compact", "Spend"), KeyValues([{label: "Blended CPL", value: mix[$period].cpl, format: "currency-precise", previous: mix[$period].cplPrev, goodWhen: "down"}, {label: "Paid share of MQLs", value: mix[$period].paid, format: "percent", previous: mix[$period].paidPrev}])], "third", lbl[$period])])])
s3 = Section("Journeys", [Row([Card("Visitor journey", [Flow([{from: "Paid search", to: "Landing pages", value: 48200}, {from: "Paid social", to: "Landing pages", value: 31800}, {from: "Paid social", to: "Exited", value: 22400}, {from: "Email", to: "Pricing", value: 14100}, {from: "Organic", to: "Pricing", value: 28400}, {from: "Organic", to: "Docs", value: 19600}, {from: "Landing pages", to: "Pricing", value: 36200}, {from: "Landing pages", to: "Exited", value: 43800}, {from: "Pricing", to: "Lead captured", value: 24100}, {from: "Pricing", to: "Exited", value: 54600}, {from: "Docs", to: "Lead captured", value: 6200}, {from: "Docs", to: "Exited", value: 13400}], "compact")], "full", "Sessions · last 30 days")])])
s4 = Section("Efficiency", [Row([Card("Cost per lead by channel", [Bars(["Email", "Organic social", "Affiliate", "Paid search", "Paid social", "Display"], [Series("CPL", [8.40, 14.20, 19.80, 31.20, 38.60, 54.10])], "currency-precise", null, null, "down", [Reference("Target", 30)])], "half", "Last 30 days"), Card("Campaign efficiency", [Scatter([{label: "Brand search", x: 42000, y: 6.1, size: 1240}, {label: "Competitor", x: 38000, y: 2.4, size: 820}, {label: "Lookalike 2%", x: 31000, y: 2.9, size: 760}, {label: "Retargeting", x: 18000, y: 5.2, size: 690}, {label: "Newsletter promo", x: 6200, y: 7.8, size: 410}, {label: "Podcast sponsor", x: 24000, y: 1.8, size: 280}, {label: "YouTube pre-roll", x: 29000, y: 1.1, size: 240}], "Spend", "ROAS", "currency-compact", "multiplier")], "half", "Sized by MQLs")]), Row([Card("Creative tests", [Intervals(["Benefit-led headline", "Social proof banner", "Short-form video", "Price anchoring", "Founder story", "Dark-mode screenshots"], [11.2, 6.4, 3.1, -1.8, 8.9, 0.9], [5.8, 2.1, -0.9, -5.2, 2.4, -2.6], [16.6, 10.7, 7.1, 1.6, 15.4, 4.4], "percent")], "half", "CTR lift vs control · 95% CI"), Card("Email engagement", [Heatmap(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], ["6", "9", "12", "15", "18", "21"], [[18, 42, 31, 28, 24, 12], [21, 48, 36, 31, 26, 14], [22, 51, 38, 33, 28, 15], [20, 46, 34, 30, 25, 13], [17, 38, 29, 24, 19, 10], [8, 14, 12, 11, 9, 6], [7, 12, 11, 10, 9, 6]], "percent")], "half", "Open rate by send time")])])
s5 = Section("Detail", [Row([Card("Campaigns", [Table([Column("Campaign", ["Brand search", "Competitor terms", "Lookalike 2%", "Retargeting", "Newsletter promo", "Podcast sponsor", "YouTube pre-roll", "Partner webinar"], "primary"), Column("Status", ["Active", "Active", "Learning", "Active", "Ended", "Active", "Paused", "Active"], "badge", null, {"Active": "good", "Learning": "info", "Paused": "warning", "Ended": "neutral"}), Column("Spend", [42000, 38000, 31000, 18000, 6200, 24000, 29000, 9800], "number", "currency-compact", null, null, "sum"), Column("MQLs", [1240, 820, 760, 690, 410, 280, 240, 380], "bar", "number", null, null, "sum"), Column("CPL", [33.87, 46.34, 40.79, 26.09, 15.12, 85.71, 120.83, 25.79], "number", "currency-precise", null, "down"), Column("ROAS", [6.1, 2.4, 2.9, 5.2, 7.8, 1.8, 1.1, 4.4], "number", "multiplier"), Column("Δ CTR", [0.8, -0.4, 1.2, 2.1, 0, -1.1, -0.6, 0.9], "delta", "percent")], 8, true, $q)], "full", "Filtered by the search box")]), Row([Card("Top landing pages", [Leaderboard(["/pricing", "/demo", "/templates/retail", "/blog/benchmarks", "/customers/acme", "/docs/quickstart"], [24100, 18400, 12800, 9100, 6400, 5200], "compact", [21800, 17900, 10200, 9400, 5100, 4800])], "half", "Lead captures"), Card("Source mix", [SegmentedBar(["Paid search", "Paid social", "Organic", "Email", "Affiliate", "Referral"], [48200, 54200, 48000, 14100, 11800, 7900], "compact"), KeyValues([{label: "Paid share", value: 55.6, format: "percent", previous: 58.2, goodWhen: "down"}, {label: "Branded share of search", value: 38.4, format: "percent", previous: 41.0, goodWhen: "down"}])], "half", "Sessions")])])`,
  },
  {
    slug: "product",
    title: "Product analytics",
    description: "Activation, engagement and retention: cohorts, funnels and feature adoption.",
    source: String.raw`$period = "30d"
$platform = "all"
k = ${lit(product.k)}
au = ${lit(product.au)}
ax = ${lit(product.labels)}
sg = ${lit(product.sg)}
span = ${lit(product.span)}
root = Dashboard([fb, s1, s2, s3, s4, s5])
fb = FilterBar([PeriodPicker("period", [{value: "30d", label: "30D"}, {value: "90d", label: "90D"}, {value: "12m", label: "12M"}], $period), ChipFilter("platform", [{value: "all", label: "All platforms"}, {value: "web", label: "Web"}, {value: "ios", label: "iOS"}, {value: "android", label: "Android"}], $platform), CompareToggle("Previous period")])
s1 = Section("", [Kpis([Kpi("Weekly active users", k[$period][$platform].wau, "compact", k[$period][$platform].wauPrev, "up", null, k[$period][$platform].wauTrend), Kpi("Activation", k[$period][$platform].activation, "percent", k[$period][$platform].activationPrev, null, "First project within 24h"), Kpi("D7 retention", k[$period][$platform].d7, "percent", k[$period][$platform].d7Prev), Kpi("Time to value", k[$period][$platform].ttv, "duration", k[$period][$platform].ttvPrev, "down", "Signup to first insight"), Kpi("NPS", k[$period][$platform].nps, "number", k[$period][$platform].npsPrev)])])
s2 = Section("Engagement", [Row([Card("Active users", [TimeSeries(ax[$period], [Series("Weekly", au[$period][$platform].weekly, au[$period][$platform].previous), Series("Daily average", au[$period][$platform].daily, null, "line")], "line", {type: "compact", suffix: "K"})], "two-thirds", span[$period].active), Card("Platform mix", [SegmentedBar(["Web", "iOS", "Android", "Desktop app"], [9800, 4200, 2900, 1500], "compact"), KeyValues([{label: "Multi-platform users", value: 23.4, format: "percent", previous: 20.8}, {label: "Mobile share of sessions", value: 38.2, format: "percent", previous: 35.6}])], "third", "WAU by platform")]), Row([Card("Signups and 7-day average", [TimeSeries(["Oct 18", "Oct 19", "Oct 20", "Oct 21", "Oct 22", "Oct 23", "Oct 24", "Oct 25", "Oct 26", "Oct 27", "Oct 28", "Oct 29", "Oct 30", "Oct 31"], [Series("Signups", sg[$platform].daily), Series("7-day average", sg[$platform].avg, null, "line")], "bar", "number")], "third", "Daily · last 14 days"), Card("Activation funnel", [Funnel(["Signed up", "Connected data", "First query", "First dashboard", "Invited teammate"], k[$period][$platform].steps, k[$period][$platform].prevSteps, "number", "funnel")], "two-thirds", span[$period].label)])])
s3 = Section("Retention", [Row([Card("Weekly retention", [Cohorts(["Sep 7", "Sep 14", "Sep 21", "Sep 28", "Oct 5", "Oct 12", "Oct 19", "Oct 26"], [612, 638, 641, 664, 671, 688, 702, 724], ["W0", "W1", "W2", "W3", "W4", "W5", "W6", "W7"], [[100, 44.1, 35.2, 31.4, 29.1, 27.6, 26.8, 25.9], [100, 44.8, 35.9, 31.8, 29.4, 28.1, 27.2, null], [100, 45.2, 36.4, 32.1, 29.8, 28.4, null, null], [100, 45.9, 36.8, 32.6, 30.1, null, null, null], [100, 46.2, 37.1, 32.9, null, null, null, null], [100, 46.8, 37.6, null, null, null, null, null], [100, 47.1, null, null, null, null, null, null], [100, null, null, null, null, null, null, null]])], "full", "Improving week over week · read down the columns")])])
s4 = Section("Features", [Row([Card("Adoption vs retention impact", [Scatter([{label: "Dashboards", x: 68, y: 12.4, size: 1240}, {label: "Alerts", x: 31, y: 9.8, size: 480}, {label: "Scheduled emails", x: 24, y: 7.1, size: 310}, {label: "SQL mode", x: 18, y: 11.2, size: 290}, {label: "Templates", x: 52, y: 4.2, size: 760}, {label: "Comments", x: 14, y: 2.1, size: 180}, {label: "Mobile app", x: 22, y: 6.8, size: 340}], "Adoption", "D30 retention lift", "percent", "percent")], "half", "Sized by weekly users"), Card("Usage by hour", [Heatmap(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], ["6", "9", "12", "15", "18", "21"], [[21, 84, 98, 91, 64, 28], [24, 91, 104, 96, 68, 31], [23, 94, 108, 99, 71, 32], [22, 89, 101, 94, 66, 30], [19, 76, 88, 79, 52, 24], [8, 16, 21, 19, 14, 9], [7, 14, 18, 17, 13, 8]], "compact")], "half", "Sessions · local time")])])
s5 = Section("Detail", [Row([Card("Feature adoption", [Table([Column("Feature", ["Dashboards", "Templates", "Alerts", "Mobile app", "Scheduled emails", "SQL mode", "Comments"], "primary"), Column("Stage", ["GA", "GA", "GA", "Beta", "GA", "Beta", "Alpha"], "badge", null, {"GA": "good", "Beta": "info", "Alpha": "warning"}), Column("Weekly users", [12400, 7600, 4800, 3400, 3100, 2900, 1800], "bar", "compact"), Column("Adoption", [68, 52, 31, 22, 24, 18, 14], "number", "percent"), Column("Δ WoW", [1.8, 0.4, 2.1, 4.2, -0.6, 3.1, 1.1], "delta", "percent"), Column("Trend", [[11.2, 11.6, 11.9, 12.1, 12.2, 12.4], [7.1, 7.2, 7.4, 7.4, 7.5, 7.6], [4.1, 4.2, 4.4, 4.5, 4.7, 4.8], [2.6, 2.8, 3.0, 3.1, 3.2, 3.4], [3.2, 3.2, 3.1, 3.1, 3.0, 3.1], [2.2, 2.4, 2.5, 2.7, 2.8, 2.9], [1.5, 1.6, 1.6, 1.7, 1.7, 1.8]], "sparkline")], 7)], "full", "Thousands of weekly users")])])`,
  },
];

/** His examples as the schema reads them today: calls to components left out of it are removed. */
export const EXAMPLES: Example[] = HIS_EXAMPLES.map((example) => ({
  ...example,
  source: inSchema(example.source),
}));
