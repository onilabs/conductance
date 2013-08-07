set -eu
exec >&2
which 7z || (echo "please install 7z"; exit 1)
ln -s "`which 7z`" "$3"
