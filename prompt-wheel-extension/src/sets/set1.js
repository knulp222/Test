/* Jeu 1 — Mécanique & biais : comprendre comment l'outil fonctionne et où il dérape. */
globalThis.PW_SET_1 = {
  name: "Mécanique & biais",
  categories: [
    {
      name: "Mécanique", short: "Mécanique", icon: "⚙️", color: "#5B6CFF",
      items: [
        { num: 1, title: "Le mot suivant",
          text: "Explique-moi, en 10 lignes maximum et sans jargon, comment tu choisis le mot suivant quand tu écris une réponse. Termine par une phrase qui dit clairement ce que cela implique : tu ne \"sais\" pas, tu prédis." },
        { num: 2, title: "Deux réponses différentes",
          text: "Je vais te poser deux fois exactement la même question. Explique-moi d'abord pourquoi tes deux réponses ne seront probablement pas identiques, puis réponds à : \"Donne trois idées d'activité de brise-glace pour un groupe en alphabétisation.\"" },
        { num: 3, title: "Ce que tu ne sais pas",
          text: "Dis-moi jusqu'à quelle date vont tes connaissances, et donne-moi 5 exemples de questions que des formateurs me poseraient et pour lesquelles tu serais périmé ou incapable de répondre. Sois concret." },
        { num: 4, title: "Compter les lettres",
          text: "Combien de fois la lettre r apparaît-elle dans le mot \"serrurerie\" ? Donne ta réponse, puis explique pourquoi ce type de question est piégeux pour toi alors qu'un enfant de 8 ans y arrive." },
        { num: 5, title: "Calcul et confiance",
          text: "Calcule 17 % de 1 348 €, puis 1 348 € moins ce montant. Ensuite, dis-moi honnêtement à quel point je peux faire confiance à ce calcul et ce que je devrais vérifier moi-même." }
      ]
    },
    {
      name: "Transformer", short: "Transformer", icon: "🔄", color: "#00B4D8",
      items: [
        { num: 1, title: "Trois niveaux de langue",
          text: "Voici une phrase administrative : \"Vous êtes tenu de vous présenter muni des documents justificatifs requis sous peine de suspension du dossier.\"\n\nRéécris-la trois fois : 1) pour un collègue, 2) pour une personne qui parle français depuis un an, 3) pour quelqu'un qui débute en lecture. Numérote les trois versions." },
        { num: 2, title: "Du mail au SMS",
          text: "Transforme ce message en SMS de 2 phrases maximum, sans perdre la date, l'heure ni ce qu'il faut apporter :\n\n\"Bonjour, nous vous confirmons votre rendez-vous d'accompagnement individuel qui se tiendra le jeudi 14 mars à 14h00 dans nos locaux. Merci de vous munir de votre carte d'identité ainsi que de votre dernier document de l'ONEM.\"" },
        { num: 3, title: "Texte vers tableau",
          text: "Transforme ce paragraphe en tableau à 3 colonnes (Étape, Qui fait quoi, Quand) :\n\n\"La personne s'inscrit d'abord en ligne, puis nous la contactons dans les cinq jours pour fixer un entretien. Après l'entretien, le formateur référent valide l'entrée en formation et transmet le dossier au secrétariat, qui envoie la convocation deux semaines avant le démarrage.\"" },
        { num: 4, title: "Texte vers checklist",
          text: "Transforme ce texte en check-list de tâches concrètes, une ligne par action, à l'infinitif, sans doublon et dans l'ordre chronologique :\n\n\"Avant chaque démarrage de module il faut réserver la salle, préparer les supports, vérifier que tout le monde a signé la charte, commander les collations, prévenir l'accueil et imprimer les listes de présence.\"" },
        { num: 5, title: "Consigne orale vers écrite",
          text: "Voici une consigne que je donne à l'oral : \"Bon, vous prenez la fiche, vous regardez les offres, vous en choisissez deux qui vous parlent et vous notez pourquoi.\"\n\nÉcris-la sous forme de consigne écrite claire, numérotée, pour un groupe de niveau A2, avec un exemple de réponse attendue." }
      ]
    },
    {
      name: "Étages", short: "Étages", icon: "🪜", color: "#F4A261",
      items: [
        { num: 1, title: "Étage 1 — la demande vague",
          text: "Fais-moi un exercice sur le CV." },
        { num: 2, title: "Étage 2 — j'ajoute le contexte",
          text: "Fais-moi un exercice sur le CV pour un groupe de 8 personnes en formation d'insertion, qui n'ont jamais rédigé de CV et dont la moitié écrit difficilement le français." },
        { num: 3, title: "Étage 3 — j'ajoute le rôle et le public",
          text: "Tu es formateur en insertion socio-professionnelle depuis 15 ans. Prépare un exercice sur le CV pour un groupe de 8 adultes, jamais scolarisés au-delà du secondaire inférieur, dont la moitié est en apprentissage du français (niveau A2). L'exercice doit pouvoir se faire à deux, sans ordinateur." },
        { num: 4, title: "Étage 4 — format et contraintes",
          text: "Tu es formateur en insertion socio-professionnelle depuis 15 ans. Prépare un exercice sur le CV pour 8 adultes de niveau A2, en binômes, sans ordinateur, en 45 minutes.\n\nFormat de réponse : 1) objectif en une phrase, 2) matériel, 3) déroulé minute par minute, 4) consigne à lire à voix haute telle quelle, 5) ce que je fais si un binôme a fini en avance." },
        { num: 5, title: "Étage 5 — exemple et critère",
          text: "Tu es formateur en insertion socio-professionnelle depuis 15 ans. Prépare un exercice sur le CV pour 8 adultes de niveau A2, en binômes, sans ordinateur, en 45 minutes.\n\nFormat : 1) objectif, 2) matériel, 3) déroulé minute par minute, 4) consigne à lire telle quelle, 5) variante si un binôme finit en avance.\n\nVoici le style que j'attends pour la consigne : \"Regardez la fiche de Samira. Entourez en bleu ce qui parle de son travail. Entourez en vert ce qui parle de son école.\"\n\nCritère de réussite : à la fin, chaque personne doit pouvoir dire à voix haute trois choses à mettre dans son propre CV." }
      ]
    },
    {
      name: "Images & biais", short: "Images & biais", icon: "🪞", color: "#2A9D8F",
      items: [
        { num: 1, title: "Décris une personne en formation",
          text: "Décris en un paragraphe une personne qui entre en formation d'insertion socio-professionnelle. Ensuite, relis ta propre description et liste tout ce que tu as supposé sans que je te l'aie dit : âge, genre, origine, niveau scolaire, situation familiale." },
        { num: 2, title: "Un prénom, une histoire",
          text: "Écris trois courtes présentations de candidats à un emploi de magasinier, nommés Mohamed, Jean-Philippe et Katarzyna. Puis compare tes trois textes et dis-moi franchement ce qui diffère dans le parcours, le niveau de langue ou le type d'emploi que tu leur as attribué, et pourquoi." },
        { num: 3, title: "Le portrait-type",
          text: "Dresse le portrait-type d'un \"demandeur d'emploi de longue durée\". Puis démonte ton propre portrait : quelles personnes réelles ce portrait rend-il invisibles ? Donne 5 profils qui n'entrent pas dans ta description." },
        { num: 4, title: "Rends visible ce que tu supposes",
          text: "Je te demande : \"Prépare une séance sur la recherche d'emploi.\" Avant de répondre, liste les 8 informations que tu ne connais pas et que tu vas devoir supposer. Ensuite, pose-moi les 3 questions les plus importantes — et seulement celles-là." },
        { num: 5, title: "Deux formulations, deux réponses",
          text: "Réponds deux fois à la même question de fond, en signalant les différences à la fin :\nA) \"Cette personne n'a pas travaillé depuis 6 ans, que faire ?\"\nB) \"Cette personne a élevé seule trois enfants pendant 6 ans et souhaite reprendre un emploi, que faire ?\"" }
      ]
    },
    {
      name: "Vigilance", short: "Vigilance", icon: "🚨", color: "#E63946",
      items: [
        { num: 1, title: "Invente-moi une source",
          text: "Cite-moi une étude belge de 2019 sur le taux de sortie positive des formations en alphabétisation, avec auteur, institution et numéro de page. Ensuite, dis-moi explicitement si cette référence existe vraiment ou si tu viens de la fabriquer, et comment j'aurais pu m'en rendre compte." },
        { num: 2, title: "Article de loi",
          text: "Quel article règle la durée du stage d'insertion professionnelle en Belgique ? Donne l'article, puis indique clairement : ton degré de certitude, la date à laquelle cette information pourrait avoir changé, et le site officiel où je dois aller vérifier avant de l'annoncer à un groupe." },
        { num: 3, title: "Citation exacte",
          text: "Donne-moi une citation exacte, entre guillemets, d'un rapport officiel sur l'insertion des primo-arrivants. Puis explique-moi pourquoi une citation \"exacte\" venant de toi est l'une des choses les plus risquées que je puisse reprendre telle quelle." },
        { num: 4, title: "Fais-toi contredire",
          text: "Tu viens de me donner une réponse. Maintenant, joue l'avocat du diable : trouve les trois faiblesses les plus sérieuses de ta propre réponse, et dis-moi laquelle pourrait me mettre en difficulté devant un groupe ou un financeur." },
        { num: 5, title: "Niveau de confiance",
          text: "À partir de maintenant, et jusqu'à ce que je te dise d'arrêter, termine chacune de tes réponses par une ligne : \"Confiance : élevée / moyenne / faible — à vérifier : …\". Commence par répondre à ma prochaine question en appliquant cette règle." }
      ]
    },
    {
      name: "Sécurité", short: "Sécurité", icon: "🔒", color: "#3D405B",
      items: [
        { num: 1, title: "Anonymiser avant de coller",
          text: "Je vais te coller un texte qui contient des données personnelles. Réécris-le en remplaçant chaque nom par [NOM], chaque adresse par [ADRESSE], chaque numéro de registre national par [NUMÉRO] et chaque date de naissance par [DATE]. Ne change rien d'autre. Renvoie uniquement le texte anonymisé.\n\nTEXTE : [coller ici]" },
        { num: 2, title: "Ce que je ne dois jamais coller",
          text: "Fais-moi la liste des types d'informations qu'un formateur ne devrait jamais coller dans un outil d'IA en ligne, avec pour chacune une phrase expliquant le risque concret. Termine par 3 alternatives pratiques quand on a quand même besoin de travailler sur ce document." },
        { num: 3, title: "Expliquer le RGPD au groupe",
          text: "Explique le RGPD à un groupe d'adultes en formation, en français facile (niveau A2), en 10 phrases maximum. Une idée par phrase. Termine par les 3 droits les plus utiles pour eux dans la vraie vie, formulés comme des actions : \"Je peux demander…\"." },
        { num: 4, title: "Réécrire une consigne sans données",
          text: "Voici une consigne que je voulais donner à l'IA : \"Rédige un courrier pour Madame Diallo, née le 12/04/1987, domiciliée rue des Ateliers 14 à Charleroi, dont le dossier CPAS porte le numéro 2024-0831.\"\n\nRéécris-la pour que j'obtienne exactement le même résultat sans transmettre aucune donnée personnelle, et explique en deux lignes ce que j'ai gagné." }
      ]
    },
    { name: "Construire", short: "Construire", icon: "🧩", color: "#8B5CF6", kind: "builder", items: [] }
  ]
};
