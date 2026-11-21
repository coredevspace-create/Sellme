// « Mon IA » : chaque joueur branche sa propre IA (clé API ou compte OpenRouter).
// La clé reste dans le navigateur du joueur et n'est envoyée qu'au fournisseur choisi :
// Sellme n'a ni serveur d'IA ni coût d'IA.

import { listScenarios, playTurn, makeDebrief } from './engine.js';

export const PROVIDERS = {
  gemini: {
    label: 'Gemini',
    company: 'Google',
    badge: 'Gratuit pour commencer',
    keyUrl: 'https://aistudio.google.com/apikey',
    keyHint: 'Commence par « AIza »',
    models: [
      ['gemini-flash-latest', 'Gemini Flash (recommandé)'],
      ['gemini-flash-lite-latest', 'Gemini Flash-Lite (le plus rapide)'],
    ],
    steps: [
      'Ouvre Google AI Studio et connecte-toi avec ton compte Google.',
      'Appuie sur « Create API key ».',
      'Copie la clé et colle-la ci-dessous.',
    ],
  },
  openai: {
    label: 'ChatGPT',
    company: 'OpenAI',
    badge: 'Environ 1 centime par partie',
    keyUrl: 'https://platform.openai.com/api-keys',
    keyHint: 'Commence par « sk- »',
    models: [
      ['gpt-5.4-mini', 'GPT-5.4 mini (recommandé)'],
      ['gpt-5.5', 'GPT-5.5 (plus fin, plus cher)'],
    ],
    steps: [
      'Ouvre la plateforme OpenAI (compte distinct de l’abonnement ChatGPT Plus).',
      'Ajoute quelques euros de crédit dans « Billing ».',
      'Crée une clé dans « API keys », puis colle-la ci-dessous.',
    ],
  },
  anthropic: {
    label: 'Claude',
    company: 'Anthropic',
    badge: 'Selon le modèle choisi',
    keyUrl: 'https://console.anthropic.com/settings/keys',
    keyHint: 'Commence par « sk-ant- »',
    models: [
      ['claude-opus-5-5', 'Claude Opus 5.5 (le plus fin)'],
      ['claude-sonnet-5-5', 'Claude Sonnet 5.5'],
      ['claude-haiku-5-5', 'Claude Haiku 5.5 (le plus rapide et économique)'],
    ],
    steps: [
      'Ouvre la console Claude (compte distinct de l’abonnement Claude Pro).',
      'Ajoute quelques euros de crédit dans « Billing ».',
      'Crée une clé dans « API keys », puis colle-la ci-dessous.',
    ],
  },
  openrouter: {
    label: 'OpenRouter',
    company: 'toutes les IA',
    badge: 'Connexion en un clic',
    keyUrl: 'https://openrouter.ai/keys',
    keyHint: 'Commence par « sk-or- »',
    oauth: true,
    models: [['openrouter/auto', 'Choix automatique d’OpenRouter (recommandé)']],
    steps: [
      'Appuie sur « Se connecter avec OpenRouter » et crée ton compte.',
      'Ajoute du crédit, ou choisis un modèle gratuit dans « Modèle personnalisé ».',
      'Tu reviens automatiquement dans Sellme, connecté.',
    ],
  },
};

/* ---------- Réglages (stockés sur l'appareil) ---------- */
const STORE_KEY = 'sellme-ai-v1';
const VERIFIER_KEY = 'sellme-openrouter-verifier';

export function getConfig() {
  try {
    const c = JSON.parse(localStorage.getItem(STORE_KEY));
    if (c && PROVIDERS[c.provider] && c.key) return c;
  } catch {
    /* stockage indisponible */
  }
  return null;
}

export function saveConfig(config) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(config));
  } catch {
    throw new Error('Impossible d’enregistrer la clé sur cet appareil (navigation privée ?).');
  }
}

export function clearConfig() {
  try {
    localStorage.removeItem(STORE_KEY);
  } catch {
    /* rien à effacer */
  }
}

/* ---------- Erreurs lisibles ---------- */
class AIError extends Error {}

