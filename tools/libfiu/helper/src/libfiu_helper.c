#include <stdlib.h>
#include <stdio.h>
#include <fiu-control.h>
#include <pthread.h>		/* mutexes */
#include <sys/time.h>		/* gettimeofday() */
#include <limits.h>		/* ULONG_MAX */
#include <errno.h>
#include <string.h>

#define trace(...) if (enable_debug) { fprintf(stderr, __VA_ARGS__); fflush(stderr); }

/* from libfiu source */
static unsigned int randd_xn = 0xA673F42D;
static void prng_seed(void) {
	struct timeval tv;
	gettimeofday(&tv, NULL);
	randd_xn = tv.tv_usec;
}
static double randd(void) {
	randd_xn = 1103515245 * randd_xn + 12345;
	return (double) randd_xn / UINT_MAX;
}
static void atfork_child(void) { prng_seed(); }



static double failure_rate = -1;
static double post_failure_rate = -1;
static int suppress_error = 0;
static int enable_debug = 0;

int custom_fiu_filter(
		const char *name,
		int *failnum,
		void **failinfo,
		unsigned int *flags) {
	if (suppress_error) return 0;

	static int has_failed = 0;
	double threshold = has_failed ? post_failure_rate : failure_rate;
	double r = randd();

	suppress_error++;
	char errdesc[100];
	strerror_r(errno, errdesc, sizeof(errdesc));
	trace("[%s] rand() -> %f, threshold=%f, e=%s\n", name, r, threshold, errdesc);
	suppress_error--;

	if (r < threshold) {
		has_failed = 1;
		return 1;
	}
	return 0;
}



int install_fiu_helper(double failrate, double pfailrate, int debug) {
	if (pthread_atfork(NULL, NULL, atfork_child) != 0) {
		return -1;
	}
	prng_seed();
	failure_rate = failrate;
	post_failure_rate = pfailrate;
	enable_debug = debug;
	return fiu_enable_external("posix/io/*", 1, NULL, 0, custom_fiu_filter);
}

void failsafe_print(char* s) {
	suppress_error++;
	printf("%s\n", s);
	suppress_error--;
}



