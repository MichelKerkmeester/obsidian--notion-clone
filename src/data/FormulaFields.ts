import { ColumnDef } from "./types";

/**
 * 公式编辑器/求值引擎共用的虚拟文件字段（file.name/file.tags）。
 * 放在纯模块（不 import obsidian），避免 ComputedField/FormulaTokenizer 等
 * 纯逻辑模块因字段常量引入不必要的 Obsidian 耦合。实际文件值解析在 FileFields.ts。
 */
export const FORMULA_FILE_FIELDS: ColumnDef[] = [
  { key: "file.name", label: "file.name", type: "text" },
  { key: "file.tags", label: "file.tags", type: "multi-select" },
];
