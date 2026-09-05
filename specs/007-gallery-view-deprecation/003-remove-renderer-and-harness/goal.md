---
title: "Goal: Remove the Gallery Renderer and Its Harness"
description: "The durable directive this phase executes against, and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "durable directive"
  - "gallery removal goal"
  - "007 phase 3 goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "007-gallery-view-deprecation/003-remove-renderer-and-harness"
    last_updated_at: "2026-09-05T07:20:00Z"
    last_updated_by: "decisions-and-phases-pass"
    recent_action: "Authored the durable directive for the removal phase"
    next_safe_action: "Do not start. Wait for 002 to ship in a release"
    blockers:
      - "002 must be SHIPPED in a release, not merely merged (parent D8)"
      - "001's capture classification must land: four of six ids are board-shared"
    key_files:
      - "spec.md"
      - "src/views/gallery-renderer.ts"
      - "tools/live/renderer-coverage.json"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "gallery-007-003-goal"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Does gallery leave DatabaseViewType, or stay accepted-but-redirected as list did?"
    answered_questions: []
---
# Goal: Remove the Gallery Renderer and Its Harness

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> Everything above the log is DURABLE: it is what an operator sets as the session
> objective, and it must stay true for the life of the packet. Keep it short —
> the runtime goal surfaces cap what they will hold, and a truncated objective
> loses its tail, which is where the completion criteria live.

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Delete the gallery renderer and everything that measures it in one change, leaving a
gate that is smaller and still honest, and board coverage that has not moved by a pixel.

### Decisions

Frozen choices. Changing one is an amendment.

| ID | Decision |
|----|----------|
| D1 | **The renderer and its measurements leave together.** Two changes is how a gate ends up asserting a file that no longer exists, or skipping a lane and still reporting green. |
| D2 | **Lanes are removed, not skipped.** A skipped lane is a gate that passes while measuring nothing. |
| D3 | **Board-shared capture scenarios are split, not deleted.** Four of the six gallery ids also mount the board. Deleting them wholesale removes board coverage, and that is this phase's single most likely failure. |
| D4 | **The lane list is compared by NAME, not by count.** `006`'s equivalent phase watched its lane count land back at 25 by coincidence of timing and said so rather than reporting "unchanged". |
| D5 | **The dead CSS goes in this phase.** `006` deferred its `db-list-*` sweep as a T010 that is still open. Parent D6 refuses the same deferral. |
| D6 | **`card-field-renderer.ts` and `gallery-migration.ts` survive.** The first is the board's (parent D5); the second is what an old vault still needs when it meets a view this packet never reached. |
| D7 | **This phase does not start on a merge.** Parent D8: `002` must have shipped in a release. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
## 2. BINDING

**READ FIRST:** `../spec.md`, `../goal.md`, `../001-usage-and-migration-audit/implementation-summary.md`,
`../002-settings-redirect-and-migrate/implementation-summary.md` (for the release version), then this
folder's `spec.md` and `plan.md`. Also read
`../../006-list-view-deprecation/007-remove-renderer-and-harness/implementation-summary.md` — it
records a harness regression its own removal introduced, and the mechanism transfers.

**It gates `004`.** The docs cannot describe a removal that has not happened.

**Precedence.** The parent's decisions outrank anything here; this document outranks any summary of
it. Name a conflict rather than resolving it silently.
<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

Each row is checkable without opening another file, and each records what is true today so the check
has a value to move from.

- [ ] `src/views/gallery-renderer.ts` is gone. **Today: 787 lines.**
- [ ] The bench, its driver, both coverage pins, the constructed scenario, the gallery-only capture
      entries, the placement checks and the gallery-only unit specs are deleted **in the same
      change**. **Today: all present.**
- [ ] `npm run gate` exits 0 read from `$?`, and the lane list differs from the pre-change baseline
      **by name** by exactly the gallery's lanes. **Today: 25 lanes.**
- [ ] Every board capture is byte-identical to its pre-change baseline. **Today: no baseline is
      recorded, and recording one is the first task.**
- [ ] `renderer-coverage.json` carries its new floor with the reason beside the number. **Today:
      `constructed: 6, total: 21`, note reading `"was 7/22; list renderer retired"`.**
- [ ] `rg -c 'db-gallery' styles.css` returns 0, with no comma-joined selector list having lost a
      non-gallery member. **Today: 81.**
- [ ] ADR-001 has decided the union question and named its rejected alternative, rather than
      inheriting `006`'s answer silently.
- [ ] `card-field-renderer.ts` and `gallery-migration.ts` are untouched.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

Everything below is VOLATILE. It is not part of the directive, it is not copied
into the objective, and it is expected to grow.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Phase opened | Done | Parent packet opened 2026-09-05; `../spec.md` PHASE DOCUMENTATION MAP |
| `002` released | Blocked | `tasks.md` T001 — the release has not been cut |
| Baseline recorded | Not started | `tasks.md` T003 |
| Shared scenarios split | Not started | `tasks.md` T004 |
| Renderer deleted | Not started | `tasks.md` T006 |
| CSS swept | Not started | `tasks.md` T010 |
| ADR-001 taken | Not started | `tasks.md` T011 |

### Deviations and findings

| Item | Note |
|------|------|
| Four of six capture ids are board-shared | `card-cover-states`, `constructed-card-covers`, `chrome-group-selection-controls` and `constructed-group-selection-controls` mount the board too. Only `gallery-view` and `constructed-gallery` are gallery-only. `006` did not face this — the list had no shared card scenarios. |
| `006`'s equivalent phase caused its own regression | Re-pointing shared column and row builders from the deleted list bench to the table bench exposed that the two benches build differently-shaped `ViewConfig`s, blanking every constructed filter/sort/summary scenario's field selector. `npm run gate`'s `render-assertions` lane never exercised those branches — **only the full screenshot capture caught it.** That is why T014 runs the full capture. |
| The persisted surface is bigger than the list's | `gallery` in the union plus six `gallery*` `ViewConfig` fields, against `list` plus `listCompactFields`. ADR-001 has more to decide than its counterpart did. |
| `gallery-migration.ts` survives this phase deliberately | It is the thing that lets a vault which skipped the `002` release land somewhere chosen. Deleting it here would recreate the exact hazard the phase order exists to avoid. |
<!-- /ANCHOR:log -->
