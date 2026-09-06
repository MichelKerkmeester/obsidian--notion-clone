---
title: "Decision Record: Rename to Obnotion"
description: "The six decisions the rename rests on: the name and the id, copy-never-move for the data file, the obnotion- prefix the operator ruled on 2026-09-06 19:08, permanent aliases for user-facing syntax, specs left as history, and one leg in one rebase window."
trigger_phrases:
  - "decision record"
  - "068 adr"
  - "obnotion rename decisions"
  - "obn prefix"
importance_tier: "important"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/068-rename-to-obnotion"
    last_updated_at: "2026-09-06T18:20:00Z"
    last_updated_by: "markdown-leaf"
    recent_action: "Recorded six ADRs for the Obnotion rename"
    next_safe_action: "Operator accepts or vetoes ADR-003 before the sweep runs"
    blockers:
      - "ADR-003 is Proposed; the sweep cannot start until it is Accepted"
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "068-rename-to-obnotion"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "The prefix is obnotion-, ruled 2026-09-06 19:08 against this ADR's obn- recommendation"
    answered_questions:
      - "The data file is copied, never moved"
---
# Decision Record: Rename to Obnotion

<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->

---

<!-- ANCHOR:adr-001 -->
## ADR-001: The product is Obnotion, and the plugin id changes with it

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-06 |
| **Deciders** | Operator |

---

<!-- ANCHOR:adr-001-context -->
### Context

The operator asked for the rename on 2026-09-06 ~18:07: *"our plugin is still named note database
but rename to obnotion"*. Asked where it had to show, they answered *"In community plugin"* — the
name and id Obsidian's community plugin panel reads out of `manifest.json`. Asked how far it
reached, they answered *"Everything, including CSS class prefixes"*.

The plugin **id** is not cosmetic. Obsidian uses it as the directory name under
`.obsidian/plugins/`, so changing it moves where `data.json` lives, changes the
`obsidian://show-plugin?id=` deep link, and changes the iCloud install path the release runbook
copies into. Leaving the id at `note-database` while renaming only the display name would satisfy
the panel and leave the old name in the one place a user can actually see it on disk.

### Constraints

- `manifest.json` `id` must match the folder name Obsidian installs into.
- An existing install's `data.json` sits under the old id and Obsidian will not move it.
- The release workflow attaches `main.js`, `manifest.json` and `styles.css` by fixed filename, so
  the id change does not touch it — confirmed by reading `.github/workflows/release.yml`, not
  assumed.
<!-- /ANCHOR:adr-001-context -->

---

<!-- ANCHOR:adr-001-decision -->
### Decision

**We chose**: `id` becomes `obnotion` and `name` becomes `Obnotion`, and every identity string that
carries the old product name changes with them.

**How it works**: `manifest.json` and `package.json` change outright. `src/i18n.ts`'s `app.name`
feeds the ribbon and, through `settings.title`, the settings heading, in all three locales, so 15
strings there cover the visible vocabulary. The `NoteDatabasePlugin` class, the hover-link display
string and the changelog modal's title, classes and deep link follow.
<!-- /ANCHOR:adr-001-decision -->

---

<!-- ANCHOR:adr-001-alternatives -->
### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **Rename name and id (chosen)** | The product has one name everywhere, including on disk | Needs a data migration and view-type aliases | 9/10 |
| Rename the display name only, keep id `note-database` | No migration, no aliases, one-line change | The old name survives in the plugin folder, the deep link and the iCloud path; the operator asked for "everything" | 4/10 |
| Rename and also rename the GitHub repo | URL matches the product | Breaks every BRAT install and every published release URL for no panel-visible gain | 3/10 |

**Why this one**: it is what was asked for, and the id is the only piece whose old value a user
would keep meeting after a display-name-only change.
<!-- /ANCHOR:adr-001-alternatives -->

---

<!-- ANCHOR:adr-001-consequences -->
### Consequences

**What improves**:
- One name in the panel, the ribbon, the settings tab, the plugin folder and the deep link.
- The iCloud install path stops contradicting the product name.

