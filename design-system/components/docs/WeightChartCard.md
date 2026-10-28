# WeightChartCard

Weight trend card: title, goal chip, interactive line chart, range segmented control and an encouragement banner.

- **Consumer provides:** `data` (numbers), optional `labels` (one per point), `goalPct`, `defaultIndex`, `unit`, `message`.
- Hover or drag across the chart (or focus it and use ←/→) to move the selection. The line is `success` up to the selected point and `ink` after it; the tooltip is an ink bubble.
- Y axis is fixed 120–140 in this reference implementation — compute the domain from your data in production.
