exec >&2
. ./default.sh
redo-ifchange 7zip.conf 7zS.sfx "$2.7z"
cat 7zS.sfx 7zip.conf "$2.7z" > "$3"
