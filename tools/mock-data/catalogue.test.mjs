// ───────────────────────────────────────────────────────────────────
// MODULE:    catalogue.test
// COMPONENT: the three properties the generated environments are worth nothing without
// ───────────────────────────────────────────────────────────────────
//
// Determinism, counts and type coverage are not general quality checks; each
// one is the mechanism behind an acceptance criterion, and each one has a way
// of failing silently.
//
// Determinism fails silently because a second run still produces valid data —
// just different data, in a vault the operator has already looked at. The
// negative control is the seed: a build under a different seed MUST differ, or
// the determinism check is passing because nothing varies at all, which would
// also be true of a generator that emitted the same empty record every time.
//
// Coverage fails silently because a column can be configured and never filled.
// The assertion reads the values the records actually carry, not the schema,
// so a facet that stops producing a value reddens here rather than in a
// screenshot nobody takes.
//
// Vault containment is here because the write target is outside the repository
// and cannot be undone by git. A path escaping the testbed root is the one bug
// in this folder that damages something.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { buildCatalogue, coverageOf, FACETS } from "./catalogue.ts";
import { emitObsidian, TESTBED_ROOT } from "./emit-obsidian.ts";
import { emitAllCsv, emitJson } from "./emit-portable.ts";

// The thirteen ColumnDef types the plugin declares, transcribed from
// src/data/column-types.ts's own type guard. Transcribed rather than imported
// so a type disappearing from the plugin fails this list too, instead of both
// sides moving together and the check staying green against a smaller set.
const PLUGIN_COLUMN_TYPES = [
  "text", "number", "date", "datetime", "currency", "select", "multi-select",
  "status", "checkbox", "computed", "relation", "rollup", "files",
];

const NEUTRAL_TYPES = [
  "title", "text", "richText", "url", "email", "phone",
  "number", "rating", "percent", "money",
  "select", "person", "multiSelect", "tag", "status", "checkbox",
  "date", "dateTime", "formula", "relation", "rollup", "file",
  "createdTime", "modifiedTime",
];

const catalogue = buildCatalogue();

// ───────────────────────────────────────────────────────────────────
// 2. DETERMINISM
// ───────────────────────────────────────────────────────────────────

describe("generated data is reproducible", () => {
  it("produces byte-identical JSON on a second build with the same seed", () => {
    expect(emitJson(buildCatalogue())).toBe(emitJson(buildCatalogue()));
  });

  it("produces byte-identical CSV on a second build with the same seed", () => {
    const first = emitAllCsv(buildCatalogue());
    const second = emitAllCsv(buildCatalogue());
    expect(second.map((csv) => csv.content)).toEqual(first.map((csv) => csv.content));
  });

  it("produces byte-identical vault files on a second build with the same seed", () => {
    const first = emitObsidian(buildCatalogue());
    const second = emitObsidian(buildCatalogue());
    expect(second).toEqual(first);
  });

  it("produces different values under a different seed", () => {
    // The negative control. Without it the three checks above would also pass
    // for a generator that ignored its seed and emitted a constant.
    expect(emitJson(buildCatalogue("a-different-seed"))).not.toBe(emitJson(buildCatalogue()));
  });

  it("keeps the record identifiers stable under a different seed", () => {
    // Titles and their order are declared, not drawn, so only the values move.
    // A seed that shuffled identities would rename every note in the vault on
    // a re-run, which is the opposite of an idempotent write.
    const other = buildCatalogue("a-different-seed");
    for (const [index, useCase] of catalogue.useCases.entries()) {
      expect(other.useCases[index].records.map((record) => record.id))
        .toEqual(useCase.records.map((record) => record.id));
    }
  });
});

// ───────────────────────────────────────────────────────────────────
// 3. COUNTS
// ───────────────────────────────────────────────────────────────────

describe("record counts", () => {
  it("carries ten use cases", () => {
    expect(catalogue.useCases).toHaveLength(10);
  });

  it("gives every use case between twenty and forty records", () => {
    for (const useCase of catalogue.useCases) {
      expect(useCase.records.length, useCase.id).toBeGreaterThanOrEqual(20);
      expect(useCase.records.length, useCase.id).toBeLessThanOrEqual(40);
    }
  });

  it("gives every use case the same column set", () => {
    for (const useCase of catalogue.useCases) {
      expect(useCase.columns.map((column) => column.facet), useCase.id).toEqual([...FACETS]);
    }
  });

  it("names every record uniquely inside its use case", () => {
    for (const useCase of catalogue.useCases) {
      const ids = useCase.records.map((record) => record.id);
      expect(new Set(ids).size, useCase.id).toBe(ids.length);
    }
  });

  it("emits one CSV row per record plus a header", () => {
    for (const csv of emitAllCsv(catalogue)) {
      const useCase = catalogue.useCases.find((candidate) => candidate.id === csv.id);
      // Values hold newlines, so rows are counted from the parsed grid rather
      // than by splitting on every line break.
      let rows = 0;
      let inQuotes = false;
      for (let index = 0; index < csv.content.length; index += 1) {
        const character = csv.content[index];
        if (character === '"') inQuotes = !inQuotes;
        else if (character === "\n" && !inQuotes) rows += 1;
      }
      expect(rows, csv.id).toBe(useCase.records.length + 1);
    }
  });

  it("emits one database note and one note per record", () => {
    const files = emitObsidian(catalogue);
    const expected = catalogue.useCases.length
      + catalogue.useCases.reduce((total, useCase) => total + useCase.records.length, 0);
    expect(files).toHaveLength(expected);
  });
});

