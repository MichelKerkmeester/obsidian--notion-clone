**Note Database: build the component surface system, autonomously, all phases**

Repo `~/MEGA/Development/Obsidian Plugin`, `main`. Program: `specs/public/005-component-surface-system/`. **Uncommitted.**

**WHY.** 1.3.1 passed every gate — tsc, build, 410 tests, 196 captures, Storybook, 13 geometry checks — and the operator saw **no change on device**, code confirmed present. The gates measured mechanisms, not outcomes.

**ROOT CAUSE.** Tokens sit on nine selectors (`styles.css:19-27`). `.db-owned-menu` is the only body-portal surface missing, and `createOwnedMenu` mounts on `document.body`: **29/29 probed overlay classes compute differently there; 25/29 carry no tokens.** Storybook wraps every story in the container supplying them, so no gate could fail.

**READ FIRST.** `roadmap.md` → `architecture-findings.md` → `adversarial-review.md` (**17 findings on how this could still fail; fixed, but read why**) → `design-system.md`.

**ORDER** — folder numbers are identifiers, not sequence; `007` is off-path research, complete. **Read `<folder>/goal.md` before starting a phase; its spec/plan/tasks/checklist/acceptance-criteria hold the detail:**

1. `009-live-verification` — **the independent instrument.** `000` would otherwise measure its own harness repair; harness and live numbers that disagree block the handoff.
2. `000-surface-contract-and-truthful-harness` — contract + honest harness. **Blocks all.**
3. `004-checkbox-ownership` — small and visible, **tests the doctrine cheaply**
4. `005-content-row-rhythm` — seven view types; no overlay dependency
5. `001-overlay-placement-and-menu-language` — 33 sites, 14 row grammars
6. `002-properties-panel` — 8 children into 7 grid tracks
7. `003-mobile-sheet-presentation` — **navbar overlay needs a portal, not a z-index**
8. `006-record-open-target` — 20 affordances, 6 paths, 4 surfaces
9. `008-integration-and-release-observability` — replay harness **before `001`**, at every lane handoff; release last; only phase that may delete compat paths

**ACCEPTANCE DOCTRINE — the whole point.** A criterion is invalid unless measured **at the production mount point**, a number or hit test with a threshold, **proven to fail on today's tree with the value recorded**, and asserted by a harness that can distinguish — plus the five stateful dimensions in parent §6. Class names, call counts and existence checks are **banned**: every 1.3.1 criterion was that shape and passed. **A blank "today" cell blocks a phase from starting.** `vitest` has no jsdom — its 410 tests evidence **no** criterion.

**CSS LANE — ENFORCED, NOT ASSUMED.** `styles.css` 19,261 lines, never split, fingerprinted by all 196 captures. **One phase holds it at a time**, with a recorded owner and a check that fails when a phase without the lane edits it — `004` and `005` both unblock after `000`, so convention alone permits concurrent edits. Release needs a full recapture **and a per-PNG sign-off**; `screenshots:verify` never opens an image.

**MODELS.** Implementation → GPT-5.6 LUNA xhigh fast (`cli-codex`/`cli-pi`). Visual → GLM-5.3 Flash highest thinking via `cli-pi` + OpenRouter. Verification → fresh Opus, **claude2** first (`CLAUDE_CONFIG_DIR=~/.claude-account2`), then the current account. Read `cli-<x>/SKILL.md` **before** any dispatch — codex has **no `--reasoning-effort` flag**, use `-c model_reasoning_effort=`.

**TRAPS.**
- A pipe makes `$?` the pipe's status — it hid three failures. Use `cmd >log 2>&1; echo $?`.
- `validate.sh` needs the hub cwd and a fresh `dist`, else it prints ERROR and exits 0.
- Deep-loop runs **from the plugin worktree**, never while an agent edits that tree.
- **A CI check asserts the defect** (`verify-placement.mjs`, widthless caller > 320px). `000` inverts it first; assume others exist.
- AnyType/AppFlowy in `external/`: behaviour only, never copy code, CSS or tokens.

**DONE MEANS** the operator confirms on device. Gates have proven insufficient.
