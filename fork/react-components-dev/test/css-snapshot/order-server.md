# Cross-module style order report

Recorded from the built contract fixtures. Each row identifies an element by its tag, stable
classes and occurrence among classed elements. Rules include potential states, pseudo-elements
and conditional branches, not only the state active at capture. Repeated identical rows are
grouped with all occurrence indexes. Common physical shorthands also include the longhands
they reset. Ancestor prose/SVG rules are excluded from the ancestor's properties. This is an
order-risk inventory, not a computed-style verdict.

## Charts

Elements 0: `div.openui-line-chart.openui-line-chart--variant-natural.openui-chart-empty`

Modules: `Charts/LineChart/lineChart.styles.mjs`, `Charts/shared/chartBase.styles.mjs`

- Charts/LineChart/lineChart.styles.mjs ↔ Charts/shared/chartBase.styles.mjs: display

Elements 2: `div.openui-bar-chart.openui-bar-chart--variant-grouped.openui-chart-empty`

Modules: `Charts/BarChart/barChart.styles.mjs`, `Charts/shared/chartBase.styles.mjs`

- Charts/BarChart/barChart.styles.mjs ↔ Charts/shared/chartBase.styles.mjs: display

Elements 4, 562, 567, 1308: `div.openui-chart-empty.openui-pie-chart.openui-pie-chart--variant-pie.openui-pie-chart--appearance-circular`

Modules: `Charts/PieChart/pieChart.styles.mjs`, `Charts/shared/chartBase.styles.mjs`

- Charts/PieChart/pieChart.styles.mjs ↔ Charts/shared/chartBase.styles.mjs: align-items, display

Elements 116: `button.openui-button.openui-button--variant-tertiary.openui-button--size-small.openui-button--tone-default.openui-default-legend-toggle-button`

Modules: `Button/button.styles.mjs`, `Charts/shared/core/DefaultLegend/defaultLegend.styles.mjs`

- Button/button.styles.mjs ↔ Charts/shared/core/DefaultLegend/defaultLegend.styles.mjs: color

Elements 273: `button.openui-icon-button.openui-icon-button--variant-secondary.openui-icon-button--size-2-extra-small.openui-icon-button--shape-square.openui-icon-button--tone-default.openui-scroll-buttons-horizontal-button.openui-scroll-buttons-horizontal-left`

Modules: `Charts/shared/cartesian/ScrollButtonsHorizontal/scrollButtonsHorizontal.styles.mjs`, `IconButton/iconButton.styles.mjs`

- Charts/shared/cartesian/ScrollButtonsHorizontal/scrollButtonsHorizontal.styles.mjs ↔ IconButton/iconButton.styles.mjs: background-color, cursor, transition, transition-delay, transition-duration, transition-property, transition-timing-function

Elements 276: `button.openui-icon-button.openui-icon-button--variant-secondary.openui-icon-button--size-2-extra-small.openui-icon-button--shape-square.openui-icon-button--tone-default.openui-scroll-buttons-horizontal-button.openui-scroll-buttons-horizontal-right`

Modules: `Charts/shared/cartesian/ScrollButtonsHorizontal/scrollButtonsHorizontal.styles.mjs`, `IconButton/iconButton.styles.mjs`

- Charts/shared/cartesian/ScrollButtonsHorizontal/scrollButtonsHorizontal.styles.mjs ↔ IconButton/iconButton.styles.mjs: background-color, cursor, transition, transition-delay, transition-duration, transition-property, transition-timing-function

Elements 460: `button.openui-icon-button.openui-icon-button--variant-secondary.openui-icon-button--size-extra-small.openui-icon-button--shape-square.openui-icon-button--tone-default.openui-scroll-buttons-vertical-button.openui-scroll-buttons-vertical-up`

Modules: `Charts/shared/cartesian/ScrollButtonsVertical/scrollButtonsVertical.styles.mjs`, `IconButton/iconButton.styles.mjs`

- Charts/shared/cartesian/ScrollButtonsVertical/scrollButtonsVertical.styles.mjs ↔ IconButton/iconButton.styles.mjs: background-color, cursor, transition, transition-delay, transition-duration, transition-property, transition-timing-function

Elements 463: `button.openui-icon-button.openui-icon-button--variant-secondary.openui-icon-button--size-extra-small.openui-icon-button--shape-square.openui-icon-button--tone-default.openui-scroll-buttons-vertical-button.openui-scroll-buttons-vertical-down`

Modules: `Charts/shared/cartesian/ScrollButtonsVertical/scrollButtonsVertical.styles.mjs`, `IconButton/iconButton.styles.mjs`

- Charts/shared/cartesian/ScrollButtonsVertical/scrollButtonsVertical.styles.mjs ↔ IconButton/iconButton.styles.mjs: background-color, cursor, transition, transition-delay, transition-duration, transition-property, transition-timing-function

Elements 578, 585, 592, 599, 606, 613, 620, 627, 6470, 6477, 6501, 6508: `div.openui-separator.openui-stacked-legend-separator`

Modules: `Charts/shared/core/StackedLegend/stackedLegend.styles.mjs`, `Separator/separator.styles.mjs`

Shared properties: none.

Elements 672: `button.openui-button.openui-button--variant-secondary.openui-button--size-small.openui-button--tone-default.openui-stacked-legend-show-more-button`

Modules: `Button/button.styles.mjs`, `Charts/shared/core/StackedLegend/stackedLegend.styles.mjs`

Shared properties: none.

Elements 1949: `div.openui-chart-empty.openui-radar-chart.openui-radar-chart--variant-line.openui-radar-chart--grid-shape-polygon`

Modules: `Charts/RadarChart/radarChart.styles.mjs`, `Charts/shared/chartBase.styles.mjs`

- Charts/RadarChart/radarChart.styles.mjs ↔ Charts/shared/chartBase.styles.mjs: align-items, display

Elements 2351: `div.openui-chart-empty.openui-radial-chart.openui-radial-chart--variant-circular`

Modules: `Charts/RadialChart/radialChart.styles.mjs`, `Charts/shared/chartBase.styles.mjs`

- Charts/RadialChart/radialChart.styles.mjs ↔ Charts/shared/chartBase.styles.mjs: align-items, display

Elements 2709: `div.openui-chart-empty.openui-funnel-chart.openui-funnel-chart--edges-curved.openui-funnel-chart--orientation-horizontal`

Modules: `Charts/FunnelChart/funnelChart.styles.mjs`, `Charts/shared/chartBase.styles.mjs`

- Charts/FunnelChart/funnelChart.styles.mjs ↔ Charts/shared/chartBase.styles.mjs: align-items, display

