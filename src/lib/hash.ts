/**
 * djb2 variant — fast, non-cryptographic, deterministic.
 * Returns an unsigned 32-bit integer.
 */
export function hashStr(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = (((h << 5) + h) ^ s.charCodeAt(i)) >>> 0;
  }
  return h;
}

/**
 * Derive N pseudo-random numbers in [0,1) from a seed string.
 * Each number uses a different bit-shift so they're uncorrelated.
 */
export function seededRands(seed: string, count: number): number[] {
  const h = hashStr(seed);
  return Array.from({ length: count }, (_, i) => {
    // xorshift on each iteration keeps the distribution flat
    let v = (h ^ (h >>> (i * 3 + 1))) >>> 0;
    v = (v ^ (v << 13)) >>> 0;
    v = (v ^ (v >>> 17)) >>> 0;
    v = (v ^ (v << 5)) >>> 0;
    return v / 0xffffffff;
  });
}
