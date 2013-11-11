set -eu
redo-always
(
	files="$(find . -type f -name '*.sjs' -o -name 'sjs-lib-index.txt')"
	echo $files
	echo "$files" | while read f; do
		if [ -f "$f.stamp.do" ]; then
			redo-ifchange "$f.stamp"
		fi
	done
	echo "$files" | tr '\n' '\0' | xargs -0 grep '^[ *]*@'
) | tee "$3" | redo-stamp