// ───────────────────────────────────────────────────────────────────
// 4. TYPE COVERAGE
// ───────────────────────────────────────────────────────────────────

describe("type coverage", () => {
  it("exercises every plugin column type in every use case", () => {
    for (const useCase of catalogue.useCases) {
      const covered = coverageOf(useCase).columnTypes;
      for (const type of PLUGIN_COLUMN_TYPES) {
        expect(covered.has(type), `${useCase.id} is missing ${type}`).toBe(true);
      }
    }
  });

  it("exercises every neutral type in every use case", () => {
    for (const useCase of catalogue.useCases) {
      const covered = coverageOf(useCase).neutralTypes;
      for (const type of NEUTRAL_TYPES) {
        expect(covered.has(type), `${useCase.id} is missing ${type}`).toBe(true);
      }
    }
  });

  it("gives every use case the five view types the plugin ships and keeps", () => {
    for (const useCase of catalogue.useCases) {
      expect(useCase.views.map((view) => view.type), useCase.id)
        .toEqual(["table", "board", "calendar", "timeline", "chart"]);
    }
  });

  it("leaves exactly one record per use case entirely empty", () => {
    for (const useCase of catalogue.useCases) {
      const empty = useCase.records.filter((record) => Object.keys(record.values).length === 0);
      expect(empty.length, useCase.id).toBe(1);
    }
  });
});

// ───────────────────────────────────────────────────────────────────
// 5. RELATIONS
// ───────────────────────────────────────────────────────────────────

describe("relations", () => {
  it("points every relation at a record in the same use case", () => {
    for (const useCase of catalogue.useCases) {
      const ids = new Set(useCase.records.map((record) => record.id));
      for (const record of useCase.records) {
        for (const target of record.values.relation ?? []) {
          expect(ids.has(target), `${useCase.id}: ${record.id} points at ${target}`).toBe(true);
        }
      }
    }
  });

  it("wires at least one relation in every use case", () => {
    for (const useCase of catalogue.useCases) {
      const linked = useCase.records.filter((record) => (record.values.relation ?? []).length > 0);
      expect(linked.length, useCase.id).toBeGreaterThan(0);
    }
  });
});

// ───────────────────────────────────────────────────────────────────
// 6. VAULT CONTAINMENT
// ───────────────────────────────────────────────────────────────────

describe("vault output", () => {
  const files = emitObsidian(catalogue);

  it("writes only inside the testbed root", () => {
    for (const file of files) {
      expect(file.path.startsWith(`${TESTBED_ROOT}/`), file.path).toBe(true);
      expect(file.path.includes("..") || file.path.startsWith("/"), file.path).toBe(false);
    }
  });

  it("never writes the files the existing testbed owns", () => {
    const forbidden = [
      `${TESTBED_ROOT}/Testbed.md`,
      `${TESTBED_ROOT}/README.md`,
    ];
    const written = new Set(files.map((file) => file.path));
    for (const path of forbidden) {
      expect(written.has(path), path).toBe(false);
    }
    for (const file of files) {
      expect(file.path.startsWith(`${TESTBED_ROOT}/Records/`), file.path).toBe(false);
      expect(file.path.startsWith(`${TESTBED_ROOT}/Attachments/`), file.path).toBe(false);
    }
  });

  it("keeps every frontmatter value on one line", () => {
    // A raw newline inside a quoted scalar makes the whole block unparseable,
    // and the wrapped note values are the ones that carry newlines. Every line
    // between the fences must therefore be a key, a key with a value, or a list
    // item; anything else is a leaked line break.
    const keyLine = /^[A-Za-z_][\w.]*:(?: .*)?$/;
    for (const file of files) {
      const lines = file.content.split("\n");
      expect(lines[0], file.path).toBe("---");
      const close = lines.indexOf("---", 1);
      expect(close, file.path).toBeGreaterThan(0);
      for (const line of lines.slice(1, close)) {
        const body = line.trimStart();
        const wellFormed = body === "" || body.startsWith("- ") || keyLine.test(body);
        expect(wellFormed, `${file.path}: ${line}`).toBe(true);
      }
    }
  });
});
