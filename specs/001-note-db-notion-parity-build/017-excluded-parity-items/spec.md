---
title: "Feature Specification: Excluded parity items"
description: "Wave 6 out-of-scope ruling: five Notion parity items are deliberately not built, each with its reason, so a later owner does not reopen them without the one revisit trigger."
trigger_phrases:
  - "excluded parity items"
  - "out of scope parity"
  - "person people property"
  - "me() function"
  - "goodbases renderer"
  - "notion file cdn"
  - "rich-text style output"
  - "identity model revisit"
importance_tier: "medium"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/017-excluded-parity-items"
    last_updated_at: "2026-08-26T00:00:00Z"
    last_updated_by: "markdown-agent"
    recent_action: "Fixed verification concerns: 014 citations for hover-open/toolbar and REQ-004"
    next_safe_action: "Keep closed; reopen person/me() only on identity + Wave 6"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "note-db-parity-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Feature Specification: Excluded parity items

> Adjacent phases: predecessor `016-onchange-automations`, no successor (final phase). Parent spec: [`../spec.md`](../spec.md).

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P2 |
| **Status** | On Hold (DO-NOT-BUILD) |
| **Created** | 2026-08-24 |
| **Branch** | `017-excluded-parity-items` |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
The Notion-parity research (10 iterations, evidence in `research/research.md`, decision-ready summary in `research/synthesis.md`) surfaced a long feature list. Most of it earned a build phase. Five items did not. The fork already covers the recoverable Notion surfaces — `Clients` as a relation, markdown `textRenderMode`, vault-local files, and hover-open (scoped to phase `014-record-detail-panel`). The remaining gaps are either platform-blocked (Obsidian exposes no plugin-visible user/identity model) or actively harmful (a Notion CDN fetch into an iCloud vault, or swapping the renderer for chrome-only GoodBases). The single biggest risk is a later owner reading "not built" as "still TODO" and shipping a home-grown people/`me()` store or a Notion CDN downloader into an iCloud vault.

### Purpose
Record the five deliberately-excluded parity items as a decision record, not a capability. The recommendation is **DO-NOT-BUILD / HOLD**: ship the ruling, not a module. Keep one revisit trigger so the door is closed but not welded — **only person/people and `me()` reopen**, and only when Obsidian itself gains a plugin-visible user/identity model **and** Wave 6 is explicitly entered (`roadmap.md:66-70`), never for Notion parity alone. Notion CDN fetch and GoodBases-as-renderer **never** reopen, even after identity. `style()`/`unstyle()` is not identity-gated and stays excluded even after identity (residual underline/colors is new formula surface, not missing cell render). This packet builds nothing and touches no fork code (`spec.md` "Files to Change: (none in the plugin fork)", `plan.md` "0 hours of fork work").

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Recording the five excluded parity items as a ranked, decision-ready backlog (synthesis Verdict = DO-NOT-BUILD / HOLD), each with its reason and feasibility:
  1. **`style()` / `unstyle()` formula output** — Notion formulas emit a styled-string type (`b`/`u`/`i`/`c`/`s` plus eight text colors and eight `*_background` colors); the fork's markdown mode already covers bold/italic/strike/highlight/code/links (`src/data/InlineMarkdown.ts:8-9`, `src/views/CellRenderer.ts:212-228`) and computed outputs are only `number | text | date | datetime | checkbox` (`src/data/types.ts:106`). Feasibility **hard**; effort **L**; not identity-gated, still skip — peers do not style grid cells.
  2. **person / people property** — Notion `people` is an array of workspace user objects; the fork has relation-to-records only (`src/data/types.ts:34-37,50,67-68`) and zero `Clients`/person types in plugin code. Feasibility **blocked** until Obsidian ships a user directory; effort **L**; stand-in today is a vault `Clients` relation.
  3. **`me()` / "Me" filter token** — expands to the authenticated workspace user; feasibility **blocked** (depends on item 2); effort **M** after a real person type exists, **L** if invented as a settings-stored id; build-order after person/people, never first.
  4. **Fetching Notion file CDN URLs** — Notion-hosted `type: "file"` URLs are temporary (valid 1 hour) and the API says not to cache them; `external` URLs never expire. Feasibility **blocked** (product ruling, not missing code); effort **L** and negative-value if forced; files stay vault-local wikilinks (`012-files-column/spec.md:66,86`).
  5. **Adopting GoodBases as the table renderer** — chrome-only (hover OPEN, pills), no own formulas, no rollups, footers listed as "next"; adoption would replace the fork's 12 column types, 7 views, two formula syntaxes, and `count|sum|avg|list` rollups. Feasibility **blocked**; effort **L** rewrite; never as renderer — hover-open already scoped to `014-record-detail-panel` (`014-record-detail-panel/spec.md:79,87,146`).
- Recording the single revisit trigger (REQ-003) and the cheaper/safer alternatives the synthesis names (read-only `Clients` relation; platform precondition)
- Recording the reserved reopen-contract design (see `plan.md`) so a future revisit is design-ready, not a blank slate

