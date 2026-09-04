---
title: "Goal: Harness Fidelity and Replay"
description: "What would make phase 042 worth having done, and the criteria that decide it."
trigger_phrases:
  - "042 goal"
  - "harness fidelity and replay goal"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/042-harness-fidelity-and-replay"
    last_updated_at: "2026-09-04T01:41:43Z"
    last_updated_by: "verifier"
    recent_action: "Reconciled 042 docs during rebase: manifest-compare fix + 6 open-row replay claims merged"
    next_safe_action: "External lane per D14, then in-runtime gate verification with Chrome (tasks.md T019-T023)"
    blockers: []
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
      - "tools/screenshots/pixel-hash.mjs"
      - "tools/lane/check-lane.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-042-goal"
      parent_session_id: null
    completion_pct: 90
    open_questions:
      - "Is the chart view constructed through the same bag pattern as the other six renderers"
    answered_questions:
      - "Does the manifest-compare fix belong in check-lane.mjs or a shared comparator — it lives in check-lane.mjs, reading tools/screenshots/pixel-hash.mjs's decodePng/pixelHash"
---
# Goal: Harness Fidelity and Replay

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> Everything above the log is DURABLE: it is what an operator sets as the session
> objective, and it must stay true for the life of the packet. Keep it short —
> the runtime goal surfaces cap what they will hold, and a truncated objective
> loses its tail, which is where the completion criteria live.

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Close the parent's three unticked DONE-table rows (renderer coverage, replay
backfill, harness-dependency audit) by making every check verified against the production path
and every replay claim honest about the number it holds.

### Decisions

Frozen choices. Changing one is an amendment.

| ID | Decision |
|----|----------|
| D1 | Every new render-assertion scenario carries its own owned negative control, observed red before green (parent D2, D4). |
| D2 | A replay entry's pre-fix number is the number the original verifier measured, cited from its own report — never derived after the fact. |
| D3 | A row-6 dependency is either removed or declared with the exact criterion it cannot prove. A dependency found and left silent is a worse state than the row staying unticked. |
| D4 | This phase reaches Verified by construction, per `026`'s D5. Operator-confirmed never — nothing here is a device-facing surface. |
| D5 | The manifest-compare fix must still catch a deliberately mutated capture in an A/B control (parent D12) before its tolerance is accepted. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [x] A render-assertion scenario constructs the production chart renderer and asserts a
      thresholded property of what it builds, with an owned negative control observed red before
      green. **Met.** `chart/file-view` constructs `ChartRenderer` and reads 30 layout reads against
      a bound of 48. Observed red first: `RENDER_READ_CONTROL=per-item` armed a per-row read at the
      render entry and the lane failed by name — **was 1630 reads against bound 48, exit 1**.
- [x] Render-assertion scenarios construct the production `CalendarRenderer` at `scale: "week"`
      and `scale: "day"`, each with an owned negative control and bounds set from measured reads.
      `renderer-coverage.json` moves from 6 of 22. **Met.** Both scales read 0 against a bound of 8
      on both bags; `renderer-coverage.json` records `constructed: 7, total: 22`, published 6 -> 7.
      Observed red first under `RENDER_READ_CONTROL=per-item` — **week was 14 reads against bound 8,
      day was 1600 against 8, both bags, exit 1**.
