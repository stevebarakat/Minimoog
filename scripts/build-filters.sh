#!/bin/bash

# Build script for Moog filter WASM modules
# Automatically recompiles C source to WASM when changes are detected

set -e

FILTER_DIR="public/audio/moog-filters"
HUOVILAINEN_DIR="$FILTER_DIR/huovilainen"
IMPROVED_MODEL_DIR="$FILTER_DIR/improved-model"

echo "🔧 Building Moog filter WASM modules..."

# Check if emcc is available
if ! command -v emcc &> /dev/null; then
    echo "❌ Error: emcc (Emscripten) not found. Please install Emscripten first."
    echo "   Visit: https://emscripten.org/docs/getting_started/downloads.html"
    exit 1
fi

# Build Huovilainen filter
if [ -f "$HUOVILAINEN_DIR/huovilainenFilterKernel.c" ]; then
    echo "📦 Building Huovilainen filter..."
    cd "$HUOVILAINEN_DIR"
    emcc -O3 -s WASM=1 huovilainenFilterKernel.c -o huovilainenFilterKernel.wasm --no-entry
    echo "✅ Huovilainen filter built successfully"
    cd - > /dev/null
else
    echo "⚠️  Huovilainen filter source not found"
fi

# Build Improved Model filter
if [ -f "$IMPROVED_MODEL_DIR/improvedModelFilterKernel.c" ]; then
    echo "📦 Building Improved Model filter..."
    cd "$IMPROVED_MODEL_DIR"
    emcc -O3 -s WASM=1 improvedModelFilterKernel.c -o improvedModelFilterKernel.wasm --no-entry
    echo "✅ Improved Model filter built successfully"
    cd - > /dev/null
else
    echo "⚠️  Improved Model filter source not found"
fi

echo "🎵 All filters built successfully!"
echo "💡 Tip: Clear your browser cache after rebuilding to ensure new WASM modules are loaded"
