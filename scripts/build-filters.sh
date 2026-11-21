#!/usr/bin/env bash
set -euo pipefail

FILTER_REPO_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
exec bash "$FILTER_REPO_ROOT/public/audio/moog-filters/huovilainen/build.sh" "$@"
