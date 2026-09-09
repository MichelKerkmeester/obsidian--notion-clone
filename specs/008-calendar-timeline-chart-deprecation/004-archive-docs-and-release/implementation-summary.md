---
title: "Implementation Summary"
description: "Open with a hook: what changed and why it matters. One paragraph, impact first."
trigger_phrases:
  - "implementation summary"
  - "what shipped"
  - "validation evidence"
  - "continuation notes"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "008-calendar-timeline-chart-deprecation/004-archive-docs-and-release"
    last_updated_at: "2026-09-09T08:55:00Z"
    last_updated_by: "252-deprecation-readme-strip"
    recent_action: "Landed: the strip, the note, the description, the mention lane; 2/2 ACs"
    next_safe_action: "Cut 0.0.35 publishing the drafted notes, then push"
    blockers:
      - "The 0.0.35 cut that publishes the drafted notes — a later leg, not this dispatch"
    key_files:
      - "../../../README.md"
      - "../../../manifest.json"
      - "../../../tools/naming/scan-deprecated-views.mjs"
      - "../../../tools/naming/scan-deprecated-views.test.mjs"
      - "../../../archive/deprecated-views/README.md"
      - "../changelog/008-004-archive-docs-and-release.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "scaffold-004-archive-docs-and-release"
      parent_session_id: null
    completion_pct: 90
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->
# Implementation Summary

<!-- SPECKIT_LEVEL: 3 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 004-archive-docs-and-release |
| **Completed** | 2026-09-09 |
| **Level** | 3 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

Until this leg, the plugin's front door described a bundle that 003 had already retired: the root
README sold five view types, the community-plugin description named three that no longer existed.
Now the copy ships what the bundle ships — the root README's intro reads "Table and board views
read and write those same files", the Views section carries two bullets, the Settings
default-view row offers "table or board" — and one short "Deprecated views" note does what the
operator's R9 copy mandated: it names the 0.0.34 removal, points at
`archive/deprecated-views/README.md` for the restore path, and absorbs the former gallery/list
migration paragraph (gallery → board, list → table, the one-time notice, the gallery notice's
Undo) so the feature list loses the words while the shipped behavior's truth stays. The
community-plugin description reads "Database views for notes with table, board, formulas,
filters, and inline editing." The early-alpha paragraph, the record sheet, the linked views and
the phone-surface copy are untouched.

A new scanner lane, `tools/naming/scan-deprecated-views.mjs` (10 vitest cases), keeps it that
way: zero mentions of the retired names outside the sanctioned note in the root README, zero
anywhere in the community-plugin description, and the note's pointer required to exist — the
note's own mentions are counted, not enforced, because they ARE the pointer. The enforced rule is
where the directive's "zero mentions" objective and the operator's note mandate meet, and until
this lane existed nothing checked that the copy stayed truthful after this leg.

### Phase 4: archive-docs-and-release

The red-then-green discipline the harness's other legs use, applied to prose: the lane was
written first, run against the pre-strip copies restored from `git show HEAD:…`, recorded red
(`README.md` 13 enforced mentions outside any note, the description 3, plus the note-missing
violation — exit 1), then re-run green against the stripped tree (0 outside the note / 7 inside,
the description 0 — exit 0). The 7 inside the note: chart 1, calendar 1, timeline 1, gallery 3,
"list views" 1. A plain 5-keyword substring grep — the leg's recon ruler, without the "list
views" keyword and without word boundaries — reads the same before (13) and 6 after; both rulers
are recorded, the lane's numbers are the enforced ones, and the composition difference is the
keyword shapes, not a disagreement about the truth.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `README.md` | Modified | The strip (intro, Views, Settings) plus the mandated "Deprecated views" note |
| `manifest.json` | Modified | The community-plugin `description` now names only what ships |
| `tools/naming/scan-deprecated-views.mjs` | Created | The mention lane: the enforced rule, the note exemption, the pointer check |
| `tools/naming/scan-deprecated-views.test.mjs` | Created | 10 vitest cases: the exemption's section boundary, the violation shapes, the exit contract |
| `specs/008-…/004-…/tasks.md`, `acceptance-criteria.md`, `goal.md`, this file | Modified | This phase's contract, criteria, counts and continuity |
| `specs/008-…/003-…/` — none; `specs/008-…/changelog/008-004-archive-docs-and-release.md` | Created | The drafted release notes for the version that ships the removal |
| `008` parent `goal.md`; `008/002` AC, tasks, goal, implementation summary; `037` goal.md; `005` handover.md | Modified | The criterion discharge, the fractions, 037's supersession note, this entry |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Worktree `252-deprecation-readme-strip`, non-interactive, every command foreground, every exit
read from `$?` without a pipe. RED FIRST (T006): the lane's RED run exercised the pre-strip
copies — restored from the committed history, so the bracket's before-side is pinned bytes, not a
remembered state — and GREEN ran against the final tree. The verification battery, from the
final state: `npx tsc --noEmit` 0; `npx vitest run` 1581/1581 tests, exit 0 (the 10 new cases
included); `npm run build` 0; `scan-comments` 0; `scan-failing-values` 0; and the gate
(`npm run gate </dev/null`, exit read): **27 green, 0 red for a declared reason, exit 0** — lane
count 27→27, because the new suite rides the existing tests lane instead of adding one.

