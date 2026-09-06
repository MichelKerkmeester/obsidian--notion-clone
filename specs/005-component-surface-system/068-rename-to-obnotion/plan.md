---
title: "Implementation Plan: Rename to Obnotion"
description: "One scripted rewrite leg in one rebase window: identity first, then the aliases that keep an existing vault working, then the mechanical prefix sweep, then a full recapture and a 26-lane gate."
trigger_phrases:
  - "implementation plan"
  - "rename to obnotion plan"
  - "068 plan"
  - "prefix rewrite"
importance_tier: "important"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Rename to Obnotion

<!-- SPECKIT_LEVEL: 3 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, esbuild, Obsidian plugin API |
| **Framework** | None; `styles.css` is a single hand-written 2,892-`note-database`-reference stylesheet |
| **Storage** | `.obsidian/plugins/<id>/data.json` via `Plugin.loadData()` / `saveData()`; the vault's `workspace.json` stores view types |
| **Testing** | vitest, plus the 26-lane `npm run gate` (live probes, capture verify, naming scanners) |

### Overview
The rename is executed in one leg with four ordered stages. **Stage A** changes identity and the
plugin id. **Stage B** adds the compatibility layer — the data-file copy and the aliases for every
string a user or a vault file already holds — and lands **before** the sweep, so the sweep cannot
silently break a contract that has no fallback yet. **Stage C** runs one committed script that
rewrites `note-database*` and `db-*` across the whole rewrite scope, with an explicit exclusion
list. **Stage D** re-derives every capture, re-pins the lane baseline and the census ratchets, and
runs the whole gate.

The ordering is the plan's only real design decision. Aliases before the sweep means every
verification in Stage D is exercising the compatibility layer rather than assuming it.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [ ] Release 0.0.30 is cut and every in-flight leg has landed on `main` (`058`, `056` edge-reveal,
      `057` month-chip, `059`-`067`)
- [x] `spec.md` §12 Q1-Q4 answered by the operator, 2026-09-06 19:08. Q3 **declined** this packet's
      recommended default, so the sweep's target prefix is `obnotion-`, not `obn-`
- [ ] The css lane is acquired by this packet in `tools/lane/css-lane.json`

### Definition of Done
- [ ] Every `acceptance-criteria.md` row is `Met`, `Waived` or `Superseded`
- [ ] `npx tsc --noEmit`, `npm run build`, `npx vitest run` each read individually, then
      `npm run gate </dev/null` exit 0 over 26 lanes, logged to a path inside this worktree
- [ ] `screenshots/manifest.json` regenerated on this tree; the blob id checked before any capture
      claim
- [ ] The fresh-vault smoke observed by a human, not asserted
- [ ] 0.0.31 released and copied to the iCloud vault under the new plugin folder
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Mechanical refactor behind a permanent compatibility shim. Nothing is redesigned; one identity
string set is replaced, and every replaced string that crossed a persistence or interop boundary
gains an alias that is never removed.

### Key Components
- **Identity surface** — `manifest.json`, `package.json`, `src/main.ts`, `src/i18n.ts`. Read by
  Obsidian and by the user; changed outright.
- **Compatibility shim** — the `data.json` copy in `onload()`, the two aliased code-block
  registrations, the two aliased view types, the export-format reader. Read by *existing vaults*;
  additive only.
- **Prefix surface** — `styles.css`, `src/**` class strings, `tools/**` selectors, `.storybook/`,
  `screenshots/`. Read only by our own code and our own harness; rewritten by script.
- **Evidence surface** — `screenshots/manifest.json`, `tools/lane/css-lane.json`,
  `tools/naming/failing-values-baseline.json`, `tools/naming/build-operator-checklist.mjs`. Derived,
  and re-derived after the sweep.

### Data Flow
Obsidian resolves the plugin folder from `manifest.json` `id` → `loadData()` reads
`.obsidian/plugins/obnotion/data.json` → the shim, on a miss, copies from
`.obsidian/plugins/note-database/data.json` → settings load exactly as before. Independently,
`workspace.json` hands stored view-type strings back at startup; the alias registration is what
makes an old string still resolve to a view.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
## FIX ADDENDUM: AFFECTED SURFACES