Elements 3114: `div.openui-chart-empty.openui-heatmap-chart.openui-heatmap-chart--ramp-mode-sequential`

Modules: `Charts/HeatmapChart/heatmapChart.styles.mjs`, `Charts/shared/chartBase.styles.mjs`

- Charts/HeatmapChart/heatmapChart.styles.mjs ↔ Charts/shared/chartBase.styles.mjs: align-items, display

Elements 6383: `div.openui-chart-empty.openui-calendar-heatmap.openui-calendar-heatmap--layout-fluid.openui-calendar-heatmap--legend-variant-swatches`

Modules: `Charts/CalendarHeatmap/calendarHeatmap.styles.mjs`, `Charts/shared/chartBase.styles.mjs`

- Charts/CalendarHeatmap/calendarHeatmap.styles.mjs ↔ Charts/shared/chartBase.styles.mjs: align-items, display

Elements 6410, 6436, 6524: `div.openui-default-legend.openui-segmented-bar-default-legend`

Modules: `Charts/SegmentedBar/segmentedBar.styles.mjs`, `Charts/shared/core/DefaultLegend/defaultLegend.styles.mjs`

- Charts/SegmentedBar/segmentedBar.styles.mjs ↔ Charts/shared/core/DefaultLegend/defaultLegend.styles.mjs: padding-top

Elements 6462, 6493: `div.openui-stacked-legend.openui-segmented-bar-stacked-legend`

Modules: `Charts/SegmentedBar/segmentedBar.styles.mjs`, `Charts/shared/core/StackedLegend/stackedLegend.styles.mjs`

Shared properties: none.

Elements 6541: `div.openui-chart-empty.openui-segmented-bar.openui-segmented-bar--legend-variant-default.openui-segmented-bar--legend`

Modules: `Charts/SegmentedBar/segmentedBar.styles.mjs`, `Charts/shared/chartBase.styles.mjs`

- Charts/SegmentedBar/segmentedBar.styles.mjs ↔ Charts/shared/chartBase.styles.mjs: align-items, display, justify-content

## Skeleton

Elements 1, 3, 4, 5, 9, 11, 13, 15, 18, 20, 22, 24, 27, 29, 31, 33, 36, 38, 40, 42, 45, 47, 49, 51, 54, 56, 58, 60, 64, 66, 69, 71, 74, 76, 83, 86, 89, 92, 99, 102, 109, 112, 119, 122, 129, 132: `div.openui-skeleton-bar.openui-skeleton-pulse`

Modules: `Skeleton/skeleton.styles.mjs`, `SkeletonPulse/skeletonPulse.styles.mjs`

Shared properties: none.

Elements 79, 95, 105, 115, 125: `div.openui-pie-chart-skeleton-shape.openui-skeleton-pulse`

Modules: `Skeleton/pieChartSkeleton.styles.mjs`, `SkeletonPulse/skeletonPulse.styles.mjs`

Shared properties: none.

Elements 82, 85, 88, 91, 98, 101, 108, 111, 118, 121, 128, 131: `div.openui-pie-chart-skeleton-legend-dot.openui-skeleton-pulse`

Modules: `Skeleton/pieChartSkeleton.styles.mjs`, `SkeletonPulse/skeletonPulse.styles.mjs`

Shared properties: none.

## DotMatrixLoader

No element carries rules from multiple style modules.

## CodeBlock

Elements 1, 11, 17: `button.openui-code-block-copy-button.openui-icon-button.openui-icon-button--variant-secondary.openui-icon-button--size-small.openui-icon-button--shape-square.openui-icon-button--tone-default`

Modules: `CodeBlock/codeBlock.styles.mjs`, `IconButton/iconButton.styles.mjs`

- CodeBlock/codeBlock.styles.mjs ↔ IconButton/iconButton.styles.mjs: background-color, color, transition, transition-delay, transition-duration, transition-property, transition-timing-function

## Slider

Elements 167, 189, 192, 218, 239, 242, 392, 395: `input.openui-input.openui-input--size-medium.openui-slider-block-input`

Modules: `Input/input.styles.mjs`, `Slider/sliderBlock.styles.mjs`

- Input/input.styles.mjs ↔ Slider/sliderBlock.styles.mjs: border-bottom-color, border-color, border-left-color, border-right-color, border-top-color, box-shadow, padding-left, padding-right, width

Elements 265, 293, 297, 329, 356, 360: `button.openui-select-trigger.openui-select-trigger--size-md.openui-slider-block-select-trigger`

Modules: `Select/select.styles.mjs`, `Slider/sliderBlock.styles.mjs`

Shared properties: none.

## DatePicker

No element carries rules from multiple style modules.

## Calendar

Elements 11, 177, 343, 509, 675, 841, 1007, 1173, 1339, 1505, 1671, 1837: `button.openui-select-trigger.openui-select-trigger--size-md.openui-calendar-select-trigger.openui-calendar-months-dropdown`

Modules: `Calendar/calendar.styles.mjs`, `Select/select.styles.mjs`

- Calendar/calendar.styles.mjs ↔ Select/select.styles.mjs: background-color, border, border-bottom-color, border-bottom-left-radius, border-bottom-right-radius, border-bottom-style, border-bottom-width, border-color, border-image, border-image-outset, border-image-repeat, border-image-slice, border-image-source, border-image-width, border-left-color, border-left-style, border-left-width, border-radius, border-right-color, border-right-style, border-right-width, border-style, border-top-color, border-top-left-radius, border-top-right-radius, border-top-style, border-top-width, border-width, color, column-gap, cursor, font, font-family, font-size, font-stretch, font-style, font-variant, font-variation-settings, font-weight, gap, letter-spacing, line-height, padding, padding-bottom, padding-left, padding-right, padding-top, row-gap

Elements 14, 180, 346, 512, 678, 844, 1010, 1176, 1342, 1508, 1674, 1840: `button.openui-select-trigger.openui-select-trigger--size-md.openui-calendar-select-trigger.openui-calendar-years-dropdown`

Modules: `Calendar/calendar.styles.mjs`, `Select/select.styles.mjs`

- Calendar/calendar.styles.mjs ↔ Select/select.styles.mjs: background-color, border, border-bottom-color, border-bottom-left-radius, border-bottom-right-radius, border-bottom-style, border-bottom-width, border-color, border-image, border-image-outset, border-image-repeat, border-image-slice, border-image-source, border-image-width, border-left-color, border-left-style, border-left-width, border-radius, border-right-color, border-right-style, border-right-width, border-style, border-top-color, border-top-left-radius, border-top-right-radius, border-top-style, border-top-width, border-width, color, column-gap, cursor, font, font-family, font-size, font-stretch, font-style, font-variant, font-variation-settings, font-weight, gap, letter-spacing, line-height, padding, padding-bottom, padding-left, padding-right, padding-top, row-gap