**What it costs**:
- A first-load data migration (ADR-002) and a permanent alias set (ADR-004). Mitigation: both are
  small, both are tested, and the alias set is additive so it can never regress an existing vault.
- Users see a new entry in the plugin list and may end up with both installed. Mitigation: the
  migration copies rather than moves, so the old install keeps working until they remove it.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| A user updates and thinks the plugin vanished | M | Release notes name the id change explicitly (REQ-010) |
| The manifest still credits pangy9 under a renamed product | M | `spec.md` §12 Q2, the operator's call, with a recommendation attached |
<!-- /ANCHOR:adr-001-consequences -->

---

<!-- ANCHOR:adr-001-five-checks -->
### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | An explicit operator instruction with a scope ruling |
| 2 | **Beyond Local Maxima?** | PASS | Display-name-only and repo-rename-too both considered and rejected above |
| 3 | **Sufficient?** | PASS | Identity plus migration plus aliases is the minimum that leaves an existing vault working |
| 4 | **Fits Goal?** | PASS | The parent program is the product's surface; its name is part of it |
| 5 | **Open Horizons?** | PASS | Aliases are permanent, so nothing here forecloses a later change |

**Checks Summary**: 5/5 PASS
<!-- /ANCHOR:adr-001-five-checks -->

---

<!-- ANCHOR:adr-001-impl -->
### Implementation

**What changes**:
- `manifest.json`, `package.json`, `src/main.ts`, `src/i18n.ts`, `update-fork.sh`.
- The release runbook's iCloud target
  `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Michel Kerkmeester/.obsidian/plugins/<id>/`.

**How to roll back**: revert the identity commit and re-release. The old folder is untouched
(ADR-002), so a revert restores the previous install without data loss.
<!-- /ANCHOR:adr-001-impl -->
<!-- /ANCHOR:adr-001 -->

---

<!-- ANCHOR:adr-002 -->
## ADR-002: The old `data.json` is copied, never moved

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-06 |
| **Deciders** | 068 |

---

<!-- ANCHOR:adr-002-context -->
### Context

Changing the id changes where `Plugin.loadData()` reads. An existing user's databases, views,
column widths and recent icons all live in `.obsidian/plugins/note-database/data.json`. Without a
migration the plugin starts empty and the user's work looks gone.

### Constraints

- The migration runs inside `onload()`, before `loadData()` at `src/main.ts:125`.
- A throw there must not block startup: the existing code already has a defensive fallback around
  `loadData()`, and the migration must not be the thing that breaks what that fallback protects.
- Both plugins can be enabled at once during a transition.
<!-- /ANCHOR:adr-002-context -->

---

<!-- ANCHOR:adr-002-decision -->
### Decision

**We chose**: copy the old `data.json` into the new folder on first load when the new folder has
none. Never move, rename or delete the source.

**How it works**: one adapter existence check on the new path, one on the old, one read, one write,
one log line. If the new path already has data, nothing happens. If the read or write throws, it is
caught, logged once, and startup continues with defaults.
<!-- /ANCHOR:adr-002-decision -->

---

<!-- ANCHOR:adr-002-alternatives -->
### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **Copy, leave the source (chosen)** | Rollback is free; both installs work; nothing of the user's is destroyed | Two copies drift if both plugins are used | 9/10 |
| Move the file | One source of truth, no drift | An irreversible write into the user's vault on first load, and a revert strands them | 3/10 |
| Prompt the user | Explicit consent | A modal on first load after an update reads as a defect; most users would not know what to answer | 5/10 |
| No migration; document a manual copy | Zero code | Guarantees that some users lose their databases | 1/10 |

**Why this one**: the only irreversible thing a rename could do to a user is touch their data, and
a copy cannot. The drift cost is real but bounded and only reachable by someone deliberately
running both.
<!-- /ANCHOR:adr-002-alternatives -->

---

<!-- ANCHOR:adr-002-consequences -->
### Consequences

**What improves**:
- An update is invisible to the user: their vault opens with everything where it was.
- Rollback needs no data reversal at all.

