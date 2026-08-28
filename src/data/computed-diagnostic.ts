// ───────────────────────────────────────────────────────────────────
// MODULE:    computed-diagnostic
// COMPONENT: pulls the offending symbol name out of a formula engine error
// ───────────────────────────────────────────────────────────────────
//
// The symbol extraction regex is coupled to computed-evaluator's engine
// error text shape ("<message>: <symbol>", e.g. "Undefined variable or
// field: missing_total") — if the engine's error message format changes,
// this silently stops finding a symbol rather than failing loudly.

// ───────────────────────────────────────────────────────────────────
// 1. TYPES
// ───────────────────────────────────────────────────────────────────

export interface ComputedDiagnosticDetails {
  fieldKey: string;
  expression: string;
  message: string;
  symbol?: string;
}

// ───────────────────────────────────────────────────────────────────
// 2. SYMBOL EXTRACTION
// ───────────────────────────────────────────────────────────────────

export function extractComputedDiagnosticSymbol(message: string): string | undefined {
  return message.match(/:\s*([A-Za-z_$][\w$.-]*)/)?.[1];
}
