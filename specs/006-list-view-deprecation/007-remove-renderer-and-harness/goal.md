---
title: "Goal: Remove Renderer and Harness"
description: "The durable directive this packet executes against, and the criteria that decide when it is done."
trigger_phrases:
  - "006 007 goal"
  - "remove list renderer goal"
  - "list window lane removal"
  - "renderer coverage floor"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "006-list-view-deprecation/007-remove-renderer-and-harness"
    last_updated_at: "2026-09-04T21:10:00Z"
    last_updated_by: "phase-goal-backfill"
    recent_action: "Authored the durable directive from the parent's conversion"
    next_safe_action: "Blocked on 006 shipping in a release and migrating real vaults"
    blockers:
      - "006-hide-and-migrate has not shipped"
      - "The DatabaseViewType decision is not taken"
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
      - "plan.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "list-deprecation-007-goal"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Goal: Remove Renderer and Harness

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> Everything above the log is DURABLE: it is what an operator sets as the session
> objective, and it must stay true for the life of the packet. Keep it short —
> the runtime goal surfaces cap what they will hold, and a truncated objective
> loses its tail, which is where the completion criteria live.

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Delete the list renderer and, in the same change, everything that measures it — so no gate reports green for a view nobody can open.

### Decisions

Frozen choices. Changing one is an amendment.

| ID | Decision |
|----|----------|
| D1 | **This is the irreversible phase.** It does not start before `006` has shipped in a release and is migrating real vaults. |
| D2 | The renderer and its measurement surface come out **together, not piecemeal**: `src/views/list-renderer.ts`, the `list-window` lane and harness, the ratchet, the `list` and `list-sparse` constructed scenarios, the fixtures, the bench entry, the replay claims and the unit specs. A gate still measuring a removed view is a false green, which is worse than no measurement. |
| D3 | The lane is **removed, not skipped**. A skipped lane reads green forever, and the lane count in `tools/gate.mjs` is the evidence either way. |
| D4 | `card-field-renderer.ts` is **not** this phase's to delete. It is shared with the board and gallery cards; only the list's use of it is removed, and the board and gallery cards must render identically before and after. |
| D5 | The renderer-coverage ratchet is lowered **deliberately, with the reason beside the number**. The ratchet fails closed on a decrease, which is what makes an accidental drop visible and a deliberate one a decision — `030`'s REQ-004, restated because the trap already caught that packet. |
| D6 | Whether `list` leaves `DatabaseViewType` or stays as an accepted-but-redirected value is decided **here and recorded with its reasoning**, against the same evidence `030` had, and only after `006` has shipped. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
## 2. BINDING

**READ FIRST:** `../spec.md`, `../goal.md`, then this folder's `spec.md` and `plan.md`.

**Blocked by `006` having shipped in a release**, not merely merged.

**It gates `008`.** The docs and the release describe a removal that has happened.

`styles.css` is a single serialized lane. This phase takes it once and releases it once.

**Precedence.** The parent's decisions outrank anything here; this document outranks any
summary of it. Name a conflict rather than resolving it silently.
<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

Each row is checkable without opening another file, and each records what is true today
so the check has a value to move from.

- [x] `rg -n 'list-renderer' src tools` returns nothing. **Done 2026-09-05**: `src/views/list-renderer.ts` deleted; the search returns nothing live (a `tools/lane/css-lane.json` audit note and `src/views/CODE.md`'s repo-wide "Current state" line are the only remaining hits across the whole tree, both historical/descriptive text, not code).
- [x] `npm run gate` exits 0 from the final state, read from `$?` rather than through a pipe, with `list-window` **absent from the lane list** rather than present and skipped. **Done**: 24 lanes printed on this phase's own pre-reconciliation branch, `list-window` not one of them, `$?` `0`. After landing on main (which had independently added a `sheet-grammar` lane), the reconciled tree prints **25** lanes; `list-window` is still absent and `$?` is still `0` — see `implementation-summary.md`'s reconciliation note.
- [x] `renderer-coverage.json` carries the new floor with the reason beside the number. **Done**: `"constructed": 6, "total": 21, "note": "was 7/22; list renderer retired"`.
- [x] The board and gallery cards render identically before and after, measured on captures rather than asserted. **Done**: `tools/lane/check-lane.mjs`'s pixel/layout compare against the pre-removal commit found 0 board/gallery-only captures content-changed; the two multi-view comparisons that include board/gallery content changed only because the list panel left a three-way comparison (read by hand, both themes/devices).
- [x] The `DatabaseViewType` decision is recorded with its reasoning, and no surface offers what the union forbids while none forbids what a saved file still contains. **Done**: ADR-001 in `plan.md`, Accepted — `list` stays, migrated permanently by `migrateListViewOnOpen`.
- [x] `033-list-virtualisation` and `024-list-view-freeze` are closed against this decision rather than left open against a view that no longer exists. **Done**: both `spec.md`s reviewed this session and read as superseded 2026-09-05, each keeping its own historical measurement (`024`'s AC-6 stays NOT MET as record; `033`'s 4,748.6ms → 48.4ms blocked-main-thread finding kept as evidence) rather than deleting the real work either phase did.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

Everything below is VOLATILE. It is not part of the directive, it is not copied
into the objective, and it is expected to grow.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Phase opened | Done | Parent conversion 2026-09-04 |
| Ship dependency | Ran without independent confirmation | `006-hide-and-migrate`'s own `spec.md` reads "Shipped + verified", but the parent `goal.md`'s "one operator report against a released build" line was never checked off before this phase ran — recorded as a gap, not treated as cleared (`tasks.md` T001) |
| Union decision | Done | ADR-001 in `plan.md`, Accepted — `list` stays, permanent coercion |
| Renderer, lane, harness, ratchet, fixtures, constructed scenarios, replay claims, unit specs | Done | `implementation-summary.md` |
| `npm run gate` | 24/24 green pre-reconciliation; 25/25 green after landing on main (`sheet-grammar` lane arrived with the merge) | `$?` 0 on both, two pre-existing red lanes (`placement`, `evidence`) found and fixed along the way |

### Deviations and findings

| Item | Note |
|------|------|
| Two `005` phases are closed from here, not from `005` | `033-list-virtualisation` and `024-list-view-freeze` measured real work on a view being removed. Closing them is right; deleting the measurements would lose the evidence that the freeze was real. |
| A harness regression, not a missed `005` surface | Re-pointing `render-assertion-harness.ts`'s shared column/row builders from the deleted list bench to the table bench exposed that the two benches' `makeConfig` build differently-shaped configs (only one carries `schema.columns`), blanking every constructed filter/sort/active-rule/summary scenario's field selector. Fixed at the source in `table-render-bench.ts`. This is `007`'s own regression, introduced by this phase's removal, not a usage surface `005`'s audit should have found — recorded here per `tasks.md` T015 rather than filed against `005`. |
| A leftover geometry check with zero subjects | `tools/storybook/verify-placement.mjs` carried a check for the list fixture's row wrapper; with the fixtures gone it always measured 0 subjects and failed. Removed rather than declared, since it can never have a subject again. |
| `styles.css`'s list rules deferred | T010 is open on purpose — a stylesheet edit that every capture in the repository fingerprints is its own bounded change, not a rider on this landing. |
<!-- /ANCHOR:log -->