## Select

No element carries rules from multiple style modules.

## Chips

No element carries rules from multiple style modules.

## ToggleGroup

No element carries rules from multiple style modules.

## ToggleItem

No element carries rules from multiple style modules.

## SwitchItem

No element carries rules from multiple style modules.

## SwitchGroup

No element carries rules from multiple style modules.

## RadioGroup

No element carries rules from multiple style modules.

## RadioItem

No element carries rules from multiple style modules.

## CheckBoxItem

No element carries rules from multiple style modules.

## CheckBoxGroup

No element carries rules from multiple style modules.

## Buttons

Elements 0, 2: `div.openui-buttons.openui-buttons--variant-horizontal.openui-border-box`

Modules: `Buttons/buttons.styles.mjs`, `SharedBase/base.styles.mjs`

Shared properties: none.

Elements 4: `div.openui-buttons.openui-buttons--variant-vertical.openui-border-box`

Modules: `Buttons/buttons.styles.mjs`, `SharedBase/base.styles.mjs`

Shared properties: none.

## FormControl

Elements 0, 2, 4: `div.openui-form-control.openui-border-box`

Modules: `FormControl/formControl.styles.mjs`, `SharedBase/base.styles.mjs`

Shared properties: none.

## Label

No element carries rules from multiple style modules.

## TextArea

No element carries rules from multiple style modules.

## Input

No element carries rules from multiple style modules.

## _shared

No element carries rules from multiple style modules.

## CompositeCardBlock

No element carries rules from multiple style modules.

## ContextCardBlock

Elements 11, 23, 32, 45, 54, 66, 76, 88, 97, 110, 119, 131, 141: `div.openui-markdown-renderer.openui-markdown-renderer--variant-clear.openui-inline-markdown-renderer-content`

Modules: `InlineMarkdownRenderer/inlineMarkdown.styles.mjs`, `MarkDownRenderer/markdown.styles.mjs`

- InlineMarkdownRenderer/inlineMarkdown.styles.mjs ↔ MarkDownRenderer/markdown.styles.mjs: color, font, font-family, font-size, font-stretch, font-style, font-variant, font-weight, letter-spacing, line-height

## VisualCardBlock

No element carries rules from multiple style modules.

## OverviewCardBlock

No element carries rules from multiple style modules.

## SnippetCardBlock

Elements 7, 14, 29, 36: `span.openui-inline-markdown-renderer.openui-text-block-primary`

Modules: `InlineMarkdownRenderer/inlineMarkdown.styles.mjs`, `TextBlock/textBlock.styles.mjs`

Shared properties: none.

Elements 8, 10, 15, 17, 30, 32, 37, 39: `div.openui-markdown-renderer.openui-markdown-renderer--variant-clear.openui-inline-markdown-renderer-content`

Modules: `InlineMarkdownRenderer/inlineMarkdown.styles.mjs`, `MarkDownRenderer/markdown.styles.mjs`

- InlineMarkdownRenderer/inlineMarkdown.styles.mjs ↔ MarkDownRenderer/markdown.styles.mjs: color, font, font-family, font-size, font-stretch, font-style, font-variant, font-weight, letter-spacing, line-height

Elements 9, 16, 31, 38: `span.openui-inline-markdown-renderer.openui-text-block-secondary`

Modules: `InlineMarkdownRenderer/inlineMarkdown.styles.mjs`, `TextBlock/textBlock.styles.mjs`

Shared properties: none.

## OptionCards

Elements 10, 13, 21, 28, 36, 43, 54, 57, 65, 72, 80, 87: `div.openui-markdown-renderer.openui-markdown-renderer--variant-clear.openui-inline-markdown-renderer-content`

Modules: `InlineMarkdownRenderer/inlineMarkdown.styles.mjs`, `MarkDownRenderer/markdown.styles.mjs`

- InlineMarkdownRenderer/inlineMarkdown.styles.mjs ↔ MarkDownRenderer/markdown.styles.mjs: color, font, font-family, font-size, font-stretch, font-style, font-variant, font-weight, letter-spacing, line-height

## Image

No element carries rules from multiple style modules.

## ImageBlock

No element carries rules from multiple style modules.

## ImageText

Elements 5, 14, 23, 32, 41, 50, 59: `span.openui-inline-markdown-renderer.openui-text-block-primary`

Modules: `InlineMarkdownRenderer/inlineMarkdown.styles.mjs`, `TextBlock/textBlock.styles.mjs`

Shared properties: none.

Elements 6, 8, 15, 17, 24, 26, 33, 35, 42, 44, 51, 53, 60: `div.openui-markdown-renderer.openui-markdown-renderer--variant-clear.openui-inline-markdown-renderer-content`

Modules: `InlineMarkdownRenderer/inlineMarkdown.styles.mjs`, `MarkDownRenderer/markdown.styles.mjs`

- InlineMarkdownRenderer/inlineMarkdown.styles.mjs ↔ MarkDownRenderer/markdown.styles.mjs: color, font, font-family, font-size, font-stretch, font-style, font-variant, font-weight, letter-spacing, line-height

Elements 7, 16, 25, 34, 43, 52: `span.openui-inline-markdown-renderer.openui-text-block-secondary`

Modules: `InlineMarkdownRenderer/inlineMarkdown.styles.mjs`, `TextBlock/textBlock.styles.mjs`

Shared properties: none.

## ImageTextLarge

Elements 5: `span.openui-inline-markdown-renderer.openui-text-block-primary`

Modules: `InlineMarkdownRenderer/inlineMarkdown.styles.mjs`, `TextBlock/textBlock.styles.mjs`

Shared properties: none.

Elements 6, 8: `div.openui-markdown-renderer.openui-markdown-renderer--variant-clear.openui-inline-markdown-renderer-content`

Modules: `InlineMarkdownRenderer/inlineMarkdown.styles.mjs`, `MarkDownRenderer/markdown.styles.mjs`

- InlineMarkdownRenderer/inlineMarkdown.styles.mjs ↔ MarkDownRenderer/markdown.styles.mjs: color, font, font-family, font-size, font-stretch, font-style, font-variant, font-weight, letter-spacing, line-height

Elements 7: `span.openui-inline-markdown-renderer.openui-text-block-secondary`

Modules: `InlineMarkdownRenderer/inlineMarkdown.styles.mjs`, `TextBlock/textBlock.styles.mjs`

