// Petit serveur local pour développer Sellme : il sert simplement le dossier public/.
// Il est rangé dans scripts/ pour que Vercel ne le prenne pas pour un serveur à exécuter.
// Le jeu est un site statique : l'IA est appelée directement depuis le navigateur
// du joueur, avec sa propre clé (voir public/js/ai.js). En production : Vercel.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = fileURLToPath(new URL('../public/', import.meta.url));

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

http
  .createServer(async (req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const safe = normalize(urlPath.endsWith('/') ? `${urlPath}index.html` : urlPath).replace(/^(\.\.[/\\])+/, '');
    const filePath = join(PUBLIC_DIR, safe);
    if (!filePath.startsWith(PUBLIC_DIR)) return res.writeHead(403).end();
    try {
      const data = await readFile(filePath);
      res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] || 'application/octet-stream' });
      res.end(data);
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Introuvable');
    }
  })
  .listen(PORT, () => console.log(`\n  🎯 Sellme : http://localhost:${PORT}\n`));
