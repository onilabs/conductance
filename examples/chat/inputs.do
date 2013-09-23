redo-always
find src/ | colrm 1 5 | sort | tee "$3" | redo-stamp
