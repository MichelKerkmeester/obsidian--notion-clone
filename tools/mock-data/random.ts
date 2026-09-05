// ───────────────────────────────────────────────────────────────────
// MODULE:    random
// COMPONENT: the one seeded value source every generated record draws from
// ───────────────────────────────────────────────────────────────────
//
// A test environment is only comparable across three products if the three
// hold the same records, and it is only comparable across two runs if the
// second run writes the same bytes as the first. Both properties die the
// moment one value comes from Math.random() or from the wall clock, and the
// symptom is not an error: it is a vault diff nobody can explain and a row
// count that agrees while the values disagree.
//
// So every draw goes through this file, seeded from a string, and the date
// anchor is passed in rather than read. There is no fallback to an unseeded
// source, deliberately: a fallback would make the non-deterministic path the
// one that runs when a caller forgets, which is exactly when it is invisible.

// ───────────────────────────────────────────────────────────────────
// 1. SEEDING
// ───────────────────────────────────────────────────────────────────

/** FNV-1a over the seed string. Any 32-bit hash works here; this one is short
 *  and has no dependencies, and the generator only needs the same string to
 *  produce the same stream, never a cryptographic property. */
function hashSeed(seed: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

// ───────────────────────────────────────────────────────────────────
// 2. THE STREAM
// ───────────────────────────────────────────────────────────────────

export class SeededRandom {
  private state: number;

  constructor(seed: string) {
    // A zero state is the one value mulberry32 cannot leave, so it is moved
    // off zero rather than left to produce a constant stream.
    this.state = hashSeed(seed) || 0x9e3779b9;
  }

  /** mulberry32. Returns [0, 1). */
  next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let value = this.state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  }

  /** Integer in [min, max], both inclusive. */
  int(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1));
  }

  /** A value from the list. Empty lists throw rather than returning undefined:
   *  an undefined cell reaching the emitters looks like deliberate sparsity and
   *  would be indistinguishable from it in the output. */
  pick<T>(values: readonly T[]): T {
    if (values.length === 0) throw new Error("random.pick: empty list");
    return values[this.int(0, values.length - 1)];
  }

  /** `count` distinct values, or every value when the list is shorter. */
  sample<T>(values: readonly T[], count: number): T[] {
    const pool = [...values];
    const taken: T[] = [];
    const wanted = Math.min(count, pool.length);
    for (let index = 0; index < wanted; index += 1) {
      taken.push(pool.splice(this.int(0, pool.length - 1), 1)[0]);
    }
    return taken;
  }

  /** True with probability `chance`. */
  chance(chance: number): boolean {
    return this.next() < chance;
  }

  /** A number in [min, max] rounded to `decimals`. */
  amount(min: number, max: number, decimals = 0): number {
    const raw = min + this.next() * (max - min);
    const factor = 10 ** decimals;
    return Math.round(raw * factor) / factor;
  }
}