**What it costs**:
- A stale `data.json` remains in the old folder. Mitigation: it is inert once the old plugin is
  removed, and the release notes say the old folder can be deleted.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| Both plugins enabled, edits split across two files | M | The copy runs once; the release notes tell the user to disable the old entry |
| Adapter throws on iCloud before the folder materialises | M | Caught, logged once, non-fatal; the copy retries on the next load because the new path still has no data |
<!-- /ANCHOR:adr-002-consequences -->

---

<!-- ANCHOR:adr-002-five-checks -->
### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | Without it, every existing install starts empty |
| 2 | **Beyond Local Maxima?** | PASS | Move, prompt and do-nothing all scored above |
| 3 | **Sufficient?** | PASS | One file, one copy, one log line |
| 4 | **Fits Goal?** | PASS | REQ-004, the packet's only data-touching requirement |
| 5 | **Open Horizons?** | PASS | Non-destructive, so any later decision is still available |

**Checks Summary**: 5/5 PASS
<!-- /ANCHOR:adr-002-five-checks -->

---

<!-- ANCHOR:adr-002-impl -->
### Implementation

**What changes**: `src/main.ts` `onload()`, plus a vitest covering present/absent/both/unparseable.

**How to roll back**: revert the branch. The source file was never modified, so nothing needs
restoring.
<!-- /ANCHOR:adr-002-impl -->
<!-- /ANCHOR:adr-002 -->

---

<!-- ANCHOR:adr-003 -->
## ADR-003: The class prefix becomes `obnotion-`, and `note-database-container` becomes `obnotion-container`

### Metadata

| Field | Value |
|-------|-------|
| **Status** | **Accepted 2026-09-06 19:08** — `obnotion-`, not the `obn-` this ADR proposed |
| **Date** | 2026-09-06 (opened) · 2026-09-06 19:08 (ruled) |
| **Deciders** | The operator |

---

<!-- ANCHOR:adr-003-context -->
### Context

The operator put the class prefixes in scope explicitly: *"Everything, including CSS class
prefixes"*. Measured on `dc1d54a9`: `db-` appears **17,099** times across `styles.css`, `src/`,
`tools/` and `.storybook/` in **1,724** distinct tokens, of which **1,201** are `.db-*` selectors
in `styles.css`, **1,135** are quoted class strings in `src/`, and **209** are `--db-*` custom
properties. `note-database-container` — the root class every capture selector, every live probe and
every story shim anchors on — appears **3,181** times, 2,167 of them in `styles.css`.

What the new prefix is was not specified, so this ADR proposes one rather than assuming it.

### Constraints

- The prefix appears 17,181 times (re-measured on `e5830232`), so each extra character is 17,181
  extra characters. The ruling chose six of them.
- It must not collide with Obsidian's own `is-`, `nav-`, `mod-`, `workspace-` families, nor read as
  a truncation of `obsidian-`.
- It must be greppable: a prefix that is also an English word makes the sweep unverifiable.
- `db_view` — the frontmatter key in the user's own notes, 57 references — is user data and is
  **excluded by name**. It is not a class and it does not carry the product name.
<!-- /ANCHOR:adr-003-context -->

---

<!-- ANCHOR:adr-003-decision -->
### Decision

**Accepted, against the recommendation.** Operator, 2026-09-06 19:08, verbatim: *"obnotion-
everywhere"*.

**The ruling**: `db-` → `obnotion-`, `--db-` → `--obnotion-`, and `note-database-container` →
`obnotion-container`. The other 39 `note-database*` identifiers take their `obnotion*` forms, except
the five ADR-004 pins that keep permanent aliases.

**This reverses the ADR's own recommendation**, which was `obn-`, and the alternatives table below is
left exactly as it was scored rather than re-scored to agree with the answer. The argument for
`obn-` was character count and nothing else; the operator weighed self-documenting DOM against
bytes and chose the DOM. Recording that plainly is the point — an ADR rewritten to look like it
recommended what was chosen teaches the next reader nothing.

**How it works**: one committed script (`tools/naming/rename-prefixes.mjs`) with an explicit
exclusion list, run once, its diff reviewed, and re-runnable as a `--check` that must report zero
afterwards. The ruling changes the script's two constants, not its shape.

