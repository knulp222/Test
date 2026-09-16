# Prompt Wheel — extension Chrome

Portage en extension Chrome de la roue de prompts : un **menu radial** qui s'ouvre
par-dessus n'importe quelle page, où l'on choisit un prompt d'un geste. Le prompt
est **inséré directement dans le champ de saisie** (ChatGPT, Claude, Gemini, ou
n'importe quel `textarea` / champ riche) **et copié dans le presse-papiers**.

Aucune installation d'exécutable : un dossier à glisser dans Chrome.

## Installation (pour les stagiaires)

1. Télécharger le dossier `prompt-wheel-extension` (ou le `.zip` fourni, à décompresser).
2. Ouvrir Chrome sur `chrome://extensions`.
3. Activer **Mode développeur** (interrupteur en haut à droite).
4. Cliquer **Charger l'extension non empaquetée** et choisir le dossier `prompt-wheel-extension`.
5. La page de réglages s'ouvre automatiquement. C'est prêt.

> Après l'installation, recharge les onglets déjà ouverts : la roue n'y est pas encore active.

## Utilisation

| Action | Raccourci |
| --- | --- |
| Ouvrir / fermer la roue | `Alt` + `Maj` + `P` (raccourci Chrome) ou `Alt` + `Q` (raccourci dans la page) |
| Naviguer entre les secteurs | `↑` `↓` `←` `→` ou `Tab` |
| Choisir un secteur | clic, `Entrée`, ou son numéro (`1`–`9`) |
| Rechercher | taper directement, la roue se remplit des résultats |
| Remonter d'un niveau | `Retour arrière`, ou clic sur le moyeu central |
| Fermer | `Échap`, ou clic en dehors |

Le premier niveau montre les **catégories** (plus une catégorie *Récents*), le second
les **prompts** de la catégorie. Le panneau du bas affiche le texte complet du prompt survolé.

### Variables

Un prompt peut contenir des repères `{{ }}` :

```
Traduis le texte suivant en {{langue}} :

{{texte}}
```

À la sélection, la roue demande la valeur de chaque variable avant d'insérer.
Un champ laissé vide garde le repère tel quel.

## Gérer la bibliothèque

Clic droit sur l'icône → **Options**, ou « Gérer mes prompts » depuis le popup.
On y ajoute / renomme / réordonne catégories et prompts, on choisit la couleur des
secteurs, et on règle :

- l'ouverture de la roue au curseur ou au centre de l'écran ;
- le raccourci dans la page (le raccourci Chrome se change sur `chrome://extensions/shortcuts`) ;
- la copie systématique dans le presse-papiers ;
- l'envoi automatique après insertion (touche `Entrée`) ;
- l'affichage de la catégorie *Récents*.

Tout est enregistré automatiquement et synchronisé avec le compte Chrome
(`chrome.storage.sync`, avec bascule sur le stockage local si la bibliothèque dépasse
le quota de synchronisation).

## Diffuser une bibliothèque commune

1. Constituer la bibliothèque dans les options, puis **Exporter** → fichier JSON.
2. Transmettre ce JSON aux stagiaires.
3. Chez eux : **Importer** → *Annuler* pour remplacer leur bibliothèque, ou *OK* pour
   l'ajouter à la leur.

Pour livrer la bibliothèque déjà pré-remplie, remplacer le contenu de
`src/defaults.js` avant de distribuer le dossier : c'est ce qui est chargé à la
première installation.

## Empaqueter pour distribution

```bash
./package.sh          # produit prompt-wheel-1.0.0.zip
```

Le `.zip` s'installe de la même façon (décompresser puis « charger l'extension non
empaquetée »), ou peut être déposé sur le Chrome Web Store / poussé par stratégie
d'entreprise si vous en avez la main.

## Structure

```
manifest.json          Manifest V3
src/defaults.js        Bibliothèque de prompts et réglages livrés par défaut
src/store.js           Lecture/écriture chrome.storage (+ usage, récents)
src/insert.js          Insertion dans la page (textarea, input, contenteditable) + presse-papiers
src/wheel.js           Rendu SVG du menu radial, navigation, variables
src/wheel.css          Styles (chargés dans un shadow root, isolés de la page)
src/content.js         Point d'entrée dans la page : raccourci, suivi du champ actif
src/background.js      Service worker : raccourci Chrome, première installation
popup/                 Recherche rapide depuis la barre d'outils
options/               Gestion de la bibliothèque et des réglages
```

La roue est rendue dans un **shadow DOM** : ni la page ne peut la restyler, ni ses
styles ne peuvent fuir vers la page.

## Limites connues

- Chrome interdit aux extensions de s'exécuter sur les pages internes
  (`chrome://`, le Chrome Web Store) et sur les visionneuses de PDF : la roue n'y est pas disponible.
- L'insertion dans un éditeur riche passe par `document.execCommand('insertText')`,
  seul chemin qui traverse correctement ProseMirror / Lexical / Quill. Si un site
  change d'éditeur, le repli reste la copie dans le presse-papiers.
- L'envoi automatique (`Entrée`) dépend du site : certains n'écoutent pas les
  événements clavier synthétiques. Il est désactivé par défaut.
