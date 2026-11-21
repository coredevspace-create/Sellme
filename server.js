import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SCENARIOS, getScenario, publicScenario } from './src/scenarios.js';
import { turnMessages, debriefMessages } from './src/prompts.js';
import { chatJSON, llmConfig } from './src/llm.js';

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = fileURLToPath(new URL('./public/', import.meta.url));
const MAX_MESSAGE_CHARS = 1200;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

function sendJSON(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 200_000) throw new Error('Requête trop volumineuse');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

// Nettoie l'historique envoyé par le navigateur.
function cleanHistory(history, scenario) {
  if (!Array.isArray(history)) throw new Error('Historique invalide');
  const max = scenario.maxTurns * 2 + 2;
  return history.slice(-max).map((m) => ({
    role: m.role === 'seller' ? 'seller' : 'prospect',
    content: String(m.content ?? '').slice(0, MAX_MESSAGE_CHARS),
  }));
}

async function handleTurn(body) {
  const s = getScenario(body.scenarioId);
  if (!s) throw new Error('Scénario inconnu');
  const history = cleanHistory(body.history, s);
  if (history.at(-1)?.role !== 'seller' || !history.at(-1).content.trim()) {
    throw new Error('Le dernier message doit venir du vendeur');
  }
  const trust = clamp(Number(body.trust) || 0, 0, 100);
  const turn = clamp(Number(body.turn) || 0, 0, s.maxTurns);
  const discovered = new Set(Array.isArray(body.discovered) ? body.discovered : []);

  const out = await chatJSON(turnMessages(s, history, trust, turn));

  const delta = clamp(Math.round(Number(out.trust_delta) || 0), -15, 15);
  const newTrust = clamp(trust + delta, 0, 100);
  const nextTurn = turn + 1;

  let status = ['won', 'lost'].includes(out.status) ? out.status : 'ongoing';
  if (status === 'won' && newTrust < s.winTrust) status = 'ongoing';
  if (newTrust <= 5) status = 'lost';
  if (status === 'ongoing' && nextTurn >= s.maxTurns) status = 'timeout';

  const revealed = (Array.isArray(out.revealed) ? out.revealed : [])
    .map((id) => s.hidden.pains.find((p) => p.id === id))
    .filter((p) => p && !discovered.has(p.id));

  return {
    reply: String(out.reply || '…'),
    coach: String(out.coach || ''),
    skill: String(out.skill || ''),
    delta,
    trust: newTrust,
    turn: nextTurn,
    status,
    revealed,
  };
}

async function handleDebrief(body) {
  const s = getScenario(body.scenarioId);
  if (!s) throw new Error('Scénario inconnu');
  const history = cleanHistory(body.history, s);
  const outcome = body.outcome === 'won' ? 'won' : 'lost';
  const discovered = (Array.isArray(body.discovered) ? body.discovered : []).filter((id) =>
    s.hidden.pains.some((p) => p.id === id),
  );

  const out = await chatJSON(debriefMessages(s, history, outcome, discovered));
  const global = clamp(Math.round(Number(out.global) || 0), 0, 100);
  const stars = outcome === 'won' ? (global >= 80 ? 3 : 2) : global >= 50 ? 1 : 0;

  return {
    ...out,
    global,
    stars,
    outcome,
    pains: s.hidden.pains.map((p) => ({ ...p, found: discovered.includes(p.id) })),
  };
}

async function serveStatic(req, res) {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const safe = normalize(urlPath === '/' ? '/index.html' : urlPath).replace(/^(\.\.[/\\])+/, '');
  const filePath = join(PUBLIC_DIR, safe);
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403).end();
    return;
  }
  try {
    const data = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Introuvable');
  }
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.url === '/api/scenarios' && req.method === 'GET') {
      return sendJSON(res, 200, SCENARIOS.map(publicScenario));
    }
    if (req.url === '/api/turn' && req.method === 'POST') {
      return sendJSON(res, 200, await handleTurn(await readBody(req)));
    }
    if (req.url === '/api/debrief' && req.method === 'POST') {
      return sendJSON(res, 200, await handleDebrief(await readBody(req)));
    }
    if (req.method === 'GET') return serveStatic(req, res);
    res.writeHead(405).end();
  } catch (err) {
    console.error(err);
    sendJSON(res, 500, { error: err.message });
  }
});

server.listen(PORT, () => {
  const cfg = llmConfig();
  console.log(`\n  🎯 Sellme est lancé : http://localhost:${PORT}`);
  console.log(`  Modèle : ${cfg.name} / ${cfg.model}${cfg.apiKey ? '' : `  ⚠️  ${cfg.keyVar} manquante`}\n`);
});
