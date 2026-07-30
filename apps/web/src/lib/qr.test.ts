import { describe, expect, it } from "vitest";
import { qrMatrix } from "./qr";

/**
 * Proves the encoder emits *scannable* symbols rather than a plausible-looking
 * grid — the whole reason it exists rather than a drawing.
 *
 * It decodes rather than diffing against a reference encoder on purpose:
 * pad-codeword conventions differ between encoders, so two byte-different
 * matrices can both be correct. Ported with the encoder from the design
 * workspace's `qr.test.mjs`.
 */

/** size → [data codewords, ecc codewords, alignment centre] */
const V: Record<number, [number, number, number]> = {
  21: [19, 7, 0],
  25: [34, 10, 18],
  29: [55, 15, 22],
  33: [80, 20, 26],
};

const MASK: readonly ((x: number, y: number) => boolean)[] = [
  (x, y) => (x + y) % 2 === 0,
  (_x, y) => y % 2 === 0,
  (x) => x % 3 === 0,
  (x, y) => (x + y) % 3 === 0,
  (x, y) => (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0,
  (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
  (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
  (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
];

/**
 * Every module a decoder must skip: finders, separators, timing, alignment,
 * both format strips. Written out independently of the encoder, so a mistake
 * in its map cannot pass itself.
 */
function reservedMap(size: number, align: number): boolean[][] {
  const r = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
  const eye = (x0: number, y0: number) => {
    for (let y = -1; y < 8; y++) {
      for (let x = -1; x < 8; x++) {
        const px = x0 + x;
        const py = y0 + y;
        if (px >= 0 && py >= 0 && px < size && py < size) r[py]![px] = true;
      }
    }
  };
  eye(0, 0);
  eye(size - 7, 0);
  eye(0, size - 7);
  for (let i = 0; i < size; i++) {
    r[6]![i] = true;
    r[i]![6] = true;
  }
  for (let i = 0; i < 9; i++) {
    r[8]![i] = true;
    r[i]![8] = true;
  }
  for (let i = 0; i < 8; i++) {
    r[8]![size - 1 - i] = true;
    r[size - 1 - i]![8] = true;
  }
  if (align) {
    for (let y = -2; y < 3; y++) for (let x = -2; x < 3; x++) r[align + y]![align + x] = true;
  }
  return r;
}

function formatCopies(m: number[][]): [string, string] {
  const size = m.length;
  const a: number[] = [];
  const b: number[] = [];
  for (let i = 0; i <= 5; i++) {
    a[i] = m[8]![i]!;
    b[i] = m[size - 1 - i]![8]!;
  }
  a[6] = m[8]![7]!;
  b[6] = m[size - 7]![8]!;
  a[7] = m[8]![8]!;
  b[7] = m[8]![size - 8]!;
  a[8] = m[7]![8]!;
  b[8] = m[8]![size - 7]!;
  for (let j = 9; j <= 14; j++) {
    a[j] = m[14 - j]![8]!;
    b[j] = m[8]![size - 15 + j]!;
  }
  return [a.join(""), b.join("")];
}

function maskOf(m: number[][]): number {
  const bits = formatCopies(m)[0];
  let raw = 0;
  for (let i = 14; i >= 0; i--) raw = (raw << 1) | Number(bits[i]);
  return ((raw ^ 0b101010000010010) >> 10) & 7;
}

/** Walk the zigzag back out and hand over the codewords. */
function codewords(m: number[][]): { bits: number[]; words: number[]; ec: number } {
  const size = m.length;
  const [dw, ec, align] = V[size]!;
  const res = reservedMap(size, align);
  const f = MASK[maskOf(m)]!;
  const bits: number[] = [];
  let up = true;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let v = 0; v < size; v++) {
      const y = up ? size - 1 - v : v;
      for (let c = 0; c < 2; c++) {
        const x = right - c;
        if (res[y]![x]) continue;
        bits.push(m[y]![x]! ^ (f(x, y) ? 1 : 0));
      }
    }
    up = !up;
  }
  const w: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    w.push(parseInt(bits.slice(i, i + 8).join(""), 2));
  }
  return { bits, words: w.slice(0, dw + ec), ec };
}

function decode(m: number[][]): { mode: number; text: string } {
  const { bits } = codewords(m);
  const mode = parseInt(bits.slice(0, 4).join(""), 2);
  const n = parseInt(bits.slice(4, 12).join(""), 2);
  let out = "";
  for (let i = 0; i < n; i++) {
    out += String.fromCharCode(parseInt(bits.slice(12 + i * 8, 20 + i * 8).join(""), 2));
  }
  return { mode, text: out };
}

/** GF(256) again, independently, to check the codeword really is valid. */
const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);
for (let i = 0, x = 1; i < 255; i++) {
  EXP[i] = x;
  LOG[x] = i;
  x <<= 1;
  if (x & 0x100) x ^= 0x11d;
}
for (let j = 255; j < 512; j++) EXP[j] = EXP[j - 255]!;
const mul = (a: number, b: number) => (a && b ? EXP[LOG[a]! + LOG[b]!]! : 0);

function syndromesZero(words: number[], n: number): boolean {
  for (let i = 0; i < n; i++) {
    let s = 0;
    for (const w of words) s = mul(s, EXP[i]!) ^ w;
    if (s !== 0) return false;
  }
  return true;
}

const CASES = [
  "x",
  "hi",
  "abc",
  "0123456789",
  "plugfolio.com/mayamoves",
  "https://plugfolio.com/mayamoves",
  "https://plugfolio.com/a-rather-longer-creator-handle-here-ok",
];

describe("qrMatrix", () => {
  it.each(CASES)("round-trips %j out of its own finished matrix", (text) => {
    const m = qrMatrix(text);
    expect(m).not.toBeNull();
    const decoded = decode(m!);
    expect(decoded.text).toBe(text);
    expect(decoded.mode).toBe(4); // byte mode
  });

  it.each(CASES)("writes both format copies identically for %j", (text) => {
    const [a, b] = formatCopies(qrMatrix(text)!);
    // A scanner may read either copy; disagreeing copies decode as damage.
    expect(a).toBe(b);
  });

  it.each(CASES)("produces a valid Reed-Solomon codeword for %j", (text) => {
    const m = qrMatrix(text)!;
    const { words, ec } = codewords(m);
    expect(syndromesZero(words, ec)).toBe(true);
    expect(m[m.length - 8]![8]).toBe(1); // the dark module
  });

  it("refuses over-long input instead of truncating it", () => {
    // Silently dropping characters would produce a code that scans to the
    // wrong URL — worse than no code at all.
    expect(qrMatrix("x".repeat(200))).toBeNull();
  });
});
