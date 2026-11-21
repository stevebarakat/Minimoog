#!/usr/bin/env bash
# MIT: original Minimoog build tooling. The compiled filter is LGPL-2.1-or-later.
set -euo pipefail

FILTER_BUILD_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
FILTER_BUILD_MODE="${1:-build}"
case "$FILTER_BUILD_MODE" in
  build|--check) ;;
  *) echo "Usage: bash build.sh [--check]" >&2; exit 2 ;;
esac
if [[ $# -gt 1 ]]; then
  echo "Usage: bash build.sh [--check]" >&2
  exit 2
fi

FILTER_COMPILER="${EMCC:-emcc}"
FILTER_COMPILER_VERSION="$("$FILTER_COMPILER" --version)"
if ! [[ "$FILTER_COMPILER_VERSION" =~ 4\.0\.14(-git)?([[:space:]]|$) ]]; then
  echo "This artifact is built with Emscripten 4.0.14; install that version using emsdk." >&2
  exit 1
fi

FILTER_BUILD_TMP="$(mktemp -d)"
trap 'rm -rf -- "$FILTER_BUILD_TMP"' EXIT
cd -- "$FILTER_BUILD_DIR"
# SIDE_MODULE imports env.memory and math functions supplied by the AudioWorklet.
# A standalone build exports its own memory and is incompatible with that loader.
"$FILTER_COMPILER" -O3 -sSIDE_MODULE=1 huovilainenFilterKernel.c \
  -o "$FILTER_BUILD_TMP/huovilainenFilterKernel.wasm"

if [[ "$FILTER_BUILD_MODE" == --check ]]; then
  if ! cmp -s huovilainenFilterKernel.wasm "$FILTER_BUILD_TMP/huovilainenFilterKernel.wasm"; then
    echo "WASM differs from its source/build settings. Rebuild and rerun the filter tests." >&2
    exit 1
  fi
  echo "Huovilainen WASM matches its source and build settings byte-for-byte."
else
  chmod 644 "$FILTER_BUILD_TMP/huovilainenFilterKernel.wasm"
  mv -- "$FILTER_BUILD_TMP/huovilainenFilterKernel.wasm" huovilainenFilterKernel.wasm
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum huovilainenFilterKernel.c huovilainenFilterKernel.wasm build.sh > SHA256SUMS
  else
    shasum -a 256 huovilainenFilterKernel.c huovilainenFilterKernel.wasm build.sh > SHA256SUMS
  fi
  echo "Built Huovilainen WASM and updated SHA256SUMS."
fi