Shared properties: none.

## ImageGallery

No element carries rules from multiple style modules.

## Carousel

No element carries rules from multiple style modules.

## Tag

No element carries rules from multiple style modules.

## IconTag

No element carries rules from multiple style modules.

## Callout

No element carries rules from multiple style modules.

## TextCallout

No element carries rules from multiple style modules.

## TextContent

No element carries rules from multiple style modules.

## TextBlock

Elements 1, 4, 11, 19, 27, 34, 42, 50, 57, 65, 73, 80, 88, 96, 103, 111, 119, 126, 134, 142, 149, 157, 165, 172, 180, 188, 195, 203, 211, 218, 226, 234, 241, 249, 257, 264, 272, 280, 287, 295, 303, 310, 318, 326, 333, 341, 349, 356, 364, 372, 379, 387, 395, 402, 410, 418, 425, 433, 441, 448, 456, 464, 471, 479, 487, 494, 502, 510, 517, 525, 533, 540, 548, 556, 563, 571, 579, 586, 594, 602, 609, 617, 625, 632, 640, 648, 655, 663, 671, 678, 686, 694, 701, 709, 717, 724, 732, 740, 747, 755, 763, 770, 778, 786, 793, 801, 809, 816, 824, 832, 839, 847, 855, 862, 870, 878, 885, 893, 901, 908, 916, 924, 931, 939, 947, 954, 962, 970, 977, 985, 993, 1000, 1008, 1016, 1023, 1031, 1039, 1046, 1054, 1062, 1069, 1077, 1085, 1092, 1100, 1108, 1115, 1123, 1131, 1138, 1146, 1154, 1161, 1169, 1177, 1184, 1192, 1200, 1207, 1215, 1223, 1230, 1238, 1246, 1253, 1261, 1269, 1276, 1284, 1292, 1299, 1307, 1315, 1322, 1330, 1338, 1345, 1353, 1361, 1368, 1376, 1384, 1391, 1399, 1407, 1414, 1422, 1430, 1437, 1445, 1453, 1460, 1468, 1476, 1483, 1491, 1499, 1506, 1514, 1522, 1529, 1537, 1545, 1552, 1560, 1568, 1575, 1583, 1591, 1598, 1606, 1614, 1621, 1629, 1637, 1644, 1652, 1660, 1667, 1675, 1683, 1690, 1698, 1706, 1713, 1721, 1729, 1736, 1744, 1752, 1759, 1767, 1775, 1782, 1790, 1798, 1805, 1813, 1821, 1828, 1836, 1844, 1851, 1859, 1867, 1874, 1882, 1890, 1897, 1905, 1913, 1920, 1928, 1936, 1943, 1951, 1959, 1966, 1974, 1982, 1989, 1997, 2005, 2012, 2020, 2028, 2035, 2043, 2051, 2058, 2066, 2074, 2081, 2089, 2097, 2104, 2112, 2120, 2127, 2135, 2143, 2150, 2158, 2166, 2173, 2181, 2189, 2196, 2204, 2212, 2217: `span.openui-inline-markdown-renderer.openui-text-block-primary`

Modules: `InlineMarkdownRenderer/inlineMarkdown.styles.mjs`, `TextBlock/textBlock.styles.mjs`

Shared properties: none.

