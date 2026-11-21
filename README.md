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

## Chaque joueur branche son IA

Sellme n'a pas d'IA à lui : dans **Mon IA**, chaque joueur connecte la sienne.

| IA | Connexion | Coût pour le joueur |
|---|---|---|
| Gemini (Google) | Clé API d'AI Studio | Gratuit pour commencer |
| ChatGPT (OpenAI) | Clé API de platform.openai.com | Environ 1 centime par partie |
| Claude (Anthropic) | Clé API de console.anthropic.com | Selon le modèle choisi |
| OpenRouter (toutes les IA) | Bouton « Se connecter », sans copier de clé | Selon le modèle |

Un abonnement ChatGPT Plus ou Claude Pro ne peut pas être utilisé par une autre application :
il faut une clé API, facturée à part et à l'usage.

La clé reste dans le navigateur du joueur et n'est envoyée qu'au fournisseur choisi.

## Lancer le jeu

Il faut **Node.js 22 ou plus**. Aucune clé n'est nécessaire côté serveur.

```bash
npm start   # puis ouvre http://localhost:3000 et va dans « Mon IA »
```

Pour mettre le jeu en ligne (Vercel) et sur le Play Store : voir **[DEPLOIEMENT.md](DEPLOIEMENT.md)**.

### Version claude.ai

Sellme existe aussi en page claude.ai : Claude y fait parler les prospects sur le compte du
joueur, sans clé. `npm run build:artifact` génère `dist/sellme.html`, la page à publier.

## Organisation du code

```
public/                 Le site, publié tel quel
  index.html, style.css, app.js   Interface du jeu
  js/scenarios.js       Les missions : produit, prospect, besoins cachés, objections…
  js/prompts.js         Les consignes données à l'IA (prospect et coach)
  js/engine.js          Moteur : confiance, victoire, notation
  js/ai.js              « Mon IA » : fournisseurs, clés, connexion OpenRouter
  js/claude-backend.js  Version claude.ai (remplace ai.js)
  vendor/anthropic-sdk.js  SDK officiel d'Anthropic pour le navigateur (npm run vendor)
  manifest.webmanifest, sw.js, icons/   Appli installable
scripts/dev-server.mjs  Petit serveur local de développement (npm start)
scripts/                Aussi : assemblage de la version claude.ai, préparation du SDK
```

### Ajouter une mission

Ajoute un objet dans `SCENARIOS` (`public/js/scenarios.js`) en suivant le modèle des
missions existantes : canal, produit, offre à envoyer (`offer`), prospect, premier
message, besoins cachés, objections, déclencheurs d'achat et seuil de confiance (`winTrust`).

## Pistes pour la suite

- 📞 Mode appel vocal (s'entraîner à l'oral comme au téléphone)
- 🏅 Trophées et défis du jour
- 📚 Mode « Histoire » sans IA, avec des réponses à choisir
- 🏆 Comptes joueurs et classement
- 🏭 Packs de missions par secteur (immobilier, SaaS B2B, retail…)
- 🧑‍🏫 Mode équipe pour les managers commerciaux
