// ───────────────────────────────────────────────────────────────────
// MODULE:    setup
// COMPONENT: vitest global setup — stubs the `moment` global Obsidian normally injects at runtime
// ───────────────────────────────────────────────────────────────────
//
// `fixedNow` pins "today" for every test run so date-relative assertions
// (e.g. computed-field formulas using TODAY()) are deterministic instead
// of flaking on whichever real date the suite happens to run.

// ───────────────────────────────────────────────────────────────────
// 1. TYPES
// ───────────────────────────────────────────────────────────────────

type MomentStubValue = {
  format: (format: string) => string;
  isValid: () => boolean;
};

// ───────────────────────────────────────────────────────────────────
// 2. STUB
// ───────────────────────────────────────────────────────────────────

const fixedNow = new Date("2026-08-26T00:00:00Z");

function createMomentStub(input?: unknown): MomentStubValue {
  const date = input === undefined ? new Date(fixedNow) : new Date(String(input));
  const valid = !Number.isNaN(date.getTime());
  const pad = (value: number): string => String(value).padStart(2, "0");
  const dateText = valid
    ? `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
    : "Invalid date";

  return {
    format: (format: string) => {
      if (format === "YYYY-MM-DD") return dateText;
      if (format === "YYYY-MM-DD HH:mm:ss") {
        return valid
          ? `${dateText} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`
          : dateText;
      }
      return dateText;
    },
    isValid: () => valid,
  };
}

const momentStub = Object.assign(
  (input?: unknown): MomentStubValue => createMomentStub(input),
  { ISO_8601: "ISO_8601" },
);

Object.defineProperty(globalThis, "moment", {
  configurable: true,
  writable: true,
  value: momentStub,
});

export {};
