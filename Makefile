GUP=tools/gup

all: phony ${GUP}
	@+${GUP} all

%: phony ${GUP}
	@+${GUP} $@

${GUP}: phony
	@+${GUP} -q -u ${GUP}

# remove explicit Makefile rule
Makefile: ;

# hacky target to list all known targets
# (doesn't count wildcard targets, but you don't usually make those manually)
targets: phony
	@find . -name 'gup' -type d -exec \
		find {} -name '*.gup' -type f \; \
		| sed -e 's/\/gup\//\//' -e 's/\.gup$$//' -e 's/^\.\///'

# always rebuild everything
.PHONY: phony