**Size, re-measured on `e5830232` rather than carried from the ADR's own `dc1d54a9` reading**, since
the ruling made the number six times larger and a stale count would understate it:

| Family | Occurrences | Per occurrence | Delta |
|---|---:|---:|---:|
| `db-` → `obnotion-` (`--db-` → `--obnotion-` is 2,330 of these) | 17,181 | +6 chars | **+103,086** |
| `note-database-container` → `obnotion-container` | 3,185 | −5 chars | **−15,925** |
| **Net** | | | **≈ +87,000 characters, about 85 KB** |

`styles.css` carries 6,658 of the `db-` occurrences and 2,172 of the container ones, so the
stylesheet grows by roughly **29 KB** on a 750 KB file — about 4%. `src/` carries 3,620 `db-`
occurrences. The distinct-token count is **1,728**, four more than the ADR measured, which is drift
in the tree rather than in the method.

**Is the 85 KB a problem?** No, and it is worth saying why rather than leaving it implied: none of
it reaches the user's vault, none of it is parsed at runtime more than once, and the stylesheet is
already 750 KB. The cost of `obnotion-` is legibility bought with bytes nobody pays for at
interaction time. The `obn-` argument was real and it was simply outweighed.
<!-- /ANCHOR:adr-003-decision -->

---

<!-- ANCHOR:adr-003-alternatives -->
### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| `obn-` (recommended, **not** taken) | 4 characters, unique, greppable, obviously Obnotion's | Slightly cryptic to a first-time reader | 8/10 |
| **`obnotion-` (ruled)** | Unambiguous, self-documenting | Adds 6 characters to 17,181 occurrences and lengthens every selector in a 1,201-rule stylesheet | 6/10 — the score the recommendation gave it, left as it was |
| Keep `db-` | Zero diff, zero capture churn, zero risk | Directly contradicts the operator's stated scope | 2/10 |
| `on-` | Shortest | Collides with the word "on" and with event-handler naming; unverifiable by grep | 1/10 |

**Why this one was recommended**: it is the shortest prefix that is still unique and greppable, and
the cost of `obnotion-` is paid 17,181 times for readability that the surrounding class name already
provides.

**Why the operator chose otherwise, and why the table stands**: the scores above weigh characters.
The ruling weighs what a user sees when they inspect an element — `obnotion-board-card` names the
product, `obn-board-card` names an abbreviation of it — and the 85 KB that buys is not paid at
interaction time. The row scored 6/10 on a scale that never included that. The table is left
un-rescored so the trade is visible rather than retconned.
<!-- /ANCHOR:adr-003-alternatives -->

---

<!-- ANCHOR:adr-003-consequences -->
### Consequences

**What improves**:
- The DOM reads as one product. A user inspecting an element sees the plugin's name, not its old one.

**What it costs**:
- Every one of 1,467 captures re-derives and every `pixelHash` moves, so this leg's capture diff
  carries no signal about rendering. Mitigation: the capture claim is judged against a manifest
  regenerated on this tree, with its blob id recorded first.
- Any user CSS snippet targeting `.db-*` breaks. Mitigation: none available — a class name is not a
  public API here, and the operator has ruled the rename in. Named rather than hidden.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| The script over-matches a token that merely contains `db-` | H | Explicit exclusion list plus adversarial unit tests (AC-009) |
| `--obnotion-` custom-property names collide with an Obsidian variable | L | 2,330 occurrences, all under one prefix no other vendor uses; the `--check` pass reports any survivor |
| A harness pin built by string concatenation is missed | M | T014 re-anchors by hand, with a deliberately un-rewritten pin as the negative control |
<!-- /ANCHOR:adr-003-consequences -->

---

<!-- ANCHOR:adr-003-five-checks -->
### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | The operator named CSS class prefixes explicitly |
| 2 | **Beyond Local Maxima?** | PASS | Four prefixes scored above |
| 3 | **Sufficient?** | PASS | One script, one pass, one exclusion list |
| 4 | **Fits Goal?** | PASS | REQ-003 |
| 5 | **Open Horizons?** | PASS | A future prefix change is the same script with two constants |

