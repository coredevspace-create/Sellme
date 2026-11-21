// Scénarios de vente. Tout ce qui est dans `hidden` reste côté serveur :
// le joueur doit le découvrir en posant les bonnes questions.

export const SCENARIOS = [
  {
    id: 'fleuriste',
    level: 1,
    title: 'Le premier café',
    difficulty: 'Facile',
    skillFocus: 'Découverte des besoins',
    maxTurns: 12,
    startTrust: 50,
    winTrust: 70,
    product: {
      name: 'RésaPro',
      pitch: 'Prise de commande en ligne + click & collect pour commerçants.',
      price: '39 €/mois, sans engagement, mise en place offerte',
      features: [
        'Page de commande en ligne personnalisée',
        'Paiement à la commande (fini les oublis)',
        'Rappels SMS automatiques aux clients',
        'Tableau des commandes du jour sur tablette',
      ],
    },
    prospect: {
      name: 'Sophie Martin',
      role: 'Gérante',
      company: 'Les Jardins de Sophie, fleuriste à Lyon',
      avatar: '🌷',
      publicMood: 'Souriante et curieuse, mais pas très à l’aise avec l’informatique.',
    },
    mission:
      'Sophie t’a accordé 15 minutes entre deux livraisons. Découvre ce qui la gêne au quotidien, puis montre-lui comment RésaPro peut l’aider. Objectif : qu’elle accepte de tester RésaPro.',
    opening:
      'Bonjour ! Installez-vous, je finis juste ce bouquet… Alors, vous m’avez dit au téléphone que vous aviez un truc pour les commerçants ?',
    hidden: {
      personality:
        'Chaleureuse, bavarde, passionnée par son métier. Elle se méfie un peu de la technologie car elle se trouve « nulle en informatique ». Elle apprécie qu’on s’intéresse à sa boutique et à ses clients.',
      pains: [
        { id: 'p1', text: 'Elle perd des commandes : le téléphone sonne pendant qu’elle sert des clients et elle ne peut pas décrocher.' },
        { id: 'p2', text: 'Pendant la Saint-Valentin et la Fête des mères, c’est le chaos : commandes notées sur des post-it, certaines oubliées.' },
        { id: 'p3', text: 'Des clients ne viennent pas chercher leur bouquet déjà préparé (fleurs perdues, environ 300 € par mois).' },
      ],
      budget: 'Elle peut mettre 50 €/mois maximum si elle voit que ça lui fait gagner de l’argent.',
      objections: [
        '« Je ne suis vraiment pas douée avec l’informatique. »',
        '« Mes clients aiment bien m’appeler, c’est plus humain. »',
      ],
      buyingTriggers:
        'Elle est convaincue si on lui montre que c’est simple, que ça règle les oublis et les bouquets non récupérés, et qu’on lui propose de l’accompagner pour la mise en place.',
      dealbreakers: 'Un jargon technique incompréhensible, un vendeur qui parle sans l’écouter.',
      soncas: 'Sympathie et Sécurité',
    },
  },
  {
    id: 'boulanger',
    level: 2,
    title: 'Pas le temps !',
    difficulty: 'Moyen',
    skillFocus: 'Capter l’attention et lever la méfiance',
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
    prospect: {
      name: 'Karim Benali',
      role: 'Artisan boulanger',
      company: 'Maison Benali, 2 boulangeries à Marseille',
      avatar: '🥖',
      publicMood: 'Pressé, les mains pleines de farine. Il ne t’a pas vraiment invité.',
    },
    mission:
      'Tu passes à la boulangerie de Karim sans rendez-vous. Il est occupé et méfiant envers les commerciaux. Capte son attention, gagne sa confiance et obtiens un vrai rendez-vous ou une démonstration.',
    opening:
      'Ouais, bonjour… Écoutez, j’ai une fournée dans 5 minutes. Vous vendez quoi ?',
    hidden: {
      personality:
        'Direct, impatient, travailleur acharné. Il s’est fait avoir il y a 2 ans par un vendeur de terminal de paiement (engagement de 48 mois caché dans le contrat). Il déteste les pitchs récités et les longs discours. Il respecte ceux qui vont droit au but et qui connaissent son métier.',
      pains: [
        { id: 'p1', text: 'Il passe 2 soirées par semaine à faire de la paperasse et à préparer les documents pour son comptable.' },
        { id: 'p2', text: 'Il a des écarts de caisse inexpliqués dans sa 2e boutique, gérée par un employé.' },
        { id: 'p3', text: 'Il jette trop d’invendus le soir car il ne sait pas précisément ce qui se vend à quelle heure.' },
      ],
      budget: 'Il dépense déjà 60 €/mois pour une vieille caisse. Il peut monter si le gain de temps est réel.',
      objections: [
        '« J’ai déjà un comptable, il s’occupe de tout. »',
        '« C’est quoi l’engagement ? Je me suis déjà fait avoir. »',
        '« J’ai pas le temps pour ça. »',
      ],
      buyingTriggers:
        'Il s’intéresse si le vendeur est bref, parle de son temps perdu le soir ou de sa 2e boutique, et reste transparent sur l’engagement. Il accepte une démo un jour de fermeture (lundi).',
      dealbreakers: 'Un monologue de plus de 3 phrases au début, cacher ou minimiser l’engagement, insister lourdement.',
      soncas: 'Sécurité et Argent',
    },
  },
  {
    id: 'daf',
    level: 3,
    title: 'Le mur du prix',
    difficulty: 'Difficile',
    skillFocus: 'Traiter l’objection prix et prouver le ROI',
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
    prospect: {
      name: 'Claire Delcourt',
      role: 'Directrice administrative et financière',
      company: 'Métallerie Delcourt & Fils, 120 salariés',
      avatar: '📊',
      publicMood: 'Polie, très rationnelle. Elle a déjà ton devis sous les yeux.',
    },
    mission:
      'Claire a reçu ton devis et a accepté un rendez-vous. Elle trouve l’offre trop chère. Comprends ses vrais enjeux, justifie la valeur et obtiens un accord ou un pilote.',
    opening:
      'Bonjour. Je vais être directe : j’ai lu votre proposition, 2 400 € par mois, c’est beaucoup trop. Un concurrent m’en propose 1 700. Convainquez-moi.',
    hidden: {
      personality:
        'Rationnelle, exigeante, raisonne en chiffres et en risques. Elle respecte les vendeurs qui posent des questions intelligentes et ne baissent pas leur prix au premier coup. Elle se méfie des discours qui jouent sur la peur sans chiffres.',
      pains: [
        { id: 'p1', text: 'Un concurrent local a subi un rançongiciel l’an dernier : 3 semaines d’arrêt de production, environ 400 000 € de pertes.' },
        { id: 'p2', text: 'Son assureur exige des mesures de cybersécurité prouvées avant le renouvellement du contrat dans 3 mois.' },
        { id: 'p3', text: 'Le service informatique, c’est une seule personne débordée, qui ne peut pas surveiller la nuit ni le week-end.' },
      ],
      budget: 'Budget prévu : 2 000 €/mois. Elle peut aller jusqu’à 2 400 € si le ROI et les garanties sont clairs.',
      objections: [
        '« C’est trop cher, le concurrent est à 1 700 €. »',
        '« On a déjà un antivirus et un pare-feu. »',
        '« 24 mois d’engagement, c’est long. »',
      ],
      buyingTriggers:
        'Elle avance si le vendeur fait le lien entre le prix et le coût d’un arrêt de production, répond à l’exigence de l’assureur, différencie l’offre du concurrent (surveillance 24/7 humaine, intervention en 2 h) et propose une étape concrète (pilote de 3 mois, rendez-vous avec le dirigeant…).',
      dealbreakers: 'Baisser le prix immédiatement sans contrepartie, dénigrer le concurrent, rester flou.',
      soncas: 'Argent, Sécurité et Orgueil (elle veut prendre la bonne décision devant son patron)',
    },
  },
  {
    id: 'acheteur',
    level: 4,
    title: 'Le Dragon des achats',
    difficulty: 'Boss',
    skillFocus: 'Négociation et closing sous pression',
    maxTurns: 14,
    startTrust: 25,
    winTrust: 78,
    product: {
      name: 'PulseRetail',
      pitch: 'Programme de fidélité omnicanal (application + caisse) pour réseaux de magasins.',
      price: '60 000 €/an pour 40 magasins, intégration incluse',
      features: [
        'Carte de fidélité dématérialisée dans une application',
        'Offres personnalisées selon l’historique d’achat',
        'Connexion aux caisses existantes en 6 semaines',
        'Clients actuels : +12 % de fréquence d’achat en moyenne',
      ],
    },
    prospect: {
      name: 'Marc Vasseur',
      role: 'Directeur des achats',
      company: 'Groupe Maison & Déco, 40 magasins',
      avatar: '🐉',
      publicMood: 'Froid, bras croisés. On dit qu’il fait pleurer les commerciaux.',
    },
    mission:
      'Marc est le dernier obstacle avant la signature : le directeur marketing veut PulseRetail, mais c’est Marc qui tient le budget. Il va tester tes nerfs. Défends ta valeur, négocie intelligemment et obtiens son accord.',
    opening:
      '(Il regarde sa montre.) Vous avez 10 minutes. Votre concurrent me fait la même chose 40 % moins cher. Donc soit vous vous alignez, soit on arrête là.',
    hidden: {
      personality:
        'Négociateur dur, joue un rôle. Il bluffe : le concurrent est en réalité seulement 15 % moins cher et n’a pas de connexion aux caisses. Il utilise le silence, la pression du temps et la demande de remise. Il respecte les vendeurs qui restent calmes, posent des questions et donnent des contreparties. Il méprise ceux qui cèdent tout de suite.',
      pains: [
        { id: 'p1', text: 'La direction lui a fixé un objectif : augmenter la fréquence d’achat de 8 % cette année, et il sera jugé dessus.' },
        { id: 'p2', text: 'Le dernier projet logiciel du groupe a pris 9 mois de retard. Il ne veut surtout pas revivre ça.' },
        { id: 'p3', text: 'Il doit présenter un dossier solide au comité de direction dans 2 semaines.' },
      ],
      budget: 'Budget réel : 55 000 €/an. Il peut accepter 60 000 € avec des contreparties (pénalités de retard, paiement trimestriel, démarrage sur 10 magasins pilotes).',
      objections: [
        '« Votre concurrent est 40 % moins cher. »',
        '« Envoyez-moi une plaquette, je verrai. »',
        '« Je n’ai pas besoin de ça, mes clients sont déjà fidèles. »',
        '« Faites-moi une remise de 30 % et on signe aujourd’hui. »',
      ],
      buyingTriggers:
        'Il dit oui si le vendeur ne cède pas sans contrepartie, découvre son objectif de 8 % et sa peur du retard, propose des garanties (délais, pénalités, pilote), et fait une demande d’engagement claire.',
      dealbreakers: 'Accorder une grosse remise sans rien demander en échange, s’énerver, se justifier sans fin, laisser passer le bluff sans le questionner.',
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
