# Sonnet 5 Verification — 005-formula-let-variables

- Reviewer: Claude Sonnet 5 (read-only; three independent hand-traced derivations, not test-trust)
- Date: 2026-08-26
- Scope: shipped implementation on branch `impl` (commits `1601703`, `4b0b987`, `cfd9626`) vs `spec.md` + `research/{synthesis,verification}.md`
- Gate re-run at review time: `tsc --noEmit` clean; `vitest` 160/160; `git diff --exit-code main impl -- src/data/SafeEval.ts` = 0 (byte-identical)

## Verdict

**PASS** — correctly implements the locked nested-`__let` design, matches synthesis coverage, leaves `SafeEval.ts` untouched, is display-only/mobile-safe, and is backed by a meaningful green suite. One non-blocking finding: stale packet docs.

## Findings

- **Correct design, not the ruled-out sketch:** `transformLetCalls` (`src/data/LetVariables.ts:28-86`) uses the nested-arrow rewrite; no `let:`/`lets:` context property exists (grep zero hits) — only `context.__let` is registered (`LetVariables.ts:32-34`). The earlier caller-scope sketch that would have crashed was correctly abandoned.
- **Sequential binding** folds right-to-left (`LetVariables.ts:73-76`). Hand-trace: `lets("a",1,"b",a+1,a+b)` → `__let((a)=>__let((b)=>a+b, a+1), 1)` = 3 (spec Scenario 2).
- **Value-position recursion** (`LetVariables.ts:65`): `let("a", let("b",1,b+1), a)` → `__let((a)=>a, __let((b)=>b+1, 1))` = 2, matches `LetVariables.test.ts:24-28`.
- **`let`/`lets` identity + keyword validation** (REQ-005): `LET_KEYWORDS` (`LetVariables.ts:12-21`) is exactly the 8 SafeEval tokenizer keywords, deliberately excluding `"let"` itself, so `let("let",5,let+1)` is allowed (tested `:40-42`).
- **Wire-up:** `ComputedField.ts:445-464` runs the transform inside the existing try; transform errors return before the statement-mode fallback (no retry-on-transform-failure).
- **Coverage:** synthesis ranks 1–6 shipped; 7–8 (lazy `if`, static typing) explicitly deferred to parent backlog, matching `research/verification.md`'s PASS.
- **No-regression:** `SafeEval.ts` byte-identical (REQ-004/SC-003); full suite green at current HEAD (past 006–009).
- **Safety:** `LetVariables.ts` has zero imports — pure string transform + closures; feeds only the display-value path, no vault writes. Direct user `__let((a)=>a,5)` still blocked by the pre-existing `=>` security check (`ComputedField.ts:515-517`, tested `ComputedField.let.test.ts:120-122`).
- **Tests:** 27 total (19 + 8) — binding, shadowing, sequential eval, scanner-safety (quoted commas, `obj.let(`, whitespace-before-paren), both error paths, built-in collision, self-reference, IF composition.

## Remediation candidates
- **P1 (packet-wide) — docs stale:** `spec.md:52` Status "Planned"; three children `implementation-summary.md` "Not delivered"; all `tasks.md` `[ ]`; `checklist.md` 0/26. Reconcile spec/summary/tasks/checklist/`graph-metadata.json` to actual `impl` state (Completion Verification Rule; would otherwise mislead `/speckit:resume`).
- **P2 — harmless:** `FormulaModal.ts:64-65` displays `name:"LET"/"LETS"` (uppercase display convention) while invocable syntax is lowercase-only. `insertFunction` always inserts the correct lowercase signature (`:788-790`) and the live engine re-validates every keystroke (`:809-856`), so a mistaken uppercase surfaces the correct runtime error — no silent wrong-answer.