**Checks Summary**: 5/5 PASS — and the operator ruled `obnotion-` rather than the `obn-` the checks
were run against, on 2026-09-06 19:08. The checks measured the reasoning, not the operator's taste,
which is exactly why passing them did not settle the answer. Every one of the five holds unchanged
under `obnotion-`: the script, the exclusion list and the rollback are identical, and only two
constants differ.
<!-- /ANCHOR:adr-003-five-checks -->

---

<!-- ANCHOR:adr-003-impl -->
### Implementation

**What changes**: `styles.css`, `src/**`, `tools/**`, `.storybook/**`, `README.md`,
`screenshots/manifest.json`, and the 1,467 PNGs by recapture.

**How to roll back**: re-run the script with the two constants swapped, then recapture. It is
idempotent and symmetric, which is the main reason it is a script rather than an editor session —
and the reason the ruling costs nothing to have taken late.
<!-- /ANCHOR:adr-003-impl -->
<!-- /ANCHOR:adr-003 -->

---

<!-- ANCHOR:adr-004 -->
## ADR-004: Every string a user typed or a vault stored keeps a permanent alias

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-06 |
| **Deciders** | 068 |

---

<!-- ANCHOR:adr-004-context -->
### Context

Five of the 40 `note-database*` identifiers are not ours to rename, because they already exist
outside the repository — in the user's notes and in the vault's own configuration:

| String | Where it lives | Site |
|---|---|---|
| `note-database` | a code fence the user typed into a note | `src/main.ts:453` |
| `database-view` | the second code fence language | `src/main.ts:467` |
| `note-database-view` | the vault's `workspace.json`, per open tab | `src/views/database-view.ts:244` |
| `note-database-file-view` | the same, for the dashboard tab | `src/views/database-file-view.ts:25` |
| `note-database-csv-markdown` | the format marker inside exported archives | `src/data/csv-markdown-zip-export.ts:68` |

A hard rename of any of them silently breaks content the user already has: a fence stops rendering,
a tab reopens empty, an old export stops importing.

### Constraints

- Obsidian resolves view types by exact string at startup; there is no fuzzy match.
- The fence matcher at `linked-view-block.ts:121` is a regex, so it can accept both without a
  second processor.
<!-- /ANCHOR:adr-004-context -->

---

<!-- ANCHOR:adr-004-decision -->
### Decision

**We chose**: write the new string, read either, forever. No deprecation window and no removal
date.

**How it works**: the two code-block languages both register. Both view types register, old and
new. The fence emitter writes the new language while the matcher accepts both. The importer
accepts either format marker while the exporter writes only the new one.
<!-- /ANCHOR:adr-004-decision -->

---

<!-- ANCHOR:adr-004-alternatives -->
### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **Permanent alias (chosen)** | No user content ever breaks; nothing to schedule | Five strings of the old name survive in the source forever | 9/10 |
| Alias with a removal in a later version | The old name eventually leaves the codebase | Guarantees a future release that breaks notes people wrote years earlier | 3/10 |
| One-time vault rewrite of the user's notes | Fully clean | Editing the user's own files to satisfy our naming is not a trade we get to make | 1/10 |
| Hard rename, no alias | Cleanest source | Breaks every existing note and every open tab | 0/10 |

**Why this one**: the cost is five strings in our source; the alternative's cost is in someone
else's files.
<!-- /ANCHOR:adr-004-alternatives -->

---

<!-- ANCHOR:adr-004-consequences -->
### Consequences

**What improves**:
- Upgrading is invisible. No note is edited, no tab is lost.

**What it costs**:
- REQ-002's "zero occurrences" is not literally zero. Mitigation: the five survivors are enumerated
  in `acceptance-criteria.md` AC-006, so the grep has a named expected answer rather than a fuzzy one.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| A later contributor "cleans up" the aliases | H | This ADR, and AC-006 naming each string |
<!-- /ANCHOR:adr-004-consequences -->

---

