---
title: "Goal: Rename to Obnotion"
description: "The durable directive for renaming the plugin from Note Database to Obnotion, and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "068 goal"
  - "obnotion rename directive"
  - "rename plugin obnotion"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/068-rename-to-obnotion"
    last_updated_at: "2026-09-06T17:08:00Z"
    last_updated_by: "ruling-fold-session"
    recent_action: "Folded the 19:08 rulings: obnotion- prefix, attribution, repo name, update-fork.sh"
    next_safe_action: "Run the single leg after 0.0.30 and every in-flight leg"
    blockers:
      - "Runs last: after 0.0.30 and after 058, 056 edge-reveal, 057 month-chip and 059-067"
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "decision-record.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "068-rename-to-obnotion"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions:
      - "The class prefix is obnotion-, not the obn- this packet recommended (operator 19:08)"
      - "The manifest credits MichelKerkmeester, fundingUrl removed, upstream credited in the README (operator 19:08)"
      - "The GitHub repository keeps its name; the decision is by default and reversible (operator 19:08)"
      - "update-fork.sh's REPO is fixed in this packet, T009 (operator 19:08)"
      - "Scope is everything including CSS class prefixes"
      - "The surface that matters is the community plugin panel, so the id changes too"
      - "The old data.json is copied, never moved"
      - "specs/ is not rewritten; history stays as written"
---
# Goal: Rename to Obnotion

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

> Everything above the log is DURABLE: it is what an operator sets as the session
> objective, and it must stay true for the life of the packet.

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** The plugin is called Obnotion everywhere a user or a machine reads it — the
community plugin panel, the plugin id, the ribbon, the settings tab and every CSS class — and an
existing install keeps its settings, its open tabs and its notes working with no manual step.

### Decisions

Frozen choices. Changing one is an amendment.

