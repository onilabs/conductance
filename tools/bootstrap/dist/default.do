exec >&2
set -eu
if [ "$(dirname "$1")" != 'tmp' ]; then
	echo "Don't know how to build $1"
	exit 1
fi
sjs build.sjs "$1"
