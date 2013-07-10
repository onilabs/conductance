exec >&2
set -eu
sjs build.sjs "$2"
(cd tmp/"$2" && tar zcf "../../$3" *)

