---
"@openuidev/react-components": minor
---

Modal content, VisualCard, OverviewCard's card and ImageBlock (root, image and loader) declare
`box-sizing: content-box`, and CalendarHeatmap declares its own typography. A page's box-sizing or
font reset, such as Tailwind's preflight, no longer changes their geometry: with Tailwind they now
match #72's plain-page sizes (Modal content 2px wider, VisualCard 2px taller, OverviewCard's card
22px wider, ImageBlock 32px taller with a 30px loader). SegmentedBar's track drops a no-op
`font-family: inherit`.
