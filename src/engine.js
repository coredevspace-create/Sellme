// Le moteur du jeu : règles de confiance, de victoire et de notation.
// Il ne parle pas directement à l'IA : on lui passe une fonction `ask(messages, kind)`
// qui renvoie la réponse JSON du modèle. Le serveur Node et la version
// publiée sur claude.ai utilisent ainsi exactement les mêmes règles.

import { SCENARIOS, getScenario, publicScenario } from './scenarios.js';
import { turnMessages, debriefMessages, SKILLS } from './prompts.js';

const MAX_MESSAGE_CHARS = 1200;
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

export function listScenarios() {
  return SCENARIOS.map(publicScenario);
}

// Nettoie l'historique envoyé par le navigateur.
function cleanHistory(history, scenario) {
  if (!Array.isArray(history)) throw new Error('Historique invalide');
  const max = scenario.maxTurns * 2 + 2;
  return history.slice(-max).map((m) => {
    const role = m.role === 'seller' ? 'seller' : 'prospect';
    if (role === 'seller' && m.kind === 'offer') return { role, kind: 'offer', content: '' };
    return { role, content: String(m.content ?? '').slice(0, MAX_MESSAGE_CHARS) };
  });
}

export async function playTurn(body, ask) {
  const s = getScenario(body.scenarioId);
  if (!s) throw new Error('Scénario inconnu');
  const history = cleanHistory(body.history, s);
  const last = history.at(-1);
  if (last?.role !== 'seller' || (last.kind !== 'offer' && !last.content.trim())) {
    throw new Error('Le dernier message doit venir du vendeur');
  }
  const trust = clamp(Number(body.trust) || 0, 0, 100);
  const turn = clamp(Number(body.turn) || 0, 0, s.maxTurns);
  const discovered = new Set(Array.isArray(body.discovered) ? body.discovered : []);

  const out = await ask(turnMessages(s, history, trust, turn), 'turn');

  const offerSent = last.kind === 'offer';
  const accepted =
    offerSent && (out.offer_accepted === true || (out.offer_accepted == null && out.status === 'won'));
  let delta = clamp(Math.round(Number(out.trust_delta) || 0), -15, 15);
  // Une offre refusée est une offre envoyée trop tôt : ça coûte toujours de la confiance.
  if (offerSent && !accepted) delta = Math.min(delta, -6);
  let newTrust = clamp(trust + delta, 0, 100);
  const nextTurn = turn + 1;

  let status = out.status === 'lost' ? 'lost' : 'ongoing';
  // La vente n'est conclue que si le prospect accepte l'offre qu'on vient de lui
  // envoyer. Sa décision fait foi, pour que le résultat colle à sa réponse.
  if (accepted && status !== 'lost') {
    status = 'won';
    newTrust = Math.max(newTrust, s.winTrust);
  }
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

export async function makeDebrief(body, ask) {
  const s = getScenario(body.scenarioId);
  if (!s) throw new Error('Scénario inconnu');
  const history = cleanHistory(body.history, s);
  const outcome = body.outcome === 'won' ? 'won' : 'lost';
  const discovered = (Array.isArray(body.discovered) ? body.discovered : []).filter((id) =>
    s.hidden.pains.some((p) => p.id === id),
  );

  const out = await ask(debriefMessages(s, history, outcome, discovered), 'debrief');
  const global = clamp(Math.round(Number(out.global) || 0), 0, 100);
  const stars = outcome === 'won' ? (global >= 80 ? 3 : 2) : global >= 50 ? 1 : 0;
  const scores = Object.fromEntries(
    SKILLS.map((k) => [k, clamp(Math.round(Number(out.scores?.[k]) || 0), 0, 10)]),
  );

  return {
    ...out,
    scores,
    global,
    stars,
    outcome,
    commission: outcome === 'won' ? s.offer.commission : 0,
    pains: s.hidden.pains.map((p) => ({ ...p, found: discovered.includes(p.id) })),
  };
}
