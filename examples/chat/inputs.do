redo-always
find src/ | cut -d / -f 1 --complement | sort | tee "$3" | redo-stamp
