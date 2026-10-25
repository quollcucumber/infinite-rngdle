// Badge definitions ported from RNGdle (rngdle.com) so every number earns the same badges and EP as the original.
export const MAX = 1_000_000;
export const TOTAL = MAX + 1;

const digitSum = (s) => [...s].reduce((a, x) => a + Number(x), 0);
const sumDigits = (n) => digitSum(String(n));
const productDigits = (n) => (n === 0 ? 0 : [...String(n)].reduce((a, x) => a * Number(x), 1));
const diffs = (s) => [...s].slice(1).map((x, i) => x - s[i]);
const distinct = (c) => c.filter((k) => k > 0).length;
const isPalindrome = (s) => s === [...s].reverse().join('');
const ROTATED = { 0: '0', 1: '1', 6: '9', 8: '8', 9: '6' };
const FACTORIALS = new Set([1, 2, 6, 24, 120, 720, 5040, 40320, 362880]);

function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}
const isSquare = (x) => x >= 0 && Number.isInteger(Math.sqrt(x));
const isCube = (x) => Math.round(Math.cbrt(x)) ** 3 === x;
// Same floating-point test RNGdle uses, so edge cases agree.
const isPerfectPower = (x, k) => x === 0 || x === 1 || Math.round(x ** (1 / k)) ** k === x;
const isPronic = (x) => Number.isInteger((Math.sqrt(1 + 4 * x) - 1) / 2);
function isPowerOf(x, b) {
  if (x <= 0) return false;
  let p = 1;
  while (p < x) p *= b;
  return p === x;
}

// A run of k digits that each step by +1, or each step by -1.
function hasRun(s, k) {
  for (let i = 0; i + k <= s.length; i++) {
    const step = s[i + 1] - s[i];
    if (step !== 1 && step !== -1) continue;
    let ok = true;
    for (let j = 2; j < k && ok; j++) ok = s[i + j] - s[i + j - 1] === step;
    if (ok) return true;
  }
  return false;
}
function isScrambledRun(s) {
  if (s.length < 2) return false;
  const d = [...s].map(Number).sort((a, b) => a - b);
  return d.every((x, i) => i === 0 || x === d[i - 1] + 1);
}
function hasScrambledRun(s) {
  for (let len = 3; len <= s.length; len++)
    for (let i = 0; i + len <= s.length; i++) if (isScrambledRun(s.slice(i, i + len))) return true;
  return false;
}
function hasPalindromeOf(s, min) {
  for (let len = min; len <= s.length; len++)
    for (let i = 0; i + len <= s.length; i++) if (isPalindrome(s.slice(i, i + len))) return true;
  return false;
}
function hasRepeatedSubstring(s) {
  for (let len = 2; len <= s.length / 2; len++)
    for (let i = 0; i + len <= s.length; i++) if (s.indexOf(s.slice(i, i + len), i + len) !== -1) return true;
  return false;
}

// Mountain (dir 1): strictly up to the first peak, then strictly down. Valley (dir -1) is the mirror.
function peak(s, dir) {
  const d = diffs(s).map((x) => x * dir);
  const top = d.findIndex((x, i) => i + 1 < d.length && x > 0 && d[i + 1] < 0);
  if (s.length < 3 || top === -1) return false;
  return d.every((x, i) => (i <= top ? x > 0 : x < 0));
}
function riseThenFall(d) {
  let rose = false, fell = false;
  for (const x of d) {
    if (x > 0) { if (fell) return false; rose = true; }
    else if (x < 0) fell = true;
  }
  return rose && fell;
}
const zigzag = (d) => d.every((x, i) => x !== 0 && (i === 0 || x * d[i - 1] < 0));
function zigzagFlat(s) {
  const t = s.replace(/(\d)\1+/g, '$1');
  return t.length >= 4 && zigzag(diffs(t));
}
function hopscotch(s, c) {
  if (s.length < 3 || distinct(c) < 2) return false;
  for (let i = 0; i + 2 < s.length; i++) {
    if (s[i + 2] !== s[i]) continue;
    if (s[i + 4] === s[i] || s[i - 2] === s[i]) continue;
    return true;
  }
  return false;
}
function contiguousThreePair(s, c) {
  const starts = [];
  for (let d = 0; d <= 9; d++) if (c[d] === 2) { const i = s.indexOf(`${d}${d}`); if (i !== -1) starts.push(i); }
  starts.sort((a, b) => a - b);
  return starts.some((x, i) => starts[i + 1] === x + 2 && starts[i + 2] === x + 4);
}
// Maximal blocks of one repeated digit, e.g. 1223334 -> [1][22][333][4].
function blocks(s) {
  const out = [];
  for (let i = 0; i < s.length;) {
    let j = i;
    while (s[j + 1] === s[i]) j++;
    out.push({ d: s[i], start: i, end: j, len: j - i + 1 });
    i = j + 1;
  }
  return out;
}
function contiguousBoat(s, c) {
  if (!c.some((k) => k >= 3) || c.filter((k) => k >= 2).length < 2) return false;
  const b = blocks(s);
  return b.some((x, i) => x.len >= 3 && [b[i - 1], b[i + 1]].some((y) => y && y.len >= 2 && c[y.d] >= 2));
}

const leadingZero = (p) => p.length > 1 && p[0] === '0';
const anyMultiDigit = (parts) => parts.some((p) => p.length >= 2);
const isConsecutiveSet = (nums) => [...nums].sort((a, b) => a - b).every((x, i, a) => i === 0 || x === a[i - 1] + 1);
function isMonotonic(nums) {
  if (!nums) return null;
  return nums.every((x, i) => i === 0 || x > nums[i - 1]) || nums.every((x, i) => i === 0 || x < nums[i - 1]);
}
// First way (shortest leading pieces first) to cut s into k pieces without leading zeros that satisfies ok().
function findSplit(s, k, ok) {
  const nums = [];
  const go = (from, left) => {
    if (left === 1) {
      const p = s.slice(from);
      if (leadingZero(p)) return false;
      nums.push(Number(p));
      if (ok(nums)) return true;
      nums.pop();
      return false;
    }
    for (let to = from + 1; to <= s.length - (left - 1); to++) {
      const p = s.slice(from, to);
      if (leadingZero(p)) continue;
      nums.push(Number(p));
      if (go(to, left - 1)) return true;
      nums.pop();
    }
    return false;
  };
  return go(0, k) ? [...nums] : null;
}
const wholeConsecutiveSplit = (s, k) => (k < s.length ? findSplit(s, k, isConsecutiveSet) : null);
const isArithmetic = (a) => Math.abs(a[1] - a[0]) > 1 && a.every((x, i) => i < 2 || x - a[i - 1] === a[1] - a[0]);
const isGeometric = (a) => a.every((x) => x > 0) && a[0] !== a[1] && a.every((x, i) => i < 2 || a[i - 1] * a[i - 1] === a[i - 2] * x);
function hasProgressionSplit(s, ok) {
  for (let k = 3; k <= s.length; k++) if (findSplit(s, k, ok)) return true;
  return false;
}
const hasEquation = (s) => findSplit(s, 3, ([a, b, r]) => a !== 0 && b !== 0 && r !== 0 && (a + b === r || a - b === r || a * b === r || a / b === r)) !== null;

