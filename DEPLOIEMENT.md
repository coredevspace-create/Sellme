# Mettre Sellme en ligne

Sellme est un **site statique** : pas de serveur, pas de base de données, pas de coût d'IA.
Chaque joueur connecte sa propre IA dans « Mon IA ». Tout se fait depuis un navigateur,
même sur téléphone.

---

## 1. Vercel (le site web)

1. Va sur **vercel.com** et connecte-toi avec ton compte GitHub.
2. **Add New → Project**, choisis le dépôt **Sellme**, puis **Import**.
3. Ne change aucun réglage : le fichier `vercel.json` dit déjà à Vercel de publier le dossier `public/`.
4. Appuie sur **Deploy**. Une minute plus tard, ton site est en ligne (ex. `sellme.vercel.app`).

Chaque modification poussée sur la branche principale est republiée automatiquement.

**Avant de publier pour de vrai**, ouvre `public/confidentialite.html` et remplace
`[À REMPLIR : ton adresse e-mail de contact]` par ton adresse.

**Nom de domaine** (facultatif) : dans le projet Vercel, **Settings → Domains**.

Pour tester : ouvre le site sur ton téléphone, va dans **Mon IA**, connecte Gemini
(gratuit) et lance une partie. Dans Chrome, **⋮ → Ajouter à l'écran d'accueil**
l'installe comme une appli.

---

## 2. Play Store (l'appli Android)

Sellme est une **PWA** (appli web installable). L'outil gratuit **PWABuilder** de Microsoft
la transforme en appli Android (format « Trusted Web Activity ») prête pour le Play Store.

### Ce qu'il te faut
- Le site en ligne sur Vercel (étape 1).
- Un **compte développeur Google Play** : 25 $ une seule fois, sur play.google.com/console.
  Pour un compte personnel récent, Google demande un **test fermé avec au moins 12 testeurs
  pendant 14 jours** avant la mise en production.

### Étapes
1. Va sur **pwabuilder.com**, colle l'adresse de ton site et lance l'analyse.
2. **Package for stores → Android → Generate Package**.
   - Package ID : par exemple `app.sellme.twa` (il ne pourra plus changer ensuite).
   - Garde la **clé de signature** que PWABuilder te donne (fichier + mots de passe) en lieu sûr :
     sans elle, tu ne pourras plus mettre l'appli à jour.
3. Dans le zip téléchargé, ouvre `assetlinks.json` : il contient ton Package ID et une empreinte SHA-256.
   Copie ces deux valeurs dans `public/.well-known/assetlinks.json` du dépôt, à la place des `A_REMPLIR`,
   puis pousse : Vercel republie. Ce fichier prouve que l'appli et le site t'appartiennent ;
   sans lui, une barre d'adresse s'affiche en haut de l'appli.
4. Dans la **Play Console** : crée l'appli, envoie le fichier `.aab` du zip, et remplis la fiche :
   - **Politique de confidentialité** : `https://ton-site/confidentialite.html`
   - **Sécurité des données** : aucune donnée collectée par l'appli ; les messages sont envoyés au
     fournisseur d'IA choisi par le joueur, avec sa propre clé.
   - **Captures d'écran**, icône (`public/icons/icon-512.png`), description.
5. Si Google Play signe l'appli à ta place (« Play App Signing », activé par défaut), il te donne une
   **seconde empreinte SHA-256** (Play Console → Configuration → Intégrité de l'appli).
   Ajoute-la aussi dans `assetlinks.json`, dans la liste `sha256_cert_fingerprints`.

---

## Ce qui est dans le dépôt pour ça

| Fichier | Rôle |
|---|---|
| `vercel.json` | Publie `public/` sur Vercel |
| `public/manifest.webmanifest` | Nom, couleurs et icônes de l'appli installable |
| `public/sw.js` | Démarrage rapide et menus disponibles hors ligne |
| `public/icons/` | Icônes 192 et 512 px, dont une version adaptée aux formes d'icônes Android |
| `public/confidentialite.html` | Politique de confidentialité exigée par le Play Store |
| `public/.well-known/assetlinks.json` | Lien entre l'appli Android et le site (à compléter) |