| ID | Decision |
|----|----------|
| D1 | **The operator's instruction, 2026-09-06 ~18:07, verbatim:** *"our plugin is still named note database but rename to obnotion"*. Asked where it had to show: *"In community plugin"*. Asked how far it reached: *"Everything, including CSS class prefixes"*. Those three sentences are the scope; nothing here widens them |
| D2 | **The plugin id changes with the name.** `note-database` → `obnotion` in `manifest.json`, which moves the vault folder, the `obsidian://show-plugin?id=` deep link and the iCloud install path. A display-name-only rename was considered and rejected (ADR-001): it leaves the old name in the one place a user meets it on disk |
| D3 | **The old `data.json` is copied, never moved** (ADR-002). On first load under the new id, when the new folder has no data and the old folder does, the file is copied and the event logged once. The source is never moved, renamed or deleted, and a throw is non-fatal |
| D4 | **Five strings keep permanent aliases** (ADR-004): the code-block languages `note-database` and `database-view`, the view types `note-database-view` and `note-database-file-view` that Obsidian stores in the vault's `workspace.json`, and the export marker `note-database-csv-markdown`. Write the new, read either, forever. No deprecation window |
| D5 | **The class prefix becomes `obnotion-` and the root class `obnotion-container`** (ADR-003, **Accepted 2026-09-06 19:08** — operator, verbatim: *"obnotion- everywhere"*, declining this packet's own `obn-` recommendation). `--db-` → `--obnotion-` with it. The cost is re-measured rather than carried: net ≈ **+87,000 characters**, about 29 KB of it on a 750 KB `styles.css`. `db_view` — the frontmatter key in the user's own notes — is excluded by name: it is user data and carries no product name |
| D8 | **The manifest's attribution moves and the repository's name does not** (`spec.md` §12 Q1, Q2, ruled 2026-09-06 19:08). `author` → `MichelKerkmeester`, `authorUrl` → `https://github.com/MichelKerkmeester`, `fundingUrl` **removed**; upstream credit moves to `README.md` as an explicit fork line, authored by the parallel README leg. The GitHub repository stays `obsidian--notion-clone` — decided by default, and reversible, since a rename leaves a redirect |
| D6 | **`specs/` is not rewritten** (ADR-005). A spec document naming `note-database` reports what was true when it was written |
| D7 | **One leg, one rebase window, sequenced last** (ADR-006): after 0.0.30 is cut and after `058`, `056`'s edge-reveal, `057`'s month-chip and every `059`-`067` child have landed. `recommend-level.sh` recommended four phases; that recommendation is declined on the record, because the risk is the concurrency, not the edit |
| D8 | **The repository name stays `obsidian--notion-clone`** unless the operator says otherwise, and the root `README.md` rewrite belongs to the GLM leg running in parallel — referenced, not redone |

### Operator copy

The operator holds this directive as the session objective, and that copy is what judges
completion. Whenever anything above the log changes, resend the full text of this file in chat.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [ ] `jq -r '.id,.name' manifest.json` prints `obnotion` and `Obnotion`, and the operator reads the
      name Obnotion in Obsidian's community plugin panel
- [ ] `git grep -c -E 'note-database|Note Database' -- styles.css src tools .storybook README.md manifest.json package.json screenshots/manifest.json`
      returns only the five aliases named in `acceptance-criteria.md` AC-006 (baseline on
      `dc1d54a9`: 3,375 in `styles.css` + `src` alone)
- [ ] `git grep -ho '\bdb-[a-zA-Z0-9_-]*' -- styles.css src tools .storybook | sort -u | wc -l`
      prints 0 (baseline on `dc1d54a9`: 1,724 distinct tokens, 17,099 occurrences; on `e5830232`:
      1,728 and 17,181), and
      `rg -n '\bdb_view\b' src tools | wc -l` still prints 57
- [ ] A vault holding only `.obsidian/plugins/note-database/data.json` opens under 0.0.31 with its
      databases, views and settings intact, the source file still present and byte-identical
- [ ] A note with a pre-rename `note-database` code fence renders, and a `workspace.json`
      holding the old view types reopens both tab kinds
- [ ] `npm run gate </dev/null` exits 0 across 26 lanes from a clean tree, with the log written
      inside this leg's own worktree
- [ ] Release 0.0.31 is cut with notes naming the id change and the migration, its three assets
      attached, and the build copied into the iCloud vault under `.obsidian/plugins/obnotion/`
- [ ] The operator confirms on their own device that the rename landed and nothing of theirs was
      lost (parent D3: only this closes the packet)
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

Everything below is VOLATILE.

### Opened 2026-09-06 ~18:07

The operator asked for the rename and then answered two scoping questions in the same exchange, which
is why this packet is a rename **and** a migration rather than a find-and-replace. *"In community
plugin"* put `manifest.json`'s `id` in scope, and the id is a directory in the user's vault.
*"Everything, including CSS class prefixes"* put a 17,099-occurrence token family in scope, which is
what makes it a single-leg change rather than a phased one.

### Ruled 2026-09-06 19:08 — four answers, and one of them declines this packet's own recommendation

- **Q3, the prefix.** *"obnotion- everywhere"*. The packet recommended `obn-` on character count and
  scored `obnotion-` at 6/10 against it. The operator weighed self-documenting DOM against bytes and
  took the bytes: net ≈ **+87,000 characters** re-measured on `e5830232`, roughly 29 KB of it on a
  750 KB stylesheet. ADR-003 is Accepted with the alternatives table left **un-rescored**, so the
  trade stays visible rather than retconned.
- **Q2, the attribution.** *"Attribute to MichelKerkmeester, credit upstream in README"* — accepted
  unchanged. The recommendation offered "drop or repoint" the `fundingUrl`; the ruling took drop.
- **Q1, the repository name.** No. Taken by default rather than argued, and recorded as a decision
  anyway, because silence and a no are different states — and this one is reversible: a GitHub
  rename leaves a redirect and can be done later.
- **Q4, `update-fork.sh`.** Yes, fix it. It was already **T009**; the ruling confirms the script is
  still wanted rather than deleted.

### The census, measured on `origin/main` `dc1d54a9`

| Reading | Count | Command |
|---|---|---|
| `note-database` in `styles.css` + `src/` | **3,375** (2,892 + 483) | `grep -ro "note-database" styles.css src \| wc -l` |
| Distinct `.db-*` selectors in `styles.css` | **1,201** | `grep -o '\.db-[a-zA-Z0-9_-]*' styles.css \| sort -u \| wc -l` |
| Distinct `db-*` tokens, `styles.css`+`src`+`tools`+`.storybook` | **1,724** | `git grep -ho '\bdb-[a-zA-Z0-9_-]*' -- styles.css src tools .storybook \| sort -u \| wc -l` |
| `db-*` occurrences, same scope | **17,099** | same, without `sort -u` |
| Distinct `--db-*` custom properties | **209** | `git grep -ho '\-\-db-[a-zA-Z0-9_-]*' -- styles.css src tools \| sort -u \| wc -l` |
| `note-database-container` occurrences | **3,181** (2,167 in `styles.css`) | `git grep -o "note-database-container" -- . ':!specs' ':!main.js' \| wc -l` |
| Distinct `note-database*` identifiers | **40** | `git grep -ho 'note-database[a-zA-Z0-9_-]*' -- styles.css src tools .storybook \| sort -u` |
| Files holding the name, tracked, excluding `specs/` and `main.js` | **131** (129 excluding `screenshots/`) | `git grep -l "note-database" -- . ':!specs' ':!main.js' \| wc -l` |
| Files under `tools/`, `.github/`, root docs holding the name | **46** | `git grep -l "note-database" -- tools .github README.md STORYBOOK.md AGENTS.md CHANGELOG.md \| wc -l` |
| `Note Database` display-string occurrences (excluding `specs/`) | **109**, of which **15** in `src/i18n.ts` across three locales | `git grep -o "Note Database" -- . ':!specs' ':!main.js' \| wc -l` |
| `noteDatabase` camel-case occurrences | **64** | `git grep -o "noteDatabase" -- . ':!specs' ':!main.js' \| wc -l` |
| Lines in the rewrite scope matching either family | **4,314** across **134** files | `git grep -c -E 'note-database\|\bdb-[a-zA-Z0-9_-]' -- styles.css src tools .storybook README.md manifest.json package.json screenshots/manifest.json` |
| Captures that re-derive | **1,467** PNGs | `git ls-files 'screenshots/**/*.png' \| wc -l` |
| `db_view` references — **excluded**, user data | **57** | `git grep -o "db_view" -- src tools \| wc -l` |

**The operator's figures and ours differ slightly and both are right.** The brief quoted 3,295
`note-database` references and 55 name-bearing files under `tools`/`.github`/README; measured on
`dc1d54a9` those read 3,375 and 46. The gap is the base commit and the exact file set, not a
disagreement — T003 re-runs the census on the leg's own base before any edit, and those numbers,
not these, are what AC-002 and AC-003 are checked against.

### Sizing

`recommend-level.sh --loc 4314 --files 134 --api --db --architectural` → **Level 3**, total 90/100,
confidence 95, `phase_score: 50`, `suggested_phase_count: 4`. The level is adopted; the phase count
is declined, on the record, in ADR-006.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Packet opened, census taken, six ADRs written | Done | This file, `spec.md`, `decision-record.md`; census commands above |
| Operator answers to §12 Q1-Q4 | **Done 2026-09-06 19:08** | `spec.md` §12; `decision-record.md` ADR-003; `tasks.md` T004 |
| The rename leg | Pending | Blocked on 0.0.30 and eight siblings (D7) |
| Fresh-vault smoke | Pending | `tasks.md` T020 |
| Release 0.0.31 | Pending | `tasks.md` T021 |

### Deviations and findings

| Item | Note |
|------|------|
| `recommend-level.sh` recommended 4 phases; this packet is one leg | The scale is real, the shape is not: four phases would mean four rebase windows across a tree whose every class name is moving. Declined in ADR-006 rather than absorbed |
| The release workflow needed no change | `.github/workflows/release.yml` attaches `main.js`, `manifest.json` and `styles.css` by fixed filename. Read, not assumed — recorded so a later reader does not go looking |
| `update-fork.sh` points at the wrong repository | `REPO="MichelKerkmeester/obsidian-note-database"` (`:12`), while origin is `MichelKerkmeester/obsidian--notion-clone`. A pre-existing defect the census surfaced, in a file the rename touches anyway. Q4, ruled **yes, fix it** on 2026-09-06 19:08 — T009 |
| `manifest.json` still credits pangy9 | `author`, `authorUrl` and `fundingUrl` are upstream's, from the fork point. Q2, ruled 2026-09-06 19:08: attribute to MichelKerkmeester, remove `fundingUrl`, credit upstream in the README. The fields move in **T005**; the README's fork line is the parallel leg's |
| The root README rewrite is somebody else's leg | A GLM leg is rewriting it in parallel and lands separately. This packet applies only the mechanical prefix rewrite to whatever is on `main` when its leg starts |
<!-- /ANCHOR:log -->