| Surface | Current Role | Action | Verification |
|---------|--------------|--------|--------------|
| `manifest.json` `id` | Names the vault folder holding `data.json` | update | Fresh-vault smoke; the folder exists at the new path |
| `src/main.ts` `onload()` | Loads settings, registers views, code blocks, ribbon, commands | update | `main.ts:114-135` migration branch; `:453,:467` registrations |
| `src/views/database-view.ts:244`, `database-file-view.ts:25` | Own the two view-type strings Obsidian persists | update + alias | An old `workspace.json` reopens both tab kinds |
| `src/views/modals/linked-view-block.ts:23,82,121,201` | Emits and matches the fence users have in their notes | update emitter, widen matcher | `linked-view-block` tests over both languages |
| `src/data/csv-markdown-zip-export.ts:68`, its importer (`main.ts:1296`) | Writes and reads the export format marker | write new, read either | Round-trip test with an old-marker archive |
| `src/data/conditional-formatting.ts:184-204` | Sets `data-note-database-conditional-*` DOM attributes | update | `conditional-formatting.test.ts:259,275` |
| `styles.css` | The whole class vocabulary | scripted rewrite | Byte-diff review + full recapture |
| `tools/live/*.json` pins, `render-assertions.mjs`, `sheet-grammar.mjs` | Selector-anchored probes | scripted rewrite | Their own lanes, red first with a deliberately un-rewritten pin |
| `db_view` frontmatter key | Marks a user's note as a database file | **not a consumer — excluded by name** | `rg -n '\bdb_view\b'` unchanged before and after |
| `specs/**` | History | **not a consumer — excluded by name** | `git diff --stat -- specs` shows only this packet and the parent |

Required inventories, run before the first edit and again after:
- `git grep -c -E 'note-database|\bdb-[a-zA-Z0-9_-]' -- styles.css src tools .storybook README.md manifest.json package.json screenshots/manifest.json`
- `git grep -ho 'note-database[a-zA-Z0-9_-]*' -- styles.css src tools .storybook | sort -u` (40 distinct identifiers on `dc1d54a9`)
- `git grep -ho '\-\-db-[a-zA-Z0-9_-]*' -- styles.css src tools | sort -u` (209 custom properties)
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

Follow the ordered tasks in `tasks.md`. It owns the Setup, Implementation and Verification phase
checkboxes and task state.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | The migration branch, the alias resolvers, the fence matcher, the export-marker reader | vitest |
| Integration | The 26 gate lanes over the rewritten tree; live probes re-anchored on `obnotion-` | `npm run gate` |
| Visual | 1,467 captures re-derived; every one expected to move pixelHash, judged by opening PNGs | `npm run screenshots`, `screenshots:verify` |
| Manual | Fresh-vault smoke: install, enable, migrate, open a database note, render an old fence | Obsidian on desktop, then the iCloud vault on the phone |

**Red first, per task.** Each implementation task in `tasks.md` names an observable check that
fails before the change: a grep count that is non-zero, a test that fails on the old string, a
probe that fails against an un-rewritten pin.
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Release 0.0.30 | Internal | Pending | The leg cannot start; it is the last one in |
| `058`, `056` edge-reveal, `057` month-chip, `059`-`067` | Internal | In flight | Any unlanded leg collides across thousands of stylesheet lines |
| css lane (`tools/lane/css-lane.json`) | Internal | Held by `056` today | Two stylesheet writers is the failure the lane prevents |
| The GLM README rewrite leg | Internal | Running in parallel, lands separately | None if it lands first; if it lands second, its author reapplies the prefix rename to the new prose |
| Operator answers to §12 Q1-Q4 | External | **Green — answered 2026-09-06 19:08** | Q3 set the sweep's target prefix to `obnotion-` (not the recommended `obn-`); Q2 settled the `manifest.json` attribution fields; Q1 keeps the repository name; Q4 confirms T009 |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: the gate fails and cannot be made green inside the leg; or the fresh-vault smoke
  shows an existing install losing data; or the operator reverses the prefix (§12 Q3, ruled
  `obnotion-` on 2026-09-06 19:08) after the sweep.
- **Procedure**: the whole leg is one branch and one rebase window, so rollback is `git revert` of
  the leg's commits on `main`, then `npm run build` and a re-release. Nothing in the working tree
  needs untangling because nothing else landed inside the window.
<!-- /ANCHOR:rollback -->

---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

```
Stage A (identity) ──► Stage B (aliases + migration) ──► Stage C (prefix sweep) ──► Stage D (evidence + gate)
```

