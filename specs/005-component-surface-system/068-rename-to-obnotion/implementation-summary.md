---
title: "Implementation Summary: Rename to Obnotion"
description: "Placeholder. The packet was opened on 2026-09-06 from the operator's rename instruction, its four open rows were ruled at 19:08, and no source file has been touched; this document is written when the leg lands."
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
    last_updated_at: "2026-09-06T17:08:00Z"
    last_updated_by: "ruling-fold-session"
    recent_action: "Added the Level 3 impl doc; recorded the 19:08 rulings"
    next_safe_action: "Run the single leg after 0.0.30 and every in-flight sibling"
    blockers:
      - "Runs last: after 0.0.30 and after 058, 056 edge-reveal, 057 month-chip and 059-067"
    key_files:
      - "manifest.json"
      - "styles.css"
      - "tools/naming/rename-prefixes.mjs"
      - "update-fork.sh"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "068-rename-to-obnotion-summary"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions:
      - "The class prefix is obnotion-, ruled 2026-09-06 19:08 against this packet's obn- recommendation"
      - "The manifest credits MichelKerkmeester, fundingUrl removed, upstream credited in the README"
      - "The GitHub repository keeps its name; the decision is by default and reversible"
      - "update-fork.sh's REPO is fixed in this packet, T009"
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
| **Completed** | Not completed — placeholder |
| **Level** | 3 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

**Nothing yet.** The packet was opened on 2026-09-06 ~18:07 from the operator's rename instruction
and its census of the blast radius. It carries eight durable decisions, six ADRs, sixteen acceptance
rows and twenty-three tasks; it carries no code, and by design it will not until 0.0.30 is cut and
every in-flight sibling has landed (ADR-006, `goal.md` D7).

This document was created on 2026-09-06 at 19:08 while the four open rows were being folded in. It
should have existed from the packet's first commit: `068` is **Level 3**, and Level 3 requires an
`implementation-summary.md`. Its absence had been failing `LEVEL_MATCH` on every `--strict` run since
the packet opened, silently, because nobody read past the exit code. Recorded here rather than fixed
quietly, since a required file that went missing for a day is worth one sentence.
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:files-changed -->
## Files Changed

None. `git diff --stat` against this packet's opening commit shows only `specs/` documents.

The files the leg *will* change are enumerated in `spec.md` "Files to Change" — `manifest.json`,
`package.json`, `src/**`, `styles.css`, `tools/**`, `.storybook/**`, `README.md`,
`screenshots/manifest.json` and the 1,467 PNGs by recapture — and they are listed there rather than
duplicated here, so one document owns the answer.
<!-- /ANCHOR:files-changed -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Not delivered. The intended route is `plan.md` §4 and `tasks.md`: four setup tasks that pin the
dependency, the lane and the census; a Stage A that changes identity; a Stage B that lands the
compatibility aliases **before** the sweep so no old string is orphaned mid-flight; a Stage C that
runs one committed, idempotent rewrite script and recaptures; and a verification stage ending in a
fresh-vault smoke a human watches rather than asserts.

The shape that matters is **one leg, one rebase window**. `recommend-level.sh` suggested four phases
and that recommendation is declined on the record (ADR-006): the risk here is the concurrency, not
the edit, and four phases would mean four rebase windows across a tree whose every class name is
moving.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| The plugin id changes with the name | The community plugin panel reads `id` from `manifest.json`, and Obsidian uses the id as the vault directory. A display-name-only rename leaves the old name in the one place a user meets it on disk (ADR-001) |
| The old `data.json` is copied, never moved | A revert costs nothing and a user running both plugins loses nothing. The source is never renamed or deleted, and a throw is non-fatal (ADR-002) |
| The class prefix is `obnotion-`, against this packet's own `obn-` recommendation | Operator, 2026-09-06 19:08, verbatim: *"obnotion- everywhere"*. The recommendation weighed characters; the ruling weighed what a user sees when they inspect an element. Net ≈ +87,000 characters, about 29 KB on a 750 KB stylesheet, none of it paid at interaction time. ADR-003's alternatives table is left **un-rescored** so the trade stays visible |
| Five strings keep permanent aliases with no deprecation window | Two code-block languages users typed into their own notes, two view types Obsidian stores in `workspace.json`, and one export marker. A hard rename of any of them breaks content that already exists in somebody else's files (ADR-004) |
| `specs/` is not rewritten | A spec document saying `note-database` reports what was true when it was written; editing it produces a document that agrees with today and lies about the past (ADR-005) |
| The manifest's attribution moves and the repository's name does not | Operator, 2026-09-06 19:08. `author`/`authorUrl` become MichelKerkmeester's and `fundingUrl` is removed; the repository keeps its name, decided by default and reversible since a GitHub rename leaves a redirect (`spec.md` §12 Q1, Q2) |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | Not run — no code changed by this packet |
| `npm run build` | Not run — no code changed by this packet |
| `npx vitest run` | Not run — no code changed by this packet |
| `npm run screenshots:verify` | Not run — no capture affected yet |
| `npm run gate` | Not run — no code changed by this packet |
| `validate.sh 068-rename-to-obnotion --strict` | **PASSED** for the first time on 2026-09-06 19:08, once this file existed. It had been reporting `LEVEL_MATCH: Required file missing for Level 3` since the packet opened |
| The census, re-measured on `e5830232` | `db-` **17,181**, `--db-` **2,330**, `note-database-container` **3,185**, `note-database` **4,446**, distinct `db-*` tokens **1,728**. The `dc1d54a9` numbers in `goal.md` §4 are kept beside them: the leg's own base is the number that binds, and the drift between the two is the reason T003 re-runs the census rather than trusting a recorded one |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **Nothing is implemented, and that is the plan.** Every acceptance row is `Unmet`. The packet is
   sequenced last on purpose: it moves every class name at once, so it holds the CSS lane end to end
   and takes one rebase window.
2. **The README's fork-credit prose is not this packet's.** The 19:08 attribution ruling has two
   halves — the manifest fields, which T005 lands, and the README line, which the parallel README leg
   authors. AC-016 asserts **both**, so the packet cannot close with only the easy half done.
3. **Person of record for the capture diff: nobody.** Every one of the 1,467 captures re-derives and
   every `pixelHash` moves, so this leg's capture diff carries no signal about rendering. The claim
   is judged against a manifest regenerated on this tree, with its blob id recorded first.
4. **User CSS snippets targeting `.db-*` break, and no mitigation exists.** A class name is not a
   public API here and the operator ruled the rename in. Named rather than hidden.
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
