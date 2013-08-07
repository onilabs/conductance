redo-ifchange ./env.do.sh
common=share
platform_bundles="dist/linux_x64.tar.gz dist/darwin_x64.tar.gz"
# TODO: windows
# platform_bundles="dist/windows_x64.exe dist/windows_x86.exe dist/linux_x64.tar.gz dist/darwin_x64.tar.gz"
manifest_file="$common/manifest.json"
targets="$platform_bundles"
set -eu