Elements 2, 5, 7, 9, 12, 15, 17, 20, 23, 25, 28, 30, 32, 35, 38, 40, 43, 46, 48, 51, 53, 55, 58, 61, 63, 66, 69, 71, 74, 76, 78, 81, 84, 86, 89, 92, 94, 97, 99, 101, 104, 107, 109, 112, 115, 117, 120, 122, 124, 127, 130, 132, 135, 138, 140, 143, 145, 147, 150, 153, 155, 158, 161, 163, 166, 168, 170, 173, 176, 178, 181, 184, 186, 189, 191, 193, 196, 199, 201, 204, 207, 209, 212, 214, 216, 219, 222, 224, 227, 230, 232, 235, 237, 239, 242, 245, 247, 250, 253, 255, 258, 260, 262, 265, 268, 270, 273, 276, 278, 281, 283, 285, 288, 291, 293, 296, 299, 301, 304, 306, 308, 311, 314, 316, 319, 322, 324, 327, 329, 331, 334, 337, 339, 342, 345, 347, 350, 352, 354, 357, 360, 362, 365, 368, 370, 373, 375, 377, 380, 383, 385, 388, 391, 393, 396, 398, 400, 403, 406, 408, 411, 414, 416, 419, 421, 423, 426, 429, 431, 434, 437, 439, 442, 444, 446, 449, 452, 454, 457, 460, 462, 465, 467, 469, 472, 475, 477, 480, 483, 485, 488, 490, 492, 495, 498, 500, 503, 506, 508, 511, 513, 515, 518, 521, 523, 526, 529, 531, 534, 536, 538, 541, 544, 546, 549, 552, 554, 557, 559, 561, 564, 567, 569, 572, 575, 577, 580, 582, 584, 587, 590, 592, 595, 598, 600, 603, 605, 607, 610, 613, 615, 618, 621, 623, 626, 628, 630, 633, 636, 638, 641, 644, 646, 649, 651, 653, 656, 659, 661, 664, 667, 669, 672, 674, 676, 679, 682, 684, 687, 690, 692, 695, 697, 699, 702, 705, 707, 710, 713, 715, 718, 720, 722, 725, 728, 730, 733, 736, 738, 741, 743, 745, 748, 751, 753, 756, 759, 761, 764, 766, 768, 771, 774, 776, 779, 782, 784, 787, 789, 791, 794, 797, 799, 802, 805, 807, 810, 812, 814, 817, 820, 822, 825, 828, 830, 833, 835, 837, 840, 843, 845, 848, 851, 853, 856, 858, 860, 863, 866, 868, 871, 874, 876, 879, 881, 883, 886, 889, 891, 894, 897, 899, 902, 904, 906, 909, 912, 914, 917, 920, 922, 925, 927, 929, 932, 935, 937, 940, 943, 945, 948, 950, 952, 955, 958, 960, 963, 966, 968, 971, 973, 975, 978, 981, 983, 986, 989, 991, 994, 996, 998, 1001, 1004, 1006, 1009, 1012, 1014, 1017, 1019, 1021, 1024, 1027, 1029, 1032, 1035, 1037, 1040, 1042, 1044, 1047, 1050, 1052, 1055, 1058, 1060, 1063, 1065, 1067, 1070, 1073, 1075, 1078, 1081, 1083, 1086, 1088, 1090, 1093, 1096, 1098, 1101, 1104, 1106, 1109, 1111, 1113, 1116, 1119, 1121, 1124, 1127, 1129, 1132, 1134, 1136, 1139, 1142, 1144, 1147, 1150, 1152, 1155, 1157, 1159, 1162, 1165, 1167, 1170, 1173, 1175, 1178, 1180, 1182, 1185, 1188, 1190, 1193, 1196, 1198, 1201, 1203, 1205, 1208, 1211, 1213, 1216, 1219, 1221, 1224, 1226, 1228, 1231, 1234, 1236, 1239, 1242, 1244, 1247, 1249, 1251, 1254, 1257, 1259, 1262, 1265, 1267, 1270, 1272, 1274, 1277, 1280, 1282, 1285, 1288, 1290, 1293, 1295, 1297, 1300, 1303, 1305, 1308, 1311, 1313, 1316, 1318, 1320, 1323, 1326, 1328, 1331, 1334, 1336, 1339, 1341, 1343, 1346, 1349, 1351, 1354, 1357, 1359, 1362, 1364, 1366, 1369, 1372, 1374, 1377, 1380, 1382, 1385, 1387, 1389, 1392, 1395, 1397, 1400, 1403, 1405, 1408, 1410, 1412, 1415, 1418, 1420, 1423, 1426, 1428, 1431, 1433, 1435, 1438, 1441, 1443, 1446, 1449, 1451, 1454, 1456, 1458, 1461, 1464, 1466, 1469, 1472, 1474, 1477, 1479, 1481, 1484, 1487, 1489, 1492, 1495, 1497, 1500, 1502, 1504, 1507, 1510, 1512, 1515, 1518, 1520, 1523, 1525, 1527, 1530, 1533, 1535, 1538, 1541, 1543, 1546, 1548, 1550, 1553, 1556, 1558, 1561, 1564, 1566, 1569, 1571, 1573, 1576, 1579, 1581, 1584, 1587, 1589, 1592, 1594, 1596, 1599, 1602, 1604, 1607, 1610, 1612, 1615, 1617, 1619, 1622, 1625, 1627, 1630, 1633, 1635, 1638, 1640, 1642, 1645, 1648, 1650, 1653, 1656, 1658, 1661, 1663, 1665, 1668, 1671, 1673, 1676, 1679, 1681, 1684, 1686, 1688, 1691, 1694, 1696, 1699, 1702, 1704, 1707, 1709, 1711, 1714, 1717, 1719, 1722, 1725, 1727, 1730, 1732, 1734, 1737, 1740, 1742, 1745, 1748, 1750, 1753, 1755, 1757, 1760, 1763, 1765, 1768, 1771, 1773, 1776, 1778, 1780, 1783, 1786, 1788, 1791, 1794, 1796, 1799, 1801, 1803, 1806, 1809, 1811, 1814, 1817, 1819, 1822, 1824, 1826, 1829, 1832, 1834, 1837, 1840, 1842, 1845, 1847, 1849, 1852, 1855, 1857, 1860, 1863, 1865, 1868, 1870, 1872, 1875, 1878, 1880, 1883, 1886, 1888, 1891, 1893, 1895, 1898, 1901, 1903, 1906, 1909, 1911, 1914, 1916, 1918, 1921, 1924, 1926, 1929, 1932, 1934, 1937, 1939, 1941, 1944, 1947, 1949, 1952, 1955, 1957, 1960, 1962, 1964, 1967, 1970, 1972, 1975, 1978, 1980, 1983, 1985, 1987, 1990, 1993, 1995, 1998, 2001, 2003, 2006, 2008, 2010, 2013, 2016, 2018, 2021, 2024, 2026, 2029, 2031, 2033, 2036, 2039, 2041, 2044, 2047, 2049, 2052, 2054, 2056, 2059, 2062, 2064, 2067, 2070, 2072, 2075, 2077, 2079, 2082, 2085, 2087, 2090, 2093, 2095, 2098, 2100, 2102, 2105, 2108, 2110, 2113, 2116, 2118, 2121, 2123, 2125, 2128, 2131, 2133, 2136, 2139, 2141, 2144, 2146, 2148, 2151, 2154, 2156, 2159, 2162, 2164, 2167, 2169, 2171, 2174, 2177, 2179, 2182, 2185, 2187, 2190, 2192, 2194, 2197, 2200, 2202, 2205, 2208, 2210, 2213, 2215, 2218: `div.openui-markdown-renderer.openui-markdown-renderer--variant-clear.openui-inline-markdown-renderer-content`

Modules: `InlineMarkdownRenderer/inlineMarkdown.styles.mjs`, `MarkDownRenderer/markdown.styles.mjs`

- InlineMarkdownRenderer/inlineMarkdown.styles.mjs ↔ MarkDownRenderer/markdown.styles.mjs: color, font, font-family, font-size, font-stretch, font-style, font-variant, font-weight, letter-spacing, line-height

Elements 6, 29, 52, 75, 98, 121, 144, 167, 190, 213, 236, 259, 282, 305, 328, 351, 374, 397, 420, 443, 466, 489, 512, 535, 558, 581, 604, 627, 650, 673, 696, 719, 742, 765, 788, 811, 834, 857, 880, 903, 926, 949, 972, 995, 1018, 1041, 1064, 1087, 1110, 1133, 1156, 1179, 1202, 1225, 1248, 1271, 1294, 1317, 1340, 1363, 1386, 1409, 1432, 1455, 1478, 1501, 1524, 1547, 1570, 1593, 1616, 1639, 1662, 1685, 1708, 1731, 1754, 1777, 1800, 1823, 1846, 1869, 1892, 1915, 1938, 1961, 1984, 2007, 2030, 2053, 2076, 2099, 2122, 2145, 2168, 2191, 2214: `span.openui-inline-markdown-renderer.openui-text-block-secondary`

Modules: `InlineMarkdownRenderer/inlineMarkdown.styles.mjs`, `TextBlock/textBlock.styles.mjs`

Shared properties: none.

