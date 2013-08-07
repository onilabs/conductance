exec >&2
set -eux
redo-ifchange *-tests.sjs ./run
./run ":$2"
echo 'ok' > "$3"
