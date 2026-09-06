---
title: "Feature Specification: Rename to Obnotion"
description: "The plugin is still called Note Database everywhere a user or a machine can read it. This packet renames the product to Obnotion across identity, plugin id, user-facing syntax and the internal CSS/DOM prefixes, and carries the data migration and alias set that keeps an existing vault working."
trigger_phrases:
  - "feature specification"
  - "rename to obnotion"
  - "068 spec"
  - "plugin id rename"
importance_tier: "important"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->
# Feature Specification: Rename to Obnotion

<!-- SPECKIT_LEVEL: 3 -->

---

## EXECUTIVE SUMMARY

The plugin ships as **Note Database** — the id Obsidian stores it under, the name the community
plugin panel shows, the class prefix every rule in a 2,892-line stylesheet carries, and the
code-block language users type into their own notes. The operator has asked for the product to be
called **Obnotion**, and ruled the scope as *"Everything, including CSS class prefixes"* and the
surface as *"In community plugin"*. That makes this a rename with a data-migration half and an
interop half, not a find-and-replace.

**Key Decisions**: the plugin id changes to `obnotion` and the old vault folder's `data.json` is
**copied, never moved** (ADR-002); the DOM/CSS prefixes go `note-database-container` →
`obnotion-container` and `db-` → `obnotion-` (ADR-003, ruled 2026-09-06 19:08); every string a user typed or
a workspace file stored keeps a permanent backward-compatible alias (ADR-004).

**Critical Dependencies**: release 0.0.30 must be cut and every in-flight leg landed before this
packet's single rewrite leg starts. It touches every class name in the tree, so it cannot share a
rebase window with anything.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 3 |
| **Priority** | P1 |
| **Status** | Draft |
| **Created** | 2026-09-06 |
| **Branch** | `005-component-surface-system` |
| **Parent Spec** | ../spec.md |
| **Phase** | 68 of 68 |
| **Predecessor** | 067-sheet-family-remediation |
| **Successor** | None |
| **Handoff Criteria** | `goal.md`'s completion criteria met or operator-owned; `npm run gate` exit 0 over all 26 lanes; release 0.0.31 cut as the rename release; the fresh-vault smoke and the iCloud copy both observed |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

This is **Phase 68** of the Component Surface System.

**Scope Boundary**: the product's own name, wherever a user or a machine reads it, plus the
internal class and DOM prefixes the operator explicitly put in scope. Not the repository name
(stays `obsidian--notion-clone` until the operator says otherwise, §3), not the root `README.md`
rewrite (a GLM leg is doing that in parallel and lands separately, §3), not the `specs/` tree
(history stays as written, ADR-005), and not any behaviour: after this packet the product does
exactly what it did before under a different name.

**Dependencies**:
- Release **0.0.30** cut, and every in-flight leg landed — `058`, `056`'s edge-reveal, `057`'s
  month-chip, and the `059`-`067` children. This packet is the last one in, by construction.
- `tools/lane/css-lane.json` — the serialized stylesheet lane. This packet holds it for the whole
  leg and re-pins `baselineHash` on landing.

**Deliverables**:
- One `manifest.json` / `package.json` identity, one plugin id, one settings/ribbon/command
  vocabulary.
- A first-load data migration that copies `data.json` from the old plugin folder when the new one
  has none.
- A permanent alias for every user-typed or vault-stored string: the two code-block languages, the
  two view types, and the CSV/markdown export format marker.
- A scripted, reviewable prefix rewrite across `styles.css`, `src/`, `tools/`, `.storybook/` and
  `screenshots/`, with every capture re-derived and the css-lane baseline re-pinned.

**Changelog**:
- When this phase closes, refresh the matching file in ../changelog/ using the parent packet number
  plus this phase folder name.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
The product has one name in the operator's head and a different one in every file. The operator's
words on 2026-09-06 ~18:07, verbatim: *"our plugin is still named note database but rename to
obnotion"* — asked where it mattered, *"In community plugin"*; asked how far it reached,
*"Everything, including CSS class prefixes"*. Measured on `origin/main` `dc1d54a9`, the name is
written **3,375** times across `styles.css` and `src/` alone, the class prefix `db-` appears
**17,099** times across `styles.css`, `src/`, `tools/` and `.storybook/`, and `note-database-container`
— the root class every capture selector and every live probe anchors on — appears **3,181** times.
The name is also the plugin **id**, which is a filesystem path in the user's vault, and the
code-block **language** users have typed into their own notes.

