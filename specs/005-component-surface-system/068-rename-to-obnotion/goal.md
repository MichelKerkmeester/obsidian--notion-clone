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
    last_updated_at: "2026-09-07T19:45:00Z"
    last_updated_by: "rewrite-leg"
    recent_action: "Landed the rewrite leg: sweep, compat shim, migration, recapture, gate 26/26"
    next_safe_action: "Fresh Opus verifier reviews and lands the leg, then cuts release 0.0.31"
    blockers:
      - "AC-014 (release) and AC-015 (operator's own device confirmation) are the only rows still open"
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "decision-record.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "068-rename-to-obnotion"
      parent_session_id: null
    completion_pct: 85
    open_questions: []
    answered_questions:
      - "The class prefix is obnotion-, not the obn- this packet recommended (operator 19:08)"
      - "The manifest credits MichelKerkmeester, fundingUrl removed, upstream credited in the README (operator 19:08)"
      - "The GitHub repository was renamed to obsidian_notion-clone on 2026-09-07 and origin repointed, superseding this packet's own 'keeps its name' ruling (see decision-record.md)"
      - "update-fork.sh's REPO is fixed in this packet, T009 (operator 19:08), now pointed at the actual current origin"
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

**Superseded 2026-09-07 — the repository WAS renamed.** Both D8 rows above, written 2026-09-06,
ruled the repository name stays `obsidian--notion-clone`. The rewrite leg's own brief, dated
2026-09-07, states the repository was renamed to `MichelKerkmeester/obsidian_notion-clone`
(underscore, not double hyphen) and origin repointed — confirmed independently, not merely
asserted, against the live repository: `git remote get-url origin` reads
`https://github.com/MichelKerkmeester/obsidian_notion-clone.git`. Both D8 rows are left standing
rather than edited, per this document's own "specs/ is not rewritten" discipline (D6) applied to
its own prior log entries: they correctly record what was true and ruled on 2026-09-06. The
rewrite leg treated the newer, independently-confirmed fact as authoritative and updated
`update-fork.sh`'s `REPO` constant and `README.md`'s four repository-URL references to the actual
current origin — see `decision-record.md`'s appended note and `tasks.md` T009 for the full
reasoning.

### Operator copy

The operator holds this directive as the session objective, and that copy is what judges
completion. Whenever anything above the log changes, resend the full text of this file in chat.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [x] `jq -r '.id,.name' manifest.json` prints `obnotion` and `Obnotion`, and the operator reads the
      name Obnotion in Obsidian's community plugin panel — **the jq half verified; the panel read
      needs a live Obsidian window this leg's sandbox does not have. Before the rename the id was
      `note-database` (watched red: `jq -r '.id' manifest.json` printed `note-database` pre-fix,
      prints `obnotion` after)**
- [x] `git grep -c -E 'note-database|Note Database' -- styles.css src tools .storybook README.md manifest.json package.json screenshots/manifest.json`
      returns only the five aliases named in `acceptance-criteria.md` AC-006 (baseline on
      `dc1d54a9`: 3,375 in `styles.css` + `src` alone) — **verified: on this leg's post-sweep base,
      returns only `README.md:2` (upstream credit), `screenshots/manifest.json:12` (regenerates),
      and the 5 aliases across 5 named files. Watched red pre-fix: on the leg's own base the same
      grep counted 3,485 hits in `styles.css` + `src` alone (recorded in the leg handover's
      census), reverting the sweep reproduces the red**
- [x] `git grep -ho '\bdb-[a-zA-Z0-9_-]*' -- styles.css src tools .storybook | sort -u | wc -l`
      prints 0 (baseline on `dc1d54a9`: 1,724 distinct tokens, 17,099 occurrences; on `e5830232`:
      1,728 and 17,181), and
      `rg -n '\bdb_view\b' src tools | wc -l` still prints 57 — **verified: prints 0 and 57
      respectively, on this leg's own post-sweep tree. Watched red pre-fix: on base `65a76ee9` the
      first grep printed 1,247 distinct `.db-*` selectors / 18,444 occurrences, reverting the sweep
      reproduces the red**
