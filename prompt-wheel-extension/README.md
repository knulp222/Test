# La roue des prompts — extension Chrome

Portage en extension Chrome de la roue des prompts (version Python). Même principe :
un **menu radial** s'ouvre par-dessus n'importe quelle page, on choisit un prompt d'un
geste, il est **inséré dans le champ de saisie** et **copié dans le presse-papiers**.

Aucun exécutable à installer : un dossier à charger dans Chrome.

## Installation (pour les stagiaires)

Page de présentation et téléchargement : **https://knulp222.github.io/roue-des-prompts/**

1. Télécharger le `.zip` et le décompresser : il contient un dossier `prompt-wheel`.
2. Ouvrir Chrome sur `chrome://extensions` (Edge : `edge://extensions`).
3. Activer **Mode développeur** (en haut à droite).
4. **Charger l'extension non empaquetée** → choisir le dossier `prompt-wheel`.
5. La page de réglages s'ouvre. C'est prêt.

> Recharger les onglets déjà ouverts : la roue n'y est pas encore active.
> Ne pas supprimer le dossier décompressé : Chrome le relit à chaque démarrage.

## Utilisation

| Action | Geste |
| --- | --- |
| Ouvrir / fermer la roue | `Ctrl`+`Alt`+`P` (dans la page) ou `Ctrl`+`Maj`+`P` (raccourci Chrome) |
| Changer de jeu | **clic au centre** ou `Tab` — le centre affiche le nom du jeu et `1/4 … 4/4` |
| Naviguer | souris, ou `←` `→` `↑` `↓` |
| Choisir | clic, `Entrée`, ou le numéro du secteur (`1`–`9`) |
| Rechercher | taper directement : la roue se remplit des résultats, tous jeux confondus |
| Remonter d'un niveau | clic au centre, ou `Retour arrière` |
| Fermer | `Échap`, ou clic en dehors |

Sur un prompt, trois actions :

| Geste | Effet |
| --- | --- |
| **Clic** | insère dans le champ de saisie de la page |
| **Maj + clic** | insère puis appuie sur `Entrée` (envoie) |
| **Ctrl + clic** | copie seulement, la page n'est pas touchée |

> Différence avec la version Python : là-bas, « clic » tapait le texte au clavier et
> « Maj + clic » le collait, parce que l'app pilotait le système ; le réglage
> `paste_over_chars` arbitrait selon la longueur. Dans le navigateur, l'insertion est
> directe et instantanée quelle que soit la taille — le second geste sert donc à
> **envoyer**, ce qui est plus utile ici.

Le premier niveau montre les **catégories** (emoji + nom court), le second les **prompts**
(numéro + titre). Le panneau de droite affiche le prompt complet en entier ; les repères
entre crochets — `[À COMPLÉTER]`, `[coller ici]`, `[Joindre le PDF]`, `[ville]` — sont
surlignés et restent dans le texte inséré, à compléter sur place.

## Les 4 jeux — 140 prompts

| Jeu | Catégories | Prompts |
| --- | --- | --- |
| **1 · Mécanique & biais** | Mécanique, Transformer, Étages, Images & biais, Vigilance, Sécurité | 29 |
| **2 · Démos concrètes** | Courriers, Atelier, Accompagner, Documents, Recherche, Quotidien | 37 |
| **3 · Travail administratif** | Rédaction, Rapports, Excel, Outils, Procédures, Relire | 40 |
| **4 · Agents & assistants** | Rédaction, Pédagogie, Administratif, Accompagner, Recherche, Garde-fous | 34 |

Chaque jeu garde le secteur **Construire** : un constructeur de prompt qui assemble
rôle, tâche, public, ton, format et garde-fous à partir de briques de texte.

Le jeu 2 est autonome (situation incluse) ; seules exceptions, `[Joindre …]` dans
**Documents** et un `[ville]` dans **Recherche** › *Sorties culturelles*. Le jeu 3
attend parfois un `[coller …]`, ce public ayant de la matière. Le jeu 4 contient des
instructions complètes à coller dans un Gem, un GPT personnalisé ou un agent Copilot,
toutes sur le même gabarit : rôle → mission → règles → format de réponse.

> Les opérateurs cités (Forem, Actiris, Bruxelles Formation, promotion sociale, CISP)
> sont des exemples génériques belges, à ajuster à votre région.

## Gérer la bibliothèque

Clic droit sur l'icône → **Options** (ou « Gérer les prompts » depuis le popup) :
un onglet par jeu, plus un onglet **Constructeur**. On y ajoute, renomme, réordonne et
supprime jeux, catégories et prompts, on choisit l'emoji et la couleur de chaque secteur.
Un avertissement s'affiche au-delà de 7 catégories par jeu ou 7 prompts par catégorie
(au-delà, la roue devient illisible) et pour les titres de plus de 45 caractères.

