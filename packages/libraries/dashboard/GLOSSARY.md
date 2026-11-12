# Dashboard library

The OpenUI Lang component library a model uses to write analytics dashboards: filters, headline numbers, charts, tables and maps on one page.

## Language

**Dashboard program**:
The OpenUI Lang program a model writes, rooted at `Dashboard`, that the library draws as one dashboard.
_Avoid_: dashboard spec, layout JSON

**Format**:
How a raw number is shown (currency, percent, duration and so on), chosen from a named preset or an override. Numbers in a dashboard program are always raw; the Format does the formatting.
_Avoid_: formatted string, display value

**GoodWhen**:
Which direction of change is good news for a measure: up, down or neutral. It decides whether a change reads as positive or negative.
_Avoid_: polarity, inverse

**Width**:
How much of a Row a Card takes. The Widths in one Row add up to a full row.
_Avoid_: card size, span

**Previous value**:
The same measure for the comparison period, given beside the current value so the dashboard can show the change. It can also mark progress at the same point last period or show a part’s change in share, in points.
_Avoid_: baseline, prior

**Compare mode**:
The dashboard-wide switch that shows Previous values alongside current ones, as marks or tooltip comparisons. Flow compares only when every drawn link has a Previous value.
_Avoid_: comparison toggle, diff mode

### Layout

**Kpis strip**:
The row of 3–6 headline numbers that leads a dashboard.
_Avoid_: overview cards, KPI grid

**Card**:
A titled container in a Row that holds one chart, table or number.
_Avoid_: tile, panel, widget
