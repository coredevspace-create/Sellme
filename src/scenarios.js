// Missions de vente par messagerie. Tout ce qui est dans `hidden` reste côté
// serveur : le joueur doit le découvrir en posant les bonnes questions.
//
// `offer` est ce que le joueur envoie pour conclure (lien de paiement, contrat…).
// La vente n'est gagnée que si le prospect accepte cette offre.

export const SCENARIOS = [
  {
    id: 'fleuriste',
    level: 1,
    title: 'Le premier client',
    difficulty: 'Facile',
    skillFocus: 'Découverte des besoins',
    channel: 'Instagram',
    maxTurns: 12,
    startTrust: 50,
    winTrust: 70,
    product: {
      name: 'RésaPro',
      pitch: 'Prise de commande en ligne + click & collect pour commerçants.',
      price: '39 €/mois, sans engagement, 1 mois d’essai offert',
      features: [
        'Page de commande en ligne personnalisée',
        'Paiement à la commande (fini les oublis)',
        'Rappels SMS automatiques aux clients',
        'Mise en place faite avec le commerçant',
      ],
    },
    offer: { kind: 'trial', label: 'Lien d’essai gratuit', amount: '1 mois offert, puis 39 €/mois', commission: 40 },
    prospect: {
      name: 'Sophie Martin',
      role: 'Fleuriste',
      company: 'Les Jardins de Sophie, Lyon',
      avatar: '🌷',
      publicMood: 'Souriante et curieuse, mais pas très à l’aise avec l’informatique.',
    },
    context: 'Sophie a vu ta publicité RésaPro sur Instagram et t’envoie un message.',
    mission:
      'Découvre ce qui la gêne au quotidien, montre-lui comment RésaPro peut l’aider, puis envoie-lui le lien d’essai au bon moment.',
    opening: 'Bonjour ! J’ai vu votre pub pour RésaPro 🌷 C’est quoi exactement ? Je suis fleuriste, je sais pas si c’est pour moi',
    hidden: {
      personality:
        'Chaleureuse, bavarde, passionnée par son métier. Elle se trouve « nulle en informatique » et s’en méfie. Elle apprécie qu’on s’intéresse à sa boutique. Elle écrit avec quelques emojis.',
      pains: [
        { id: 'p1', text: 'Elle perd des commandes : le téléphone sonne pendant qu’elle sert des clients et elle ne peut pas décrocher.' },
        { id: 'p2', text: 'Pendant la Saint-Valentin et la Fête des mères, c’est le chaos : commandes sur des post-it, certaines oubliées.' },
        { id: 'p3', text: 'Des clients ne viennent pas chercher leur bouquet déjà préparé (environ 300 € de fleurs perdues par mois).' },
      ],
      budget: 'Elle peut mettre 50 €/mois maximum si elle voit que ça lui fait gagner de l’argent.',
      objections: ['« Je suis vraiment pas douée avec l’informatique. »', '« Mes clients aiment bien m’appeler, c’est plus humain. »'],
      buyingTriggers:
        'Elle accepte l’essai si on lui montre que c’est simple, que ça règle les oublis et les bouquets non récupérés, et qu’on l’accompagne pour la mise en place.',
      dealbreakers: 'Le jargon technique, un vendeur qui envoie le lien sans l’avoir écoutée.',
      soncas: 'Sympathie et Sécurité',
    },
  },
  {
    id: 'ecommerce',
    level: 2,
    title: 'Le rêve de l’indépendance',
    difficulty: 'Facile',
    skillFocus: 'Faire rêver et annoncer le prix',
    channel: 'Instagram',
    maxTurns: 12,
    startTrust: 45,
    winTrust: 72,
    product: {
      name: 'Boutique Express',
      pitch: 'Formation accompagnée pour lancer sa boutique en ligne en 60 jours.',
      price: '497 € (ou 3 × 166 €)',
      features: [
        '8 modules vidéo, de l’idée de produit à la première vente',
        '1 appel de groupe par semaine avec un coach',
        'Groupe d’entraide privé de 400 élèves',
        'Satisfait ou remboursé pendant 14 jours',
      ],
    },
    offer: { kind: 'payment', label: 'Lien de paiement', amount: '497 € ou 3 × 166 €', commission: 75 },
    prospect: {
      name: 'Inès Haddad',
      role: 'Assistante administrative, 26 ans',
      company: 'Bordeaux',
      avatar: '🛍️',
      publicMood: 'Motivée mais hésitante. Elle a répondu « INFO » sous une vidéo.',
    },
    context: 'Inès a commenté « INFO » sous ta vidéo sur la création de boutique en ligne. Elle t’écrit en privé.',
    mission:
      'Comprends son projet et ce qui la bloque, fais-lui imaginer sa vie dans 6 mois, annonce le prix avec assurance et envoie le lien de paiement quand elle est prête.',
    opening: 'Coucou ! J’ai vu ta vidéo sur la boutique en ligne 😍 ça m’intéresse grave mais je sais pas trop par où commencer',
    hidden: {
      personality:
        'Enthousiaste, rêveuse, mais échaudée. Elle écrit comme sur Instagram (tutoiement, emojis, phrases courtes). Elle a peur de se faire arnaquer et de rater encore.',
      pains: [
        { id: 'p1', text: 'Elle s’ennuie dans son travail et rêve de le quitter d’ici un an pour être indépendante.' },
        { id: 'p2', text: 'Elle a déjà essayé le dropshipping seule l’an dernier : elle a perdu 300 € en publicités sans aucune vente.' },
        { id: 'p3', text: 'Son copain pense que « ce sont des arnaques » et elle a peur de lui avouer un nouvel échec.' },
      ],
      budget: 'Elle a 600 € de côté. Elle préfère payer en 3 fois.',
      objections: [
        '« C’est pas une arnaque ton truc ? »',
        '« J’ai déjà essayé seule et ça a pas marché. »',
        '« Faut que j’en parle à mon copain. »',
        '« 497 € c’est beaucoup pour moi. »',
      ],
      buyingTriggers:
        'Elle achète si le vendeur la fait se projeter (sa vie sans son boulot actuel), explique pourquoi ce sera différent de son premier essai (accompagnement, coach, groupe), rassure avec la garantie 14 jours, propose le paiement en 3 fois et annonce le prix sans s’excuser.',
      dealbreakers: 'Pression du type « offre valable 1 heure », promesses de richesse rapide, prix annoncé de façon gênée ou flou.',
      soncas: 'Nouveauté, Sécurité et Confort',
    },
  },
  {
    id: 'boulanger',
    level: 3,
    title: 'Pas le temps !',
    difficulty: 'Moyen',
    skillFocus: 'Capter l’attention et lever la méfiance',
    channel: 'WhatsApp',
    maxTurns: 10,
    startTrust: 35,
    winTrust: 72,
    product: {
      name: 'CaissePlus',
      pitch: 'Logiciel de caisse multi-boutiques avec comptabilité automatisée.',
      price: '89 €/mois par boutique + 300 € d’installation, engagement 12 mois',
      features: [
        'Caisse tactile reliée entre plusieurs boutiques',
        'Export automatique vers le comptable',
        'Suivi des ventes et des invendus par produit et par heure',
        'Clôture de caisse en 2 minutes',
      ],
    },
    offer: { kind: 'booking', label: 'Lien de réservation de démo', amount: 'Démo gratuite de 30 min en boutique', commission: 60 },
    prospect: {
      name: 'Karim Benali',
      role: 'Artisan boulanger',
      company: 'Maison Benali, 2 boulangeries à Marseille',
      avatar: '🥖',
      publicMood: 'Pressé et méfiant envers les commerciaux.',
    },
    context: 'Un ami commerçant a donné ton numéro à Karim. Il t’écrit sur WhatsApp entre deux fournées.',
    mission:
      'Il n’a pas de temps à perdre. Sois bref, gagne sa confiance et fais-lui réserver une démonstration.',
    opening: 'Bonjour, c’est Karim, Hakim m’a donné votre numéro pour une caisse. J’ai 2 min. C’est quoi votre truc ?',
    hidden: {
      personality:
        'Direct, impatient, travailleur acharné. Il écrit court, sans emoji. Il s’est fait avoir il y a 2 ans par un vendeur de terminal de paiement (engagement de 48 mois caché). Il déteste les pavés de texte et respecte ceux qui vont droit au but.',
      pains: [
        { id: 'p1', text: 'Il passe 2 soirées par semaine à faire la paperasse pour son comptable.' },
        { id: 'p2', text: 'Il a des écarts de caisse inexpliqués dans sa 2e boutique, gérée par un employé.' },
        { id: 'p3', text: 'Il jette trop d’invendus le soir car il ne sait pas ce qui se vend à quelle heure.' },
      ],
      budget: 'Il paie déjà 60 €/mois pour une vieille caisse. Il peut monter si le gain de temps est réel.',
      objections: [
        '« J’ai déjà un comptable, il s’occupe de tout. »',
        '« C’est quoi l’engagement ? Je me suis déjà fait avoir. »',
        '« J’ai pas le temps pour ça. »',
      ],
      buyingTriggers:
        'Il réserve une démo si le vendeur est bref, parle de ses soirées perdues ou de sa 2e boutique, et reste transparent sur l’engagement. Il préfère le lundi (jour de fermeture).',
      dealbreakers: 'Un long message de présentation, cacher ou minimiser l’engagement, insister lourdement.',
      soncas: 'Sécurité et Argent',
    },
  },
  {
    id: 'coach',
    level: 4,
    title: '« Je dois réfléchir »',
    difficulty: 'Moyen',
    skillFocus: 'Traiter les objections cachées',
    channel: 'Instagram',
    maxTurns: 12,
    startTrust: 40,
    winTrust: 75,
    product: {
      name: 'Coach Rentable',
      pitch: 'Accompagnement de 3 mois pour les coachs sportifs qui veulent vendre en ligne.',
      price: '1 500 € (ou 3 × 500 €)',
      features: [
        '1 appel individuel par semaine pendant 12 semaines',
        'Création de son offre de coaching en ligne clé en main',
        'Modèles de messages et de contenus qui attirent des clients',
        'Garantie : 5 clients en ligne en 90 jours ou on continue gratuitement',
      ],
    },
    offer: { kind: 'payment', label: 'Lien de paiement', amount: '1 500 € ou 3 × 500 €', commission: 150 },
    prospect: {
      name: 'Yanis Morel',
      role: 'Coach sportif indépendant, 31 ans',
      company: 'Lille',
      avatar: '💪',
      publicMood: 'Intéressé mais prudent. Il a déjà acheté une formation qui ne l’a pas aidé.',
    },
    context: 'Yanis a téléchargé ton guide gratuit « 5 clients en ligne » et t’a répondu en DM.',
    mission:
      'Yanis va te dire qu’il doit réfléchir. Trouve la vraie raison derrière, aide-le à décider et conclus avec le lien de paiement.',
    opening: 'Salut, j’ai lu ton guide, il est cool 👍 Ton accompagnement ça coûte combien ?',
    hidden: {
      personality:
        'Sympathique, sportif, discipliné, mais blessé par un échec passé. Il demande le prix tout de suite pour se protéger. Il tutoie et écrit simplement.',
      pains: [
        { id: 'p1', text: 'Il plafonne à 2 500 €/mois en travaillant 60 heures par semaine en salle.' },
        { id: 'p2', text: 'Il a payé 900 € une formation en ligne l’an dernier : que des vidéos, aucun suivi, il n’a rien appliqué.' },
        { id: 'p3', text: 'Sa compagne attend leur premier enfant dans 5 mois : il veut moins travailler le soir avant la naissance.' },
      ],
      budget: 'Il a 2 000 € d’économies. Le paiement en 3 fois le soulage.',
      objections: [
        '« Je dois réfléchir. »',
        '« J’ai déjà acheté une formation, ça servait à rien. »',
        '« C’est cher. »',
      ],
      buyingTriggers:
        'Sa vraie objection est la peur de payer encore pour rien. Il achète si le vendeur ne donne pas le prix sans contexte, creuse son « je dois réfléchir » avec une question bienveillante, découvre la naissance à venir, montre la différence avec sa formation passée (suivi individuel, garantie) et lui demande clairement de s’engager.',
      dealbreakers: 'Donner le prix sèchement dès le début sans rien demander, accepter « je dois réfléchir » sans creuser, la pression ou la fausse urgence.',
      soncas: 'Sécurité et Confort',
    },
  },
  {
    id: 'daf',
    level: 5,
    title: 'Le mur du prix',
    difficulty: 'Difficile',
    skillFocus: 'Objection prix et retour sur investissement',
    channel: 'LinkedIn',
    maxTurns: 12,
    startTrust: 40,
    winTrust: 75,
    product: {
      name: 'ShieldOps',
      pitch: 'Cybersécurité managée pour PME : surveillance 24/7, sauvegardes, réponse aux incidents.',
      price: '2 400 €/mois pour 120 postes, engagement 24 mois',
      features: [
        'Centre de surveillance 24/7 avec experts français',
        'Sauvegardes externalisées testées chaque mois',
        'Intervention en moins de 2 h en cas d’attaque',
        'Rapports de conformité acceptés par les assureurs',
      ],
    },
    offer: { kind: 'contract', label: 'Bon de commande pilote', amount: 'Pilote de 3 mois : 7 200 €', commission: 360 },
    prospect: {
      name: 'Claire Delcourt',
      role: 'Directrice financière',
      company: 'Métallerie Delcourt & Fils, 120 salariés',
      avatar: '📊',
      publicMood: 'Polie, très rationnelle. Elle a lu ton devis.',
    },
    context: 'Tu as envoyé un devis à Claire la semaine dernière. Elle te répond sur LinkedIn.',
    mission:
      'Claire trouve l’offre trop chère. Comprends ses vrais enjeux, justifie la valeur sans brader ton prix et fais-lui signer un pilote.',
    opening: 'Bonjour. J’ai lu votre proposition. 2 400 € par mois, c’est beaucoup trop : un concurrent m’en propose 1 700. Qu’avez-vous à me dire ?',
    hidden: {
      personality:
        'Rationnelle, exigeante, raisonne en chiffres et en risques. Elle vouvoie et écrit de façon professionnelle, sans emoji. Elle respecte les vendeurs qui posent des questions intelligentes et ne baissent pas leur prix au premier coup.',
      pains: [
        { id: 'p1', text: 'Un concurrent local a subi un rançongiciel l’an dernier : 3 semaines d’arrêt, environ 400 000 € de pertes.' },
        { id: 'p2', text: 'Son assureur exige des mesures de cybersécurité prouvées avant le renouvellement du contrat dans 3 mois.' },
        { id: 'p3', text: 'Le service informatique, c’est une seule personne débordée, qui ne surveille ni la nuit ni le week-end.' },
      ],
      budget: 'Budget prévu : 2 000 €/mois. Elle peut aller jusqu’à 2 400 € si le ROI et les garanties sont clairs.',
      objections: [
        '« C’est trop cher, le concurrent est à 1 700 €. »',
        '« On a déjà un antivirus et un pare-feu. »',
        '« 24 mois d’engagement, c’est long. »',
      ],
      buyingTriggers:
        'Elle signe le pilote si le vendeur relie le prix au coût d’un arrêt de production, répond à l’exigence de l’assureur, différencie l’offre du concurrent (surveillance humaine 24/7, intervention en 2 h) sans le dénigrer, et propose le pilote de 3 mois comme étape raisonnable.',
      dealbreakers: 'Baisser le prix tout de suite sans contrepartie, dénigrer le concurrent, rester flou, jouer sur la peur sans chiffres.',
      soncas: 'Argent, Sécurité et Orgueil',
    },
  },
  {
    id: 'acheteur',
    level: 6,
    title: 'Le Dragon des achats',
    difficulty: 'Boss',
    skillFocus: 'Négociation et closing sous pression',
    channel: 'LinkedIn',
    maxTurns: 14,
    startTrust: 25,
    winTrust: 78,
    product: {
      name: 'PulseRetail',
      pitch: 'Programme de fidélité (application + caisse) pour réseaux de magasins.',
      price: '60 000 €/an pour 40 magasins, intégration incluse',
      features: [
        'Carte de fidélité dans une application mobile',
        'Offres personnalisées selon l’historique d’achat',
        'Connexion aux caisses existantes en 6 semaines',
        'Clients actuels : +12 % de fréquence d’achat en moyenne',
      ],
    },
    offer: { kind: 'contract', label: 'Contrat à signer', amount: '60 000 €/an', commission: 1200 },
    prospect: {
      name: 'Marc Vasseur',
      role: 'Directeur des achats',
      company: 'Groupe Maison & Déco, 40 magasins',
      avatar: '🐉',
      publicMood: 'Froid et cassant. On dit qu’il fait pleurer les commerciaux.',
    },
    context: 'Le directeur marketing veut PulseRetail, mais c’est Marc qui tient le budget. Il t’écrit sur LinkedIn.',
    mission:
      'Marc va tester tes nerfs. Défends ta valeur, négocie avec des contreparties et fais-lui signer le contrat.',
    opening: 'Votre concurrent me fait la même chose 40 % moins cher. Soit vous vous alignez, soit on arrête là. Vous avez 10 minutes.',
    hidden: {
      personality:
        'Négociateur dur qui joue un rôle. Il bluffe : le concurrent n’est que 15 % moins cher et ne se connecte pas aux caisses. Il écrit sec, vouvoie, utilise la pression du temps et les demandes de remise. Il respecte ceux qui restent calmes, posent des questions et demandent des contreparties. Il méprise ceux qui cèdent tout de suite.',
      pains: [
        { id: 'p1', text: 'La direction lui a fixé un objectif : +8 % de fréquence d’achat cette année. Il sera jugé dessus.' },
        { id: 'p2', text: 'Le dernier projet logiciel du groupe a pris 9 mois de retard. Il ne veut pas revivre ça.' },
        { id: 'p3', text: 'Il doit présenter un dossier solide au comité de direction dans 2 semaines.' },
      ],
      budget: 'Budget réel : 55 000 €/an. Il accepte 60 000 € avec des contreparties (pénalités de retard, paiement trimestriel, démarrage sur 10 magasins pilotes).',
      objections: [
        '« Votre concurrent est 40 % moins cher. »',
        '« Envoyez-moi une plaquette, je verrai. »',
        '« Mes clients sont déjà fidèles. »',
        '« Faites-moi 30 % de remise et on signe aujourd’hui. »',
      ],
      buyingTriggers:
        'Il signe si le vendeur ne cède pas sans contrepartie, questionne le bluff du concurrent, découvre l’objectif de 8 % et la peur du retard, propose des garanties (délais, pénalités, pilote) et demande clairement la signature.',
      dealbreakers: 'Une grosse remise sans rien demander en échange, s’énerver, se justifier sans fin, avaler le bluff sans le questionner.',
      soncas: 'Orgueil et Argent',
    },
  },
];

export function getScenario(id) {
  return SCENARIOS.find((s) => s.id === id);
}

// Version publique envoyée au navigateur : sans les informations cachées.
export function publicScenario(s) {
  const { hidden, ...rest } = s;
  return { ...rest, painCount: hidden.pains.length };
}
