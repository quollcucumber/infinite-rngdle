import { BADGES, MAX, TOTAL, analyze, applyCounts } from './badges.js';
import { BADGE_COUNTS, EP_HISTOGRAM } from './calibration.js';

applyCounts(BADGE_COUNTS);

const TIERS = [
  { id: 'trash', name: 'Trash', rule: 'Bottom 1%', icon: '🗑️' },
  { id: 'common', name: 'Common', rule: 'Bottom 50%', icon: '⬜' },
  { id: 'uncommon', name: 'Uncommon', rule: 'Top 50%', icon: '🟩' },
  { id: 'rare', name: 'Rare', rule: 'Top 25%', icon: '🟦' },
  { id: 'epic', name: 'Epic', rule: 'Top 10%', icon: '🟪' },
  { id: 'anomaly', name: 'Anomaly', rule: 'Top 5%', icon: '🟧' },
  { id: 'mythic', name: 'Mythic', rule: 'Top 1%', icon: '🟨' },
];
const TIER_BY_ID = Object.fromEntries(TIERS.map((t) => [t.id, t]));
const TIER_RANK = Object.fromEntries(TIERS.map((t, i) => [t.id, i]));
const RARITY_NAME = { common: 'Common', uncommon: 'Uncommon', rare: 'Rare', epic: 'Epic', anomaly: 'Anomaly', mythic: 'Mythic' };
const RARITY_RANK = { common: 0, uncommon: 1, rare: 2, epic: 3, anomaly: 4, mythic: 5 };

// atLeast[i] = how many numbers score >= EP_HISTOGRAM[i][0]
const atLeast = new Array(EP_HISTOGRAM.length);
for (let i = EP_HISTOGRAM.length - 1, acc = 0; i >= 0; i--) { acc += EP_HISTOGRAM[i][1]; atLeast[i] = acc; }

function standing(ep) {
  let lo = 0, hi = EP_HISTOGRAM.length - 1;
  while (lo < hi) { const mid = (lo + hi) >> 1; if (EP_HISTOGRAM[mid][0] < ep) lo = mid + 1; else hi = mid; }
  const top = atLeast[lo] / TOTAL;
  const bottom = 1 - (lo + 1 < atLeast.length ? atLeast[lo + 1] : 0) / TOTAL;
  let tier = 'common';
  if (top <= 0.01) tier = 'mythic';
  else if (top <= 0.05) tier = 'anomaly';
  else if (top <= 0.1) tier = 'epic';
  else if (top <= 0.25) tier = 'rare';
  else if (top <= 0.5) tier = 'uncommon';
  else if (bottom <= 0.01) tier = 'trash';
  return { tier, top, bottom };
}

function scoreRoll(n) {
  const a = analyze(n);
  return { ...a, ...standing(a.total) };
}

function randomRoll() {
  const buf = new Uint32Array(1);
  const limit = Math.floor(2 ** 32 / TOTAL) * TOTAL;
  do crypto.getRandomValues(buf); while (buf[0] >= limit);
  return buf[0] % TOTAL;
}

const STORE_KEY = 'infinite-rngdle-v1';
const fresh = () => ({ rolls: 0, lifetimeEp: 0, found: {}, tiers: {}, history: [], best: [], fast: false });
let state = fresh();
try { state = { ...fresh(), ...JSON.parse(localStorage.getItem(STORE_KEY) || '{}') }; } catch { /* corrupt storage: start fresh */ }
const save = () => localStorage.setItem(STORE_KEY, JSON.stringify(state));

const $ = (id) => document.getElementById(id);
const fmt = (x) => x.toLocaleString('en-US');
const esc = (s) => s.replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);

function pct(f) {
  const p = f * 100;
  if (p >= 10) return `${Math.round(p)}%`;
  if (p >= 1) return `${p.toFixed(1)}%`;
  if (p >= 0.01) return `${p.toFixed(2)}%`;
  return `${Number(p.toPrecision(2))}%`;
}
const odds = (count) => (count >= TOTAL / 2 ? `${pct(count / TOTAL)} of rolls` : `1 in ${fmt(Math.round(TOTAL / count))}`);

let current = null;
let animating = false;

