# Final Plan: On-change Automations / Triggers
> Reviewed & optimized build plan, from a fresh Grok 4.6 (xhigh-fast) review of this phase's rewritten spec/plan/tasks/checklist plus its synthesis and research.

## Review — strengths, gaps, risks

**Do not build.** Parent Wave 6 is never-default (`002-note-db-notion-parity-build/spec.md`: 016 is OUT, “no build plan”). Synthesis Verdict is DO-NOT-BUILD / HOLD. The 10 iterations prove a EuroFormat-shaped engine is **design-ready**; they do not make iCloud safe. `vault.on("modify")` has no origin bit (obsidian-log-keeper#23). `DataSource` already wraps vault/metadata (`startListening` `145-192`) and mints 5s dual-channel credits (`markOwnedPath` `2009-2024`, `consumeOwnedPath` `2036-2054`). Origin is `"plugin" | "external"` at `scheduleNotify` (`1938-1966`), **not** at `163-166` (that is only the `vault.on("modify")` registration — spec §2 cites the wrong lines). Credits classify **this process’s** writes. A second desktop’s iCloud/Sync pull is `origin === "external"` and looks like a user edit. An engine that treats external as “when field X changed” will write, sync, and retrigger. Network buttons have no people/identity model (`PluginSettings` `types.ts:547-568` has none). Cron is not even a Notion automation trigger (Thomas Frank; research.md F11).

What is solid: REQ-001–003; raw `vault.on` ruled out; `onDataChanged` (`124-129`) named as the only legal future subscribe (same as `DatabaseView.ts:742`, `EmbeddedDatabaseRenderer.ts:422`); owned-path windows must not be wrapped; T011/T012 **never**; synthesis correctly killed iteration 8’s extra files (`AutomationTypes.ts` / `AutomationModal.ts` / `AutomationListRenderer.ts`) past the 1-module pattern (`EuroFormat.ts:8-9`).

What is wrong or under-weighted:

- **`tasks.md` completion criteria would force a build.** “All tasks `[x]`” and “No `[B]` remaining” contradict HOLD. T001 (the ship lock) is still `[ ]`. Plan §2 DoR/DoD boxes are all empty while 015 marked the same boxes done. No `checklist.md`.
- **The frozen subscribe *is* the loop.** Research Iteration 1 F2 said `origin === "external"` is “when field X changed (not by the plugin).” Synthesis open Q1–Q2 override that: owned-path credits are **not** a first-class hook; two desktops both running the engine stay unsafe. The locked 5-stage algorithm still evaluates external batches. Debounce 80ms + 2s + 3s (`DataSource.ts:1994-1998`, `RefreshCoordinator.ts:97-103` / `:61`) does not distinguish sync from user.
- **`FilterRule` + `applyFilters` are state matchers, not transition matchers.** `FilterRule` is `{ field, op, value }` (`types.ts:137-141`). `QueryEngine.applyFilters` (`:74-95`) tests the **current** row. “Status changed to Done” is a net-new transition chip. Calling `applyFilters` alone would fire on every external touch of a file that already matches. `evaluateBaseFilterExpression` (`BaseExpression.ts:59-62`) is file/frontmatter-scoped (`:12-21`); no Trigger-page context (T010 correctly never in v1).
- **EuroFormat budget is understated.** Frozen “3 call sites” omit `PluginSettings` (`types.ts:547-568`) and `i18n.ts` (T007). `valuesEqual` (`DataSource.ts:1730-1736`) is **private** — the engine cannot import it; it must copy the JSON semantics.
- **Retry citation is stretched.** `RefreshCoordinator.ts:140-144` re-queues dirty paths on error with **no** max-two cap. “Retry twice then pause after five” is new engine policy, not existing behavior.
- **`ColumnPropertySync` lives at `src/views/ColumnPropertySync.ts:22-53`** (`rename`/`delete`/`convert`), not `data/`.
- **`data.json` run-log sync** (synthesis Q6) can replicate last-run chips across machines; it is not note churn, but it is still a multi-device surface.

Effort 0 fork hours now is right. Post-revisit first slice would be M (engine + settings list), not the ranked L bulk “Edit pages in.”

## Optimizations

1. **Ship lock only.** Mark T001/T013 as the completable work; change completion to “T001 done and T002–T012 stay `[B]`/`never`.” Do not present T002–T010 as an implementation phase.
2. **Collapse post-revisit into one slice:** `AutomationEngine.ts` (subscribe/diff/match/act/log) + `main.ts:212-213` `start`/`destroy` + `DEFAULT_SETTINGS` (`settings.ts:21-33`) + `PluginSettings` (`types.ts:547-568`) + one `SettingsTab.display()` group (`:61-69`). Same-row `editProperty` only. Omit T005 `addRecord`, T008 bulk, T009 view-scope, T010 formulas from any first slice.
3. **Do not treat `origin === "external"` as user-edit** even after revisit, unless the hook/storage trigger is actually fired. Optional `editor-change` is open-file-only (log-keeper#23); synthesis Q3 default is **no** as sole origin.
4. **Keep DataSource windows untouched** (`2009-2055`). Engine must not register `vault.on`. Writes only via `enqueueWrite` (`99-122`) so actions stay plugin-origin and cannot chain (Notion: automations cannot trigger automations).
5. **Never:** T011 network buttons (REQ-002); T012 cron/recurring-template triggers (not a Notion automation trigger).

## Final build plan (ordered)

**Verdict: DO-NOT-BUILD / HOLD. 0 fork hours. No `AutomationEngine.ts`. No hook. No network button.**

1. **Confirm the lock (S)** — no new files. Deps: none.
   - Spec Status On Hold; Files to Change empty; REQ-001/002.
   - No `src/data/AutomationEngine.ts`; `main.ts:212-213` is DataSource only; `DEFAULT_SETTINGS` (`settings.ts:21-33`) has no `automations`.
   - **Check:** fork tree unchanged; owned-path windows unwrapped.

2. **Read-only / no-build alternative (S)** — Deps: step 1.
   - Leave `onDataChanged` to views (`DatabaseView.ts:742`, `EmbeddedDatabaseRenderer.ts:422`).
   - Finance “when X then Y” stays **manual** or **formula/computed/rollup** (display-only, `types.ts:69-70`). Unique-id / derived inverse / reports phases already cover identity and inbound lists without a change hook.
   - **Check:** no new write amplification on iCloud; one user edit → one note.

3. **Hold the frozen 5-stage notes; do not start them (S)** — Deps: step 1.
   - Subscribe `onDataChanged` only; drop plugin-origin; never `vault.on`.
   - Diff `(path, field, old, new)` from engine snapshot vs `getRecordSnapshot` (`DataSource.ts:239-244`); copy `valuesEqual` semantics (`1730-1736`).
   - Match = `applyFilters` **plus** a transition chip, not `applyFilters` alone.
   - Act = sequential local `editProperty` through `enqueueWrite`; `Platform.isMobile` skips `start()` of evaluation (`CellRenderer.ts:1484` pattern).
   - Record = in-memory log (Anytype `{ id, type, status, createTime, isLocal, payload }`); never vault frontmatter.
   - **Check:** T002–T010 unstarted.

4. **Revisit gate (S)** — Deps: operator-confirmed storage or API change.
   - **Exact trigger (spec REQ-003):** vault on a **non-iCloud** storage backend, **OR** Obsidian ships a **first-class** change-hook that distinguishes **user edits** from **sync/iCloud metadata echo**.
   - `onDataChanged` + owned-path credits are **not** that hook.
   - Design-readiness of the 10 iterations is **not** that hook.
   - Then write a new plan; first slice = same-row `Edit property` only (synthesis Q4 default: no bulk).

## Risks & open decisions

- **Two desktops both online** — default: still out of scope. Single-desktop-writer is **not** enough (synthesis Q2). The trigger must make every evaluating machine able to ignore sync pulls.
- **Reopen because “the engine is designed”** — default: no. Parent Wave 6 never-default.
- **`editor-change` as origin hint** — default: no for v1 (misses closed-file / other-app / mobile edits).
- **Bulk “Edit pages in”** — default: omit from first post-revisit slice; finance blast radius; require affects-N if ever shipped (`QueryEngine.ts:74-95`).
- **Rules home** — default: `automations[]` in plugin settings with optional `databaseId` (one `DEFAULT_SETTINGS` line + `PluginSettings`). Not per-view YAML.
- **Run log in `data.json`** — default: memory-first; last ~200 only if operators need history; never note YAML. Accept `data.json` may sync.
- **Network / cron behind a flag** — default: no (REQ-002; cron is not a Notion automation trigger).
- **Wrong-line origin citation (`DataSource.ts:163-166`)** — default: teach origin at `1949-1951` / credits `2009-2054` so a later owner does not “fix” the hold by reading the modify listener.
