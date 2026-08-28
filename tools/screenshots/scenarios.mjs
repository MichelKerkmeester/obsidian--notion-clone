/**
 * Screenshot scenario registry.
 *
 * Scenarios live in `scenarios/` one module per surface family, so several can be authored
 * at once without contending for a single file. This module only aggregates them.
 *
 * Every scenario renders the class structure the renderers emit, against mock rows, so the
 * shipped stylesheet is what gets photographed. Markup is hand-written rather than driven
 * through the real renderers because those need a live Obsidian App, a vault and a metadata
 * cache. The cost is that markup drift shows up as a screenshot that stops matching the
 * code; the fixture-class guard in `src/views/ScreenshotFixtures.test.ts` catches the
 * sharper failure, a class the plugin never emits and no rule ever styles.
 *
 * `sources` lists the files a scenario depicts. The staleness checker uses it to decide
 * which screenshots a change invalidates, so keep it accurate or the check goes quiet when
 * it should not.
 */

import { CORE_SCENARIOS } from "./scenarios/core.mjs";
import { TEMPORAL_SCENARIOS } from "./scenarios/temporal.mjs";
import { PANEL_SCENARIOS } from "./scenarios/panels.mjs";
import { CHROME_SCENARIOS } from "./scenarios/chrome.mjs";
import { FIELDS_SCENARIOS } from "./scenarios/fields.mjs";

export const SCENARIOS = [
  ...CORE_SCENARIOS,
  ...TEMPORAL_SCENARIOS,
  ...PANEL_SCENARIOS,
  ...CHROME_SCENARIOS,
  ...FIELDS_SCENARIOS,
];

// Two scenarios sharing an id would silently overwrite one another's PNG and leave the
// manifest describing whichever ran last.
const seen = new Set();
for (const scenario of SCENARIOS) {
  if (seen.has(scenario.id)) throw new Error(`Duplicate scenario id: ${scenario.id}`);
  seen.add(scenario.id);
}

export { ROWS } from "./scenarios/_shared.mjs";