function renderStats() {
  const found = BADGES.filter((b) => state.found[b.id]).length;
  const best = state.best[0];
  $('stats').innerHTML = [
    ['Rolls', fmt(state.rolls)],
    ['Lifetime EP', fmt(state.lifetimeEp)],
    ['Best', best ? `${fmt(best.n)} · ${fmt(best.ep)} EP` : '—'],
    ['Badges', `${found}/${BADGES.length}`],
  ].map(([k, v]) => `<span class="stat">${k} <b>${v}</b></span>`).join('');
}

function buildTiles(n, locked) {
  const digits = n === MAX ? String(n) : String(n).padStart(6, '0');
  const lead = digits.length - String(n).length;
  $('tiles').innerHTML = [...digits].map((d, i) => `<div class="tile ${locked ? 'lock' : 'spin'} ${i < lead ? 'lead' : ''}">${locked ? d : Math.floor(Math.random() * 10)}</div>`).join('');
  return { digits, lead };
}

function animateTiles(n, tierClass) {
  const tiles = $('tiles');
  tiles.className = `tiles ${tierClass}`;
  const { digits } = buildTiles(n, false);
  const els = [...tiles.children];
  const step = state.fast ? 25 : 110;
  const start = state.fast ? 60 : 280;
  return new Promise((resolve) => {
    const spin = setInterval(() => els.forEach((el) => { if (el.classList.contains('spin')) el.textContent = Math.floor(Math.random() * 10); }), 45);
    els.forEach((el, i) => setTimeout(() => {
      el.classList.replace('spin', 'lock');
      el.textContent = digits[i];
      if (i === els.length - 1) { clearInterval(spin); resolve(); }
    }, start + i * step));
  });
}

