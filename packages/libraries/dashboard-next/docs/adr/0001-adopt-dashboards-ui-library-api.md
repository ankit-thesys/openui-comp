# Adopt the dashboards-ui-library API as the dashboard library's model-facing API

We are porting Parikshit's dashboards-ui-library into `@openuidev/dashboard-library` as one package with one prompt. Where the two overlapped, his language replaces ours: `Row`, `Card` with a Width, `Kpis`/`Kpi`, `TimeSeries`, `Bars`, raw numbers with a Format, and GoodWhen. It is a better fit for a model: numbers never arrive as preformatted strings, and charts are picked by the question they answer.

Our earlier components go, including the ones his library has no equivalent for (Callout, Button, Select, ImageBlock, Tag, TextContent, MarkDownRenderer, EntityList, List, Icon). This breaks our unpublished 0.0.1; the fork examples that use it (PRs #193 and #195) need updating.
