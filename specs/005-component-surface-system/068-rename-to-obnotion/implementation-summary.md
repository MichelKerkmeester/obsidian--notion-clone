---
title: "Implementation Summary: Rename to Obnotion"
description: "The plugin was renamed from Note Database to Obnotion across identity, plugin id, CSS/DOM prefixes and user-facing syntax, with a copy-never-move data migration and five permanent aliases, landed on the rewrite leg's own worktree."
trigger_phrases:
  - "implementation summary"
  - "what shipped"
  - "obnotion rename summary"
  - "rename validation evidence"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/068-rename-to-obnotion"
    last_updated_at: "2026-09-07T19:50:00Z"
    last_updated_by: "rewrite-leg"
    recent_action: "Landed the rewrite leg: identity, compat shim, mechanical sweep, migration, recapture, gate"
    next_safe_action: "Fresh Opus verifier reviews and lands the leg, then cuts release 0.0.31"
    blockers:
      - "AC-014 (release) and AC-015 (operator's own device confirmation) remain open"
    key_files:
      - "manifest.json"
      - "styles.css"
      - "tools/naming/rename-prefixes.mjs"
      - "src/data/legacy-plugin-data-migration.ts"
      - "update-fork.sh"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "068-rename-to-obnotion-summary"
      parent_session_id: null
    completion_pct: 85
    open_questions: []
    answered_questions:
      - "The class prefix is obnotion-, ruled 2026-09-06 19:08 against this packet's obn- recommendation"
      - "The manifest credits MichelKerkmeester, fundingUrl removed, upstream credited in the README"
      - "The GitHub repository was renamed to obsidian_notion-clone on 2026-09-07, superseding this packet's 'keeps its name' ruling"
      - "update-fork.sh's REPO is fixed in this packet, T009, now pointed at the actual current origin"
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
| **Spec Folder** | 068-rename-to-obnotion |
| **Completed** | Rewrite leg landed 2026-09-07 on its own worktree, not yet merged — a fresh Opus verifier lands it and cuts release 0.0.31 |
| **Level** | 3 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

The plugin now reads as **Obnotion** everywhere a user or a machine reads it: `manifest.json`'s
`id` and `name`, the plugin class, the ribbon, the settings tab in three locales, the changelog
modal and its deep link, and every CSS class and custom property in `styles.css` and `src/**`. An
existing install keeps its settings through a copy-never-move `data.json` migration, and five
strings a user typed or a vault stored — two code-block languages, two view types, one export
marker — keep permanent aliases with no deprecation window.

The rewrite itself is one committed, idempotent script (`tools/naming/rename-prefixes.mjs`, 5
substring/regex rules) run across `styles.css`, `src/**`, `tools/**`, `.storybook/**`,
`manifest.json`, `package.json` and `package-lock.json`. Everywhere the script could reach, it
did: a survey for string-concatenated selectors and embedded-prefix regexes (`grep -rn` for both
patterns) came back empty before the script was even written, so no hand re-anchoring turned out
to be necessary — a planned task (T014) that closed itself once the survey ran.

Five things happened that the plan did not literally predict, and are recorded here rather than
smoothed over:

1. **The repository was already renamed.** The packet's own frozen docs (goal.md D8, spec.md §12
   Q1) ruled the GitHub repository keeps its name. The rewrite leg's own brief, and an independent
   `git remote get-url origin` check, showed the repository had been renamed to
   `MichelKerkmeester/obsidian_notion-clone` on 2026-09-07 — after this packet's ruling, before
   this leg started. The newer, confirmed fact was treated as authoritative: `update-fork.sh`'s
   `REPO` and 4 stale URL references in `README.md` were corrected to match. See
   `decision-record.md`'s appended note.
2. **The mechanical sweep's execution order differs from the plan's stage-lettering, for a
   technical reason recorded up front.** The plan's Stage B-before-C order is a commit-safety
   rationale (an interrupted leg still has working aliases); actually landing it in that literal
   order is impossible, because a blind text sweep cannot distinguish "this `note-database-view`
   is the alias I just wrote on purpose" from "this one is unswept residue." The sweep ran first;
   the five aliases were hand-written after, once nothing would touch them again. End state and
   every acceptance criterion are identical either way.