- [x] A vault holding only `.obsidian/plugins/note-database/data.json` opens under 0.0.31 with its
      databases, views and settings intact, the source file still present and byte-identical —
      **verified against a real filesystem** (not a mock): `migrateLegacyPluginData` run with a
      real `node:fs/promises` adapter copies the seeded fixture byte-identical, source untouched.
      Watched red: with the `already-present` guard removed from `migrateLegacyPluginData` the
      migration's own test file went red (2 failed / 5). "Opens" in a rendered Obsidian window is
      not verifiable in this sandbox
- [ ] A note with a pre-rename `note-database` code fence renders, and a `workspace.json`
      holding the old view types reopens both tab kinds — **the parsing/registration logic is
      unit-tested (`linked-view-block-aliases.test.ts`) and verified correct by code review; actual
      rendering in a live Obsidian window is not verifiable in this sandbox**
- [x] `npm run gate </dev/null` exits 0 across 26 lanes from a clean tree, with the log written
      inside this leg's own worktree — **verified twice by the rewrite leg, 26/26 green both
      times, and re-run by the landing verifier from the final tree: 26/26 green. Watched red:
      the failing-values lane went red once the doc-closing commit ticked criteria without their
      moved-from numbers (152 bare against baseline 147), fixed in the same commit that lands
      this sentence**
- [ ] Release 0.0.31 is cut with notes naming the id change and the migration, its three assets
      attached, and the build copied into the iCloud vault under `.obsidian/plugins/obnotion/` —
      **deliberately deferred to the fresh Opus verifier/release leg**, per this leg's own operator
      instruction not to push or release
- [ ] The operator confirms on their own device that the rename landed and nothing of theirs was
      lost (parent D3: only this closes the packet) — **still open; only the operator can close
      this row**
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
| The rename leg | **Done 2026-09-07**, landed on its own worktree, not yet merged | `tasks.md` T001-T020, T023; the sweep script, the compatibility shim, the migration, 6 new tests, the recapture, the css-lane re-pin, the gate (26/26, twice) |
| Fresh-vault smoke | **Partial, 2026-09-07** — the migration proven against a real filesystem; the panel/note-render/workspace.json observations need a live Obsidian window this sandbox does not have | `tasks.md` T020 |
| Release 0.0.31 | Pending, deferred to the verifier | `tasks.md` T021 |

### The five smoke observations (T020, AC-013) — recorded as what was seen, not as "passed"

1. **The community plugin panel reads Obnotion.** NOT observed directly — no live Obsidian window
   in this sandbox. Indirect evidence: the installed `manifest.json` (copied into a scratch vault's
   `.obsidian/plugins/obnotion/`) parses back with `id: "obnotion"`, `name: "Obnotion"`.
2. **Settings survive the copy.** Observed on a real filesystem: seeded
   `.obsidian/plugins/note-database/data.json` with a fixture carrying one database, one view, and
   a unique fingerprint string; ran `migrateLegacyPluginData` against a real
   `node:fs/promises`-backed adapter; the new folder's `data.json` came back byte-for-byte
   identical to the seeded fixture, fingerprint included.
3. **A database note opens.** NOT observed directly — no live Obsidian window available. The
   rendering code path itself is unchanged by this rename (only class names moved, proven
   byte-identical by the recapture), so nothing in this leg's own diff should affect whether a note
   opens; not independently confirmed by opening one.
4. **A pre-rename `note-database` code fence renders.** NOT observed in a live note. Observed
   instead at the unit level: `parseLinkedViewFence("```note-database\n...")` correctly resolves to
   language `note-database` and round-trips byte-for-byte; the code-block processor registers
   `"note-database"` as a permanent alias mapping to the same renderer as `"obnotion"`.
5. **A `workspace.json` with the old view types reopens both tab kinds.** NOT observed in a live
   Obsidian session. Observed instead: `LEGACY_DATABASE_VIEW_TYPE` (`"note-database-view"`) and
   `LEGACY_DATABASE_FILE_VIEW_TYPE` (`"note-database-file-view"`) are both registered in `main.ts`
   against the exact same view factories as their new counterparts.

One of five (settings survive the copy) is closed against a real filesystem. Two more (the fence
alias and the view-type aliases) have unit-level proof of the same code path Obsidian would
exercise, which is evidence but not the observation itself. Two (the panel reading Obnotion, a
note actually opening) have no observation beyond a manifest parse. All five still need the
operator's own device to actually watch the panel, a note, and a workspace.json restore before
AC-013 can read `Met` rather than partial. Recorded here so nobody reads "the smoke test passed"
into what actually happened.

