// ───────────────────────────────────────────────────────────────────
// MODULE:    let-variables
// COMPONENT: Rewrites let()/lets() formula calls into nested arrow-call bindings
// ───────────────────────────────────────────────────────────────────
//
// Calls evaluate their arguments before a helper receives them, so let/lets
// expressions are rewritten as nested arrow calls whose bodies run in child
// scopes. Keeping this module independent of Obsidian APIs preserves the
// display-only evaluation path on every supported platform.
//
// The rewrite is string-level (no AST), so quote/bracket scanning has to be
// careful: `skipQuoted` and the bracket-depth counters in `findMatchingParen`
// / `splitArguments` exist so a `(` or `,` inside a string literal argument
// never gets mistaken for formula structure.

// ───────────────────────────────────────────────────────────────────
// 1. CONSTANTS
// ───────────────────────────────────────────────────────────────────

const IDENTIFIER_RE = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const IDENTIFIER_CHAR_RE = /^[A-Za-z0-9_$]$/;
const LET_KEYWORDS = new Set([
  "true",
  "false",
  "null",
  "undefined",
  "typeof",
  "if",
  "else",
  "return",
]);

type LetCallMatch = {
  name: "let" | "lets";
  openParen: number;
};

// ───────────────────────────────────────────────────────────────────
// 2. PUBLIC API
// ───────────────────────────────────────────────────────────────────

export function transformLetCalls(formula: string): string {
  return rewriteFormula(formula);
}

export function registerLetHelper(context: Record<string, unknown>): void {
  context.__let = (fn: (...values: unknown[]) => unknown, ...values: unknown[]) => fn(...values);
}

// ───────────────────────────────────────────────────────────────────
// 3. REWRITE
// ───────────────────────────────────────────────────────────────────

function rewriteFormula(source: string): string {
  let result = "";
  let segmentStart = 0;
  let changed = false;

  for (let index = 0; index < source.length;) {
    const character = source[index];
    if (isQuote(character)) {
      index = skipQuoted(source, index);
      continue;
    }

    const match = matchLetCall(source, index);
    if (!match) {
      index += 1;
      continue;
    }

    const closeParen = findMatchingParen(source, match.openParen);
    if (closeParen < 0) {
      index += 1;
      continue;
    }

    const args = splitArguments(source, match.openParen + 1, closeParen);
    if (args.length < 3 || args.length % 2 === 0) {
      throw new Error("let:argCount");
    }

    const transformedArgs = args.map((argument) => rewriteFormula(argument.trim()));
    const names = transformedArgs.slice(0, -1).filter((_argument, argumentIndex) => argumentIndex % 2 === 0);
    const values = transformedArgs.slice(0, -1).filter((_argument, argumentIndex) => argumentIndex % 2 === 1);
    const bindingNames = names.map(parseBindingName);
    if (bindingNames.some((name): name is null => name === null)) {
      throw new Error("let:name");
    }

    let body = transformedArgs[transformedArgs.length - 1];
    for (let bindingIndex = bindingNames.length - 1; bindingIndex >= 0; bindingIndex -= 1) {
      body = `__let((${bindingNames[bindingIndex]}) => ${body}, ${values[bindingIndex]})`;
    }

    result += source.slice(segmentStart, index);
    result += body;
    segmentStart = closeParen + 1;
    index = closeParen + 1;
    changed = true;
  }

  return changed ? result + source.slice(segmentStart) : source;
}

// ───────────────────────────────────────────────────────────────────
// 4. SCAN HELPERS
// ───────────────────────────────────────────────────────────────────

function matchLetCall(source: string, index: number): LetCallMatch | null {
  if (index > 0 && isIdentifierCharacter(source[index - 1])) return null;

  let previous = index - 1;
  while (previous >= 0 && isWhitespace(source[previous])) previous -= 1;
  if (previous >= 0 && source[previous] === ".") return null;

  const name = source.startsWith("lets", index) ? "lets" : source.startsWith("let", index) ? "let" : null;
  if (!name) return null;

  let openParen = index + name.length;
  while (openParen < source.length && isWhitespace(source[openParen])) openParen += 1;
  return source[openParen] === "(" ? { name, openParen } : null;
}