<!-- ANCHOR:adr-004-five-checks -->
### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | Each of the five crosses a persistence or interop boundary |
| 2 | **Beyond Local Maxima?** | PASS | Deprecation window, vault rewrite and hard rename all scored |
| 3 | **Sufficient?** | PASS | Five aliases, four tests |
| 4 | **Fits Goal?** | PASS | REQ-005 |
| 5 | **Open Horizons?** | PASS | Additive; nothing is foreclosed |

**Checks Summary**: 5/5 PASS
<!-- /ANCHOR:adr-004-five-checks -->

---

<!-- ANCHOR:adr-004-impl -->
### Implementation

**What changes**: `src/main.ts`, `src/views/database-view.ts`, `src/views/database-file-view.ts`,
`src/views/modals/linked-view-block.ts`, `src/data/csv-markdown-zip-export.ts`.

**How to roll back**: nothing to roll back — the aliases are additive and safe under any revert.
<!-- /ANCHOR:adr-004-impl -->
<!-- /ANCHOR:adr-004 -->

---

<!-- ANCHOR:adr-005 -->
## ADR-005: `specs/` is not rewritten

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-06 |
| **Deciders** | Operator, 068 |

---

<!-- ANCHOR:adr-005-context -->
### Context

The `specs/` tree carries thousands of references to `note-database` and to `.db-*` classes inside
measurements, quoted stylesheet lines, capture readings and operator reports. Every one of them was
true when it was written.

### Constraints

- `repo-rules/spec-tree-layout.md` §3 already establishes the principle for run records: a
  document corrected to agree with today lies about the past.
- The parent packet's own documents (`goal.md`, `roadmap.md`) are amended by this packet, but only
  to **add** rows describing the rename — never to rewrite historical measurements.
<!-- /ANCHOR:adr-005-context -->

---

<!-- ANCHOR:adr-005-decision -->
### Decision

**We chose**: exclude `specs/` from the rewrite entirely.

**How it works**: the script's exclusion list names `specs/`, and AC-009 asserts
`git diff --stat -- specs` is empty apart from this packet's own documents and the parent
amendments.
<!-- /ANCHOR:adr-005-decision -->

---

<!-- ANCHOR:adr-005-alternatives -->
### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **Exclude `specs/` (chosen)** | History stays readable as history | Old class names appear in current-looking documents | 9/10 |
| Rewrite `specs/` too | Every document agrees with the tree | Thousands of measurements would then cite selectors that never existed when they were measured | 2/10 |

**Why this one**: a stale name in a record is readable as history; a corrected one is not readable
as anything.
<!-- /ANCHOR:adr-005-alternatives -->

---

<!-- ANCHOR:adr-005-consequences -->
### Consequences

**What improves**:
- Every measurement in the program stays checkable against the commit it was taken on.

**What it costs**:
- A reader of an old packet meets old class names. Mitigation: this ADR, and the parent
  `roadmap.md` row that dates the rename.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| A later grep over `specs/` reports the rename as incomplete | L | REQ-002 scopes the grep, and AC-002 names the scope |
<!-- /ANCHOR:adr-005-consequences -->

---

<!-- ANCHOR:adr-005-five-checks -->
### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | Otherwise the sweep would rewrite thousands of historical measurements |
| 2 | **Beyond Local Maxima?** | PASS | Rewriting `specs/` scored and rejected |
| 3 | **Sufficient?** | PASS | One exclusion entry, one assertion |
| 4 | **Fits Goal?** | PASS | Keeps the packet's own evidence trustworthy |
| 5 | **Open Horizons?** | PASS | Nothing prevents a later documented migration if one is ever wanted |

**Checks Summary**: 5/5 PASS
<!-- /ANCHOR:adr-005-five-checks -->

---

<!-- ANCHOR:adr-005-impl -->
### Implementation

**What changes**: nothing under `specs/` except this packet and the parent's added rows.

**How to roll back**: not applicable.
<!-- /ANCHOR:adr-005-impl -->
<!-- /ANCHOR:adr-005 -->

---

<!-- ANCHOR:adr-006 -->
## ADR-006: One leg, one rebase window, sequenced last

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-06 |
| **Deciders** | Operator, 068 |

