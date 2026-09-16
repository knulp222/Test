/* Jeu 3 — Travail administratif : public qui a de la matière, donc certains
   prompts attendent un [coller …]. */
window.PW_SET_3 = {
  name: "Travail administratif",
  categories: [
    {
      name: "Rédaction", short: "Rédaction", icon: "✍️", color: "#5B6CFF",
      items: [
        { num: 1, title: "Note interne",
          text: "Rédige une note interne à l'équipe annonçant un changement d'organisation. Structure : objet, ce qui change, à partir de quand, ce que ça change concrètement pour chacun, qui contacter. 250 mots maximum, ton direct et non défensif. Champs [À COMPLÉTER] pour les éléments variables.\n\nLE CHANGEMENT : [coller ou décrire ici]" },
        { num: 2, title: "Courrier à un subsidiant",
          text: "Rédige un courrier à un pouvoir subsidiant. Ton institutionnel mais lisible, une page maximum. Structure : rappel du cadre, où nous en sommes, ce que nous demandons précisément, ce que nous joignons. Aucune formule creuse. Mets [À COMPLÉTER] partout où il faut un chiffre ou une date.\n\nOBJET DE LA DEMANDE : [coller ici]" },
        { num: 3, title: "Réponse à une plainte",
          text: "Rédige une réponse à une plainte. Règles : accuser réception, reformuler la plainte sans la déformer, exposer les faits établis, dire ce que nous faisons, donner un délai. Ne jamais minimiser ni promettre ce qui n'est pas certain. 300 mots maximum.\n\nLA PLAINTE : [coller ici]" },
        { num: 4, title: "Note de cadrage",
          text: "Rédige une note de cadrage pour un nouveau projet : contexte, objectif en une phrase, périmètre (ce qui est dedans / ce qui est dehors), livrables, jalons, moyens nécessaires, risques identifiés, qui décide quoi. Deux pages maximum, en listes.\n\nLE PROJET : [coller ou décrire ici]" },
        { num: 5, title: "Mail de refus",
          text: "Rédige un mail de refus clair et respectueux, qui dit non sans ambiguïté, explique brièvement pourquoi, et propose une alternative si elle existe. 120 mots maximum. Pas de \"malheureusement\" en ouverture, pas de faux espoir.\n\nCE QUE JE REFUSE : [coller ou décrire ici]" },
        { num: 6, title: "Invitation partenaires",
          text: "Rédige une invitation à une réunion de partenaires : objet, pourquoi cette réunion maintenant, ordre du jour en 4 points avec les temps, ce qu'on attend des participants avant de venir, aspects pratiques. 200 mots maximum, champs [À COMPLÉTER]." },
        { num: 7, title: "Traduction NL avec retraduction",
          text: "Traduis le texte suivant en néerlandais, registre professionnel. Puis, en dessous, retraduis ta propre traduction en français, littéralement, pour que je puisse vérifier que rien n'a glissé. Termine par les 3 passages dont tu es le moins sûr.\n\nTEXTE : [coller ici]" }
      ]
    },
    {
      name: "Rapports", short: "Rapports", icon: "📊", color: "#00B4D8",
      items: [
        { num: 1, title: "Compte rendu de réunion",
          text: "Transforme ces notes en compte rendu structuré : contexte en 3 lignes, décisions prises, actions avec responsable et échéance en tableau, points reportés. N'invente aucune décision : si une action n'a pas de responsable dans mes notes, écris [À COMPLÉTER].\n\nNOTES : [coller ici]" },
        { num: 2, title: "PV formel",
          text: "Rédige un procès-verbal formel à partir de ces notes : présents, excusés, ordre du jour, délibérations point par point, décisions votées avec le résultat, prochaine séance. Style impersonnel et factuel, pas de commentaire. Champs [À COMPLÉTER] pour ce qui manque.\n\nNOTES : [coller ici]" },
        { num: 3, title: "Rapport d'activité annuel",
          text: "Construis le plan détaillé d'un rapport d'activité annuel pour un organisme de formation, avec pour chaque section : ce qu'elle doit contenir, les chiffres à y mettre sous forme de champs [À COMPLÉTER], et une phrase d'amorce. Prévois une section \"difficultés rencontrées\" honnête et utilisable devant un financeur." },
        { num: 4, title: "Bilan de module",
          text: "Rédige un bilan de module de formation à partir des éléments ci-dessous : objectifs annoncés, ce qui a été réalisé, données de participation, ce qui a fonctionné, ce qui a coincé, ce qu'on change la prochaine fois. Deux pages maximum.\n\nÉLÉMENTS : [coller ici]" },
        { num: 5, title: "Synthèse pour le CA",
          text: "Transforme ce document en synthèse d'une page pour un conseil d'administration : la décision attendue en premier, les 3 éléments qui la justifient, les options écartées et pourquoi, l'impact budgétaire, le risque principal. Rien d'autre.\n\nDOCUMENT : [coller ici]" },
        { num: 6, title: "Analyse d'incident",
          text: "Aide-moi à écrire une analyse d'incident : faits établis dans l'ordre chronologique, ce qui a permis à l'incident de se produire (pas qui est coupable), ce qui a limité les dégâts, mesures immédiates, mesures de fond, ce qu'on surveille désormais. Ton factuel, jamais accusatoire.\n\nINCIDENT : [coller ici]" },
        { num: 7, title: "Grille d'évaluation",
          text: "Construis une grille d'évaluation pour [coller l'objet à évaluer] : 8 critères observables, une échelle à 4 niveaux avec une description concrète de chaque niveau, une pondération, et une zone de commentaire. Rends-la utilisable par deux évaluateurs différents sans qu'ils divergent. Présente-la en tableau." }
      ]
    },
    {
      name: "Excel", short: "Excel", icon: "🧮", color: "#F4A261",
      items: [
        { num: 1, title: "Alerte délai",
          text: "En Excel, colonne A une date d'échéance. Je veux que la ligne passe en orange 15 jours avant l'échéance et en rouge une fois dépassée. Donne-moi la formule de mise en forme conditionnelle exacte, où la coller, et la marche à suivre clic par clic. Précise les pièges avec les références absolues." },
        { num: 2, title: "RECHERCHEX",
          text: "Explique-moi RECHERCHEX avec un exemple concret de suivi de stagiaires : feuille 1 la liste des inscrits, feuille 2 les présences. Donne la formule complète, explique chaque argument en une ligne, montre comment gérer le cas \"non trouvé\", et dis-moi quoi faire si ma version d'Excel ne connaît que RECHERCHEV." },
        { num: 3, title: "Suivi des présences",
          text: "Construis-moi la structure d'un fichier de suivi des présences pour 12 stagiaires sur 20 séances : quelles colonnes, quel codage des absences (justifiée / non justifiée / retard), les formules de total et de pourcentage de présence, et une alerte visuelle sous 80 %. Donne les formules exactes." },
        { num: 4, title: "Nettoyer une liste de contacts",
          text: "J'ai une liste de contacts pleine d'incohérences : majuscules erratiques, espaces en trop, doublons, téléphones dans des formats différents. Donne-moi, dans l'ordre, les formules et fonctionnalités Excel pour nettoyer tout ça, avec un exemple de résultat avant / après pour chaque étape." },
        { num: 5, title: "Tableau croisé dynamique",
          text: "Explique-moi comment construire un tableau croisé dynamique pour compter mes stagiaires par commune et par tranche d'âge, à partir d'une liste brute. Donne la marche à suivre clic par clic, comment grouper les âges en tranches, et les deux erreurs qui font échouer 90 % des tentatives." },
        { num: 6, title: "Expliquer une formule",
          text: "Explique-moi cette formule Excel morceau par morceau, comme si je n'avais jamais dépassé la somme automatique. Dis-moi ce qu'elle fait, dans quel ordre Excel la lit, et ce qui la casserait.\n\nFORMULE : [coller ici]" },
        { num: 7, title: "Corriger une erreur",
          text: "Ma formule Excel renvoie une erreur. Voici la formule et le message. Donne-moi la cause la plus probable, la correction exacte, et une version plus robuste qui ne recassera pas.\n\nFORMULE : [coller ici]\nERREUR : [coller ici]" }
      ]
    },
    {
      name: "Outils", short: "Outils", icon: "🛠️", color: "#2A9D8F",
      items: [
        { num: 1, title: "Règles Outlook",
          text: "Explique-moi comment créer des règles Outlook pour classer automatiquement : les mails d'un partenaire dans un dossier, les inscriptions dans un autre, et mettre en évidence ceux où je suis en copie seulement. Marche à suivre clic par clic, plus les 3 règles qui font le plus gagner de temps." },
        { num: 2, title: "Modèle Word",
          text: "Explique-moi comment construire un modèle Word (.dotx) avec styles, en-tête avec logo, pied de page numéroté et zones de saisie. Marche à suivre clic par clic, plus comment le diffuser à l'équipe pour que tout le monde l'utilise vraiment." },
        { num: 3, title: "Signature mail",
          text: "Rédige une signature de mail professionnelle sobre pour un organisme de formation, avec les mentions utiles et une mention RGPD courte. Donne ensuite la marche à suivre pour l'installer dans Outlook et dans Gmail. Champs [À COMPLÉTER] pour les coordonnées." },
        { num: 4, title: "Formulaire d'inscription",
          text: "Conçois un formulaire d'inscription en ligne pour une formation : quelles questions poser, dans quel ordre, lesquelles rendre obligatoires, et la mention d'information RGPD à afficher. Évite toute question dont je n'ai pas réellement besoin. Donne aussi la version papier équivalente." },
        { num: 5, title: "Partage de fichiers",
          text: "Explique-moi comment organiser un partage de fichiers d'équipe : arborescence de dossiers, convention de nommage, qui a le droit de modifier quoi, et que faire des documents contenant des données personnelles. Donne une arborescence concrète prête à créer." },
        { num: 6, title: "Mail-type réutilisable",
          text: "Transforme ce mail que j'écris chaque semaine en modèle réutilisable, avec des champs [À COMPLÉTER] clairement identifiés et deux variantes de ton (neutre et plus chaleureux). Ajoute une ligne d'objet efficace.\n\nMON MAIL : [coller ici]" }
      ]
    },
    {
      name: "Procédures", short: "Procédures", icon: "📋", color: "#E63946",
      items: [
        { num: 1, title: "Rétroplanning",
          text: "Construis un rétroplanning à partir de la date de fin, sous forme de tableau (échéance, tâche, responsable, dépendance). Remonte étape par étape jusqu'à aujourd'hui et signale les deux moments où le planning risque de casser.\n\nÉVÉNEMENT ET DATE : [coller ou décrire ici]" },
        { num: 2, title: "Accueil d'un stagiaire",
          text: "Rédige la procédure d'accueil d'un nouveau stagiaire, du premier contact à la fin de la première semaine : qui fait quoi, quand, avec quels documents. Présente-la en tableau, et ajoute une check-list d'une page à cocher le jour J." },
        { num: 3, title: "Check-list de fin de session",
          text: "Rédige une check-list de fin de session de formation : administratif, matériel, évaluations, attestations, archivage, transmission. Une ligne par action, à l'infinitif, regroupées par moment (dernier jour, semaine suivante, mois suivant)." },
        { num: 4, title: "Registre des traitements RGPD",
          text: "Explique ce qu'est un registre des traitements RGPD pour un organisme de formation et construis-m'en la trame, avec une ligne d'exemple complète pour le traitement \"gestion des inscriptions\" : finalité, base légale, données, personnes concernées, destinataires, durée de conservation, mesures de sécurité." },
        { num: 5, title: "Gestion des absences",
          text: "Rédige une procédure de gestion des absences en formation : ce que la personne doit faire, dans quel délai, ce que nous faisons à 1, 3 et 5 absences, ce qui est justifiable et ce qui ne l'est pas, et les conséquences. Ton clair et non menaçant. Ajoute la version affichable pour les stagiaires en français facile." },
        { num: 6, title: "Note de service",
          text: "Rédige une note de service : objet, ce qui est décidé, à partir de quand, qui est concerné, ce qu'il faut faire, qui contacter en cas de question. 200 mots maximum, aucune ambiguïté possible.\n\nLA DÉCISION : [coller ou décrire ici]" },
        { num: 7, title: "Répartition des tâches",
          text: "Aide-moi à répartir les tâches d'une équipe : à partir de la liste ci-dessous, propose une répartition en tableau (tâche, responsable principal, suppléant, fréquence, temps estimé), signale les tâches que personne ne veut et les surcharges évidentes.\n\nLISTE : [coller ici]" }
      ]
    },
    {
      name: "Relire", short: "Relire", icon: "🔎", color: "#3D405B",
      items: [
        { num: 1, title: "Relire sans changer le sens",
          text: "Relis ce texte : corrige l'orthographe, la grammaire et la ponctuation, sans rien changer au sens, au ton ni au niveau de détail. Rends-moi le texte corrigé, puis la liste des corrections faites.\n\nTEXTE : [coller ici]" },
        { num: 2, title: "Phrases trop longues",
          text: "Repère dans ce texte toutes les phrases de plus de 25 mots et propose pour chacune une version coupée en deux ou trois. Présente en tableau : phrase d'origine, version proposée. Ne touche à rien d'autre.\n\nTEXTE : [coller ici]" },
        { num: 3, title: "Vérifier les chiffres",
          text: "Vérifie la cohérence interne de ce document : les totaux qui ne tombent pas juste, les pourcentages qui ne font pas 100, les dates contradictoires, les chiffres cités différemment à deux endroits. Liste uniquement les problèmes trouvés, avec l'endroit exact. Ne corrige rien de toi-même.\n\nDOCUMENT : [coller ici]" },
        { num: 4, title: "Adapter au niveau A2",
          text: "Réécris ce texte au niveau A2 : phrases courtes, une idée par phrase, mots du quotidien, aucun sigle sans explication. Garde absolument toutes les dates, heures, lieux, montants et obligations. Signale en fin de réponse ce que tu as dû simplifier au point de perdre une nuance.\n\nTEXTE : [coller ici]" },
        { num: 5, title: "Traquer le jargon",
          text: "Liste tous les mots de jargon, sigles et expressions de métier présents dans ce texte, et propose pour chacun un équivalent compréhensible par quelqu'un d'extérieur au secteur. Présente en tableau à 3 colonnes : terme, pourquoi c'est un problème, remplacement proposé.\n\nTEXTE : [coller ici]" },
        { num: 6, title: "Relecture avant envoi",
          text: "Ce document part demain à un financeur. Relis-le comme le ferait quelqu'un qui cherche la faille : ce qui n'est pas étayé, ce qui peut se retourner contre nous, ce qui manque, ce qui est ambigu. Classe tes remarques par gravité. Ne réécris rien, signale seulement.\n\nDOCUMENT : [coller ici]" }
      ]
    },
    { name: "Construire", short: "Construire", icon: "🧩", color: "#8B5CF6", kind: "builder", items: [] }
  ]
};
