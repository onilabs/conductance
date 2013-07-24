exec >&2
. ./default.sh
redo-ifchange ./7z
(cd tmp/"$2" && ../../7z a -y "../../$3" *)

