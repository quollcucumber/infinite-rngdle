export const MAX = 1_000_000;
export const TOTAL = MAX + 1;

const PRIME_LIM = 2 * MAX + 10;
const composite = new Uint8Array(PRIME_LIM + 1);
composite[0] = composite[1] = 1;
for (let i = 2; i * i <= PRIME_LIM; i++) {
  if (!composite[i]) for (let j = i * i; j <= PRIME_LIM; j += i) composite[j] = 1;
}
const isPrime = (x) => x >= 0 && x <= PRIME_LIM && !composite[x];

const spf = new Int32Array(MAX + 1);
for (let i = 2; i <= MAX; i++) {
  if (spf[i] === 0) for (let j = i; j <= MAX; j += i) if (spf[j] === 0) spf[j] = i;
}

const setOf = (gen) => new Set(gen);
const FIB = setOf((function* () { let a = 0, b = 1; while (a <= MAX) { yield a; [a, b] = [b, a + b]; } })());
const FACT = setOf((function* () { let f = 1; for (let i = 1; f <= MAX; i++) { yield f; f *= i + 1; } })());
const CATALAN = setOf((function* () { let c = 1; for (let i = 0; c <= MAX; i++) { yield c; c = (c * 2 * (2 * i + 1)) / (i + 2); } })());
const TAXICAB = (() => {
  const seen = new Map();
  for (let a = 1; a ** 3 <= MAX; a++) for (let b = a; a ** 3 + b ** 3 <= MAX; b++) {
    const s = a ** 3 + b ** 3;
    seen.set(s, (seen.get(s) || 0) + 1);
  }
  return new Set([...seen].filter(([, c]) => c >= 2).map(([s]) => s));
})();
const HEX_WORDS = new Set(['ACE', 'ADD', 'BAD', 'BED', 'CAB', 'DAD', 'FAB', 'FED', 'ABBA', 'BABE', 'BEAD', 'BEEF', 'CAFE', 'C0DE', 'DEAD', 'DEAF', 'FACE', 'FADE', 'FEED', 'F00D', 'ADDED', 'DECAF'].map((w) => parseInt(w, 16)));
const DAYS_IN_MONTH = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function isSquare(x) { const r = Math.round(Math.sqrt(x)); return r * r === x; }
function isCube(x) { const r = Math.round(Math.cbrt(x)); return r * r * r === x; }

function kaprekar(n) {
  if (n === 1) return true;
  const sq = n * n;
  for (let m = 10; m <= sq; m *= 10) {
    const b = sq % m;
    if (b > 0 && Math.floor(sq / m) + b === n) return true;
  }
  return false;
}

export function context(n) {
  const s = String(n);
  const len = s.length;
  const d = new Array(len);
  const cnt = new Array(10).fill(0);
  let dsum = 0;
  for (let i = 0; i < len; i++) { d[i] = s.charCodeAt(i) - 48; cnt[d[i]]++; dsum += d[i]; }
  const rs = s.split('').reverse().join('');
  let maxRun = 1, run = 1;
  for (let i = 1; i < len; i++) { run = d[i] === d[i - 1] ? run + 1 : 1; if (run > maxRun) maxRun = run; }
  const factors = [];
  let omega = 0, ndiv = n >= 1 ? 1 : 0, sigma = n >= 1 ? 1 : 0;
  for (let x = n; x > 1;) {
    const p = spf[x];
    let e = 0, pk = 1;
    while (x % p === 0) { x /= p; e++; pk *= p; }
    factors.push([p, e]);
    omega += e; ndiv *= e + 1; sigma *= (pk * p - 1) / (p - 1);
  }
  const hand = cnt.filter((c) => c > 0).sort((a, b) => b - a).join('');
  return { n, s, len, d, cnt, dsum, rs, rev: Number(rs), pal: len >= 2 && s === rs, maxRun, factors, omega, ndiv, sigma, hand, prime: isPrime(n) };
}

