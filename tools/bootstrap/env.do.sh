redo-ifchange ./env.do.sh
common=share
scripts="$common/boot.js"
platform_bundles="dist/windows_x64.zip dist/linux_x64.tar.gz dist/osx_x64.tar.gz"
manifest_file="$common/manifest.json"
targets="$platform_bundles $scripts"
set -eu