Elements 8, 16, 24, 31, 39, 47, 54, 62, 70, 77, 85, 93, 100, 108, 116, 123, 131, 139, 146, 154, 162, 169, 177, 185, 192, 200, 208, 215, 223, 231, 238, 246, 254, 261, 269, 277, 284, 292, 300, 307, 315, 323, 330, 338, 346, 353, 361, 369, 376, 384, 392, 399, 407, 415, 422, 430, 438, 445, 453, 461, 468, 476, 484, 491, 499, 507, 514, 522, 530, 537, 545, 553, 560, 568, 576, 583, 591, 599, 606, 614, 622, 629, 637, 645, 652, 660, 668, 675, 683, 691, 698, 706, 714, 721, 729, 737, 744, 752, 760, 767, 775, 783, 790, 798, 806, 813, 821, 829, 836, 844, 852, 859, 867, 875, 882, 890, 898, 905, 913, 921, 928, 936, 944, 951, 959, 967, 974, 982, 990, 997, 1005, 1013, 1020, 1028, 1036, 1043, 1051, 1059, 1066, 1074, 1082, 1089, 1097, 1105, 1112, 1120, 1128, 1135, 1143, 1151, 1158, 1166, 1174, 1181, 1189, 1197, 1204, 1212, 1220, 1227, 1235, 1243, 1250, 1258, 1266, 1273, 1281, 1289, 1296, 1304, 1312, 1319, 1327, 1335, 1342, 1350, 1358, 1365, 1373, 1381, 1388, 1396, 1404, 1411, 1419, 1427, 1434, 1442, 1450, 1457, 1465, 1473, 1480, 1488, 1496, 1503, 1511, 1519, 1526, 1534, 1542, 1549, 1557, 1565, 1572, 1580, 1588, 1595, 1603, 1611, 1618, 1626, 1634, 1641, 1649, 1657, 1664, 1672, 1680, 1687, 1695, 1703, 1710, 1718, 1726, 1733, 1741, 1749, 1756, 1764, 1772, 1779, 1787, 1795, 1802, 1810, 1818, 1825, 1833, 1841, 1848, 1856, 1864, 1871, 1879, 1887, 1894, 1902, 1910, 1917, 1925, 1933, 1940, 1948, 1956, 1963, 1971, 1979, 1986, 1994, 2002, 2009, 2017, 2025, 2032, 2040, 2048, 2055, 2063, 2071, 2078, 2086, 2094, 2101, 2109, 2117, 2124, 2132, 2140, 2147, 2155, 2163, 2170, 2178, 2186, 2193, 2201, 2209: `span.openui-inline-markdown-renderer.openui-text-block-tertiary`

Modules: `InlineMarkdownRenderer/inlineMarkdown.styles.mjs`, `TextBlock/textBlock.styles.mjs`

Shared properties: none.

## InlineHeader

Elements 3, 6, 10, 14: `div.openui-markdown-renderer.openui-markdown-renderer--variant-clear.openui-inline-markdown-renderer-content`

Modules: `InlineMarkdownRenderer/inlineMarkdown.styles.mjs`, `MarkDownRenderer/markdown.styles.mjs`

- InlineMarkdownRenderer/inlineMarkdown.styles.mjs ↔ MarkDownRenderer/markdown.styles.mjs: color, font, font-family, font-size, font-stretch, font-style, font-variant, font-weight, letter-spacing, line-height

## IconText

Elements 1, 7, 15, 21, 29, 117, 125, 133, 141, 149, 157, 245, 253, 261, 269: `div.openui-icon-tag.openui-icon-tag--size-l.openui-icon-tag--variant-neutral.openui-icon-text-icon`

Modules: `IconTag/iconTag.styles.mjs`, `IconText/iconText.styles.mjs`

Shared properties: none.

Elements 4, 10, 18, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96, 104, 112, 120, 128, 136, 144, 152, 160, 168, 176, 184, 192, 200, 208, 216, 224, 232, 240, 248, 256, 264, 272: `span.openui-inline-markdown-renderer.openui-text-block-primary`

Modules: `InlineMarkdownRenderer/inlineMarkdown.styles.mjs`, `TextBlock/textBlock.styles.mjs`

Shared properties: none.

Elements 5, 11, 13, 19, 25, 27, 33, 35, 41, 43, 49, 51, 57, 59, 65, 67, 73, 75, 81, 83, 89, 91, 97, 99, 105, 107, 113, 115, 121, 123, 129, 131, 137, 139, 145, 147, 153, 155, 161, 163, 169, 171, 177, 179, 185, 187, 193, 195, 201, 203, 209, 211, 217, 219, 225, 227, 233, 235, 241, 243, 249, 251, 257, 259, 265, 267, 273, 275: `div.openui-markdown-renderer.openui-markdown-renderer--variant-clear.openui-inline-markdown-renderer-content`

Modules: `InlineMarkdownRenderer/inlineMarkdown.styles.mjs`, `MarkDownRenderer/markdown.styles.mjs`

- InlineMarkdownRenderer/inlineMarkdown.styles.mjs ↔ MarkDownRenderer/markdown.styles.mjs: color, font, font-family, font-size, font-stretch, font-style, font-variant, font-weight, letter-spacing, line-height

Elements 12, 26, 34, 42, 50, 58, 66, 74, 82, 90, 98, 106, 114, 122, 130, 138, 146, 154, 162, 170, 178, 186, 194, 202, 210, 218, 226, 234, 242, 250, 258, 266, 274: `span.openui-inline-markdown-renderer.openui-text-block-secondary`

Modules: `InlineMarkdownRenderer/inlineMarkdown.styles.mjs`, `TextBlock/textBlock.styles.mjs`

Shared properties: none.

Elements 37, 45, 165, 173: `div.openui-icon-tag.openui-icon-tag--size-l.openui-icon-tag--variant-info.openui-icon-text-icon`

Modules: `IconTag/iconTag.styles.mjs`, `IconText/iconText.styles.mjs`

Shared properties: none.

Elements 53, 61, 181, 189: `div.openui-icon-tag.openui-icon-tag--size-l.openui-icon-tag--variant-warning.openui-icon-text-icon`

Modules: `IconTag/iconTag.styles.mjs`, `IconText/iconText.styles.mjs`

Shared properties: none.

Elements 69, 77, 197, 205: `div.openui-icon-tag.openui-icon-tag--size-l.openui-icon-tag--variant-success.openui-icon-text-icon`

Modules: `IconTag/iconTag.styles.mjs`, `IconText/iconText.styles.mjs`

Shared properties: none.

Elements 85, 93, 213, 221: `div.openui-icon-tag.openui-icon-tag--size-l.openui-icon-tag--variant-danger.openui-icon-text-icon`

Modules: `IconTag/iconTag.styles.mjs`, `IconText/iconText.styles.mjs`

Shared properties: none.

Elements 101, 109, 229, 237: `div.openui-icon-tag.openui-icon-tag--size-l.openui-icon-tag--variant-inverted.openui-icon-text-icon`

Modules: `IconTag/iconTag.styles.mjs`, `IconText/iconText.styles.mjs`

Shared properties: none.

## TagBlock