3. **The sweep found a real bug of its own making, once, and it was fixed rather than routed
   around.** `\bdb-` matched inside the import-path string `"./modals/db-modal"`, repointing 27
   files' imports to a file that did not yet exist. Fixed with `git mv db-modal.ts
   obnotion-modal.ts` to match what every importer already expected.
4. **`tools/lane/css-lane.json` was excluded from the sweep, then deliberately included**, after
   discovering the exclusion left AC-003's frozen, exact verification command printing 238 instead
   of 0. The lane's 380-entry history journal now spells past decisions in today's class-name
   vocabulary; the decisions and lane hand-offs it records are unaffected, and the exact prior
   wording is still recoverable from any commit before this one.
5. **Re-running the sweep a second time (for item 4) silently overwrote every alias item 2 had
   already hand-written.** Caught immediately via the harness's own file-change notices, fixed by
   hand, re-verified with `tsc`/`vitest`. The script's own header comment and `tasks.md` now say
   plainly that it must never run a third time.
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:files-changed -->
## Files Changed

**New:** `tools/naming/rename-prefixes.mjs` (the sweep script), `src/data/legacy-plugin-data-migration.ts`
and its test, `src/views/modals/linked-view-block-aliases.test.ts`.

**Renamed:** `src/views/modals/db-modal.ts` → `obnotion-modal.ts` (a sweep side-effect, corrected;
`DbModal`'s class name and `DB_MODAL_*` constants are unchanged, deliberately — see
`decision-record.md`).

**Rewritten by the sweep script** (identifiers only, no behaviour change): `styles.css`, and every
`.ts`/`.mjs`/`.stories.ts`/`.test.ts` file under `src/`, `tools/`, `.storybook/` that held a
`note-database`/`db-` token — 258 files in the first pass, 7 more (including
`tools/lane/css-lane.json`) in the second.

**Hand-edited:** `manifest.json` (id/name/author/authorUrl/fundingUrl), `package.json` and
`package-lock.json` (name), `update-fork.sh` (REPO), `README.md` (4 stale repository-URL
references only — its prose was already rewritten by the parallel README leg before this leg
started), `CHANGELOG.md`/`STORYBOOK.md`/`PRIVACY.md`/`REPO RULES.md` (one product-name reference
each, found by the same census the spec's own numbers cite but never included in the sweep's file
scope), `src/main.ts` (the migration call, the 3-language code-block registration, the dual
view-type registration, the CSV-marker dual acceptance), `src/views/database-view.ts` /
`database-file-view.ts` (the `LEGACY_*` view-type constants), `src/views/modals/linked-view-block.ts`
/ `src/views/embedded-database-renderer.ts` (the 3-way fence-language handling), `styles.css`'s one
stale comment near the placement-option rule (corrected mechanism: a flex item's `flex-basis: 0`
governs the main axis in a column flex container, so the host's declared button height is never
consulted there — proven 2026-09-07 by direct measurement, not assumed from the cascade).

**Not touched:** `specs/**` (ADR-005; this packet's own docs excepted, per the normal spec-kit
lifecycle), `main.js` (rebuilt, not hand-edited), the upstream credit lines in `README.md` and
`update-fork.sh`, the `db_view` frontmatter key, `LICENSE`.
<!-- /ANCHOR:files-changed -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

One leg, as `plan.md` specified: identity first, then the compatibility shim, then the mechanical
sweep, then evidence — landed as described in "What Was Built" above, with the execution-order
note recorded rather than silently deviated from. `recommend-level.sh` suggested four phases
(ADR-006 declines it on the record); this leg confirms that call was right — the whole risk was
the concurrency of touching every class name at once, not the mechanical edit itself, and nothing
about running it as one leg made the work harder to verify.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| The plugin id changes with the name | The community plugin panel reads `id` from `manifest.json`, and Obsidian uses the id as the vault directory. A display-name-only rename leaves the old name in the one place a user meets it on disk (ADR-001) |
| The old `data.json` is copied, never moved | A revert costs nothing and a user running both plugins loses nothing. Proven against a real filesystem in this leg's smoke test, not only against a mock (ADR-002) |
| The class prefix is `obnotion-`, against this packet's own `obn-` recommendation | Operator, 2026-09-06 19:08: *"obnotion- everywhere"*. Net ≈ +87,000 characters, about 29 KB on a 750 KB stylesheet, none of it paid at interaction time (ADR-003) |
| Five strings keep permanent aliases with no deprecation window | Breaking any of them corrupts content that already exists in somebody else's files. All five are now implemented and 4 of 5 have dedicated tests (ADR-004) |
| `specs/` is not rewritten | A spec document reports what was true when it was written. This packet's own docs are the normal exception — updating a packet's own tracking documents as it implements is the spec-kit lifecycle, not a rewrite of history (ADR-005) |
| The mechanical sweep runs before the compatibility aliases are hand-written, not after | The plan's stage order is a commit-safety story; the literal order is a technical necessity, since a blind sweep cannot tell an intentional alias from unswept residue. Recorded as a deviation with its reasoning, per this program's own discipline for deviations |
| The repository-name ruling is superseded by a later, confirmed fact | The GitHub repository was actually renamed on 2026-09-07, one day after this packet ruled it would not be. Verified independently against the live remote rather than merely trusted, and treated as authoritative over the packet's own frozen (but now stale) ruling |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | Exit 0, run 3 times across this leg |
| `npx vitest run` | 153 files / 1641 tests, all green |
| `npm run build` | Exit 0, `main.js` rebuilt |
| `node tools/naming/scan-comments.mjs` | PASS, 0 artifact-id violations |
| `npm run screenshots` + `screenshots:verify` | 608 entries, exit 0, all byte-identical to the pre-rename commit |
| `node tools/lane/check-lane.mjs` | Exit 0, "release names all 0 changed capture(s)" |
| `node tools/naming/scan-failing-values.mjs` / `build-operator-checklist.mjs --check` | Both PASS, ratchets unchanged |
| `npm run gate </dev/null` | 26/26 green, run twice (once after fixing 8 stale `evidence` artefacts, once after adding the alias test file) |
| Fresh-vault smoke | Partial — the migration proven against a real filesystem; three of five observations need a live Obsidian window (see `goal.md` §4) |
| `validate.sh 068-rename-to-obnotion --strict` | First `RESULT:` line: `PASSED` |
| `validate.sh 005-component-surface-system --strict` | First `RESULT:` line: `PASSED` |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **No live Obsidian window was available to run the fresh-vault smoke test in full.** The data
   migration is proven against a real filesystem; the community-plugin-panel read, a note actually
   opening, and a `workspace.json` restoring both tab kinds are proven only at the unit level
   (parsing/registration logic) or by code review, not by watching them happen. AC-013 and AC-015
   stay the operator's to close.
2. **Release 0.0.31 is not cut by this leg.** Per the operator's own instruction, this leg does not
   push and does not release — a fresh Opus verifier reviews the work, lands it, and cuts the
   release. AC-014 stays open until then.
3. **The CSV/markdown export marker's dual-acceptance check has no dedicated test.** It is a few
   inline lines inside a private method of an already-untested, 3000+-line `main.ts` class;
   extracting it into a testable module purely to add a test would be more restructuring than this
   rename calls for. Verified by code review; recorded as a real, if narrow, coverage gap rather
   than silently accepted as five-for-five.
4. **`npm run lint` (the full `src/**` lint, not the gated `lint:tools`) still reports 327
   pre-existing errors unrelated to this rename**, in files this packet never touches. This leg's
   own new/changed code is lint-clean (2 new errors from a test fixture were fixed with a scoped,
   justified `eslint-disable-next-line`).
5. **User CSS snippets targeting `.db-*` break, and no mitigation exists.** Named in the original
   spec's risk table (R-004) and unchanged by this leg: a class name is not a public API here, and
   the operator ruled the rename in with full knowledge of this cost.
<!-- /ANCHOR:limitations -->

---

<!-- ANCHOR:related -->
## Related Documents

- **Goal**: `goal.md`
- **Specification**: `spec.md`
- **Implementation Plan**: `plan.md`
- **Tasks**: `tasks.md`
- **Acceptance Criteria**: `acceptance-criteria.md`
- **Decision Record**: `decision-record.md`
<!-- /ANCHOR:related -->