| Phase | Depends On | Blocks |
|-------|------------|--------|
| A Identity | 0.0.30 cut, all legs landed | B |
| B Compatibility | A | C |
| C Prefix sweep | B | D |
| D Evidence and gate | C | Release 0.0.31 |
<!-- /ANCHOR:phase-deps -->

---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| A Identity | Low | 1 hour |
| B Compatibility | Medium | 2-3 hours |
| C Prefix sweep | Medium (scripted) | 2-3 hours including the diff review |
| D Evidence and gate | High (recapture + 26 lanes) | 3-5 hours |
| **Total** | | **8-12 hours, one leg** |
<!-- /ANCHOR:effort -->

---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] The iCloud vault's current three files backed up into `.backup-0.0.30/`
- [ ] `data.json` in the iCloud plugin folder left untouched, and its path recorded before the copy
- [ ] The pre-rename `screenshots/manifest.json` blob id recorded, so post-sweep churn can be judged

### Rollback Procedure
1. `git revert` the leg's commits on `main`, keeping the packet documents.
2. `npm run build`, then re-release the previous version.
3. Restore the iCloud vault's `.backup-0.0.30/` three files into the **old** plugin folder.
4. Tell the operator which release is live, because the plugin id changed and the panel entry moved.

### Data Reversal
- **Has data migrations?** Yes, one: a copy.
- **Reversal procedure**: none needed. The migration never moves or deletes, so the old folder's
  `data.json` is still there, unmodified. Reverting the plugin id is sufficient.
<!-- /ANCHOR:enhanced-rollback -->

---

<!-- ANCHOR:dependency-graph -->
## L3: DEPENDENCY GRAPH

```
┌──────────────┐    ┌───────────────────┐    ┌────────────────┐    ┌──────────────────┐
│ A: identity  │───►│ B: aliases +      │───►│ C: prefix      │───►│ D: recapture,    │
│ manifest, id │    │    data migration │    │    sweep       │    │    lane, gate    │
└──────────────┘    └───────────────────┘    └────────────────┘    └──────────────────┘
```

### Dependency Matrix

| Component | Depends On | Produces | Blocks |
|-----------|------------|----------|--------|
| A Identity | 0.0.30, all legs landed | New id and display name | B |
| B Compatibility | A | Migration + 5 aliases | C |
| C Prefix sweep | B | Rewritten class vocabulary | D |
| D Evidence | C | Captures, lane baseline, ratchets, gate | Release |
<!-- /ANCHOR:dependency-graph -->

---

<!-- ANCHOR:critical-path -->
## L3: CRITICAL PATH

1. **0.0.30 cut and every in-flight leg landed** — external to this packet — CRITICAL
2. **Stage B, the compatibility shim** — 2-3 hours — CRITICAL, because everything after it is
   verified against it
3. **Stage C, the sweep** — 2-3 hours — CRITICAL
4. **Stage D, recapture and gate** — 3-5 hours — CRITICAL

**Total Critical Path**: 8-12 hours after the dependency clears.

**Parallel Opportunities**: none inside the leg, deliberately. The GLM README rewrite is the only
thing running beside it, and it lands separately.
<!-- /ANCHOR:critical-path -->

---

<!-- ANCHOR:milestones -->
## L3: MILESTONES

| Milestone | Description | Success Criteria | Target |
|-----------|-------------|------------------|--------|
| M1 | Identity changed | `manifest.json` reads `obnotion`/`Obnotion`; plugin loads in a scratch vault | Stage A |
| M2 | Compatibility proven | An old-id `data.json` is copied; an old fence renders; an old `workspace.json` reopens both tab kinds | Stage B |
| M3 | Sweep clean | The scope greps return only the named aliases; `tsc`, `build`, `vitest` green | Stage C |
| M4 | Release ready | 26 lanes green, captures re-derived, lane re-pinned, ratchets lowered | Stage D |
<!-- /ANCHOR:milestones -->

---

## L3: ARCHITECTURE DECISION RECORD

The ADRs live in `decision-record.md`: ADR-001 (the name and the id), ADR-002 (copy, never move),
ADR-003 (`db-` → `obnotion-`, ruled 2026-09-06 19:08), ADR-004 (permanent aliases for user-facing syntax), ADR-005 (`specs/` is
not rewritten), ADR-006 (one leg, one rebase window, sequenced last).


<!-- SCAFFOLD_AI_PROTOCOL_MARKERS:
AI EXECUTION
Pre-Task Checklist
Execution Rules
Status Reporting Format
Blocked Task Protocol
-->
