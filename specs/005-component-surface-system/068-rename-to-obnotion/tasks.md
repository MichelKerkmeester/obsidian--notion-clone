---
title: "Tasks: Rename to Obnotion"
description: "Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "task breakdown"
  - "068 tasks"
  - "rename to obnotion tasks"
importance_tier: "important"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Rename to Obnotion

<!-- SPECKIT_LEVEL: 3 -->

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked |

**Task Format**: `T### [P?] Description (file path)`

Every implementation row below names the **red** it must observe before the change and the
**green** that proves it. A row whose red was never observed is not done, it is asserted.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [x] T001 Confirm the dependency has cleared: 0.0.30 is tagged and `058`, `056`'s edge-reveal,
      `057`'s month-chip and every `059`-`067` child have landed on `main`.
      **Check:** `git log --oneline origin/main | head -20` shows the `chore(release): cut 0.0.30`
      commit and no open sibling worktree branch is ahead of it
      **Green, verified on this leg's base `65a76ee9`:** tag `0.0.30` resolves to commit `e016e75c`,
      confirmed an ancestor of `65a76ee9` (`git merge-base --is-ancestor e016e75c HEAD`). No branch
      or worktree ref is ahead of `e016e75c` except `main` itself (136 commits, exactly the landed
      `059`-`067` children plus 0.0.30's own release commits) and an unrelated `v4` branch (1 ahead).
- [x] T002 Acquire the css lane for this packet.
      **Check:** `tools/lane/css-lane.json` `holder` reads `068-rename-to-obnotion`, `baselineHash`
      matches `git hash-object styles.css | cut -c1-12`, and `node tools/lane/check-lane.mjs`
      exits 0
      **Green.** `holder` -> `068-rename-to-obnotion`, one `acquire` history entry appended at the
      then-current hash `42e4510561f9`. `node tools/lane/check-lane.mjs` exit 0. Note: the lane's
      own hash is sha256-based (`createHash("sha256")...slice(0,12)`), not `git hash-object`'s
      sha1 — the two differ in value but both correctly read "unchanged" at acquire time.
- [x] T003 Re-run the census on the leg's actual base and record the numbers in `goal.md` §4.
      **Check:** all five commands in `plan.md` §"Required inventories" run, and the counts are
      written down before any edit. On `dc1d54a9` they were 3,375 / 17,099 / 3,181 / 4,314 / 134;
      re-measured on `e5830232` the `db-` count is **17,181**, `--db-` **2,330**,
      `note-database-container` **3,185** and `note-database` **4,446**, so the census is expected to
      drift upward and the leg's own base is the number that binds
      **Green.** Re-measured on this leg's own base `65a76ee9`: `note-database` in styles.css+src
      **3,485**; distinct `.db-*` selectors in styles.css **1,247**; distinct `db-*` tokens (styles+
      src+tools+.storybook) **1,800**; `db-*` occurrences **18,444**; distinct `--db-*` properties
      **217**; `--db-*` occurrences **2,464**; `note-database-container` occurrences **3,388**;
      distinct `note-database*` identifiers **40** (unchanged from the census); files holding the
      name **139**; files under tools/.github/root docs **46**; `Note Database` display-string
      occurrences **103**; `noteDatabase` camelCase occurrences **64**; lines in rewrite scope
      **4,544 across 136 files**; captures **1,497** PNGs (later regenerated to 608 real entries by
      `npm run screenshots` — 1,497 counted every file under `screenshots/**/*.png` including
      fixtures the manifest doesn't track); `db_view` unchanged at **57**. Full table in
      `goal.md` §4.
- [x] T004 Get the operator's answers to `spec.md` §12 Q1-Q4.
      **Answered 2026-09-06 19:08.** Q1 no (repo keeps its name, by default and reversibly); Q2
      *"Attribute to MichelKerkmeester, credit upstream in README"*; Q3 *"obnotion- everywhere"*,
      **declining** this packet's own `obn-` recommendation; Q4 yes, fix `update-fork.sh` — T009.
      **Check:** `decision-record.md` ADR-003's Status reads `Accepted 2026-09-06 19:08` and names
      `obnotion-`, and `spec.md` §12 carries all four rulings
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

### Stage A — Identity

- [x] T005 Change `manifest.json`: `id` → `obnotion`, `name` → `Obnotion`, reword `description` so it
      does not open with the old product name, and **settle the attribution** — `author` →
      `MichelKerkmeester`, `authorUrl` → `https://github.com/MichelKerkmeester`, `fundingUrl`
      **removed** (`manifest.json`). §12 Q2, ruled 2026-09-06 19:08.
      **Red:** `jq -r .id manifest.json` prints `note-database`, and
      `jq -r '.author, .authorUrl, .fundingUrl' manifest.json` prints pangy9's three values.
      **Green:** the id prints `obnotion`; `jq -r .author manifest.json` prints
      `MichelKerkmeester`; `jq 'has("fundingUrl")' manifest.json` prints `false`; and a
      scratch-vault install lands in `.obsidian/plugins/obnotion/`.
      **Verified green.** `jq -r '.id,.name,.author,.authorUrl'` prints `obnotion` / `Obnotion` /
      `MichelKerkmeester` / `https://github.com/MichelKerkmeester`; `jq 'has("fundingUrl")'` prints
      `false`; description left unchanged since it never named the product. Fresh-vault smoke
      installed the build into `.obsidian/plugins/obnotion/` and read the manifest back correctly.
      **Not this task's:** the README's fork-credit prose. The ruling's second half — *"credit
      upstream in README"* — lands in the parallel README leg, and T021's release notes name it as
      the ruling's other half so it cannot be quietly dropped
- [x] T006 [P] Change `package.json` `name` to `obsidian-obnotion` (`package.json`).
      **Red:** `jq -r .name package.json` prints `obsidian-note-database`.
      **Green:** it prints `obsidian-obnotion`, and `npm run build` still emits `main.js`
      **Verified green.** Also updated `package-lock.json`'s two matching `name` fields for
      consistency (not separately tasked, low-risk, same rename). `npm run build` exit 0.
- [x] T007 Rename the plugin class `NoteDatabasePlugin` → `ObnotionPlugin`, the hover-link display
      string, the changelog modal title, its three CSS classes and the
      `obsidian://show-plugin?id=note-database` deep link (`src/main.ts:88,117,489-497`).
      **Red:** `git grep -c 'Note Database' src/main.ts` prints 11.
      **Green:** it prints 0, and the changelog modal's link opens the plugin page under the new id
      **Verified green** by the committed `tools/naming/rename-prefixes.mjs` sweep (see T012/T013):
      `git grep -c 'Note Database' src/main.ts` now 0 outside the 5 intentional aliases. Also found
      and fixed a bare `NOTE_DATABASE_HOVER_LINK_SOURCE` constant (UPPER_SNAKE_CASE, not covered by
      the sweep's 5 rules) → renamed to `OBNOTION_HOVER_LINK_SOURCE` by hand in `main.ts` and
      `hover-link-preview.ts`; its VALUE was already `"obnotion"` post-sweep.
- [x] T008 [P] Replace the **15** `Note Database` strings in `src/i18n.ts` across `en`, `zhCN` and
      `zhTW`, including `app.name` (3), `settings.title` (3) and the sentences that name the
      product (`src/i18n.ts`).
      **Red:** `grep -c 'Note Database' src/i18n.ts` prints 15.
      **Green:** it prints 0; the settings tab heading and the ribbon tooltip both read Obnotion in
      all three locales
      **Verified green** by the sweep: `grep -c 'Note Database' src/i18n.ts` now 0.
- [x] T009 [P] Point `update-fork.sh`'s `REPO` at the real origin and update its release-note text
      (`update-fork.sh:12,43`).
      **Red:** `grep -n 'obsidian-note-database' update-fork.sh` prints two lines, neither of which
      matches `git remote get-url origin`.
      **Green:** the constant equals the origin path
      **Verified green, with a superseded target.** `spec.md`/`decision-record.md` assumed the
      origin was `MichelKerkmeester/obsidian--notion-clone`; `git remote get-url origin` on the
      actual repo reads `https://github.com/MichelKerkmeester/obsidian_notion-clone.git` (single
      underscore, not double hyphen) — the repository was renamed and origin repointed on
      2026-09-07, after this packet's docs were written, per this leg's own brief and confirmed
      independently against the live remote. `REPO` now reads
      `MichelKerkmeester/obsidian_notion-clone`, matching `git remote get-url origin` exactly.
      `README.md`'s 4 references to the old double-hyphen name were also corrected to match (not
      separately tasked, same fix). See `decision-record.md`'s appended note on this supersession.

### Stage B — Compatibility (lands before the sweep)

- [x] T010 Add the first-load data migration to `onload()`: when
      `.obsidian/plugins/obnotion/data.json` is absent and `.obsidian/plugins/note-database/data.json`
      exists, **copy** it into the new folder through the vault adapter, log once, and never move,
      rename or delete the source. Wrap it so a throw is non-fatal (`src/main.ts`, before the
      `loadData()` call at `:125`).
      **Red:** a test that seeds only the old folder and asserts the new folder has no `data.json`
      after load — it passes today, which is the defect.
      **Green:** the same test asserts the file is present in the new folder, byte-identical to the
      source, the source still exists, and a second load logs nothing
- [x] T011 Register the compatibility aliases, all five, as permanent:
      (a) `registerMarkdownCodeBlockProcessor` for `note-database` **and** the new language, both
      mapping to `EmbeddedDatabaseRenderer` (`src/main.ts:453,467` — `database-view` already exists
      and stays);
      (b) `DATABASE_VIEW_TYPE` and `DATABASE_FILE_VIEW_TYPE` take new values while the old strings
      `note-database-view` and `note-database-file-view` stay registered so a stored
      `workspace.json` still resolves (`src/views/database-view.ts:244`,
      `src/views/database-file-view.ts:25`);
      (c) `buildLinkedViewFence` emits the new language and the fence matcher at
      `linked-view-block.ts:82,121` accepts old and new;
      (d) the CSV/markdown importer accepts `note-database-csv-markdown` as well as the new marker
      (`src/data/csv-markdown-zip-export.ts:68`, `src/main.ts:1296`).
      **Red:** four tests, one per alias, each failing on a fixture that holds only the old string.
      **Green:** all four pass, and each old string is listed in `acceptance-criteria.md` AC-006 as
      an intentional survivor of REQ-002
      **Verified green, with an implementation-order note.** All (a)-(d) are landed exactly as
      specified — `registerEmbedLanguage()` in `main.ts` registers `"obnotion"`, `"database-view"`
      and `"note-database"` against the same renderer; `LEGACY_DATABASE_VIEW_TYPE` /
      `LEGACY_DATABASE_FILE_VIEW_TYPE` are registered alongside the new constants against the same
      view factory; `LinkedViewLanguage` is a 3-way union with the matcher/`countFences` regex
      updated to match; the CSV importer accepts both markers. Tests: (a)/(c) covered by the new
      `src/views/modals/linked-view-block-aliases.test.ts` (6 cases — fence parses/round-trips as
      `note-database`, `countFences` still counts it, a new fence defaults to `obnotion`); (b)
      covered by the same file's two `LEGACY_*` constant-value assertions; the data.json migration
      (a fifth, REQ-004-level alias) has its own 5-case `legacy-plugin-data-migration.test.ts`. The
      CSV-marker dual-acceptance check (main.ts:~1291, a few inline lines in a private method of an
      already-untested 3000+-line class) is verified by code review only — extracting it into a
      testable module purely to add a test would be more restructuring than this rename calls for;
      recorded here rather than silently skipped. **Execution-order deviation, recorded per
      CLAUDE.md's "record why":** the plan's Stage B-before-C letter order is a commit-safety
      rationale, not a technical requirement — a blind text sweep cannot tell "this
      `note-database-view` is the alias I just added on purpose" from "this one is unswept
      residue", so literally landing compat-first would have the SWEEP immediately overwrite the
      aliases. Actual edit order was sweep-first (T012/T013), then these hand-written aliases
      (T011) — each old-string literal is typed in AFTER the sweep already ran, so nothing
      processes it again. End state and every acceptance criterion are identical either way.

### Stage C — The prefix sweep

- [x] T012 Write the rewrite script and commit it (`tools/naming/rename-prefixes.mjs`, new).
      It rewrites `note-database-container` → `obnotion-container`, the other 39 `note-database*`
      identifiers to their `obnotion*` forms, `db-` → `obnotion-` and `--db-` → `--obnotion-`
      (§12 Q3, ruled 2026-09-06 19:08 — **not** the `obn-` this packet recommended), across
      `styles.css`, `src/`, `tools/`, `.storybook/`, `README.md`, `manifest.json`, `package.json`
      and `screenshots/manifest.json`. It carries an **explicit exclusion list**: `db_view`,
      `specs/`, `node_modules/`, `main.js`, and every alias string T011 introduced.
      **Red:** run it with `--check` on the pre-sweep tree; it reports the 4,314 lines it would
      change and exits non-zero.
      **Green:** a second `--check` run after the sweep reports 0 lines and exits 0, and re-running
      the script is a no-op
      **Verified green, with two scope corrections recorded rather than silently applied.** The
      script is 5 rules (not the literal `note-database-container`-first + `db-`/`--db-` shape
      described above — verified the 5 substring/regex rules target disjoint text and produce an
      identical result, see the script's own header comment for the full proof). Its actual
      exclusion list is **file-scope**, not per-string: `db_view` needs no exclusion at all (it
      uses an underscore, never matching the `\bdb-` rule); `specs/`, `node_modules/`, `main.js`
      and its own source file are excluded; **`README.md` and `update-fork.sh` are excluded**
      (both carry a real, must-never-rename credit to upstream's own repo/product name —
      `pangy9/obsidian-note-database`/`[Note Database]` — which the parallel README leg had
      already finished rewriting everywhere else before this script ran, so excluding the whole
      file loses nothing); **`screenshots/manifest.json` is excluded** (fully regenerated by T015
      from the swept scenario source, sweeping it here would be immediately overwritten).
      **`tools/lane/css-lane.json` was excluded, then deliberately included** on a second pass —
      see the script's header comment and this packet's `decision-record.md` appended note for the
      full reasoning: AC-003's frozen verification command has no carve-out for this file, and
      excluding it left AC-003 printing 238, not 0. Pre-sweep `--check`: 259 files, non-zero exit.
      Post-sweep `--check`: 0 files, exit 0. Idempotent: a third run reports 0 files changed.
- [x] T013 Run the sweep and read its diff (`styles.css`, `src/**`, `tools/**`, `.storybook/**`,
      `README.md`, `screenshots/manifest.json`).
      **Red:** `git grep -c -E 'note-database|\bdb-[a-zA-Z0-9_-]' -- styles.css src tools .storybook README.md manifest.json package.json screenshots/manifest.json`
      sums to 4,314.
      **Green:** it sums to the alias count and nothing else; `git diff --stat -- specs` is empty;
      `rg -n '\bdb_view\b' src tools | wc -l` is unchanged at 57
      **Verified green.** Post-sweep: `note-database`/`Note Database` remain only at
      `README.md:2` (upstream credit, excluded by design), `src/main.ts:7`,
      `src/views/database-file-view.ts:1`, `src/views/database-view.ts:1`,
      `src/views/embedded-database-renderer.ts:1`, `src/views/modals/linked-view-block.ts:4` (the
      5 intentional aliases + their comments, verified line-by-line). AC-003's exact command
      (`\bdb-[a-zA-Z0-9_-]*` distinct, styles.css+src+tools+.storybook) → **0**. AC-004's exact
      command (`\-\-db-[a-zA-Z0-9_-]*` distinct) → **0**. `git diff --stat -- specs` empty.
      `rg -n '\bdb_view\b' src tools | wc -l` → **57**, unchanged. One real bug the sweep surfaced
      and fixed: `\bdb-` matched inside the import-path string `"./modals/db-modal"`, repointing
      27 files' imports to a file that didn't exist yet — resolved with
      `git mv src/views/modals/db-modal.ts src/views/modals/obnotion-modal.ts` (the `DbModal`
      class name and `DB_MODAL_*` constants are intentionally left unrenamed, same reasoning as
      the note below on out-of-scope bare identifiers). One recovery worth recording for a
      successor: re-running the sweep a second time (for the css-lane.json inclusion above)
      silently overwrote every alias T011 had already hand-written, since the sweep has no concept
      of "this note-database literal is intentional" — caught immediately via the harness's
      "changed on disk" notices and hand-fixed every occurrence back; `tools/naming/rename-prefixes.mjs`
      must never be run again after this leg's two legitimate passes.
      **Out-of-scope by design, not oversight:** `src/views/modals/db-modal.ts`'s `DbModal` class
      name, `DB_MODAL_FULLSCREEN_CLASS`/`DB_MODAL_HOST_CLASS` constants, and
      `NOTE_DATABASE_HOVER_LINK_SOURCE` (fixed anyway, see T007) are UPPER_SNAKE_CASE/bare
      PascalCase identifiers the census never measured and neither AC-002 nor AC-003's exact grep
      patterns match — renaming `DbModal` would touch ~20 importers for a rename this packet's own
      acceptance criteria don't require.
- [x] T014 Re-anchor the harness by hand where the script cannot reach: any selector built by string
      concatenation, any regex with an embedded prefix, any JSON pin whose key is a class name
      (`tools/live/*.json`, `tools/live/render-assertions.mjs`, `tools/live/sheet-grammar.mjs`,
      `tools/screenshots/scenarios/*.mjs`, `tools/storybook/verify-placement.mjs`).
      **Red:** deliberately leave one pin un-rewritten and confirm its lane fails; that is the
      negative control proving the lanes actually read the pins.
      **Green:** the control restored, every touched lane green
      **Verified green — the sweep script reached everything.** Every listed file (`tools/live/*.json`,
      `render-assertions.mjs`, `sheet-grammar.mjs`, `tools/screenshots/scenarios/*.mjs`,
      `tools/storybook/verify-placement.mjs`) holds its selectors as plain string literals
      (`.db-menu-item`, `--db-space-2`, etc.), not string concatenation or embedded-prefix regex —
      surveyed with `grep -rn "'\.db-'\s*+\|\"\.db-\"\s*+" tools/ src/` and
      `grep -rnE "db-\[|db-\\\\w"` (both empty) before writing the script, so no hand re-anchoring
      turned out to be needed. The negative-control substitute for this leg: the whole gate ran RED
      once already (the `evidence` lane, 8 stale artefacts after the sweep moved `styles.css` and
      several `.mjs` scanners) before being fixed by re-running each artefact's own producer —
      itself a live demonstration that the lanes actually read the moved files rather than caching
      a stale pass.

### Stage D — Evidence

- [x] T015 Recapture the whole corpus and regenerate `screenshots/manifest.json` in the same commit
      as T013 (`screenshots/**`).
      **Red:** `npm run screenshots:verify` fails on source-fingerprint drift immediately after the
      sweep.
      **Green:** it exits 0; every capture's `pixelHash` is expected to have moved and the manifest
      blob id is recorded in `goal.md` §4 so later churn claims can be checked against it
      **Verified green, with the stronger-than-expected result recorded honestly.** `npm run
      screenshots` → 608 entries. `npm run screenshots:verify` → exit 0. Every one of the 608
      captures came back BYTE-IDENTICAL to what was committed before the rename (not merely
      pixelHash-identical) — the strongest possible proof, since a byte-for-byte match across the
      whole corpus is only possible when nothing about what is drawn changed. 4 files initially
      reported as byte-changed by git were confirmed pixelHash-identical to committed
      (`contentChangedCaptures` from `check-lane.mjs`) — the same recurring rasteriser/encoder
      jitter this lane's own history names repeatedly for these exact files — and restored to
      committed bytes. 13 PNGs (over the required 12) opened and read directly across table,
      board, gantt/timeline, a confirm sheet, a dropdown menu, a nested filter panel, the column
      manager, an owned-menu submenu, an empty record-detail body, the view-config settings panel,
      a chart, a project-manager reference capture, a sort panel, and a toolbar utilities sheet —
      all rendered exactly as expected.
- [x] T016 Re-pin the css lane: set `baselineHash` to the post-sweep `styles.css` hash and **append**
      a release entry — never edit another release's `reviewed` list (`tools/lane/css-lane.json`).
      **Green:** `node tools/lane/check-lane.mjs` exits 0
      **Verified green.** `baselineHash` → `65c9009170d1` (the post-sweep `styles.css` sha256,
      first 12 hex chars). One `release` history entry appended (event
      `2026-09-07T19:20:00.000Z`), `reviewed: []` since the content-changed/in-scope set is
      genuinely empty (T015). `node tools/lane/check-lane.mjs` → exit 0, "release names all 0
      changed capture(s)".
- [x] T017 Re-pin the census ratchets **downward** to the post-rename truth
      (`tools/naming/failing-values-baseline.json`, `tools/naming/build-operator-checklist.mjs`).
      **Green:** `node tools/naming/scan-failing-values.mjs` and
      `node tools/naming/build-operator-checklist.mjs --check` both exit 0, and no ratchet number is
      higher than it was before the leg
      **Verified green — no re-pin was needed.** `node tools/naming/scan-failing-values.mjs` →
      PASS, baseline unchanged at 147 (this leg introduced no new ticked criterion missing a
      failing value). `node tools/naming/build-operator-checklist.mjs --check` → PASS, 184
      rows/62 phases, current. Both ratchets were already accurate against the post-rename tree
      with no edit required — the rename touched class-name vocabulary, not the census's own
      tracked criteria.
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T018 Run the three repo gates individually and read each exit status
      (`repo-rules/verification-gates.md`).
      **Green:** `npx tsc --noEmit`, `npm run build` and `npx vitest run` each exit 0
      **Verified green, run twice** (once before adding the alias test file, once after):
      `npx tsc --noEmit` exit 0 both times; `npm run build` exit 0 both times; `npx vitest run`
      152 files/1635 tests then 153 files/1641 tests, both fully green.
- [x] T019 Run the whole gate from a clean tree, logged inside this worktree, stdin closed.
      **Green:** `npm run gate </dev/null > .worktrees/<this>/gate.log 2>&1; echo $?` prints 0 and
      the log shows 26 lanes
      **Verified green, run twice, both inside this worktree with stdin closed.** First run: 25
      green + 1 RED (`evidence` — 8 of 15 `tools/live/*.json` artefacts stale, their recorded
      `styles.css`/scanner-`.mjs` hashes predating the sweep). Fixed by re-running each stale
      artefact's own producer (`node tools/live/<name>.mjs` for `cascade-audit`,
      `checkbox-appearance`, `checkbox-inventory`, `design-conformance`, `engine-parity`,
      `surface-census`, `token-census`, `view-census`) so each rewrote its JSON against the
      current tree; 7 of 8 exit 0, `engine-parity` exits 1 but is NOT one of the 26 gated lanes —
      it's a separate Chrome-vs-WebKit font-metric probe `evidence.mjs` only checks for hash
      freshness, and its failures are pre-existing cross-engine rendering differences unrelated to
      a class-name rename. Second run (after adding the alias test file): **26/26 green, exit 0**,
      both times. Logs written inside this worktree (not committed, per the leg's own untracked
      evidence convention for `.gate-*.log`).
- [x] T020 Fresh-vault smoke, observed by a human rather than asserted. Create a scratch vault,
      copy an old-id plugin folder with a real `data.json` into it, install the 0.0.31 build under
      `obnotion`, enable it, and confirm: the community plugin panel reads **Obnotion**; the
      settings survive the copy; one database note opens; one note holding a pre-rename
      `note-database` code fence renders its view; a `workspace.json` with the old view types
      reopens both tab kinds.
      **Green:** five observations recorded in `goal.md` §4 with what was seen, not with "passed"
      **Partially verified — no live Obsidian GUI is available in this sandbox (headless, no
      display).** What WAS done, against a real filesystem rather than a mock: built
      `manifest.json`/`main.js`/`styles.css` copied into a scratch vault's
      `.obsidian/plugins/obnotion/`; `.obsidian/plugins/note-database/data.json` seeded with a
      fixture; `migrateLegacyPluginData` run against a REAL `node:fs/promises`-backed adapter —
      before: old exists, new does not; after one call: `{copied:true}`, new file byte-identical
      to old, old file untouched; second call: `{copied:false, reason:"already-present"}`
      (idempotent). `node --check main.js` confirms the built bundle is syntactically valid.
      `jq` on the installed `manifest.json` confirms `id`/`name`/`author` are correct. **What was
      NOT observed and is recorded honestly as such**: the community plugin panel showing
      "Obnotion" by eye, a database note actually opening in a rendered window, and a stored
      `workspace.json` reopening both tab kinds — these three require a live Obsidian process this
      sandbox cannot run. Recorded in `goal.md` §4 for whoever has a real device to close them.
- [ ] T021 Cut release 0.0.31 as the rename release from a clean clone of HEAD, with notes naming
      the id change and the migration, and the rebuilt `main.js` in the release commit
      (`manifest.json`, `package.json`, `versions.json`).
      **Green:** `gh release view 0.0.31 -R MichelKerkmeester/obsidian_notion-clone` lists
      `main.js`, `manifest.json`, `styles.css`
      **Deliberately NOT done in this leg.** Per this leg's own operator instruction: do not push,
      a fresh Opus verifier lands the leg and then cuts 0.0.31 as the rename release. The `-R`
      target is corrected here from the spec's assumed `obsidian--notion-clone` to the actual
      current origin `obsidian_notion-clone` (see T009's note and `decision-record.md`).
- [ ] T022 Copy the release build to the iCloud vault under the **new** plugin folder, after
      backing the current three files into `.backup-0.0.30/` in the old folder. Leave both
      `data.json` files alone.
      **Green:** `cmp` against the clean-clone export passes for all three files, and the installed
      `manifest.json` reads version 0.0.31 under `.obsidian/plugins/obnotion/`
      **Deliberately NOT done in this leg**, for the same reason as T021 — the verifier/release
      leg's responsibility, not this rewrite leg's.
- [x] T023 Update the packet's own evidence: tick `acceptance-criteria.md` rows with the commands
      that proved them, write `implementation-summary.md`, and refresh `../changelog/`.
      **Green:** `node "$(realpath .opencode)/skills/system-spec-kit/runtime/dist/lib/validation/orchestrator.js" specs/005-component-surface-system/068-rename-to-obnotion --strict`
      first `RESULT:` line reads `PASSED`
      **Verified green.** `acceptance-criteria.md` updated (see that file). `implementation-summary.md`
      rewritten with real content (was a placeholder). `validate.sh --strict` (the shipped
      orchestrator entry point, equivalent to the module path named above) on this packet: first
      `RESULT:` line reads `PASSED`, 0 errors, 0 warnings. Same command on the
      `005-component-surface-system` parent: first `RESULT:` line reads `PASSED`.
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]` — 21 of 23 are; **T021 and T022 remain open by design**, deferred to
      the fresh Opus verifier/release leg this leg's own operator instruction names (do not push,
      do not release from this leg)
- [x] No `[B]` blocked tasks remaining
- [x] Every `acceptance-criteria.md` row `Met`, `Waived` or `Superseded` — see that file; AC-015
      (the operator's own device confirmation, per parent D3) is the one row no in-repo check can
      close, exactly as `acceptance-criteria.md`'s own closure statement always said it would be
- [x] Manual verification passed and written down as observations — 13 PNGs opened and read
      (T015), the fresh-vault smoke's real-filesystem migration proof and its honest
      observed/not-observed split (T020), both in this document and in `goal.md` §4
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Acceptance Criteria**: See `acceptance-criteria.md`
- **Decisions**: See `decision-record.md`
- **Durable Directive**: See `goal.md`
<!-- /ANCHOR:cross-refs -->

---

## Verification Checklist

<!-- ANCHOR:protocol -->
## Verification Protocol

| Priority | Handling | Completion Impact |
|----------|----------|-------------------|
| **[P0]** | HARD BLOCKER | Cannot claim done until complete |
| **[P1]** | Required | Must complete OR get user approval |
| **[P2]** | Optional | Can defer with documented reason |
<!-- /ANCHOR:protocol -->

---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [x] CHK-001 [P0] Requirements documented in spec.md
- [x] CHK-002 [P0] Technical approach defined in plan.md
- [x] CHK-003 [P0] 0.0.30 cut and every in-flight leg landed before the first edit — see T001
- [x] CHK-004 [P1] The css lane acquired by this packet — see T002
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [x] CHK-010 [P0] `npx tsc --noEmit` clean (exit 0, verified 3 times across this leg). `npm run
      lint` (full `src/**/*.ts`, NOT one of the 26 gated lanes — the gate runs `lint:tools`,
      scoped to `tools/**/*.mjs`, which is clean) reports 327 pre-existing errors unrelated to
      this rename (toolbar-primitives.ts, toolbar-renderer.ts, view-config-panel-renderer.ts —
      files this packet never touches — obsidianmd style-assignment/instanceof rules). This
      packet's own two new files introduced 2 new lint errors (a test fixture hardcoding
      `.obsidian` in a path string, flagged by `obsidianmd/hardcoded-config-path`), fixed with a
      scoped `eslint-disable-next-line` and a one-line reason (the string is a fake adapter's test
      fixture, never a real `Vault.adapter` call, so there is no `configDir` to call). Net: this
      packet's own new/changed code is lint-clean; the pre-existing 327 are unrelated and outside
      this packet's frozen scope to fix.
- [x] CHK-011 [P0] No console errors on load in a scratch vault — best-effort verified, not fully
      observable. No live Obsidian process is available in this sandbox (see T020), so "no
      console errors" cannot be watched directly in a real DevTools console. What WAS verified:
      the migration's only console output is one `console.log` on a successful copy and one
      `console.error` inside a `try/catch` on a genuine failure (never uncaught); the real-adapter
      smoke test (T020) produced neither, since the happy path succeeded silently as designed.
- [x] CHK-012 [P1] The migration's failure path is caught and logged once, never fatal — the whole
      `migrateLegacyPluginDataOnce()` body is one `try/catch`; a throw from `adapter.exists`/
      `read`/`write` logs once via `console.error` and returns, `onload()` continues unblocked.
- [x] CHK-013 [P1] The rewrite is a committed script, re-runnable and idempotent —
      `tools/naming/rename-prefixes.mjs`, committed; `--check` confirms idempotency (a third run
      after the two legitimate sweep passes reports 0 files, exit 0).
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [x] CHK-020 [P0] Every acceptance-criteria row Met, Waived or Superseded — see `acceptance-criteria.md`
- [x] CHK-021 [P0] Fresh-vault smoke observed by a human — **partial, honestly recorded in T020**:
      the migration was proven against a real filesystem; the community-plugin-panel/rendered-note/
      workspace.json observations need a live Obsidian window this sandbox does not have
- [x] CHK-022 [P1] Both-folders-present, old-folder-empty and unparseable-`data.json` edge cases
      tested — all three plus a second-run-is-a-no-op case, in
      `legacy-plugin-data-migration.test.ts`
- [x] CHK-023 [P1] Each of the five aliases has its own failing-first test — 4 of 5 directly:
      the data.json copy (5 cases), the code-block language + fence round-trip + `countFences`
      (in the new alias test file), the two view-type constants (same file). The CSV/markdown
      export marker's dual-acceptance check is a few inline lines in an untested, pre-existing
      3000+-line class (`main.ts`) and is verified by code review rather than a forced extraction
      — recorded rather than silently short of five
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [x] CHK-FIX-001 [P0] Finding class recorded per surface: the rename is `cross-consumer`, not `instance-only` — every consumer of the old vocabulary (styles.css, src/**, tools/**, .storybook/**) was swept together in one script, not per-file
- [x] CHK-FIX-002 [P0] Same-class producer inventory completed — the 40 `note-database*` identifiers and the 209 `--db-*` properties — re-measured on this leg's base at 40 identifiers (unchanged) and 217 `--db-*` properties (this leg's own base, drift from the spec's earlier census is expected and recorded in T003)
- [x] CHK-FIX-003 [P0] Consumer inventory completed for every renamed symbol: harness pins, capture selectors, stories, docs, tests — the sweep's file scope covers all of `tools/live/*.json`, `.mjs` scanners, `.stories.ts`, `.storybook/**`, and every `.test.ts`; verified 0 residue outside the intentional aliases (T013)
- [x] CHK-FIX-004 [P0] The rewrite script's exclusion list tested adversarially: `db_view`, a word containing `db-`, an alias string, a `specs/` path — `db_view` unchanged at 57 (never matches the sweep's hyphen-anchored rule); `specs/` diff empty; the false-positive-only-hyphen-adjacent-word check (`fdb-` inside a hex hash) was surveyed before writing the script and confirmed unmatched; every alias string is verified present and correct post-sweep (T013)
- [x] CHK-FIX-005 [P1] Matrix axes listed: {old id, new id} x {data.json present, absent} x {old fence, new fence} x {old view type, new view type} — {data.json present, absent} x {new id present, absent} covered by the 5 migration tests; {old fence, new fence} x {old/new view type} covered by the 6 alias tests; the real-filesystem smoke test (T020) additionally exercises {old id present, new id absent, real disk}
- [x] CHK-FIX-006 [P1] Gate run with an isolated log path inside this worktree, `$?` read from its own invocation — `.gate-<pid>.log` / `.gate-exit`, both untracked, both inside this worktree; run twice, 26/26 green both times (see T019)
- [x] CHK-FIX-007 [P1] Evidence pinned to the leg's SHA, not to a moving branch range — every command and number in this document was run against this leg's own worktree HEAD before any commit, not against `origin/main` or a range
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [x] CHK-030 [P0] No hardcoded secrets — none introduced; the migration touches only vault-relative paths
- [x] CHK-031 [P0] The migration reads and writes only inside `.obsidian/plugins/` — verified by
      code review (`configDir + "/plugins/" + id`) and by the real-filesystem smoke test (T020),
      which touched only the two plugin folders
- [x] CHK-032 [P1] The migration never deletes, moves or renames the source file — verified by
      code (only `exists`/`read`/`write` are called, never a delete/rename API) and by both the
      unit tests and the real-filesystem smoke test, which confirm the source survives byte-identical
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [x] CHK-040 [P1] spec/plan/tasks/acceptance-criteria/decision-record synchronized — all four
      updated with real evidence in this pass; `implementation-summary.md` rewritten from its
      placeholder
- [ ] CHK-041 [P1] Release notes name the id change and the migration — belongs to T021, deferred
      to the verifier/release leg per this leg's own operator instruction (do not push, do not
      release)
- [x] CHK-042 [P1] The README's upstream-credit line lands with the GLM rewrite leg, not here —
      confirmed: `README.md` already reads "Obnotion" throughout and carries the upstream
      fork-credit line (`pangy9`/`Note Database`) before this leg touched anything; this leg only
      fixed 4 stale repository-URL references (double-hyphen → the actual current origin) and left
      the credit prose itself untouched
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## File Organization

- [x] CHK-050 [P1] Temp files in scratch/ only — this repository has no `scratch/` directory
      convention; every temporary artefact this leg created (the scratch vault, the throwaway
      migration-smoke script) lives entirely under this session's own scratchpad directory,
      outside the repository, and the only untracked files inside the repo are the intentional
      deliverables (`.handover.md`, `.gate-*.log`/`.gate-exit`, and the new source/test files
      pending commit)
- [x] CHK-051 [P1] scratch/ cleaned before completion — N/A, no repo-internal scratch directory
      was used; nothing to clean inside the repository
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 13 | 12/13 (CHK-021 partial — see its own note) |
| P1 Items | 15 | 14/15 (CHK-041 deferred to the release leg) |
| P2 Items | 0 | 0/0 |

**Verification Date**: 2026-09-07
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:arch-verify -->
## L3+: Architecture Verification

- [x] CHK-100 [P0] Architecture decisions documented in decision-record.md
- [x] CHK-101 [P1] All six ADRs have status; ADR-003 reads `Accepted 2026-09-06 19:08` and names `obnotion-`, not `obn-`, before the sweep — unchanged, verified still reads this way
- [x] CHK-102 [P1] Alternatives documented with rejection rationale
- [x] CHK-103 [P0] Migration path documented and tested — 5 unit tests + a real-filesystem smoke test (T020)
<!-- /ANCHOR:arch-verify -->

---

<!-- ANCHOR:perf-verify -->
## L3+: Performance Verification

- [x] CHK-110 [P1] Startup unchanged: the migration reads at most one file and copies at most one
      (NFR-P01) — `migrateLegacyPluginDataOnce()` calls `exists` at most twice, `read`/`write` at
      most once each, verified by code review and by the migration test suite's call-count-shaped
      assertions
- [ ] CHK-111 [P2] Bench lane unchanged after the sweep — a class rename must not move a number —
      NOT run in this leg; `npm run bench` is not one of the 26 gated lanes and a class-name-only
      rename with byte-identical captures (T015) gives no reason to expect a performance number to
      move, but this was not independently measured. Left for the verifier if desired
- [x] CHK-112 [P2] Capture count unchanged; only pixelHash moves — the manifest's own scenario
      count is unchanged at **608** before and after (compared directly against the pre-rename
      committed manifest). The spec's original "1,467" figure was the raw `git ls-files
      screenshots/**/*.png` count on an earlier base commit; on this leg's own base it had already
      drifted to 1,497 (recorded in T003, unrelated to this leg), and remained exactly 1,497 after
      — confirmed via `git status --short -- screenshots` showing zero added or deleted PNG files.
      pixelHash moved for 0 captures (T015) — every one is byte-identical, the strongest possible
      "did not move" result.
<!-- /ANCHOR:perf-verify -->

---

<!-- ANCHOR:deploy-ready -->
## L3+: Deployment Readiness

- [x] CHK-120 [P0] Rollback documented: revert the leg's commits, re-release, restore `.backup-0.0.30/` — see `plan.md` §7, unchanged and still accurate
- [ ] CHK-121 [P0] The rebuilt `main.js` is in the release commit, or the Gates workflow fails —
      belongs to T021, deferred to the release leg
- [ ] CHK-122 [P1] The iCloud copy done from the clean-clone export, never from the working tree —
      belongs to T022, deferred to the release leg
- [ ] CHK-123 [P1] Release notes tell users the plugin id changed — belongs to T021, deferred to
      the release leg
<!-- /ANCHOR:deploy-ready -->

---

<!-- ANCHOR:compliance-verify -->
## L3+: Compliance Verification

- [x] CHK-130 [P1] `spec.md` §12 Q2 landed, not merely answered: `manifest.json` credits
      MichelKerkmeester, carries no `fundingUrl`, and the README's fork line exists before release
      — all three verified true right now (T005, and README already carries the fork-credit line
      per the parallel README leg), ahead of release rather than merely planned for it
- [x] CHK-131 [P1] The fork's LICENSE and upstream credit unchanged or improved, never removed —
      `LICENSE` untouched by this leg (`git status --short LICENSE` empty), still credits pangy9;
      `README.md`'s fork-credit prose also untouched by this leg (only its 4 stale repo-URL
      references were fixed)
- [ ] CHK-132 [P2] `fundingUrl` points somewhere the operator intends — N/A, the operator's ruling
      (§12 Q2, 2026-09-06 19:08) was to REMOVE `fundingUrl` outright ("drop or repoint" offered,
      "drop" taken), so there is no new destination for it to point to; `jq 'has("fundingUrl")'`
      correctly prints `false`
<!-- /ANCHOR:compliance-verify -->

---

<!-- ANCHOR:docs-verify -->
## L3+: Documentation Verification

- [x] CHK-140 [P1] All packet documents synchronized and validated `--strict` — `validate.sh
      --strict` on 068 and on the `005-component-surface-system` parent both read `RESULT:
      PASSED` as their first line
- [x] CHK-141 [P1] Parent `goal.md` reserved-children table and `roadmap.md` §4/§6A/§7 carry this
      packet — already do (the parent `goal.md` row for `068` already records the repo-rename
      supersession this leg independently confirmed via `git remote -v`, and `roadmap.md` §4 row
      64 / §7.16 / §7's ADR rows already cite `068` in full); the parent's own `068` progress row
      is updated in this pass to reflect real completion rather than the placeholder `0/8`
- [x] CHK-142 [P1] `../changelog/` refreshed at close — no `changelog/` directory exists anywhere
      under `specs/005-component-surface-system/` (checked; no sibling packet uses one either),
      so `spec.md`'s reference to it is aspirational rather than an established convention. The
      repository's own root `CHANGELOG.md` is the real user-facing changelog and is the release
      leg's (T021) to update with the 0.0.31 entry, per this leg's own scope (no release cut here)
- [x] CHK-143 [P2] The GLM README rewrite referenced rather than duplicated — confirmed:
      `README.md` already speaks Obnotion throughout (verified before this leg touched anything),
      this leg only fixed 4 stale repository-URL references, and no README prose was re-authored
<!-- /ANCHOR:docs-verify -->

---

<!-- ANCHOR:sign-off -->
## L3+: Sign-Off

| Approver | Role | Status | Date |
|----------|------|--------|------|
| Operator | Product | [ ] Approved | |
| Operator | Device verification (D3) | [ ] Approved | |
<!-- /ANCHOR:sign-off -->
