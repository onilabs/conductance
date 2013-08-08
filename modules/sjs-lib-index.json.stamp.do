set -eu
exec >&2
redo-ifchange .stamp
sjs sjs:compile/doc .
cp sjs-lib-index.json "$3"
