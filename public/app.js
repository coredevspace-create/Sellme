// Sellme : logique du jeu côté navigateur.

const $ = (id) => document.getElementById(id);
const SKILL_LABELS = {
  decouverte: 'Découverte',
  ecoute: 'Écoute',
  argumentation: 'Argumentation',
  objections: 'Objections',
  closing: 'Closing',
};

let scenarios = [];
let current = null; // scénario en cours
let game = null; // état de la partie

/* ---------- Progression (stockée dans le navigateur) ---------- */
const STORE_KEY = 'sellme-progress-v1';
function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY)) || {};
  } catch {
    return {};
  }
}
function saveProgress(id, stars, score) {
  const p = loadProgress();
  const prev = p[id] || { stars: 0, best: 0 };
  p[id] = { stars: Math.max(prev.stars, stars), best: Math.max(prev.best, score) };
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(p));
  } catch {
    /* stockage indisponible : la progression ne sera pas gardée */
  }
}
function isUnlocked(index, progress) {
  if (index === 0) return true;
  return (progress[scenarios[index - 1].id]?.stars || 0) >= 1;
}

/* ---------- Navigation ---------- */
function show(screen) {
  for (const s of document.querySelectorAll('.screen')) s.hidden = s.id !== screen;
  window.scrollTo({ top: 0 });
  if (screen === 'home') renderHome();
}
document.addEventListener('click', (e) => {
  const go = e.target.closest('[data-go]');
  if (go) show(go.dataset.go);
});

function toast(message) {
  const t = $('toast');
  t.textContent = message;
  t.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => (t.hidden = true), 5000);
}