function countUp(el, to, ms) {
  if (ms <= 0) { el.textContent = fmt(to); return; }
  const t0 = performance.now();
  const tick = (t) => {
    const k = Math.min(1, (t - t0) / ms);
    el.textContent = fmt(Math.round(to * (1 - (1 - k) ** 3)));
    if (k < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function renderVerdict(r, label, animate) {
  const tier = TIER_BY_ID[r.tier];
  $('verdict').className = `verdict r-${r.tier}`;
  $('tier').className = `tier ${r.tier}`;
  $('tier').textContent = tier.name;
  const rank = r.tier === 'trash' ? `Bottom ${pct(r.bottom)}` : `Top ${pct(r.top)}`;
  $('sub').textContent = `${label} · ${rank} of all possible rolls`;
  countUp($('ep'), r.total, animate ? (state.fast ? 250 : 700) : 0);
}

function renderBadges(r, newIds, animate) {
  $('breakdownTitle').textContent = `Badges for ${fmt(r.n)} (${r.badges.length})`;
  if (!r.badges.length) { $('badges').innerHTML = '<li class="empty">No badges. Truly a nothing number.</li>'; return; }
  const delay = state.fast ? 0.02 : 0.06;
  $('badges').innerHTML = r.badges.map(({ badge: b, counted }, i) => `
    <li class="badge r-${b.rarity} ${counted ? '' : 'dim'}" style="animation-delay:${animate ? i * delay : 0}s" title="${counted ? '' : 'A better badge from the same family already scored'}">
      <div class="ico">${b.icon}</div>
      <div><div class="name">${esc(b.name)}${newIds?.has(b.id) ? '<span class="new">NEW</span>' : ''}</div><div class="desc">${esc(b.desc)} <span class="muted">· ${odds(b.count)}</span></div></div>
      <div class="pts"><div class="rar">${RARITY_NAME[b.rarity]}</div><b>+${fmt(b.ep)}</b> EP</div>
    </li>`).join('');
}

function record(r) {
  const newIds = new Set();
  for (const { badge } of r.badges) {
    if (!state.found[badge.id]) newIds.add(badge.id);
    state.found[badge.id] = (state.found[badge.id] || 0) + 1;
  }
  state.rolls++;
  state.lifetimeEp += r.total;
  state.tiers[r.tier] = (state.tiers[r.tier] || 0) + 1;
  const entry = { i: state.rolls, n: r.n, ep: r.total, tier: r.tier };
  state.history.unshift(entry);
  if (state.history.length > 200) state.history.length = 200;
  if (!state.best.some((b) => b.n === r.n)) {
    state.best.push(entry);
    state.best.sort((a, b) => b.ep - a.ep || a.i - b.i);
    if (state.best.length > 25) state.best.length = 25;
  }
  save();
  return newIds;
}

function celebrate(tier) {
  const rank = TIER_RANK[tier];
  if (tier === 'trash') {
    document.body.classList.remove('shake'); void document.body.offsetWidth; document.body.classList.add('shake');
    return;
  }
  if (rank < TIER_RANK.epic) return;
  const colors = { epic: ['#c084fc', '#a78bfa'], anomaly: ['#fb923c', '#f472b6', '#facc15'], mythic: ['#facc15', '#f472b6', '#60a5fa', '#4ade80', '#c084fc'] }[tier];
  const count = { epic: 40, anomaly: 80, mythic: 160 }[tier];
  const fx = $('fx');
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'bit';
    el.style.left = `${Math.random() * 100}vw`;
    el.style.background = colors[i % colors.length];
    el.style.animationDuration = `${1.2 + Math.random() * 1.6}s`;
    el.style.animationDelay = `${Math.random() * 0.4}s`;
    fx.appendChild(el);
    setTimeout(() => el.remove(), 3500);
  }
}

async function doRoll() {
  if (animating) return;
  animating = true;
  $('roll').disabled = true;
  const r = scoreRoll(randomRoll());
  const newIds = record(r);
  $('tier').className = 'tier'; $('verdict').className = 'verdict';
  $('tier').textContent = 'Rolling…'; $('sub').textContent = '\u00a0'; $('ep').textContent = '0';
  await animateTiles(r.n, `r-${r.tier}`);
  showResult(r, `Roll #${fmt(state.rolls)}`, newIds, true);
  celebrate(r.tier);
  animating = false;
  $('roll').disabled = autoTimer !== null;
}

function showResult(r, label, newIds, animate) {
  current = { r, label };
  if (!animate) { $('tiles').className = `tiles r-${r.tier}`; buildTiles(r.n, true); }
  renderVerdict(r, label, animate);
  renderBadges(r, newIds, animate);
  $('share').disabled = false;
  renderStats();
  renderHistory();
  renderBest();
  renderCollection();
}

function rollRow(e) {
  return `<li class="r-${e.tier}" data-n="${e.n}"><span class="idx">#${fmt(e.i)}</span><span class="num">${fmt(e.n)}</span><span class="t">${TIER_BY_ID[e.tier].name}</span><span class="e">${fmt(e.ep)} EP</span></li>`;
}
function renderHistory() {
  const tierLine = TIERS.slice().reverse().map((t) => `<span class="r-${t.id}" style="color:var(--tc)">${t.name} <b>${fmt(state.tiers[t.id] || 0)}</b></span>`).join(' · ');
  $('tab-history').innerHTML = state.history.length
    ? `<p class="muted">${tierLine}</p><ul class="rolls">${state.history.map(rollRow).join('')}</ul>`
    : '<p class="muted">No rolls yet.</p>';
}
function renderBest() {
  $('tab-best').innerHTML = state.best.length ? `<ul class="rolls">${state.best.map(rollRow).join('')}</ul>` : '<p class="muted">No rolls yet.</p>';
}

let revealLocked = false;
function renderCollection() {
  const sorted = BADGES.slice().sort((a, b) => RARITY_RANK[a.rarity] - RARITY_RANK[b.rarity] || b.count - a.count);
  const found = sorted.filter((b) => state.found[b.id]).length;
  $('tab-collection').innerHTML = `
    <div class="coll-head"><span><b>${found}</b> of ${BADGES.length} badges found</span>
      <label class="muted"><input type="checkbox" id="reveal" ${revealLocked ? 'checked' : ''}/> Show locked badges</label></div>
    <div class="grid">${sorted.map((b) => {
      const got = state.found[b.id];
      const show = got || revealLocked;
      return `<div class="cb r-${b.rarity} ${got ? '' : 'locked'}" title="${show ? esc(b.desc) : 'Not found yet'}">
        <div class="top2"><span>${show ? b.icon : '🔒'}</span><span>${show ? esc(b.name) : '???'}</span></div>
        <div class="odds">${RARITY_NAME[b.rarity]} · ${fmt(b.ep)} EP · ${odds(b.count)}</div>
        <div class="odds">${got ? `Found ×${fmt(got)}` : 'Not found yet'}</div></div>`;
    }).join('')}</div>`;
}

function shareText() {
  const { r, label } = current;
  const tier = TIER_BY_ID[r.tier];
  const top = r.badges.filter((x) => x.counted).slice(0, 5).map(({ badge }) => `${badge.icon} ${badge.name}`).join('\n');
  return `Infinite RNGdle ${label}\n🎲 ${fmt(r.n)} — ${tier.icon} ${tier.name} (${r.tier === 'trash' ? 'Bottom' : 'Top'} ${pct(r.tier === 'trash' ? r.bottom : r.top)})\n${fmt(r.total)} EP · ${r.badges.length} badges\n${top}`;
}

let autoTimer = null;
function stopAuto(msg) {
  clearTimeout(autoTimer);
  autoTimer = null;
  $('auto').textContent = 'Start';
  $('roll').disabled = false;
  if (msg) $('autoStatus').textContent = msg;
}
function startAuto() {
  const target = TIER_RANK[$('autoTarget').value];
  let n = 0;
  $('auto').textContent = 'Stop';
  $('roll').disabled = true;
  const step = () => {
    let r, newIds;
    for (let k = 0; k < 5; k++) {
      r = scoreRoll(randomRoll());
      newIds = record(r);
      n++;
      if (TIER_RANK[r.tier] >= target) break;
    }
    showResult(r, `Roll #${fmt(state.rolls)}`, newIds, false);
    if (TIER_RANK[r.tier] >= target) { stopAuto(`Hit ${TIER_BY_ID[r.tier].name} after ${fmt(n)} rolls`); celebrate(r.tier); return; }
    if (n >= 10000) { stopAuto(`Gave up after ${fmt(n)} rolls`); return; }
    $('autoStatus').textContent = `${fmt(n)} rolls…`;
    autoTimer = setTimeout(step, 30);
  };
  autoTimer = setTimeout(step, 0);
}

function init() {
  $('autoTarget').innerHTML = TIERS.slice(2).map((t) => `<option value="${t.id}" ${t.id === 'mythic' ? 'selected' : ''}>${t.name}+</option>`).join('');
  $('tierList').innerHTML = TIERS.map((t) => `<li class="r-${t.id}"><b>${t.icon} ${t.name}</b>${t.rule}</li>`).join('');
  $('fast').checked = state.fast;
  $('fast').addEventListener('change', (e) => { state.fast = e.target.checked; save(); });
  $('roll').addEventListener('click', doRoll);
  $('auto').addEventListener('click', () => (autoTimer ? stopAuto('Stopped') : startAuto()));
  document.addEventListener('keydown', (e) => {
    if ((e.code === 'Space' || e.code === 'Enter') && !['INPUT', 'SELECT', 'BUTTON', 'TEXTAREA'].includes(document.activeElement.tagName) && !autoTimer) {
      e.preventDefault();
      doRoll();
    }
  });
  $('share').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(shareText()); $('share').textContent = 'Copied!'; } catch { $('share').textContent = 'Copy failed'; }
    setTimeout(() => { $('share').textContent = 'Copy result'; }, 1500);
  });
  $('tabs').addEventListener('click', (e) => {
    const tab = e.target.dataset?.tab;
    if (!tab) return;
    for (const b of $('tabs').children) b.classList.toggle('active', b.dataset.tab === tab);
    for (const el of document.querySelectorAll('.tab')) el.classList.toggle('hidden', el.id !== `tab-${tab}`);
  });
  const viewRow = (e) => {
    const li = e.target.closest('li[data-n]');
    if (!li || animating) return;
    showResult(scoreRoll(Number(li.dataset.n)), `${li.querySelector('.idx').textContent.replace('#', 'Roll #')} (replay)`, null, false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  $('tab-history').addEventListener('click', viewRow);
  $('tab-best').addEventListener('click', viewRow);
  $('tab-collection').addEventListener('change', (e) => { if (e.target.id === 'reveal') { revealLocked = e.target.checked; renderCollection(); } });
  $('checkForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const n = Number($('checkInput').value);
    if (!Number.isInteger(n) || n < 0 || n > MAX || animating) return;
    showResult(scoreRoll(n), 'Checked (not counted)', null, false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  $('reset').addEventListener('click', () => {
    if (!confirm('Reset all rolls, badges and stats?')) return;
    stopAuto('');
    state = fresh();
    save();
    location.reload();
  });
  buildTiles(0, false);
  for (const el of $('tiles').children) { el.textContent = '?'; el.classList.remove('lead'); }
  renderStats(); renderHistory(); renderBest(); renderCollection();
}

init();