const steps = (c, k) => c.len >= 3 && c.d.every((x, i) => i === 0 || x - c.d[i - 1] === k);
const monotone = (c, sgn) => c.len >= 3 && c.d.every((x, i) => i === 0 || (x - c.d[i - 1]) * sgn > 0);
const digitsIn = (c, ok) => c.len >= 2 && c.d.every(ok);
const has = (c, sub) => c.s.includes(sub);
const starts = (c, sub) => c.s.startsWith(sub);

function validDate(c) {
  if (c.len !== 6) return false;
  const dd = c.d[0] * 10 + c.d[1], mm = c.d[2] * 10 + c.d[3], yy = c.d[4] * 10 + c.d[5];
  if (mm < 1 || mm > 12 || dd < 1 || dd > DAYS_IN_MONTH[mm]) return false;
  return !(mm === 2 && dd === 29 && yy % 4 !== 0);
}
function validTime(c) {
  if (c.len !== 6) return false;
  return c.d[0] * 10 + c.d[1] < 24 && c.d[2] < 6 && c.d[4] < 6;
}

const STRAIGHTS = new Set(['012345', '123456', '234567', '345678', '456789']);

// [id, name, icon, description, family | null, test(ctx)]
const RAW = [
  ['even', 'Even', '⚖️', 'Divisible by 2.', null, (c) => c.n % 2 === 0],
  ['odd', 'Odd', '🦄', 'Not divisible by 2.', null, (c) => c.n % 2 === 1],
  ['six_digits', 'Six Digits', '🔢', 'A full six-digit number.', null, (c) => c.len === 6],
  ['small', 'Small Fry', '🐟', 'Below 10,000.', 'size', (c) => c.n < 10000],
  ['tiny', 'Tiny', '🐜', 'Below 100.', 'size', (c) => c.n < 100],
  ['zero', 'Absolute Zero', '🕳️', 'Rolled exactly 0.', 'special', (c) => c.n === 0],
  ['unity', 'Unity', '☝️', 'Rolled exactly 1.', 'special', (c) => c.n === 1],
  ['jackpot', 'JACKPOT', '💰', 'Rolled the maximum: 1,000,000.', 'special', (c) => c.n === MAX],

  ['ends0', 'Clean Ending', '🧼', 'Ends in 0.', 'round', (c) => c.n > 0 && c.n % 10 === 0],
  ['r100', 'Round Hundred', '💯', 'A multiple of 100.', 'round', (c) => c.n > 0 && c.n % 100 === 0],
  ['r1000', 'Round Thousand', '🎯', 'A multiple of 1,000.', 'round', (c) => c.n > 0 && c.n % 1000 === 0],
  ['r10000', 'Big Round', '🪙', 'A multiple of 10,000.', 'round', (c) => c.n > 0 && c.n % 10000 === 0],
  ['r100000', 'Roundest', '⭕', 'A multiple of 100,000.', 'round', (c) => c.n > 0 && c.n % 100000 === 0],
  ['ends5', 'High Five', '🖐️', 'Ends in 5.', null, (c) => c.n % 10 === 5],

  ['prime', 'Prime', '💎', 'Only divisible by 1 and itself.', 'prime', (c) => c.prime],
  ['twin', 'Twin Prime', '👯', 'A prime with another prime 2 away.', 'prime', (c) => c.prime && (isPrime(c.n - 2) || isPrime(c.n + 2))],
  ['sophie', 'Sophie Germain', '👩‍🔬', 'A prime p where 2p+1 is also prime.', 'prime', (c) => c.prime && isPrime(2 * c.n + 1)],
  ['emirp', 'Emirp', '🔁', 'A prime that is a different prime backwards.', 'prime', (c) => c.prime && c.rev !== c.n && isPrime(c.rev)],
  ['palprime', 'Palindromic Prime', '🔮', 'A prime that reads the same both ways.', 'prime', (c) => c.prime && c.pal],
  ['semiprime', 'Semiprime', '✌️', 'The product of exactly two primes.', 'factor', (c) => c.omega === 2],
  ['primepow', 'Prime Power', '🗼', 'A prime raised to a power of 2 or more.', 'factor', (c) => c.factors.length === 1 && c.factors[0][1] >= 2],
  ['smooth', '7-Smooth', '🧈', 'Every prime factor is 7 or less.', 'factor', (c) => c.n > 1 && c.factors[c.factors.length - 1][0] <= 7],
  ['squarefree', 'Square-Free', '🟦', 'No prime factor appears twice.', null, (c) => c.n >= 1 && c.factors.every(([, e]) => e === 1)],
  ['divparty', 'Divisor Party', '🎉', 'Has at least 100 divisors.', null, (c) => c.ndiv >= 100],
  ['alldiv', 'All-Divisible', '🧮', 'Divisible by every digit 1–9.', null, (c) => c.n > 0 && c.n % 2520 === 0],
  ['abundant', 'Abundant', '🌾', 'Its proper divisors add up to more than itself.', 'sigma', (c) => c.n >= 1 && c.sigma > 2 * c.n],
  ['perfect', 'Perfect', '😇', 'Its proper divisors add up to exactly itself.', 'sigma', (c) => c.n >= 1 && c.sigma === 2 * c.n],

  ['square', 'Perfect Square', '⏹️', 'Some whole number squared.', 'power', (c) => isSquare(c.n)],
  ['cube', 'Perfect Cube', '🧊', 'Some whole number cubed.', 'power', (c) => isCube(c.n)],
  ['sixth', 'Square Cube', '🎲', 'Both a square and a cube.', 'power', (c) => isSquare(c.n) && isCube(c.n)],
  ['pow2', 'Power of Two', '💾', 'A power of 2.', 'power', (c) => c.n >= 1 && (c.n & (c.n - 1)) === 0],
  ['mersenne', 'Mersenne', '🧱', 'One less than a power of 2.', null, (c) => c.n >= 3 && ((c.n + 1) & c.n) === 0],
  ['triangular', 'Triangular', '🔺', 'Can be stacked into a triangle (1+2+3+…).', null, (c) => isSquare(8 * c.n + 1)],
  ['fibonacci', 'Fibonacci', '🐚', 'In the Fibonacci sequence.', null, (c) => FIB.has(c.n)],
  ['factorial', 'Factorial', '❗', 'Equal to k! for some k.', null, (c) => FACT.has(c.n)],
  ['catalan', 'Catalan', '🌳', 'A Catalan number.', null, (c) => CATALAN.has(c.n)],
  ['taxicab', 'Taxicab', '🚕', 'A sum of two cubes in two different ways (like 1729).', null, (c) => TAXICAB.has(c.n)],
  ['automorphic', 'Automorphic', '🪞', 'Its square ends in itself.', null, (c) => c.n >= 5 && (c.n * c.n) % 10 ** c.len === c.n],
  ['narcissist', 'Narcissist', '🌼', 'Equals the sum of its digits each raised to the digit count.', null, (c) => c.n >= 10 && c.d.reduce((a, x) => a + x ** c.len, 0) === c.n],
  ['kaprekar', 'Kaprekar', '✂️', 'Split its square into two parts and they add back to it.', null, (c) => c.n >= 1 && kaprekar(c.n)],
  ['harshad', 'Harshad', '🙏', 'Divisible by its own digit sum.', null, (c) => c.n > 0 && c.n % c.dsum === 0],

  ['bookends', 'Mirror Bookends', '📖', 'First and last digits match.', 'mirror', (c) => c.len >= 2 && c.d[0] === c.d[c.len - 1]],
  ['palindrome', 'Palindrome', '🪩', 'Reads the same forwards and backwards.', 'mirror', (c) => c.pal],
  ['copypaste', 'Copy Paste', '📋', 'The first half repeated (like 123123).', 'copy', (c) => c.len >= 4 && c.len % 2 === 0 && c.s.slice(0, c.len / 2) === c.s.slice(c.len / 2)],
  ['zigzag', 'Zigzag', '〰️', 'Two digits alternating (like 121212).', 'copy', (c) => c.len >= 4 && c.d[0] !== c.d[1] && c.d.every((x, i) => i < 2 || x === c.d[i - 2])],

  ['double', 'Doubles', '👟', 'Two equal digits side by side.', 'run', (c) => c.maxRun >= 2],
  ['triple', 'Triple', '🥉', 'Three equal digits in a row.', 'run', (c) => c.maxRun >= 3],
  ['quad', 'Quad', '🍀', 'Four equal digits in a row.', 'run', (c) => c.maxRun >= 4],
  ['five_run', 'Pentakill', '⚔️', 'Five equal digits in a row.', 'run', (c) => c.maxRun >= 5],
  ['repdigit', 'Repdigit', '🔂', 'Every digit is the same.', 'run', (c) => c.len >= 2 && c.maxRun === c.len],

  ['p_high', 'No Repeats', '🃏', 'Six digits, all different.', 'poker', (c) => c.len === 6 && c.hand === '111111'],
  ['p_pair', 'One Pair', '🂡', 'Poker hand: exactly one pair of digits.', 'poker', (c) => c.len === 6 && c.hand === '21111'],
  ['p_2pair', 'Two Pair', '🂢', 'Poker hand: two pairs of digits.', 'poker', (c) => c.len === 6 && c.hand === '2211'],
  ['p_3pair', 'Three Pair', '🂣', 'Poker hand: three pairs of digits.', 'poker', (c) => c.len === 6 && c.hand === '222'],
  ['p_trips', 'Three of a Kind', '🂤', 'Poker hand: three of one digit.', 'poker', (c) => c.len === 6 && c.hand === '3111'],
  ['p_full', 'Full House', '🏠', 'Poker hand: three of one digit and two of another.', 'poker', (c) => c.len === 6 && c.hand === '321'],
  ['p_2trips', 'Two Triples', '🏘️', 'Poker hand: three of one digit and three of another.', 'poker', (c) => c.len === 6 && c.hand === '33'],
  ['p_quads', 'Four of a Kind', '🂥', 'Poker hand: four of one digit.', 'poker', (c) => c.len === 6 && c.hand === '411'],
  ['p_mansion', 'Full Mansion', '🏰', 'Poker hand: four of one digit and two of another.', 'poker', (c) => c.len === 6 && c.hand === '42'],
  ['p_five', 'Five of a Kind', '🖐', 'Poker hand: five of one digit.', 'poker', (c) => c.len === 6 && c.hand === '51'],
  ['p_six', 'Six of a Kind', '👑', 'Poker hand: all six digits the same.', 'poker', (c) => c.len === 6 && c.hand === '6'],
  ['p_straight', 'Straight', '📏', 'Six consecutive digits, in any order.', 'poker', (c) => c.len === 6 && STRAIGHTS.has([...c.s].sort().join(''))],

  ['climber', 'Climber', '🧗', 'Digits strictly increase.', 'stairs', (c) => monotone(c, 1)],
  ['landslide', 'Landslide', '⛰️', 'Digits strictly decrease.', 'stairs', (c) => monotone(c, -1)],
  ['staircase', 'Staircase', '🪜', 'Digits go up by exactly 1 each step.', 'stairs', (c) => steps(c, 1)],
  ['countdown', 'Countdown', '🚀', 'Digits go down by exactly 1 each step.', 'stairs', (c) => steps(c, -1)],
  ['password', 'Password', '🔑', 'Exactly 123456. Please change it.', 'stairs', (c) => c.n === 123456],

  ['alleven', 'All Even Digits', '2️⃣', 'Every digit is even.', 'digitset', (c) => digitsIn(c, (x) => x % 2 === 0)],
  ['allodd', 'All Odd Digits', '1️⃣', 'Every digit is odd.', 'digitset', (c) => digitsIn(c, (x) => x % 2 === 1)],
  ['binaryish', 'Looks Binary', '🤖', 'Only uses the digits 0 and 1.', 'digitset', (c) => digitsIn(c, (x) => x <= 1)],
  ['highroller', 'High Roller', '🎰', 'Every digit is 5 or more.', 'digitset2', (c) => digitsIn(c, (x) => x >= 5)],
  ['lowball', 'Lowball', '🪫', 'Every digit is 4 or less.', 'digitset2', (c) => digitsIn(c, (x) => x <= 4)],
  ['hollow3', 'Hollow', '🫥', 'At least three 0 digits.', 'zeros', (c) => c.cnt[0] >= 3],
  ['hollow4', 'Mostly Empty', '🫙', 'At least four 0 digits.', 'zeros', (c) => c.cnt[0] >= 4],
  ['hollow5', 'Void Walker', '🌌', 'At least five 0 digits.', 'zeros', (c) => c.cnt[0] >= 5],

  ['lucky_sum', 'Lucky Sum', '🍀', 'Digits add up to exactly 7.', null, (c) => c.dsum === 7],
  ['heavy', 'Heavyweight', '🏋️', 'Digits add up to 45 or more.', 'dsum', (c) => c.dsum >= 45],
  ['maxsum', 'Maxed Out', '📈', 'Digits add up to 54 — the most possible.', 'dsum', (c) => c.dsum === 54],
  ['feather', 'Featherweight', '🪶', 'Digits add up to 3 or less.', 'dsum', (c) => c.n > 0 && c.dsum <= 3],
  ['ticket', 'Lucky Ticket', '🎟️', 'First three digits sum to the same as the last three.', null, (c) => c.len === 6 && c.d[0] + c.d[1] + c.d[2] === c.d[3] + c.d[4] + c.d[5]],

  ['seven1', 'Lucky Seven', '7️⃣', 'Contains a 7.', 'seven', (c) => has(c, '7')],
  ['seven2', 'Double Seven', '🎲', 'Contains 77.', 'seven', (c) => has(c, '77')],
  ['seven3', 'Triple Seven', '🎰', 'Contains 777.', 'seven', (c) => has(c, '777')],
  ['seven4', 'Quad Seven', '🌈', 'Contains 7777.', 'seven', (c) => has(c, '7777')],
  ['seven6', 'Heaven Sevens', '😇', 'Exactly 777777.', 'seven', (c) => c.n === 777777],

  ['nice', 'Nice', '😏', 'Contains 69.', 'nice', (c) => has(c, '69')],
  ['nicenice', 'Nice Nice', '😎', 'Contains 6969.', 'nice', (c) => has(c, '6969')],
  ['exactnice', 'Exact Nice', '🫡', 'Exactly 69 (or 696969).', 'nice', (c) => c.n === 69 || c.n === 696969],
  ['blaze', 'Blaze It', '🌿', 'Contains 420.', 'blaze', (c) => has(c, '420')],
  ['exactblaze', 'Exact Blaze', '🔥', 'Exactly 420.', 'blaze', (c) => c.n === 420],
  ['peakmeme', 'Peak Meme', '🗿', 'Contains 69420 or 42069.', 'peak', (c) => has(c, '69420') || has(c, '42069')],
  ['leet', 'Leet', '👾', 'Contains 1337.', 'leet', (c) => has(c, '1337')],
  ['exactleet', 'Exact Leet', '🕶️', 'Exactly 1337.', 'leet', (c) => c.n === 1337],
  ['answer', 'Life, the Universe', '🌍', 'Contains 42.', 'answer', (c) => has(c, '42')],
  ['exactanswer', 'The Answer', '🐬', 'Exactly 42.', 'answer', (c) => c.n === 42],
  ['beast', 'Number of the Beast', '😈', 'Contains 666.', 'beast', (c) => has(c, '666')],
  ['exactbeast', 'The Beast Itself', '👹', 'Exactly 666.', 'beast', (c) => c.n === 666],
  ['sixseven', 'Six Seven', '🤷', 'Contains 67.', 'sixseven', (c) => has(c, '67')],
  ['exactsixseven', 'Exactly Six Seven', '🙆', 'Exactly 67.', 'sixseven', (c) => c.n === 67],
  ['bond', 'Licence to Kill', '🍸', 'Contains 007.', null, (c) => has(c, '007')],
  ['emergency', 'Emergency', '🚨', 'Contains 911.', null, (c) => has(c, '911')],
  ['notfound', 'Not Found', '🚫', 'Contains 404.', null, (c) => has(c, '404')],
  ['calculator', 'Calculator Humour', '📟', 'Contains 80085 or 58008.', null, (c) => has(c, '80085') || has(c, '58008')],
  ['pi1', 'Slice of Pi', '🥧', 'Starts with 314.', 'pi', (c) => starts(c, '314')],
  ['pi2', 'Pi Lover', '🥮', 'Starts with 31415.', 'pi', (c) => starts(c, '31415')],
  ['pi3', 'Exactly Pi', '🍰', 'Exactly 314159.', 'pi', (c) => c.n === 314159],
  ['e1', "Euler's Number", '📉', 'Starts with 2718.', 'e', (c) => starts(c, '2718')],
  ['e2', 'Exactly e', '🧪', 'Exactly 271828.', 'e', (c) => c.n === 271828],
  ['phi1', 'Golden', '🌻', 'Starts with 1618.', 'phi', (c) => starts(c, '1618')],
  ['phi2', 'Golden Ratio', '🏆', 'Exactly 161803.', 'phi', (c) => c.n === 161803],
  ['cyclic', 'Cyclic', '♻️', 'Exactly 142857 (the digits of 1/7).', null, (c) => c.n === 142857],
  ['year', 'Time Traveller', '⏳', 'A year from 1900 to 2099.', null, (c) => c.n >= 1900 && c.n <= 2099],
  ['calendar', 'Calendar Day', '📅', 'Reads as a real date in DDMMYY.', null, validDate],
  ['clock', 'Clockwork', '⏰', 'Reads as a real time in HHMMSS.', null, validTime],

  ['binpal', 'Binary Mirror', '💻', 'A palindrome in binary.', null, (c) => { if (c.n < 1) return false; const b = c.n.toString(2); return b === [...b].reverse().join(''); }],
  ['hexletters', 'Hex Letters', '🔤', 'In hexadecimal it is all letters (A–F).', 'hex', (c) => c.n >= 10 && /^[a-f]+$/.test(c.n.toString(16))],
  ['hexword', 'Hexspeak', '🥩', 'Spells a word in hex (like 0xBEEF or 0xCAFE).', 'hex', (c) => HEX_WORDS.has(c.n)],
];

export const BADGES = RAW.map(([id, name, icon, desc, family, test]) => ({ id, name, icon, desc, family, test, count: 0, ep: 0, rarity: 'common' }));
export const BADGE_BY_ID = Object.fromEntries(BADGES.map((b) => [b.id, b]));

export function badgeEp(count) {
  return Math.max(1, Math.round(10 * Math.pow(TOTAL / Math.max(count, 1), 0.3)));
}

export const BADGE_RARITIES = [
  ['mythic', 1e-5], ['anomaly', 1e-4], ['epic', 1e-3], ['rare', 1e-2], ['uncommon', 1e-1], ['common', Infinity],
];

export function badgeRarity(count) {
  const p = count / TOTAL;
  return BADGE_RARITIES.find(([, lim]) => p < lim)[0];
}

export function applyCounts(counts) {
  for (const b of BADGES) {
    b.count = counts[b.id] ?? 0;
    b.ep = badgeEp(b.count);
    b.rarity = badgeRarity(b.count);
  }
}

export function matchIds(n) {
  const c = context(n);
  const out = [];
  for (const b of BADGES) if (b.test(c)) out.push(b);
  return out;
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
