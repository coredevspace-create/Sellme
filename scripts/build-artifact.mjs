// Assemble Sellme en une seule page HTML, publiable comme artifact sur claude.ai.
// Usage : npm run build:artifact  ->  dist/sellme.html
//
// La page publiée n'a pas de serveur : le moteur (public/js/engine.js) tourne dans le
// navigateur et Claude fait parler les prospects via public/js/claude-backend.js.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (p) => readFile(root + p, 'utf8');

// Transforme un module ES simple (imports d'une ligne, exports nommés) en script classique.
function unmodule(code) {
  return code
    .split('\n')
    .filter((line) => !/^import .* from '.*';$/.test(line))
    .join('\n')
    .replace(/^export (?=(async )?function |const |let )/gm, '');
}

const html = await read('public/index.html');
const css = await read('public/style.css');
const app = await read('public/app.js');
const engine = ['public/js/scenarios.js', 'public/js/prompts.js', 'public/js/engine.js', 'public/js/claude-backend.js'];
const engineCode = (await Promise.all(engine.map(read))).map(unmodule).join('\n');

const body = html
  .slice(html.indexOf('<body>') + '<body>'.length, html.indexOf('</body>'))
  // Pas de « Mon IA » ni d'appli installable sur claude.ai : l'IA y est fournie.
  .replace(/\s*<script type="module" src="[^"]+"><\/script>/g, '');

// Le cadre de claude.ai fournit doctype, <head>, charset et viewport :
// la page commence directement par son titre et ses styles.
const page = `<title>Sellme</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Unbounded:wght@600;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap">
<style>
${css}
</style>
${body.trim()}
<script>
(() => {
'use strict';
${engineCode}
})();
(() => {
'use strict';
${app}
})();
</script>
`;

await mkdir(root + 'dist', { recursive: true });
await writeFile(root + 'dist/sellme.html', page);
console.log(`dist/sellme.html écrit (${Math.round(page.length / 1024)} Ko)`);