async function api(path, body) {
  const res = await fetch(path, {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`);
  return data;
}

const starsHTML = (n, total = 3) =>
  '★'.repeat(n) + `<span class="off">${'★'.repeat(total - n)}</span>`;

/* ---------- Accueil ---------- */
function renderHome() {
  const progress = loadProgress();
  const total = Object.values(progress).reduce((sum, p) => sum + p.stars, 0);
  $('totalStars').innerHTML = `<span class="stars">★</span> ${total} / ${scenarios.length * 3}`;

  const list = $('levels');
  list.innerHTML = '';
  scenarios.forEach((s, i) => {
    const unlocked = isUnlocked(i, progress);
    const p = progress[s.id];
    const card = document.createElement('button');
    card.className = 'level';
    card.disabled = !unlocked;
    card.innerHTML = `
      ${unlocked ? '' : '<span class="lock">🔒</span>'}
      <div class="avatar">${s.prospect.avatar}</div>
      <p class="eyebrow">Mission ${s.level}</p>
      <h3></h3>
      <p class="muted"></p>
      <div class="meta">
        <span class="tag ${s.difficulty}">${s.difficulty}</span>
        <span class="stars">${starsHTML(p?.stars || 0)}</span>
      </div>`;
    card.querySelector('h3').textContent = s.title;
    card.querySelector('.muted').textContent = unlocked
      ? `${s.prospect.name} · ${s.skillFocus}`
      : 'Gagne au moins 1 étoile à la mission précédente';
    card.addEventListener('click', () => openBriefing(s));
    list.append(card);
  });
}

/* ---------- Briefing ---------- */
function openBriefing(s) {
  current = s;
  $('bAvatar').textContent = s.prospect.avatar;
  $('bLevel').textContent = `Mission ${s.level} · ${s.difficulty}`;
  $('bName').textContent = s.prospect.name;
  $('bRole').textContent = `${s.prospect.role}, ${s.prospect.company}`;
  $('bMood').textContent = s.prospect.publicMood;
  $('bMission').textContent = s.mission;
  $('bObjectives').innerHTML = '';
  for (const text of [
    `Découvre ses ${s.painCount} besoins cachés`,
    `Fais monter sa confiance au-dessus de ${s.winTrust}`,
    `Obtiens un engagement en ${s.maxTurns} échanges maximum`,
  ]) {
    const li = document.createElement('li');
    li.textContent = text;
    $('bObjectives').append(li);
  }
  $('bProduct').textContent = s.product.name;
  $('bPitch').textContent = s.product.pitch;
  $('bFeatures').innerHTML = '';
  for (const f of s.product.features) {
    const li = document.createElement('li');
    li.textContent = f;
    $('bFeatures').append(li);
  }
  $('bPrice').textContent = `💶 ${s.product.price}`;
  show('briefing');
}

/* ---------- Partie ---------- */
function startGame() {
  const s = current;
  game = {
    history: [{ role: 'prospect', content: s.opening }],
    trust: s.startTrust,
    turn: 0,
    discovered: [],
    coach: $('coachToggle').checked,
    busy: false,
    over: false,
  };
  $('gAvatar').textContent = s.prospect.avatar;
  $('gName').textContent = s.prospect.name;
  $('gRole').textContent = `${s.prospect.role} · ${s.prospect.company}`;
  $('gaugeTarget').style.left = `${s.winTrust}%`;
  $('chat').innerHTML = '';
  addSystem(`Tu vends ${s.product.name} (${s.product.price}).`);
  addMessage('prospect', s.opening);
  renderPains();
  updateGauge(0);
  show('game');
  $('input').value = '';
  $('input').focus();
}

function addMessage(role, text) {
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  div.textContent = text;
  $('chat').append(div);
  scrollChat();
  return div;
}
function addSystem(text) {
  const div = document.createElement('div');
  div.className = 'msg system';
  div.textContent = text;
  $('chat').append(div);
}
function addCoach(delta, text) {
  const div = document.createElement('div');
  div.className = 'coach';
  const cls = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
  const sign = delta > 0 ? '+' : '';
  div.innerHTML = `<span class="delta ${cls}">${sign}${delta}</span><span></span>`;
  div.lastChild.textContent = text;
  $('chat').append(div);
}
function addDiscovery(pain) {
  const div = document.createElement('div');
  div.className = 'discovery';
  div.textContent = '🔍 Besoin découvert !';
  div.title = pain.text;
  $('chat').append(div);
}
function setTyping(on) {
  $('chat').querySelector('.typing')?.remove();
  if (on) {
    const div = document.createElement('div');
    div.className = 'typing';
    div.innerHTML = '<span></span><span></span><span></span>';
    $('chat').append(div);
    scrollChat();
  }
}
const scrollChat = () => ($('chat').scrollTop = $('chat').scrollHeight);

function trustColor(t) {
  if (t >= current.winTrust) return 'var(--good)';
  if (t >= 45) return 'var(--warn)';
  return 'var(--bad)';
}
function updateGauge(delta) {
  $('trustValue').textContent = game.trust;
  $('gaugeFill').style.width = `${game.trust}%`;
  $('gaugeFill').style.backgroundColor = trustColor(game.trust);
  $('turnsLeft').textContent = current.maxTurns - game.turn;
  $('miniTrust').textContent = `🤝 ${game.trust} · ⏳ ${current.maxTurns - game.turn}`;
  $('miniTrust').style.color = trustColor(game.trust);
  if (delta < 0) {
    $('gauge').classList.remove('shake');
    void $('gauge').offsetWidth;
    $('gauge').classList.add('shake');
  }
}
function renderPains() {
  $('painCount').textContent = `${game.discovered.length}/${current.painCount}`;
  const ul = $('pains');
  ul.innerHTML = '';
  for (const pain of game.discoveredPains || []) {
    const li = document.createElement('li');
    li.className = 'found';
    li.textContent = pain.text;
    ul.append(li);
  }
  for (let i = game.discovered.length; i < current.painCount; i++) {
    const li = document.createElement('li');
    li.className = 'unknown';
    li.textContent = '? ? ?';
    ul.append(li);
  }
}

async function sendReply(text) {
  if (game.busy || game.over) return;
  game.busy = true;
  $('sendBtn').disabled = true;
  game.history.push({ role: 'seller', content: text });
  const sellerBubble = addMessage('seller', text);
  setTyping(true);

  try {
    const r = await api('/api/turn', {
      scenarioId: current.id,
      history: game.history,
      trust: game.trust,
      turn: game.turn,
      discovered: game.discovered,
    });
    setTyping(false);
    if (game.coach && r.coach) addCoach(r.delta, r.coach);
    game.trust = r.trust;
    game.turn = r.turn;
    game.history.push({ role: 'prospect', content: r.reply });
    addMessage('prospect', r.reply);
    for (const pain of r.revealed) {
      game.discovered.push(pain.id);
      (game.discoveredPains ||= []).push(pain);
      addDiscovery(pain);
    }
    renderPains();
    updateGauge(r.delta);
    scrollChat();

    if (r.status !== 'ongoing') endGame(r.status);
  } catch (err) {
    setTyping(false);
    game.history.pop(); // on retire la réplique non traitée
    sellerBubble.remove();
    $('input').value = text;
    toast(err.message);
  } finally {
    game.busy = false;
    $('sendBtn').disabled = false;
    if (!game.over) $('input').focus();
  }
}

function endGame(status) {
  game.over = true;
  $('input').disabled = true;
  $('sendBtn').disabled = true;
  const label = {
    won: '🎉 Vente conclue ! Bravo.',
    lost: '🚪 Le prospect a mis fin au rendez-vous.',
    timeout: '⏰ Le temps est écoulé, le prospect doit partir.',
    quit: '🏳️ Tu as quitté le rendez-vous.',
  }[status];
  addSystem(label);
  scrollChat();
  setTimeout(() => runDebrief(status === 'won' ? 'won' : 'lost'), status === 'quit' ? 300 : 1800);
}

/* ---------- Débrief ---------- */
async function runDebrief(outcome) {
  show('debrief');
  $('debriefLoading').hidden = false;
  $('debriefContent').hidden = true;

  // Un rendez-vous sans aucune réplique du vendeur ne mérite pas d'analyse.
  if (!game.history.some((m) => m.role === 'seller')) {
    show('briefing');
    return;
  }

  try {
    const d = await api('/api/debrief', {
      scenarioId: current.id,
      history: game.history,
      outcome,
      discovered: game.discovered,
    });
    saveProgress(current.id, d.stars, d.global);
    renderDebrief(d);
  } catch (err) {
    toast(err.message);
    show('home');
  }
}

function renderDebrief(d) {
  $('dOutcome').textContent = d.outcome === 'won' ? 'Vente conclue' : 'Vente perdue';
  $('dStars').innerHTML = starsHTML(d.stars);
  $('dVerdict').textContent = d.verdict || '';
  $('dSummary').textContent = d.summary || '';
  $('dGlobal').textContent = d.global;

  const bars = $('dBars');
  bars.innerHTML = '';
  for (const [key, label] of Object.entries(SKILL_LABELS)) {
    const v = Math.max(0, Math.min(100, Math.round(Number(d.scores?.[key]) || 0)));
    const row = document.createElement('div');
    row.className = 'bar-row';
    const color = v >= 70 ? 'var(--good)' : v >= 45 ? 'var(--warn)' : 'var(--bad)';
    row.innerHTML = `<span>${label}</span><div class="bar"><div style="background:${color}"></div></div><b>${v}</b>`;
    bars.append(row);
    requestAnimationFrame(() => requestAnimationFrame(() => (row.querySelector('.bar > div').style.width = `${v}%`)));
  }

  const pains = $('dPains');
  pains.innerHTML = '';
  for (const p of d.pains) {
    const li = document.createElement('li');
    li.className = p.found ? 'found' : 'missed';
    li.textContent = `${p.found ? '✅' : '❌'} ${p.text}`;
    pains.append(li);
  }
  $('dMissed').textContent = d.missed || '';
  $('dBestQuote').textContent = d.best_line?.quote || '—';
  $('dBestWhy').textContent = d.best_line?.why || '';
  $('dWorstQuote').textContent = d.worst_line?.quote || '—';
  $('dWorstWhy').textContent = d.worst_line?.why || '';
  $('dWorstBetter').textContent = d.worst_line?.better || '';
  const tips = $('dTips');
  tips.innerHTML = '';
  for (const t of d.tips || []) {
    const li = document.createElement('li');
    li.textContent = t;
    tips.append(li);
  }
  $('dTechName').textContent = d.technique?.name || '';
  $('dTechExplain').textContent = d.technique?.explain || '';

  const idx = scenarios.indexOf(current);
  const next = scenarios[idx + 1];
  const canNext = next && isUnlocked(idx + 1, loadProgress());
  $('nextBtn').hidden = !canNext;

  $('debriefLoading').hidden = true;
  $('debriefContent').hidden = false;
}

/* ---------- Événements ---------- */
$('startBtn').addEventListener('click', () => {
  $('input').disabled = false;
  startGame();
});
$('composer').addEventListener('submit', (e) => {
  e.preventDefault();
  const text = $('input').value.trim();
  if (!text) return;
  $('input').value = '';
  sendReply(text);
});
$('input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    $('composer').requestSubmit();
  }
});
$('quitBtn').addEventListener('click', () => {
  if (game.over || game.busy) return;
  if (!confirm('Quitter le rendez-vous ? Il sera compté comme une vente perdue.')) return;
  endGame('quit');
});
$('replayBtn').addEventListener('click', () => openBriefing(current));
$('nextBtn').addEventListener('click', () => openBriefing(scenarios[scenarios.indexOf(current) + 1]));

/* ---------- Démarrage ---------- */
api('/api/scenarios')
  .then((list) => {
    scenarios = list;
    show('home');
  })
  .catch((err) => toast(`Impossible de charger les missions : ${err.message}`));
