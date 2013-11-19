#!/bin/bash
set -eu
gup -u $BASH_SOURCE
# TODO: windows
# platform_bundles="dist/windows_x64.exe dist/windows_x86.exe dist/linux_x64.tar.gz dist/darwin_x64.tar.gz"
platform_bundles="dist/linux_x64.tar.gz dist/darwin_x64.tar.gz"

