# 🎯 Sellme : apprends à vendre en vendant

Sellme est un simulateur de rendez-vous de vente. Face à toi, des prospects joués
par l'IA, chacun avec sa personnalité, **des besoins cachés** et ses objections.
Pose les bonnes questions, gagne leur confiance et décroche la vente.

## Comment on joue

1. **Choisis une mission** : chaque prospect est plus difficile que le précédent.
2. **Lis le briefing** : qui est le client, ce que tu vends, ton objectif.
3. **Mène l'entretien** en écrivant tes répliques comme dans une vraie conversation.
   - La **jauge de confiance** monte ou descend selon la qualité de tes répliques.
   - Les **besoins cachés** se débloquent quand tu poses les bonnes questions.
   - Le **mode coach** t'explique en direct pourquoi la confiance a bougé.
4. **Conclus** : dépasse le seuil de confiance et demande un engagement clair.
5. **Débrief** : une note sur 5 compétences, ta meilleure et ta pire réplique,
   ce que tu aurais pu dire à la place, et une technique de vente à retenir.

Il faut au moins 1 ⭐ à une mission pour débloquer la suivante.

| # | Mission | Prospect | Compétence travaillée |
|---|---------|----------|-----------------------|
| 1 | Le premier café | Sophie, fleuriste | Découverte des besoins |
| 2 | Pas le temps ! | Karim, boulanger méfiant | Capter l'attention, lever la méfiance |
| 3 | Le mur du prix | Claire, directrice financière | Objection prix, retour sur investissement |
| 4 | Le Dragon des achats | Marc, acheteur redoutable | Négociation et closing sous pression |

## Lancer le jeu

Il faut **Node.js 22 ou plus** et une clé API OpenAI (ou Gemini). Aucune dépendance à installer.

```bash
cp .env.example .env      # puis colle ta clé dans OPENAI_API_KEY
npm start
```

Ouvre ensuite <http://localhost:3000>.

Pour utiliser Gemini : `LLM_PROVIDER=gemini` et `GEMINI_API_KEY=…` dans `.env`.
Le modèle se change avec `LLM_MODEL` (par défaut `gpt-5.4-mini`, rapide et économique).

## Organisation du code

```
server.js          Serveur HTTP : fichiers statiques + API (/api/scenarios, /api/turn, /api/debrief)
src/scenarios.js   Les missions : produit, prospect, besoins cachés, objections…
src/prompts.js     Les consignes données à l'IA (jeu du prospect et débrief du coach)
src/llm.js         Appel au modèle (OpenAI ou Gemini)
public/            L'interface du jeu (HTML, CSS, JavaScript)
```

Les informations cachées des prospects restent sur le serveur : le navigateur ne les reçoit pas.

### Ajouter une mission

Ajoute un objet dans `SCENARIOS` (`src/scenarios.js`) en suivant le modèle des
missions existantes : produit, prospect, phrase d'ouverture, besoins cachés,
objections, déclencheurs d'achat et seuil de confiance (`winTrust`).

## Pistes pour la suite

- 🎙️ Mode vocal (s'entraîner à l'oral comme au téléphone)
- 🏆 Comptes joueurs, classement, historique des parties
- 🏭 Packs de missions par secteur (immobilier, SaaS B2B, retail…)
- 🧑‍🏫 Mode équipe pour les managers commerciaux
