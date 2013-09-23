set -eu
redo-ifchange inputs
for step in 1 2; do
  cat inputs | sed -e 's/\.md$//' | while read l; do
    echo "step${step}/${l}"
  done
done | tr '\n' '\0' | xargs -0 redo-ifchange
