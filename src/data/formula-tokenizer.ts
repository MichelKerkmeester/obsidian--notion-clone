// ───────────────────────────────────────────────────────────────────
// MODULE:    formula-tokenizer
// COMPONENT: shared lexical scanner for formula dependency/rename passes
// ───────────────────────────────────────────────────────────────────
//
// 公式语法片段扫描（与 SafeEval tokenizer 词法对齐的共享底层）。
//
// 输出带类型的语法片段序列，extractDependencies（Z）与列重命名引用替换（AB）都基于它，
// 不再对原始表达式跑正则。词法与 SafeEval tokenizer 对齐：数字/字符串/模板/注释/正则/
// spread/dot/bracket/identifier/member/field-call。
//
// **最小 token 状态机**：维护 lastToken（start/value/operator/expression-start/
// if-keyword/member-receiver）与 if 条件括号栈；`[` 根据前一个真实 token 判定是成员下标、
// 计算下标、字段引用还是数组字面量。模板插值边界复用同一 value/operator/prefix 语义，
// 禁止再以逐字符布尔值近似词法状态。
//
// 片段类型：bracket-ref / field-call / member-ref / identifier（isCall/isMember）。
// 内置常量/语言字面量 today/pi/e/true/false/null/undefined/this 即使与列同名也按内置。

// ───────────────────────────────────────────────────────────────────
// 1. TYPES
// ───────────────────────────────────────────────────────────────────

export type FormulaSegment =
  | { kind: "bracket-ref"; start: number; end: number; name: string }
  | { kind: "field-call"; start: number; end: number; name: string; quote: string }
  | { kind: "member-ref"; start: number; end: number; object: string; name: string }
  | { kind: "identifier"; start: number; end: number; text: string; isCall: boolean; isMember: boolean };

// ───────────────────────────────────────────────────────────────────
// 2. CONSTANTS
// ───────────────────────────────────────────────────────────────────

export const FORMULA_BUILTIN_CONSTANTS = new Set([
  "today", "pi", "e", "true", "false", "null", "undefined", "this",
]);

const MEMBER_OBJECTS = new Set(["note", "properties", "formula"]);
/** 其后直接开始表达式的语句/一元关键字。 */
const EXPRESSION_PREFIX_KEYWORDS = new Set(["return", "typeof", "else"]);

const IDENT_START = /[A-Za-z_$]/;
const IDENT_CHAR = /[A-Za-z0-9_$]/;
const WHITESPACE = /\s/;
/** 运算符/分隔符字符（出现后 lastToken=operator，清空成员接收者候选）。 */
const OPERATOR_CHARS = new Set(["+", "-", "*", "%", ",", ";", "{", "=", "<", ">", "!", "?", ":", "&", "|", "^", "~"]);

interface LastToken {
  kind: "start" | "value" | "operator" | "expression-start" | "if-keyword" | "member-receiver";
  start: number;
  end: number;
  text?: string;
}

function isDigit(c: string | undefined): boolean {
  return !!c && c >= "0" && c <= "9";
}

// ───────────────────────────────────────────────────────────────────
// 3. SCAN
// ───────────────────────────────────────────────────────────────────

export function scanFormulaSegments(expression: string): FormulaSegment[] {
  return scan(expression, 0, expression.length);
}

