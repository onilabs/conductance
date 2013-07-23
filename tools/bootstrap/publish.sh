#!/bin/bash
set -eu
cd "$(dirname "$0")"
[ "$#" = 1 ] || (echo "Usage: publish.sh DEST"; exit 1)
dest="$1"
redo all
. ./env.do.sh
set -x
cp -v --dereference $platform_bundles manifest*.json install.sh "$dest/"
