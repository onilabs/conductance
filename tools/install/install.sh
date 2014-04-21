#!/bin/bash
# TO install from the web directly, use:
# curl URL | bash -e
#
# Or, if your shell doesn't support that syntax:
# wget -o install URL && bash ./install
set -e

# grab input from /dev/tty, as stdin may be the script itself
STDIN=/dev/tty
if [ -n "$CONDUCTANCE_HEADLESS" ]; then
  STDIN=/dev/fd/0
fi

function log () {
  echo "$@" >&2
}

TMP_TAR="/tmp/conductance-install-$$.tar.gz"
function cleanup () {
  log "Install failed."
  if [ -e "$TMP_TAR" ]; then
    rm -f "$TMP_TAR"
  fi
}

trap cleanup EXIT

# OS Check. Put here because here is where we download the precompiled
# bundles that are arch specific.
UNAME=$(uname)
if [ "$UNAME" != "Linux" -a "$UNAME" != "Darwin" ] ; then
    log "Sorry, this OS is not supported."
    exit 1
fi

PLATFORM="${OS}_x64"
if [ "$UNAME" = "Darwin" ] ; then
    OS=darwin
    if [ "1" != "$(sysctl -n hw.cpu64bit_capable 2>/dev/null || echo 0)" ] ; then
        # Can't just test uname -m = x86_64, because Snow Leopard can
        # return other values.
        log "Conductance currently only supports 64-bit Intel processors when running on OSX."
        exit 1
    fi
elif [ "$UNAME" = "Linux" ] ; then
    OS=linux
    arch="$(uname -m)"
    if [ "$arch" = "i686" ]; then
      PLATFORM="${OS}_x86"
    elif [ "$arch" != "x86_64" ] ; then
        log "Unsupported architecture: $arch"
        log "Conductance currently only supports i686 and x86_64 when running on Linux"
        exit 1
    fi
fi

DEST="$HOME/.conductance"
if [ "$#" -gt 0 ]; then
  DEST="$1"
fi

if [ -e "$DEST" ]; then
  log "This installer will REMOVE the existing contents at $DEST"
  echo -n "Continue? [y/N] " >&2
  read res <"$STDIN"
  log
  if [ 'y' = "$res" -o Y = "$res" ]; then
    true
  else
    log "Cancelled."
    trap - EXIT
    exit 1
  fi
fi

log "Installing to $DEST ..."

TARBALL="${PLATFORM}.tar.gz"
PROTOCOL=https
if [ "${CONDUCTANCE_FORCE_HTTP:-}" = "1" ]; then
  PROTOCOL=http
fi
URL="$PROTOCOL://conductance.io/install/$TARBALL"
log "Downloading $URL ..."
curl --progress-bar "$URL" -o "$TMP_TAR"

# dry-run unpacking to /dev/null, to make sure entire file is present
if tar -xzf "$TMP_TAR" --to-stdout >/dev/null; then
  true
else
  log "Server sent an invalid archive - try running this installer again later."
  exit 1
fi

rm -rf "$DEST"
mkdir -p "$DEST"
tar -xzf "$TMP_TAR" -C "$DEST"
rm -f "$TMP_TAR"
trap - EXIT
exec bash "$DEST/share/install.sh" <"$STDIN"

