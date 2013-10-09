set -eu
exec >&2
function log {
	echo "$@" >&2
}

if [ ! -e ace-builds ]; then
	log "Error: You must checkout git@github.com:ajaxorg/ace-builds.git as ./ace-builds/ (or use a symlink)"
	exit 1
fi

log "* Updating git"
(cd ace-builds && git pull --ff-only)

ls -1 *.js | while read f; do
	log "* updating $f"
	cp ace-builds/src-min-noconflict/"$f" ./"$f"
done