// Two substrings next to each other (not the whole number) that are consecutive integers, e.g. 1[78][79]2.
function consecutivePairInside(s) {
  for (let i = 0; i < s.length; i++)
    for (let len = 1; i + len < s.length; len++) {
      const p = s.slice(i, i + len);
      if (leadingZero(p)) continue;
      for (const q of [Number(p) + 1, Number(p) - 1]) {
        if (q < 0) continue;
        const qs = String(q), end = i + len + qs.length;
        if (end > s.length || s.slice(i + len, end) !== qs || !anyMultiDigit([p, qs])) continue;
        if (i === 0 && end === s.length) continue;
        return true;
      }
    }
  return false;
}
// k consecutive integers written back to back, counting up or down, starting at `from`.
function chainAt(s, from, k) {
  for (let len = 1; len <= s.length - from - (k - 1); len++) {
    const first = s.slice(from, from + len);
    if (leadingZero(first)) continue;
    for (const step of [1, -1]) {
      const parts = [first];
      let pos = from + len;
      for (let j = 1; j < k; j++) {
        const v = Number(first) + j * step;
        const vs = String(v);
        if (v < 0 || s.slice(pos, pos + vs.length) !== vs) break;
        parts.push(vs);
        pos += vs.length;
      }
      if (parts.length === k && anyMultiDigit(parts)) return { end: pos };
    }
  }
  return null;
}
function consecutiveRunInside(s, k) {
  for (let i = 0; i < s.length; i++) {
    const r = chainAt(s, i, k);
    if (r && !(i === 0 && r.end === s.length)) return true;
  }
  return false;
}
// Two separated (non-touching) substrings that are consecutive integers.
function consecutivePairApart(s) {
  const subs = [];
  for (let i = 0; i < s.length; i++)
    for (let j = i + 1; j <= s.length; j++) {
      const p = s.slice(i, j);
      if (!leadingZero(p)) subs.push({ v: Number(p), i, j, multi: p.length >= 2 });
    }
  return subs.some((a, x) => subs.some((b, y) => y > x && Math.abs(a.v - b.v) === 1 && (a.multi || b.multi) && (a.j < b.i || b.j < a.i)));
}

