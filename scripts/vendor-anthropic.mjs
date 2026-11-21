// Prépare le SDK officiel d'Anthropic pour le navigateur (sans outil de build côté site).
// Usage : npm run vendor  ->  public/vendor/anthropic-sdk.js (fichier versionné dans le dépôt)

import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

await build({
  stdin: { contents: "export { default } from '@anthropic-ai/sdk';", resolveDir: root, loader: 'js' },
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2020',
  minify: true,
  legalComments: 'eof',
  outfile: root + 'public/vendor/anthropic-sdk.js',
});
console.log('public/vendor/anthropic-sdk.js écrit');
