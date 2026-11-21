// Sellme : logique du jeu côté navigateur.

const $ = (id) => document.getElementById(id);

const SKILL_LABELS = {
  cadre: 'Cadre',
  decouverte: 'Découverte',
  ecoute: 'Écoute',
  projection: 'Faire rêver',
  prix: 'Annonce du prix',
  objections: 'Objections',
  closing: 'Closing',
};

const LEVELS = [
  { min: 0, name: 'Stagiaire' },
  { min: 100, name: 'Vendeur junior' },
  { min: 250, name: 'Vendeur' },
  { min: 500, name: 'Closer' },
  { min: 900, name: 'Closer senior' },
  { min: 1500, name: 'Closer d’élite' },
  { min: 2500, name: 'Légende de la vente' },
];

const OFFER_ICONS = { payment: '💳', trial: '🎁', booking: '📅', contract: '📝' };
const OFFER_ACCEPTED = {
  payment: '✅ Paiement reçu',
  trial: '✅ Essai activé',
  booking: '✅ Démo réservée',
  contract: '✅ Contrat signé',
};

const HINTS = [
  { step: 'Cadre', text: 'Avant de t’en dire plus, je peux te poser 2-3 questions pour voir si je peux vraiment t’aider ?' },
  { step: 'Découverte', text: 'Qu’est-ce qui t’a donné envie de m’écrire aujourd’hui ?' },
  { step: 'Découverte', text: 'Et aujourd’hui, comment tu fais concrètement ?' },
  { step: 'Implication', text: 'Et ça te coûte quoi, ça, en temps ou en argent ?' },
  { step: 'Écoute', text: 'Si je résume : … C’est bien ça ?' },
  { step: 'Faire rêver', text: 'Imagine dans 6 mois, une fois que c’est réglé : qu’est-ce qui a changé pour toi ?' },
  { step: 'Prix', text: 'L’investissement est de … Vu ce que tu m’as dit, ça te paraît cohérent ?' },
  { step: 'Objection', text: 'Je comprends. Qu’est-ce qui te fait hésiter exactement ?' },
  { step: 'Closing', text: 'Je t’envoie le lien, comme ça tu démarres dès aujourd’hui ?' },
];

const XP_DIFFICULTY_BONUS = { Facile: 0, Moyen: 10, Difficile: 20, Boss: 35 };

let scenarios = [];
let current = null; // mission en cours
let game = null; // état de la conversation

/* ---------- Progression (stockée dans le navigateur) ---------- */
const STORE_KEY = 'sellme-progress-v2';
function loadProgress() {
  let p = {};
  try {
    p = JSON.parse(localStorage.getItem(STORE_KEY)) || {};
  } catch {
    /* stockage indisponible */
  }
  return { missions: {}, xp: 0, wallet: 0, history: [], mode: 'assist', ...p };
}
function saveProgress(p) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(p));
  } catch {
    /* stockage indisponible : la progression ne sera pas gardée */
  }
}
function isUnlocked(index, progress) {
  if (index === 0) return true;
  return (progress.missions[scenarios[index - 1].id]?.stars || 0) >= 1;
}
function levelFor(xp) {
  let i = 0;
  while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1].min) i++;
  const next = LEVELS[i + 1];
  const ratio = next ? (xp - LEVELS[i].min) / (next.min - LEVELS[i].min) : 1;
  return { index: i, name: LEVELS[i].name, next, ratio };
}
const euros = (n) => `${n.toLocaleString('fr-FR')} €`;

function renderTopbar() {
  const p = loadProgress();
  const lvl = levelFor(p.xp);
  $('levelNum').textContent = lvl.index + 1;
  $('levelName').textContent = lvl.name;
  $('levelRing').style.setProperty('--p', Math.round(lvl.ratio * 100));
  $('xpFill').style.width = `${Math.round(lvl.ratio * 100)}%`;
  $('wallet').textContent = euros(p.wallet);
}