Réglages : jeu ouvert par défaut, ouverture au curseur ou au centre, raccourci dans la
page, copie systématique, secteur « Récents ».

Tout est enregistré automatiquement (`chrome.storage`, avec bascule en local quand la
bibliothèque dépasse le quota de synchronisation).

## Modifier les prompts avec une IA

Bouton **« Modifier les prompts avec une IA… »**, comme dans la version Python :

1. **Onglet 1** — « Copier tout » copie une consigne (structure du fichier, règles :
   simple, concret, 7 maximum par roue) suivie du fichier complet. Coller ça dans
   ChatGPT, Claude ou Gemini avec sa demande.
2. **Onglet 2** — coller la réponse de l'IA (le bloc ```` ```json … ``` ```` peut être collé
   tel quel). « Vérifier » contrôle la structure et liste erreurs et avertissements ;
   « Appliquer » sauvegarde l'état précédent puis recharge la roue.

Le bouton **Restaurer** revient à l'état d'avant le dernier import, remplacement ou
réinitialisation — l'équivalent de `prompts.backup.json`.

## Diffuser une bibliothèque commune

1. **Exporter** → fichier JSON.
2. Transmettre le fichier.
3. Chez les stagiaires : **Importer** → *Annuler* pour remplacer, *OK* pour ajouter.

Le format est **celui du `prompts.json` de la version Python** (`sets` → `categories`
→ `items`, avec `name`, `short`, `icon`, `color`, `kind: "builder"`, `num`, `title`,
`text`, plus `builder`) : le fichier existant s'importe sans conversion.

Pour livrer la bibliothèque déjà pré-remplie, remplacer les fichiers `src/sets/*.js`
avant de distribuer le dossier — c'est ce qui est chargé à la première installation.

## Empaqueter et diffuser

```bash
./package.sh          # produit prompt-wheel-<version>.zip
                      # et met à jour ../prompt-wheel.zip (le fichier servi par le site)
```

Le zip contient un dossier `prompt-wheel/` : c'est ce dossier-là qu'on désigne dans
« Charger l'extension non empaquetée ».

Trois façons de diffuser :

| Moyen | Ce que ça demande | Ce que vit l'utilisateur |
| --- | --- | --- |
| **ZIP + mode développeur** (actuel) | rien | décompresser, activer le mode développeur, charger le dossier |
| **Chrome Web Store** | un compte développeur Chrome (frais d'inscription uniques), une fiche à remplir, une relecture de Google à chaque version | installation en un clic, mises à jour automatiques |
| **Stratégie d'entreprise** | un parc géré : l'administrateur déclare l'extension (`ExtensionInstallForcelist` / `ExtensionSettings`) | l'extension arrive seule sur les postes |

Un fichier **`.crx`** ne simplifie rien : sur Windows et macOS, Chrome refuse un `.crx`
qui ne vient pas du Web Store (glisser-déposer bloqué, extension désactivée au
redémarrage), sauf déploiement par stratégie d'entreprise. Empaqueter ne dispense
donc pas du mode développeur — seul le Web Store le fait. Les conditions exactes du
Web Store changent régulièrement : les vérifier avant de se lancer.

## Structure

```
manifest.json          Manifest V3
src/sets/set1..4.js    Les 4 jeux de prompts (équivalent de sets_pro.py / prompts.json)
src/sets/builder.js    Les briques du constructeur
src/defaults.js        Assemblage des jeux + réglages par défaut
src/store.js           Stockage, validation de structure, sauvegarde, export
src/insert.js          Insertion (textarea, input, contenteditable) + presse-papiers
src/wheel.js           Rendu SVG de la roue, navigation, constructeur
src/wheel.css          Styles (shadow root, isolés de la page)
src/content.js         Raccourci, suivi du champ actif
src/background.js      Service worker : raccourci Chrome, première installation
popup/                 Recherche rapide dans les 4 jeux
options/               Éditeur à onglets, réglages, import/export, dialogue IA
```

## Limites connues

- Chrome interdit aux extensions de s'exécuter sur les pages internes (`chrome://`,
  le Chrome Web Store) et sur la visionneuse PDF : la roue n'y est pas disponible.
- L'insertion dans un éditeur riche passe par `document.execCommand('insertText')`,
  seul chemin qui traverse correctement ProseMirror / Lexical / Quill (ChatGPT, Claude,
  Gemini). Si un site change d'éditeur, le repli reste la copie dans le presse-papiers.
- L'envoi automatique (`Maj` + clic) dépend du site : certains n'écoutent pas les
  événements clavier synthétiques.
- Chrome n'accepte pas `Ctrl+Alt+…` comme raccourci d'extension : `Ctrl`+`Alt`+`P` est
  donc géré **dans la page** (il ne fonctionne pas sur les onglets où l'extension ne
  s'exécute pas), et `Ctrl`+`Maj`+`P` sert de raccourci navigateur.
