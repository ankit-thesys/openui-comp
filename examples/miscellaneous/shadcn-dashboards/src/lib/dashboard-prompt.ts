// How generated dashboards use the dashboard kit with live data: examples and rules for the
// model that builds them. Plain strings, so the server imports them without the React components.
// The kit's own examples use written values; these read every value from a Query().

export const dashboardExamples: string[] = [
  `Example 1 — Comparing npm downloads, with a range filter:
root = Dashboard([header, section])
$months = "6"
dl = Query("get_npm_downloads", {packages: "react,vue,svelte", months: $months, interval: "week"}, {periods: [], packages: []})
header = DashboardHeader("Frontend frameworks", "Weekly npm downloads, live from the npm registry")
section = Section([kpis, trend, totals], filters)
filters = FilterBar([FilterSelect("months", "Range", [{value: "3", label: "Last 3 months"}, {value: "6", label: "Last 6 months"}, {value: "12", label: "Last 12 months"}], $months)])
kpis = CardRow(@Each(dl.packages, "p", SmallCard(p.name, "" + @Round(p.total / 1000000, 1) + "M", {direction: p.change_pct < 0 ? "down" : "up", value: @Abs(p.change_pct)})))
trend = CardRow([LargeCard([DashboardCardHeader("Downloads per week"), LineChart(dl.periods, @Each(dl.packages, "p", Series(p.name, p.downloads)))])])
totals = CardRow([LargeCard([DashboardCardHeader("Totals"), Table([Col("Package", dl.packages.name), Col("Downloads", dl.packages.total, "number"), Col("Weekly average", dl.packages.average, "number"), Col("Last week vs previous (%)", dl.packages.change_pct, "number")])])])`,

  `Example 2 — A GitHub repository's health, two cards side by side:
root = Dashboard([header, section])
repo = Query("get_github_repo", {repo: "vercel/next.js"}, {stars: 0, forks: 0, open_issues: 0, pushed_at: ""})
commits = Query("get_github_commit_activity", {repo: "vercel/next.js", weeks: 26}, {weeks: [], commits: [], total: 0, average: 0})
rel = Query("get_github_releases", {repo: "vercel/next.js", limit: 8}, {releases: [], per_month: []})
header = DashboardHeader("vercel/next.js", "Repository health, live from GitHub")
section = Section([kpis, activity, recent])
kpis = CardRow([SmallCard(IconText(Icon("star"), "warning"), [MetricIndicator("" + @Round(repo.stars / 1000, 1) + "k", "Stars")]), SmallCard(IconText(Icon("git-fork"), "info"), [MetricIndicator("" + @Round(repo.forks / 1000, 1) + "k", "Forks")]), SmallCard("Open issues and PRs", "" + repo.open_issues)])
activity = CardRow([commitsCard, releasesCard])
commitsCard = MediumCard([DashboardCardHeader("" + commits.average, "Commits a week on average", "number"), AreaChart(commits.weeks, [Series("Commits", commits.commits)])])
releasesCard = MediumCard([DashboardCardHeader("Releases per month"), BarChart(rel.per_month.month, [Series("Releases", rel.per_month.count)])])
recent = CardRow([LargeCard([DashboardCardHeader("Latest releases"), Table([Col("Release", rel.releases.name), Col("Published", rel.releases.published), Col("Type", @Each(rel.releases, "r", Tag(r.prerelease ? "Prerelease" : "Stable", r.prerelease ? "neutral" : "success")))])])])`,

  `Example 3 — Security advisories, with severity tags in a table:
root = Dashboard([header, section])
vulns = Query("osv_vulnerabilities", {package: "lodash"}, {total: 0, severities: [], counts: [], vulnerabilities: []})
header = DashboardHeader("lodash security", "Known advisories from OSV.dev")
section = Section([kpis, breakdown, list])
kpis = CardRow([SmallCard("Advisories", "" + vulns.total), SmallCard("Critical", "" + vulns.counts[0]), SmallCard("High", "" + vulns.counts[1]), SmallCard("Moderate", "" + vulns.counts[2])])
breakdown = CardRow([MediumCard([DashboardCardHeader("By severity"), PieChart(vulns.severities, vulns.counts, "donut")]), MediumCard([DashboardCardHeader("Most recent", vulns.vulnerabilities[0].id), TextContent(vulns.vulnerabilities[0].summary), TagBlock([Tag("Fixed in " + vulns.vulnerabilities[0].fixed_in, "success")])])])
list = CardRow([LargeCard([DashboardCardHeader("All advisories"), Table([Col("Advisory", vulns.vulnerabilities.id), Col("Severity", @Each(vulns.vulnerabilities, "v", Tag(v.severity, v.severity == "Critical" || v.severity == "High" ? "danger" : v.severity == "Moderate" ? "warning" : "neutral"))), Col("Summary", vulns.vulnerabilities.summary), Col("Fixed in", vulns.vulnerabilities.fixed_in)])])])`,
];

export const dashboardRules: string[] = [
  "Output MUST begin with `root = Dashboard([header, section])`: a DashboardHeader naming the dashboard, then one Section. Add more Sections only for altogether different topics.",
  "A Section holds CardRows. A CardRow holds only SmallCards, or only MediumCards and LargeCards. Put KPIs in a row of two to four SmallCards; put each chart or table in a MediumCard or LargeCard that starts with a DashboardCardHeader.",
  "Read every value from a Query result. Never write numbers yourself, and never use placeholder data.",
  'SmallCard and MetricIndicator values are strings: build them from Query numbers, rounded and with a unit, such as "" + @Round(p.total / 1000000, 1) + "M".',
  "A SmallCard trend is {direction, value}: up when the change is positive, down otherwise, with value @Abs(change).",
  "Filters go in the Section's FilterBar. FilterSelect(name, label, options, $name) binds the variable $name; every Query the filter is about must pass $name in its arguments.",
  "Chart labels and every Series' values must have the same length: take both from the same Query result.",
  "Use @Each to build one Series, SmallCard or Tag per item of a Query result.",
  'Set Col type "number" for numeric columns; pass the Query numbers as they are.',
  "Don't put PieChart in a LargeCard.",
];
