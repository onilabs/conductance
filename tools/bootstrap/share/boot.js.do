here="$(pwd)"
cd ..
. ./env.do.sh
redo-ifchange boot.js.template
cpp -C -P -undef -Wundef -std=c99 -traditional-cpp -nostdinc -Wtrigraphs -fdollars-in-identifiers boot.js.template "$here/$3"
