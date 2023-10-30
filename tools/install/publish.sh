#!/bin/bash
# copies locally built installer artifacts to the ./install directory ($dest)
# of onilabs.com, for serving as https://onilabs.com/install/

set -eu
cd "$(dirname "$0")"
[ "$#" = 1 ] || (echo "Usage: publish.sh DEST"; exit 1)
dest="$1"
PATH="$PWD/../:$PATH"
gup all
. ./env.sh
set -x
gup -u manifest

rsync -v --delay-updates --checksum --copy-links $platform_bundles manifest-v*.json install.sh "$dest/"