// [id, name, icon, description, family | null, test(n, s, digitCounts)]
const RAW = [
  ['PRIME', 'Prime Number', '💎', 'Divisible only by 1 and itself.', null, (n, s, c) => isPrime(n)],
  ['PALINDROME', 'Palindrome', '🪞', 'Reads the same forwards and backwards.', 'PALINDROME', (n, s, c) => isPalindrome(s)],
  ['HEAVY', 'Heavy', '🧱', 'The sum of its digits exceeds 45.', null, (n, s, c) => sumDigits(n) > 45],
  ['VOID', 'Void', '🕳️', 'Contains no zeros.', null, (n, s, c) => !s.includes('0')],
  ['NICE', 'Nice', '😏', 'Contains the number 69.', 'NICE', (n, s, c) => s.includes('69')],
  ['NICE_EXACT', 'Exact Nice', '😏', "Exactly \"69\".", 'NICE', (n, s, c) => s === '69'],
  ['EVEN', 'Even', '⚖️', 'Divisible by 2.', null, (n, s, c) => n % 2 === 0],
  ['ODD', 'Odd', '🦄', 'Not divisible by 2.', null, (n, s, c) => n % 2 === 1],
  ['FEATHER', 'Feather', '🪶', 'The sum of its digits is less than 15.', null, (n, s, c) => sumDigits(n) < 15],
  ['CLEAN', 'Clean', '🧼', 'Ends in a zero.', 'VOID_DEPTH', (n, s, c) => s.endsWith('0')],
  ['SEMI_CLEAN', 'Semi-Clean', '🧹', 'Ends in a 5.', null, (n, s, c) => s.endsWith('5')],
  ['CENTURY', 'Century', '💯', 'Ends in double zeros.', 'VOID_DEPTH', (n, s, c) => s.endsWith('00')],
  ['MILLENNIUM', 'Millennium', '🗓️', 'Ends in triple zeros.', 'VOID_DEPTH', (n, s, c) => s.endsWith('000')],
  ['EPOCH', 'Epoch', '🏛️', 'Ends in four zeros.', 'VOID_DEPTH', (n, s, c) => s.endsWith('0000')],
  ['EON', 'Eon', '🗿', 'Ends in five zeros.', 'VOID_DEPTH', (n, s, c) => s.endsWith('00000')],
  ['DOZEN', 'Dozen', '🍩', 'Divisible by 12.', null, (n, s, c) => n > 0 && n % 12 === 0],
  ['LUCKY_SEVEN_DIV', 'Lucky Seven (Divisible)', '🎰', 'Divisible by 7.', null, (n, s, c) => n > 0 && n % 7 === 0],
  ['ELEVEN', 'Eleven', '🕚', 'Divisible by 11.', null, (n, s, c) => n > 0 && n % 11 === 0],
  ['GROUNDED', 'Grounded', '⚓', 'The first digit is smaller than the last.', null, (n, s, c) => s.length >= 2 && s[0] < s.at(-1)],
  ['LIFTOFF', 'Liftoff', '🚀', 'The first digit is larger than the last.', null, (n, s, c) => s.length >= 2 && s[0] > s.at(-1)],
  ['EQUILIBRIUM', 'Equilibrium', '🧘', 'The first and last digits are identical.', 'EQUILIBRIUM', (n, s, c) => s.length >= 2 && s[0] === s.at(-1)],
  ['TURTLE', 'Turtle', '🐢', 'All consecutive digits differ by at most 1.', 'PROGRESSION', (n, s, c) => s.length >= 2 && diffs(s).every((d) => Math.abs(d) <= 1)],
  ['FIREFLY', 'Firefly', '🪲', 'One unique digit among identical others.', 'DUALITY', (n, s, c) => s.length >= 4 && distinct(c) === 2 && c.includes(1)],
  ['ECHO', 'Echo', '📣', 'The first half repeats as the second half.', null, (n, s, c) => s.length % 2 === 0 && s.length >= 2 && s.slice(0, s.length / 2) === s.slice(s.length / 2)],
  ['SANDWICH', 'Sandwich', '🥪', 'First and last digits match, with at least one different digit between them.', 'EQUILIBRIUM', (n, s, c) => s.length >= 3 && s[0] === s.at(-1) && [...s.slice(1, -1)].some((x) => x !== s[0])],
  ['BOOKENDS', 'Bookends', '📚', 'The first two digits match the last two.', 'BOOKENDS', (n, s, c) => s.length >= 4 && s.slice(0, 2) === s.slice(-2)],
  ['ASCENSION', 'Ascension', '📈', 'Every digit is strictly larger than the previous.', 'MONOTONIC', (n, s, c) => s.length >= 2 && diffs(s).every((d) => d > 0)],
  ['DECAY', 'Decay', '📉', 'Every digit is strictly smaller than the previous.', 'MONOTONIC', (n, s, c) => s.length >= 2 && diffs(s).every((d) => d < 0)],
  ['STEPS', 'Steps', '🪜', 'Digits never decrease.', 'MONOTONIC', (n, s, c) => s.length >= 2 && diffs(s).every((d) => d >= 0) && diffs(s).some((d) => d > 0)],
  ['SLOPES', 'Slopes', '🛝', 'Digits never increase.', 'MONOTONIC', (n, s, c) => s.length >= 2 && diffs(s).every((d) => d <= 0) && diffs(s).some((d) => d < 0)],
  ['CASCADE', 'Cascade', '🌊', 'Every digit increases by exactly 1 from the previous.', 'PROGRESSION', (n, s, c) => s.length >= 2 && diffs(s).every((d) => d === 1)],
  ['WATERFALL', 'Waterfall', '🚿', 'Every digit decreases by exactly 1 from the previous.', 'PROGRESSION', (n, s, c) => s.length >= 2 && diffs(s).every((d) => d === -1)],
  ['MOUNTAIN', 'Mountain', '🏔️', 'Digits ascend to a peak and then descend.', 'PEAK', (n, s, c) => peak(s, 1)],
  ['VALLEY', 'Valley', '🏜️', 'Digits descend to a trough and then ascend.', 'PEAK', (n, s, c) => peak(s, -1)],
  ['MESA', 'Mesa', '🗻', 'Digits rise to a peak, then fall (flat stretches allowed).', 'PEAK', (n, s, c) => riseThenFall(diffs(s))],
  ['CANYON', 'Canyon', '🌄', 'Digits fall to a floor, then rise (flat stretches allowed).', 'PEAK', (n, s, c) => riseThenFall(diffs(s).map((d) => -d))],
  ['HILLS', 'Hills', '🏞️', 'Digits strictly alternate between rising and falling.', 'HILLS', (n, s, c) => s.length >= 4 && zigzag(diffs(s))],
  ['DUNES', 'Dunes', '🐫', 'Rises and falls keep alternating (flat stretches allowed).', 'HILLS', (n, s, c) => zigzagFlat(s)],
  ['POCKET_MIRROR', 'Pocket Mirror', '🪞', 'Contains a palindrome of 4 or more digits.', 'PALINDROME', (n, s, c) => hasPalindromeOf(s, 4)],
  ['MINI_ECHO', 'Mini Echo', '🔂', 'Contains an adjacent 2-digit repeat.', 'REPEAT', (n, s, c) => /(\d\d)\1/.test(s)],
  ['RHYME', 'Rhyme', '🎶', 'Contains the same 2+ digit substring twice.', 'REPEAT', (n, s, c) => hasRepeatedSubstring(s)],
  ['CONTIGUOUS_TRIPS', 'Contiguous Trips', '➖', 'Three identical consecutive digits.', 'CONTIGUOUS_RUN', (n, s, c) => /(\d)\1\1/.test(s)],
  ['CONTIGUOUS_QUADS', 'Contiguous Quads', '➖➖', 'Four identical consecutive digits.', 'CONTIGUOUS_RUN', (n, s, c) => /(\d)\1{3}/.test(s)],
  ['CONTIGUOUS_FIVES', 'Contiguous Fives', '➖➖➖', 'Five identical consecutive digits.', 'CONTIGUOUS_RUN', (n, s, c) => /(\d)\1{4}/.test(s)],
  ['CONTIGUOUS_SIXES', 'Contiguous Sixes', '➖➖➖➖', 'Six identical consecutive digits.', 'CONTIGUOUS_RUN', (n, s, c) => /(\d)\1{5}/.test(s)],
  ['BINARY_SOUL', 'Binary Soul', '🤖', 'Only 0s and 1s.', null, (n, s, c) => /^[01]+$/.test(s)],
  ['DUALITY', 'Duality', '☯️', 'Uses exactly two different digits.', 'DUALITY', (n, s, c) => distinct(c) === 2],
  ['TRINITY', 'Trinity', '⚜️', 'Uses exactly three different digits.', null, (n, s, c) => distinct(c) === 3],
  ['QUARTET', 'Quartet', '🎻', 'Uses exactly four different digits.', null, (n, s, c) => distinct(c) === 4],
  ['HETEROGENEOUS', 'Heterogeneous', '🥗', 'No repeated digits.', null, (n, s, c) => distinct(c) === s.length],
  ['HOMOGENEOUS', 'Homogeneous', '🥛', 'All digits are the same.', null, (n, s, c) => s.length >= 2 && distinct(c) === 1],
  ['ALTERNATOR', 'Alternator', '⚡', 'Digits strictly alternate between even and odd.', null, (n, s, c) => s.length >= 2 && diffs(s).every((d) => d % 2 !== 0)],
  ['ZIPPER', 'Zipper', '🤐', 'Two digits alternating perfectly.', null, (n, s, c) => s.length >= 2 && distinct(c) === 2 && diffs(s).every((d) => d !== 0)],
  ['HOPSCOTCH', 'Hopscotch', '🦘', 'A digit appears at every other position (2 times).', 'HOPSCOTCH', (n, s, c) => hopscotch(s, c)],
  ['DOUBLE_HOP', 'Double Hop', '🦘🦘', 'A digit appears at every other position (3 times).', 'HOPSCOTCH', (n, s, c) => s.length >= 5 && distinct(c) >= 2 && /(\d)\d\1\d\1/.test(s)],
  ['FRAMED_PAIR', 'Framed Pair', '🖼️', 'A 4-digit number where the middle two digits match each other but differ from both end digits.', 'PAIRS', (n, s, c) => s.length === 4 && s[1] === s[2] && s[0] !== s[1] && s[3] !== s[1]],
  ['FRAMED_TRIPLE', 'Framed Triple', '🖼️🖼️', 'A triple in the middle, bookended by different digits.', 'OF_A_KIND', (n, s, c) => s.length === 5 && s[1] === s[2] && s[2] === s[3] && s[0] !== s[1] && s[4] !== s[1]],
  ['FRAMED_QUAD', 'Framed Quad', '🪟', 'Four of a kind in the middle, bookended by different digits.', 'OF_A_KIND', (n, s, c) => s.length === 6 && s[2] === s[1] && s[3] === s[1] && s[4] === s[1] && s[0] !== s[1] && s[5] !== s[1]],
  ['FRAMED_DOUBLE', 'Framed Double', '🖼️🖼️🖼️', 'Two pairs in the middle, bookended by different digits.', 'PAIRS', (n, s, c) => s.length === 6 && s[1] === s[2] && s[3] === s[4] && s[1] !== s[3] && s[0] !== s[1] && s[5] !== s[3]],
  ['SQUARE', '2nd Power', '🟦', 'A perfect square (n²).', 'POWER', (n, s, c) => isSquare(n)],
  ['CUBE', '3rd Power', '🧊', 'A perfect cube (n³).', 'POWER', (n, s, c) => isCube(n)],
  ['FOURTH_POWER', '4th Power', '📦', 'A perfect fourth power (n⁴).', 'POWER', (n, s, c) => isPerfectPower(n, 4)],
  ['FIFTH_POWER', '5th Power', '🖐️', 'A perfect fifth power (n⁵).', 'POWER', (n, s, c) => isPerfectPower(n, 5)],
  ['SIXTH_POWER', '6th Power', '🎲', 'A perfect sixth power (n⁶).', 'POWER', (n, s, c) => isPerfectPower(n, 6)],
  ['SEVENTH_POWER', '7th Power', '🌈', 'A perfect seventh power (n⁷).', 'POWER', (n, s, c) => isPerfectPower(n, 7)],
  ['EIGHTH_POWER', '8th Power', '🎱', 'A perfect eighth power (n⁸).', 'POWER', (n, s, c) => isPerfectPower(n, 8)],
  ['NINTH_POWER', '9th Power', '☁️', 'A perfect ninth power (n⁹).', 'POWER', (n, s, c) => isPerfectPower(n, 9)],
  ['TENTH_POWER', '10th Power', '🔟', 'A perfect tenth power (n¹⁰).', 'POWER', (n, s, c) => isPerfectPower(n, 10)],
  ['ELEVENTH_POWER', '11th Power', '🕚', 'A perfect eleventh power (n¹¹).', 'POWER', (n, s, c) => isPerfectPower(n, 11)],
  ['THIRTEENTH_POWER', '13th Power', '💀', 'A perfect thirteenth power (n¹³).', 'POWER', (n, s, c) => isPerfectPower(n, 13)],
  ['SEVENTEENTH_POWER', '17th Power', '🧙', 'A perfect seventeenth power (n¹⁷).', 'POWER', (n, s, c) => isPerfectPower(n, 17)],
  ['NINETEENTH_POWER', '19th Power', '🌑', 'A perfect nineteenth power (n¹⁹).', 'POWER', (n, s, c) => isPerfectPower(n, 19)],
  ['FIBONACCI', 'Fibonacci Number', '🐚', 'Part of the golden ratio sequence found in nature.', null, (n, s, c) => isSquare(5 * n * n + 4) || isSquare(5 * n * n - 4)],
  ['POWER_OF_TWO', 'Power of Two', '💾', 'A power of 2 (2ⁿ).', null, (n, s, c) => isPowerOf(n, 2)],
  ['POWER_OF_THREE', 'Power of Three', '🔺', 'A power of 3 (3ⁿ).', null, (n, s, c) => isPowerOf(n, 3)],
  ['POWER_OF_FIVE', 'Power of Five', '5️⃣', 'A power of 5 (5ⁿ).', null, (n, s, c) => isPowerOf(n, 5)],
  ['POWER_OF_SEVEN', 'Power of Seven', '7️⃣', 'A power of 7 (7ⁿ).', null, (n, s, c) => isPowerOf(n, 7)],
  ['OUROBOROS', 'Ouroboros', '🐍', 'A number raised to itself: nⁿ (1¹, 2², ... 7⁷).', 'POWER', (n, s, c) => [1, 4, 27, 256, 3125, 46656, 823543].includes(n)],
  ['EQUATION', 'Equation', '🟰', 'Insert one of + − × ÷ and an equals sign to make a true equation.', null, (n, s, c) => hasEquation(s)],
  ['FACTORIAL', 'Factorial', '❗', 'A factorial number (n!).', null, (n, s, c) => FACTORIALS.has(n)],
  ['HARSHAD', 'Harshad Number', '🤝', 'Divisible by the sum of its own digits.', null, (n, s, c) => n > 0 && n % sumDigits(n) === 0],
  ['SPY', 'Spy Number', '🕵️', 'The sum of its digits equals the product of its digits.', null, (n, s, c) => n !== 1 && n !== 2 && sumDigits(n) === productDigits(n)],
  ['PRONIC', 'Pronic Number', '🧮', 'The product of two consecutive integers (n * n+1).', null, (n, s, c) => isPronic(n)],
  ['PAIR', 'Pair', '👯', 'Contains a pair of matching digits.', 'PAIRS', (n, s, c) => c.some((k) => k >= 2)],
  ['CONTIGUOUS_PAIR', 'Contiguous Pair', '🫂', 'Contains a contiguous pair of matching digits.', 'PAIRS', (n, s, c) => /(\d)\1/.test(s)],
  ['TWO_PAIR', 'Two Pair', '👯‍♀️', 'Contains two distinct pairs of matching digits.', 'PAIRS', (n, s, c) => c.filter((k) => k >= 2).length >= 2],
  ['CONTIGUOUS_TWO_PAIR', 'Contiguous Two Pair', '👨‍👩‍👧‍👦', 'Contains two adjacent contiguous pairs.', 'PAIRS', (n, s, c) => /(\d)\1(?!\1)(\d)\2/.test(s)],
  ['THREE_PAIR', 'Three Pair', '👯‍♀️👯', 'Contains three distinct pairs of matching digits.', 'PAIRS', (n, s, c) => c.filter((k) => k === 2).length >= 3],
  ['CONTIGUOUS_THREE_PAIR', 'Contiguous Three Pair', '👨‍👩‍👧‍👦👯', 'Contains three adjacent contiguous pairs.', 'PAIRS', (n, s, c) => contiguousThreePair(s, c)],
  ['TRIPS', 'Three of a Kind', '🎰', 'Contains three identical digits.', 'OF_A_KIND', (n, s, c) => c.includes(3)],
  ['QUADS', 'Four of a Kind', '🍀', 'Contains four identical digits.', 'OF_A_KIND', (n, s, c) => c.some((k) => k >= 4)],
  ['FIVE_OF_A_KIND', 'Five of a Kind', '🃏', 'Contains five identical digits.', 'OF_A_KIND', (n, s, c) => c.some((k) => k >= 5)],
  ['BOAT', 'Full House', '🏠', 'Contains a set of three and a set of two.', 'BOAT', (n, s, c) => c.some((k) => k >= 3) && c.filter((k) => k >= 2).length >= 2],
  ['CONTIGUOUS_BOAT', 'Contiguous Full House', '🏰', 'Contains a contiguous set of three adjacent to a contiguous set of two.', 'BOAT', (n, s, c) => contiguousBoat(s, c)],
  ['STRAIGHT', 'Straight', '📏', 'Contains a sequence of 5 consecutive digits (ascending or descending).', 'STRAIGHT', (n, s, c) => hasRun(s, 5)],
  ['FLUSH', 'Flush', '🎨', 'All digits are either all even or all odd.', null, (n, s, c) => /^[02468]+$|^[13579]+$/.test(s)],
  ['STRAIGHT_FLUSH', 'Straight Flush', '🃏', 'Contains 5 consecutive same-parity digits (02468, 13579, or their reverse).', 'STRAIGHT', (n, s, c) => ['02468', '13579', '86420', '97531'].some((x) => s.includes(x))],
  ['ROYAL_FLUSH', 'Royal Flush', '👑', 'Contains 56789 — the highest possible straight.', 'STRAIGHT', (n, s, c) => s.includes('56789')],
  ['LOW_BALL', 'Low Ball', '📉', 'Contains only digits from 0 to 4.', null, (n, s, c) => /^[0-4]+$/.test(s)],
  ['HIGH_ROLLER', 'High Roller', '🤑', 'Contains only digits from 5 to 9.', null, (n, s, c) => /^[5-9]+$/.test(s)],
  ['SNAKE_EYES', 'Snake Eyes', '🎲', 'Contains a single pair of ones and no other pairs.', null, (n, s, c) => c[1] === 2 && c.every((k, d) => d === 1 || k < 2)],
  ['LUCKY_7', 'Lucky Seven', '7️⃣', 'Contains the number 7.', null, (n, s, c) => s.includes('7')],
  ['JACKPOT', 'Jackpot', '💰', "Contains \"777\".", 'JACKPOT', (n, s, c) => s.includes('777')],
  ['JACKPOT_EXACT', 'Exact Jackpot', '💰', "Exactly \"777\".", 'JACKPOT', (n, s, c) => s === '777'],
  ['JACKPOT_FOUR', 'Jackpot Four', '💰💰', 'Contains four 7s in a row.', 'JACKPOT', (n, s, c) => s.includes('7777')],
  ['JACKPOT_FIVE', 'Jackpot Five', '💰💰💰', 'Contains five 7s in a row.', 'JACKPOT', (n, s, c) => s.includes('77777')],
  ['JACKPOT_SIX', 'Jackpot Six', '🏦', 'Contains six 7s in a row.', 'JACKPOT', (n, s, c) => s.includes('777777')],
  ['BLACKJACK', 'Blackjack', '♠️', 'Digits sum exactly to 21.', null, (n, s, c) => sumDigits(n) === 21],
  ['VERY_NICE', 'Very Nice', '🥵', "Contains \"6969\".", 'NICE', (n, s, c) => s.includes('6969')],
  ['BOTANIST', 'Botanist', '🌿', "Contains \"420\".", 'BOTANIST', (n, s, c) => s.includes('420')],
  ['BOTANIST_EXACT', 'Exact Botanist', '🌿', "Exactly \"420\".", 'BOTANIST', (n, s, c) => s === '420'],
  ['DEVIL', 'Devil', '😈', "Contains \"666\".", 'DEVIL', (n, s, c) => s.includes('666')],
  ['DEVIL_EXACT', 'Exact Devil', '😈', "Exactly \"666\".", 'DEVIL', (n, s, c) => s === '666'],
  ['LEET', 'Leet', '💻', "Contains \"1337\".", 'LEET', (n, s, c) => s.includes('1337')],
  ['LEET_EXACT', 'Exact Leet', '💻', "Exactly \"1337\".", 'LEET', (n, s, c) => s === '1337'],
  ['HELL', 'Hell', '🔥', "Contains \"7734\" (spells HELL upside-down).", 'HELL', (n, s, c) => s.includes('7734')],
  ['EXACT_HELL', 'Exact Hell', '👹', "Exactly \"7734\".", 'HELL', (n, s, c) => s === '7734'],
  ['BOOB_8008', '8008', '🔢', "Contains \"8008\" (spells BOOB upside-down).", 'BOOB', (n, s, c) => s.includes('8008')],
  ['BOOB_58008', '58008', '🔠', "Contains \"58008\" (spells BOOBS upside-down).", 'BOOB', (n, s, c) => s.includes('58008')],
  ['BOOB_80085', '80085', '🅱️', "Contains \"80085\" (spells BOOBS).", 'BOOB', (n, s, c) => s.includes('80085')],
  ['EXACT_BOOB', 'Exact Boob', '🍈', "Exactly \"8008\" or \"58008\".", 'BOOB', (n, s, c) => s === '8008' || s === '58008'],
  ['EXACT_BOOB_80085', 'Exact 80085', '💎', "Exactly \"80085\".", 'BOOB', (n, s, c) => s === '80085'],
  ['HELLO', 'Hello', '👋', "Contains \"07734\" (spells HELLO upside-down).", null, (n, s, c) => s.includes('07734')],
  ['MEANING', 'Meaning of Life', '🌌', "Contains \"42\".", 'BOTANIST', (n, s, c) => s.includes('42')],
  ['MEANING_EXACT', 'Exact Meaning', '🌌', "Exactly \"42\".", 'BOTANIST', (n, s, c) => s === '42'],
  ['EMERGENCY', 'Emergency', '🚑', "Contains \"911\".", 'EMERGENCY', (n, s, c) => s.includes('911')],
  ['EMERGENCY_EXACT', 'Exact Emergency', '🚑', "Exactly \"911\".", 'EMERGENCY', (n, s, c) => s === '911'],
  ['ERROR', 'Error 404', '🚫', "Contains \"404\".", 'ERROR', (n, s, c) => s.includes('404')],
  ['ERROR_EXACT', 'Not Found', '🚫', "Exactly \"404\".", 'ERROR', (n, s, c) => s === '404'],
  ['INFERNAL', 'Infernal', '🔱', "Exactly \"666666\".", 'DEVIL', (n, s, c) => s === '666666'],
  ['FOOTBALL_17776', '17776', '🏈', "Exactly \"17776\".", null, (n, s, c) => s === '17776'],
  ['ULTIMEME', 'Funny Numbers', '😂', "Contains both \"69\" and \"420\".", 'ULTIMEME', (n, s, c) => s.includes('69') && s.includes('420')],
  ['ULTIMEME_EXACT', 'Funny Number', '😂', "Exactly \"69420\" or \"42069\".", 'ULTIMEME', (n, s, c) => s === '69420' || s === '42069'],
  ['VERY_VERY_NICE', 'Very Very Nice', '😏', "Exactly \"696969\".", 'NICE', (n, s, c) => s === '696969'],
  ['HOTBOX', 'Hotbox', '🌿', "Exactly \"420420\".", 'BOTANIST', (n, s, c) => s === '420420'],
  ['MAYDAY', 'Mayday', '🚑', "Exactly \"911911\".", 'EMERGENCY', (n, s, c) => s === '911911'],
  ['DEEPER_MEANING', 'Deeper Meaning', '🌌', "Contains \"4242\".", 'MEANING', (n, s, c) => s.includes('4242')],
  ['UNIVERSAL_ANSWER', 'Universal Answer', '🌌', "Exactly \"424242\".", 'MEANING', (n, s, c) => s === '424242'],
  ['SECRET_AGENT', 'Secret Agent', '🕶️', "Contains \"007\".", null, (n, s, c) => s.includes('007')],
  ['BIG_BROTHER', 'Big Brother', '👁️', "Contains \"1984\".", 'BIG_BROTHER', (n, s, c) => s.includes('1984')],
  ['BIG_BROTHER_EXACT', 'Orwellian', '👁️', "Exactly \"1984\".", 'BIG_BROTHER', (n, s, c) => s === '1984'],
  ['HYDROGEN', 'Hydrogen (1)', '💧', "Contains exactly one \"1\".", null, (n, s, c) => c[1] === 1],
  ['HELIUM', 'Helium (2)', '🎈', "Contains exactly one \"2\".", null, (n, s, c) => c[2] === 1],
  ['CARBON', 'Carbon (6)', '✏️', "Contains exactly one \"6\".", null, (n, s, c) => c[6] === 1],
  ['OXYGEN', 'Oxygen (8)', '💨', "Contains exactly one \"8\".", null, (n, s, c) => c[8] === 1],
  ['LITHIUM', 'Lithium (3)', '🔋', "Contains exactly one \"3\".", null, (n, s, c) => c[3] === 1],
  ['BERYLLIUM', 'Beryllium (4)', '💎', "Contains exactly one \"4\".", null, (n, s, c) => c[4] === 1],
  ['BORON', 'Boron (5)', '🧼', "Contains exactly one \"5\".", null, (n, s, c) => c[5] === 1],
  ['NITROGEN', 'Nitrogen (7)', '❄️', "Contains exactly one \"7\".", null, (n, s, c) => c[7] === 1],
  ['FLUORINE', 'Fluorine (9)', '🦷', "Contains exactly one \"9\".", null, (n, s, c) => c[9] === 1],
  ['GHOST', 'Ghost', '👻', "Contains exactly one \"0\".", null, (n, s, c) => c[0] === 1],
  ['DEEP_VOID', 'Deep Void', '🕳️', "Contains \"00\".", 'VOID_DEPTH', (n, s, c) => s.includes('00')],
  ['DEEP_VOID_THREE', 'Deep Void (3)', '🌑', "Contains \"000\".", 'VOID_DEPTH', (n, s, c) => s.includes('000')],
  ['DEEP_VOID_FOUR', 'Deep Void (4)', '🌌', "Contains \"0000\".", 'VOID_DEPTH', (n, s, c) => s.includes('0000')],
  ['DEEP_VOID_FIVE', 'Deep Void (5)', '⚫', "Contains \"00000\".", 'VOID_DEPTH', (n, s, c) => s.includes('00000')],
  ['SEQUENCE_3', 'Sequence (3)', '🔢', 'Contains a sequence of 3 consecutive digits.', 'PROGRESSION', (n, s, c) => hasRun(s, 3)],
  ['SEQUENCE_4', 'Sequence (4)', '🔢', 'Contains a sequence of 4 consecutive digits.', 'PROGRESSION', (n, s, c) => hasRun(s, 4)],
  ['SEQUENCE_6', 'Sequence (6)', '🔢', 'Contains a sequence of 6 consecutive digits.', 'PROGRESSION', (n, s, c) => hasRun(s, 6)],
  ['SCRAMBLE', 'Scramble', '🔀', 'All digits form a consecutive sequence when sorted.', 'PROGRESSION', (n, s, c) => isScrambledRun(s)],
  ['MINI_SCRAMBLE', 'Mini Scramble', '🧩', 'Contains 3 or more adjacent digits that form a run when sorted.', 'PROGRESSION', (n, s, c) => hasScrambledRun(s)],
  ['NEIGHBORS', 'Neighbors', '🏘️', 'Contains two digits that are adjacent in value.', null, (n, s, c) => diffs(s).some((d) => Math.abs(d) === 1)],
  ['GAP_ONE', 'Gap One', '↕️', 'The first and last digits differ by exactly 1.', null, (n, s, c) => s.length >= 2 && Math.abs(s.at(-1) - s[0]) === 1],
  ['ONE_DIGIT', 'Single Digit', '☝️', 'Has exactly one digit.', 'SINGLE_DIGIT', (n, s, c) => s.length === 1],
  ['DIGIT_ZERO', 'Zero', '0️⃣', 'The number zero.', 'SINGLE_DIGIT', (n, s, c) => s === '0'],
  ['DIGIT_ONE', 'One', '1️⃣', 'The number one.', 'SINGLE_DIGIT', (n, s, c) => s === '1'],
  ['DIGIT_TWO', 'Two', '2️⃣', 'The number two.', 'SINGLE_DIGIT', (n, s, c) => s === '2'],
  ['DIGIT_THREE', 'Three', '3️⃣', 'The number three.', 'SINGLE_DIGIT', (n, s, c) => s === '3'],
  ['DIGIT_FOUR', 'Four', '4️⃣', 'The number four.', 'SINGLE_DIGIT', (n, s, c) => s === '4'],
  ['DIGIT_FIVE', 'Five', '5️⃣', 'The number five.', 'SINGLE_DIGIT', (n, s, c) => s === '5'],
  ['DIGIT_SIX', 'Six', '6️⃣', 'The number six.', 'SINGLE_DIGIT', (n, s, c) => s === '6'],
  ['DIGIT_SEVEN', 'Seven', '7️⃣', 'The number seven.', 'SINGLE_DIGIT', (n, s, c) => s === '7'],
  ['DIGIT_EIGHT', 'Eight', '8️⃣', 'The number eight.', 'SINGLE_DIGIT', (n, s, c) => s === '8'],
  ['DIGIT_NINE', 'Nine', '9️⃣', 'The number nine.', 'SINGLE_DIGIT', (n, s, c) => s === '9'],
  ['TWO_DIGITS', 'Two Digits', '✌️', 'Has exactly two digits.', null, (n, s, c) => s.length === 2],
  ['THREE_DIGITS', 'Three Digits', '🤟', 'Has exactly three digits.', null, (n, s, c) => s.length === 3],
  ['FOUR_DIGITS', 'Four Digits', '🍀', 'Has exactly four digits.', null, (n, s, c) => s.length === 4],
  ['FIVE_DIGITS', 'Five Digits', '🖐️', 'Has exactly five digits.', null, (n, s, c) => s.length === 5],
  ['SIX_DIGITS', 'Six Digits', '🐝', 'Has exactly six digits.', null, (n, s, c) => s.length === 6],
  ['DOUBLE_NINE', 'Double Nine', '🎈', 'Ends in 99.', 'NINE_ENDING', (n, s, c) => s.endsWith('99')],
  ['TRIPLE_NINE', 'Triple Nine', '🎉', 'Ends in 999.', 'NINE_ENDING', (n, s, c) => s.endsWith('999')],
  ['QUAD_NINE', 'Quad Nine', '🎊', 'Ends in 9999.', 'NINE_ENDING', (n, s, c) => s.endsWith('9999')],
  ['QUINT_NINE', 'Quint Nine', '🥳', 'Ends in 99999.', 'NINE_ENDING', (n, s, c) => s.endsWith('99999')],
  ['EVEN_SPACING', 'Even Spacing', '📏', 'All digits are evenly spaced in an arithmetic sequence.', 'PROGRESSION', (n, s, c) => s.length >= 3 && new Set(diffs(s)).size === 1],
  ['EVEN_SPACING_ABS', 'Even Spacing (Absolute)', '📐', 'All digits have the same absolute spacing (e.g., ±2 each time).', 'PROGRESSION', (n, s, c) => s.length >= 3 && new Set(diffs(s).map(Math.abs)).size === 1],
  ['MIRROR_BOOKENDS', 'Mirror Bookends', '📖', 'First two digits are reversed as the last two.', 'BOOKENDS', (n, s, c) => s.length >= 4 && s[0] === s.at(-1) && s[1] === s.at(-2)],
  ['PAIRED_BOOKENDS', 'Paired Bookends', '👐', 'Starts with a pair and ends with a different pair.', 'BOOKENDS', (n, s, c) => s.length >= 4 && s[0] === s[1] && s.at(-2) === s.at(-1) && s[0] !== s.at(-1)],
  ['DIVISIBLE_BY_THREE', 'Divisible by Three', '🔺', 'Every digit is divisible by 3.', null, (n, s, c) => /^[0369]+$/.test(s)],
  ['BALANCED', 'Balanced', '⚖️', 'Sum of first half of digits equals sum of second half.', null, (n, s, c) => s.length % 2 === 0 && s.length >= 2 && digitSum(s.slice(0, s.length / 2)) === digitSum(s.slice(s.length / 2))],
  ['STROBOGRAMMATIC', 'Strobogrammatic', '🙃', 'Looks the same when rotated 180 degrees.', null, (n, s, c) => /^[01689]+$/.test(s) && [...s].reverse().map((x) => ROTATED[x]).join('') === s],
  ['PI_CONTAINS_3', 'Pi Slice (3)', '🥧', "Contains \"314\".", 'PI', (n, s, c) => s.includes('314')],
  ['PI_CONTAINS_4', 'Pi Slice (4)', '🥧', "Contains \"3141\".", 'PI', (n, s, c) => s.includes('3141')],
  ['PI_CONTAINS_5', 'Pi Slice (5)', '🥧', "Contains \"31415\".", 'PI', (n, s, c) => s.includes('31415')],
  ['PI', 'Pi', '🥧', 'Exactly π (314, 3141, 31415, or 314159).', 'PI', (n, s, c) => ['314', '3141', '31415', '314159'].includes(s)],
  ['E_CONTAINS_3', 'E Slice (3)', '📈', "Contains \"271\".", 'E', (n, s, c) => s.includes('271')],
  ['E_CONTAINS_4', 'E Slice (4)', '📈', "Contains \"2718\".", 'E', (n, s, c) => s.includes('2718')],
  ['E_CONTAINS_5', 'E Slice (5)', '📈', "Contains \"27182\".", 'E', (n, s, c) => s.includes('27182')],
  ['E', 'Euler\'s Number', '📈', 'The number e (271, 2718, 27182, or 271828).', 'E', (n, s, c) => ['271', '2718', '27182', '271828'].includes(s)],
  ['TAU_SLICE_4', 'Tau Slice (4)', '🌀', "Contains \"6283\".", 'TAU', (n, s, c) => s.includes('6283')],
  ['TAU_SLICE_5', 'Tau Slice (5)', '🌀', "Contains \"62831\".", 'TAU', (n, s, c) => s.includes('62831')],
  ['TAU', 'Tau', '🌀', 'Exactly τ (6283, 62831, or 628318).', 'TAU', (n, s, c) => ['6283', '62831', '628318'].includes(s)],
  ['GOLDEN_RATIO', 'Golden Ratio', '🐚', 'Exactly φ (1618, 16180, or 161803).', null, (n, s, c) => ['1618', '16180', '161803'].includes(s)],
  ['QUARTER_CENTURY', 'Quarter-Century', '🪙', "Ends in \"25\".", null, (n, s, c) => s.endsWith('25')],
  ['SEMI_CENTURY', 'Semi-Century', '🗓️', "Ends in \"50\".", 'VOID_DEPTH', (n, s, c) => s.endsWith('50')],
  ['THREE_QUARTER_CENTURY', 'Three-Quarter Century', '🕰️', "Ends in \"75\".", null, (n, s, c) => s.endsWith('75')],
  ['SEMI_MILLENNIUM', 'Semi-Millennium', '📜', "Ends in \"500\".", 'VOID_DEPTH', (n, s, c) => s.endsWith('500')],
  ['SEMI_EPOCH', 'Semi-Epoch', '⌛', "Ends in \"5000\".", 'VOID_DEPTH', (n, s, c) => s.endsWith('5000')],
  ['SEMI_EON', 'Semi-Eon', '🦴', "Ends in \"50000\".", 'VOID_DEPTH', (n, s, c) => s.endsWith('50000')],
  ['SIXTY_SEVEN', 'Six-Seven', '🫠', "Contains \"67\".", 'SIXTY_SEVEN', (n, s, c) => s.includes('67')],
  ['SIXTY_SEVEN_EXACT', 'Exact Six-Seven', '🫠', "Exactly \"67\".", 'SIXTY_SEVEN', (n, s, c) => s === '67'],
  ['EIGHTY_SIX', 'Eighty-Six', '🍽️', "Contains \"86\" (restaurant slang for \"out of\").", 'EIGHTY_SIX', (n, s, c) => s.includes('86')],
  ['EIGHTY_SIX_EXACT', 'Exact Eighty-Six', '🍽️', "Exactly \"86\".", 'EIGHTY_SIX', (n, s, c) => s === '86'],
  ['ORIENTATION', 'Orientation', '🧭', "Contains \"101\" (intro course number).", 'ORIENTATION', (n, s, c) => s.includes('101')],
  ['ORIENTATION_EXACT', 'Exact Orientation', '🧭', "Exactly \"101\".", 'ORIENTATION', (n, s, c) => s === '101'],
  ['CALENDAR', 'Calendar', '📅', "Contains \"365\" (days in a year).", 'CALENDAR', (n, s, c) => s.includes('365')],
  ['CALENDAR_EXACT', 'Exact Calendar', '📅', "Exactly \"365\".", 'CALENDAR', (n, s, c) => s === '365'],
  ['SIXTY_SEVEN_DOUBLE', '6767', '🫠', "Contains \"6767\".", 'SIXTY_SEVEN', (n, s, c) => s.includes('6767')],
  ['BRAINROT', 'Brainrot', '🫠', "Exactly \"676767\".", 'SIXTY_SEVEN', (n, s, c) => s === '676767'],
  ['GROUNDHOG_DAY', 'Groundhog Day', '📅', "Exactly \"365365\".", 'CALENDAR', (n, s, c) => s === '365365'],
  ['ALWAYS', 'Always', '♾️', "Exactly \"247365\" or \"365247\" (24/7, 365).", 'CALENDAR', (n, s, c) => s === '247365' || s === '365247'],
  ['FULL_DAY', 'Full Day', '⏳', "Exactly \"86400\", the number of seconds in a day.", null, (n, s, c) => s === '86400'],
  ['COLOSSAL', 'Colossal', '🪨', 'A number greater than 999,000.', null, (n, s, c) => n > 999000],
  ['ONE_MILLION', 'One Million', '🐐', 'The number one million.', null, (n, s, c) => n === 1000000],
  ['CONSEC_QUAD_EXACT', '4 Consecutive Numbers', '⛓️', 'The entire number splits into four consecutive integers in order.', 'CONSECUTIVE', (n, s, c) => isMonotonic(wholeConsecutiveSplit(s, 4))],
  ['CONSEC_QUAD_SCRAMBLED', '4 Consecutive Numbers (Scrambled)', '🔀', 'The entire number splits into four consecutive integers, but not in order.', 'CONSECUTIVE', (n, s, c) => isMonotonic(wholeConsecutiveSplit(s, 4)) === false],
  ['CONSEC_QUAD_CONTAINS', '4 Consecutive Numbers (Contains)', '🔗', 'Contains four adjacent consecutive integers.', 'CONSECUTIVE', (n, s, c) => consecutiveRunInside(s, 4)],
  ['CONSEC_TRIPLE_EXACT', '3 Consecutive Numbers', '⛓️', 'The entire number splits into three consecutive integers in order.', 'CONSECUTIVE', (n, s, c) => isMonotonic(wholeConsecutiveSplit(s, 3))],
  ['CONSEC_TRIPLE_SCRAMBLED', '3 Consecutive Numbers (Scrambled)', '🔀', 'The entire number splits into three consecutive integers, but not in order.', 'CONSECUTIVE', (n, s, c) => isMonotonic(wholeConsecutiveSplit(s, 3)) === false],
  ['CONSEC_TRIPLE_CONTAINS', '3 Consecutive Numbers (Contains)', '🔗', 'Contains three adjacent consecutive integers.', 'CONSECUTIVE', (n, s, c) => consecutiveRunInside(s, 3)],
  ['CONSEC_PAIR_EXACT', '2 Consecutive Numbers', '🔗', 'The entire number splits into two consecutive integers.', 'CONSECUTIVE', (n, s, c) => wholeConsecutiveSplit(s, 2) !== null],
  ['CONSEC_PAIR_ADJACENT', '2 Consecutive Numbers (Contains)', '🔗', 'Contains two adjacent substrings that are consecutive integers.', 'CONSECUTIVE', (n, s, c) => consecutivePairInside(s)],
  ['CONSEC_PAIR_NEARBY', '2 Consecutive Numbers (Nearby)', '🔗', 'Contains two non-adjacent substrings that are consecutive integers.', 'CONSECUTIVE', (n, s, c) => consecutivePairApart(s)],
  ['ARITHMETIC', 'Metronome', '🎼', 'Splits into three or more numbers with a constant difference.', 'PROGRESSION', (n, s, c) => hasProgressionSplit(s, isArithmetic)],
  ['GEOMETRIC', 'Crescendo', '🔊', 'Splits into three or more numbers with a constant ratio.', 'PROGRESSION', (n, s, c) => hasProgressionSplit(s, isGeometric)],
];

