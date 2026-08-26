/**
 * Allocates stable create-time identities without coupling them to note filenames or runtime services.
 */

export interface UniqueIdConfig {
  prefix?: string;
  counter: number;
  padWidth?: number;
  field: string;
}

export function parseUniqueIdConfig(raw: unknown): UniqueIdConfig | undefined {
  if (!isRecord(raw)) return undefined;

  const prefix = typeof raw.prefix === "string" ? raw.prefix.trim() : "";
  const counter = typeof raw.counter === "number" && Number.isFinite(raw.counter) && raw.counter >= 0
    ? raw.counter
    : 0;
  const padWidth = typeof raw.padWidth === "number" && Number.isFinite(raw.padWidth) && raw.padWidth >= 1
    ? raw.padWidth
    : 3;
  const field = typeof raw.field === "string" && raw.field.trim()
    ? raw.field.trim()
    : "unique-id";

  return { prefix, counter, padWidth, field };
}

export function nextUniqueId(cfg: UniqueIdConfig): { value: string; nextCounter: number } {
  const counter = Number.isFinite(cfg.counter) && cfg.counter >= 0 ? cfg.counter : 0;
  const configuredPadWidth = cfg.padWidth;
  const padWidth = typeof configuredPadWidth === "number" && Number.isFinite(configuredPadWidth) && configuredPadWidth >= 1
    ? configuredPadWidth
    : 3;
  const number = String(counter + 1).padStart(padWidth, "0");
  const prefix = typeof cfg.prefix === "string"
    ? cfg.prefix.trim().replace(/-+$/, "").trim()
    : "";

  return {
    value: prefix ? `${prefix}-${number}` : number,
    nextCounter: counter + 1,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
