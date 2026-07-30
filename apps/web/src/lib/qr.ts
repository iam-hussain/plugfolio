/**
 * A real QR encoder, small enough to ship inline.
 *
 * Ported from the design workspace's `qr.js` (same project, same authorship)
 * rather than rewritten or replaced by a dependency: a decorative block of
 * squares that doesn't decode would be a lie on a page people point a camera
 * at, and this one is covered by a decoder-based test (`qr.test.ts`).
 *
 * Byte mode, error correction L, versions 1–4 (up to 78 bytes — a Plugfolio
 * profile URL is around 30). Single ECC block through version 4, which is why
 * there's no interleaving step.
 *
 * `qrMatrix(text)` → rows of 0|1, or null when the text is too long.
 */

/** version → [size, data codewords, ecc codewords, alignment centre] */
const V: Record<number, [number, number, number, number]> = {
  1: [21, 19, 7, 0],
  2: [25, 34, 10, 18],
  3: [29, 55, 15, 22],
  4: [33, 80, 20, 26],
};

/* ── GF(256), primitive polynomial 0x11D ───────────────────────── */
const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);
for (let i = 0, x = 1; i < 255; i++) {
  EXP[i] = x;
  LOG[x] = i;
  x <<= 1;
  if (x & 0x100) x ^= 0x11d;
}
for (let j = 255; j < 512; j++) EXP[j] = EXP[j - 255]!;

function mul(a: number, b: number): number {
  return a && b ? EXP[LOG[a]! + LOG[b]!]! : 0;
}

function generator(n: number): number[] {
  let g = [1];
  for (let i = 0; i < n; i++) {
    const next = new Array<number>(g.length + 1).fill(0);
    for (let j = 0; j < g.length; j++) {
      // Coefficients run highest-degree first, so multiplying by x keeps the
      // index and multiplying by the constant moves it down one.
      next[j] = next[j]! ^ g[j]!;
      next[j + 1] = next[j + 1]! ^ mul(g[j]!, EXP[i]!);
    }
    g = next;
  }
  return g;
}

function ecc(data: number[], n: number): number[] {
  const g = generator(n);
  const rem = new Array<number>(n).fill(0);
  for (let i = 0; i < data.length; i++) {
    const factor = data[i]! ^ rem[0]!;
    rem.shift();
    rem.push(0);
    for (let j = 0; j < n; j++) rem[j] = rem[j]! ^ mul(g[j + 1]!, factor);
  }
  return rem;
}

/* ── bit stream ────────────────────────────────────────────────── */
function encode(bytes: number[], ver: number): number[] {
  const dataWords = V[ver]![1];
  const bits: number[] = [];
  const push = (value: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) bits.push((value >> i) & 1);
  };
  push(0b0100, 4); // byte mode
  push(bytes.length, 8); // count: 8 bits for versions 1–9
  for (const byte of bytes) push(byte, 8);

  const cap = dataWords * 8;
  push(0, Math.min(4, cap - bits.length)); // terminator
  while (bits.length % 8) bits.push(0);
  const words: number[] = [];
  for (let b = 0; b < bits.length; b += 8) {
    words.push(parseInt(bits.slice(b, b + 8).join(""), 2));
  }
  const pad = [0xec, 0x11];
  let k = 0;
  while (words.length < dataWords) words.push(pad[k++ % 2]!);
  return words.concat(ecc(words, V[ver]![2]));
}

/* ── module placement ──────────────────────────────────────────── */
type Grid = { m: number[][]; reserved: boolean[][] };

function blank(size: number): Grid {
  const m: number[][] = [];
  const r: boolean[][] = [];
  for (let y = 0; y < size; y++) {
    m.push(new Array<number>(size).fill(0));
    r.push(new Array<boolean>(size).fill(false));
  }
  return { m, reserved: r };
}

function finder(g: Grid, size: number, x0: number, y0: number): void {
  // the 7×7 eye plus its one-module separator
  for (let y = -1; y <= 7; y++) {
    for (let x = -1; x <= 7; x++) {
      const px = x0 + x;
      const py = y0 + y;
      if (px < 0 || py < 0 || px >= size || py >= size) continue;
      const on =
        (x >= 0 && x <= 6 && (y === 0 || y === 6)) ||
        (y >= 0 && y <= 6 && (x === 0 || x === 6)) ||
        (x >= 2 && x <= 4 && y >= 2 && y <= 4);
      g.m[py]![px] = on ? 1 : 0;
      g.reserved[py]![px] = true;
    }
  }
}

function skeleton(ver: number): Grid {
  const size = V[ver]![0];
  const g = blank(size);
  finder(g, size, 0, 0);
  finder(g, size, size - 7, 0);
  finder(g, size, 0, size - 7);

  // timing
  for (let i = 8; i < size - 8; i++) {
    const on = i % 2 === 0 ? 1 : 0;
    g.m[6]![i] = on;
    g.m[i]![6] = on;
    g.reserved[6]![i] = true;
    g.reserved[i]![6] = true;
  }

  // one alignment pattern from version 2 up, bottom-right quadrant
  const c = V[ver]![3];
  if (c) {
    for (let y = -2; y <= 2; y++) {
      for (let x = -2; x <= 2; x++) {
        const on = Math.max(Math.abs(x), Math.abs(y)) !== 1;
        g.m[c + y]![c + x] = on ? 1 : 0;
        g.reserved[c + y]![c + x] = true;
      }
    }
  }

  // dark module + the two format-info strips
  g.m[size - 8]![8] = 1;
  g.reserved[size - 8]![8] = true;
  for (let i = 0; i <= 8; i++) {
    g.reserved[8]![i] = true;
    g.reserved[i]![8] = true;
  }
  for (let i = 0; i < 8; i++) {
    g.reserved[8]![size - 1 - i] = true;
    g.reserved[size - 1 - i]![8] = true;
  }
  return g;
}

