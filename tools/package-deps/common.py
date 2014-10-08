# used in both select.sjs, and select.py
import os,sys, subprocess
devnull = open(os.devnull, 'w')

ZI = ['0install']
ZI.append('--refresh')

def dep_url(name):
	return 'http://gfxmonk.github.io/0downstream/feeds/npm/%s.xml' % (name,)

def run(cmd, **k):
	print(' + ' + ' '.join(cmd))
	if 'stdin' not in k:
		k['stdin'] = devnull
	subprocess.check_call(cmd, **k)

def mkdirp(p):
	if not os.path.exists(p):
		print("Making: " + p)
		os.makedirs(p)

def add_xdg_dir(p):
	os.environ['XDG_DATA_DIRS'] = os.pathsep.join([p, os.environ.get('XDG_DATA_DIRS', '/usr/local/share/:/usr/share/')])

class __LINE__(object):
	def __repr__(self):
		try:
			raise Exception
		except:
			return str(sys.exc_info()[2].tb_frame.f_back.f_lineno)

__LINE__ = __LINE__()

def gather(tempdir, builddir, name, version):
	path = os.path
	mkdirp(tempdir)
	mkdirp(builddir)

	tempdir = path.join(tempdir, name + '.tmp')
	sels_dir = path.join(builddir, 'zeroinstall-selections')
	mkdirp(sels_dir)
	sel_path = path.join(sels_dir, name + '.xml')
	with open(sel_path, 'w') as s:
		run(ZI + ['select', '--command', '', '--version', version, '--xml', dep_url(name)], stdout=s)
	run(ZI + ['run', '--not-before=0.4.0', '--command', 'gather',
		'http://gfxmonk.net/dist/0install/obligate.js.xml',
		'--verbose',
		'--force',
		'--exclude', 'http://gfxmonk.net/dist/0install/npm.xml',
		'--output', tempdir,
		sel_path
	])

	# run(['tree',tempdir])

	# We now have:
	#   <tempdir>/<dep-module>*
	# But we want:
	#   - <dep-name>/
	#   - <dep-name>/node_modules/<dep-module>*
	# So we bring the named depedency up to the top level:
	build_dest = path.join(builddir, name)
	mkdirp(build_dest)
	for f in os.listdir(os.path.join(tempdir, name)):
		os.rename(os.path.join(tempdir, name, f), os.path.join(build_dest, f))
	os.rmdir(os.path.join(tempdir, name))

	# And move everything else into node_modules:
	nm_path = os.path.join(build_dest, 'node_modules')
	if not os.path.exists(nm_path):
		os.makedirs(nm_path)

	for f in os.listdir(tempdir):
		os.rename(os.path.join(tempdir, f), os.path.join(nm_path, f))

	os.rmdir(tempdir)
