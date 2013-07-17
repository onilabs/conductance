set -e
redo-ifchange HEAD
HEAD="$(cat HEAD)"
cd "$(git rev-parse --show-toplevel)"
set -x
git archive --format=tar.gz "$HEAD"
