set -eu
redo-ifchange inputs
for step in 1 2; do
  cat inputs | sed -e 's/\.md$//' | while read l; do
    echo -n -e "step${step}/${l}\0"
  done
done | xargs -0 redo-ifchange
