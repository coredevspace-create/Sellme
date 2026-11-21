// Version publiée sur claude.ai : le moteur tourne dans la page et c'est Claude
// (via la capacité `sample`, sur le compte du joueur) qui fait parler les prospects.
// Aucun serveur ni clé API n'est nécessaire.

import { listScenarios, playTurn, makeDebrief } from './engine.js';

const ERROR_TEXT = {
  not_granted: 'Sellme a besoin de ton accord pour utiliser Claude. Recharge la page puis autorise-le pour jouer.',
  sampling_disabled: 'Claude n’est pas disponible sur ce compte, le jeu ne peut pas faire parler les prospects.',
  rate_limited: 'Trop de messages d’un coup, ou ta limite d’utilisation de Claude est atteinte. Réessaie dans un moment.',
  session_expired: 'Ta session claude.ai a expiré : reconnecte-toi puis renvoie ton message.',
  refused: 'Ce message n’est pas passé. Reformule-le et renvoie-le.',
};

let samplePromise = null;
function getSample() {
  samplePromise ??= window.claude?.use ? window.claude.use('sample') : Promise.resolve(null);
  return samplePromise;
}

// `sample` n'a pas de consigne système : on met les règles et la conversation
// dans un seul texte, puis on demande la réponse JSON.
function toPrompt(messages, kind) {
  const [system, ...rest] = messages;
  if (kind !== 'turn') return `${system.content}\n\n${rest.map((m) => m.content).join('\n\n')}`;
  const transcript = rest
    .map((m) => `${m.role === 'user' ? 'VENDEUR' : 'PROSPECT (toi)'} : ${m.content}`)
    .join('\n');
  return `${system.content}\n\nCONVERSATION JUSQU'ICI :\n${transcript}\n\nRéponds maintenant au DERNIER message du VENDEUR, avec uniquement l'objet JSON demandé.`;
}

async function ask(messages, kind) {
  const sample = await getSample();
  if (!sample) {
    throw new Error('Ouvre Sellme depuis claude.ai pour jouer : c’est Claude qui fait parler les prospects.');
  }
  try {
    // Réponses du prospect : modèle rapide pour que la conversation reste fluide.
    // Débrief : modèle standard, plus réfléchi.
    const options = kind === 'turn' ? { modelTier: 'quick', cache: false } : { cache: false };
    return await sample.json(toPrompt(messages, kind), options);
  } catch (e) {
    throw new Error(ERROR_TEXT[e?.code] || 'Le prospect n’a pas pu répondre. Renvoie ton message.');
  }
}

window.sellmeBackend = async (path, body) => {
  if (path === '/api/scenarios') return listScenarios();
  if (path === '/api/turn') return playTurn(body, ask);
  if (path === '/api/debrief') return makeDebrief(body, ask);
  throw new Error('Action inconnue');
};