/* ---------- Navigation ---------- */
function show(screen) {
  for (const s of document.querySelectorAll('.screen')) s.hidden = s.id !== screen;
  window.scrollTo({ top: 0 });
  if (screen === 'home') renderHome();
  if (screen !== 'game') $('gameTag').hidden = true;
  renderTopbar();
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

const starsHTML = (n, total = 3) => '★'.repeat(n) + `<span class="off">${'★'.repeat(total - n)}</span>`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const nowTime = () => new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/* ---------- Menu principal ---------- */
let activePanel = 'play';

function setPanel(name) {
  activePanel = name;
  for (const b of document.querySelectorAll('.menu-item')) b.classList.toggle('active', b.dataset.panel === name);
  for (const p of document.querySelectorAll('.panel')) p.hidden = p.id !== `panel-${name}`;
}
for (const b of document.querySelectorAll('.menu-item')) b.addEventListener('click', () => setPanel(b.dataset.panel));

// Navigation au clavier, comme dans un menu de jeu.
document.addEventListener('keydown', (e) => {
  if ($('home').hidden || e.target.closest('input, textarea')) return;
  const items = [...document.querySelectorAll('.menu-item')];
  const i = items.findIndex((b) => b.dataset.panel === activePanel);
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    const next = items[(i + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length];
    setPanel(next.dataset.panel);
    next.focus();
  } else if (e.key === 'Enter' && activePanel === 'play' && !e.target.closest('button:not(.menu-item)')) {
    e.preventDefault();
    $('surpriseBtn').click();
  }
});

function setMode(mode) {
  const p = loadProgress();
  p.mode = mode;
  saveProgress(p);
  for (const b of document.querySelectorAll('#modeSwitch button')) b.classList.toggle('on', b.dataset.mode === mode);
}
for (const b of document.querySelectorAll('#modeSwitch button')) b.addEventListener('click', () => setMode(b.dataset.mode));

function careerStats(p) {
  const games = p.history.length;
  const wins = p.history.filter((h) => h.outcome === 'won').length;
  const best = p.history.reduce((m, h) => Math.max(m, h.global), 0);
  return { games, wins, rate: games ? Math.round((wins / games) * 100) : 0, best };
}

function renderHome() {
  const progress = loadProgress();
  const lvl = levelFor(progress.xp);
  const stats = careerStats(progress);
  const unlockedCount = scenarios.filter((_, i) => isUnlocked(i, progress)).length;

  // Compteurs du menu
  $('mMissions').textContent = `${unlockedCount}/${scenarios.length}`;
  $('mCareer').textContent = `niv. ${lvl.index + 1}`;
  $('mHistory').textContent = stats.games || '';
  setMode(progress.mode);
  setPanel(activePanel);

  // Jouer
  const last = progress.history[0];
  $('lastGame').textContent = last
    ? `${last.outcome === 'won' ? 'Vente' : 'Sans vente'} · ${last.global}/100${last.outcome === 'won' ? ` · +${euros(last.commission)}` : ''}`
    : 'Aucune';
  const nextIndex = scenarios.findIndex((s, i) => isUnlocked(i, progress) && !(progress.missions[s.id]?.stars >= 1));
  const target = scenarios[nextIndex === -1 ? scenarios.length - 1 : nextIndex];
  const nm = $('nextMissionCard');
  nm.innerHTML = '';
  const text = el('span', 'nm-text');
  text.append(
    el('small', '', nextIndex === -1 ? 'Toutes les missions sont débloquées' : `Mission ${target.level} · ${target.difficulty}`),
    el('b', '', target.title),
    el('small', '', `${target.prospect.name} · ${target.channel}`),
  );
  nm.append(el('span', 'avatar', target.prospect.avatar), text, el('span', 'arrow', '→'));
  nm.onclick = () => openBriefing(target);

  // Missions
  const list = $('levels');
  list.innerHTML = '';
  scenarios.forEach((s, i) => {
    const unlocked = isUnlocked(i, progress);
    const m = progress.missions[s.id];
    const row = el('button', 'glass mission');
    row.disabled = !unlocked;
    const mid = el('span');
    mid.append(
      el('span', 'm-title', `${s.level}. ${s.title}`),
      el('span', 'm-sub', unlocked ? `${s.prospect.name} · ${s.channel} · ${s.skillFocus}` : '🔒 Gagne 1 étoile à la mission précédente'),
    );
    const right = el('span', 'm-right');
    right.append(el('span', `tag ${s.difficulty}`, s.difficulty));
    const stars = el('span', 'stars');
    stars.innerHTML = starsHTML(m?.stars || 0);
    right.append(stars);
    row.append(el('span', 'avatar', s.prospect.avatar), mid, right);
    row.addEventListener('click', () => openBriefing(s));
    list.append(row);
  });

  // Carrière
  $('careerRing').style.setProperty('--p', Math.round(lvl.ratio * 100));
  $('careerLevelNum').textContent = lvl.index + 1;
  $('careerLevelName').textContent = lvl.name;
  $('careerXp').textContent = lvl.next
    ? `${progress.xp} XP · encore ${lvl.next.min - progress.xp} XP avant « ${lvl.next.name} »`
    : `${progress.xp} XP · niveau maximum 👑`;
  $('careerXpFill').style.width = `${Math.round(lvl.ratio * 100)}%`;
  const statBox = $('careerStats');
  statBox.innerHTML = '';
  for (const [value, label, cls] of [
    [euros(progress.wallet), 'Commissions encaissées', 'money'],
    [stats.games, 'Conversations'],
    [`${stats.rate} %`, 'Taux de closing'],
    [stats.best ? `${stats.best}/100` : '—', 'Meilleure note'],
  ]) {
    const d = el('div', `stat ${cls || ''}`);
    d.append(el('b', '', String(value)), el('small', '', label));
    statBox.append(d);
  }
  const ladder = $('ladder');
  ladder.innerHTML = '';
  LEVELS.forEach((l, i) => {
    const r = el('div', `rung ${i < lvl.index ? 'done' : i === lvl.index ? 'current' : ''}`);
    r.append(el('span', '', `${i < lvl.index ? '✓' : i === lvl.index ? '▶' : '·'} ${i + 1}. ${l.name}`), el('span', '', `${l.min} XP`));
    ladder.append(r);
  });

  // Historique
  const hist = $('history');
  hist.innerHTML = '';
  $('historyEmpty').hidden = progress.history.length > 0;
  for (const h of progress.history.slice(0, 20)) {
    const li = el('li');
    const main = el('span', 'h-main');
    const date = new Date(h.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    main.append(el('b', '', `${h.prospect}${h.hardcore ? ' 🔥' : ''}`), el('small', '', `${h.title} · ${date}`));
    const res = el('span', `h-result ${h.outcome}`, h.outcome === 'won' ? `+${euros(h.commission)}` : 'Perdue');
    res.append(el('small', '', `${h.global}/100`));
    li.append(el('span', 'avatar', h.avatar), main, res);
    hist.append(li);
  }
}

$('surpriseBtn').addEventListener('click', () => {
  const progress = loadProgress();
  let maxIndex = 0;
  scenarios.forEach((_, i) => {
    if (isUnlocked(i, progress)) maxIndex = i;
  });
  // Un prospect parmi les missions débloquées, ou la suivante pour corser le jeu.
  const pool = scenarios.slice(0, Math.min(scenarios.length, maxIndex + 2));
  const pick = pool[Math.floor(Math.random() * pool.length)];
  current = pick;
  startGame({ surprise: true, hardcore: progress.mode === 'hardcore' });
});

/* ---------- Briefing ---------- */
function fillList(ul, items) {
  ul.innerHTML = '';
  for (const text of items) ul.append(el('li', '', text));
}

function openBriefing(s) {
  current = s;
  $('bAvatar').textContent = s.prospect.avatar;
  $('bLevel').textContent = `Mission ${s.level} · ${s.difficulty} · ${s.channel}`;
  $('bName').textContent = s.prospect.name;
  $('bRole').textContent = `${s.prospect.role} · ${s.prospect.company}`;
  $('bMood').textContent = s.prospect.publicMood;
  $('bContext').textContent = s.context;
  $('bMission').textContent = s.mission;
  fillList($('bObjectives'), [
    `Découvre ses ${s.painCount} besoins cachés`,
    `Fais monter sa confiance au-dessus de ${s.winTrust}`,
    `Envoie « ${s.offer.label} » au bon moment, en ${s.maxTurns} messages maximum`,
  ]);
  $('bProduct').textContent = s.product.name;
  $('bPitch').textContent = s.product.pitch;
  fillList($('bFeatures'), s.product.features);
  $('bPrice').textContent = `💶 ${s.product.price}`;
  const offer = $('bOffer');
  offer.innerHTML = '';
  const txt = el('div');
  txt.append(el('b', '', `Pour conclure : ${s.offer.label}`), el('small', '', `${s.offer.amount} · ta commission : ${euros(s.offer.commission)}`));
  offer.append(el('span', 'big-icon', OFFER_ICONS[s.offer.kind]), txt);
  const mode = loadProgress().mode;
  for (const r of document.querySelectorAll('input[name="mode"]')) r.checked = r.value === mode;
  show('briefing');
}

$('startBtn').addEventListener('click', () => {
  const hardcore = document.querySelector('input[name="mode"]:checked').value === 'hardcore';
  const p = loadProgress();
  p.mode = hardcore ? 'hardcore' : 'assist';
  saveProgress(p);
  startGame({ surprise: false, hardcore });
});

/* ---------- Conversation ---------- */
function startGame({ surprise, hardcore }) {
  const s = current;
  game = {
    history: [{ role: 'prospect', content: s.opening }],
    trust: s.startTrust,
    turn: 0,
    discovered: [],
    discoveredPains: [],
    hardcore,
    surprise,
    busy: false,
    over: false,
  };
  document.body.classList.toggle('hardcore', hardcore);
  const tag = $('gameTag');
  tag.innerHTML = '';
  tag.append(el('span', 'dot'), el('b', '', surprise ? 'Partie rapide' : `Mission ${s.level} · ${s.title}`));
  if (hardcore) tag.append(el('span', 'tag-hard', 'Sans filet · XP ×1,25'));
  tag.hidden = false;
  $('clock').textContent = nowTime();

  $('gAvatar').textContent = s.prospect.avatar;
  $('gName').textContent = s.prospect.name;
  setStatus(false);
  $('sChannel').textContent = `${s.channel}${surprise ? ' · Prospect surprise ⚡' : ''}`;
  $('sContext').textContent = s.context;
  $('sMission').textContent = `Tu vends ${s.product.name} : ${s.product.pitch} ${s.product.price}. Pour conclure : ${s.offer.label} (${s.offer.amount}).`;
  $('gaugeTarget').style.left = `${s.winTrust}%`;
  $('offerIcon').textContent = OFFER_ICONS[s.offer.kind];
  $('offerLabel').textContent = `Envoyer : ${s.offer.label}`;
  $('offerAmount').textContent = s.offer.amount;
  $('hintsBtn').hidden = hardcore;
  renderHints();
  closeSheets();

  $('chat').innerHTML = '';
  $('chat').append(el('div', 'day', `Aujourd’hui · ${s.channel}`));
  addBubble('in', s.opening);
  renderPains();
  updateGauge(0);
  $('input').value = '';
  $('input').disabled = false;
  $('sendBtn').disabled = false;
  $('plusBtn').disabled = false;
  autoResize();
  show('game');
  $('input').focus();
}

function setStatus(typing) {
  const st = $('dmStatus');
  st.textContent = typing ? 'écrit…' : `${current.channel} · en ligne`;
  st.classList.toggle('typing-status', typing);
}
function scrollChat() {
  $('chat').scrollTop = $('chat').scrollHeight;
}
function addBubble(side, text) {
  const row = el('div', `row ${side}`);
  row.append(el('div', 'bubble', text), el('span', 'time', nowTime()));
  $('chat').append(row);
  scrollChat();
  return row;
}
function addOfferCard() {
  const o = current.offer;
  const row = el('div', 'row out');
  const card = el('div', 'offer-card');
  const top = el('div', 'oc-top');
  top.append(el('small', '', `${OFFER_ICONS[o.kind]} ${o.label}`), el('b', '', o.amount));
  card.append(top, el('div', 'oc-body', `${current.product.name} · ${current.product.pitch}`), el('div', 'oc-state', 'Envoyé'));
  row.append(card, el('span', 'time', nowTime()));
  $('chat').append(row);
  scrollChat();
  return row;
}
function markSeen() {
  $('chat').querySelector('.seen')?.remove();
  const seen = el('div', 'seen', 'Vu');
  $('chat').append(seen);
  scrollChat();
}
function addCoach(delta, text) {
  const div = el('div', 'coach');
  const cls = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
  div.append(el('span', `delta ${cls}`, `${delta > 0 ? '+' : ''}${delta}`), el('span', '', text));
  $('chat').append(div);
}
function addSys(text, className = 'sysmsg') {
  $('chat').append(el('div', className, text));
  scrollChat();
}
function setTyping(on) {
  $('chat').querySelector('.typing')?.remove();
  setStatus(on);
  if (on) {
    const div = el('div', 'typing');
    div.innerHTML = '<span></span><span></span><span></span>';
    $('chat').append(div);
    scrollChat();
  }
}

function trustColor(t) {
  if (t >= current.winTrust) return 'var(--good)';
  if (t >= 45) return 'var(--warn)';
  return 'var(--bad)';
}
function updateGauge(delta) {
  const left = current.maxTurns - game.turn;
  $('trustValue').textContent = game.trust;
  $('gaugeFill').style.width = `${game.trust}%`;
  $('gaugeFill').style.backgroundColor = trustColor(game.trust);
  $('turnsLeft').textContent = left;
  $('miniTrust').textContent = `🤝 ${game.trust} · ✉️ ${left}`;
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
  for (const pain of game.discoveredPains) ul.append(el('li', 'found', pain.text));
  for (let i = game.discovered.length; i < current.painCount; i++) ul.append(el('li', 'unknown', '? ? ?'));
}

/* Actions du « + » : envoyer l'offre ou afficher des phrases utiles */
function closeSheets() {
  $('sheet').hidden = true;
  $('hints').hidden = true;
  $('plusBtn').classList.remove('open');
}
function renderHints() {
  const box = $('hints');
  box.innerHTML = '';
  for (const h of HINTS) {
    const b = el('button', 'hint');
    b.type = 'button';
    b.append(el('b', '', h.step), document.createTextNode(h.text));
    b.addEventListener('click', () => {
      $('input').value = h.text;
      closeSheets();
      autoResize();
      $('input').focus();
    });
    box.append(b);
  }
}
$('plusBtn').addEventListener('click', () => {
  const open = $('sheet').hidden && $('hints').hidden;
  closeSheets();
  if (open) {
    $('sheet').hidden = false;
    $('plusBtn').classList.add('open');
    $('sendOfferBtn').disabled = game.busy || game.over;
  }
});
$('hintsBtn').addEventListener('click', () => {
  $('sheet').hidden = true;
  $('hints').hidden = false;
});
$('sendOfferBtn').addEventListener('click', () => {
  closeSheets();
  send({ role: 'seller', kind: 'offer', content: '' });
});

async function send(entry) {
  if (game.busy || game.over) return;
  game.busy = true;
  $('sendBtn').disabled = true;
  $('plusBtn').disabled = true;

  game.history.push(entry);
  const isOffer = entry.kind === 'offer';
  const row = isOffer ? addOfferCard() : addBubble('out', entry.content);
  const started = Date.now();

  // Le prospect lit puis commence à écrire pendant que l'IA prépare sa réponse.
  const readTimer = setTimeout(markSeen, 600);
  const typeTimer = setTimeout(() => setTyping(true), 1100);

  try {
    const r = await api('/api/turn', {
      scenarioId: current.id,
      history: game.history,
      trust: game.trust,
      turn: game.turn,
      discovered: game.discovered,
    });
    // Temps de frappe réaliste selon la longueur de la réponse.
    const typingTime = Math.min(3500, 1200 + r.reply.length * 22);
    await sleep(Math.max(0, typingTime - (Date.now() - started)));
    clearTimeout(readTimer);
    clearTimeout(typeTimer);
    setTyping(false);

    if (isOffer) {
      const card = row.querySelector('.offer-card');
      const accepted = r.status === 'won';
      card.classList.add(accepted ? 'accepted' : 'refused');
      card.querySelector('.oc-state').textContent = accepted ? OFFER_ACCEPTED[current.offer.kind] : '✖ Pas encore…';
    }
    if (!game.hardcore && r.coach) addCoach(r.delta, r.coach);
    game.trust = r.trust;
    game.turn = r.turn;
    game.history.push({ role: 'prospect', content: r.reply });
    addBubble('in', r.reply);
    for (const pain of r.revealed) {
      game.discovered.push(pain.id);
      game.discoveredPains.push(pain);
      addSys('🔍 Besoin découvert !', 'discovery');
    }
    renderPains();
    updateGauge(r.delta);
    if (r.status !== 'ongoing') endGame(r.status);
  } catch (err) {
    clearTimeout(readTimer);
    clearTimeout(typeTimer);
    setTyping(false);
    $('chat').querySelector('.seen')?.remove();
    game.history.pop();
    row.remove();
    if (!isOffer) $('input').value = entry.content;
    toast(err.message);
  } finally {
    game.busy = false;
    if (!game.over) {
      $('sendBtn').disabled = false;
      $('plusBtn').disabled = false;
      $('input').focus();
    }
  }
}

function endGame(status) {
  game.over = true;
  closeSheets();
  $('input').disabled = true;
  $('sendBtn').disabled = true;
  $('plusBtn').disabled = true;
  const label = {
    won: '🎉 Vente conclue ! Bravo.',
    lost: '🚪 Le prospect a coupé court à la conversation.',
    timeout: '⏰ Le prospect ne répond plus…',
    quit: '🏳️ Tu as quitté la conversation.',
  }[status];
  addSys(label);
  setTimeout(() => runDebrief(status === 'won' ? 'won' : 'lost'), status === 'quit' ? 300 : 2200);
}

/* Saisie */
function autoResize() {
  const t = $('input');
  t.style.height = 'auto';
  t.style.height = `${Math.min(120, t.scrollHeight)}px`;
}
$('input').addEventListener('input', autoResize);
$('input').addEventListener('focus', closeSheets);
$('composer').addEventListener('submit', (e) => {
  e.preventDefault();
  const text = $('input').value.trim();
  if (!text) return;
  $('input').value = '';
  autoResize();
  send({ role: 'seller', content: text });
});
$('input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    $('composer').requestSubmit();
  }
});
$('quitBtn').addEventListener('click', () => {
  if (game.over || game.busy) return;
  if (!game.history.some((m) => m.role === 'seller')) {
    show(game.surprise ? 'home' : 'briefing');
    return;
  }
  if (!confirm('Quitter la conversation ? Elle sera comptée comme une vente perdue.')) return;
  endGame('quit');
});

