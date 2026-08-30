// ───────────────────────────────────────────────────────────────────
// MODULE:    computed-evaluator
// COMPONENT: Merges Bases-syntax and legacy-formula computed fields into one evaluation pass over a row
// ───────────────────────────────────────────────────────────────────
//
// Computed fields can reference other computed fields, so evaluation loops for
// defs.length passes so a two-hop dependency (A reads B, B reads C) resolves
// deterministically without building a dependency graph. file.name/file.tags
// are injected into a copy of frontmatter (never written back) because the
// legacy formula engine only understands frontmatter keys, not file metadata.
// Only defs' own keys are returned to the caller — derivedValues (e.g.
// Rollups) seed the context but remain owned by their own row layer.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────
import { App, TFile } from "obsidian";
import { evaluateBaseComputedFields } from "./base-expression";
import { getFileFieldValue } from "./file-fields";
import { ComputedFieldEngine } from "./computed-field";
import { ColumnDef, ComputedFieldDef } from "./types";
import { extractComputedDiagnosticSymbol } from "./computed-diagnostic";

// ───────────────────────────────────────────────────────────────────
// 2. TYPES
// ───────────────────────────────────────────────────────────────────
export interface ComputedEvaluationContext {
  app?: App;
  file?: TFile;
  thisFile?: TFile;
  thisFrontmatter?: Record<string, unknown>;
  /** Read-only derived values (for example Rollups) available to formulas. */
  derivedValues?: Record<string, unknown>;
  diagnostics?: Record<string, ComputedEvaluationDiagnostic>;
}

export interface ComputedEvaluationDiagnostic {
  fieldKey: string;
  expression: string;
  message: string;
  symbol?: string;
}

// ───────────────────────────────────────────────────────────────────
// 3. HELPERS
// ───────────────────────────────────────────────────────────────────
export function hasRollupComputedDependency(
  defs: ComputedFieldDef[],
  columns: ColumnDef[]
): boolean {
  const rollupKeys = new Set(
    columns.filter((column) => column.type === "rollup").map((column) => column.key)
  );
  return rollupKeys.size > 0 && defs.some((definition) =>
    ComputedFieldEngine.extractDependencies(definition.expression, columns)
      .some((dependency) => rollupKeys.has(dependency))
  );
}

// ───────────────────────────────────────────────────────────────────
// 4. EVALUATE COMPUTED FIELDS
// ───────────────────────────────────────────────────────────────────
export function evaluateComputedFields(
  defs: ComputedFieldDef[],
  columns: ColumnDef[],
  frontmatter: Record<string, unknown>,
  context: ComputedEvaluationContext = {}
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...(context.derivedValues || {}) };
  // 注入 file.name/file.tags 到普通公式求值上下文（不求值引擎大改，只在 frontmatter 预填）
  let enrichedFrontmatter = frontmatter;
  if (context.app && context.file) {
    const cache = context.app.metadataCache.getFileCache(context.file);
    enrichedFrontmatter = {
      ...frontmatter,
      "file.name": getFileFieldValue(context.file, "file.name", frontmatter, cache, context.app),
      "file.tags": getFileFieldValue(context.file, "file.tags", frontmatter, cache, context.app),
    };
  }
  const engine = new ComputedFieldEngine([], columns);

  for (let pass = 0; pass < Math.max(defs.length, 1); pass += 1) {
    for (const def of defs) {
      if (def.expressionSyntax === "base") {
        if (!context.app || !context.file) {
          result[def.key] = null;
          continue;
        }
        const evaluated = evaluateBaseComputedFields([def], {
          app: context.app,
          file: context.file,
          frontmatter,
          thisFile: context.thisFile,
          thisFrontmatter: context.thisFrontmatter,
          computedFields: defs,
          columns,
          computedValues: result,
        }, result);
        result[def.key] = evaluated[def.key];
      } else {
        const evaluated = engine.evaluateSingleDetailed(def.expression, enrichedFrontmatter, result);
        if (evaluated.error) {
          if (context.diagnostics) {
            const symbol = extractComputedDiagnosticSymbol(evaluated.error);
            context.diagnostics[def.key] = {
              fieldKey: def.key,
              expression: def.expression,
              message: evaluated.error,
              symbol,
            };
          }
          if (pass === defs.length - 1) {
            console.warn(`ComputedField "${def.key}" evaluation failed:`, evaluated.error, `expression:`, def.expression);
          }
          result[def.key] = null;
        } else {
          delete context.diagnostics?.[def.key];
          result[def.key] = evaluated.value;
        }
      }
    }
  }

  // Keep the public return shape limited to formula definitions. Derived
  // values seed evaluation but remain owned by their own row layer.
  return Object.fromEntries(defs.map((def) => [def.key, result[def.key]]));
}
