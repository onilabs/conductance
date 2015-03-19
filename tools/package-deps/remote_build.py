#NOTE: this file get interpolated by select.sjs (using supplant),
# so \{foo} sequences intended for python should be prefixed with a backslash

{common_py}

import tempfile

deps = {versionedDeps}
xdg_tar = {xdg_data_override_tar}
node_version = "{nodeVersion}";
TAR=['0install','run','http://gfxmonk.net/dist/0install/bsdtar.xml']
TMPDIR=tempfile.gettempdir()
if sys.platform == 'darwin':
	TAR=['tar']
	TMPDIR='/tmp' # No funny business, OSX

path = os.path
os.environ['PATH'] = os.pathsep.join([
	'/usr/local/bin', # OSX
	os.environ['PATH']
])


tempdir = tempfile.mkdtemp()
try:
	if xdg_tar is not None:
		run(TAR + ['xvzf', xdg_tar, '-C', tempdir])
	else:
		print("No XDG overrides")

	add_xdg_dir(os.path.join(tempdir, {xdg_data_override}))

	builddir = path.join(tempdir, 'dist')
	install(deps, node_version, tempdir=tempdir, destdir=builddir)

	archive_dest = os.path.join(TMPDIR, {tempName})
	print("Creating: " + archive_dest)
	run(TAR + ['czf', archive_dest, '-C', builddir] + os.listdir(builddir))
	
finally:
	# print("LEFT dir: " + tempdir)
	rmtree(tempdir)


