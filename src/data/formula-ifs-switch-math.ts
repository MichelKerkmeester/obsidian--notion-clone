// ───────────────────────────────────────────────────────────────────
// MODULE:    formula-ifs-switch-math
// COMPONENT: IFS/SWITCH branching plus math functions for the formula engine
// ───────────────────────────────────────────────────────────────────
//
// Pure formula helpers kept separate from the editor and persistence layers.
// Keeping the table in a leaf module makes it safe to reuse from the formula
// editor while preserving a small, rebase-friendly integration surface.
//
// IFS/SWITCH both treat a trailing unpaired argument as the fallback value
// rather than an error, and evaluate condition/pattern pairs left to right,
// short-circuiting on the first match — matching how spreadsheet IFS/SWITCH
// behave, which callers rely on when writing formulas.

// ───────────────────────────────────────────────────────────────────
// 1. TYPES
// ───────────────────────────────────────────────────────────────────

type FormulaFunction = (...args: unknown[]) => unknown;

export interface FormulaFunctionHelp {
  categoryKey: string;
  name: string;
  signature: string;
  descriptionKey: string;
  example: string;
}

// ───────────────────────────────────────────────────────────────────
// 2. FUNCTION IMPLEMENTATIONS
// ───────────────────────────────────────────────────────────────────

function ifs(...args: unknown[]): unknown {
  if (args.length < 2) return null;

  const pairEnd = args.length - (args.length % 2);
  for (let index = 0; index + 1 < pairEnd; index += 2) {
    if (args[index]) return args[index + 1];
  }

  return args.length % 2 === 1 ? args[args.length - 1] : null;
}

function formulaSwitch(...args: unknown[]): unknown {
  if (args.length < 3) return null;

  const expression = args[0];
  const rest = args.slice(1);
  const pairEnd = rest.length - (rest.length % 2);
  for (let index = 0; index + 1 < pairEnd; index += 2) {
    if (expression === rest[index]) return rest[index + 1];
  }

  return rest.length % 2 === 1 ? rest[rest.length - 1] : null;
}

export const formulaIfsSwitchMath: Record<string, FormulaFunction> = {
  IFS: ifs,
  SWITCH: formulaSwitch,
  SQRT: (value: unknown) => Math.sqrt(Number(value)),
  LN: (value: unknown) => Math.log(Number(value)),
  LOG: (value: unknown, base?: unknown) => base == null
    ? Math.log10(Number(value))
    : Math.log(Number(value)) / Math.log(Number(base)),
  LOG10: (value: unknown) => Math.log10(Number(value)),
  EXP: (value: unknown) => Math.exp(Number(value)),
  CBRT: (value: unknown) => Math.cbrt(Number(value)),
};

// ───────────────────────────────────────────────────────────────────
// 3. HELP METADATA
// ───────────────────────────────────────────────────────────────────

export const formulaIfsSwitchMathHelp: FormulaFunctionHelp[] = [
  {
    categoryKey: "formula.catLogic",
    name: "IFS",
    signature: "IFS(condition1, value1, ..., fallback?)",
    descriptionKey: "formula.fn.IFS.desc",
    example: "=IFS([income]<=69715, 0.14, [income]<=150000, 0.30, 0.36)",
  },
  {
    categoryKey: "formula.catLogic",
    name: "SWITCH",
    signature: "SWITCH(expression, pattern1, value1, ..., fallback?)",
    descriptionKey: "formula.fn.SWITCH.desc",
    example: '=SWITCH(UPPER([period]), "MONTH", [amount], "QUARTER", [amount]*3, 0)',
  },
  {
    categoryKey: "formula.catMath",
    name: "SQRT",
    signature: "SQRT(number)",
    descriptionKey: "formula.fn.SQRT.desc",
    example: "=SQRT([amount])",
  },
  {
    categoryKey: "formula.catMath",
    name: "LN",
    signature: "LN(number)",
    descriptionKey: "formula.fn.LN.desc",
    example: "=LN([amount])",
  },
  {
    categoryKey: "formula.catMath",
    name: "LOG",
    signature: "LOG(number, base?)",
    descriptionKey: "formula.fn.LOG.desc",
    example: "=LOG([amount], 2)",
  },
  {
    categoryKey: "formula.catMath",
    name: "LOG10",
    signature: "LOG10(number)",
    descriptionKey: "formula.fn.LOG10.desc",
    example: "=LOG10([amount])",
  },
  {
    categoryKey: "formula.catMath",
    name: "EXP",
    signature: "EXP(number)",
    descriptionKey: "formula.fn.EXP.desc",
    example: "=EXP([amount])",
  },
  {
    categoryKey: "formula.catMath",
    name: "CBRT",
    signature: "CBRT(number)",
    descriptionKey: "formula.fn.CBRT.desc",
    example: "=CBRT([amount])",
  },
];
