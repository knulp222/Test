#!/usr/bin/env bash
# Produit le .zip distribuable et rafraîchit le fichier proposé sur le site.
# Le zip contient un dossier « prompt-wheel/ » : une fois décompressé, c'est
# ce dossier qu'on désigne dans « Charger l'extension non empaquetée ».
set -euo pipefail
cd "$(dirname "$0")"

version=$(grep -m1 '"version"' manifest.json | sed 's/.*: *"\(.*\)".*/\1/')
out="prompt-wheel-${version}.zip"
stage=$(mktemp -d)
trap 'rm -rf "$stage"' EXIT

mkdir -p "$stage/prompt-wheel"
cp -R manifest.json src popup options icons README.md "$stage/prompt-wheel/"
find "$stage" -name '.DS_Store' -delete

rm -f "$out"
(cd "$stage" && zip -r -q "$OLDPWD/$out" prompt-wheel)

echo "Créé : $out ($(du -h "$out" | cut -f1))"

# Le site sert toujours le même nom de fichier, pour que le lien ne bouge pas.
if [ -f ../index.html ]; then
  cp "$out" ../prompt-wheel.zip
  echo "Copié  : ../prompt-wheel.zip (le fichier proposé par le site)"
  echo "Pensez à mettre à jour le numéro de version affiché sur la page."
fi