function scan(expression: string, from: number, to: number): FormulaSegment[] {
  const segments: FormulaSegment[] = [];
  let i = from;
  let lastToken: LastToken = { kind: "start", start: from, end: from };
  // 括号上下文栈：识别 if (...) 条件的配对 )（关闭后进入 body 表达式起点，非 value）
  const parenStack: Array<"if" | "other"> = [];
  // prevWasValue 由 lastToken 派生：value/member-receiver 是值（其后 / 是除法）
  const prevWasValue = (): boolean => lastToken.kind === "value" || lastToken.kind === "member-receiver";

  while (i < to) {
    const char = expression[i];
    if (WHITESPACE.test(char)) {
      i += 1;
      continue;
    }
    const tokStart = i;
    // 行注释
    if (char === "/" && expression[i + 1] === "/") {
      while (i < to && expression[i] !== "\n") i += 1;
      continue;
    }
    // 块注释
    if (char === "/" && expression[i + 1] === "*") {
      i += 2;
      while (i < to && !(expression[i] === "*" && expression[i + 1] === "/")) i += 1;
      i += 2;
      continue;
    }
    // 数字
    if (isDigit(char) || (char === "." && isDigit(expression[i + 1]))) {
      i = skipNumber(expression, i, to);
      lastToken = { kind: "value", start: tokStart, end: i };
      continue;
    }
    // 字符串
    if (char === "\"" || char === "'") {
      i = skipQuoteString(expression, i, to);
      lastToken = { kind: "value", start: tokStart, end: i };
      continue;
    }
    // 模板（递归 ${expr}）
    if (char === "`") {
      i = skipTemplate(expression, i, to, segments);
      lastToken = { kind: "value", start: tokStart, end: i };
      continue;
    }
    // 正则（prevWasValue 区分除法）
    if (char === "/" && !prevWasValue()) {
      const end = skipRegex(expression, i, to);
      if (end > i) {
        i = end;
        lastToken = { kind: "value", start: tokStart, end: i };
        continue;
      }
    }
    // spread ...
    if (char === "." && expression[i + 1] === "." && expression[i + 2] === ".") {
      i += 3;
      lastToken = { kind: "operator", start: tokStart, end: i };
      continue;
    }
    // dot（成员分隔符）—— 不产生片段，由标识符 isMember 判断
    if (char === ".") {
      i += 1;
      lastToken = { kind: "operator", start: tokStart, end: i };
      continue;
    }
    // [ bracket-ref / member 下标 / 计算下标 / 数组字面量（用 lastToken 判定）
    if (char === "[") {
      i = handleBracket(expression, i, to, segments, lastToken);
      lastToken = { kind: "value", start: tokStart, end: i };
      continue;
    }
    if (char === "]") {
      i += 1;
      lastToken = { kind: "value", start: tokStart, end: i };
      continue;
    }
    // 标识符
    if (IDENT_START.test(char)) {
      i += 1;
      while (i < to && IDENT_CHAR.test(expression[i])) i += 1;
      const text = expression.slice(tokStart, i);
      // field("x")
      if (text === "field") {
        const fc = tryFieldCall(expression, i, to);
        if (fc) {
          segments.push({ kind: "field-call", start: tokStart, end: fc.end, name: fc.name, quote: fc.quote });
          i = fc.end;
          lastToken = { kind: "value", start: tokStart, end: i };
          continue;
        }
      }
      // if 只负责引出条件括号；不能与 return/typeof/else 的表达式起点共用状态，
      // 否则 return (...) 会被错误压入 if-condition 括号上下文。
      if (text === "if") {
        lastToken = { kind: "if-keyword", start: tokStart, end: i, text };
        continue;
      }
      // return/typeof/else 是语法关键字，不输出 identifier segment；显式
      // [return]/[typeof]/[else] 才是同名字段引用。
      if (EXPRESSION_PREFIX_KEYWORDS.has(text)) {
        lastToken = { kind: "expression-start", start: tokStart, end: i, text };
        continue;
      }
      // member-ref（点语法）：note.x / properties.x / formula.x
      if (MEMBER_OBJECTS.has(text)) {
        const mr = tryMemberRef(expression, i, to, text, tokStart);
        if (mr) {
          segments.push(mr);
          i = mr.end;
          lastToken = { kind: "value", start: tokStart, end: i };
          continue;
        }
        // note（无 .）：member-receiver 候选（可能后跟 ["x"]）
        const isMember = prevNonWhitespaceIs(expression, tokStart, from, ".");
        const isCall = !isMember && expression[i] === "(";
        segments.push({ kind: "identifier", start: tokStart, end: i, text, isCall, isMember });
        lastToken = { kind: "member-receiver", start: tokStart, end: i, text };
        continue;
      }
      // 普通标识符
      let j = i;
      while (j < to && WHITESPACE.test(expression[j])) j += 1;
      const isCall = expression[j] === "(";
      const isMember = prevNonWhitespaceIs(expression, tokStart, from, ".");
      segments.push({ kind: "identifier", start: tokStart, end: i, text, isCall, isMember });
      lastToken = { kind: "value", start: tokStart, end: i };
      continue;
    }
    // ( 与 parenStack：只有真正的 if-keyword 后的 ( 才是 if-condition。
    if (char === "(") {
      parenStack.push(lastToken.kind === "if-keyword" ? "if" : "other");
      i += 1;
      lastToken = { kind: "operator", start: tokStart, end: i };
      continue;
    }
    // ) 与 parenStack：if-condition 关闭 → expression-start（body 起点）；其他 ) → value
    if (char === ")") {
      const ctx = parenStack.pop() ?? "other";
      i += 1;
      lastToken = { kind: ctx === "if" ? "expression-start" : "value", start: tokStart, end: i };
      continue;
    }
    // } 是 value（对象/块关闭，SafeEval 在 } 后 prevWasValue=true）
    if (char === "}") {
      i += 1;
      lastToken = { kind: "value", start: tokStart, end: i };
      continue;
    }
    // 运算符/分隔符
    if (OPERATOR_CHARS.has(char)) {
      i += 1;
      lastToken = { kind: "operator", start: tokStart, end: i };
      continue;
    }
    // 其他字符
    i += 1;
    lastToken = { kind: "operator", start: tokStart, end: i };
  }
  return segments;
}