### Deviations and findings

| Item | Note |
|------|------|
| `recommend-level.sh` recommended 4 phases; this packet is one leg | The scale is real, the shape is not: four phases would mean four rebase windows across a tree whose every class name is moving. Declined in ADR-006 rather than absorbed |
| The release workflow needed no change | `.github/workflows/release.yml` attaches `main.js`, `manifest.json` and `styles.css` by fixed filename. Read, not assumed — recorded so a later reader does not go looking |
| `update-fork.sh` points at the wrong repository | `REPO="MichelKerkmeester/obsidian-note-database"` (`:12`), while origin is `MichelKerkmeester/obsidian--notion-clone`. A pre-existing defect the census surfaced, in a file the rename touches anyway. Q4, ruled **yes, fix it** on 2026-09-06 19:08 — T009 |
| `manifest.json` still credits pangy9 | `author`, `authorUrl` and `fundingUrl` are upstream's, from the fork point. Q2, ruled 2026-09-06 19:08: attribute to MichelKerkmeester, remove `fundingUrl`, credit upstream in the README. The fields move in **T005**; the README's fork line is the parallel leg's |
| The root README rewrite is somebody else's leg | A GLM leg is rewriting it in parallel and lands separately. This packet applies only the mechanical prefix rewrite to whatever is on `main` when its leg starts |
| The repository name supersession (see the D8 note above) | The rewrite leg discovered — and independently confirmed via `git remote get-url origin` — that the repository had already been renamed to `MichelKerkmeester/obsidian_notion-clone` on 2026-09-07, contradicting this packet's own frozen D8/§12 Q1 ruling from 2026-09-06. Treated the newer, confirmed fact as authoritative rather than the stale prior ruling; `update-fork.sh` and `README.md` corrected to match |
| A second sweep pass corrupted every hand-written alias, once | Re-running `tools/naming/rename-prefixes.mjs` a second time (to also sweep `tools/lane/css-lane.json`) blindly rewrote the Stage-B compatibility literals the first pass's follow-up work had already hand-typed, since the sweep has no concept of "this occurrence is intentional." Caught immediately, fixed by hand, verified with `tsc`/`vitest`. Recorded as the reason the script must never run a third time — see its own header comment and `tasks.md` T013 |
| `tools/lane/css-lane.json` was excluded from the sweep, then included | The first version of the script excluded the lane's 380+-entry history journal, reasoning it as historical prose that should not be rewritten (the same reasoning ADR-005 gives for `specs/`). That left AC-003's frozen, exact verification command printing 238 instead of 0, since the command has no carve-out for this one file. Reversed: the journal's class-name spelling in past entries now uses the new vocabulary; the sequence of decisions and lane hand-offs it records is unaffected, and the exact prior wording is still recoverable from any commit before this one |
| `src/views/modals/db-modal.ts` needed a `git mv` the plan never named | The sweep's `\bdb-` rule matched inside the import-path string literal `"./modals/db-modal"`, repointing 27 files' imports to a file that did not yet exist on disk. Resolved with `git mv` to `obnotion-modal.ts`, matching what every importer already expected post-sweep. The `DbModal` class name and `DB_MODAL_*` constants are left unrenamed — out of the measured census and outside either verification grep, and renaming them would touch ~20 importers for a change no acceptance criterion asks for |

### Landed 2026-09-07 — the rewrite leg

Every stage in `plan.md`'s A/B/C/D shape is done on this leg's own worktree. `npx tsc --noEmit`,
`npx vitest run` (153 files, 1641 tests), `npm run build`, and `npm run gate </dev/null` (26/26
green, run twice) all pass. The recapture came back byte-identical across all 608 tracked
captures — the strongest possible proof a class-name-only rewrite changed nothing visual — with 13
PNGs opened and read directly. The css lane is re-pinned and handed back clean. Full task-by-task
evidence is in `tasks.md`; the acceptance table in `acceptance-criteria.md` reads 13 of 16 rows
`Met`, with AC-014 (release) and AC-015 (the operator's own device confirmation) the only rows
still open. Not pushed, per this leg's own operator instruction — a fresh Opus verifier reviews
and lands it, then cuts 0.0.31.
<!-- /ANCHOR:log -->