- [x] `npm run replay` carries a claim for report 29, reports 34-36, and phases `037`-`041`, each
      held against its recorded pre-fix number; the replay lane reds when a required entry is
      missing. **Met.** 21 claims, `reversed: 0`, exit 0 — was 8 claims before this phase. Every one
      of the ten static entries was re-measured on its own fix commit's parent tree and returns a
      value differing from what it records; the pre-fix pairs are `0262386: 5`, `55bff9b: 0`,
      `b9e2321: 1`, `a6fcd31: 2`, `57043e7: 4`, `1588576: 1`, `1d611db: 2`, `00b7bd2: 0`,
      `cb9aedf: 1`, `25ae3a9: 10`. Observed red three ways: removing one entry gave **exit 1, "21
      published, this run carries 20"**; moving `sheet-rebuild.json` aside gave **exit 1, 2 claims
      BROKE**; moving `sheet-teardown.json` aside gave **exit 1, 1 claim BROKE**.

      **2026-09-04, later: the six open-row fixes shipped after `037`-`041` landed added.** Six of
      them closed after this criterion was first met — `038`'s hover/drag/drop-target/empty-column
      row (`7e36671`), `040`'s same-parent-reorder row (`535373a`), `041`'s reduced-motion row in
      two commits (`a251a43`, `3f143df`), and two of `037`'s remaining rows (`fa58c7f`, `b29bf7f`)
      — and none had a replay claim. **Still Met, now 27 claims.** `node tools/live/replay.mjs`,
      `$?` read directly: `0`, `reversed: 0`. Each new entry's own measure was re-run on `<sha>^`,
      extracted via `git archive` (not `git checkout` against a shared work-tree, which mutates the
      index of whatever repo runs it): `7e36671: 0 -> 2`, `535373a: 0 -> 2`, `a251a43: 0 -> 1`,
      `3f143df: 0 -> 1`, `fa58c7f: 0 -> 4`, `b29bf7f: 0 -> 2`. Mutation control: moving `535373a`'s
      `recorded` by one gave **exit 1, "replay: FAIL — 1 result(s) reversed"**, restored and
      re-verified green. `tasks.md` T024 carries the per-entry evidence and the one correction this
      pass made to its own dispatch brief: the brief's prose swapped `3f143df` and `a251a43`'s
      descriptions, and the claims here are written against the two commits' actual diffs and the
      parent `goal.md` log, not the swapped prose.