// ───────────────────────────────────────────────────────────────────
// 4. SCAN HELPERS
// ───────────────────────────────────────────────────────────────────

function prevNonWhitespaceIs(expression: string, start: number, from: number, target: string): boolean {
  let p = start - 1;
  while (p >= from && WHITESPACE.test(expression[p])) p -= 1;
  return expression[p] === target;
}

function skipNumber(expression: string, from: number, to: number): number {
  let i = from;
  if (expression[i] === "0" && (expression[i + 1] === "x" || expression[i + 1] === "X")) {
    i += 2;
    while (i < to && /[0-9a-fA-F]/.test(expression[i])) i += 1;
    return i;
  }
  if (expression[i] === ".") i += 1;
  while (i < to && isDigit(expression[i])) i += 1;
  if (expression[i] === ".") {
    i += 1;
    while (i < to && isDigit(expression[i])) i += 1;
  }
  if (expression[i] === "e" || expression[i] === "E") {
    i += 1;
    if (expression[i] === "+" || expression[i] === "-") i += 1;
    while (i < to && isDigit(expression[i])) i += 1;
  }
  return i;
}

function skipQuoteString(expression: string, from: number, to: number): number {
  const quote = expression[from];
  let i = from + 1;
  while (i < to) {
    if (expression[i] === "\\") {
      i += 2;
      continue;
    }
    if (expression[i] === quote) return i + 1;
    i += 1;
  }
  return i;
}

function skipTemplate(expression: string, from: number, to: number, segments: FormulaSegment[]): number {
  let i = from + 1;
  while (i < to) {
    if (expression[i] === "\\") {
      i += 2;
      continue;
    }
    if (expression[i] === "`") return i + 1;
    if (expression[i] === "$" && expression[i + 1] === "{") {
      const exprStart = i + 2;
      const exprEnd = findTemplateExpressionEnd(expression, exprStart, to);
      for (const seg of scan(expression, exprStart, exprEnd)) segments.push(seg);
      i = exprEnd < to && expression[exprEnd] === "}" ? exprEnd + 1 : exprEnd;
      continue;
    }
    i += 1;
  }
  return i;
}

/**
 * 查找模板 `${...}` 的配对 `}`。这里与主扫描共享相同的 value/operator/
 * expression-prefix 判定，避免逐字符 pv 在 `typeof /regex/`、空白除法等场景漂移。
 */
function findTemplateExpressionEnd(expression: string, from: number, to: number): number {
  let i = from;
  let depth = 1;
  let state: "value" | "operator" | "expression-start" = "expression-start";
  const isValue = (): boolean => state === "value";

  while (i < to && depth > 0) {
    const char = expression[i];
    if (WHITESPACE.test(char)) {
      i += 1;
      continue;
    }
    if (char === "/" && expression[i + 1] === "/") {
      while (i < to && expression[i] !== "\n") i += 1;
      continue;
    }
    if (char === "/" && expression[i + 1] === "*") {
      i += 2;
      while (i < to && !(expression[i] === "*" && expression[i + 1] === "/")) i += 1;
      if (i < to) i += 2;
      continue;
    }
    if (isDigit(char) || (char === "." && isDigit(expression[i + 1]))) {
      i = skipNumber(expression, i, to);
      state = "value";
      continue;
    }
    if (char === "\"" || char === "'" || char === "`") {
      i = skipQuoteString(expression, i, to);
      state = "value";
      continue;
    }
    if (char === "/" && !isValue()) {
      const end = skipRegex(expression, i, to);
      if (end > i) {
        i = end;
        state = "value";
        continue;
      }
    }
    if (IDENT_START.test(char)) {
      const start = i;
      i += 1;
      while (i < to && IDENT_CHAR.test(expression[i])) i += 1;
      const text = expression.slice(start, i);
      state = text === "typeof" || text === "return" || text === "else" || text === "if"
        ? "expression-start"
        : "value";
      continue;
    }
    if (char === "{") {
      depth += 1;
      i += 1;
      state = "operator";
      continue;
    }
    if (char === "}") {
      depth -= 1;
      if (depth === 0) return i;
      i += 1;
      state = "value";
      continue;
    }
    if (char === ")" || char === "]") {
      i += 1;
      state = "value";
      continue;
    }
    // 其余标点和运算符（包括除法、左括号、左方括号、dot/spread）都开启新操作数。
    i += 1;
    state = "operator";
  }
  return i;
}

