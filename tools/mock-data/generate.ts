// ───────────────────────────────────────────────────────────────────
// MODULE:    generate
// COMPONENT: the CLI that writes the catalogue, the CSVs and the vault
// ───────────────────────────────────────────────────────────────────
//
// Run with `node tools/mock-data/generate.ts`. Node strips the types; there is
// no build step and no bundler, because the generator imports only types from
// src/ and never a module that touches the Obsidian runtime.
//
// The vault write is the one irreversible action here. A vault is not a git
// working tree: overwriting a note there cannot be undone, and the operator's
// own Testbed database sits in the same folder. So the writer refuses a root
// that does not already look like the testbed, writes only inside the
// per-use-case folders it owns, and skips a file whose bytes already match —
// which is what makes a second run a no-op rather than a churn of timestamps.
//
// It never deletes. A folder under the testbed root that the catalogue no
// longer produces is reported and left alone, because deciding that a note in
// someone's vault is stale is not a decision a generator gets to take.
//
// Usage:
//   node tools/mock-data/generate.ts
//   node tools/mock-data/generate.ts --vault "<path to the vault root>"
//   node tools/mock-data/generate.ts --seed other-seed

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildCatalogue, coverageOf, DEFAULT_SEED } from "./catalogue.ts";
import { emitObsidian, TESTBED_ROOT, useCaseFolder } from "./emit-obsidian.ts";
import { emitAllCsv, emitJson } from "./emit-portable.ts";

const HERE = dirname(fileURLToPath(import.meta.url));

// The two folders the existing testbed owns. The writer never opens either.
const PRESERVED = new Set(["Records", "Attachments"]);

// ───────────────────────────────────────────────────────────────────
// 2. ARGUMENTS
// ───────────────────────────────────────────────────────────────────

interface Options {
  seed: string;
  vault: string | null;
}

function parseArgs(argv: string[]): Options {
  const options: Options = { seed: DEFAULT_SEED, vault: null };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--seed") {
      options.seed = argv[index + 1] ?? "";
      index += 1;
      if (!options.seed) throw new Error("--seed needs a value");
    } else if (arg === "--vault") {
      options.vault = argv[index + 1] ?? "";
      index += 1;
      if (!options.vault) throw new Error("--vault needs a path");
    } else {
      throw new Error(`generate: unknown argument "${arg}"`);
    }
  }
  return options;
}

// ───────────────────────────────────────────────────────────────────
// 3. IDEMPOTENT WRITE
// ───────────────────────────────────────────────────────────────────

/** Writes only when the bytes differ. Returns true when the file changed, which
 *  is what the run summary counts: a second run reporting zero changes IS the
 *  idempotence check, taken at the only place that can observe it. */
function writeIfChanged(path: string, content: string): boolean {
  if (existsSync(path) && readFileSync(path, "utf8") === content) return false;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
  return true;
}

// ───────────────────────────────────────────────────────────────────
// 4. VAULT GUARD
// ───────────────────────────────────────────────────────────────────

/** Proves the path is the testbed before anything is written into it. The
 *  marker is the operator's own database note, which no other folder has. */
function assertTestbedRoot(vaultRoot: string): string {
  const testbed = join(vaultRoot, TESTBED_ROOT);
  if (!existsSync(testbed)) {
    throw new Error(`vault: no "${TESTBED_ROOT}" folder under ${vaultRoot}`);
  }
  if (!existsSync(join(testbed, "Testbed.md"))) {
    throw new Error(`vault: ${testbed} does not hold Testbed.md, so it is not the testbed this writes into`);
  }
  return testbed;
}

// ───────────────────────────────────────────────────────────────────
// 5. RUN
// ───────────────────────────────────────────────────────────────────

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const catalogue = buildCatalogue(options.seed);

  let changed = 0;
  let unchanged = 0;
  const count = (didChange: boolean): void => {
    if (didChange) changed += 1;
    else unchanged += 1;
  };

  // The product-neutral outputs, always written.
  count(writeIfChanged(join(HERE, "catalogue.json"), emitJson(catalogue)));
  for (const csv of emitAllCsv(catalogue)) {
    count(writeIfChanged(join(HERE, "csv", `${csv.id}.csv`), csv.content));
  }

  console.log("catalogue");
  let totalRecords = 0;
  for (const useCase of catalogue.useCases) {
    const coverage = coverageOf(useCase);
    totalRecords += useCase.records.length;
    console.log(
      `  ${useCase.id.padEnd(22)} ${String(useCase.records.length).padStart(3)} records  `
      + `${String(useCase.columns.length).padStart(2)} columns  `
      + `${coverage.columnTypes.size} column types  ${coverage.neutralTypes.size} neutral types  `
      + `${useCase.views.length} views`
    );
  }
  console.log(`  ${"total".padEnd(22)} ${String(totalRecords).padStart(3)} records across ${catalogue.useCases.length} databases`);

  // The vault, only when asked for.
  if (options.vault) {
    const vaultRoot = resolve(options.vault);
    const testbed = assertTestbedRoot(vaultRoot);
    const owned = new Set(catalogue.useCases.map((useCase) => useCase.name));

    let vaultChanged = 0;
    let vaultUnchanged = 0;
    for (const file of emitObsidian(catalogue)) {
      const didChange = writeIfChanged(join(vaultRoot, file.path), file.content);
      if (didChange) vaultChanged += 1;
      else vaultUnchanged += 1;
    }

    console.log(`vault ${testbed}`);
    console.log(`  ${vaultChanged} written, ${vaultUnchanged} already current`);
    for (const useCase of catalogue.useCases) {
      console.log(`  ${useCaseFolder(useCase)}`);
    }

    // Anything else under the testbed root is reported, never removed.
    const strays = readdirSync(testbed, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !owned.has(entry.name) && !PRESERVED.has(entry.name))
      .map((entry) => entry.name);
    if (strays.length > 0) {
      console.log(`  not produced by this catalogue, left untouched: ${strays.join(", ")}`);
    }
  }

  console.log(`repo outputs: ${changed} written, ${unchanged} already current`);
}

main();