export const BADGES = RAW.map(([id, name, icon, desc, family, test]) => ({ id, name, icon, desc, family, test, count: 0, ep: 0, rarity: 'common' }));
export const BADGE_BY_ID = Object.fromEntries(BADGES.map((b) => [b.id, b]));

export function badgeEp(count) {
  return Math.round((100 * TOTAL) / Math.max(count, 1));
}

// RNGdle colours a badge by its EP.
export const BADGE_RARITIES = [['mythic', 1e7], ['anomaly', 1e6], ['epic', 1e5], ['rare', 1e4], ['uncommon', 1e3], ['common', -Infinity]];

export function badgeRarity(ep) {
  return BADGE_RARITIES.find(([, min]) => ep >= min)[0];
}

export function applyCounts(counts) {
  for (const b of BADGES) {
    b.count = counts[b.id] ?? 0;
    b.ep = badgeEp(b.count);
    b.rarity = badgeRarity(b.ep);
  }
}

export function matchIds(n) {
  const s = String(n);
  const c = new Array(10).fill(0);
  for (const ch of s) c[ch]++;
  return BADGES.filter((b) => b.test(n, s, c));
}

export function analyze(n) {
  const matched = matchIds(n);
  const best = new Map();
  for (const b of matched) {
    if (!b.family) continue;
    const cur = best.get(b.family);
    if (!cur || b.ep > cur.ep) best.set(b.family, b);
  }
  let total = 0;
  const badges = matched
    .map((b) => {
      const counted = !b.family || best.get(b.family) === b;
      if (counted) total += b.ep;
      return { badge: b, counted };
    })
    .sort((a, b) => b.counted - a.counted || b.badge.ep - a.badge.ep);
  return { n, badges, total };
}
