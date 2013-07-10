exec >&2
set -eux
redo-ifchange *-tests.sjs
../test.sjs ":$2"
echo 'ok' > "$3"
