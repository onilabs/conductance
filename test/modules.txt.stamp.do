set -eu
exec >&2
redo-always
find unit integration -name '*-tests.sjs' > "$3"
cp "$3" modules.txt

