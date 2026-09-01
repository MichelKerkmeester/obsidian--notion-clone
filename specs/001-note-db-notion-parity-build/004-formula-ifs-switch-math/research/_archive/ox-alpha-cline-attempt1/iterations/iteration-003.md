# Iteration 003 — Notion Parity Semantics, UX, Edge Cases, Mobile/iCloud (Q4, Q5)

Focus: exact Notion behavior via official docs; derive edge-case matrix and UI/UX + integration recommendations.
Primary source: official Notion formula syntax reference `[SOURCE: https://www.notion.com/help/formula-syntax]`, cross-checked against Thomas Frank's function reference `[SOURCE: https://thomasjfrank.com/formulas/functions/ifs/]`.

## Findings

### F13. Notion `ifs()` semantics — official
Verbatim from the official reference:
> Returns the value that corresponds to the first true condition. This can be used as an alternative to multiple nested if() statements.
> - `ifs(true, 1, true, 2, 3)` = `1`
> - `ifs(false, 1, false, 2, 3)` = `3`

Shape: pairs of condition/then with an **optional trailing else**; without else, no-match yields **blank** (`ifs` used "with no need to add the 'else' expression — this will be blank by default" per Frank's documentation of the same signature).
[SOURCE: https://www.notion.com/help/formula-syntax ; https://thomasjfrank.com/formulas/functions/ifs/]

→ Fork mapping: `IFS(c1,t1,c2,t2,...,else?)`; no match and no else → return `null` (renders as empty cell — the engine's field-null convention, F5 iter-001), which matches Notion's "blank" behavior. Odd argument counts must be treated as (pairs…+else); an even count means no else.

### F14. PIVOTAL — Notion has NO `switch()` at all
The official formula-syntax function list contains no `switch` entry; conditional dispatch is done with `if`/`ifs` only. Third-party sources confirm users emulate switch by nesting `if()` [SOURCE: https://wisechecker.com/notion-formula-switch-equivalent-if-else-chain/].
[SOURCE: https://www.notion.com/help/formula-syntax]

→ Implications for phase 004:
1. `SWITCH` is **Excel-convention parity, not Notion parity** — the spec's framing should follow Excel/Switch semantics: `SWITCH(expr, pat1, val1, ..., [default])`, no match + no default → `null`.
2. Naming decision strengthens: register uppercase `IFS`/`SWITCH` (fork's alias-tier convention) AND lowercase `ifs` mirror for Notion muscle memory. Lowercase `switch` mirror is safe token-wise (not a SafeEval keyword, F3 iter-001) but is NOT Notion vocabulary — offer it or not is cosmetic; recommended yes for symmetry with `IF`/`iferror` precedent where lowercase built-ins already exist (`iferror` :296).

### F15. Notion math functions — official entries
| Notion | Doc text | Example |
|---|---|---|
| `sqrt` | "Returns the positive square root of the number." | `sqrt(4)=2` |
| `cbrt` | "Returns the cube root of the number." | `cbrt(64)=4` |
| `exp` | "Returns e^x…" | `exp(1)=2.718281828459045` |
| `ln` | "Returns the natural logarithm of the number." | `ln(10)=2.302585092994046` |
| `log10` | "Returns the base 10 logarithm of the number." | `log10(100000)=5` |
| `log2` | "Returns the base 2 logarithm of the number." | `log2(1024)=10` |

There is **no general `log(number, base)`** in Notion — only fixed-base `log10`/`log2`.
[SOURCE: https://www.notion.com/help/formula-syntax]

→ Fork mapping: `SQRT/LN/LOG10/EXP/CBRT` map 1:1 onto `Math.*`. `LOG` is Excel-flavored: `LOG(n)`=log10, `LOG(n,b)`=log_b(n) — keep the optional-base form because the fork's table already uses optional args (`LEFT(v,count=1)` :339, `weekday(d,type?)` :283). Adding Notion's `LOG2` is a zero-risk freebie candidate but out of current scope; record in the upstream-PR candidate list only.

### F16. Edge cases derived from all three sources (test matrix)
1. `IFS()` / `SWITCH()` empty args → return `null` (precedent: `sum()→0` tolerance of empty varargs; Anytype returns null on no data, F9).
2. `IFS(false,…)` no else → `null` ≈ Notion blank (F13).
3. `SWITCH(x, …)` no pattern match, no default → `null` (F14).
4. Truthiness: conditions must coerce like JS truthiness — consistent with existing `IF` (:325) and `AND/OR` (:327–328) which use raw `Boolean` coercion. Document that `ifs("non-empty")` style truthy strings behave as JS, matching Notion's truthiness framing ("evaluated for truthiness", Frank).
5. Math aliases on non-numbers: `Math.sqrt("abc")` → NaN; per engine convention do not throw — surface via result and let `IFERROR` catch non-finite values (F4 iter-001; iferror explicitly handles `!Number.isFinite` :296–307).
6. Domain edges: `SQRT(-1)→NaN`, `LN(0)→-Infinity` — same IFERROR path as #5. Spot-check equality REQ-003 holds trivially since aliases ARE the Math refs.
7. Eager-branch caveat: both branches/alls thens evaluate even when not selected (F2 iter-001) — unlike Notion (whose 2.0 engine's laziness is commonly reported but was NOT confirmed in the fetched official pages; treat as UNKNOWN). Mitigation for users: keep branch expressions side-effect-free and cheap; they are pure anyway (sandbox forbids assignment side channels).
8. Name shadowing: frontmatter fields named `ifs`/`switch` are filtered if reserved-word-like; `RESERVED` currently contains `switch` but NOT `ifs`/`sqrt` etc. [SOURCE: data/ComputedField.ts:119–124] — built-ins override frontmatter by spread order (:146 comment), so user fields named `sqrt` lose to the alias; acceptable and documented behavior.

### F17. UI/UX enrichment (synthesis of F10/F11/F15)
Ranked, minimal-surface recommendations:
1. **Docs string update only** — the fork has no formula autocomplete surface today (grep found no function-list UI outside ComputedField.ts; formulas are edited as raw expressions). So parity UX work = updating the plugin README/settings help block listing available functions (the doc comment at ComputedField.ts:33–77 is the canonical inventory) with IFS/SWITCH + six aliases, grouped "Conditionals" / "Math" à la Anytype sections (F10).
2. Short-label discipline (AppFlowy shortLabel pattern, F11) when any future picker lands.
3. Error messages reuse existing i18n keys — no new keys required since wrappers never throw (F16).

### F18. Mobile + iCloud safety
- Aliases/wrappers are pure compute over already-loaded frontmatter — no Obsidian API calls, no vault writes, no network. Same posture as every existing table entry; matches NFR-S01/NFR-R02 and corroborated by both references' read-only calculation layers (F12).
- SafeEval runs identically on mobile (pure TS interpreter, no Node APIs) [SOURCE: data/SafeEval.ts:1–12] — nothing in the addition touches platform-specific code paths.

## Ruled Out
- Matching Notion exactly by dropping SWITCH — contradicts spec REQ-001; positioned as Excel-parity bonus (F14).
- Throwing type errors from math aliases — diverges from engine's non-finite + IFERROR convention (F16.5).
