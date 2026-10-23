# User synthetic measurement summary

Source: `openui-performance-1792757408577.json`; SHA-256 `0006265ec4b79ddadd3c8fe8216d601e7cf54f3526df8394e481e8c577047795`. Exported 2026-10-23T12:10:08.573Z. Browser engine: Chromium. Raw export and machine-specific user agent are not copied here.

Four complete runs; zero stopped or invalid runs. Two matched scenario/config pairs: chat and dashboard, each with one static React baseline and one generated arm. Every run used framework `none`, 500 tiles, 120 scheduled chunks/s, 10 nominal seconds (1,200 chunks). Dashboard additionally renders 1,000 table rows and 1,000 chart points. No server/SSR load setting was exported.

All runs received and rendered 1,200 chunks, reported matching final content and visible state, and retained 47 CSS rules / 3 sheets.

Values below are within-run medians and exported p95s in milliseconds. Delta is generated minus baseline, an absolute signed difference, not a percentage. These are descriptive paired observations only.

| Scenario | Metric | Baseline median / p95 | Generated median / p95 | Delta median / p95 |
|---|---|---:|---:|---:|
| chat | updateOpportunity | 23.60 / 30.30 | 22.80 / 30.40 | -0.80 / 0.10 |
| chat | deliveryLag | 71.72 / 498.90 | 106.80 / 558.33 | 35.08 / 59.43 |
| chat | frameGaps | 8.30 / 9.30 | 8.30 / 9.30 | 0.00 / 0.00 |
| chat | inputOpportunity | 22.40 / 24.90 | 13.20 / 19.40 | -9.20 / -5.50 |
| dashboard | updateOpportunity | 29.35 / 90.00 | 27.50 / 86.60 | -1.85 / -3.40 |
| dashboard | deliveryLag | 6360.53 / 13172.87 | 6760.33 / 13594.47 | 399.80 / 421.60 |
| dashboard | frameGaps | 8.40 / 33.30 | 8.40 / 25.10 | 0.00 / -8.20 |
| dashboard | inputOpportunity | n/a / n/a | n/a / n/a | n/a / n/a |

Chat duration: 10,660.4 ms baseline, 10,720.7 ms generated (+60.3 ms); zero observed long tasks in either. Dashboard duration: 24,099.0 ms baseline, 24,562.4 ms generated (+463.4 ms); 82 versus 84 long tasks, totaling 5,714 versus 5,870 ms. Dashboard p95 delivery backlog exceeds 13 seconds in both arms. Lower update/frame opportunity values in the generated dashboard run coexist with slightly higher duration/backlog; this is not a consistent overall performance win.

Manual chat input activity produced only 4 baseline samples and 19 generated samples; the observed input medians are 22.4 and 13.2 ms, and p95s 24.9 and 19.4 ms. Different activity and sparse samples prevent an input responsiveness comparison. Dashboard has no input observations.

## Validity and interpretation

- Baseline is a static React button with equivalent CSS, not existing react-ui; no OpenUI parser or real OpenUI components were exercised.
- One complete run per arm and scenario. Pairing is by scenario/framework/count/rate/seconds, not randomized repetitions. Within-run samples are correlated; no statistical significance or adoption claim is justified.
- Manual activity is uncontrolled: chat input sample counts differ (4 baseline, 19 generated); dashboard has zero input samples. Scroll activity is not recorded by the input/click listener.
- Input and update opportunity measure elapsed time to two requestAnimationFrame callbacks, not hardware input delay, INP, paint completion, or end-to-end streaming latency.
- Dashboard delivery lag is timer backlog versus scheduled emission time. Both arms take about 24 seconds for a nominal 10-second workload; completion does not mean 120 chunks/second was sustained.
- Framework none only; no framework integration comparison, server/SSR load, cold-start, repeated sessions, or real application data. No exported load configuration is present.
- All four runs report visible, finalContentMatches true, 1200 received and rendered chunks; none are stopped or hidden-tab invalid. No per-event input labels/timestamps or activity schedule are exported.
- All runs retain 47 CSS rules and 3 sheets. Heap samples exist but this short single-session export cannot establish memory leak behavior.
