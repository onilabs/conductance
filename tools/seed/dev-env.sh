#NOTE: This file is only used for development
sourced="$(readlink -f "$(dirname "${BASH_SOURCE[0]}")")"
export ETCD_DATA_DIR="$sourced/data/etcd"