/* ---------- Débrief ---------- */
function computeXp(d, s, hardcore) {
  const lines = [];
  let xp = Math.round(d.global / 2);
  lines.push([`Note du coach (${d.global}/100)`, xp]);
  if (d.outcome === 'won') {
    lines.push(['Vente conclue', 25]);
    xp += 25;
    const bonus = XP_DIFFICULTY_BONUS[s.difficulty] || 0;
    if (bonus) {
      lines.push([`Difficulté ${s.difficulty}`, bonus]);
      xp += bonus;
    }
  }
  if (hardcore) {
    const b = Math.round(xp * 0.25);
    lines.push(['Sans filet (+25 %)', b]);
    xp += b;
  }
  return { xp, lines };
}

async function runDebrief(outcome) {
  show('debrief');
  $('debriefLoading').hidden = false;
  $('debriefContent').hidden = true;
  try {
    const d = await api('/api/debrief', {
      scenarioId: current.id,
      history: game.history,
      outcome,
      discovered: game.discovered,
    });
    const p = loadProgress();
    const before = levelFor(p.xp);
    const gain = computeXp(d, current, game.hardcore);
    const prev = p.missions[current.id] || { stars: 0, best: 0 };
    p.missions[current.id] = { stars: Math.max(prev.stars, d.stars), best: Math.max(prev.best, d.global) };
    p.xp += gain.xp;
    p.wallet += d.commission;
    p.history.unshift({
      id: current.id,
      title: current.title,
      prospect: current.prospect.name,
      avatar: current.prospect.avatar,
      outcome: d.outcome,
      global: d.global,
      commission: d.commission,
      hardcore: game.hardcore,
      date: new Date().toISOString(),
    });
    p.history = p.history.slice(0, 100);
    saveProgress(p);
    renderDebrief(d, gain, before, levelFor(p.xp));
    renderTopbar();
  } catch (err) {
    toast(err.message);
    show('home');
  }
}