- [x] Every row-6 dependency (pinned `runtime-vars.css` calendar formula, `touch-targets.mjs` /
      `unstyled-links.mjs` fixture reads, `theme.css`'s absent `.mod-cta`) is removed or declared
      with the criterion it cannot prove. **Met.** Removed, each against its recorded pre-fix state:
      the calendar formula **was `calc((100vh - 150px) / 5)`** against a production default of
      `112px` that `getCellMinHeight()` returns and never derives from a viewport, now pinned to
      that default; and `theme.css` **was 0 `button.mod-cta` rules**, so every CTA in the corpus
      photographed in the neutral button style, now 1 rule transcribed from the installed Obsidian
      1.13.4 `app.css` and read in eight recaptured images. Declared: `touch-targets.mjs` and
      `unstyled-links.mjs` still read fixtures, with a bounded list of what each cannot prove in
      `tasks.md`.
- [x] The capture manifest compare is corrected to a content/layout-hash or declared-tolerance
      basis, and the fix is A/B'd against a clean HEAD clone showing it still catches a
      deliberately mutated capture. **Met.** `capture.mjs` now records a coarse, jitter-tolerant
      `pixelHash` of each PNG's decoded pixels (`tools/screenshots/pixel-hash.mjs`), beside the
      existing `layoutHash`; `check-lane.mjs`'s changed-capture set is filtered by
      `pixelHash`/`layoutHash` agreement between the working-tree manifest and `git show
      HEAD:screenshots/manifest.json` before `reviewVerdict()` ever sees it. A/B on this worktree
      (branched clean off `main`): two full detached recaptures moved a different 15-file and
      11-file set of PNG bytes against the committed tree — observed red on the unfixed
      comparator first, **was 12 changed capture(s) this release does not name, exit 1** — and
      **0 of 276 `pixelHash`/`layoutHash` moved** between the two runs, so the corrected
      comparator excludes all of them: `release names all 0 changed capture(s), exit 0`. Decoding
      the committed bytes of every round-2 mover confirmed each pixel-identical to the fresh
      capture before any were restored. A steady-state control with one entry's `pixelHash`
      deliberately overwritten still reported exactly that one path changed and no others.
- [x] `SURFACE_PHASE=042-harness-fidelity-and-replay npm run gate` exits 0, read from `$?` directly.
      **Met.** `gate: PASS — 25 green, 0 red for a declared reason`. The capture lane was observed red
      first: `check-lane` reported **6 changed captures the release did not name, exit 1**, before the
      release entry naming all eight was appended.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

Everything below is VOLATILE. It is not part of the directive, it is not copied
into the objective, and it is expected to grow. Progress, evidence, deviations
and findings belong here.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Phase folder opened | Done | `specs/005-component-surface-system/042-harness-fidelity-and-replay/` scaffolded via `create.sh --phase --parent`, Level 3 |
| Chart renderer scenario | Done | `chart/file-view`, 30 reads against bound 48; armed control was 1630, exit 1 |
| Calendar week/day scenarios | Done | Both scales 0 against bound 8; armed control was 14 (week) and 1600 (day), exit 1 |
| Replay backfill | Done | 21 claims, `reversed: 0`; was 8. All ten static entries re-measured on `<sha>^` and none is vacuous |
| Row-6 dependency audit | Done | `runtime-vars.css` and `theme.css` corrected; the two fixture lanes declared with a bounded list in `tasks.md` |
| Manifest-compare fix | Done | `pixelHash` added to the manifest (`tools/screenshots/pixel-hash.mjs`); `check-lane.mjs` filters by content. Two-run A/B: 0 of 276 `pixelHash`/`layoutHash` moved; `check-lane` went from FAIL (12 unnamed) to PASS (0 changed), exit 0 |
| Six open-row-fix replay claims | Done | 21 -> 27 claims, `reversed: 0`. All six re-measured on `<sha>^`, none vacuous |

### Deviations and findings

| Item | Note |
|------|------|
| Level raised over `recommend-level.sh`'s answer | The script scored 61/100 (loc=650, files=10) and 66/100 (loc=850, files=12, reflecting the touch-targets/unstyled-links refactor row 6 implies) — both mid-to-upper Level 2, neither past the 70-point Level 3 floor. Raised to Level 3 anyway, per the operator's explicit "go higher if in doubt" and parity with `020-harness-fidelity-repair`, the closest prior art for this exact class of harness-truthfulness work, which is itself Level 3. |
| `pixelHash` computed by a hand-written PNG decoder, not an added dependency | No PNG pixel-decode library exists anywhere in `node_modules` or the lockfile. `verify.mjs` already carried a full 8-bit PNG un-filter pass for its flat-colour check; that pass moved into a shared `tools/screenshots/pixel-hash.mjs` (`decodePng`) rather than adding `pngjs` or similar, matching the repository's existing no-runtime-dependency posture for this pipeline. |
| `pixelHash` is a coarse, quantised hash, not a raw pixel-byte hash | A raw byte hash of decoded pixels would still move on the antialiasing jitter this fix exists to absorb — capture.mjs's own comment already documents the raster, not only the encoder, as non-deterministic. `pixelHash` averages a 16x16 grid of cells and rounds each channel into 32 buckets before hashing, proven stable against a synthetic one-unit jitter and against the two real detached runs (0 of 276 changed) while still separating a deliberately mutated block or a deliberately overwritten hash in every control run. |

### Six open-row-fix replay claims added, 2026-09-04

`037`-`041` closed six more open rows on `main` after this phase first met its replay criterion:
`038`'s hover/drag/drop-target/empty-column row (`7e36671`), `040`'s same-parent-reorder row
(`535373a`), `041`'s reduced-motion row in two commits (`a251a43` joins `.db-surface` into the
reset's selector list, `3f143df` splits it into its own zero-duration rule), and two of `037`'s
remaining rows (`fa58c7f` titles the rendered window/keeps the first tick whole/adds the milestone
placement helper/narrows the day scale; `b29bf7f` adds the `.is-label-above` rule and moves the
lane `row-gap` onto `--db-space-8`). None had a replay claim. Six added, each re-measured on its
own `<sha>^` via `git archive` into a scratch directory: `7e36671: 0 -> 2`, `535373a: 0 -> 2`,
`a251a43: 0 -> 1`, `3f143df: 0 -> 1`, `fa58c7f: 0 -> 4`, `b29bf7f: 0 -> 2`. `npm run replay`: 27
claims, `reversed: 0`, exit 0. Mutation control on `535373a`'s entry (`recorded` moved by one):
exit 1, "1 result(s) reversed", restored and re-verified green. `npm run gate`: 25 green, exit 0,
no capture drift (only `measuredAt` stamps moved on the freshness JSONs the gate itself re-runs).
tsc, `vitest` (925 tests), `lint:tools`, `scan-comments` all clean; `lint` (`src/`, untouched by
this pass) stays at its pre-existing 172-problem baseline. One correction to the dispatch that
requested this work: its prose swapped `3f143df` and `a251a43`'s descriptions; the claims above
are written against the two commits' actual `git show` diffs and the parent `goal.md` log's own
"`041`'s last open row closed" entry, not the swapped prose.
<!-- /ANCHOR:log -->