### Purpose
The plugin reads as Obnotion everywhere — the community plugin panel, the ribbon, the settings
tab, the class names in the DOM — and an existing install keeps its settings, its open tabs and
its notes working without the user doing anything.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope

- **Identity.** `manifest.json` `id` `note-database` → `obnotion` and `name` `Note Database` →
  `Obnotion`; the `description`; `package.json` `name` `obsidian-note-database` →
  `obsidian-obnotion`; the `NoteDatabasePlugin` class; the hover-link source display string; the
  changelog modal title, its three CSS classes and its `obsidian://show-plugin?id=` deep link; the
  settings tab title and the ribbon label, both of which read `i18n.ts`'s `app.name` in three
  locales; `update-fork.sh`'s stale `REPO` constant.
- **Plugin id and its vault path.** `.obsidian/plugins/note-database/` → `.obsidian/plugins/obnotion/`,
  including the release runbook's iCloud copy target
  `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Michel Kerkmeester/.obsidian/plugins/<id>/`.
- **Data migration.** First load under the new id copies the old folder's `data.json` when the new
  folder has none (§4 REQ-004, ADR-002).
- **User-facing syntax, aliased not renamed.** The code-block languages `note-database` and
  `database-view`; the view types `note-database-view` and `note-database-file-view`, which
  Obsidian persists in the vault's `workspace.json`; the CSV/markdown export format marker
  `note-database-csv-markdown`.
- **CSS/DOM prefixes.** `note-database-container` → `obnotion-container`, `db-` → `obnotion-`, and the
  **209** `--db-*` custom properties, across `styles.css`, `src/`, `tools/` (live pins, capture
  harness selectors, sheet-grammar, render-assertions, storybook), `.storybook/`, `screenshots/`
  and the root `README.md`.
- **Release.** 0.0.31 cut as the rename release, with notes calling out the id change and the
  migration.

### Out of Scope

- **The GitHub repository name.** Stays `obsidian--notion-clone`. Renaming it breaks every BRAT
  install and every release URL. §12 Q1 put it to the operator on 2026-09-06 19:08 and the answer
  was no — a decision taken by default, and a reversible one: a GitHub rename leaves a redirect and
  can be done at any later date.
- **The root `README.md` rewrite.** A GLM leg is rewriting it in parallel and lands separately.
  This packet only applies the mechanical prefix rewrite to whatever `README.md` is on `main` when
  its leg starts, and does not re-author the prose.
- **`specs/`.** Not rewritten. A spec document saying `note-database` is reporting what was true
  when it was written; editing it produces a document that agrees with today and lies about the
  past (ADR-005, and the same rule `repo-rules/spec-tree-layout.md` §3 already applies to run
  records).
- **`db_view`, the frontmatter key.** It is written into the user's own notes (**57** references in
  `src/` and `tools/`) and marks a file as a database file. It is user data, it does not contain
  the product name, and it is explicitly excluded from the `db-` sweep (ADR-003).
- **Any behaviour change.** No view, no control, no value moves. A pixel that moves is a defect in
  this packet, not a feature of it.
- **Upstream attribution's prose.** The operator ruled the `manifest.json` half **in** on 2026-09-06
  19:08 (§12 Q2), so `author`, `authorUrl` and `fundingUrl` move in this packet. What stays out is
  the README's fork-credit paragraph itself: the parallel README leg authors that prose, and this
  packet only guarantees the manifest no longer credits the wrong person.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `manifest.json` | Modify | `id`, `name`, `description`; `author` → `MichelKerkmeester`, `authorUrl` → `https://github.com/MichelKerkmeester`, `fundingUrl` **removed** (§12 Q2, ruled 2026-09-06 19:08) |
