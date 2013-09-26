set -eu
redo-ifchange inputs
for step in 1 2 3 4; do
  ls -1 src | sed -e 's/\.md$//' | while read l; do
    echo "step${step}"
    echo "step${step}/${l}"
  done
done | tr '\n' '\0' | xargs -0 redo-ifchange