Ship state: this worktree's `manifest.json` reads version 0.0.34 and the 0.0.35 release that
publishes the drafted notes does not exist yet — the cut, and the push, belong to a later leg.
Nothing was pushed, and the only untracked residue is the runner's mandated `.gate-exit` /
`.gate-*.log` (untracked, reported, nothing staged — 003's precedent) and this worktree's
gitignored `.handover.md`.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| The enforced rule is "zero mentions outside the note", not "zero mentions" | The directive's objective says the README "contains zero mentions", and the operator's R9 copy — which judges completion — mandates the note that names the removed views. The note's 7 mentions are the pointer, so the lane counts them without failing on them; recorded as a finding in the phase goal's LOG |
| The note absorbs the gallery/list migration paragraph | The migration is shipped 0.0.34+ behavior (gallery → board, list → table, the Undo), so deleting the paragraph would make the README less truthful; folding it into the note keeps the facts while the retired names leave the feature list. Without the note, the lane would have had nowhere to let those words live |
| The lane rides the existing tests lane; no `gate.mjs` row | The dispatch offered "a test or lane row". Vitest picks up `tools/**/*.test.mjs`, so the suite runs in every gate already; adding a row would duplicate the check and teach future editors two places to register a check |
| `package.json`'s description left alone | The dispatch's scope named `README.md` and the community-plugin description (`manifest.json`). The `package.json` description is the npm-listing copy, a different surface; it still names the retired views and is recorded as a known limitation, not silently widened |
| The scanner counts word-bounded matches | `\\bchart\\b` misses the plural "charts", so the lane's totals differ from a substring grep's (13→7+0 vs 13→6). Word boundaries are the honest ruler for "mentions of a view name"; the leg's recon grep is recorded alongside so the before→after delta survives either ruler |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `node tools/naming/scan-deprecated-views.mjs` — RED, against the pre-strip copies | exit 1 — README: 13 mentions outside any note + the note-missing violation; the description: 3 mentions |
| `node tools/naming/scan-deprecated-views.mjs` — GREEN, the stripped tree | exit 0 — 0 outside the note, 7 inside (chart 1, calendar 1, timeline 1, gallery 3, "list views" 1); the description: 0; the pointer to `archive/deprecated-views/README.md` present and enforced |
| `npx vitest run tools/naming/scan-deprecated-views.test.mjs` | 10/10 |
| `npx tsc --noEmit` | 0 |
| `npx vitest run` (full) | 1581/1581 tests, exit 0 |
| `npm run build` | 0 |
| `node tools/naming/scan-comments.mjs` | 0 |
| `node tools/naming/scan-failing-values.mjs` | 0 |
| `npm run gate` (foreground, `</dev/null`, `$?` read) | **27 green, 0 red for a declared reason, exit 0** |
| `git rev-parse 0.0.34^{commit}` (002's AC-007 evidence) | `e75a979c9a21f6f93967a40e24b2a58f474fa9d5` — the "chore(release): cut 0.0.34" commit |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **The 0.0.35 release that ships the removal has not been cut.** The release notes exist
   (`../changelog/008-004-archive-docs-and-release.md`, drafted, describing the removal and the
   archive/restore path) and the goal's criterion is discharged by their existence; publishing
   them — the cut, then the push — is the packet's last step, a later leg's. Not this dispatch:
   it was sent with "Do NOT push".
2. **`package.json`'s description still names the retired views.** Out of the named scope
   (`README.md`, `manifest.json`); the lane does not read it, so nothing fails. Recorded here so
   the next pass knows it is deliberate, not missed.
3. **The note's 7 mentions are permanent.** By design — they are the pointer. Anyone expecting a
   literal `grep -in`-zero README should read the lane's report line, which splits the enforced
   from the exempted.
<!-- /ANCHOR:limitations -->

---

## Continuation Notes

The next leg cuts 0.0.35 (the drafted notes at `../changelog/008-004-archive-docs-and-release.md`
are the copy), pushes, and closes the packet: the 008 parent's four completion criteria are
otherwise ticked, and the parent's continuity (updated this leg, completion 95) already names the
cut as the next safe action. 002's AC-007 is discharged (0.0.34 = `e75a979c`, verified), 037's
supersession note is in its own goal.md, and the note-exemption ruling means the 0.0.35 note's
copy can name the removed views freely — the lane only watches the feature prose.