### Out of Scope
- Any plugin implementation of the five excluded items
- The files-column decision itself (owned by `012-files-column`)
- The record detail panel and its hover-open (owned by `014-record-detail-panel`)
- On-change automations (owned by predecessor `016-onchange-automations`)
- Changes to the existing engines, 12 column types, 7 view types, display-only rollups (`count|sum|avg|list`), or the markdown `textRenderMode`

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| (none in the plugin fork) | None | DO-NOT-BUILD ruling only; no module, call-site, or CSS change |

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | None — excluded. The five items are not built (DO-NOT-BUILD / HOLD) | The fork gains no person/people property, no `style()`/`unstyle()` formula output, no `me()`, no GoodBases renderer, and no Notion CDN fetch |
| REQ-002 | Each exclusion keeps its reason on record | Every excluded item in this spec carries the specific model, cost, or duplication reason it was rejected for, with the file:line citation from `research/synthesis.md` |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-003 | Keep one concrete revisit trigger | **Only person/people and `me()` reopen** — and only if (a) Obsidian gains a plugin-visible user/identity model **and** (b) Wave 6 is explicitly entered (`roadmap.md:66-70`). Notion CDN fetch and GoodBases-as-renderer **never** reopen, even after identity. `style()`/`unstyle()` stays excluded even after identity. Default: keep closed |
| REQ-004 | Record the reserved reopen-contract design | If the identity trigger fires, the build follows the EuroFormat isolated-diff model: one new module under `src/data/` + ≤3 call-site edits, rebase-safe (`014-record-detail-panel/spec.md:128`). Reserved module: `src/data/PersonIdentity.ts` only — maps a plugin-visible user id onto the existing relation/wikilink value model; **no `"people"` union member** (`src/data/types.ts:50` stays as-is), no parallel directory. A forced `style()` build is a type-system project, not an isolated override, so no `FormulaStyle.ts` is reserved — not built now |

<!-- /ANCHOR:requirements -->
---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: **Given** this packet stays On Hold (DO-NOT-BUILD), **Then** the plugin fork implements none of the five excluded items.
- **SC-002**: **Given** a later owner reads the backlog, **Then** each excluded item shows a ranked reason with a `research/synthesis.md` citation, so "not built" is not misread as "still TODO."
- **SC-003**: **Given** a review of the excluded set, **Then** only person/people and `me()` reopen — and only if Obsidian gains a plugin-visible user/identity model **and** Wave 6 is explicitly entered. CDN fetch and GoodBases never reopen; `style()`/`unstyle()` stays excluded even after identity.
- **SC-004**: **Given** the identity trigger fires, **Then** the reopen-contract design (`src/data/PersonIdentity.ts`, ≤3 call sites, no `"people"` union member) is already on record, so the build starts from a design, not a blank slate.

<!-- /ANCHOR:success-criteria -->
---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | Reopening person/people or `me()` "for parity" | Medium: both need a user directory Obsidian does not provide; a home-grown settings-stored id is per-vault, not per-viewer — the same iCloud vault on two devices disagrees | Keep excluded; model people as a `Clients` relation. Reopen only on the REQ-003 trigger |
| Risk | Building on GoodBases as the renderer | High: chrome-only, no own formulas/rollups/footers (footers are "next"); adoption replaces the fork's 12 column types, 7 views, two formula syntaxes, and `count\|sum\|avg\|list` rollups | Keep excluded; take only its hover-open idea into `014-record-detail-panel` (`014-record-detail-panel/spec.md:79,87,146`) |
| Risk | Fetching Notion file CDN URLs | High: Notion `file` URLs expire in 1 hour and the API says do not cache; download → iCloud re-upload is a double transfer, and the vault copy is stale by design | Keep excluded; files stay vault-local wikilinks (`012-files-column/spec.md:66,86`) |
| Risk | `style()` write-back corruption | Medium: `stringifyValue` has no rich-text branch (`src/data/Stringify.ts:1-14`); `ComputedSyncMode` includes `automatic` (`src/data/types.ts:111`), so `**`/`==` persisted to YAML re-parses as markup under `textRenderMode: "markdown"` | Keep excluded; default computed sync is already `"display-only"` (`src/data/ComputedSync.ts:3,42-44`) |
| Dependency | Markdown `textRenderMode` | Green (baseline) | Already renders bold/italic/strike/highlight/code/links (`src/data/InlineMarkdown.ts:8-9`); `style()` output is redundant, not blocked |
| Dependency | Obsidian plugin-visible user/identity model | External, absent today | The only trigger that reopens person/people and `me()`. API exposes `vault`/`workspace`/`lastEvent` (pointer event, not identity) and no `user`/`account`/`profile` |

<!-- /ANCHOR:risks -->
---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

Operator decisions (defaults recorded; none block the HOLD):

1. **Revisit trigger (REQ-003):** reopen person/people and `me()` only when Obsidian exposes a plugin-visible user/identity object **and** Wave 6 is explicitly entered (`roadmap.md:66-70`), not for Notion parity alone. **Default: keep closed.** Sync/Publish accounts are billing-level, not a directory.
2. **Home-grown vault identity** (settings id, per-device name, "first note titled Me"): **Default: reject.** Unowned data, cross-device split, no viewer in shared vaults.
3. **`style()` overlap boundary:** markdown mode is ~bold/italic/strike/code/highlight, not underline or formula colors. **Default: still excluded.** Residual gap is new formula surface, not missing cell rendering (peers do not style grid cells).
4. **CDN / GoodBases:** **Default: never reopen**, even after an identity API. Files stay vault-local; take only hover-open (already in 014), never the GoodBases renderer.
5. **People modeling in the vault:** **Default: `Clients` (or equivalent) relation column** to note records — the AppFlowy/Anytype pattern. No plugin type named Person.

**REVISIT TRIGGER:** Reopen **only person/people and `me()`** — and only if Obsidian gains a plugin-visible user/identity model **and** Wave 6 is explicitly entered (`roadmap.md:66-70`). CDN fetch and GoodBases never reopen; `style()`/`unstyle()` stays excluded even after identity.

<!-- /ANCHOR:questions -->

---

<!--
CORE TEMPLATE (~80 lines)
- Essential what/why/how only
- No boilerplate sections
- Add L2/L3 addendums for complexity
-->
