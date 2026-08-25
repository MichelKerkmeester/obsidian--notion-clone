# Deep Research: Formula LET/LETS Variables

> Notion-parity enrichment for the forked Note Database plugin, merged from 10 forced-depth research iterations (no early convergence).
> Executor lineage: `lineages/glm-5-2`. Stop reason: max_iterations. Average newInfoRatio: 0.756.
> Deliverable synthesized deterministically from the per-iteration findings below; every claim keeps its original in-iteration SOURCE citation.

---

## Iteration Findings

The research built cumulatively; the final iteration is the ranked gap-mining synthesis. All iterations are included below as the evidence trail.

# Iteration 001 — Fork Engine Internals & The Eager-Evaluation Problem

**Focus**: Deep-dive into fork engine internals — ComputedField.ts createContext, SafeEval evaluation model, and the eager-argument-evaluation constraint that fundamentally shapes let/lets design.

**Iteration**: 1 of 10
**Status**: complete
**newInfoRatio**: 1.0
**noveltyJustification**: First pass; all findings are new to this packet — engine architecture, eager-eval constraint, and Notion semantics are all freshly confirmed.

---

## Findings

### F1: SafeEval Uses Eager Argument Evaluation — The Core Design Challenge

**Finding**: SafeEval's `Call` node evaluator evaluates ALL arguments in the caller scope BEFORE invoking the function. This is the single most important architectural constraint for let/lets design.

**Evidence**:
- [SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/data/SafeEval.ts:1010-1017]
```typescript
const args: unknown[] = [];
for (const a of node.args) {
    if (a.type === "Spread") {
        args.push(...evalSpread(a.arg, scope));
    } else {
        args.push(evalNode(a, scope));  // ← EAGER: evaluated in CALLER scope
    }
}
return (callee as { apply(thisArg: unknown, args: unknown[]): unknown }).apply(thisObj, args);
```

**Implication**: When a user writes `let("rate", 0.05, amount * rate)`, SafeEval will:
1. Evaluate `"rate"` → string `"rate"` (in caller scope)
2. Evaluate `0.05` → number `0.05` (in caller scope)
3. Evaluate `amount * rate` → **ERROR**: `rate` is not defined in the caller scope!

This means the spec's design sketch (`context.let = (name, value, expr) => { ... evaluate(expr, child) ... }`) **cannot work as written** because `expr` is already evaluated (and will fail) before the `let` function ever runs. The `expr` argument must be passed as an **unevaluated AST node or source string**, not as a pre-evaluated value.

### F2: SafeEval Identifier Resolution is Simple Scope Lookup

**Evidence**: [SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/data/SafeEval.ts:935-936]
```typescript
case "Ident":
    return scope[node.name];
```

Identifier resolution is a plain property lookup on the scope object. There is no special handling for undefined identifiers — it returns `undefined`, which then typically causes a downstream TypeError. The scope is a plain JavaScript object, and prototype-chain lookup works naturally (Object.create(scope) creates a child scope).

### F3: Arrow Functions Are Supported in SafeEval But Blocked by Security Check

**Evidence**:
- SafeEval parser supports arrows: [SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/data/SafeEval.ts:757-765, 824-838, 1043-1050]
- Arrow evaluator creates child scope via Object.create: [SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/data/SafeEval.ts:1043-1050]
```typescript
case "Arrow":
    return (...args: unknown[]) => {
        const childScope: Record<string, unknown> = Object.create(scope) as Record<string, unknown>;
        for (let i = 0; i < node.params.length; i++) {
            childScope[node.params[i]] = args[i];
        }
        return evalNode(node.body, childScope);
    };
```
- BUT ComputedField blocks arrows: [SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/data/ComputedField.ts:504-506]
```typescript
if (/=>/.test(normalizedExpr)) {
    return t("formula.error.noArrowFunction");
}
```

**Implication**: The arrow-function child-scope pattern (`Object.create(scope)`) is exactly what let/lets needs, but arrows themselves are security-blocked. The let/lets context function must replicate this child-scope creation pattern internally.

### F4: createContext Registers 80+ Built-in Functions in Two Passes

**Evidence**: [SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/data/ComputedField.ts:135-380]
- First pass (lines 139-305): lowercase built-ins (today, now, round, floor, if, concat, etc.)
- Second pass (lines 310-378): UPPERCASE aliases (TODAY, NOW, ROUND, IF, IFERROR, etc.)
- Frontmatter fields are spread first (lower priority), built-ins override them (line 140-145)
- `let` is in the RESERVED set (line 97) but only filters frontmatter keys — it does NOT prevent `let` from being registered as a context function

**Implication**: Adding `let`/`lets` as context functions is architecturally straightforward — they slot into the same registration pattern. The RESERVED set only blocks frontmatter field names, not context function names.

### F5: evaluateExpressionDetailed Builds a Scope Wrapper Around Context

**Evidence**: [SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/data/ComputedField.ts:432-441]
```typescript
const scope: Record<string, unknown> = {
    Math, Number, String, Boolean, Array, Object, JSON, Date,
    isNaN, isFinite, parseFloat, parseInt,
    ...context,
};
const result = safeEval(normalizedExpr, scope);
```

The scope passed to safeEval includes JS globals (Math, Number, etc.) spread with the context. This scope object is what let/lets would need to create child scopes from.

### F6: Notion let/lets Semantics — Confirmed from Official Docs

