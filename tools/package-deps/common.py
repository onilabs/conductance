# used in both select.sjs, and select.py
import os,sys, subprocess
devnull = open(os.devnull, 'w')

ZI = ['0install']
ZI.append('--refresh')

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

def gather(tempdir, builddir, name):
	# run(['tree',tempdir])
	# We start with:
	#   <tempdir>/node_modules/<dep-name>
	# But we want:
	#   - <builddir>/<dep-name>
	source = os.path.join(tempdir, 'node_modules', name)
	dest = os.path.join(builddir, name)
	assert os.path.exists(source)
	assert os.path.exists(os.path.dirname(dest))
	os.rename(source, dest)

def install(packages, node_version, tempdir, destdir):
	node_feed = 'http://gfxmonk.net/dist/0install/node.js.xml'
	node_version_range = node_version + '..!'+node_version+'-post'
	os.environ['DISPLAY']='' # prevent GUI
	try:
		cmd = ZI + ['select', '--version-for', node_feed, node_version_range, node_feed]
		print("cmd: %r" % (cmd,))
		subprocess.check_call(cmd)
	except subprocess.CalledProcessError:
		print("node.js not yet available - compiling it...")
		#XXX 0compile doesn't let us specify which node.js version to compile!
		# It'll do the latest, which is hopefully what we want.
		cmd = ZI + ['run', 'http://0install.net/2006/interfaces/0compile.xml', 'autocompile', node_feed]
		print("cmd: %r" % (cmd,))
		subprocess.check_call(cmd)

	cmd = ZI + ['run',
		'--version-for', node_feed, node_version_range,
		'http://gfxmonk.net/dist/0install/npm.xml', 'install']

	for name, ver in packages:
		spec = '%s@%s' % (name, ver)
		cmd.append(spec)

	# npm will install wherever it finds a node_modules dir.
	# Make sure that's right here:
	mkdirp(os.path.join(tempdir, 'node_modules'))

	print("cmd: %r" % (cmd,))
	subprocess.check_call(cmd, cwd=tempdir)

	mkdirp(destdir)
	for name, ver in packages:
		gather(tempdir=tempdir, builddir=destdir, name=name)

