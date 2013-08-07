set -eu
exec >&2
redo-ifchange 7z922_extra.7z ./7z
./7z e 7z922_extra.7z "$2" -so > "$3"
