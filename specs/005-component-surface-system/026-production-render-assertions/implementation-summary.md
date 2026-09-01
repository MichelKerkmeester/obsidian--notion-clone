---
title: "Implementation Summary: Production Render Assertions"
description: "What was built, the six control runs with their verbatim failures, and what is and is not proven by the green run."
trigger_phrases:
  - "026 implementation summary"
importance_tier: "critical"
contextType: "verification"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/026-production-render-assertions"
    last_updated_at: "2026-08-30T18:15:00Z"
    last_updated_by: "code-agent"
    recent_action: "Phase implemented; all nine criteria Met; controls N1-N4, N6 red as specified"
    next_safe_action: "Re-run N5's clean form once the CSS lane lands and re-stamps its artefacts"
    blockers:
      - "npm run gate cannot exit 0 while the CSS lane's styles.css edit is in flight (evidence + screenshots red)"
    key_files:
      - "tools/live/render-assertions.mjs"
      - "tools/live/render-assertion-harness.ts"
      - "tools/gate.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-026-impl"
      parent_session_id: null
    completion_pct: 100
    open_questions:
      - "N5's clean observation pending the CSS lane landing"
    answered_questions:
      - "Ratchet placement: the check enforces it (fails before stamping) and the stamp dates it"
---
# Implementation Summary: Production Render Assertions

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|---|---|
| **Spec Folder** | 026-production-render-assertions |
| **Level** | 2 |
| **Status** | Implemented — all nine acceptance criteria Met (N5's clean gate run pending the CSS lane) |
| **State** | Committed `1bac3c2` (2026-08-30 18:37:45); the body's "no commit was made" reflects the state when it was written |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## 1. WHAT SHIPPED

One gate check that bundles the shipped renderers and asserts what they build, in headless Chrome:

| File | Role |
|---|---|
| `tools/live/render-assertions.mjs` | The gate check: esbuild bundle with metafile, Chrome launch (`SCREENSHOT_CHROME` honoured), four scenarios, bag-shape comparison against the measured host construction sites, coverage ratchet + evidence stamp, verdict. Exits non-zero on any failure |
| `tools/live/render-assertion-harness.ts` | Browser side: measured fixtures (the operator's 21-column database at 30% fill, 1,600 rows; the table bench's 16 columns, 2,000 rows), the two host action bags built as data, layout-read and row-append instrumentation, the assertion suite, provenance tagging |
| `tools/live/renderer-coverage.json` | Evidence-stamped coverage artefact: `constructed` (2) of `total` (22), dated by `stamp()` and checked by `evidence --check-all` |
| `tools/gate.mjs` | One entry: `render-assertions` → `node tools/live/render-assertions.mjs` |
| `tools/bench/list-render-bench.ts`, `table-render-bench.ts` | Additive `export` on the fixture builders so the harness renders the same measured shapes the benches time |

Nothing under `src/` or `styles.css` was edited by this phase; the renderers are bundled, never
copied.
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## 2. WHAT THE CHECK ASSERTS

Structural facts with thresholds, per scenario (renderer × host bag):

- **Provenance** — the DOM carries the marker the real render call applied; a fixture is refused
  with a message naming the substitution. The esbuild metafile must name both renderer sources.
- **Rows** — every row is rendered (1,600 list / 2,000 table).
- **Affordances** — the row open button, row checkbox and selection checkbox are one per row.
- **Field structure** — every list row renders every non-title column; empty slots reserve their
  grid-column index (1..20); placeholders equal fields minus value fields and exist at 30% fill.
- **Column alignment** — the named column sits at the same grid column on every row that renders it;
  the table's named column holds the same cell index on every row.
- **Row-click behaviour** — in the file-view bag, clicking a row title invokes `openRecordDetail`
  exactly once; the embed bag omits the member, and the difference is printed by name.
- **Shape, not timings** — list: layout reads during render ≤ 8 (HEAD: 2); table: no data row
  appended to a connected tbody. The benches keep the millisecond budgets.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:verification -->
## 3. THE SIX CONTROLS — EACH OBSERVED FAILING

All exit statuses read directly (`cmd >/tmp/log 2>&1; echo $?`). Full verbatim records with
restoration details are in `acceptance-criteria.md` §3.

| # | Mutation | Observed | Exit |
|---|---|---|---|
| N1 | Row open button deleted from the renderer | `row open affordance is one per row — 0 open buttons for 1600 rows` | 1 |
| N2 | Fixture DOM substituted for renderer output | `refusing DOM without a bundled-renderer marker (got "none"): hand-written markup resembles renderer output and proves nothing about it` | 1 |
| N3 | Check run at `173819e^` (`f27da7f`) | `no forced layout inside the row loop — 1600 layout reads during render, bound 8 — reads scale with rows` | 1 |
| N3 green | Check at `HEAD` (`845a27c`) | `shape list/file-view 2 layout reads during render, bound 8`; PASS | 0 |
| N4 | `openRecordDetail` removed from the file-view bag | `bag shape list/file-view: missing openRecordDetail` + click assertion | 1 |
| N5 | Entry removed from `CHECKS` | gate exit 1; all four reds are concurrent-session movement (stray `tools/screenshots/.tmp`; evidence stale on mid-edit `styles.css`; captures not refreshed; placement crash on mid-edit `src/`) — the removal itself changed nothing | 1 (clean form pending) |
| N6 | Table scenarios removed from the runner | `coverage cannot decrease: 2 published, this check constructs 1` | 1 |

Scratch trees were detached worktrees under `.worktrees/` (gitignored) at recorded commits, removed
after each run; single-file scratch edits were restored from backups with sha256 verified before and
after (`gate.mjs` `763c8a32…`, runner `8efce34e…`).
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## 4. WHAT A GREEN RUN PROVES — AND DOES NOT

Green means: at this commit, the shipped `ListRenderer` and `TableRenderer` built the asserted
structure under both measured host action bags, in headless Chrome, with no per-row forced layout and
no row appended to a connected table.

It does **not** prove: that `DatabaseView` or `EmbeddedDatabaseRenderer` work (neither is
constructed — both need a live App, workspace and metadata cache); that any device behaves like this
(no device is involved); that vault-resolving fields render correctly (`App` is undefined, so they
render unresolved — a real database pays more per field, never less). The runner prints exactly these
exclusions in its own output on every green run, so a later quote of the check carries its limits.

## 5. FINDINGS THE INSTRUMENT SURFACED ON ITS FIRST RUN

1. **The embed omits `openRecordDetail`**, so an embedded list row cannot open the record panel.
   Whether that is intentional belongs to the embed's owner; this phase asserts the difference
   exists and prints it by name. Left unfixed per the plan's scope boundary.
2. **The published AC-3 census was inaccurate**: it counted `includeWidthActions` (an option literal
   inside `showColumnMenu`'s argument, not a bag member) and missed `expandGroup` (a 4-space
   indentation quirk at both construction sites). Precise census: file-view 26, embed 19, shared 18,
   file-view-only 8, embed-only 1.
3. **`173819e^` renders 1,600 layout reads per render** — the check's red side, exactly the shipped
   freeze's shape, and the strongest evidence the check is not theatre.
<!-- /ANCHOR:limitations -->

---

## 6. MOVEMENT IN THE TREE THIS PHASE DID NOT CAUSE

The working tree was under active concurrent modification throughout implementation: the gate gained
a `shim-coverage` check and a renamed `story-coverage` command, `package.json` gained scripts, three
new benches appeared, `src/views/` files and `styles.css` changed, and the evidence artefacts went
stale against the mid-edit stylesheet. All of it is the other sessions' work; this phase's footprint
is `tools/live/`, two bench export additions, `tools/gate.mjs` and this spec folder. `npx vitest run`
still passes 444 tests; `npx tsc --noEmit`, `npm run lint:tools` and
`node tools/naming/scan-comments.mjs` all exit 0.

---

<!-- ANCHOR:decisions -->
## 7. DEVIATIONS FROM THE PLAN

| Plan said | What happened | Why |
|---|---|---|
| N5's clean form: `npm run gate` still exits 0 | Observed with 4 unrelated reds; clean form deferred | The gate cannot exit 0 while the CSS lane's mid-edit `styles.css` leaves 8 of 9 evidence artefacts stale. The control's claim — AC-1 measures the entry, not the file — is carried by the entry being demonstrably able to fail (N1-N4, N6), and by the removal changing nothing |
| `../007-architecture-research/harvest.md` §3.3 O2 updated | Left to the harvest's owner | The plan's scope boundary forbids sibling-phase documents; the consequence is measurable in the runner's output instead |
| Table bags under both hosts | Done, with the measured host bags rather than the bench's minimal one | The bench's bag would have asserted nothing about host shape; the runner pins the measured sets |

Committed after the fact as `1bac3c2`, `test(harness): assert against production renderers, and
survive a throwing check`, together with the placement-harness repair that shares its lane. The
sentence this replaces was true when written; the commit followed 22 minutes later.
<!-- /ANCHOR:decisions -->
