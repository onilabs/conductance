set -eu
redo-always
(
	files="$(find . -type f -name '*.sjs' -o -name 'sjs-lib-index.txt')"
	echo $files
	for f in $files; do
		if [ -f "$f.stamp.do" ]; then
			redo-ifchange "$f.stamp"
		fi
	done
	grep '^[ *]*@' $files
) | tee "$3" | redo-stamp
