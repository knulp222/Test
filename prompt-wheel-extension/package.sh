#!/usr/bin/env bash
# Produit un .zip distribuable de l'extension.
set -euo pipefail
cd "$(dirname "$0")"

version=$(grep -m1 '"version"' manifest.json | sed 's/.*: *"\(.*\)".*/\1/')
out="prompt-wheel-${version}.zip"
rm -f "$out"

zip -r -q "$out" \
  manifest.json src popup options icons README.md \
  -x '*.DS_Store' '*/.*'

echo "Créé : $out ($(du -h "$out" | cut -f1))"