---

<!-- ANCHOR:adr-006-context -->
### Context

`recommend-level.sh` scored this work at phase score 50 and recommended four phases. It is right
about the scale and wrong about the shape. The change rewrites **every class name in the tree**, so
any branch that predates it collides on `styles.css` in thousands of lines. The program has already
paid for this: `port-phase-landing-discipline` records worktrees that branched before a sibling
landed colliding on `styles.css`, `manifest.json` and `tools/live/*.json`, and `harness-traps`
records `rerere` silently reverting upstream content on a replayed rebase.

### Constraints

- `rerere` is disabled in the primary checkout and must stay disabled for this leg.
- The css lane serializes stylesheet writers by design; this leg holds it throughout.
- Eight sibling children (`059`-`067`) and three in-flight legs are outstanding at authoring time.
<!-- /ANCHOR:adr-006-context -->

---

<!-- ANCHOR:adr-006-decision -->
### Decision

**We chose**: one leg, run last — after 0.0.30 is cut and after `058`, `056`'s edge-reveal, `057`'s
month-chip and every `059`-`067` child have landed — with exactly one rebase onto `main` before
verification.

**How it works**: T001 gates the leg on that state. The leg holds the css lane end to end, rebases
once, verifies on the rebased tree, fast-forwards `main`, gates `main`, and releases from a clean
clone.
<!-- /ANCHOR:adr-006-decision -->

---

<!-- ANCHOR:adr-006-alternatives -->
### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **One leg, last (chosen)** | One conflict surface, one rebase, one recapture | Blocks on eight siblings first | 9/10 |
| Four phases as `recommend-level.sh` suggests | Smaller reviewable diffs | Four rebase windows across a tree whose every class name is moving; four recaptures | 2/10 |
| Run it first, before the siblings | No waiting | Every sibling would then rebase across a full class rename | 1/10 |
| Split identity from the prefix sweep | Identity ships early | Two capture-invalidating windows instead of one, for a name nobody sees until release | 4/10 |

**Why this one**: the risk is entirely in the concurrency, not in the edit. Removing the
concurrency removes the risk.
<!-- /ANCHOR:adr-006-alternatives -->

---

<!-- ANCHOR:adr-006-consequences -->
### Consequences

**What improves**:
- One conflict surface, one recapture, one lane handover, one release.

**What it costs**:
- The rename waits for eight siblings. Mitigation: the packet is written now, so the leg is a
  matter of execution when the queue clears.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| A sibling lands mid-leg anyway | H | The css lane, plus T001's gate, plus a post-rebase three-way audit of every file both sides touched |
| `rerere` replays a sibling's stale resolution | H | It is disabled and must stay disabled; audit the rebase output rather than trusting it |
<!-- /ANCHOR:adr-006-consequences -->

---

<!-- ANCHOR:adr-006-five-checks -->
### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | The blast radius is the whole class vocabulary |
| 2 | **Beyond Local Maxima?** | PASS | Four alternatives scored, including the tool's own recommendation |
| 3 | **Sufficient?** | PASS | One leg is the smallest shape that avoids repeated conflict surfaces |
| 4 | **Fits Goal?** | PASS | Sequencing is one of the six things the operator's brief asked this packet to carry |
| 5 | **Open Horizons?** | PASS | Nothing about the ordering constrains later work |

**Checks Summary**: 5/5 PASS

**Note on disagreeing with the tool.** `recommend-level.sh` scored `phase_score: 50` and
`suggested_phase_count: 4`. Its Level 3 recommendation is adopted; its phase recommendation is
declined on the reasoning above, and the disagreement is recorded here rather than absorbed
silently.
<!-- /ANCHOR:adr-006-five-checks -->

---

<!-- ANCHOR:adr-006-impl -->
### Implementation

**What changes**: the leg's sequencing, `tools/lane/css-lane.json` ownership, and `tasks.md` T001.

**How to roll back**: the whole leg is one branch; `git revert` its commits on `main`.
<!-- /ANCHOR:adr-006-impl -->
<!-- /ANCHOR:adr-006 -->
