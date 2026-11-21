import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { listScenarios, playTurn, makeDebrief } from './src/engine.js';
import { chatJSON, llmConfig } from './src/llm.js';

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = fileURLToPath(new URL('./public/', import.meta.url));

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

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
      return sendJSON(res, 200, listScenarios());
    }
    if (req.url === '/api/turn' && req.method === 'POST') {
      return sendJSON(res, 200, await playTurn(await readBody(req), chatJSON));
    }
    if (req.url === '/api/debrief' && req.method === 'POST') {
      return sendJSON(res, 200, await makeDebrief(await readBody(req), chatJSON));
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