function httpError(status, providerLabel, model, detail = '') {
  const lower = detail.toLowerCase();
  if (status === 401 || status === 403) return new AIError(`Ta clé ${providerLabel} est refusée. Vérifie-la dans « Mon IA ».`);
  if (status === 402 || lower.includes('credit') || lower.includes('quota') || lower.includes('billing'))
    return new AIError(`Crédit insuffisant sur ton compte ${providerLabel}. Ajoute du crédit ou change d’IA dans « Mon IA ».`);
  if (status === 404) return new AIError(`Le modèle « ${model} » n’est pas disponible avec ta clé ${providerLabel}. Choisis-en un autre dans « Mon IA ».`);
  if (status === 429) return new AIError(`Limite atteinte chez ${providerLabel} (trop de messages d’un coup). Réessaie dans une minute.`);
  if (status === 529 || status === 503 || lower.includes('overloaded') || lower.includes('high demand'))
    return new AIError(`${providerLabel} est surchargé en ce moment. Renvoie ton message dans un instant.`);
  return new AIError(`${providerLabel} a renvoyé une erreur (${status}). Renvoie ton message ou change d’IA dans « Mon IA ».`);
}

function parseJSON(text) {
  try {
    return JSON.parse(text);
  } catch {
    const m = String(text).match(/\{[\s\S]*\}/);
    if (m) {
      try {
        return JSON.parse(m[0]);
      } catch {
        /* illisible */
      }
    }
  }
  throw new AIError('La réponse de l’IA était illisible. Renvoie ton message.');
}

/* ---------- Appels aux fournisseurs ---------- */
// Les consignes du jeu deviennent une consigne système + un message unique
// contenant la conversation : ce format marche chez tous les fournisseurs.
function toChat(messages, kind) {
  const [system, ...rest] = messages;
  if (kind !== 'turn') return { system: system.content, user: rest.map((m) => m.content).join('\n\n') };
  const transcript = rest
    .map((m) => `${m.role === 'user' ? 'VENDEUR' : 'PROSPECT (toi)'} : ${m.content}`)
    .join('\n');
  return {
    system: system.content,
    user: `CONVERSATION JUSQU'ICI :\n${transcript}\n\nRéponds maintenant au DERNIER message du VENDEUR, avec uniquement l'objet JSON demandé.`,
  };
}

async function postJSON(url, headers, body, providerLabel, model) {
  let res;
  try {
    res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
  } catch {
    throw new AIError(`Impossible de joindre ${providerLabel}. Vérifie ta connexion internet.`);
  }
  const text = await res.text();
  if (!res.ok) throw httpError(res.status, providerLabel, model, text);
  return JSON.parse(text);
}

async function callOpenAICompatible(cfg, chat, label) {
  const isOpenRouter = cfg.provider === 'openrouter';
  const url = isOpenRouter ? 'https://openrouter.ai/api/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions';
  const headers = { Authorization: `Bearer ${cfg.key}` };
  if (isOpenRouter) {
    headers['HTTP-Referer'] = location.origin;
    headers['X-Title'] = 'Sellme';
  }
  const body = {
    model: cfg.model,
    messages: [
      { role: 'system', content: chat.system },
      { role: 'user', content: chat.user },
    ],
  };
  if (!isOpenRouter) body.response_format = { type: 'json_object' };
  const data = await postJSON(url, headers, body, label, cfg.model);
  return data.choices?.[0]?.message?.content ?? '';
}

