redo-always
find src/ | sed -e 's@^[^/]*/@@' | grep . | sort | tee "$3" | redo-stamp