function place(g: Grid, words: number[], size: number): void {
  const bits: number[] = [];
  for (const w of words) for (let i = 7; i >= 0; i--) bits.push((w >> i) & 1);

  let idx = 0;
  let up = true;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5; // skip the timing column
    for (let v = 0; v < size; v++) {
      const y = up ? size - 1 - v : v;
      for (let c = 0; c < 2; c++) {
        const x = right - c;
        if (g.reserved[y]![x]) continue;
        g.m[y]![x] = idx < bits.length ? bits[idx++]! : 0;
      }
    }
    up = !up;
  }
}

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

/** format info: 2 bits ECC (L = 01) + 3 bits mask, BCH(15,5), XOR 0x5412 */
function formatBits(mask: number): number {
  const v = (0b01 << 3) | mask;
  let d = v << 10;
  for (let i = 4; i >= 0; i--) if (d & (1 << (i + 10))) d ^= 0b10100110111 << i;
  return ((v << 10) | d) ^ 0b101010000010010;
}

function writeFormat(m: number[][], size: number, mask: number): void {
  const f = formatBits(mask);
  const bit = (i: number) => (f >> i) & 1;
  for (let i = 0; i <= 5; i++) {
    m[8]![i] = bit(i);
    m[size - 1 - i]![8] = bit(i);
  }
  m[8]![7] = bit(6);
  m[size - 7]![8] = bit(6);
  m[8]![8] = bit(7);
  m[8]![size - 8] = bit(7);
  m[7]![8] = bit(8);
  m[8]![size - 7] = bit(8);
  for (let j = 9; j <= 14; j++) {
    m[14 - j]![8] = bit(j);
    m[8]![size - 15 + j] = bit(j);
  }
  m[size - 8]![8] = 1; // the dark module — never a format bit
}

/**
 * The four standard penalty rules. Any mask produces a valid symbol; these
 * pick the one a camera reads most reliably.
 */
function penalty(m: number[][], size: number): number {
  let p = 0;

  const line = (get: (r: number, c: number) => number) => {
    let score = 0;
    for (let i = 0; i < size; i++) {
      let run = 1;
      for (let j = 1; j < size; j++) {
        if (get(i, j) === get(i, j - 1)) run++;
        else {
          if (run >= 5) score += run - 2;
          run = 1;
        }
      }
      if (run >= 5) score += run - 2;
    }
    return score;
  };
  p += line((r, c) => m[r]![c]!);
  p += line((r, c) => m[c]![r]!);

  for (let y = 0; y < size - 1; y++) {
    for (let x = 0; x < size - 1; x++) {
      const s = m[y]![x]! + m[y]![x + 1]! + m[y + 1]![x]! + m[y + 1]![x + 1]!;
      if (s === 0 || s === 4) p += 3;
    }
  }

  const PAT = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0];
  const scan = (get: (r: number, c: number) => number) => {
    let score = 0;
    for (let a = 0; a < size; a++) {
      for (let b = 0; b + 11 <= size; b++) {
        let hit = true;
        let hit2 = true;
        for (let k = 0; k < 11; k++) {
          if (get(a, b + k) !== PAT[k]) hit = false;
          if (get(a, b + k) !== PAT[10 - k]) hit2 = false;
        }
        if (hit || hit2) score += 40;
      }
    }
    return score;
  };
  p += scan((r, c) => m[r]![c]!);
  p += scan((r, c) => m[c]![r]!);

  let dark = 0;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) dark += m[y]![x]!;
  p += Math.floor(Math.abs((dark * 100) / (size * size) - 50) / 5) * 10;
  return p;
}

export function qrMatrix(text: string): number[][] | null {
  const bytes: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    if (c < 128) bytes.push(c);
    else if (c < 2048) bytes.push(192 | (c >> 6), 128 | (c & 63));
    else bytes.push(224 | (c >> 12), 128 | ((c >> 6) & 63), 128 | (c & 63));
  }
  let ver = 0;
  for (let v = 1; v <= 4; v++) {
    // 4 mode bits + 8 count bits = 2 codewords of overhead, less the
    // terminator, which may be truncated — hence the exact form.
    if (bytes.length + 2 <= V[v]![1]) {
      ver = v;
      break;
    }
  }
  if (!ver) return null;

  const size = V[ver]![0];
  const words = encode(bytes, ver);
  let best: number[][] | null = null;
  let bestScore = Infinity;
  for (let mask = 0; mask < 8; mask++) {
    const g = skeleton(ver);
    place(g, words, size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (!g.reserved[y]![x] && MASK[mask]!(x, y)) g.m[y]![x] = g.m[y]![x]! ^ 1;
      }
    }
    writeFormat(g.m, size, mask);
    const sc = penalty(g.m, size);
    if (sc < bestScore) {
      bestScore = sc;
      best = g.m;
    }
  }
  return best;
}