function skipRegex(expression: string, from: number, to: number): number {
  let i = from + 1;
  let inClass = false;
  while (i < to) {
    if (expression[i] === "\\") {
      i += 2;
      continue;
    }
    if (expression[i] === "[") inClass = true;
    else if (expression[i] === "]") inClass = false;
    else if (expression[i] === "/" && !inClass) {
      i += 1;
      while (i < to && /[a-z]/.test(expression[i])) i += 1;
      return i;
    }
    i += 1;
  }
  return from;
}

function tryFieldCall(expression: string, i: number, to: number): { end: number; name: string; quote: string } | null {
  let j = i;
  while (j < to && WHITESPACE.test(expression[j])) j += 1;
  if (expression[j] !== "(") return null;
  j += 1;
  while (j < to && WHITESPACE.test(expression[j])) j += 1;
  const q = expression[j];
  if (q !== "\"" && q !== "'" && q !== "`") return null;
  j += 1;
  const nameStart = j;
  while (j < to && expression[j] !== q) j += 1;
  if (expression[j] !== q) return null;
  const name = expression.slice(nameStart, j).trim();
  let end = j + 1;
  while (end < to && expression[end] !== ")") end += 1;
  if (expression[end] === ")") end += 1;
  return { end, name, quote: q };
}

function tryMemberRef(expression: string, i: number, to: number, object: string, start: number): FormulaSegment | null {
  let j = i;
  while (j < to && WHITESPACE.test(expression[j])) j += 1;
  if (expression[j] !== ".") return null;
  j += 1;
  while (j < to && WHITESPACE.test(expression[j])) j += 1;
  if (!IDENT_START.test(expression[j])) return null;
  const nameStart = j;
  j += 1;
  while (j < to && IDENT_CHAR.test(expression[j])) j += 1;
  return { kind: "member-ref", start, end: j, object, name: expression.slice(nameStart, j) };
}

/**
 * 处理 [ 字符（用 lastToken 判定，不从历史 segment 猜）：
 *  - member-receiver（note/properties/formula）+ [string] → member-ref
 *  - value（数字/字符串/正则/模板/标识符/)/]）+ [...] → 计算/成员下标（不提取）
 *  - start/operator/expression-start（含 return/typeof/else/if body）+ [ident] → bracket-ref
 *  - start/operator/expression-start + [string] → 数组字面量（不提取）
 */
function handleBracket(expression: string, i: number, to: number, segments: FormulaSegment[], lastToken: LastToken): number {
  const close = expression.indexOf("]", i + 1);
  if (close === -1 || close >= to) return i + 1;
  const inner = expression.slice(i + 1, close).trim();
  const q = inner[0];
  const isString = (q === "\"" || q === "'" || q === "`") && inner[inner.length - 1] === q;
  // member 字符串下标：note["x"]（lastToken 是 member-receiver + [string]）
  if (lastToken.kind === "member-receiver" && isString) {
    const name = inner.slice(1, -1);
    // 合并前一个 member-receiver identifier（note）为 member-ref（lastToken 确认接收者，非猜测）
    const prev = segments[segments.length - 1];
    if (prev && prev.kind === "identifier" && prev.start === lastToken.start) {
      segments.pop();
    }
    segments.push({ kind: "member-ref", start: lastToken.start, end: close + 1, object: lastToken.text || "", name });
    return close + 1;
  }
  // value 后的 [...] 是计算/成员下标（不提取，如 obj[field]、1["x"]、note + ["price"]）
  if (lastToken.kind === "value" || lastToken.kind === "member-receiver") {
    return close + 1;
  }
  // start/operator/expression-start/if-keyword：[ident] → bracket-ref；[string] → 数组字面量
  if (!isString) {
    segments.push({ kind: "bracket-ref", start: i, end: close + 1, name: inner });
  }
  return close + 1;
}
