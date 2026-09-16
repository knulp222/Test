/* Constructeur de prompt : les ingrédients, chacun avec ses briques de texte.
   Le secteur « Construire » est présent dans chaque jeu et pointe ici. */
globalThis.PW_BUILDER = {
  name: "Constructeur de prompt",
  hint: "Choisis une brique par ligne. Le prompt se monte en dessous.",
  ingredients: [
    {
      name: "Rôle", options: [
        { label: "Formateur ISP", text: "Tu es formateur en insertion socio-professionnelle, 15 ans de terrain." },
        { label: "Formateur FLE", text: "Tu es formateur en français langue étrangère pour adultes peu scolarisés." },
        { label: "Conseiller emploi", text: "Tu es conseiller en insertion, tu accompagnes des demandeurs d'emploi." },
        { label: "Secrétaire", text: "Tu es secrétaire administratif dans un organisme de formation." },
        { label: "Responsable", text: "Tu es responsable pédagogique et tu réponds devant un pouvoir subsidiant." },
        { label: "Relecteur", text: "Tu es relecteur critique, ton rôle est de repérer ce qui cloche." }
      ]
    },
    {
      name: "Tâche", options: [
        { label: "Rédiger", text: "Rédige" },
        { label: "Reformuler", text: "Reformule" },
        { label: "Simplifier", text: "Simplifie" },
        { label: "Résumer", text: "Résume" },
        { label: "Expliquer", text: "Explique" },
        { label: "Préparer un atelier", text: "Prépare une séquence d'atelier sur" },
        { label: "Construire un exercice", text: "Construis un exercice sur" },
        { label: "Vérifier", text: "Vérifie et signale les problèmes de" }
      ]
    },
    {
      name: "Public", options: [
        { label: "Débutant en français", text: "pour des adultes qui apprennent le français, niveau A2." },
        { label: "Peu lecteur", text: "pour des adultes qui lisent difficilement." },
        { label: "Groupe hétérogène", text: "pour un groupe aux niveaux très différents." },
        { label: "Collègues", text: "pour mes collègues de l'équipe." },
        { label: "Financeur", text: "pour un pouvoir subsidiant qui lira vite et cherchera les failles." },
        { label: "Employeur", text: "pour un employeur du secteur privé." }
      ]
    },
    {
      name: "Ton", options: [
        { label: "Simple et direct", text: "Phrases courtes, une idée par phrase, mots du quotidien." },
        { label: "Institutionnel", text: "Registre institutionnel, mais lisible : pas de formule creuse." },
        { label: "Chaleureux", text: "Ton chaleureux et respectueux, jamais infantilisant." },
        { label: "Factuel", text: "Ton strictement factuel, aucun commentaire, aucune interprétation." }
      ]
    },
    {
      name: "Format", options: [
        { label: "Liste numérotée", text: "Réponds en liste numérotée." },
        { label: "Tableau", text: "Réponds sous forme de tableau." },
        { label: "Check-list", text: "Réponds en check-list à cocher, une action par ligne, à l'infinitif." },
        { label: "Courrier prêt", text: "Rends un texte prêt à envoyer, avec objet et formule de politesse." },
        { label: "Déroulé minuté", text: "Donne un déroulé minute par minute, pauses comprises." },
        { label: "Une page max", text: "Une page maximum." }
      ]
    },
    {
      name: "Garde-fous", options: [
        { label: "Ne rien inventer", text: "N'invente aucun fait, chiffre, date ni nom : écris [À COMPLÉTER] à la place." },
        { label: "Une question à la fois", text: "S'il te manque une information indispensable, pose-moi une seule question avant de produire." },
        { label: "Sources datées", text: "Cite tes sources officielles avec leur date et termine par ce que je dois vérifier moi-même." },
        { label: "Anonymiser", text: "Remplace toute donnée personnelle par [NOM], [ADRESSE], [NUMÉRO]." },
        { label: "Signaler le doute", text: "Termine par une ligne : \"Confiance : élevée / moyenne / faible — à vérifier : …\"." }
      ]
    }
  ]
};