Elements 0: `div.openui-tag-block.openui-border-box`

Modules: `SharedBase/base.styles.mjs`, `TagBlock/tagBlock.styles.mjs`

Shared properties: none.

## Separator

No element carries rules from multiple style modules.

## TextContentWrapper

Elements 8, 11, 19, 22, 30, 33: `div.openui-markdown-renderer.openui-markdown-renderer--variant-clear.openui-inline-markdown-renderer-content`

Modules: `InlineMarkdownRenderer/inlineMarkdown.styles.mjs`, `MarkDownRenderer/markdown.styles.mjs`

- InlineMarkdownRenderer/inlineMarkdown.styles.mjs ↔ MarkDownRenderer/markdown.styles.mjs: color, font, font-family, font-size, font-stretch, font-style, font-variant, font-weight, letter-spacing, line-height

## SourceFaviconImage

No element carries rules from multiple style modules.

## Citation

No element carries rules from multiple style modules.

## Sources

No element carries rules from multiple style modules.

## InlineMarkdownRenderer

Elements 1: `div.openui-markdown-renderer.openui-markdown-renderer--variant-clear.openui-inline-markdown-renderer-content`

Modules: `InlineMarkdownRenderer/inlineMarkdown.styles.mjs`, `MarkDownRenderer/markdown.styles.mjs`

- InlineMarkdownRenderer/inlineMarkdown.styles.mjs ↔ MarkDownRenderer/markdown.styles.mjs: color, font, font-family, font-size, font-stretch, font-style, font-variant, font-weight, letter-spacing, line-height

Elements 5: `div.openui-markdown-renderer.openui-markdown-renderer--variant-clear.openui-markdown-renderer--typography-inherit.openui-inline-markdown-renderer-content`

Modules: `InlineMarkdownRenderer/inlineMarkdown.styles.mjs`, `MarkDownRenderer/markdown.styles.mjs`

- InlineMarkdownRenderer/inlineMarkdown.styles.mjs ↔ MarkDownRenderer/markdown.styles.mjs: color, font, font-family, font-size, font-stretch, font-style, font-variant, font-weight, letter-spacing, line-height

## TooltipWrapper

No element carries rules from multiple style modules.

## Modal

No element carries rules from multiple style modules.

## SectionBlock

Elements 11, 22: `div.openui-separator.openui-foldable-section-trigger-content-separator`

Modules: `SectionBlock/foldableSection.styles.mjs`, `Separator/separator.styles.mjs`

Shared properties: none.

Elements 13, 24: `span.openui-icon-button.openui-icon-button--variant-secondary.openui-icon-button--size-3-extra-small.openui-icon-button--shape-square.openui-icon-button--tone-default.openui-foldable-section-trigger-content-icon-button`

Modules: `IconButton/iconButton.styles.mjs`, `SectionBlock/foldableSection.styles.mjs`

- IconButton/iconButton.styles.mjs ↔ SectionBlock/foldableSection.styles.mjs: flex-shrink

## Accordion

No element carries rules from multiple style modules.

## Steps

No element carries rules from multiple style modules.

## CardHeader

No element carries rules from multiple style modules.

## Card

No element carries rules from multiple style modules.

## Charts/AreaChart

Elements 0: `div.openui-area-chart.openui-area-chart--variant-natural.openui-area-chart--stacked.openui-chart-empty`

Modules: `Charts/AreaChart/areaChart.styles.mjs`, `Charts/shared/chartBase.styles.mjs`

- Charts/AreaChart/areaChart.styles.mjs ↔ Charts/shared/chartBase.styles.mjs: display

## Charts/BarChart

Elements 0: `div.openui-bar-chart.openui-bar-chart--variant-grouped.openui-chart-empty`

Modules: `Charts/BarChart/barChart.styles.mjs`, `Charts/shared/chartBase.styles.mjs`

- Charts/BarChart/barChart.styles.mjs ↔ Charts/shared/chartBase.styles.mjs: display

## Charts/HorizontalBarChart

Elements 0: `div.openui-horizontal-bar-chart.openui-horizontal-bar-chart--variant-grouped.openui-chart-empty`

Modules: `Charts/BarChart/barChart.styles.mjs`, `Charts/shared/chartBase.styles.mjs`

- Charts/BarChart/barChart.styles.mjs ↔ Charts/shared/chartBase.styles.mjs: display

Elements 58, 130: `button.openui-icon-button.openui-icon-button--variant-secondary.openui-icon-button--size-extra-small.openui-icon-button--shape-square.openui-icon-button--tone-default.openui-scroll-buttons-vertical-button.openui-scroll-buttons-vertical-up`

Modules: `Charts/shared/cartesian/ScrollButtonsVertical/scrollButtonsVertical.styles.mjs`, `IconButton/iconButton.styles.mjs`

- Charts/shared/cartesian/ScrollButtonsVertical/scrollButtonsVertical.styles.mjs ↔ IconButton/iconButton.styles.mjs: background-color, cursor, transition, transition-delay, transition-duration, transition-property, transition-timing-function

Elements 61, 133: `button.openui-icon-button.openui-icon-button--variant-secondary.openui-icon-button--size-extra-small.openui-icon-button--shape-square.openui-icon-button--tone-default.openui-scroll-buttons-vertical-button.openui-scroll-buttons-vertical-down`

Modules: `Charts/shared/cartesian/ScrollButtonsVertical/scrollButtonsVertical.styles.mjs`, `IconButton/iconButton.styles.mjs`

- Charts/shared/cartesian/ScrollButtonsVertical/scrollButtonsVertical.styles.mjs ↔ IconButton/iconButton.styles.mjs: background-color, cursor, transition, transition-delay, transition-duration, transition-property, transition-timing-function

## Charts/LineChart

Elements 0: `div.openui-line-chart.openui-line-chart--variant-natural.openui-chart-empty`

Modules: `Charts/LineChart/lineChart.styles.mjs`, `Charts/shared/chartBase.styles.mjs`

- Charts/LineChart/lineChart.styles.mjs ↔ Charts/shared/chartBase.styles.mjs: display

## Charts/ScatterChart

Elements 0: `div.openui-chart-empty.openui-scatter-chart`

Modules: `Charts/ScatterChart/scatterChart.styles.mjs`, `Charts/shared/chartBase.styles.mjs`

- Charts/ScatterChart/scatterChart.styles.mjs ↔ Charts/shared/chartBase.styles.mjs: align-items, display

## MarkDownRenderer

Elements 7, 23, 29, 69, 85, 91, 131, 147, 153, 193, 209, 215: `div.openui-code-block.openui-markdown-renderer-code-block`

