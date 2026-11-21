// Appel au modèle de langage. OpenAI par défaut, Gemini possible via son
// point d'accès compatible OpenAI. Aucune dépendance : on utilise fetch.

const PROVIDERS = {
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    keyVar: 'OPENAI_API_KEY',
    defaultModel: 'gpt-5.4-mini',
  },
  gemini: {
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    keyVar: 'GEMINI_API_KEY',
    defaultModel: 'gemini-2.5-flash',
  },
};

export function llmConfig() {
  const name = (process.env.LLM_PROVIDER || 'openai').toLowerCase();
  const provider = PROVIDERS[name];
  if (!provider) throw new Error(`LLM_PROVIDER inconnu : ${name} (openai ou gemini)`);
  return {
    name,
    baseUrl: process.env.LLM_BASE_URL || provider.baseUrl,
    apiKey: process.env[provider.keyVar],
    keyVar: provider.keyVar,
    model: process.env.LLM_MODEL || provider.defaultModel,
  };
}

export async function chatJSON(messages) {
  const cfg = llmConfig();
  if (!cfg.apiKey) {
    throw new Error(`Clé API manquante : renseigne ${cfg.keyVar} dans le fichier .env`);
  }
  const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify({
      model: cfg.model,
      messages,
      response_format: { type: 'json_object' },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Erreur du modèle (${res.status}) : ${text.slice(0, 300)}`);
  }
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? '';
  try {
    return JSON.parse(content);
  } catch {
    // Certains modèles entourent le JSON de ```json … ```
    const match = content.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Réponse du modèle illisible');
  }
}