async function callGemini(cfg, chat, label) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(cfg.model)}:generateContent`;
  const data = await postJSON(
    url,
    { 'x-goog-api-key': cfg.key },
    {
      systemInstruction: { parts: [{ text: chat.system }] },
      contents: [{ role: 'user', parts: [{ text: chat.user }] }],
      generationConfig: { responseMimeType: 'application/json' },
    },
    label,
    cfg.model,
  );
  if (data.promptFeedback?.blockReason) throw new AIError('Gemini a bloqué ce message. Reformule-le.');
  return (data.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? '').join('');
}

// Claude : SDK officiel d'Anthropic, chargé seulement si le joueur choisit Claude.
let anthropicModule = null;
const CLAUDE_FALLBACK_MODELS = ['claude-opus-5-5', 'claude-sonnet-5-5'];
const CLAUDE_EFFORT_MODELS = ['claude-opus-5-5', 'claude-sonnet-5-5', 'claude-haiku-5-5'];

async function callClaude(cfg, chat, label, kind) {
  anthropicModule ??= import('../vendor/anthropic-sdk.js');
  const { default: Anthropic } = await anthropicModule;
  const client = new Anthropic({ apiKey: cfg.key, dangerouslyAllowBrowser: true, maxRetries: 1 });
  const params = {
    model: cfg.model,
    max_tokens: 16000,
    system: chat.system,
    messages: [{ role: 'user', content: chat.user }],
  };
  // Réponses du prospect : effort bas pour rester rapide. Débrief : un peu plus de réflexion.
  if (CLAUDE_EFFORT_MODELS.includes(cfg.model)) params.output_config = { effort: kind === 'turn' ? 'low' : 'medium' };

  let response;
  try {
    response = CLAUDE_FALLBACK_MODELS.includes(cfg.model)
      ? // Si le modèle décline une demande, un autre modèle prend le relais.
        await client.beta.messages.create({ ...params, betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' })
      : await client.messages.create(params);
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError)
      throw httpError(401, label, cfg.model);
    if (error instanceof Anthropic.NotFoundError) throw httpError(404, label, cfg.model);
    if (error instanceof Anthropic.RateLimitError) throw httpError(429, label, cfg.model, error.message);
    if (error instanceof Anthropic.APIConnectionError) throw new AIError(`Impossible de joindre ${label}. Vérifie ta connexion internet.`);
    if (error instanceof Anthropic.APIError) throw httpError(error.status ?? 500, label, cfg.model, error.message);
    throw error;
  }
  if (response.stop_reason === 'refusal') throw new AIError('Claude a refusé de répondre à ce message. Reformule-le.');
  return response.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('');
}

async function ask(cfg, messages, kind) {
  const provider = PROVIDERS[cfg.provider];
  const label = provider.label;
  const chat = toChat(messages, kind);
  let text;
  if (cfg.provider === 'gemini') text = await callGemini(cfg, chat, label);
  else if (cfg.provider === 'anthropic') text = await callClaude(cfg, chat, label, kind);
  else text = await callOpenAICompatible(cfg, chat, label);
  return parseJSON(text);
}

/* ---------- Test de connexion ---------- */
export async function testConfig(cfg) {
  const messages = [
    { role: 'system', content: 'Tu vérifies une connexion. Réponds uniquement avec l’objet JSON {"ok": true}.' },
    { role: 'user', content: 'Test de connexion.' },
  ];
  const out = await ask(cfg, messages, 'test');
  if (!out || out.ok !== true) throw new AIError('L’IA répond, mais pas dans le format attendu. Essaie un autre modèle.');
  return true;
}

/* ---------- Connexion OpenRouter (OAuth PKCE, sans copier de clé) ---------- */
const b64url = (bytes) =>
  btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

export async function connectOpenRouter() {
  const verifier = b64url(crypto.getRandomValues(new Uint8Array(32)));
  const challenge = b64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)));
  try {
    localStorage.setItem(VERIFIER_KEY, verifier);
  } catch {
    throw new Error('Impossible de lancer la connexion sur cet appareil (navigation privée ?).');
  }
  const callback = location.origin + location.pathname;
  location.href = `https://openrouter.ai/auth?callback_url=${encodeURIComponent(callback)}&code_challenge=${challenge}&code_challenge_method=S256`;
}

// Au retour d'OpenRouter, l'adresse contient ?code=… : on l'échange contre une clé.
export async function finishOpenRouterLogin() {
  const params = new URLSearchParams(location.search);
  const code = params.get('code');
  if (!code) return null;
  history.replaceState(null, '', location.pathname + location.hash);
  let verifier = null;
  try {
    verifier = localStorage.getItem(VERIFIER_KEY);
    localStorage.removeItem(VERIFIER_KEY);
  } catch {
    /* rien */
  }
  if (!verifier) throw new AIError('La connexion OpenRouter a expiré. Relance-la depuis « Mon IA ».');
  const data = await postJSON(
    'https://openrouter.ai/api/v1/auth/keys',
    {},
    { code, code_verifier: verifier, code_challenge_method: 'S256' },
    'OpenRouter',
    '',
  );
  if (!data.key) throw new AIError('OpenRouter n’a pas renvoyé de clé. Relance la connexion.');
  const cfg = { provider: 'openrouter', key: data.key, model: PROVIDERS.openrouter.models[0][0] };
  saveConfig(cfg);
  return cfg;
}

/* ---------- Branchement sur le jeu ---------- */
window.sellmeAI = { PROVIDERS, getConfig, saveConfig, clearConfig, testConfig, connectOpenRouter, finishOpenRouterLogin };

window.sellmeBackend = async (path, body) => {
  if (path === '/api/scenarios') return listScenarios();
  const cfg = getConfig();
  if (!cfg) throw new AIError('Connecte d’abord ton IA dans « Mon IA » pour jouer.');
  const askWith = (messages, kind) => ask(cfg, messages, kind);
  if (path === '/api/turn') return playTurn(body, askWith);
  if (path === '/api/debrief') return makeDebrief(body, askWith);
  throw new Error('Action inconnue');
};
