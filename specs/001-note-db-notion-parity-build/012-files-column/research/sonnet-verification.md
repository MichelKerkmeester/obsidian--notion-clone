# Sonnet 5 Verification — 012-files-column

- Reviewer: Claude Sonnet 5 (read-only; hunter/skeptic/referee adversarial self-check; safety-weighted)
- Date: 2026-08-26
- Note: built on Luna-via-cursor (codex OpenAI quota died mid-run; rebuilt after executor swap)
- Scope: shipped implementation on branch `impl` (range `b97ee1e^..f84a193`) vs `spec.md` + `research/{synthesis,final-plan,verification}.md`
- Gate re-run at review time: `tsc --noEmit` exit 0; `vitest` 19 files / 194 tests pass

## Verdict

**PASS** — correct, vault-local-safe, independently verified. Two non-blocking P1s (a missing cover-guard test + unreconciled docs), neither a functional/safety defect on `impl` HEAD.

## Findings

### Safety — all clear (traced, not trusted)
- `resolveFileTarget` (`src/data/FilesColumn.ts:94-103`) resolves only via `metadataCache.getFirstLinkpathDest`; no `fetch`/`electron`/`fs`/`adapter` in the module or `CoverWiring.ts` (grep zero).
- Write-time URL strip: `parseFileValue` (`FilesColumn.ts:183-232`) rejects `isExternalUrl` (http/https) as bare value or link target; `CellRenderer.ts:2509` routes `files` saves through it, so a URL never persists.
- **Cover-guard (safety-critical):** `GalleryRenderer.ts:445-446` and `BoardRenderer.ts:664-665` both block `coverColumn?.type==="files" && image.external` → a hand-edited raw-frontmatter `https://` URL can't become a network `<img>`. Wired at **both** call sites (Embedded delegates to the same classes — no unguarded path).
- Defense-in-depth: `resolveImageSrc` (`CoverImage.ts:22-26`) returns a src only when the link resolves to a real vault `TFile`, so `ftp:`/`data:` also fail. Thumbnails via `vault.getResourcePath` on a resolved `TFile` — vault-local. No network/fs/electron anywhere.

### Correctness — PASS
- Round-trip (`normalize`/`formatForEdit`/`parseEdit`): empty `[]`, URL-drop, dedupe-by-target, wikilink/markdown/bare forms, malformed-as-chip (`FilesColumn.ts:47-86`; tests `:93-137`).
- `CellRenderer.ts:228-230` dispatches `case "files"` → `renderChips`; empty `[]` hits the pre-switch `isEmptyValue` → `db-empty-value`. `startEdit` branches files → `editText` with `formatForEdit` (no `safeString` garble).
- Gallery cover picks first parseable internal image in array order via pre-existing `resolveCoverImage` — no second cover parser added.

### Coverage / No-regression
- 13 synthesis recs implemented across 001–004; recs 13 (count badge) + 14 (per-file menu/reorder) explicitly deferred (`tasks.md` T019/T020 blocked). Exactly 13 column types on the union (`types.ts:52`) — no colliding 13th type.
- Diff scoped to the new module/tests/`CoverWiring.ts` + insertion-only edits to the registry/renderer/i18n seams; `CoverImage.ts`/`FileFields.ts`/`FileFieldRenderer.ts`/`ListRenderer.ts` untouched. "files" falls through to generic stored-array handling by design (~90 gate sites swept).

### styles.css
No CSS added, and none missing for function — `renderChips` reuses pre-existing `db-file-link-list`/`-item` (`styles.css:5697-5726`); thumbnail sizing is inline via `setCssProps`. The extra `db-file-link-type-*`/overflow/thumbnail/label classes have no rules (P2 cosmetic no-op hooks — no file-type visual differentiation yet).

## Remediation candidates
- **P1 — add a cover-guard regression test:** the external-image guard in `GalleryRenderer`/`BoardRenderer` is the single most safety-relevant conditional and had a real defect caught only by manual review (`004` first shipped a dead unwired helper `d2fbc5b` → fixed `f84a193`). It currently has **zero** automated coverage. Add a focused unit test before this surface is touched again.
- **P1 (packet pattern) — docs unreconciled:** parent + all 5 sub-phase `implementation-summary.md`/`checklist.md` (0/31)/`graph-metadata.json` (`"planned"`) still pre-build. Reconcile.
- **P2:** no-op CSS hook classes (cosmetic); historical note — `004`'s first commit overstated completion (dead helper) before the fix commit.

## Note on the build pipeline
This phase validates the in-loop verify+fix loop: DeepSeek flagged `004`'s dead-helper and the fix pass added the real guard before the phase was marked done. The final `impl` HEAD is correct.