function findMatchingParen(source: string, openParen: number): number {
  const brackets: string[] = ["("];

  for (let index = openParen + 1; index < source.length;) {
    const character = source[index];
    if (isQuote(character)) {
      index = skipQuoted(source, index);
      continue;
    }

    if (isOpeningBracket(character)) {
      brackets.push(character);
    } else if (isClosingBracket(character)) {
      if (brackets[brackets.length - 1] !== matchingOpeningBracket(character)) return -1;
      brackets.pop();
      if (brackets.length === 0) return index;
    }
    index += 1;
  }

  return -1;
}

function splitArguments(source: string, start: number, end: number): string[] {
  const args: string[] = [];
  const brackets: string[] = [];
  let argumentStart = start;

  for (let index = start; index < end;) {
    const character = source[index];
    if (isQuote(character)) {
      index = skipQuoted(source, index);
      continue;
    }

    if (isOpeningBracket(character)) {
      brackets.push(character);
    } else if (isClosingBracket(character)) {
      if (brackets[brackets.length - 1] === matchingOpeningBracket(character)) brackets.pop();
    } else if (character === "," && brackets.length === 0) {
      args.push(source.slice(argumentStart, index));
      argumentStart = index + 1;
    }
    index += 1;
  }

  args.push(source.slice(argumentStart, end));
  return args;
}

function parseBindingName(argument: string): string | null {
  if (argument.length < 2) return null;

  const quote = argument[0];
  if (!isQuote(quote) || argument[argument.length - 1] !== quote) return null;
  if (quote === "`" && argument.includes("${")) return null;

  const name = decodeQuotedName(argument.slice(1, -1));
  if (name === null) return null;
  return IDENTIFIER_RE.test(name) && !LET_KEYWORDS.has(name) ? name : null;
}

function decodeQuotedName(raw: string): string | null {
  let decoded = "";
  for (let index = 0; index < raw.length; index += 1) {
    if (raw[index] !== "\\") {
      decoded += raw[index];
      continue;
    }

    if (index + 1 >= raw.length) return null;
    const escaped = raw[index + 1];
    if (escaped === "u" && raw[index + 2] === "{") {
      const close = raw.indexOf("}", index + 3);
      if (close < 0) return null;
      const codePointText = raw.slice(index + 3, close);
      const codePoint = Number.parseInt(codePointText, 16);
      if (!/^[0-9a-fA-F]+$/.test(codePointText) || codePoint > 0x10ffff) return null;
      decoded += String.fromCodePoint(codePoint);
      index = close;
      continue;
    }
    if (escaped === "u" && index + 5 < raw.length) {
      const codeUnitText = raw.slice(index + 2, index + 6);
      const codeUnit = Number.parseInt(codeUnitText, 16);
      if (!/^[0-9a-fA-F]{4}$/.test(codeUnitText)) return null;
      decoded += String.fromCharCode(codeUnit);
      index += 5;
      continue;
    }

    if (escaped === "n") decoded += "\n";
    else if (escaped === "t") decoded += "\t";
    else if (escaped === "r") decoded += "\r";
    else if (escaped === "b") decoded += "\b";
    else if (escaped === "f") decoded += "\f";
    else if (escaped === "v") decoded += "\v";
    else if (escaped !== "\n" && escaped !== "\r") decoded += escaped;
    index += 1;
  }
  return decoded;
}

function skipQuoted(source: string, start: number): number {
  const quote = source[start];
  for (let index = start + 1; index < source.length; index += 1) {
    if (source[index] === "\\") {
      index += 1;
    } else if (source[index] === quote) {
      return index + 1;
    }
  }
  return source.length;
}

function isQuote(character: string): boolean {
  return character === '"' || character === "'" || character === "`";
}

function isIdentifierCharacter(character: string | undefined): boolean {
  return character !== undefined && IDENTIFIER_CHAR_RE.test(character);
}

function isWhitespace(character: string | undefined): boolean {
  return character !== undefined && /\s/.test(character);
}

function isOpeningBracket(character: string): boolean {
  return character === "(" || character === "[" || character === "{";
}

function isClosingBracket(character: string): boolean {
  return character === ")" || character === "]" || character === "}";
}

function matchingOpeningBracket(character: string): string {
  if (character === ")") return "(";
  if (character === "]") return "[";
  return "{";
}