function renderDebrief(d, gain, before, after) {
  $('dOutcome').textContent = d.outcome === 'won' ? 'Vente conclue' : 'Pas de vente';
  $('dOutcome').className = `outcome ${d.outcome}`;
  const ring = $('dRing');
  ring.style.stroke = d.global >= 70 ? 'var(--good)' : d.global >= 40 ? 'var(--warn)' : 'var(--bad)';
  ring.style.strokeDashoffset = 327;
  requestAnimationFrame(() => requestAnimationFrame(() => (ring.style.strokeDashoffset = 327 * (1 - d.global / 100))));
  $('dStars').innerHTML = starsHTML(d.stars);
  $('dVerdict').textContent = d.verdict || '';
  $('dSummary').textContent = d.summary || '';
  $('dGlobal').textContent = d.global;

  const bars = $('dBars');
  bars.innerHTML = '';
  for (const [key, label] of Object.entries(SKILL_LABELS)) {
    const v = d.scores?.[key] ?? 0;
    const row = el('div', 'bar-row');
    const color = v >= 7 ? 'var(--good)' : v >= 4 ? 'var(--warn)' : 'var(--bad)';
    row.innerHTML = `<span>${label}</span><div class="bar"><div style="background:${color}"></div></div><b>${v}/10</b>`;
    bars.append(row);
    requestAnimationFrame(() => requestAnimationFrame(() => (row.querySelector('.bar > div').style.width = `${v * 10}%`)));
  }

  $('dXp').textContent = `+${gain.xp} XP`;
  const lines = $('dXpLines');
  lines.innerHTML = '';
  for (const [label, n] of gain.lines) {
    const li = el('li');
    li.append(el('span', '', label), el('b', '', `+${n}`));
    lines.append(li);
  }
  const com = $('dCommission');
  com.textContent = d.commission ? `💰 Commission encaissée : +${euros(d.commission)}` : 'Pas de commission cette fois.';
  com.classList.toggle('zero', !d.commission);
  $('dLevel').textContent =
    after.index > before.index ? `🎉 Niveau supérieur : ${after.name} !` : `Niveau ${after.index + 1} · ${after.name}`;
  $('dXpFill').style.width = '0';
  requestAnimationFrame(() => requestAnimationFrame(() => ($('dXpFill').style.width = `${Math.round(after.ratio * 100)}%`)));
  $('dNext').textContent = after.next ? `Prochain niveau : ${after.next.name} (${after.next.min} XP)` : 'Niveau maximum atteint 👑';

  const pains = $('dPains');
  pains.innerHTML = '';
  for (const pn of d.pains) pains.append(el('li', pn.found ? 'found' : 'missed', `${pn.found ? '✅' : '❌'} ${pn.text}`));
  $('dMissed').textContent = d.missed || '';
  // Le modèle peut citer l'envoi de l'offre sous sa forme technique : on l'affiche lisiblement.
  const quote = (q) => (q && q.includes('ACTION DU VENDEUR') ? `📎 Envoi de « ${current.offer.label} »` : q || '—');
  $('dBestQuote').textContent = quote(d.best_line?.quote);
  $('dBestWhy').textContent = d.best_line?.why || '';
  $('dWorstQuote').textContent = quote(d.worst_line?.quote);
  $('dWorstWhy').textContent = d.worst_line?.why || '';
  $('dWorstBetter').textContent = d.worst_line?.better || '';
  fillList($('dTips'), d.tips || []);
  $('dTechName').textContent = d.technique?.name || '';
  $('dTechExplain').textContent = d.technique?.explain || '';

  const idx = scenarios.indexOf(current);
  const next = scenarios[idx + 1];
  $('nextBtn').hidden = !(next && isUnlocked(idx + 1, loadProgress()));

  $('debriefLoading').hidden = true;
  $('debriefContent').hidden = false;
}

$('replayBtn').addEventListener('click', () => openBriefing(current));
$('nextBtn').addEventListener('click', () => openBriefing(scenarios[scenarios.indexOf(current) + 1]));

/* ---------- Démarrage ---------- */
api('/api/scenarios')
  .then((list) => {
    scenarios = list;
    show('home');
  })
  .catch((err) => toast(`Impossible de charger les missions : ${err.message}`));