| `package.json` | Modify | `name` → `obsidian-obnotion` |
| `src/main.ts` | Modify | Plugin class, hover-link display, changelog modal + deep link, the two code-block registrations (aliased), the nav-file tag class |
| `src/i18n.ts` | Modify | **15** `Note Database` strings across `en`, `zhCN`, `zhTW` |
| `src/views/database-view.ts`, `src/views/database-file-view.ts` | Modify | `DATABASE_VIEW_TYPE` / `DATABASE_FILE_VIEW_TYPE` values, with the old strings registered as aliases |
| `src/views/modals/linked-view-block.ts` | Modify | `LinkedViewLanguage`, the fence emitter, the fence-matching regex (accepts old and new) |
| `src/data/csv-markdown-zip-export.ts`, its importer | Modify | Export format marker written new, read either |
| `src/data/conditional-formatting.ts` | Modify | `data-note-database-conditional-*` DOM attributes |
| `styles.css` | Modify | **2,892** `note-database` references; **1,201** distinct `.db-*` selectors; **209** `--db-*` properties |
| `src/**` (129 files hold the name) | Modify | Class strings, test selectors, story fixtures |
| `tools/**` (46 files under `tools`/`.github`/root docs) | Modify | Live pins, capture scenarios, sheet-grammar, render-assertions, storybook shims, lane journal |
| `.storybook/preview.ts` | Modify | The host container class |
| `screenshots/manifest.json` + 1,467 PNGs | Regenerate | Every capture re-derived; pixelHash deltas expected everywhere |
| `tools/lane/css-lane.json` | Modify | Hold the lane, then re-pin `baselineHash` on landing |
| `update-fork.sh` | Modify | `REPO` currently reads `MichelKerkmeester/obsidian-note-database`, which is not this repository's origin |
| `.github/workflows/release.yml` | Verify | Asset names are `main.js`/`manifest.json`/`styles.css` — no rename needed; confirmed, not assumed |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | `manifest.json` reads `"id": "obnotion"` and `"name": "Obnotion"`, and Obsidian's community plugin panel shows Obnotion |
| REQ-002 | Zero occurrences of `note-database` or `Note Database` remain in `styles.css`, `src/`, `tools/`, `.storybook/`, `screenshots/manifest.json`, `manifest.json`, `package.json` or `README.md`, **except** the aliases REQ-005 requires |
| REQ-003 | Zero `db-`-prefixed class or custom-property tokens remain in the same set, except the `db_view` frontmatter key, which is excluded by name |
| REQ-004 | On first load under id `obnotion`, when `.obsidian/plugins/obnotion/data.json` is absent and `.obsidian/plugins/note-database/data.json` exists, the old file is **copied** into the new folder and the event is logged once. The source file is never moved, renamed or deleted |
| REQ-005 | Every user-typed or vault-stored string keeps a permanent alias: code-block languages `note-database` and `database-view` still render; view types `note-database-view` and `note-database-file-view` still resolve so an existing `workspace.json` reopens its tabs; a CSV/markdown export written by the old name still imports |
| REQ-006 | `npm run gate` exits 0 over all 26 lanes from a clean tree, with `npx tsc --noEmit`, `npm run build` and `npx vitest run` each read individually |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-007 | The prefix rewrite is performed by a committed, re-runnable script whose diff a reviewer can read, not by hand edits scattered across 134 files |
| REQ-008 | Every capture is re-derived and `screenshots/manifest.json` regenerated in the same commit as the rewrite; `tools/lane/css-lane.json`'s `baselineHash` is re-pinned to the new stylesheet hash and a `release` entry appended, never edited into another release's list |
| REQ-009 | A fresh-vault smoke passes: install into a scratch vault, enable, migrate a `data.json` from an old-id folder, open one database note, and read one embedded `note-database` fence written before the rename |
| REQ-010 | Release 0.0.31 is cut as the rename release, its notes naming the id change and the migration, and the build is copied to the iCloud vault under the new plugin folder with a `.backup-0.0.30/` of the old three files kept |
| REQ-011 | Census ratchets in `tools/naming/failing-values-baseline.json` and the operator checklist are re-pinned **downward** to the post-rename truth, never raised |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`,
> which is the document that decides whether this packet may close.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: The operator opens Obsidian's community plugin panel and reads **Obnotion**.
- **SC-002**: An operator who had the plugin installed as `note-database` opens the vault after
  0.0.31 and finds their databases, views and settings intact, with no manual step.
- **SC-003**: A note containing a `note-database` code fence written before the rename still
  renders its view.
- **SC-004**: `npm run gate` exits 0 with 26 lanes green on the post-rename tree.
- **SC-005**: A grep for the old name over the rewrite scope returns only the intentional aliases,
  and each one is named in `acceptance-criteria.md`.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | Release 0.0.30 and every in-flight leg (`058`, `056` edge-reveal, `057` month-chip, `059`-`067`) | This packet renames every class name; anything rebased across it collides on `styles.css` in thousands of lines | Sequenced last by construction (§10 R-001); one leg, one rebase window |
| Dependency | `tools/lane/css-lane.json` | Two holders editing `styles.css` at once is the failure the lane exists to prevent | Acquire the lane for the whole leg; hand it back with the new `baselineHash` |
| Risk | A user's `workspace.json` holds the old view types | Open database tabs fail to restore and the user sees empty panes | REQ-005 registers the old view types as aliases, permanently |
| Risk | The `db-` sweep catches `db_view`, the frontmatter key in user notes | Silent data corruption in the user's own files | Excluded by name in the rewrite script, asserted by a test (AC-009) |
| Risk | The rewrite lands on a stale capture manifest | 1,467 captures read green against a tree they were not taken from | Recapture and regenerate `screenshots/manifest.json` in the same commit; check the manifest blob id before believing capture churn |
| ~~Risk~~ **Closed** | pangy9's attribution stays in `manifest.json` under a renamed product | Reads as passing off upstream's work, or as failing to credit it | §12 Q2 ruled 2026-09-06 19:08: `author`/`authorUrl` move to MichelKerkmeester, `fundingUrl` is removed, and upstream credit moves to the README as an explicit fork line. The risk closes when T005 lands, not when the ruling was taken |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: The first-load migration reads at most one file and copies at most one file. It must
  not measurably move plugin startup; the copy is attempted once and its result cached in settings.

### Security
- **NFR-S01**: The migration only ever reads and writes inside `.obsidian/plugins/`. It never
  deletes, and it never writes outside the new plugin folder.

### Reliability
- **NFR-R01**: A failed migration is non-fatal. The plugin loads with default settings and logs the
  failure once; it never blocks `onload`.

---

## 8. EDGE CASES

### Data Boundaries
- Both folders present with data: the new one wins, untouched; nothing is copied, nothing logged
  twice.
- Old folder present, `data.json` absent: nothing to copy; the plugin starts with defaults.
- Old `data.json` present but unparseable: copied verbatim anyway, then handled by the existing
  defensive `loadData()` fallback at `src/main.ts:125`.

### Error Scenarios
- Adapter read/write throws (permissions, iCloud not yet materialised): caught, logged once,
  startup continues (NFR-R01).
- A note holds a fence in the old language and one in the new: both render; the alias is not
  exclusive.

### State Transitions
- User disables the old plugin but leaves its folder: the copy still works, because it reads the
  file, not the plugin.
- User re-enables the old plugin alongside the new one: both run, each on its own `data.json`. That
  is the reason the copy is a copy (ADR-002).

---

## 9. COMPLEXITY ASSESSMENT

`recommend-level.sh --loc 4314 --files 134 --api --db --architectural` → **Level 3**, total 90/100,
confidence 95, phase score 50. The LOC figure is measured, not estimated: **4,314** lines across the
rewrite scope match `note-database` or a `db-` token.

| Dimension | Score | Triggers |
|-----------|-------|----------|
| Scope | 25/25 | Files: 134, LOC: 4,314, Systems: stylesheet + plugin + harness + release |
| Risk | 15/25 | Auth: N, API: Y (plugin id, code-block language, view type are public contracts), Breaking: Y without the aliases |
| Research | 10/20 | The census is done and in this document; what is left is the migration's exact adapter call |
| Multi-Agent | 15/15 | One leg deliberately, because the blast radius forbids concurrency |
| Coordination | 15/15 | Sequenced behind 0.0.30 and eight sibling children |
| **Total** | **90/100** | **Level 3** |

**Why it is not decomposed into phases** even though the phase score is 50: the change is one
mechanical rewrite whose whole risk is that it touches every class name at once. Splitting it into
children would create exactly the multi-rebase window the sequencing rule (ADR-006) exists to
avoid. Level 3 documentation depth, one leg.

---

## 10. RISK MATRIX

| Risk ID | Description | Impact | Likelihood | Mitigation |
|---------|-------------|--------|------------|------------|
| R-001 | A sibling leg lands mid-rewrite and collides across thousands of stylesheet lines | H | H if unsequenced | Run after 0.0.30 and after every in-flight leg; single rebase window |
| R-002 | An existing install loses its settings | H | M without REQ-004 | Copy-never-move migration, plus the fresh-vault smoke that exercises it |
| R-003 | Old code-block fences stop rendering in users' notes | H | H without REQ-005 | Permanent language alias, tested |
| R-004 | Capture churn is misread as a regression | M | H | Every capture is expected to move; judge by opening PNGs, and check the manifest blob id first |
| R-005 | The rewrite script over-matches (`db_view`, `--db-` in a vendored file, a word containing `db-`) | H | M | Explicit exclusion list, a re-runnable script, and a reviewer reading its diff |
| R-006 | A rename release with no id-change note strands users on the old plugin | M | M | REQ-010 puts the id change in the release notes |

---

## 11. USER STORIES

### US-001: The operator reads the new name (Priority: P0)

**As** the operator, **I want** the community plugin panel to say Obnotion, **so that** the product
I use has the name I gave it.

**Acceptance criteria:** see `acceptance-criteria.md` (rows referencing this story).

### US-002: An existing install survives the rename (Priority: P0)

**As** an existing user, **I want** my databases, views, settings and open tabs to work after the
update, **so that** a rename costs me nothing.

**Acceptance criteria:** see `acceptance-criteria.md` (rows referencing this story).

---

## 12. OPEN QUESTIONS

**All four were answered by the operator on 2026-09-06 19:08.** The questions and their
recommendations are left standing beside each answer rather than replaced by it, so a reader can see
which recommendation was taken and which was not — Q3's was not.

| ID | Question | Recommendation, as written | Ruling, 2026-09-06 19:08 | Owner |
|----|----------|----------------------------|--------------------------|-------|
| Q1 | Does the GitHub repository rename from `obsidian--notion-clone`? | **No.** Renaming it breaks BRAT installs and every published release URL for no user-visible gain; the repo name is not shown in the plugin panel | **No — taken by default.** The operator did not ask for the rename when they were shown the row, which is a decision and is recorded as one rather than left as silence. It is also the most reversible of the four: a GitHub rename can be done at any later date and leaves a redirect behind, so nothing here forecloses it | Operator |
| Q2 | `manifest.json` still reads `author: pangy9`, `authorUrl: github.com/pangy9`, `fundingUrl: paypal.me/pangy9` — upstream's, from the fork point | **Attribute the fork to MichelKerkmeester** in `author`/`authorUrl`, drop or repoint `fundingUrl`, and **keep upstream credit in the README** | **Accepted, unchanged.** Operator, verbatim: *"Attribute to MichelKerkmeester, credit upstream in README"*. `author` → `MichelKerkmeester`, `authorUrl` → `https://github.com/MichelKerkmeester`, and `fundingUrl` **removed** rather than repointed — the recommendation offered "drop or repoint" and the ruling took drop. Upstream credit moves to `README.md` as an explicit fork line | Operator |
| Q3 | `db-` → `obn-` as the new class prefix | `obn-` is short, unambiguous and grep-safe against `obsidian-`; `obnotion-` would add 6 characters to every occurrence | **Declined in favour of `obnotion-`.** Operator, verbatim: *"obnotion- everywhere"*. `db-` → `obnotion-`, `--db-` → `--obnotion-`, `note-database-container` → `obnotion-container`. Re-measured on `e5830232`: 17,181 occurrences at +6 characters, less 3,185 container occurrences at −5, is a **net ≈ +87,000 characters** — about 29 KB of it on a 750 KB `styles.css`. ADR-003 carries the full table and why the trade was taken | Operator |
| Q4 | `update-fork.sh` names `MichelKerkmeester/obsidian-note-database`, which is not this repository's origin (`obsidian--notion-clone`) | Fix it to the real origin as part of this packet | **Yes, fix it.** It was already a task and stays one: `tasks.md` **T009**. The script stays wanted; only its `REPO` constant is wrong | Operator |

---

## RELATED DOCUMENTS

- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Verification Checklist**: See `tasks.md`
- **Acceptance Criteria**: See `acceptance-criteria.md`
- **Decision Records**: See `decision-record.md`
- **Durable Directive**: See `goal.md`
<!-- /ANCHOR:questions -->
