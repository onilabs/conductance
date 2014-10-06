#NOTE: this file get interpolated by select.sjs (using supplant),
# so \{foo} sequences intended for python should be prefixed with a backslash

{common_py}

import tempfile

deps = {versionedDeps}
xdg_tar = {xdg_data_override_tar}
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

	os.environ['XDG_DATA_DIRS'] = os.pathsep.join([
		os.path.join(tempdir, {xdg_data_override}),
		os.environ.get('XDG_DATA_DIRS', '/usr/local/share/:/usr/share/')
	])

	compile_needed = False
	# make sure all deps are cached:
	#compile_needed = True; deps = [] # XXX
	for name, ver in deps:
		feed = dep_url(name)
		from StringIO import StringIO
		try:
			run(ZI + ['select', '--command', '', '--version', ver, feed], stdout=devnull, stderr=subprocess.STDOUT, stdin=devnull)
		except subprocess.CalledProcessError as e:
			print('-- binary failed; running 0compile -- ')
			compile_needed = True

			if sys.platform.lower() == 'win32':
				# windows 0compile can't handle <recipes> in feeds, so pre-download
				# everything we need with the nightly .net version (XXX make portable):
				# XXX this will only work while we have a single compileable dep
				# depending on pure JS deps. figure out something better if that changes.
				print('getting compile selections...')
				run(ZI + ['download', '--source', '--version', ver, feed], stdin=devnull)
			else:
				# other OSes don't need to predownload anything, so just drop out
				break

	feed_path = path.join(tempdir, 'feed.xml')
	with open(feed_path, 'w') as f:
		def mkdep(nv):
			name, ver = nv
			url = dep_url(name)
			return '''<requires interface='\{url}'>
					<version not-before='\{ver}' before='\{ver}-post'/>
				</requires>'''.format(**locals())

		dep_requires = '\\n'.join(map(mkdep, deps))

		# add nodejs restriction
		dep_requires += '''
			<requires interface='http://gfxmonk.net/dist/0install/node.js.xml'>
				<version not-before='{nodeVersion}' before='{nodeVersion}-post' />
			</requires>
		'''
		build_args = '\\n'.join(['<arg>'+dep[0]+'</arg>' for dep in deps])
		feed_contents = '''<?xml version='1.0' ?>
			<interface xmlns='http://zero-install.sourceforge.net/2004/injector/interface'>
				<name>deps</name>
				<summary>deps</summary>
				<description></description>
				<implementation version='0.1' id='.'>
					''' + dep_requires + '''
				</implementation>

				<implementation arch='*-src' version='0.1' id='..'>
					''' + dep_requires + '''
					<command name='compile'>
						<runner interface='http://repo.roscidus.com/python/python'/>
						<arg>-c</arg>
						<arg>'noop'</arg>
					</command>
				</implementation>
			</interface>'''
		f.write(feed_contents)
		#print(feed_contents)


	if compile_needed:
		print('compiling feed...')
		# compile_feed = path.join(tempdir, '0compile.xml')
		# with open(compile_feed, 'w') as f:
		# 	f.write('''<?xml version='1.0' ?>
		# 		<interface xmlns='http://zero-install.sourceforge.net/2004/injector/interface'>
		# 			<name>0compile</name>
		# 			<summary>0compile</summary>
		# 			<description></description>
		# 			<implementation version='0.1' id='.'>
		# 				<!-- fix $PYTHONHOME -->
		# 				<requires interface='http://repo.roscidus.com/python/python'>
		# 					<environment name='PYTHONHOME' mode='replace' value='' />
		# 				</requires>
		# 				<command name='run'>
		# 					<runner interface='http://0install.net/2006/interfaces/0compile.xml'/>
		# 				</command>
		# 			</implementation>
		# 		</interface>''')
		compile_feed = 'http://0install.net/2006/interfaces/0compile.xml'
		run(['0install', 'run', '-v', compile_feed, 'autocompile', feed_path])
	
	# ok, now gather all built deps
	builddir = path.join(tempdir, 'dist')
	for name, ver in deps:
		gather(tempdir=tempdir, builddir=builddir, name=name, version=ver)

	archive_dest = os.path.join(TMPDIR, {tempName})
	print("Creating: " + archive_dest)
	run(TAR + ['czf', archive_dest, '-C', builddir] + os.listdir(builddir))
	
finally:
	rmtree(tempdir)


