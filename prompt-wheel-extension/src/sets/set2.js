/* Jeu 2 — Démos concrètes : prompts autonomes, situation incluse, rien à préparer.
   Seules exceptions : Documents (pièce jointe) et un [ville] dans Recherche. */
window.PW_SET_2 = {
  name: "Démos concrètes",
  categories: [
    {
      name: "Courriers", short: "Courriers", icon: "📬", color: "#5B6CFF",
      items: [
        { num: 1, title: "Rappel de rendez-vous",
          text: "Rédige un SMS et un mail court pour rappeler à une personne son rendez-vous d'accompagnement du jeudi 14h dans nos locaux. Elle doit apporter sa carte d'identité. Ton respectueux, phrases courtes, pas de jargon. Termine le mail par un numéro à appeler en cas d'empêchement : [NUMÉRO]." },
        { num: 2, title: "Candidature non retenue",
          text: "Rédige un courrier annonçant à une personne que sa candidature à notre formation n'est pas retenue : le groupe est complet, elle est placée en liste d'attente et sera recontactée si une place se libère. Ton humain, 150 mots maximum, sans formule creuse. Propose une phrase concrète sur ce qu'elle peut faire en attendant." },
        { num: 3, title: "Convocation à un entretien",
          text: "Rédige une convocation à un entretien de sélection pour une formation d'aide-ménagère. Précise : date et heure à compléter, durée d'une heure, ce qu'il faut apporter (carte d'identité, CV même incomplet), et rassure sur le fait qu'il ne s'agit pas d'un examen. Niveau de langue simple." },
        { num: 4, title: "Attestation de présence",
          text: "Rédige un modèle d'attestation de présence en formation, avec les mentions indispensables (organisme, personne, intitulé de la formation, période, nombre d'heures, date, signature) et des champs [À COMPLÉTER] partout où l'information est variable. Format court, prêt à imprimer." },
        { num: 5, title: "Relance après absence",
          text: "Rédige un message à une personne absente depuis deux séances, sans l'accabler. Objectif : reprendre contact, comprendre ce qui bloque et proposer un rendez-vous. Trois phrases maximum, ton chaleureux, une seule question à la fin." },
        { num: 6, title: "Courrier au CPAS",
          text: "Rédige un courrier au CPAS pour appuyer la demande d'une personne que nous accompagnons : elle suit assidûment notre formation et un soutien pour ses frais de déplacement conditionne la poursuite de son parcours. Ton factuel et respectueux, 200 mots maximum, champs [À COMPLÉTER] pour les données personnelles." }
      ]
    },
    {
      name: "Atelier", short: "Atelier", icon: "🎪", color: "#00B4D8",
      items: [
        { num: 1, title: "Séquence CV de 3 heures",
          text: "Prépare une séquence d'atelier CV de 3 heures pour 10 adultes en insertion, dont plusieurs écrivent difficilement. Donne : l'objectif, le matériel, le déroulé minute par minute avec les pauses, les consignes à lire telles quelles, et deux variantes selon que le groupe avance vite ou lentement." },
        { num: 2, title: "Brise-glace groupe FLE",
          text: "Propose 5 brise-glace de 10 minutes pour un groupe d'adultes qui débutent en français (niveau A1), sans lecture ni écriture. Pour chacun : le but, la consigne en 2 phrases très simples, et ce que j'observe pour savoir si ça marche." },
        { num: 3, title: "Lire un horaire de bus",
          text: "Construis un exercice d'une demi-heure pour apprendre à lire un horaire de bus, pour des adultes de niveau A2. Invente un horaire fictif simple, écris 6 questions de difficulté croissante, puis donne le corrigé et les erreurs typiques à anticiper." },
        { num: 4, title: "Jeu de rôle entretien",
          text: "Écris un jeu de rôle d'entretien d'embauche pour un poste d'ouvrier polyvalent : une fiche pour la personne candidate, une fiche pour la personne qui joue le recruteur avec 6 questions, et une grille d'observation en 5 points pour le reste du groupe. Langue simple." },
        { num: 5, title: "Grille d'observation",
          text: "Construis une grille d'observation des acquis pour un module de 6 semaines en insertion : 8 critères observables (pas d'attitude jugée, uniquement des comportements visibles), une échelle à 3 niveaux, et une colonne pour les notes du formateur. Présente-la en tableau." },
        { num: 6, title: "Évaluation de fin de module",
          text: "Prépare une évaluation de fin de module en deux parties : un questionnaire de 8 questions pour les participants (français facile, avec des cases à cocher) et une grille d'auto-évaluation du formateur en 6 points. Objectif : améliorer le module suivant, pas noter les gens." }
      ]
    },
    {
      name: "Accompagner", short: "Accompagner", icon: "🤝", color: "#F4A261",
      items: [
        { num: 1, title: "Reconversion à 52 ans",
          text: "Un ancien maçon de 52 ans, dos abîmé, ne peut plus travailler sur chantier. Il a un permis B et 30 ans de métier. Propose 6 pistes de reconversion réalistes en Belgique, avec pour chacune : ce qu'il fait déjà bien et qui sert, ce qu'il doit apprendre, et la première démarche concrète de cette semaine." },
        { num: 2, title: "Après trois refus",
          text: "Une personne que j'accompagne vient d'essuyer un troisième refus et veut tout arrêter. Prépare-moi un entretien de 30 minutes : par quoi commencer, 6 questions ouvertes à poser dans l'ordre, ce qu'il ne faut surtout pas dire, et deux façons de terminer sur une action concrète et atteignable." },
        { num: 3, title: "Préparer une rencontre employeur",
          text: "Prépare une personne à rencontrer un employeur pour un poste d'aide-ménagère. Donne : 8 questions probables avec une trame de réponse en français simple, 3 questions qu'elle peut poser, et ce qu'elle doit préparer matériellement la veille." },
        { num: 4, title: "Expliquer un PFI / IBO",
          text: "Explique en français facile (niveau A2) ce qu'est une formation en entreprise de type PFI / IBO : qui paie quoi, combien de temps ça dure, ce que la personne s'engage à faire, ce qui se passe après, et les 3 pièges à connaître. Une idée par phrase, pas de sigle non expliqué." },
        { num: 5, title: "Questions ouvertes",
          text: "Donne-moi 20 questions ouvertes utiles en entretien d'accompagnement, classées en 4 moments : créer le lien, explorer le parcours, faire émerger le projet, poser une action. Pour chacune, précise en 5 mots ce qu'elle permet d'obtenir." },
        { num: 6, title: "Reformuler un projet flou",
          text: "Une personne me dit : \"Je voudrais travailler dans le social, aider les gens, mais je sais pas trop.\" Propose-moi une manière de reformuler ce projet avec elle : 3 hypothèses de métiers concrets, les questions qui permettent de trancher, et une mise en situation d'une heure pour la mettre à l'épreuve du réel." }
      ]
    },
    {
      name: "Documents", short: "Documents", icon: "📄", color: "#2A9D8F",
      items: [
        { num: 1, title: "Résumer un courrier administratif",
          text: "[Joindre le PDF] Lis ce document administratif et donne-moi : 1) de quoi il s'agit en une phrase, 2) ce que la personne doit faire, 3) pour quand, 4) ce qui se passe si elle ne le fait pas. Français facile, niveau A2. Si une information manque dans le document, dis-le au lieu de la deviner." },
        { num: 2, title: "Repérer l'action et l'échéance",
          text: "[Joindre le PDF] Dans ce courrier, repère uniquement : la ou les actions demandées, la date limite de chacune, et les documents à fournir. Présente ça en tableau à 3 colonnes. N'ajoute aucun commentaire. Si une date est absente, écris \"non précisé\"." },
        { num: 3, title: "Expliquer une lettre photographiée",
          text: "[Joindre la photo] Lis cette lettre et explique-la à quelqu'un qui apprend le français depuis un an. Phrases courtes, une idée par phrase, pas de mot administratif sans explication. Termine par : \"Ce que vous devez faire maintenant : …\"." },
        { num: 4, title: "Offre d'emploi en fiche simple",
          text: "[Joindre le PDF] Transforme cette offre d'emploi en fiche simple d'une page : le métier en une phrase, les tâches concrètes, les horaires, ce qui est vraiment obligatoire, ce qui est souhaité, et 3 questions à poser à l'employeur. Français facile." },
        { num: 5, title: "Liste des pièces à fournir",
          text: "[Joindre le PDF] Sors de ce dossier la liste exacte des pièces à fournir, sous forme de check-list à cocher, avec pour chaque pièce où la personne peut l'obtenir en Belgique. Si le document ne le précise pas, écris \"à vérifier\" plutôt que d'inventer." },
        { num: 6, title: "Horaire photographié en tableau",
          text: "[Joindre la photo] Transforme cet horaire en tableau clair (jour, heure de début, heure de fin, lieu). Ne corrige rien, ne complète rien : si une case est illisible, écris \"illisible\" et dis-moi laquelle." }
      ]
    },
    {
      name: "Recherche", short: "Recherche", icon: "🔍", color: "#E63946",
      items: [
        { num: 1, title: "S'inscrire comme demandeur d'emploi",
          text: "Quelles sont les démarches pour s'inscrire comme demandeur d'emploi en Belgique ? Donne les étapes dans l'ordre, l'organisme compétent selon la région, les documents nécessaires et les délais. Cite tes sources officielles avec leur date, et termine par : \"Ce que vous devez vérifier vous-même : …\"." },
        { num: 2, title: "Revenu d'intégration",
          text: "Explique les conditions d'accès au revenu d'intégration sociale en Belgique, la procédure de demande et les délais habituels. Cite tes sources officielles avec leur date. Signale explicitement ce qui a pu changer récemment et que je dois vérifier avant d'en parler à un groupe." },
        { num: 3, title: "Diplôme étranger",
          text: "Quelle est la procédure pour faire reconnaître un diplôme étranger en Fédération Wallonie-Bruxelles ? Donne les étapes dans l'ordre, le coût, le délai habituel et le lien officiel. Cite tes sources avec leur date et dis-moi ce que je dois vérifier." },
        { num: 4, title: "Garde d'enfants en formation",
          text: "Quelles solutions de garde d'enfants existent pour une personne qui entre en formation en Belgique, et quelles aides financières peuvent les couvrir ? Donne les dispositifs, à qui s'adresser, et les conditions. Sources officielles datées, et liste de ce que je dois vérifier localement." },
        { num: 5, title: "Chômage, CPAS, mutuelle",
          text: "Explique la différence entre le chômage, le CPAS et la mutuelle en Belgique à quelqu'un qui débute en français : qui paie quoi, dans quelle situation, et à qui s'adresser. Phrases courtes, une idée par phrase. Cite tes sources officielles datées et signale ce qui doit être vérifié." },
        { num: 6, title: "Sorties culturelles",
          text: "Quelles sorties culturelles gratuites ou à très bas prix sont accessibles à [ville] pour un groupe d'adultes en formation ? Donne le nom, l'adresse, le tarif, et comment réserver pour un groupe. Cite tes sources avec leur date et préviens-moi que les tarifs et horaires doivent être confirmés par téléphone." }
      ]
    },
    {
      name: "Quotidien", short: "Quotidien", icon: "🌍", color: "#3D405B",
      items: [
        { num: 1, title: "Lire une fiche de paie",
          text: "Explique une fiche de paie belge à quelqu'un qui n'en a jamais vu : brut, net, cotisations, précompte. Invente un exemple chiffré simple et commente-le ligne par ligne. Français facile, une idée par phrase, et termine par les 3 lignes à vérifier chaque mois." },
        { num: 2, title: "Comprendre un bail",
          text: "Explique en français facile ce qu'une personne signe quand elle signe un bail en Belgique : durée, garantie locative, état des lieux, indexation, préavis. Termine par 5 questions à poser au propriétaire avant de signer et 3 signaux qui doivent alerter." },
        { num: 3, title: "Prendre rendez-vous chez le médecin",
          text: "Écris un dialogue simple de prise de rendez-vous téléphonique chez un médecin, niveau A2, avec les phrases exactes à dire de chaque côté. Puis donne la liste des 8 phrases utiles à retenir, et une variante pour dire qu'on ne comprend pas et demander de répéter." },
        { num: 4, title: "Les transports en commun",
          text: "Explique comment utiliser les transports en commun en Belgique à quelqu'un qui arrive : acheter un titre de transport, le valider, lire un plan, les abonnements avantageux, ce qui se passe en cas de contrôle sans titre. Français facile, une idée par phrase." },
        { num: 5, title: "Ouvrir un compte bancaire",
          text: "Explique comment ouvrir un compte bancaire en Belgique : les documents à apporter, ce qu'est un service bancaire de base, ce qu'on peut refuser de signer, et les frais à surveiller. Français facile. Signale ce qui doit être vérifié auprès de la banque." },
        { num: 6, title: "Comprendre une facture d'énergie",
          text: "Explique une facture d'énergie belge : acompte, décompte annuel, index, tarif social. Invente un exemple chiffré simple. Termine par : que faire quand on ne sait pas payer, et à qui s'adresser. Français facile." },
        { num: 7, title: "Remplir un formulaire",
          text: "Donne-moi les 20 mots et expressions qui reviennent le plus souvent dans les formulaires administratifs belges, avec pour chacun une explication en une phrase très simple et un exemple de ce qu'on écrit dans la case." }
      ]
    },
    { name: "Construire", short: "Construire", icon: "🧩", color: "#8B5CF6", kind: "builder", items: [] }
  ]
};