Modules: `CodeBlock/codeBlock.styles.mjs`, `MarkDownRenderer/markdown.styles.mjs`

Shared properties: none.

Elements 8, 24, 30, 70, 86, 92, 132, 148, 154, 194, 210, 216: `button.openui-code-block-copy-button.openui-icon-button.openui-icon-button--variant-secondary.openui-icon-button--size-small.openui-icon-button--shape-square.openui-icon-button--tone-default`

Modules: `CodeBlock/codeBlock.styles.mjs`, `IconButton/iconButton.styles.mjs`

- CodeBlock/codeBlock.styles.mjs ↔ IconButton/iconButton.styles.mjs: background-color, color, transition, transition-delay, transition-duration, transition-property, transition-timing-function

Elements 35, 97, 159, 221: `div.openui-table-container.openui-markdown-renderer-table-container`

Modules: `MarkDownRenderer/markdown.styles.mjs`, `Table/table.styles.mjs`

Shared properties: none.

## Button

No element carries rules from multiple style modules.

## IconButton

No element carries rules from multiple style modules.

## Tabs

No element carries rules from multiple style modules.

## ListItem

No element carries rules from multiple style modules.

## ListBlock

No element carries rules from multiple style modules.

## EntityList

Elements 4, 7, 11, 14, 18, 21, 25, 28, 33, 36, 40, 43, 47, 50, 54, 57, 62, 65, 69, 72, 77, 80, 84, 87: `div.openui-markdown-renderer.openui-markdown-renderer--variant-clear.openui-inline-markdown-renderer-content`

Modules: `InlineMarkdownRenderer/inlineMarkdown.styles.mjs`, `MarkDownRenderer/markdown.styles.mjs`

- InlineMarkdownRenderer/inlineMarkdown.styles.mjs ↔ MarkDownRenderer/markdown.styles.mjs: color, font, font-family, font-size, font-stretch, font-style, font-variant, font-weight, letter-spacing, line-height

## MetricIndicator

No element carries rules from multiple style modules.

## Table

Elements 49: `div.openui-table-container.openui-scrollable-table-scroll-container`

Modules: `Table/scrollableTable.styles.mjs`, `Table/table.styles.mjs`

- Table/scrollableTable.styles.mjs ↔ Table/table.styles.mjs: overflow, overflow-x, overflow-y

Elements 50: `table.openui-table.openui-scrollable-table`

Modules: `Table/scrollableTable.styles.mjs`, `Table/table.styles.mjs`

- Table/scrollableTable.styles.mjs ↔ Table/table.styles.mjs: width

## EditableTable

No element carries rules from multiple style modules.

## PieChart

Elements 580: `div.openui-chart-empty.openui-pie-chart.openui-pie-chart--variant-pie.openui-pie-chart--appearance-circular`

Modules: `Charts/PieChart/pieChart.styles.mjs`, `Charts/shared/chartBase.styles.mjs`

- Charts/PieChart/pieChart.styles.mjs ↔ Charts/shared/chartBase.styles.mjs: align-items, display

## RadarChart

Elements 639: `div.openui-chart-empty.openui-radar-chart.openui-radar-chart--variant-line.openui-radar-chart--grid-shape-polygon`

Modules: `Charts/RadarChart/radarChart.styles.mjs`, `Charts/shared/chartBase.styles.mjs`

- Charts/RadarChart/radarChart.styles.mjs ↔ Charts/shared/chartBase.styles.mjs: align-items, display

## RadialChart

Elements 400: `div.openui-chart-empty.openui-radial-chart.openui-radial-chart--variant-circular`

Modules: `Charts/RadialChart/radialChart.styles.mjs`, `Charts/shared/chartBase.styles.mjs`

- Charts/RadialChart/radialChart.styles.mjs ↔ Charts/shared/chartBase.styles.mjs: align-items, display

## FunnelChart

Elements 356: `div.openui-chart-empty.openui-funnel-chart.openui-funnel-chart--edges-curved.openui-funnel-chart--orientation-horizontal`

Modules: `Charts/FunnelChart/funnelChart.styles.mjs`, `Charts/shared/chartBase.styles.mjs`

- Charts/FunnelChart/funnelChart.styles.mjs ↔ Charts/shared/chartBase.styles.mjs: align-items, display

## HeatmapChart

Elements 403: `div.openui-chart-empty.openui-heatmap-chart.openui-heatmap-chart--ramp-mode-sequential`

Modules: `Charts/HeatmapChart/heatmapChart.styles.mjs`, `Charts/shared/chartBase.styles.mjs`

- Charts/HeatmapChart/heatmapChart.styles.mjs ↔ Charts/shared/chartBase.styles.mjs: align-items, display

## CalendarHeatmap

Elements 3267: `div.openui-chart-empty.openui-calendar-heatmap.openui-calendar-heatmap--layout-fluid.openui-calendar-heatmap--legend-variant-swatches`

Modules: `Charts/CalendarHeatmap/calendarHeatmap.styles.mjs`, `Charts/shared/chartBase.styles.mjs`

- Charts/CalendarHeatmap/calendarHeatmap.styles.mjs ↔ Charts/shared/chartBase.styles.mjs: align-items, display

## SegmentedBar

Elements 25, 51, 139: `div.openui-default-legend.openui-segmented-bar-default-legend`

Modules: `Charts/SegmentedBar/segmentedBar.styles.mjs`, `Charts/shared/core/DefaultLegend/defaultLegend.styles.mjs`

- Charts/SegmentedBar/segmentedBar.styles.mjs ↔ Charts/shared/core/DefaultLegend/defaultLegend.styles.mjs: padding-top

Elements 77, 108: `div.openui-stacked-legend.openui-segmented-bar-stacked-legend`

Modules: `Charts/SegmentedBar/segmentedBar.styles.mjs`, `Charts/shared/core/StackedLegend/stackedLegend.styles.mjs`

Shared properties: none.

Elements 85, 92, 116, 123: `div.openui-separator.openui-stacked-legend-separator`

Modules: `Charts/shared/core/StackedLegend/stackedLegend.styles.mjs`, `Separator/separator.styles.mjs`

Shared properties: none.

Elements 156: `div.openui-chart-empty.openui-segmented-bar.openui-segmented-bar--legend-variant-default.openui-segmented-bar--legend`

Modules: `Charts/SegmentedBar/segmentedBar.styles.mjs`, `Charts/shared/chartBase.styles.mjs`

- Charts/SegmentedBar/segmentedBar.styles.mjs ↔ Charts/shared/chartBase.styles.mjs: align-items, display, justify-content