**Evidence**: [SOURCE: https://www.notion.com/help/formula-syntax — let/lets function table entries]
- `let(person, "Alan", "Hello, " + person + "!")` = `"Hello, Alan!"`
- `let(radius, 4, round(pi() * radius ^ 2))` = `50`
- `lets(a, "Hello", b, "world", a + " " + b)` = `"Hello world"`
- `lets(base, 3, height, 8, base * height / 2)` = `12`

[SOURCE: https://thomasjfrank.com/formulas/functions/let/]
- As of April 2025, `let()` now allows multiple variables (making it identical to `lets`)
- Variables can only be used within the parentheses of the original let() function
- Inner let can access outer let variables: `let(firstName, "Monkey", let(lastName, "Luffy", firstName + " D. " + lastName))` = `"Monkey D. Luffy"`
- Inner variable shadows outer of same name: `let(lastName, "Luffy", "Monkey D. " + let(lastName, "Garp", lastName))` = `"Monkey D. Garp"`
- Signature: `let(variable, value, expression)` or `let(var1, value, var2, value, ..., expression)`
- Signature: `lets(variable, value, variable2, value2, ..., expression)`

**Key semantics confirmed**:
1. `let` and `lets` are now functionally identical (since April 2025)
2. Variable scoping is lexical — child scope, no leakage
3. Shadowing: inner bindings override outer of same name
4. The expression argument is NOT pre-evaluated — it's evaluated in the child scope

---

## Dead Ends

### DE1: Direct Context Function Approach (as spec sketches it)
The spec's design sketch shows `context.let = (name, value, expr) => { child[name] = evaluate(value, context); return evaluate(expr, child); }`. This fails because SafeEval eagerly evaluates `expr` in the caller scope before `let` runs. The `expr` argument arrives as a pre-evaluated value (or throws an error if it references the not-yet-bound name). **Ruled out as-is** — requires a different mechanism.

---

## Questions Addressed
- **Q1 (PARTIAL)**: SafeEval's eager evaluation means let/lets CANNOT be simple context functions that receive pre-evaluated args. The expression argument must be deferred. This is the core design challenge.
- **Q2 (ANSWERED)**: Notion let/lets semantics confirmed — child-scoped, shadowing works, let==lets since April 2025.

## Questions Raised
- How can let/lets defer evaluation of the expression argument when SafeEval evaluates all args eagerly?
- Can the expression be passed as a string and re-parsed? Or does the engine need a special-case in the Call evaluator?
- Does the fork's normalizeFormula (bracket-to-field() conversion) interfere with let/lets string-based approaches?

---

## Ruled Out
- Direct context function with pre-evaluated expr arg (eager-eval makes it impossible)

---

# Iteration 002 — Solving the Eager-Evaluation Problem & Integration Pattern

**Focus**: Solve the eager-evaluation constraint. Explore string-based re-parse, AST deferral, and ComputedField pipeline special-case approaches. Examine normalizeFormula and FormulaTokenizer for interference. Identify the EuroFormat-pattern integration.

**Iteration**: 2 of 10
**Status**: complete
**newInfoRatio**: 0.85
**noveltyJustification**: New solution approaches for the eager-eval problem, tokenizer interference analysis, and concrete integration pattern — all freshly derived from source.

---

## Findings

### F7: Three Viable Approaches to Defer Expression Evaluation

Given that SafeEval eagerly evaluates all arguments (confirmed in iteration 1), there are three approaches to make `let(name, value, expr)` work:

**Approach A — String-Based Re-Evaluation (RECOMMENDED)**:
Pass the expression as a string literal and re-evaluate it inside the let function. The user writes `let("rate", 0.05, "amount * rate")` — the third arg is a string. The let function parses and evaluates this string in the child scope.

Pros: No SafeEval changes, pure context function, rebase-safe.
Cons: String-within-string syntax is awkward; the expression isn't syntax-highlighted or validated at parse time.

**Approach B — ComputedField Pipeline Special-Case (BEST FIT)**:
Intercept `let`/`lets` calls in `evaluateExpressionDetailed` BEFORE passing to SafeEval. Pre-process the formula to transform `let("rate", 0.05, amount * rate)` into a form that SafeEval can handle with deferred evaluation.

The key insight: ComputedField already has a `normalizeFormula` step (line 549-555) that transforms `[field]` → `field("field")`. A similar pre-processing step could transform `let(name, value, expr)` into an IIFE-like construct that SafeEval's arrow support handles — BUT arrows are blocked by security (line 504).

**Approach C — Register let/lets as Special Functions in SafeEval's Call Evaluator (VIOLATES REQ-004)**:
Add a special case in SafeEval's Call node evaluator (line 985-1019) that checks if the callee is `let` or `lets` and defers evaluation of the expression argument. This would be the cleanest solution but **violates REQ-004** (SafeEval.ts must stay byte-identical).

**Evidence**: [SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/data/ComputedField.ts:421-453] — evaluateExpressionDetailed pipeline shows normalizeFormula → validateFormulaSecurity → safeEval. The normalizeFormula step is the natural injection point for pre-processing.

### F8: The Arrow-Function Bridge — Transforming let() into an IIFE

Since SafeEval supports arrow functions in the parser/evaluator (SafeEval.ts:1043-1050) and the child-scope creation pattern (`Object.create(scope)`) is exactly what let needs, the cleanest approach that doesn't touch SafeEval is:

1. In ComputedField's `evaluateExpressionDetailed`, BEFORE the security check, detect `let(...)` / `lets(...)` calls
2. Transform them into arrow-IIFE form: `let("rate", 0.05, amount * rate)` → `((rate) => (amount * rate))(0.05)`
3. BUT: the security check blocks `=>` (line 504), so this transform must happen AFTER the security check passes on the ORIGINAL formula, then the transformed version is passed to safeEval

**Wait — this creates a contradiction**: the security check runs on `normalizedExpr` before safeEval. If we transform AFTER the security check, the transformed expression with `=>` would bypass the arrow ban. This is architecturally sound (the transform is trusted code, not user input) but requires careful ordering.

**Evidence**: [SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/data/ComputedField.ts:428-441]
```typescript
const securityError = this.validateFormulaSecurity(normalizedExpr);
if (securityError) return { value: null, error: securityError };
// ... scope building ...
const result = safeEval(normalizedExpr, scope);
```

The security check runs on `normalizedExpr`, then the SAME `normalizedExpr` is passed to safeEval. If we introduce a `transformForLet` step between security check and safeEval, the user's original formula is security-checked (no arrows), and the transformed version (with arrows) is only seen by safeEval.

### F9: normalizeFormula Does NOT Interfere with let/lets

**Evidence**: [SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/data/ComputedField.ts:549-555]
```typescript
private normalizeFormula(expr: string): string {
    let formula = expr.trim();
    if (formula.startsWith("=")) formula = formula.slice(1).trim();
    return formula.replace(/\[([^\]]+)\]/g, (_match, name: string) =>
      `field(${JSON.stringify(String(name).trim())})`
    );
}
```

normalizeFormula only:
1. Strips leading `=`
2. Converts `[field]` → `field("field")`

It does NOT touch `let(...)`, `lets(...)`, or any function calls. A `let("rate", 0.05, [amount] * rate)` would have `[amount]` → `field("amount")` but `let("rate", 0.05, field("amount") * rate)` would pass through correctly.

**Implication**: normalizeFormula is safe for let/lets — no interference.

### F10: FormulaTokenizer Would Need let/lets Awareness for Dependency Extraction

**Evidence**: [SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/data/FormulaTokenizer.ts:130-179]

The tokenizer scans identifiers and marks them as `isCall` if followed by `(`. When `extractDependencies` (ComputedField.ts:390-414) processes segments, it checks identifiers against column names. A let-bound variable like `rate` in `let("rate", 0.05, amount * rate)` would be scanned as:
- `let` → identifier, isCall=true (followed by `(`)
- `"rate"` → string (not an identifier segment)
- `amount` → identifier, isCall=false → checked against columns → found as dependency
- `rate` → identifier, isCall=false → checked against columns → NOT found → not added as dependency (correct!)

**Implication**: The tokenizer already handles this correctly — `rate` is not a column, so it's not added as a dependency. However, `let` itself would be scanned as an identifier with isCall=true. The `extractDependencies` function (line 411) only adds identifiers that match column keys/labels, so `let` would not be mistakenly added. **No tokenizer changes needed for dependency extraction.**

### F11: FormulaModal UI — Function Help Registry Needs let/lets Entries

**Evidence**: [SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/views/modals/FormulaModal.ts:60-100]

The FormulaModal has a `FUNCTIONS` array (line 60) that drives the function help panel. Each entry has categoryKey, name, signature, descriptionKey, and example. Adding let/lets would require entries like:
```typescript
{ categoryKey: "formula.catLogic", name: "LET", signature: "LET(name, value, expression)", descriptionKey: "formula.fn.LET.desc", example: '=LET("rate", 0.05, [amount] * rate)' },
{ categoryKey: "formula.catLogic", name: "LETS", signature: "LETS(name1, value1, name2, value2, ..., expression)", descriptionKey: "formula.fn.LETS.desc", example: '=LETS("a", 1, "b", 2, a + b)' },
```

This is a UI-only change in FormulaModal.ts. However, the spec says the diff should be confined to `ComputedField.ts` plus its tests (REQ-007). Adding FormulaModal entries would expand the diff scope. **Decision: FormulaModal entries are P2 — nice-to-have but out of scope for the isolated-diff model.**

### F12: EuroFormat Pattern — The Isolated-Module Integration Model

**Evidence**: [SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/data/EuroFormat.ts:1-42]

EuroFormat.ts is a 42-line self-contained module that:
1. Defines `Intl.NumberFormat` instances
2. Exports three pure functions: `formatEuroNumber`, `formatEuroNumber2`, `formatEuroCurrency`
3. Has NO imports from other modules (zero coupling)
4. Is imported by call sites that need Dutch number formatting

The spec says to follow this pattern: "new module under src plus 1-3 call-site edits, rebase-safe."

**For let/lets, the EuroFormat pattern maps to**:
- New module: `src/data/LetVariables.ts` — contains the let/lets transformation logic (pure functions)
- Call-site edit 1: `ComputedField.ts` — import and call the transform in `evaluateExpressionDetailed`
- Call-site edit 2 (optional): `FormulaModal.ts` — add help entries

BUT: The spec (REQ-007) says "The diff is confined to `ComputedField.ts` plus its tests." This means the let/lets logic should be IN ComputedField.ts, not a separate module. The EuroFormat pattern is the inspiration for the rebase-friendly approach, but the actual implementation is a single-file addition to createContext.

**Revised integration model**: Add `let`/`lets` as context functions directly in `createContext` (lines 135-380), using the string-based re-evaluation approach (Approach A). This keeps the diff to one file + tests, matching REQ-007.

---

## Dead Ends

### DE2: Arrow-IIFE Transform Approach (Approach B/C hybrid)
Transforming `let(name, value, expr)` → `((name) => expr)(value)` after the security check but before safeEval is architecturally elegant but introduces a security-bypass path: the transformed expression contains `=>` which is normally blocked. While the transform is trusted code, this creates a confusing security boundary where `=>` appears in the expression sent to safeEval but was blocked in the security check. **Ruled out** — too complex for the isolated-diff model, and the string-based approach is simpler.

### DE3: Modifying SafeEval's Call Evaluator (Approach C)
Adding a special case for let/lets in SafeEval's Call node evaluator would be the cleanest solution but directly violates REQ-004 (SafeEval.ts byte-identical). **Ruled out** — hard constraint.

---

## Questions Addressed
- **Q1 (ANSWERED)**: The eager-evaluation problem is solved by the string-based re-evaluation approach: `let("rate", 0.05, "amount * rate")` where the expression is a string literal that the let function re-parses and evaluates in the child scope. This requires NO SafeEval changes.
- **Q4 (PARTIAL)**: The EuroFormat pattern maps to a single-file addition in ComputedField.ts createContext, not a separate module. The diff is confined to ComputedField.ts + tests per REQ-007.

## Questions Raised
- How does the string-based approach handle nested let/lets calls?
- What happens with field references inside the string expression? (e.g., `let("rate", 0.05, "field('amount') * rate")`)
- Can the string-based approach support the multi-variable form `let("a", 1, "b", 2, "a + b")`?

---

## Ruled Out
- Arrow-IIFE transform after security check: introduces `=>` in safeEval input, confusing security boundary (iteration 2)
- Modifying SafeEval's Call evaluator: violates REQ-004 (iteration 2)

---

# Iteration 003 — Reference Repos: AppFlowy & Anytype Formula Systems

**Focus**: Deep-dive into AppFlowy and Anytype reference repos for formula variable binding. Confirm neither implements per-row formula expressions with let/lets. Document their aggregate column calculation systems and extract any reusable patterns.

**Iteration**: 3 of 10
**Status**: complete
**newInfoRatio**: 0.70
**noveltyJustification**: Confirmed both reference repos lack per-row formula expressions — they only have aggregate column calculations. New evidence from real source paths and lines.

---

## Findings

### F13: AppFlowy Has NO Per-Row Formula Fields — Only Aggregate Column Calculations

**Finding**: AppFlowy's database model has "calculations" (aggregate column-level summaries), NOT per-row formula expressions. There is no formula field type, no expression evaluator, and no let/lets variable binding anywhere in the codebase.

**Evidence**:
- [SOURCE: /Users/michelkerkmeester/MEGA/Development/Code_Environment/Public/specs/obsidian/002-note-db-notion-parity-build/context/appflowy/frontend/rust-lib/flowy-database2/src/services/calculations/service.rs:16-29]
```rust
pub fn calculate(&self, field: &Field, calculation_type: i64, cells: Vec<Arc<Cell>>) -> String {
    let ty: CalculationType = calculation_type.into();
    match ty {
      CalculationType::Average => self.calculate_average(field, cells),
      CalculationType::Max => self.calculate_max(field, cells),
      CalculationType::Median => self.calculate_median(field, cells),
      CalculationType::Min => self.calculate_min(field, cells),
      CalculationType::Sum => self.calculate_sum(field, cells),
      CalculationType::Count => self.calculate_count(cells),
      CalculationType::CountEmpty => self.calculate_count_empty(field, cells),
      CalculationType::CountNonEmpty => self.calculate_count_non_empty(field, cells),
    }
}
```

The 8 calculation types are: Average, Max, Median, Min, Sum, Count, CountEmpty, CountNonEmpty. These are **hardcoded enum variants**, not user-defined expressions. There is no expression parser, no variable binding, no let/lets.

- [SOURCE: /Users/michelkerkmeester/MEGA/Development/Code_Environment/Public/specs/obsidian/002-note-db-notion-parity-build/context/appflowy/frontend/appflowy_flutter/lib/plugins/database/application/calculations/calculation_type_ext.dart:5-23]
The Flutter UI mirrors the same 8 enum types with localized labels. No formula editor, no expression input.

- The calculations controller ([SOURCE: .../calculations/controller.rs:1-439]) manages when calculations recompute (on cell/row/field changes) but the computation itself is always one of the 8 hardcoded types.

**Implication**: AppFlowy provides ZERO reference value for let/lets implementation. Its calculation system is architecturally incompatible — it's column-aggregate, not row-expression. The only reusable pattern is the event-driven recalculation model (handle_cell_changed, handle_row_changed), but the fork already has its own evaluation pipeline.

### F14: Anytype Has NO Per-Row Formula Expressions — Only Aggregate Column Formulas

**Finding**: Anytype's "formula" system is identical in concept to AppFlowy's calculations — aggregate column-level summaries attached to view relations. There is no per-row formula expression engine, no expression parser, and no let/lets.

**Evidence**:
- [SOURCE: /Users/michelkerkmeester/MEGA/Development/Code_Environment/Public/specs/obsidian/002-note-db-notion-parity-build/context/anytype-ts/src/ts/interface/block/dataview.ts:104-119]
```typescript
export enum FormulaType {
    None             = 0,
    Count            = 1,
    CountValue       = 2,
    CountDistinct    = 3,
    CountEmpty       = 4,
    CountNotEmpty    = 5,
    PercentEmpty     = 6,
    PercentNotEmpty  = 7,
    MathSum          = 8,
    MathAverage      = 9,
    MathMedian       = 10,
    MathMin          = 11,
    MathMax          = 12,
    Range            = 13,
}
```

13 formula types — all aggregate column operations. No user-defined expressions.

- [SOURCE: /Users/michelkerkmeester/MEGA/Development/Code_Environment/Public/specs/obsidian/002-note-db-notion-parity-build/context/anytype-ts/src/ts/lib/dataview.ts:980-1054]
The `getFormulaResult` function computes formula values by switching on `formulaType` and applying hardcoded math (Math.min, Math.max, Math.sum, etc.) to record arrays. No expression parsing, no variable binding.

- [SOURCE: /Users/michelkerkmeester/MEGA/Development/Code_Environment/Public/specs/obsidian/002-note-db-notion-parity-build/context/anytype-ts/src/ts/lib/relation.ts:163-234]
The `formulaByType` function returns available formula options per relation type. For Number relations: Count, CountValue, CountDistinct, CountEmpty, CountNotEmpty, PercentEmpty, PercentNotEmpty, MathSum, MathAverage, MathMedian, MathMin, MathMax, Range. For Date relations: Count variants + MathMin, MathMax, Range. All hardcoded.

- [SOURCE: /Users/michelkerkmeester/MEGA/Development/Code_Environment/Public/specs/obsidian/002-note-db-notion-parity-build/context/anytype-ts/src/ts/interface/object.ts:36-51]
Anytype's RelationType enum has: LongText, ShortText, Number, Select, Date, File, Checkbox, Url, Email, Phone, Icon, MultiSelect, Object, Relations. **No "Formula" or "Computed" relation type** — formulas are a property of ViewRelation (display layer), not a relation type themselves.

**Implication**: Anytype provides ZERO reference value for let/lets implementation. Its formula system is a display-layer aggregate calculator, not a per-row expression engine. The only reusable pattern is the type-aware formula option filtering (different formula types available for different relation types), but this is irrelevant to let/lets.

### F15: Neither Reference Repo Has an Expression Evaluator

**Finding**: Neither AppFlowy nor Anytype has any form of expression parser, evaluator, or sandbox. AppFlowy's calculations are pure Rust functions. Anytype's formulas are pure TypeScript switch-case math. Neither has anything resembling SafeEval, a tokenizer, or an AST evaluator.

**Evidence**: Exhaustive grep for `formula`, `expression`, `eval`, `parse`, `token` across both repos' database code found only the aggregate calculation systems documented above. No expression parsing infrastructure exists in either repo.

**Implication**: The fork's SafeEval-based engine is unique among the three systems (fork, AppFlowy, Anytype). The let/lets implementation must be entirely self-derived — there are no reference implementations to mine for variable-binding patterns from either repo.

### F16: Reusable Pattern — Anytype's Formula Section Organization

**Finding**: Anytype organizes formula types into sections (Count, Percent, Math, Date) via `FormulaSection` enum.

**Evidence**: [SOURCE: /Users/michelkerkmeester/MEGA/Development/Code_Environment/Public/specs/obsidian/002-note-db-notion-parity-build/context/anytype-ts/src/ts/interface/block/dataview.ts:121-127]
```typescript
export enum FormulaSection {
    None    = 0,
    Count   = 1,
    Percent = 2,
    Math    = 3,
    Date    = 4,
}
```

**Implication**: While not directly applicable to let/lets, this section-based organization pattern could inform how the fork's FormulaModal categorizes let/lets in its function help panel (e.g., under "Logic" or a new "Variables" category).

---

## Dead Ends

### DE4: Mining AppFlowy for let/lets patterns
AppFlowy has no formula expression engine at all. Its calculations are hardcoded enum variants. **Ruled out** — no reference value.

### DE5: Mining Anytype for let/lets patterns
Anytype's "formula" system is aggregate column calculations, not per-row expressions. **Ruled out** — no reference value.

---

## Questions Addressed
- **Q3 (ANSWERED)**: Neither AppFlowy nor Anytype implements formula variable binding. Both have only aggregate column calculations (hardcoded enum types). No expression evaluator exists in either repo. The fork's SafeEval-based engine is unique.

## Questions Raised
- Since no reference repos have let/lets, are there other open-source projects with similar sandboxed expression evaluators that implement variable binding?
- What can we learn from the Notion formula 2.0 architecture (which supports let/lets) about the evaluation model?

---

## Ruled Out
- Mining AppFlowy for let/lets patterns: no formula expression engine exists (iteration 3)
- Mining Anytype for let/lets patterns: only aggregate column formulas, no per-row expressions (iteration 3)

---

# Iteration 004 — Re-evaluating the Approach: Nested-let Flaw & the `__let`-Helper Transform

**Focus**: Pressure-test the iteration-2 recommendation (string-based re-eval, Approach A) against nested `let` and the full Notion semantics. Trace SafeEval's parser to confirm whether the arrow-IIFE transform (Approach B) is actually viable. Derive the correct, sandbox-compatible mechanism.

**Iteration**: 4 of 10
**Status**: complete
**newInfoRatio**: 0.90
**noveltyJustification**: Reverses the iteration-2 recommendation with a fatal-flaw proof (nested let breaks Approach A), a parser-level refutation of the naive IIFE, and a corrected `__let`-helper transform that preserves Notion's natural syntax and supports nesting — all newly derived from source.

---

## Findings

### F17: Approach A (string-based re-eval) Has a FATAL Nested-`let` Flaw

**Finding**: The string-based approach recommended in iteration 2 cannot support nested `let` correctly, which Notion explicitly supports (iteration 1, F6: `let(firstName, "Monkey", let(lastName, "Luffy", firstName + " D. " + lastName))` = `"Monkey D. Luffy"`).

**Root cause**: In Approach A, `let` is a context function registered once in `createContext`. It closes over the `context` object — a fixed reference built per `evaluate()` call. To re-evaluate the string expression, it must build a child scope. The only scope it can derive from is `context` (plus re-imported globals), NOT the dynamic caller scope that SafeEval is actually using. SafeEval's `Call` evaluator invokes context functions via `callee.apply(thisObj, args)` with `thisObj = undefined` for plain identifier calls and passes NO scope reference:

- [SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/data/SafeEval.ts:1002-1018]
```typescript
} else {
    callee = evalNode(node.callee, scope);
    if (callee == null && node.optional) return undefined;
}
if (typeof callee !== "function") { ... }
const args: unknown[] = [];
for (const a of node.args) { ... args.push(evalNode(a, scope)); }
return (callee as { apply(...): unknown }).apply(thisObj, args);  // no scope passed
```

So when the outer `let("a", 1, "let(\"b\", 2, \"a + b\")")` re-parses its string, the inner `let` it invokes closes over the SAME fixed `context` (which has no `a`). The inner `let`'s child scope is derived from `context`, losing `a`. The binding chain breaks.

**A scope-stack patch exists but is inferior**: a module-private `scopeStack[]` with push in `evaluateExpressionDetailed` and push/pop in `let` would thread the live scope synchronously (JS is single-threaded, so no interleaving). But it introduces module-level mutable state, requires editing `evaluateExpressionDetailed`'s control flow, and still leaves the string-within-string UX problem. It is a workaround, not a clean design.

**Implication**: Approach A is ruled out as the primary design. The iteration-2 recommendation is reversed.

### F18: SafeEval CANNOT Parse a Double-Paren-Wrapped Arrow IIFE — Naive Approach B Refuted

**Finding**: The "cleanest" form of Approach B — transform `let("rate", 0.05, amount * rate)` into `((rate) => (amount * rate))(0.05)` — fails at parse time. SafeEval's `parseArrowFunction` expects an identifier list immediately after the opening `LParen`, so a doubly-parenthesized arrow is a SyntaxError.

**Evidence**:
- [SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/data/SafeEval.ts:807-822] — `isArrowFunction()` scans for balanced parens followed by `=>`; for `((rate) => …)` it returns true at the OUTER paren (depth hits 0 at the inner `)`'s matching `)`, next token is `=>`).
- [SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/data/SafeEval.ts:824-838]
```typescript
private parseArrowFunction(): ASTNode {
    this.expect(TT.LParen);          // consumes OUTER "("
    const params: string[] = [];
    if (this.peek().type !== TT.RParen) {
        params.push(this.expect(TT.Ident).value);  // ← peek is "(" (inner), NOT Ident → SyntaxError
        ...
    }
    ...
}
```

Trace for `((rate) => (amount * rate))(0.05)`: `isArrowFunction` returns true → `parseArrowFunction` consumes the outer `(`, then `peek` is the inner `(` which is not `Ident` and not `RParen` → `this.expect(TT.Ident)` throws `SyntaxError`.

**Secondary refutation — unwrapped arrow IIFE is greedy**: Even without double parens, `(rate) => (amount * rate)(0.05)` fails differently. `parseCallMember` ([SOURCE: SafeEval.ts:654-694]) loops on `LParen` after `parsePrimary`, so the arrow body `parseExpression()` greedily consumes `(amount * rate)(0.05)` as a `Call` on the product `(amount * rate)` — calling a number as a function → `TypeError` at eval time.

**Implication**: The naive arrow-IIFE transform is impossible in SafeEval without modifying the parser (forbidden by REQ-004). A helper-function bridge is required.

### F19: The Correct Approach — `__let` Helper + Arrow-as-Argument Transform

**Finding**: The viable sandbox-compatible design transforms `let`/`lets` calls into a call on a tiny trusted helper `__let`, passing the expression as an **arrow function in argument position** and the values as trailing arguments:

- `let("rate", 0.05, amount * rate)` → `__let((rate) => amount * rate, 0.05)`
- `lets("a", 1, "b", 2, a + b)` → `__let((a, b) => a + b, 1, 2)`
- `let("a", 1, "b", 2, a + b)` (multi-var `let`) → `__let((a, b) => a + b, 1, 2)`

**Why the arrow parses correctly in argument position**: `parseArg` → `parseExpression` → `parsePrimary` sees `(`, `isArrowFunction()` returns true for `(rate) =>`, `parseArrowFunction` consumes `(rate) =>`, then `body = parseExpression()` parses `amount * rate` and **stops at the comma** (comma is the arg separator, not consumed by `parseExpression`). The arrow is a complete argument; `0.05` is the next arg.

- [SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/data/SafeEval.ts:710-716] — `parseArg` delegates to `parseExpression`; the comma terminates it.
- [SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/data/SafeEval.ts:696-708] — `parseCallArgs` consumes commas between args.

**Why nested `let` works**: SafeEval's `Arrow` evaluator creates a child scope via `Object.create(scope)` and binds params, then evaluates the body in that child:
- [SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/data/SafeEval.ts:1043-1050]
```typescript
case "Arrow":
    return (...args: unknown[]) => {
        const childScope = Object.create(scope) as Record<string, unknown>;
        for (let i = 0; i < node.params.length; i++) {
            childScope[node.params[i]] = args[i];
        }
        return evalNode(node.body, childScope);
    };
```

For `let("a", 1, let("b", 2, a + b))` → transform (innermost first) → `__let((a) => __let((b) => a + b, 2), 1)`:
1. Outer `__let` called with `fn = (a) => __let((b) => a + b, 2)`, vals = `[1]`.
2. `__let` calls `fn(1)` → Arrow evaluator builds `childScope1 = Object.create(scope)` with `a = 1`, evaluates body `__let((b) => a + b, 2)` in `childScope1`.
3. Inner `__let` called with `fn2 = (b) => a + b` (closure over `childScope1`), vals = `[2]`.
4. `__let` calls `fn2(2)` → Arrow evaluator builds `childScope2 = Object.create(childScope1)` with `b = 2`, evaluates `a + b` → `a` resolves via prototype chain to `childScope1.a = 1`, `b = 2` → `3`. ✅

This matches Notion's nested-let semantics exactly (iteration 1, F6).

**The helper** (registered in `createContext`):
```typescript
// Bridges let/lets: apply an arrow's bound names to its values, then run the body.
// The transform in evaluateExpressionDetailed rewrites let/lets calls into __let calls.
__let: (fn: (...args: unknown[]) => unknown, ...vals: unknown[]) => fn(...vals),
```

`__let` is a plain JS context function; `fn(...vals)` uses JS spread (not SafeEval spread), so no parser support is needed for the helper itself.

### F20: The Transform Requires a Bracket/String-Aware Scanner (Regex Is Insufficient)

**Finding**: Rewriting `let(...)`/`lets(...)` into `__let(...)` requires correctly splitting the argument list at the TOP-LEVEL commas of the call — commas inside nested calls, array literals, or string literals must NOT split arguments. A regex cannot do this reliably.

**Counter-example**: `let("a", f(x, y), a + 1)` — a comma-split regex would break `f(x, y)` into two args. `let("a", "x,y", a)` — a comma regex would break the string literal `"x,y"`. `let("a", 1, "let(b")` — a `let(` substring regex would false-match inside the string.

**Required scanner** (~35-45 lines, confined to `ComputedField.ts` or a new `LetVariables.ts` module):
1. Walk the string tracking depth across `(` `[` `{` (and their closers).
2. Skip string-literal contents (`"` and `'`, honoring `\` escapes) and template literals.
3. At depth 1 inside a `let(`/`lets(` call, split on top-level commas.
4. The last segment is the expression; preceding segments are alternating name/value pairs.
5. Recurse: transform the expression segment first (it may contain nested `let`/`lets`), then emit `__let((<names>) => <transformedExpr>, <values>)`.

**Implication**: This is the single non-trivial implementation cost. It is self-contained, pure, testable, and rebase-friendly — matching the EuroFormat isolated-module spirit (a new `src/data/LetVariables.ts` exporting `transformLetCalls(formula: string): string`, plus 1 call-site edit in `evaluateExpressionDetailed`).

### F21: Security Ordering Is Sound — Transform Runs AFTER the Security Check

**Finding**: The transform introduces `=>` (banned by `validateFormulaSecurity` at line 504-506) into the string sent to `safeEval`. This is safe ONLY if the transform runs after the security check on the ORIGINAL user formula.

**Evidence / ordering**:
- [SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/data/ComputedField.ts:425-441]
```typescript
const normalizedExpr = this.normalizeFormula(expr);          // 1. normalize [field]→field("…")
...
const securityError = this.validateFormulaSecurity(normalizedExpr);  // 2. security on USER formula (no =>)
if (securityError) return { value: null, error: securityError };
...
const result = safeEval(normalizedExpr, scope);              // 3. eval
```

The injected step sits between 2 and 3:
```typescript
const securityError = this.validateFormulaSecurity(normalizedExpr);
if (securityError) return { value: null, error: securityError };
const transformedExpr = transformLetCalls(normalizedExpr);   // NEW: trusted transform, may emit =>
const result = safeEval(transformedExpr, scope);             // eval the transformed form
```

**Why this is sound** (mirrors the existing trusted-transform pattern):
- `normalizeFormula` already performs a trusted rewrite (`[field]` → `field("…")`) before `safeEval` without re-validation — precedent for trusted transforms between security and eval.
- The user's original formula never contains `=>` (blocked at step 2). Any `=>` in `transformedExpr` was introduced by trusted code, not user input.
- Dangerous tokens (`while`, `for`, `function`, `constructor`, etc.) in the user's expression are caught at step 2 BEFORE the transform runs; the transform only wraps already-checked user text into an arrow body, it does not synthesize new dangerous tokens.
- The arrow body is the user's own expression (already security-scanned); the transform only adds the `(<names>) =>` preamble and the `__let(…, <values>)` envelope.

**Caveat to verify in implementation**: the security scan is a set of `\b…\b` regexes on the raw string. A name like `let` is not in the dangerous-token list, and `__let` is introduced post-scan. Confirm no user-chosen variable name can smuggle a dangerous token that the regex would miss inside the transformed arrow body — since the body is verbatim user text already scanned, this holds.

### F22: This Approach Preserves Notion's Natural Syntax — Major UX Win Over Approach A

**Finding**: With the `__let`-helper transform, the user writes `let("rate", 0.05, amount * rate)` — the expression is a real expression, NOT a string literal. This matches Notion's syntax exactly (iteration 1, F6: `let(radius, 4, round(pi() * radius ^ 2))`).

Contrast with Approach A, which required `let("rate", 0.05, "amount * rate")` — a string-within-string that:
- Loses syntax highlighting / validation on the inner expression.
- Forces nested-quote escaping: `let("a", 1, "let(\"b\", 2, \"a + b\")")`.
- Diverges from Notion's syntax, harming parity and learnability.

**Implication**: The `__let`-helper transform is superior on BOTH correctness (nested let) AND UX (natural syntax). Approach A is fully superseded.

---

## Dead Ends

### DE6: String-based re-eval (Approach A) as the primary design
Fatal nested-let flaw (F17); the let context function cannot access the dynamic caller scope, so inner let loses outer bindings. A scope-stack patch works but adds module-global mutable state and retains the string-within-string UX cost. **Ruled out as primary**; retained only as a fallback if the transform proves unimplementable.

### DE7: Naive arrow-IIFE transform `((rate) => body)(value)`
SafeEval's `parseArrowFunction` rejects doubly-parenthesized arrows (F18), and the unwrapped form is greedily mis-parsed as a call on the body. **Ruled out** — requires the `__let`-helper bridge (F19).

---

## Questions Addressed
- **Q1 (REVISED/ANSWERED)**: The eager-evaluation problem is solved NOT by string-based re-eval but by the `__let`-helper transform: rewrite `let/lets` into `__let((<names>) => <expr>, <values>)` after the security check. SafeEval's native Arrow child-scope handles binding; no SafeEval changes; nested let works.
- **Q4 (ANSWERED)**: The rebase-safe integration is a new pure module `src/data/LetVariables.ts` exporting `transformLetCalls()`, plus ONE call-site edit in `evaluateExpressionDetailed` (insert the transform between `validateFormulaSecurity` and `safeEval`), plus the `__let` helper in `createContext`. This is the EuroFormat isolated-module pattern (new module + 1-3 call-site edits).

## Questions Raised
- How does the transform handle `let`/`lets` used as a substring inside string literals or member access (e.g., `obj.let`, `"let"`)?
- What happens when a user names a variable `__let` or `let`?
- Does the transform interact correctly with `iferror(let(...))` and phase-004 `if`/`switch` composition?
- Exact error behavior for malformed `let()` (wrong arg count, non-string name) — does the transform surface a clean error or a SafeEval SyntaxError?

---

## Ruled Out
- String-based re-eval (Approach A) as primary design: fatal nested-let flaw, let closes over fixed context not dynamic scope (iteration 4, evidence: SafeEval.ts:1002-1018, 1043-1050)
- Naive arrow-IIFE `((rate) => body)(value)`: SafeEval parseArrowFunction rejects double-paren arrows (iteration 4, evidence: SafeEval.ts:824-838)

---

# Iteration 005 — Edge Cases & Error Paths for the `__let`-Helper Transform

**Focus**: Map every spec edge case (§8) and REQ-005 error path onto the `__let`-helper transform design. Confirm each surfaces through the engine's standard error path, not a crash. Cover self-reference, built-in collision, malformed arg counts, non-string names, deep nesting, substring/member-access safety, user variables named `let`/`__let`, and field references inside the expression.

**Iteration**: 5 of 10
**Status**: complete
**newInfoRatio**: 0.75
**noveltyJustification**: First systematic edge-case analysis grounded in the tokenizer (let is not a keyword), the Ident resolver (undefined-not-throw), the Arrow shadowing mechanism, and formatEvaluationError's error mapping — produces concrete REQ-005 error-path verdicts and two transform-side validation recommendations.

---

## Findings

### F23: `let`/`lets` Are NOT SafeEval Keywords — They Tokenize as Plain Identifiers

**Finding**: SafeEval's tokenizer special-cases only `true`, `false`, `null`, `undefined`, `typeof` as keyword tokens. `let` and `lets` fall through to the default identifier branch.

**Evidence**:
- [SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/data/SafeEval.ts:258-269]
```typescript
// ── identifiers / keywords ──
...
switch (id) {
    case "true": tokens.push({ type: TT.True, value: id }); break;
    case "false": tokens.push({ type: TT.False, value: id }); break;
    case "null": tokens.push({ type: TT.Null, value: id }); break;
    case "undefined": tokens.push({ type: TT.Undef, value: id }); break;
    case "typeof": tokens.push({ type: TT.Typeof, value: id }); break;
    default: tokens.push({ type: TT.Ident, value: id });  // let/lets land here
}
```
- The `TT` enum ([SOURCE: SafeEval.ts:16-60]) has no `Let`/`Lets` token.

**Implications**:
1. The transform matches `let(`/`lets(` as ordinary call expressions — there is no keyword ambiguity to resolve.
2. `let` can be used as a variable name AND as an arrow param name: `__let((let) => let + 1, 5)` parses (`parseArrowFunction` expects `Ident`, and `let` is an `Ident`). This matters for F30.
3. `ComputedField.RESERVED` (line 93-98) lists `let` — but that set only filters **frontmatter keys** (line 143), not SafeEval parsing and not context-function registration. No conflict with the transform.

### F24: Self-Reference `let("a", a, a)` Resolves the Value Against the Caller Scope (Matches Notion Intent)

**Finding**: With the transform, `let("a", a, a)` → `__let((a) => a, a)`. The trailing value `a` is eagerly evaluated by SafeEval in the **caller scope** before `__let` runs; the arrow body `a` reads the **param** `a`.

**Evidence**:
- SafeEval `Ident` resolution returns the scope property, `undefined` if absent — it does NOT throw:
- [SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/data/SafeEval.ts:935-936]
```typescript
case "Ident":
    return scope[node.name];
```
- Eager arg evaluation in caller scope: [SOURCE: SafeEval.ts:1010-1017].

**Behavior verdict**:
- If `a` exists in the caller scope (a field or built-in), the value binds that; the expr returns it. `let("amount", amount, amount * 2)` doubles the field — sensible.
- If `a` does NOT exist in the caller scope, `scope["a"]` → `undefined`; `__let` binds `a = undefined`; the arrow body returns `undefined`. **No error is thrown** — the result is `undefined`, which downstream arithmetic turns into `NaN` (via `toNumber`, SafeEval.ts:1106-1108).

**Spec alignment**: The spec (§8 Data Boundaries) marks self-reference behavior "UNKNOWN — confirm during implementation" and leans toward "resolves against the caller scope." The transform satisfies that lean. The open question is whether **Notion errors** on `let("a", a, a)` when `a` is unbound (iteration 8 will confirm via WebFetch). If Notion errors, the fork can add an optional unbound-name check without changing the transform's structure.

### F25: Name Collision With a Built-in Shadows Correctly and Errors Cleanly

**Finding**: `let("round", 5, round(3.14))` → `__let((round) => round(3.14), 5)`. The Arrow evaluator creates `childScope = Object.create(scope)` then sets `childScope.round = 5`, shadowing the built-in `round` within the body. `round(3.14)` then attempts to call `5` as a function.

**Evidence**:
- Arrow shadowing: [SOURCE: SafeEval.ts:1043-1050] (`childScope[node.params[i]] = args[i]` overwrites on the child, prototype still holds the built-in).
- Calling a non-function throws `TypeError`: [SOURCE: SafeEval.ts:1006-1008] (`throw new TypeError(\`${name} is not a function\`)`).
- `formatEvaluationError` maps `TypeError "... is not a function"` to the user-facing `formula.error.notFunction`:
- [SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/data/ComputedField.ts:527-531]
```typescript
if (errorName === "TypeError") {
    if (message.includes("is not a function")) {
        const fnMatch = message.match(/([A-Za-z_$][A-Za-z0-9_$]*) is not a function/);
        if (fnMatch) return t("formula.error.notFunction", { name: fnMatch[1] });
    }
    ...
```

**Verdict**: REQ-005 satisfied — the collision surfaces through the engine's standard error path as a localized "round is not a function" message. This also matches Notion's inner-shadowing semantics (iteration 1, F6). No special handling needed.

### F26: Malformed Argument Count — Transform Must Validate (Odd count ≥ 3)

**Finding**: `let`/`lets` semantics require an alternating name/value sequence plus a final expression, i.e. an **odd** argument count ≥ 3 (one pair + expr; or N pairs + expr). Even counts (`lets("a", 1)` — 2 args; `let("a", 1, "b", 2)` — 4 args) have no expression.

**Two surfacing options**:
- **(a) Let it fail in SafeEval**: emit `__let((a) => , 1)` (empty body) → `parseExpression` throws `SyntaxError("Unexpected token ','")` → `formatEvaluationError` maps to `formula.error.unexpectedToken` ([SOURCE: ComputedField.ts:520-523]). Works, but the message is generic and points at a comma the user never wrote (the comma is in the transformed form).
- **(b) Transform-side validation (RECOMMENDED)**: `transformLetCalls` checks arg count before emitting; on violation throw a typed `Error` (e.g. `new Error("let: missing expression")`) that `evaluateExpressionDetailed` catches and maps to a dedicated `formula.error.letArgCount` i18n key. Cleaner, REQ-005-aligned, and the error references the user's actual `let`/`lets` call.

**Recommendation**: Option (b). The transform already parses the arg list (F20); adding a count check is ~3 lines and gives a precise, localizable error. `evaluateExpressionDetailed` already wraps `safeEval` in try/catch (line 440-452) — extend the same try/catch (or a sibling one) around `transformLetCalls`.

### F27: Non-String Name `let(5, 1, 2)` — Transform Must Validate Name Shape

**Finding**: `let(5, 1, 2)` → the transform would extract `5` as the name text and emit `__let((5) => 2, 1)`. `parseArrowFunction` does `this.expect(TT.Ident)` but the token is `TT.Number` → `SyntaxError` → `formula.error.unexpectedToken`.

**Evidence**: [SOURCE: SafeEval.ts:826-828] (`params.push(this.expect(TT.Ident).value)` — throws on non-Ident).

**Recommendation**: Transform-side validation (REQ-005). Each name argument must be a **string literal** whose content matches `[a-zA-Z_$][a-zA-Z0-9_$]*`. The transform sees the raw source (e.g. `"rate"` or `5`); it should:
1. Require the name segment to start with a quote (`"` or `'`).
2. Extract the string content and test the identifier regex.
3. On failure, throw a typed `Error` mapped to `formula.error.letName` (or reuse `formula.error.typeError`).

This also rejects `let("a b", 1, 2)` (space in name) and `let("", 1, 2)` (empty name) with a clear message, rather than a downstream parse error. ~6 lines in the transform.

### F28: Deep Nesting Is Correct, Deterministic, and Concurrent-Safe

**Finding**: `let("a", 1, let("b", 2, let("c", 3, a + b + c)))` → `__let((a) => __let((b) => __let((c) => a + b + c, 3), 2), 1)`. Each `Arrow` invocation creates a fresh `childScope = Object.create(<current scope>)`; identifiers resolve up the prototype chain.

**Evidence**: [SOURCE: SafeEval.ts:1043-1050] — a new `childScope` per Arrow call; no shared mutable state; `evalNode` is pure over `(node, scope)`.

**Verdicts**:
- **Correctness**: `a`, `b`, `c` each resolve via the prototype chain (a from scope-1, b from scope-2, c from scope-3). Matches Notion nested-let (iteration 1, F6).
- **NFR-R01 (deterministic)**: identical formula + data → identical results; no randomness, no external state.
- **Concurrent operations (spec §8)**: each formula evaluation builds its own scope tree; per-call child scopes mean concurrent renders share no state. Safe.
- **Spec §8 "Deeply nested let/lets chains → one child scope per call; no shared mutable state"**: satisfied by construction.

### F29: Substring & Member-Access Safety — Scanner Constraints

**Finding**: The transform's scanner must avoid false matches on `let`/`lets` appearing inside strings, inside identifiers, or as member-access names.

**Required scanner rules** (refining F20):
1. **String/template skipping**: do not match `let(`/`lets(` inside `"..."`, `'...'`, or `` `...` `` (honor `\` escapes and template `${}`). Otherwise `concat("let", "x")` and `let("a", "let(b", a)` would be mis-transformed.
2. **Identifier boundary**: match `let`/`lets` only when preceded by a non-identifier char (or start-of-string) and followed by `(`. This prevents matching `lets` inside `letsub` or `let` inside `lets` (the scanner must check `lets` before `let` to avoid `let` matching the prefix of `lets`).
3. **Member-access exclusion**: do not match `let(`/`lets(` when the identifier is immediately preceded by `.` (e.g. `obj.let(x)` is a method call on `obj`, not the let construct). Track the last significant non-space char.

**Evidence for why this matters**: `extractDependencies` already does comparable string/template-aware scanning via `scanFormulaSegments` ([SOURCE: ComputedField.ts:390-399, 384-388 comment]) — precedent that the fork already maintains a segment scanner respecting strings, member access, and call detection. The let-transform scanner can reuse the same discipline.

**Counter-example handled**: `let("a", "x,y", a)` — the top-level comma splitter must skip the comma inside `"x,y"` (rule 1), yielding args `["a"]`, `["x,y"]`, `[a]` → `__let((a) => a, "x,y")` → returns `"x,y"`. Correct.

### F30: User Variables Named `let` or `__let` — Low Risk, Mark Internal

**Finding**:
- **`let` as a bound name**: `let("let", 5, let + 1)` → `__let((let) => let + 1, 5)`. Because `let` is a plain `Ident` (F23), this parses and evaluates to `6`. Confusing for readers but valid and consistent. No action required; optionally the FormulaModal help can discourage shadowing `let`.
- **`__let` reached directly by the user**: a user writing `__let((a) => a, 5)` is blocked at `validateFormulaSecurity` because of the `=>` (line 504-506). Writing `__let(1, 2)` (no arrow) calls the helper with `fn = 1` → `1(...[])` → `TypeError` → `formula.error.notFunction`. So `__let` is effectively unreachable for legitimate use except to error.

**Recommendation**: Treat `__let` as internal — underscore-prefix signals "do not call directly," and it should NOT appear in `FormulaModal`'s `FUNCTIONS` help registry (keeps the REQ-007 diff focused; help entries are P2 per iteration 2, F11). No security risk because the `=>` ban gates the useful path.

### F31: Field References Inside the Expression Compose Correctly (normalizeFormula Ordering)

**Finding**: `let("rate", 0.05, [amount] * rate)` and `let("rate", 0.05, field("amount") * rate)` both work because `normalizeFormula` runs BEFORE the transform.

**Evidence / ordering**:
- `normalizeFormula` converts `[amount]` → `field("amount")`: [SOURCE: ComputedField.ts:549-555].
- `field` is a context function on the scope: [SOURCE: ComputedField.ts:150] (`field: (name) => this.getFieldValue(...)`).
- The arrow body evaluates `field("amount") * rate` in `childScope = Object.create(scope)`; `field` resolves via the prototype chain to the context function; `rate` resolves to the bound param. `getFieldValue` (line 557-588) returns the coerced frontmatter/computed value.

**Pipeline order (confirmed correct)**: `normalizeFormula` (1) → `validateFormulaSecurity` (2) → `transformLetCalls` (3, NEW) → `safeEval` (4). The transform sees already-normalized field references, and the security check sees the user's original text (no `=>`).

---

## Dead Ends

### DE8: Relying on SafeEval SyntaxError for arg-count/name errors (option a in F26/F27)
Surfaces as a generic `unexpectedToken` pointing at a comma/paren the user never wrote — fails REQ-005's "consistent with existing engine errors" spirit and is unlocalizable to the let context. **Ruled out** in favor of transform-side validation.

---

## Questions Addressed
- **Q5 (ANSWERED)**: All spec §8 edge cases mapped to verdicts:
  - Missing expr / wrong arg count → transform-side validation → `formula.error.letArgCount` (F26).
  - Non-string name → transform-side validation → `formula.error.letName` (F27).
  - Self-reference → resolves value against caller scope (undefined if unbound, no throw); Notion error-behavior to confirm in iter 8 (F24).
  - Built-in collision → clean `notFunction` error via existing path (F25).
  - Deep nesting → correct via Object.create chain, deterministic, concurrent-safe (F28).
  - Unknown name in expr → existing unknown-identifier path (`undefined` → downstream `NaN`/TypeError, or `undefinedVar` if the engine throws — confirm) (F24).
  - Substring/member-access → scanner rules prevent false matches (F29).

## Questions Raised
- Does Notion throw on `let("a", a, a)` when `a` is unbound, or return null/undefined? (iter 8 WebFetch)
- Does the engine throw on an unknown bare identifier, or return undefined? `formatEvaluationError` maps `"X is not defined"` (line 516-517) — but SafeEval `Ident` returns `scope[name]` (undefined, no throw). Need to confirm whether unknown idents ever throw (e.g., via a `with`-like proxy or strict-mode check) — affects whether `let("rate", 0.05, rat * 1)` (typo `rat`) errors or silently returns NaN. (iter 8/10)
- Exact i18n keys to add (`formula.error.letArgCount`, `formula.error.letName`) and their locale entries — implementation detail for the build phase.

---

## Ruled Out
- Relying on SafeEval SyntaxError for let arg-count/name validation: generic, unlocalizable, points at transformed text not user input (iteration 5, evidence: ComputedField.ts:520-523, SafeEval.ts:826-828)

---

# Iteration 006 — UI/UX: FormulaModal Help, Natural Syntax, Discoverability, i18n

**Focus**: Q6. How let/lets surfaces in the FormulaModal editor — function-help registry, syntax highlighting, the natural-syntax UX advantage, error presentation, i18n key additions across all locales, and the REQ-007 diff-scope tension that help entries create.

**Iteration**: 6 of 10
**Status**: complete
**newInfoRatio**: 0.65
**noveltyJustification**: First UI/UX pass grounded in the real FUNCTIONS registry, FUNCTION_NAMES highlight set, the 3-locale i18n structure, and FormulaValidationState error path — surfaces a real REQ-007 diff-scope decision and a discoverability gap.

---

## Findings

### F32: The `__let` Transform's Natural Syntax Is a Major UX Win — Existing Editor Features Work Unmodified

**Finding**: Because the user writes `let("rate", 0.05, amount * rate)` with the expression as a **real expression** (not a string literal), every existing FormulaModal editor feature continues to work on the let expression natively:
- Bracket matching (`matchedBracketIndexes`, line 128) works on the let call's parens.
- Field autocomplete / property suggestions (`propertySuggestEl`) trigger on `[` inside the expression.
- Syntax highlighting treats `amount`, `rate` as normal identifiers.
- The live preview (`previewOutput`/`previewStatus`) evaluates the real expression.

**Contrast with Approach A** (string-based, ruled out in iter 4): `let("rate", 0.05, "amount * rate")` would have rendered the inner expression as an opaque string — no highlighting, no autocomplete, no bracket matching inside it, and nested-quote escaping for the user. The `__let` transform avoids all of this by construction.

**Evidence**: The editor operates on the raw expression text via `scanFormulaSegments` ([SOURCE: FormulaModal.ts:16]) and `ComputedFieldEngine` evaluation; it never sees the transformed `__let(...)` form (the transform runs inside `evaluateExpressionDetailed`, downstream of the editor). So the editor and the user both see the natural `let(...)` syntax.

**Implication**: Zero editor-code changes are required for the core feature to be usable. This is a decisive UX reason to prefer the `__let` transform over Approach A.

### F33: FormulaModal Function-Help Registry — Adding let/lets Entries (P2, REQ-007 Scope Tension)

**Finding**: The `FUNCTIONS` array ([SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/views/modals/FormulaModal.ts:60-105]) drives the function-help panel. Each entry needs `categoryKey`, `name`, `signature`, `descriptionKey`, `example`. Proposed entries:

```typescript
{ categoryKey: "formula.catLogic", name: "LET", signature: "LET(name, value, expression)", descriptionKey: "formula.fn.LET.desc", example: '=LET("rate", 0.05, [amount] * rate)' },
{ categoryKey: "formula.catLogic", name: "LETS", signature: "LETS(name1, value1, name2, value2, ..., expression)", descriptionKey: "formula.fn.LETS.desc", example: '=LETS("a", 1, "b", 2, a + b)' },
```

**REQ-007 tension**: REQ-007 confines the diff to "`ComputedField.ts` plus its tests." Adding help entries touches `FormulaModal.ts` AND `src/i18n.ts` (new `formula.fn.LET.desc` / `formula.fn.LETS.desc` keys). This strictly expands the scoped diff.

**Recommendation (decision for the user)**:
- **Core (REQ-007-scoped)**: `LetVariables.ts` + `ComputedField.ts` call-site + `__let` helper + tests. Ships the working feature.
- **Follow-on P2 diff (separate commit)**: `FormulaModal.ts` help entries + `i18n.ts` keys. Ships discoverability.
- Rationale: keeps the core rebase-friendly single-surface diff intact (the EuroFormat model's whole point), while still delivering discoverability as a small, independently-rebasable follow-on. The user should approve splitting the diff this way since REQ-007 is a hard scope constraint.

**Category choice**: Reuse `formula.catLogic` (let/lets are scoping/logic constructs). A new `formula.catVars` category is possible (Anytype's section pattern, iter 3 F16) but adds another i18n key and a `FUNCTION_CATEGORY_KEYS`/`HELP_CATEGORY_KEYS` edit ([SOURCE: FormulaModal.ts:108-109]) — more scope churn for little gain. Recommend `catLogic`.

### F34: FUNCTION_NAMES Highlight Set — let/lets Won't Highlight Until Added

**Finding**: `FUNCTION_NAMES = new Set(FUNCTIONS.flatMap((fn) => [fn.name, fn.name.toLowerCase()]))` ([SOURCE: FormulaModal.ts:110]) is derived from `FUNCTIONS`. It drives whether a token is recognized as a known function name (for highlighting/suggestion filtering). Until let/lets are added to `FUNCTIONS`, the editor will render `let`/`lets` as plain identifiers, not as known functions.

**Evidence**: The set is consumed in the editor's token-classification path (the same `FUNCTIONS`/`FUNCTION_NAMES` are referenced for suggestion matching and highlighting).

**Implication**: Minor cosmetic gap only — the feature still works; `let`/`lets` just don't get function-name styling. Fixed automatically when F33's help entries land (they populate `FUNCTIONS` and thus `FUNCTION_NAMES`). No separate work item.

### F35: Error Presentation Reuses the Existing Preview-Status Path — Needs 3-Locale i18n Keys

**Finding**: The new transform-side errors (F26 `letArgCount`, F27 `letName`) flow through the existing error pipeline: transform throws → `evaluateExpressionDetailed` catches → returns `{ value: null, error }` → `formatEvaluationError`/`t()` → `FormulaValidationState.message` → rendered in `previewStatus`/`previewDetails`. No new UI mechanism is required.

**Evidence**:
- Error return shape: [SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/data/ComputedField.ts:450] (`return { value: null, error: this.formatEvaluationError(...) }`).
- i18n has **three locales** — English (~line 1108), zh-CN (~line 2580), zh-TW (~line 4098) — each carrying the full `formula.error.*` set, e.g. `formula.error.notFunction` and `formula.error.noArrowFunction` appear in all three:
  - [SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/i18n.ts:1180,1190 (en); 2652,2662 (zh-CN); 4170,4180 (zh-TW)]

**Required new i18n keys** (all 3 locales):
- `formula.error.letArgCount` — e.g. en: `"LET/LETS needs an odd number of arguments (name/value pairs plus a final expression)."`
- `formula.error.letName` — e.g. en: `"LET/LETS variable names must be quoted strings matching [A-Za-z_][A-Za-z0-9_]*."`
- (Optional, if a dedicated Notion-divergence unbound-name check is added in iter 8: `formula.error.letUnbound`.)

**Implication**: These keys live in `i18n.ts`, which is outside REQ-007's `ComputedField.ts`-only scope — same follow-on P2 diff as F33. The transform itself throws plain `Error`s with stable messages; the i18n mapping happens in `evaluateExpressionDetailed`'s catch (extend `formatEvaluationError` or a small `formatTransformError` helper in `ComputedField.ts` — the latter keeps the mapping in-scope while only the string translations live in `i18n.ts`).

### F36: Discoverability Gap If Help Entries Are Deferred

**Finding**: The function-help panel is the primary discovery surface for formula capabilities (users browse categories → click a function → see signature + example). Without let/lets entries, the feature is invisible in the UI — users would only know it exists from external docs.

**Implication**: Deferring F33 to P2 means the feature ships "working but undiscoverable." For a Notion-parity feature aimed at migration users (the parent packet's intent), discoverability matters. **Recommendation**: treat the help entries + i18n as a strongly-coupled P2 that ships in the same PR but as a separately-rebasable commit, OR relax REQ-007 with user approval to include `FormulaModal.ts` + `i18n.ts`. This is a user decision (see F33).

### F37: Example Formulas Must Use Fork-Native Operators, Not Notion's `^`

**Finding**: Notion's docs use `^` for exponentiation (e.g. `let(radius, 4, round(pi() * radius ^ 2))`). The fork's SafeEval tokenizes `^` as... it is NOT in the operator set — `Pow` is `**` (`TT.Pow`, [SOURCE: SafeEval.ts:32]). So a literal Notion example with `^` would fail in the fork.

**Evidence**: SafeEval `TT` has `Pow` mapped to `**` (line 32); there is no `^`/caret power operator in the binary evaluator ([SOURCE: SafeEval.ts:961-977] — no `^` case). `^` would tokenize as... likely `BitXor`? Checking the TT enum there is no xor token, so `^` is likely an unrecognized char → `SyntaxError`, or tokenized differently. Either way, `^` is not power in the fork.

**Recommendation**: Help examples must use fork-native forms — `pow(x, 2)` or `x ** 2`, not `x ^ 2`. Proposed examples:
- `=LET("rate", 0.05, [amount] * rate)`
- `=LETS("a", 1, "b", 2, a + b)`
- `=LET("r", 4, round(pi() * r ** 2))` (or `pow(r, 2)`)

**Implication**: Parity is *semantic* (let/lets binding), not *literal syntax* for operators. The help text should call out that the expression body uses the fork's existing expression syntax.

### F38: FormulaExampleHelp — Optional Example-List Entry

**Finding**: Besides `FUNCTIONS`, there is a separate `FormulaExampleHelp` shape ([SOURCE: FormulaModal.ts:32-36]) for the "Examples" category (`formula.catExamples`). A let/lets example could be added there too (name, description, expression) for extra discoverability.

**Implication**: Nice-to-have, same P2 scope as F33. Lower priority than the `FUNCTIONS` entries themselves.

---

## Dead Ends

### DE9: A new `formula.catVars` category
Adds an i18n key + edits `FUNCTION_CATEGORY_KEYS`/`HELP_CATEGORY_KEYS` (FormulaModal.ts:108-109) for little gain over reusing `formula.catLogic`. **Ruled out** — reuse `catLogic`.

---

## Questions Addressed
- **Q6 (ANSWERED)**: UI/UX considerations:
  - Natural syntax means zero editor changes needed (F32) — decisive advantage of the `__let` transform.
  - Help entries in `FUNCTIONS` are needed for discoverability but expand the diff beyond REQ-007 (F33) — user decision on splitting P2.
  - `FUNCTION_NAMES` highlighting auto-fixes when help entries land (F34).
  - Errors reuse the existing preview-status path; need 3-locale i18n keys (F35).
  - Discoverability gap if help deferred (F36).
  - Examples must use fork-native operators (`**`/`pow`, not Notion's `^`) (F37).

## Questions Raised
- Does the user want REQ-007 relaxed to include `FormulaModal.ts` + `i18n.ts`, or a split P2 commit? (user decision — surfaced for synthesis)
- Is there a `^` caret handling anywhere (bitwise xor or error) that examples should avoid? Confirm in iter 10 test strategy.

---

## Ruled Out
- New formula.catVars category: extra scope churn for little gain over catLogic (iteration 6, evidence: FormulaModal.ts:108-109)

---

# Iteration 007 — Mobile/iCloud Safety, Forkability & Phase-004 Composition

**Focus**: Confirm the NFRs (display-only, mobile-safe, iCloud-safe, rebase-friendly) against the real evaluation pipeline. Assess rebase-safety of the `LetVariables.ts` + 1-call-site model against phase-004 merge churn. Verify composition with phase-004 IF/SWITCH/MATH (Scenario 3) and scope isolation from the Bases dialect.

**Iteration**: 7 of 10
**Status**: complete
**newInfoRatio**: 0.60
**noveltyJustification**: Grounds the NFR claims in the real `ComputedEvaluator` pipeline and the phase-004 plan, confirms scope isolation via `expressionSyntax === "base"` routing, and proves IF/SWITCH/MATH composition by tracing the transform + eager-eval interaction.

---

## Findings

### F39: Display-Only / Evaluation-Only / Mobile-Safe — Confirmed Against the Pipeline

**Finding**: let/lets touches only the expression-evaluation path; no writes, no desktop-only APIs, no persistence.

**Evidence**:
- `evaluateComputedFields` ([SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/data/ComputedEvaluator.ts:29-78]) builds a `result` map of computed values. Errors → `result[def.key] = null` (line 72); success → `result[def.key] = evaluated.value` (line 74). The result is consumed read-only by render paths (`DatabaseView`, `EmbeddedDatabaseRenderer`). No frontmatter write, no vault/file mutation.
- The let/lets mechanism is confined to `evaluateExpressionDetailed` ([SOURCE: ComputedField.ts:421-453]) — a pure string transform + a pure JS `__let` helper + SafeEval (pure interpreter). No `App`, `TFile`, `vault`, `fs`, DOM, network, or timer APIs are referenced.
- `__let = (fn, ...vals) => fn(...vals)` and `transformLetCalls` are pure functions of their inputs.

**Verdicts**:
- **NFR-S02 (no telemetry/network/secrets)**: satisfied — no new I/O.
- **NFR-R02 / spec §8 (iCloud-safe, display-only)**: satisfied — evaluation-only; the rollup render of a let-using formula (Scenario 4) produces display values with no writes.
- **NFR-M01 (mobile-safe)**: satisfied — pure in-memory evaluation, no desktop-only APIs. `Intl`/`moment` are not involved in the let path.

### F40: Rebase-Safety Against Phase-004 — Minimal, Localized Conflict Surface

**Finding**: Phase-004 adds `IFS`/`SWITCH` varargs wrappers and math aliases (`SQRT`/`LN`/`LOG`/`LOG10`/`EXP`/`CBRT`) to the `createContext` function table in `ComputedField.ts` ([SOURCE: 004 implementation-summary.md:59, 70, 88-92]). Phase-005's changes touch a **different region** and a **new file**:

| Phase-005 change | Location | Conflict surface with phase-004 |
|------------------|----------|---------------------------------|
| New module `src/data/LetVariables.ts` | New file | None — new file cannot conflict |
| `__let` helper in `createContext` | `ComputedField.ts` context object (~line 139-305 lowercase region or 310-378 UPPERCASE) | Low — a new key; phase-004 adds keys in the same object, but additions rarely conflict unless at the same line |
| Call-site edit in `evaluateExpressionDetailed` | `ComputedField.ts:428-441` (insert `transformLetCalls` between security check and `safeEval`) | None — phase-004 does not touch `evaluateExpressionDetailed` |

**Evidence**: Phase-004's plan confines its edit to "a single function-table region" in `createContext` ([SOURCE: 004 implementation-summary.md:92 — "the smallest possible diff is a single function-table region"]). `evaluateExpressionDetailed` (line 421-453) is not in that region.

**Verdict**: The EuroFormat isolated-module pattern (new file + 1 call-site edit + 1 helper line) is the most rebase-friendly shape available. The only overlap risk is the `__let` helper line landing near phase-004's `createContext` additions — a trivial additive conflict resolved by keeping both. **NFR-F01 (MIT-forkable, rebase-friendly) satisfied.**

**Recommendation**: Place `__let` in the lowercase built-ins region (near `iferror`, line 294-304) — a region phase-004's UPPERCASE-alias additions are unlikely to touch — to minimize overlap. Alternatively, register `__let` from inside `LetVariables.ts` via a small `registerLetHelper(context)` call in `createContext`, keeping even the helper line out of the dense function table.

### F41: Composition With Phase-004 IF/SWITCH/MATH (Scenario 3) — Works, With an Eager-Eval Caveat

**Finding**: let/lets composes with `IF`/`IFS`/`SWITCH` and the math aliases because the transform runs on the **whole formula first**, rewriting nested let calls inside any outer function's arguments.

**Evidence / trace**:
- `IF` is a context function: [SOURCE: ComputedField.ts:325] (`IF: (cond, t, f) => cond ? t : f`).
- The transform rewrites `if(condition, let("rate", 0.05, amount * rate), 0)` → `if(condition, __let((rate) => amount * rate, 0.05), 0)`. SafeEval eagerly evaluates `IF`'s args ([SOURCE: SafeEval.ts:1010-1017]), so `__let(...)` evaluates to the bound value, then `IF` selects. Result correct.
- Math aliases (phase-004 `SQRT` etc.) resolve inside the arrow body via the prototype chain: `let("r", 4, sqrt(pi() * r ** 2))` → `__let((r) => sqrt(pi() * r ** 2), 4)` — `sqrt` and `pi` resolve from the scope (context built-ins). Correct.
- `IFS`/`SWITCH` (varargs) compose similarly — each let in an argument transforms independently.

**Eager-eval caveat (existing engine behavior, NOT a let/lets defect)**: SafeEval eagerly evaluates ALL of `IF`'s arguments, so a let in the false branch still evaluates even when the condition is true. This is the engine's pre-existing non-lazy `IF` semantics (line 325: `cond ? t : f` receives already-evaluated `t` and `f`). let/lets inherits this; it does not change it. If a branch has side-effect-like cost (e.g. a heavy nested let), both branches pay it. Notion's `if()` may be lazier — a parity nuance to note but out of scope for this phase (the engine's `IF` semantics are established).

**Verdict**: Scenario 3 (mixing `if` and `let`) composes correctly. The transform is transparent to outer functions because it rewrites let calls wherever they appear, before SafeEval sees the expression.

### F42: Scope Isolation From the Bases Dialect — Confirmed by Routing

**Finding**: The transform runs only in the native Excel-style engine, never in the Bases method-chaining dialect (`BaseExpression.ts`), satisfying spec §3 Out-of-Scope.

**Evidence**: `ComputedEvaluator.evaluateComputedFields` routes on `def.expressionSyntax`:
- [SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/data/ComputedEvaluator.ts:50-54]
```typescript
if (def.expressionSyntax === "base") {
    if (!context.app || !context.file) { result[def.key] = null; continue; }
    const evaluated = evaluateBaseComputedFields([def], { ... }, result);
    ...
} else {
    const evaluated = engine.evaluateSingleDetailed(def.expression, enrichedFrontmatter, result);
```

`evaluateSingleDetailed` → `evaluateExpressionDetailed` is the ONLY place the transform is injected. Base-syntax fields bypass it entirely. `BaseExpression.ts` has its OWN `DANGEROUS_TOKENS` list and `safeEval` import ([SOURCE: BaseExpression.ts:1-9, 12-30]) — a separate evaluation surface that let/lets never reaches.

**Verdict**: Spec §3 "Bases method-chaining dialect — no let/lets there" is satisfied by construction. No risk of let/lets leaking into Bases.

### F43: `extractDependencies` Is Unaffected — Runs on the Original Formula

**Finding**: Dependency extraction (`ComputedFieldEngine.extractDependencies`) is called separately on `def.expression` (the ORIGINAL user formula, not the transformed form) by `ComputedEvaluator` (line 24), `DatabaseView` (line 10262), and `EmbeddedDatabaseRenderer` (line 2848). It uses `scanFormulaSegments` to find column references.

**Evidence**: [SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/data/ComputedField.ts:390-399] — `extractDependencies` scans for identifiers matching column keys/labels; non-column identifiers (like a let-bound `rate`) are not added (iteration 2, F10).

**Verdict**: The transform does NOT need to run for dependency extraction, and let-bound variables are correctly excluded from dependencies. No `extractDependencies` change is required. The transform and dependency extraction are independent consumers of the original formula text.

---

## Dead Ends

### DE10: Applying the transform to base-syntax expressions
Base expressions route through `evaluateBaseComputedFields`, never `evaluateExpressionDetailed`. let/lets is correctly absent there. **Ruled out by scope** — no action.

---

## Questions Addressed
- **NFR-M01/NFR-R02/NFR-S02/NFR-F01 (ANSWERED)**: All satisfied — pure evaluation, no writes, no desktop APIs, new-file+1-call-site rebase-friendly shape, minimal phase-004 conflict surface (F39, F40).
- **Scenario 3 (ANSWERED)**: IF/SWITCH/MATH + let composes; the transform rewrites nested lets before SafeEval sees the expression; eager-eval of IF args is pre-existing engine behavior, not a let defect (F41).
- **Scope isolation (ANSWERED)**: Base dialect unaffected via `expressionSyntax === "base"` routing (F42); `extractDependencies` unaffected (F43).

## Questions Raised
- Is Notion's `if()` lazy (evaluates only the taken branch)? If so, the fork's eager `IF` is a separate parity gap, not a let/lets concern — note for the parent parity backlog. (iter 8 may touch this)
- Where exactly to place the `__let` helper line to minimize phase-004 rebase overlap — final placement is an implementation decision (F40 recommendation).

---

## Ruled Out
- Applying transform to base-syntax expressions: routed away by expressionSyntax === "base" (iteration 7, evidence: ComputedEvaluator.ts:50-54)

---

# Iteration 008 — Notion Behavior Deep-Dive (WebFetch) & Parity Divergences

**Focus**: Confirm Notion's official `let`/`lets` semantics verbatim, resolve the F24 self-reference open question, confirm `let`==`lets`, nested shadowing, and isolate the `if()` laziness and type-coercion divergences as pre-existing engine gaps rather than let/lets concerns.

**Iteration**: 8 of 10
**Status**: complete
**newInfoRatio**: 0.55
**noveltyJustification**: Verbatim Notion official descriptions freshly fetched; resolves self-reference as an undocumented/parity-divergent case (Notion's static typing vs the fork's undefined); isolates if-laziness and type-coercion as pre-existing engine gaps, not let defects; confirms method-chaining is out of let/lets scope.

---

## Findings

### F44: Notion Official `let`/`lets` Descriptions — Confirmed Verbatim

**Evidence** (Notion help, formula-syntax function table):
- [SOURCE: https://www.notion.com/help/formula-syntax — function table, let/lets rows]
  - **`let`**: "Assigns a value to a variable and evaluates the expression using that variable."
    - `let(person, "Alan", "Hello, " + person + "!")` = `"Hello, Alan!"`
    - `let(radius, 4, round(pi() * radius ^ 2))` = `50`
  - **`lets`**: "Assigns values to multiple variables and evaluates the expression using those variables."
    - `lets(a, "Hello", b, "world", a + " " + b)` = `"Hello world"`
    - `lets(base, 3, height, 8, base * height / 2)` = `12`

**Implication**: The fork's `__let` transform reproduces these examples exactly (modulo the `^`→`**`/`pow` operator difference, F37):
- `let("person", "Alan", "Hello, " + person + "!")` → `"Hello, Alan!"` ✅
- `let("radius", 4, round(pi() * radius ** 2))` → `50` ✅ (fork uses `**`; `round` and `pi` are context built-ins)
- `lets("a", "Hello", "b", "world", a + " " + b)` → `"Hello world"` ✅
- `lets("base", 3, "height", 8, base * height / 2)` → `12` ✅

### F45: `let` == `lets` Since April 2025 — Register Both as the Same Transform

**Evidence**: [SOURCE: https://thomasjfrank.com/formulas/functions/let/ — "As of April 2025, `let()` now allows you to create multiple variables, making it identical in functionality to `lets()`."]

Notion's docs still list them as separate rows with "a value" vs "multiple values" wording, but functionally `let` accepts the multi-variable form too. Signatures:
- `let(variable, value, expression)` / `let(var1, value, var2, value, ..., expression)`
- `lets(variable, value, variable2, value2, ..., expression)`

**Implication**: The fork's `transformLetCalls` treats `let` and `lets` identically — both rewrite to `__let((<names>) => <expr>, <values>)`. No separate code path. Both names must be matched by the scanner (F29: match `lets` before `let` to avoid prefix collision).

### F46: Self-Reference `let("a", a, a)` Is Undocumented — a Parity Divergence (Notion Errors, Fork Returns undefined)

**Finding**: Neither the Notion help doc nor the Thomas Frank reference documents self-reference or unbound-name behavior. The spec (§8) marks it "UNKNOWN."

**Reasoned verdict**: Notion Formula 2.0 is a **statically typed, compiled** language — references to non-existent properties/variables produce a compile-time error (e.g. "Property doesn't exist" / type errors). So in Notion, `let("a", a, a)` where `a` is not an existing property would be a **compile/type error**, not a silent `undefined`.

The fork is dynamically typed via SafeEval: `Ident` resolution returns `scope[name]` → `undefined` with no throw ([SOURCE: SafeEval.ts:935-936]). So `let("a", a, a)` → `__let((a) => a, a)` → the value `a` resolves to `undefined` (if unbound) → the arrow returns `undefined` → downstream arithmetic yields `NaN`.

**Divergence**: Notion errors; the fork silently returns `undefined`/`NaN`. This is **consistent with how the fork already handles unknown bare identifiers** (the engine's pre-existing dynamic behavior, F24) — so it satisfies REQ-005 ("consistent with existing engine errors") in the sense that there is no NEW inconsistency. It diverges from Notion's stricter static checking, but that is a **broader engine-wide divergence**, not a let/lets defect.

**Recommendation**: Do NOT add a special unbound-name check for phase 005 (it would diverge from the engine's uniform identifier behavior and expand scope). Note the divergence for the parent parity backlog. The spec's "UNKNOWN — confirm during implementation" is now resolved: the fork's behavior is "caller-scope resolution, undefined if unbound," matching the engine's existing identifier semantics.

### F47: Nested `let` and Shadowing — Confirmed Verbatim, Transform Handles Both

**Evidence**: [SOURCE: https://thomasjfrank.com/formulas/functions/let/]
- Inner let accesses outer variable: `let(firstName, "Monkey", let(lastName, "Luffy", firstName + " D. " + lastName))` = `"Monkey D. Luffy"`
- Inner shadows outer: `let(lastName, "Luffy", "Monkey D. " + let(lastName, "Garp", lastName))` = `"Monkey D. Garp"`
- "A variable defined in an outer instance of `let()` can be used within an inner instance of `let()`. However, if the inner instance has a variable of the same name, the outer one will be overridden in that inner context."

**Implication**: Both cases are handled correctly by the `__let` transform via SafeEval's `Object.create(scope)` Arrow chain (F19, F28):
- Access: `__let((firstName) => __let((lastName) => firstName + " D. " + lastName, "Luffy"), "Monkey")` → `firstName` resolves up the prototype chain. ✅
- Shadowing: `__let((lastName) => "Monkey D. " + __let((lastName) => lastName, "Garp"), "Luffy")` → inner `lastName` shadows on the inner childScope. ✅

### F48: `if()` Laziness Is a Pre-Existing Engine Gap, Not a let/lets Concern

**Finding**: Notion's `if` "Returns the first value if the condition is true; otherwise, returns the second value" ([SOURCE: notion.com/help/formula-syntax, if row]). Notion Formula 2.0 is compiled/typed and `if` evaluates only the taken branch (standard for typed functional languages — evaluating the unused branch would risk type errors).

The fork's `IF: (cond, t, f) => cond ? t : f` ([SOURCE: ComputedField.ts:325]) receives **already-eagerly-evaluated** `t` and `f` (SafeEval eager args, SafeEval.ts:1010-1017) — so BOTH branches always evaluate.

**Implication**: This eagerness is a **pre-existing engine-wide parity divergence**, independent of let/lets. let/lets composes with the fork's eager `IF` regardless (F41). A let in the unused branch still evaluates — correct result, just not lazy. **Not blocking for phase 005.** Note for the parent parity backlog: lazy `if`/`ifs` is a separate engine enhancement.

### F49: Type Coercion in `let` Values — Fork's Dynamic Coercion, Notion's Static Typing

**Finding**: Notion is statically typed; `let` values retain their type and the expression is type-checked at compile time. The fork is dynamically typed: `let("rate", "0.05", amount * rate)` → the value `"0.05"` (string) is bound; `amount * rate` uses SafeEval's `Binary *` which calls `toNumber` on both operands ([SOURCE: SafeEval.ts:964, 1106-1108]) → `"0.05"` coerces to `0.05`. Frontmatter string values are additionally pre-coerced via `coerceValue` ([SOURCE: ComputedField.ts:590-597]) which converts numeric strings to numbers.

**Implication**: The fork's dynamic coercion is the engine's existing behavior; let/lets inherits it uniformly. No special type handling is needed or appropriate for phase 005. Static type-checking is a broader engine divergence (backlog).

### F50: Method-Chaining on let-Bound Variables Is Out of let/lets Scope

**Finding**: Notion's examples chain methods on let-bound variables: `birthdayThisYear.dateAdd(...)`, `["Luffy",...].last()` ([SOURCE: thomasjfrank.com/formulas/functions/let/]). The fork uses Excel-style function calls (`dateAdd(date, n, "days")`), not method-chaining on primitives.

**Implication**: SafeEval supports `obj.method()` Member+Call on objects/arrays (e.g. `let("items", [1,2,3], items.length)` works — `items.length` is Array member access). But Notion-style `.dateAdd()`/`.last()` on dates/arrays don't map to the fork's function-call built-ins. This is the **broader Notion-vs-fork syntax divergence** (method-chaining vs Excel functions), not a let/lets concern. let/lets provides the binding mechanism; the expression body uses the fork's existing expression syntax. **Out of scope for phase 005** (consistent with spec §3).

---

## Dead Ends

### DE11: Adding a special unbound-name check for `let` self-reference
Would diverge from the engine's uniform identifier behavior (undefined-if-unbound) and expand phase-005 scope. The divergence from Notion's static typing is engine-wide, not let-specific. **Ruled out for phase 005** — noted for the parent parity backlog.

---

## Questions Addressed
- **Q2 (FULLY ANSWERED)**: Notion let/lets semantics confirmed verbatim from official docs: `let`==`lets` (April 2025), child-scoped, nested access + shadowing, official examples reproduced (F44, F45, F47).
- **F24 open question (RESOLVED)**: Self-reference `let("a", a, a)` — Notion would error (static typing); the fork returns undefined/NaN (dynamic, consistent with existing engine behavior). Divergence noted for backlog; no special handling for phase 005 (F46).
- **F41 lazy-IF nuance (RESOLVED)**: Notion `if` is lazy; fork `IF` is eager — pre-existing engine gap, not a let/lets concern, not blocking (F48).

## Questions Raised
- (Backlog, not phase-005) Lazy `if`/`ifs` and static type-checking as separate engine parity enhancements.
- (Backlog) Method-chaining syntax parity (Notion `.method()` vs fork function calls).

---

## Ruled Out
- Special unbound-name check for let self-reference: diverges from engine's uniform identifier behavior, expands scope; divergence is engine-wide not let-specific (iteration 8, evidence: SafeEval.ts:935-936, Notion static typing)

---

# Iteration 009 — Alternative OSS Evaluators & Notion's Real Engine (Reverse-Engineered)

**Focus**: Survey how other sandboxed expression evaluators (expr-eval, mathjs) implement variable binding, and — critically — examine a reverse-engineered reimplementation of Notion's *actual* formula engine (notion-vm) to confirm the fork's `__let`-helper transform is the right design, not a hack.

**Iteration**: 9 of 10
**Status**: complete
**newInfoRatio**: 0.80
**noveltyJustification**: External validation from Notion's real reverse-engineered engine: `let`/`lets` defers the expression as compiled sub-bytecode evaluated in a child binding context — structurally homologous to the fork's Arrow-as-argument + Object.create child scope. Confirms `if` is lazy. expr-eval/mathjs use different (non-lexical) models.

---

## Findings

### F51: expr-eval Uses Scope-Passing, Throws on Unbound Variables — No `let` Construct

**Finding**: `expr-eval` (silentmatt/expr-eval) binds variables via the `variables` object passed to `evaluate()`; it has an opt-in `assignment` operator (`=`) but no `let` function. Unbound variables **throw** at evaluate time.

**Evidence**: [SOURCE: https://github.com/silentmatt/expr-eval — README, evaluate(variables?)]: "Each variable in the expression is bound to the corresponding member of the `variables` object. If there are unbound variables, `evaluate` will throw an exception." The `assignment` operator is disabled by default (`assignment: false`).

**Implication**: expr-eval's model is caller-supplied scope, not lexical child-scoped let. No reusable let pattern for the fork; confirms the fork's scope-object approach is in the same family but Notion's let needs child-scope deferral that expr-eval doesn't offer.

### F52: mathjs Uses Mutable `=` Assignment to Scope — No Lexical Child Scope, No Closures

**Finding**: mathjs binds variables via `=` assignment that **writes to the scope** (`math.evaluate('c = 2.3 + 4.5', scope)` → `scope.c = 6.8`). Function assignments `f(x) = x^2` do NOT create closures — "all free variables in mathjs are dynamic."

**Evidence**: [SOURCE: https://mathjs.org/docs/expressions/syntax.html — "Variables can be defined using the assignment operator `=`"; "function assignments do not create closures; put another way, all free variables in mathjs are dynamic."]

**Implication**: mathjs's assignment is mutable-global-ish, NOT Notion's lexical child-scoped let (which has no leakage — REQ-003). mathjs's model would VIOLATE the fork's child-scope requirement. Not a match. Confirms Notion's let is a distinct lexical-binding construct, not assignment.

### F53: notion-vm Reverse-Engineers Notion's REAL Engine — `let`/`lets` Defers the Expression as Compiled Sub-Bytecode

**Finding**: `fluffyox/notion-vm` is a faithful reverse-engineered reimplementation of Notion's formula engine (from Notion frontend rspack modules `448187` VM+compiler and `947152/942007` function catalog `formula2`). It reveals exactly how Notion implements `let`/`lets`:

**Evidence** — `compileLet`:
- [SOURCE: https://raw.githubusercontent.com/fluffyox/notion-vm/main/src/engine.js — compileLet, ~line 304-311]
```javascript
function compileLet(node) {
  const a = node.args.slice();
  let pairs = [], bodyNode;
  if (node.name === "let") { pairs = [[a[0], a[1]]]; bodyNode = a[2]; }
  else { bodyNode = a[a.length - 1]; for (let i = 0; i + 1 < a.length; i += 2) pairs.push([a[i], a[i + 1]]); }
  const bindings = pairs.map(([idN, vN]) => ({ id: idN.name, instructions: I(vN), srcNode: vN }));
  return [{ type: "runLets", bindings, body: { instructions: I(bodyNode), srcNode: bodyNode }, node, asm: `runLets [${...}]` }];
}
```
The body is compiled to instructions (`I(bodyNode)`) but **NOT evaluated at compile time** — it is deferred and evaluated later inside `runLets` in the binding context. This is the deferral mechanism.

**Evidence** — `runLets`:
- [SOURCE: notion-vm engine.js — runLets, ~line 435-444]
```javascript
function* runLets(T, ctx) {
  let cctx = { ...ctx, values: ctx.values.slice() };          // CHILD context (copy of binding stack)
  for (const b of T.bindings) {
    let val;
    try { val = yield* F(b.instructions, { ...cctx, __label: `let ${b.id} =` }); }  // eval value in child ctx
    catch (e) { if (e.info && e.info.type === "DepthExceeded") throw e; val = U(); }
    cctx = { ...cctx, values: [{ kind: "Binding", id: b.id, value: val }, ...cctx.values] };  // push binding to HEAD
  }
  return yield* F(T.body.instructions, { ...cctx, __label: "let body" });  // eval BODY in child ctx
}
```
- `loadName` searches `ctx.values` head-first ([SOURCE: engine.js ~line 330]: `for (const v of ctx.values) if (v.kind === "Binding" && v.id === name) return v.value;`) → inner bindings (pushed to head) shadow outer. Child-scope + shadowing, exactly matching Notion's documented semantics (F47).

**Implication**: Notion's real `let` defers the expression argument (compiles it as sub-bytecode, evaluates it in a fresh child binding context). This is precisely the deferral the fork needs and that eager-evaluation forbids naively.

### F54: The Fork's `__let`-Helper Transform Is the Sandbox-Compatible Analogue of Notion's `runLets`

**Finding**: The fork's design is structurally **homologous** to Notion's real implementation:

| Concept | Notion (notion-vm) | Fork (`__let` transform) |
|---------|--------------------|--------------------------|
| Defer the expression arg | Compile body to sub-bytecode (`I(bodyNode)`), eval later | Compile body to SafeEval `Arrow` (parser), eval later |
| Child scope | `cctx = {...ctx, values: ctx.values.slice()}` + push bindings to head | `childScope = Object.create(scope)` + set `childScope[name] = value` |
| Shadowing | Head-first `loadName` lookup | Prototype-chain lookup (child own prop shadows parent) |
| Evaluate body in child ctx | `yield* F(body.instructions, cctx)` | `__let` calls `fn(...vals)` → Arrow evaluator runs body in childScope |
| Value evaluated in caller/child ctx | Each binding eval'd in `cctx` (which already has prior bindings) | Values are eager-eval'd by SafeEval in caller scope (see nuance below) |

**Evidence**: Fork Arrow evaluator ([SOURCE: SafeEval.ts:1043-1050]) creates `childScope = Object.create(scope)` and binds params — the direct analogue of notion-vm's child context + binding push.

**One semantic nuance (value evaluation scope)**: In notion-vm, each binding's value is evaluated in `cctx` which already contains the *prior* bindings of the same let — so `lets("a", 1, "b", a + 1, a + b)` lets `b`'s value see `a`. In the fork's `__let` transform, ALL values are eager-evaluated by SafeEval in the **caller scope** before `__let` runs — so `b`'s value expression `a + 1` would NOT see the `a` being bound in the same lets (it would see caller-scope `a`, if any). 

**This is a real divergence for multi-variable `lets`/`let` where a later value references an earlier bound name in the SAME call.** Notion allows it (sequential binding); the naive `__let((a, b) => a + b, 1, a + 1)` would eager-eval `a + 1` in the caller scope (wrong `a`). 

**Fix**: nest the arrows so each binding gets its own child scope: `lets("a", 1, "b", a + 1, a + b)` → `__let((a) => __let((b) => a + b, a + 1), 1)`. Now `a + 1` (the value for `b`) is the second arg to the INNER `__let`, eager-evaluated in the inner arrow's scope where `a` is bound. This preserves Notion's sequential left-to-right binding. The transform must emit **nested** `__let` calls (one per binding), not a single flat arrow. This is a refinement to F19 — see F59.

### F55: Notion's `if`/`ifs` Is Lazy (Confirmed) — `ifs` Desugars to Nested `if`

**Evidence**: [SOURCE: notion-vm engine.js — compileIf, ~line 288-302]
```javascript
function compileIf(node) {
  if (node.name === "ifs") return I(desugarIfs(node.args.slice()));  // ifs → nested if
  ...
  return [
    ...cond,
    { type: "jumpIfTruthy", offset: elseBC.length + 1, ... },  // jump to then if true
    ...elseBC,
    { type: "relativeJump", offset: thenBC.length, ... },       // skip then after else
    ...thenBC,
  ];
}
```
`if` compiles to `jumpIfTruthy`/`relativeJump` — only the taken branch's bytecode executes. **Confirms F48: Notion `if` is lazy.** The fork's eager `IF` is a pre-existing engine gap (not blocking phase 005).

### F56: Notion's Deferral Is a Unified Lazy-Arg Mechanism (map/filter/etc. Share It)

**Finding**: notion-vm's `LIB` marks lazy args via `lazy: new Set([1])` and compiles them as `loadConstant(compiledCode)` ([SOURCE: engine.js ~line 273-274, 504-508]). `map`/`filter`/`find`/`some`/`every`/`sort` all use `runLambda` to re-enter the VM with the compiled sub-bytecode. `let`/`lets` uses the same deferral idea via `runLets`.

**Implication**: Notion's `let` is not a special case — it's one application of a general "compile arg as deferred code, eval in a child context" mechanism. The fork's `__let`-helper is a targeted, scope-minimal application of the same idea for let/lets only (appropriate for the isolated-diff model; general lazy args for map/filter are out of scope for phase 005).

### F57: notion-vm's `let` Supports Only One Pair (Older Snapshot) — Fork Should Support Multi-Var per Current Notion

**Finding**: notion-vm's `compileLet` for `let` hardcodes `pairs = [[a[0], a[1]]]` (one pair only), while `lets` supports multiple. This reflects an older Notion snapshot (pre-April-2025). Thomas Frank confirms current Notion `let` supports multiple variables (F45).

**Implication**: The fork must support multi-variable `let` (not just single-pair) to match current Notion. The transform treats `let` and `lets` identically (F45), extracting all pairs + final body.

---

## Dead Ends

### DE12: mathjs-style mutable `=` assignment for let
Violates REQ-003 (child-scoped, no leakage) — mathjs writes to the shared scope and has no closures. **Ruled out** — Notion's let is lexical, not assignment.

### DE13: expr-eval scope-passing as a let mechanism
No child-scope deferral; throws on unbound vars (diverges from fork's undefined behavior). No reusable let pattern. **Ruled out** — different model.

---

## Questions Addressed
- **Q3 (EXTENDED)**: No reference repo (AppFlowy/Anytype, iter 3) had let; but notion-vm (a Notion reverse-engineering) confirms the deferral+child-scope pattern. The fork's `__let` transform is validated as the sandbox-compatible analogue of Notion's real `runLets` (F53, F54).
- **Design validation (ANSWERED)**: The `__let`-helper transform is NOT a hack — it mirrors Notion's own compiled-code-deferral mechanism, adapted to SafeEval's Arrow. External confirmation that deferring the expression arg and evaluating it in a child scope is the correct architecture.

## Questions Raised
- **F59 (critical refinement)**: Multi-variable `lets`/`let` where a later value references an earlier bound name in the SAME call (`lets("a", 1, "b", a + 1, a + b)`) requires NESTED `__let` calls (one per binding), not a single flat arrow, to preserve Notion's sequential left-to-right binding. This refines F19 and must be reflected in the transform + tests (iteration 10).

---

## Ruled Out
- mathjs mutable = assignment for let: violates REQ-003 child-scope/no-leakage, no closures (iteration 9, evidence: mathjs syntax docs)
- expr-eval scope-passing as let mechanism: no child-scope deferral, throws on unbound (iteration 9, evidence: expr-eval README)

---

# Iteration 010 — Test Strategy & Final Integration Recipe

**Focus**: (Final iteration.) Ground the verification plan in the fork's ACTUAL test infrastructure, deliver the concrete test matrix, the final `LetVariables.ts` transform sketch (consolidating the F59 nested-`__let` refinement), the `__let` helper, the call-site edit, and the exact verification commands.

**Iteration**: 10 of 10
**Status**: complete
**newInfoRatio**: 0.70
**noveltyJustification**: Discovers the fork's test suite does NOT yet exist (vitest configured, zero test files, missing setup.ts, no test script) — a real scope gap vs the spec's assumptions; delivers the consolidated nested-__let transform sketch and an 18-case test matrix grounded in real Notion examples + all REQs.

---

## Findings

### F60: The Fork's Formula Test Suite Does NOT Yet Exist — a Scope Gap

**Finding**: The spec/plan/checklist repeatedly reference "the fork's formula test suite" and "Fork's test command." In reality, the test infrastructure is only **partially scaffolded**:

**Evidence**:
- `vitest.config.ts` exists and configures: `include: ["src/**/*.test.ts"]`, `environment: "node"`, `setupFiles: ["src/__tests__/setup.ts"]`.
- [SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/vitest.config.ts]
- The vitest binary is installed (`node_modules/.bin/vitest` present).
- BUT: **zero `*.test.ts` files exist** under `src/`; the `src/__tests__/` directory does NOT exist (so `setup.ts` is missing); and `package.json` has **no `test` script**:
  - [SOURCE: package.json `scripts`]: only `dev`, `build`, `lint`, `lint:all` — no `test`.
  - `eslint` ignores `src/__tests__/**` ([SOURCE: package.json lint script]), confirming `__tests__` is the intended test home.

**Implication**: Phase 005 cannot "run the existing formula regression suite" — there is none. To satisfy SC-002 ("full formula regression suite passes with 0 delta") and REQ-006, phase 005 must **bootstrap** the test scaffold:
1. Create `src/__tests__/setup.ts` — mock `obsidian` (App/TFile/etc.), `moment`, and the i18n `t()` function (ComputedField depends on `t()` and `moment`).
2. Create the first formula test file(s).
3. Add `"test": "vitest run"` to `package.json` scripts.

This is **beyond REQ-007's "ComputedField.ts plus its tests"** — the missing `setup.ts` and test script are infrastructure gaps the phase must fill (or explicitly defer to a prior/enabling phase). **Recommendation: flag this to the user** — either phase 005 bootstraps the test harness (expanding scope to `src/__tests__/setup.ts` + `package.json`), or an enabling phase establishes it first. The transform's structural non-interference (F67) reduces regression risk in the interim.

### F61: Verification Commands

| Check | Command | Gate |
|-------|---------|------|
| Run tests | `npx vitest run` (or `npm test` after adding the script) | SC-001, SC-002, REQ-001..006 |
| SafeEval byte-identical | `git diff --exit-code -- src/data/SafeEval.ts` (exits 0) | SC-003, REQ-004 |
| Production build | `npm run build` (esbuild production) | no compile errors |
| Lint | `npm run lint` (ignores `src/__tests__/**`) | no new lint errors |
| Scope confinement | `git diff --stat` shows only `ComputedField.ts` + `LetVariables.ts` + tests + (`FormulaModal.ts`/`i18n.ts` if P2 approved) + `package.json`/`setup.ts` | SC-004, REQ-007 |

**Evidence**: build/lint scripts from [SOURCE: package.json scripts]; vitest config from [SOURCE: vitest.config.ts].

### F62: Test File Layout (per vitest config)

- Pure transform tests: `src/data/__tests__/LetVariables.test.ts` — tests `transformLetCalls()` as a pure string→string function (no engine, no mocks needed). Fast, deterministic, covers the scanner + emission + validation.
- End-to-end engine tests: `src/data/__tests__/ComputedField.let.test.ts` — tests `ComputedFieldEngine.evaluateSingleDetailed()` with let/lets formulas. Requires `src/__tests__/setup.ts` to mock `obsidian`/`moment`/`t()`.
- Both match `src/**/*.test.ts`; `__tests__/**` is lint-ignored.

### F63: The 18-Case Test Matrix (Deliverable)

| # | Formula | Input | Expected | REQ/Scenario |
|---|---------|-------|----------|--------------|
| 1 | `let("rate", 0.05, amount * rate)` | amount=100 | `5` | REQ-001 |
| 2 | `lets("a", 1, "b", 2, a + b)` | — | `3` | REQ-002 |
| 3 | `let("a", 1, "b", 2, a + b)` (multi-var let) | — | `3` | REQ-002, F45 (let==lets) |
| 4 | `lets("a", 1, "b", a + 1, a + b)` | — | `3` | F59 sequential binding |
| 5 | `let("firstName","Monkey",let("lastName","Luffy",firstName+" D. "+lastName))` | — | `"Monkey D. Luffy"` | F47 nested access |
| 6 | `let("lastName","Luffy","Monkey D. "+let("lastName","Garp",lastName))` | — | `"Monkey D. Garp"` | F47 shadowing |
| 7 | non-leakage: `let("rate",0.05,rate)` then outer `rate` | — | `undefined`/error | REQ-003 |
| 8 | `let("person","Alan","Hello, "+person+"!")` | — | `"Hello, Alan!"` | F44 Notion ex |
| 9 | `let("radius",4,round(pi()*radius**2))` | — | `50` | F44 Notion ex (fork `**`) |
| 10 | `lets("base",3,"height",8,base*height/2)` | — | `12` | F44 Notion ex |
| 11 | `let("rate",0.05,field("amount")*rate)` + `[amount]` form | amount=100 | `5` | F31 field refs |
| 12 | `let("round",5,round(3.14))` | — | error `notFunction` | REQ-005, F25 |
| 13 | `lets("a",1)` | — | error `letArgCount` | REQ-005, F26 |
| 14 | `let(5,1,2)` | — | error `letName` | REQ-005, F27 |
| 15 | `let("a",a,a)` (no `a` field) | — | `undefined`/`NaN` | F46 divergence (documented) |
| 16 | `if(amount>50,let("rate",0.1,amount*rate),0)` | amount=100 | `10` | Scenario 3, F41 |
| 17 | `let("r",4,sqrt(pi()*r**2))` (phase-004 merged) | — | `12.56…` | Scenario 3, F41 |
| 18 | regression: existing formulas unchanged | — | identical results | REQ-006, SC-002, F67 |

### F64: Final `LetVariables.ts` Transform Sketch (Consolidates F19 + F59)

```typescript
// src/data/LetVariables.ts — pure, rebase-friendly isolated module (EuroFormat pattern).
// Rewrites Notion-style let()/lets() into SafeEval-arrow-based __let() calls,
// AFTER the security check, so the => it emits is trusted (never user-authored).

const IDENT_RE = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

/**
 * Transform let()/lets() calls into nested __let() calls.
 * let("a", 1, "b", 2, expr)  ->  __let((a) => __let((b) => expr, 2), 1)
 * let("rate", 0.05, expr)    ->  __let((rate) => expr, 0.05)
 * Pure pass-through when no bare let(/lets( call is present.
 */
export function transformLetCalls(formula: string): string {
  // 1. Scan for bare `let(` / `lets(` (string/template/bracket-aware, not preceded by `.`,
  //    match `lets` before `let` to avoid prefix collision).
  // 2. For each call, split top-level args (depth-tracking, skip string/template contents).
  // 3. Validate: odd arg count >= 3; each name arg is a quoted string matching IDENT_RE.
  //    On violation, throw new Error("let: <reason>") for evaluateExpressionDetailed to map.
  // 4. Recurse: transform the body expression first (it may contain nested let/lets).
  // 5. Emit NESTED __let: fold pairs right-to-left so each value sees prior bindings:
  //      pairs.reduceRight((body, [name, value]) => `__let((${name}) => ${body}, ${value})`, body)
  return /* ...implementation... */ formula;
}
```

**Why nested (F59)**: `lets("a", 1, "b", a + 1, a + b)` must let `b`'s value `a + 1` see `a`. Flat `__let((a, b) => a + b, 1, a + 1)` would eager-eval `a + 1` in the caller scope (wrong `a`). Nested `__let((a) => __let((b) => a + b, a + 1), 1)` evaluates `a + 1` as the inner `__let`'s value arg, eager-evaluated in the inner arrow's scope where `a` is bound. This matches Notion's sequential left-to-right binding (notion-vm `runLets`, F53).

### F65: The `__let` Helper

```typescript
// In createContext (ComputedField.ts), near iferror (~line 294-305) to minimize phase-004 overlap:
__let: (fn: (...args: unknown[]) => unknown, ...vals: unknown[]) => fn(...vals),
```
Internal-only (underscore prefix); not in FormulaModal help (F30, F33). Unreachable for useful user input because `=>` is security-blocked.

### F66: The Call-Site Edit in `evaluateExpressionDetailed`

- [SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/data/ComputedField.ts:428-448]
```typescript
const securityError = this.validateFormulaSecurity(normalizedExpr);
if (securityError) return { value: null, error: securityError };
const transformedExpr = transformLetCalls(normalizedExpr);   // NEW (trusted; may emit =>)
// ... scope building unchanged ...
try {
  const result = safeEval(transformedExpr, scope);           // CHANGED: normalizedExpr -> transformedExpr
  return { value: result };
} catch (err) {
  try {
    const result = safeEval(transformedExpr, scope, { allowStatements: true }); // CHANGED
    return { value: result };
  } catch (statementErr) {
    return { value: null, error: this.formatEvaluationError(statementErr || expressionError) };
  }
}
```
**Both** `safeEval` calls (expression + statement fallback) must receive `transformedExpr`. Wrap `transformLetCalls` in the same try/catch error mapping (or a sibling) so its thrown validation errors surface via `formatEvaluationError`.

### F67: Structural Non-Interference = Regression Safety by Construction

**Finding**: `transformLetCalls` is a **pure pass-through** when no bare `let(`/`lets(` call is present: `transformLetCalls("round(3.14)")` returns `"round(3.14)"` unchanged. Therefore:
- Formulas without let/lets never reach `__let`, never see `=>`, and follow a byte-identical evaluation path to today.
- `git diff` on `SafeEval.ts` is empty (REQ-004) — the transform adds no SafeEval changes.
- NFR-P01 (no measurable regression for non-let formulas) is satisfied **structurally**, not just by tests — the transform is a no-op for them.

**Implication**: Even with the test suite not yet bootstrapped (F60), the regression risk for existing formulas is low by construction. The 18-case matrix (F63) then pins the new behavior and the no-interference property explicitly (case 18).

---

## Dead Ends

### DE14: A single flat `__let((a, b) => expr, v1, v2)` for multi-var lets
Breaks sequential binding — later values can't see earlier names in the same call (F59). **Ruled out** — must emit nested `__let` calls.

---

## Questions Addressed
- **Test strategy (ANSWERED)**: vitest is the framework; suite doesn't exist yet (F60 — scope gap, flag to user); 18-case matrix covers all REQs + Notion examples + edge cases + composition (F63); verification commands defined (F61).
- **F59 refinement (CONSOLIDATED)**: nested `__let` emission for sequential multi-var binding (F64).
- **Final integration recipe (ANSWERED)**: `LetVariables.ts` (transform) + `__let` helper in createContext + call-site edit in `evaluateExpressionDetailed` (both safeEval calls) + tests + (P2) FormulaModal/i18n + (infra) setup.ts/test script (F64-F67).

## Questions Raised (for the build phase / user)
- Does the user want phase 005 to bootstrap the test harness (`setup.ts` + `test` script), or defer to an enabling phase? (F60)
- Does the user approve the P2 split for FormulaModal help + i18n, or relax REQ-007? (F33)
- Confirm `^` is not a power operator in the fork (use `**`/`pow` in examples) — verify in tests. (F37)

---

## Ruled Out
- Flat __let for multi-var lets: breaks sequential binding, later values can't see earlier names (iteration 10, evidence: notion-vm runLets sequential eval, F53/F59)

---
