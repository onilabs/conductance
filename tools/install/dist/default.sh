exec >&2
set -eu
echo redo-ifchange build.sjs ../share/*
redo-ifchange build.sjs ../share/*
sjs build.sjs "$2"

