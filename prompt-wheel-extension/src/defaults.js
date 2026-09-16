/* Bibliothèque de prompts livrée par défaut + réglages par défaut.
   Chargé aussi bien par le content script que par le popup et les options. */
(function (root) {
  const DEFAULT_CATEGORIES = [
    {
      id: 'redaction',
      name: 'Rédaction',
      color: '#e94560',
      prompts: [
        {
          id: 'red-reformuler',
          title: 'Reformuler',
          text: "Reformule le texte suivant pour qu'il soit plus clair et plus direct, sans en changer le sens ni le niveau de détail :\n\n{{texte}}"
        },
        {
          id: 'red-resumer',
          title: 'Résumer',
          text: "Résume le texte suivant en {{nombre}} points clés. Garde les chiffres et les noms propres tels quels :\n\n{{texte}}"
        },
        {
          id: 'red-email',
          title: 'E-mail pro',
          text: "Rédige un e-mail professionnel en français à {{destinataire}} sur le sujet suivant : {{sujet}}. Ton courtois et concis, pas plus de 150 mots, avec un objet."
        },
        {
          id: 'red-ton',
          title: 'Changer de ton',
          text: "Réécris le texte suivant sur un ton {{ton}} (ex. formel, amical, pédagogique), en conservant toutes les informations :\n\n{{texte}}"
        }
      ]
    },
    {
      id: 'analyse',
      name: 'Analyse',
      color: '#f4a261',
      prompts: [
        {
          id: 'ana-synthese',
          title: 'Synthèse de document',
          text: "Analyse le document ci-dessous et rends : 1) un résumé en 5 lignes, 2) les décisions à prendre, 3) les points qui manquent d'information.\n\n{{document}}"
        },
        {
          id: 'ana-pour-contre',
          title: 'Pour / contre',
          text: "Liste les arguments pour et contre concernant : {{sujet}}. Termine par une recommandation argumentée en 3 lignes."
        },
        {
          id: 'ana-donnees',
          title: 'Lire des données',
          text: "Voici un jeu de données. Décris ce qu'il contient, signale les valeurs aberrantes et propose 3 analyses pertinentes :\n\n{{donnees}}"
        }
      ]
    },
    {
      id: 'code',
      name: 'Code',
      color: '#2a9d8f',
      prompts: [
        {
          id: 'code-explique',
          title: 'Expliquer du code',
          text: "Explique ce que fait ce code, étape par étape, comme à un développeur junior :\n\n```\n{{code}}\n```"
        },
        {
          id: 'code-review',
          title: 'Relecture',
          text: "Relis ce code et signale uniquement les vrais bugs et les risques de sécurité, classés par gravité. Pas de remarques de style :\n\n```\n{{code}}\n```"
        },
        {
          id: 'code-tests',
          title: 'Écrire des tests',
          text: "Écris des tests unitaires pour le code suivant, en couvrant les cas limites. Utilise {{framework}} :\n\n```\n{{code}}\n```"
        },
        {
          id: 'code-erreur',
          title: 'Débugger',
          text: "J'obtiens cette erreur : {{erreur}}\n\nVoici le code concerné :\n```\n{{code}}\n```\nDonne la cause probable puis le correctif minimal."
        }
      ]
    },
    {
      id: 'reunion',
      name: 'Réunion',
      color: '#7b6cf6',
      prompts: [
        {
          id: 'reu-cr',
          title: 'Compte rendu',
          text: "Transforme ces notes de réunion en compte rendu structuré : contexte, décisions, actions (avec responsable et échéance), points en suspens.\n\n{{notes}}"
        },
        {
          id: 'reu-ordre',
          title: 'Ordre du jour',
          text: "Prépare un ordre du jour pour une réunion de {{duree}} minutes sur : {{sujet}}. Indique un temps pour chaque point."
        },
        {
          id: 'reu-relance',
          title: 'Relance',
          text: "Rédige un message de relance court et poli concernant : {{sujet}}. Rappelle l'échéance et demande une réponse claire."
        }
      ]
    },
    {
      id: 'apprentissage',
      name: 'Apprentissage',
      color: '#00b4d8',
      prompts: [
        {
          id: 'app-explique',
          title: 'Explique simplement',
          text: "Explique {{sujet}} simplement, avec une analogie concrète puis un exemple d'usage réel. Environ 200 mots."
        },
        {
          id: 'app-quiz',
          title: 'Quiz',
          text: "Pose-moi 5 questions de difficulté croissante sur {{sujet}}. Attends ma réponse avant de donner la correction."
        },
        {
          id: 'app-plan',
          title: "Plan d'apprentissage",
          text: "Construis un plan d'apprentissage de {{duree}} pour maîtriser {{sujet}}, avec les ressources et un objectif vérifiable par étape."
        }
      ]
    },
    {
      id: 'divers',
      name: 'Divers',
      color: '#8d99ae',
      prompts: [
        {
          id: 'div-traduire',
          title: 'Traduire',
          text: "Traduis le texte suivant en {{langue}}. Garde le ton d'origine et n'ajoute aucun commentaire :\n\n{{texte}}"
        },
        {
          id: 'div-checklist',
          title: 'Checklist',
          text: "Transforme la demande suivante en checklist d'actions concrètes, ordonnée et sans doublon :\n\n{{demande}}"
        },
        {
          id: 'div-idees',
          title: 'Brainstorm',
          text: "Propose 10 idées variées sur : {{sujet}}. Une ligne par idée, de la plus classique à la plus inattendue."
        }
      ]
    }
  ];

  const DEFAULT_SETTINGS = {
    // Raccourci géré dans la page (en plus du raccourci Chrome Alt+Shift+P)
    hotkey: { alt: true, ctrl: false, shift: false, meta: false, key: 'KeyQ' },
    hotkeyEnabled: true,
    // Où ouvrir la roue : 'cursor' (position de la souris) ou 'center'
    openAt: 'cursor',
    // Copier systématiquement dans le presse-papiers, même quand l'insertion réussit
    alwaysCopy: true,
    // Envoyer automatiquement après insertion (Entrée) — désactivé par défaut
    autoSend: false,
    theme: 'auto',
    showRecents: true
  };

  root.PromptWheelDefaults = {
    categories: DEFAULT_CATEGORIES,
    settings: DEFAULT_SETTINGS,
    version: 1
  };
})(typeof window !== 'undefined' ? window : self);
