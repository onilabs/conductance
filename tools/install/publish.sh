#!/bin/bash
set -eu
cd "$(dirname "$0")"
[ "$#" = 1 ] || (echo "Usage: publish.sh DEST"; exit 1)
dest="$1"
PATH="$PWD/../:$PATH"
gup all
. ./env.sh
set -x
rsync -v --delay-updates --checksum --copy-links $platform_bundles manifest*.json install.sh "$dest/"
