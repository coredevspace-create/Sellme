# 🎯 Sellme : apprends à vendre en vendant

Sellme est un simulateur de vente **par messages privés**. Des prospects joués par
l'IA t'écrivent sur Instagram, WhatsApp ou LinkedIn. Chacun a sa personnalité,
**des besoins cachés** et ses objections. Gagne leur confiance, envoie ton lien au
bon moment… et encaisse ta commission.

## Comment on joue

1. **Choisis une mission**, ou lance un **prospect surprise** dont tu ne sais rien.
2. **Lis le briefing** : qui est le client, ce que tu vends, ce que tu dois lui faire accepter.
3. **Choisis ton mode** :
   - 🛟 **Avec aides** : jauge de confiance, conseil du coach après chaque message, phrases utiles ;
   - 🔥 **Sans filet** : aucune aide, +25 % d'XP.
4. **Échange par messages** dans une vraie interface de messagerie (« écrit… », « Vu »…).
   Les besoins cachés se débloquent quand tu poses les bonnes questions.
5. **Conclus avec le bouton +** : envoie le lien de paiement, d'essai, de démo ou le contrat.
   Le prospect accepte… ou refuse si c'est trop tôt, et tu perds de la confiance.
6. **Débrief** : note sur 7 compétences (cadre, découverte, écoute, faire rêver, annonce
   du prix, objections, closing), meilleur et pire message, ce que tu aurais pu écrire,
   et une technique à retenir.

Chaque partie rapporte de l'**XP** (7 niveaux, de Stagiaire à Légende de la vente) et,
si tu conclus, une **commission**. Il faut 1 ⭐ à une mission pour débloquer la suivante.

| # | Mission | Prospect | Canal | Ce qu'il faut obtenir |
|---|---------|----------|-------|-----------------------|
| 1 | Le premier client | Sophie, fleuriste | Instagram | Essai gratuit |
| 2 | Le rêve de l'indépendance | Inès, future e-commerçante | Instagram | Paiement de 497 € |
| 3 | Pas le temps ! | Karim, boulanger méfiant | WhatsApp | Réservation de démo |
| 4 | « Je dois réfléchir » | Yanis, coach sportif | Instagram | Paiement de 1 500 € |
| 5 | Le mur du prix | Claire, directrice financière | LinkedIn | Pilote de 7 200 € |
| 6 | Le Dragon des achats | Marc, acheteur redoutable | LinkedIn | Contrat de 60 000 €/an |

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
missions existantes : canal, produit, offre à envoyer (`offer`), prospect, premier
message, besoins cachés, objections, déclencheurs d'achat et seuil de confiance (`winTrust`).

## Pistes pour la suite

- 📞 Mode appel vocal (s'entraîner à l'oral comme au téléphone)
- 🏅 Trophées et défis du jour
- 📚 Mode « Histoire » sans IA, avec des réponses à choisir
- 🏆 Comptes joueurs et classement
- 🏭 Packs de missions par secteur (immobilier, SaaS B2B, retail…)
- 🧑‍🏫 Mode équipe pour les managers commerciaux
