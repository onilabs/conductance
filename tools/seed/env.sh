#NOTE: This file is only used for development
#      When deployed, it will be overwritten with the
#      "real" paths in /var/conductance-seed

sourced="$(dirname "${BASH_SOURCE[0]}")"
export ETCD_BIN="$sourced/tools/etcd/bin/etcd"
export ETCD_DATA_DIR="$sourced/data/etcd"
