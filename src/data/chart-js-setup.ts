// ───────────────────────────────────────────────────────────────────
// MODULE:    chart-js-setup
// COMPONENT: registers the exact Chart.js controllers/elements this plugin uses
// ───────────────────────────────────────────────────────────────────
//
// Chart.js is tree-shakeable and registers nothing by default, so every
// controller/element/scale used anywhere in the chart view must be listed
// here or Chart throws "arc is not a registered element" (etc.) at render
// time. Import Chart from this module (not "chart.js" directly) so
// registration always runs first.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  DoughnutController,
  Chart,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PieController,
  PointElement,
  Tooltip,
} from "chart.js";

// ───────────────────────────────────────────────────────────────────
// 2. REGISTER
// ───────────────────────────────────────────────────────────────────

Chart.register(
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  DoughnutController,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PieController,
  PointElement,
  Tooltip,
);

export { Chart };
