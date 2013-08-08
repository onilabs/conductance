set -eu
redo-always
(
	files="$(find . -type f -name '*.sjs' -o -name 'sjs-lib-index.txt')"
	echo $files
	grep '^[ *]*@' $files
) | tee "$3" | redo-stamp
