redo-ifchange ./env.do.sh
common=share
platform_bundles="dist/windows_x64.zip dist/linux_x64.tar.gz dist/darwin_x64.tar.gz"
manifest_file="$common/manifest.json"
targets="$platform_bundles"
set -eu
