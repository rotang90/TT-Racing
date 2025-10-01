
const DATA_URL = 'data.json';

const $ = (sel, el=document) => el.querySelector(sel);
const $$ = (sel, el=document) => Array.from(el.querySelectorAll(sel));

const state = {
  data: null,
  seasonIndex: 0,
  tab: 'standings', // 'standings' | 'schedule' | 'drivers' | 'lifetime'
};

async function init() {
  try {
    const res = await fetch(DATA_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    state.data = normalizeData(data);
    // Use activeSeasonIndex if valid
    if (Number.isInteger(state.data.activeSeasonIndex) && state.data.activeSeasonIndex >= 0 && state.data.activeSeasonIndex < state.data.seasons.length) {
      state.seasonIndex = state.data.activeSeasonIndex;
    }
    renderAll();
  } catch (err) {
    const container = $('.container');
    container.innerHTML = `
      <div class="card err">
        <div style="font-weight:700; margin-bottom:6px;">Could not load <code>${DATA_URL}</code></div>
        <div class="small">Error: ${err.message}</div>
        <div class="small" style="margin-top:8px">Make sure <code>data.json</code> exists in the same folder as <code>index.html</code> on GitHub, then refresh.</div>
      </div>
    `;
    console.error(err);
  }
}

function normalizeData(data) {
  // Ensure consistent structure
  data.seasons = Array.isArray(data.seasons) ? data.seasons : [];
  for (const s of data.seasons) {
    s.drivers = Array.isArray(s.drivers) ? s.drivers : [];
    s.schedule = Array.isArray(s.schedule) ? s.schedule : [];
    s.results = Array.isArray(s.results) ? s.results : [];
    s.points = s.points || { quali:[], race:[] };
  }
  return data;
}

function renderAll() {
  renderHeader();
  renderTabs();
  renderBody();
}

function renderHeader() {
  const container = $('.container');
  container.innerHTML = `
    <div class="header">
      <h1>TT Racing League <span class="badge">Read‑Only Viewer v15</span></h1>
      <div class="controls">
        ${renderSeasonSelect()}
      </div>
    </div>
    <div class="tabs">
      ${renderTabButton('standings', 'Standings')}
      ${renderTabButton('schedule', 'Schedule')}
      ${renderTabButton('drivers', 'Drivers')}
      ${renderTabButton('lifetime', 'Lifetime Stats')}
    </div>
    <div id="view"></div>
    <div class="footer small">Data source: <code>${DATA_URL}</code>. No edits are possible in this build.</div>
  `;

  // Wire season select
  $('#seasonSelect').addEventListener('change', (e) => {
    state.seasonIndex = parseInt(e.target.value, 10);
    renderAll();
  });
}

function renderSeasonSelect() {
  const seasons = state.data.seasons;
  const options = seasons.map((s, i) => {
    const label = seasonLabel(s, i);
    return `<option value="${i}" ${i===state.seasonIndex?'selected':''}>${escapeHtml(label)}</option>`;
  }).join('');
  return `<select id="seasonSelect" title="Season">${options}</select>`;
}

function seasonLabel(season, idx) {
  const n = season.seasonNo != null ? `S${season.seasonNo}` : `S${idx+1}`;
  return `${n} — ${season.name || 'Untitled Season'}`;
}

function renderTabButton(key, label) {
  const active = state.tab === key ? 'active' : '';
  return `<button class="tab-btn ${active}" data-tab="${key}" onclick="switchTab('${key}')">${label}</button>`;
}

function switchTab(key) {
  state.tab = key;
  renderBody();
}

function renderBody() {
  const view = $('#view');
  if (state.tab === 'standings') {
    view.innerHTML = renderStandingsCard();
  } else if (state.tab === 'schedule') {
    view.innerHTML = renderScheduleCard();
  } else if (state.tab === 'drivers') {
    view.innerHTML = renderDriversCard();
  } else if (state.tab === 'lifetime') {
    view.innerHTML = renderLifetimeCard();
  }
}

function renderStandingsCard() {
  const season = state.data.seasons[state.seasonIndex];
  const calc = computeSeason(season);
  const rows = calc.ranked.map((r, i) => {
    const swatch = `<span class="swatch" style="background:${r.driver.color||'#666'}"></span>`;
    return `<tr>
      <td>${i+1}</td>
      <td>${swatch}${escapeHtml(r.driver.name||'')}</td>
      <td>${r.total}</td>
      <td>${r.racePts}</td>
      <td>${r.qualiPts}</td>
      <td>${r.adj}</td>
      <td>${r.countedRounds}</td>
    </tr>`;
  }).join('');

  const info = `<div class="kv small">
    <div><span>Season:</span></div><div>${escapeHtml(seasonLabel(season, state.seasonIndex))}</div>
    <div><span>Rounds counted:</span></div><div>${calc.roundsCounted} / ${season.schedule.length}</div>
    <div><span>Rule:</span></div><div>DNF or DNP ⇒ 0 points for that session.</div>
  </div>`;

  return `<div class="card">
    ${info}
    <table class="table" style="margin-top:10px">
      <thead><tr>
        <th>Pos</th><th>Driver</th><th>Total</th><th>Race</th><th>Quali</th><th>Adj</th><th>Rounds</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

function renderScheduleCard() {
  const season = state.data.seasons[state.seasonIndex];
  const rows = season.schedule.map((r) => {
    const included = (r.includeInStats === false) ?
      '<span class="badge badge-warn">Excluded</span>' :
      '<span class="badge badge-ok">Counted</span>';
    return `<tr>
      <td>${r.round ?? ''}</td>
      <td>${escapeHtml(r.track || '')}</td>
      <td>${fmtDate(r.practiceDate)}</td>
      <td>${fmtDate(r.raceDate)}</td>
      <td>${included}</td>
    </tr>`;
  }).join('');

  return `<div class="card">
    <table class="table">
      <thead><tr>
        <th>Round</th><th>Track</th><th>Practice</th><th>Race</th><th>In Stats</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

function renderDriversCard() {
  const season = state.data.seasons[state.seasonIndex];
  const rows = season.drivers.map(d => {
    const swatch = `<span class="swatch" style="background:${d.color||'#666'}"></span>`;
    const active = d.active ? '<span class="badge badge-ok">Active</span>' : '<span class="badge">Inactive</span>';
    return `<tr>
      <td>${swatch}${escapeHtml(d.name||'')}</td>
      <td>${escapeHtml(String(d.number||''))}</td>
      <td>${active}</td>
      <td><code>${escapeHtml(d.id||'')}</code></td>
    </tr>`;
  }).join('');

  return `<div class="card">
    <table class="table">
      <thead><tr>
        <th>Driver</th><th>No.</th><th>Status</th><th>ID</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

function renderLifetimeCard() {
  // Build final position per season and aggregate
  const seasons = state.data.seasons;
  // Map driver name -> { name, seasons: [{label, pos or '-'}] }
  const driverMap = new Map();

  seasons.forEach((s, idx) => {
    const calc = computeSeason(s);
    calc.ranked.forEach((row, i) => {
      const name = row.driver.name || '';
      if (!driverMap.has(name)) {
        driverMap.set(name, { name, records: [] });
      }
    });
  });

  // Ensure we include drivers who exist but maybe ranked later
  seasons.forEach((s, idx) => {
    s.drivers.forEach(d => {
      if (!driverMap.has(d.name||'')) driverMap.set(d.name||'', { name: d.name||'', records: [] });
    });
  });

  const labels = seasons.map((s, i) => escapeHtml(seasonLabel(s, i)));
  // Fill records
  seasons.forEach((s, idx) => {
    const calc = computeSeason(s);
    const posByName = new Map(calc.ranked.map((row, i) => [row.driver.name || '', i+1]));
    for (const entry of driverMap.values()) {
      const p = posByName.get(entry.name) || '-';
      entry.records[idx] = p;
    }
  });

  const drivers = Array.from(driverMap.values()).sort((a,b) => a.name.localeCompare(b.name));
  const header = `<thead><tr><th>Driver</th>${labels.map(l=>`<th>${l}</th>`).join('')}</tr></thead>`;
  const body = `<tbody>
    ${drivers.map(d => `<tr><td>${escapeHtml(d.name)}</td>${
      d.records.map(p => `<td>${p ?? '-'}</td>`).join('')
    }</tr>`).join('')}
  </tbody>`;

  return `<div class="card">
    <div class="small">Final season positions by season (1 = champion). Only rounds marked as "Counted" are included in each season's standings.</div>
    <table class="table" style="margin-top:10px">${header}${body}</table>
  </div>`;
}


function renderTabs() {
  // refresh tab button active state inside .tabs
  const tabsEl = $('.tabs');
  if (!tabsEl) return;
  tabsEl.innerHTML = [
    renderTabButton('standings','Standings'),
    renderTabButton('schedule','Schedule'),
    renderTabButton('drivers','Drivers'),
    renderTabButton('lifetime','Lifetime Stats')
  ].join('');
}

// ---------- Calculation Engine ----------

function computeSeason(season) {
  const pointsQ = Array.isArray(season.points?.quali) ? season.points.quali : [];
  const pointsR = Array.isArray(season.points?.race) ? season.points.race : [];

  const driverIndex = new Map((season.drivers||[]).map(d => [d.id, d]));
  const scheduleIndex = new Map((season.schedule||[]).map(r => [r.id, r]));
  const totals = new Map(); // id -> { driver, qualiPts, racePts, adj, total, countedRounds }

  function ensure(id) {
    if (!totals.has(id)) {
      totals.set(id, { driver: driverIndex.get(id) || { id, name:'Unknown' }, qualiPts:0, racePts:0, adj:0, countedRounds:0 });
    }
    return totals.get(id);
  }

  let roundsCounted = 0;

  for (const r of (season.results||[])) {
    const sched = scheduleIndex.get(r.raceId);
    const include = (sched && sched.includeInStats === false) ? false : true;
    if (!include) continue;
    roundsCounted++;

    const byDriver = r.byDriver || {};
    // Give zero points to drivers who participated but have invalid numbers implicitly;
    // Only count a "round" for drivers who appear in byDriver.
    for (const [id, entry] of Object.entries(byDriver)) {
      const rec = ensure(id);
      const { qualiPos, racePos, qDNP, dnf } = entry || {};

      // Qualifying points
      let qPts = 0;
      const qPos = parsePos(qualiPos);
      if (qDNP === true) {
        qPts = 0;
      } else if (Number.isInteger(qPos) && qPos >= 1) {
        qPts = pointsQ[qPos-1] ?? 0;
      }
      rec.qualiPts += (Number.isFinite(qPts) ? qPts : 0);

      // Race points
      let rPts = 0;
      const rPos = parsePos(racePos);
      if (dnf === true) {
        rPts = 0;
      } else if (Number.isInteger(rPos) && rPos >= 1) {
        rPts = pointsR[rPos-1] ?? 0;
      }
      rec.racePts += (Number.isFinite(rPts) ? rPts : 0);

      rec.countedRounds += 1;
    }

    // Adjustments (bonus/penalty points)
    const adj = r.adjustments || {};
    for (const [id, adjObj] of Object.entries(adj)) {
      const delta = Number(adjObj?.points) || 0;
      const rec = ensure(id);
      rec.adj += delta;
    }
  }

  // Ensure all listed drivers are in totals even if zero
  for (const d of (season.drivers||[])) ensure(d.id);

  const rows = Array.from(totals.values()).map(rec => {
    const total = (rec.qualiPts || 0) + (rec.racePts || 0) + (rec.adj || 0);
    return {
      driver: rec.driver,
      qualiPts: rec.qualiPts|0,
      racePts: rec.racePts|0,
      adj: rec.adj|0,
      total: total|0,
      countedRounds: rec.countedRounds|0,
    };
  });

  // Sort: total desc, then racePts desc, then qualiPts desc, then name
  rows.sort((a,b) => {
    if (b.total !== a.total) return b.total - a.total;
    if (b.racePts !== a.racePts) return b.racePts - a.racePts;
    if (b.qualiPts !== a.qualiPts) return b.qualiPts - a.qualiPts;
    return (a.driver.name||'').localeCompare(b.driver.name||'');
  });

  return { ranked: rows, roundsCounted };
}

function parsePos(val) {
  if (val === null || val === undefined) return null;
  // Some inputs are empty strings
  if (String(val).trim() === '') return null;
  const n = Number(val);
  if (!Number.isFinite(n)) return null;
  return Math.round(n);
}

// ---------- Utils ----------

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

function fmtDate(d) {
  if (!d) return '';
  const dt = new Date(d);
  if (String(dt) === 'Invalid Date') return '';
  return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
}

// Kickoff
init();
