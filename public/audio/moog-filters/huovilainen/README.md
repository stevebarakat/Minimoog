# Huovilainen filter source and build

This is the single filter used by Minimoog. Its C source and WebAssembly module
are **LGPL-2.1-or-later**, derived from Victor Lazzarini's Csound implementation
through MoogLadders. See [notices](../THIRD_PARTY_NOTICES.md) and the full
[LGPL](../COPYING.LESSER). Original application/worklet/build code is MIT.

## Rebuild or modify

Install and activate **Emscripten 4.0.14** using the official
[emsdk instructions](https://emscripten.org/docs/getting_started/downloads.html).
Use `./emsdk install 4.0.14`, `./emsdk activate 4.0.14`, and source `emsdk_env.sh`.
The compiler used for this release reports `4.0.14-git` (Homebrew 4.0.14).

From this directory:

```sh
bash build.sh
bash build.sh --check
```

From a repository checkout, the equivalent commands are `npm run build:filters`
and `npm run check:filters`. Compilation is exactly:

```sh
emcc -O3 -sSIDE_MODULE=1 huovilainenFilterKernel.c -o huovilainenFilterKernel.wasm
```

The side-module setting is essential: the worklets supply `env.memory`,
`env.__memory_base`, and the JavaScript math imports `fmin`, `exp`, and `tanh`.
A standalone `-sWASM=1 --no-entry` build uses a different memory contract and is
not a substitute. No separate Emscripten JavaScript runtime is required.
`SHA256SUMS` records the exact C source, WASM, and build script. The check mode
rebuilds in a temporary directory and does not overwrite the release artifact.
The Node filter tests also verify these hashes. Rebuild verification requires
the matching toolchain; a different compiler/optimizer can change binary bytes.

The canonical source, build script, worklet interfaces, license, notices, and
checksums are shipped in the web app at `/audio/moog-filters/`. You can download
these files, edit the C source, rebuild it, and replace the WASM in a local
checkout or deployment. To build the whole application, run `npm ci`,
`npm run test:filters`, and `npm run build` in a repository checkout.

## Worklet interface

Both worklet JavaScript files alongside this source instantiate the module with
imported memory (64 pages initially, 128 maximum) and base offset zero. The
exported `inputBufferPtr()` and `outputBufferPtr()` return byte offsets for
128-sample `Float32Array` blocks. Call `init()`, write an input block, invoke
`filter()`, and read the output block. Additional exports implement cutoff,
resonance, and envelope controls; their call signatures are in the C source.
Processing and envelope time use the existing 44,100 Hz convention.

The worklet uses a separate, replaceable WASM file. Interface-compatible modified
builds are permitted; Minimoog adds no restriction on modifying the filter or
reverse engineering to debug those changes.

## Source restoration and validation

The previously deployed artifact used a 0.48 cutoff limit, tuning polynomial
coefficients 1.2/0.3/-0.4, amplitude correction coefficients -2.5/1.2, and a
resonance multiplier of 2. The old C source had different values and the build
script omitted `SIDE_MODULE=1`. On 2026-11-21 those source constants and build
flags were restored from the deployed artifact's instructions, and the module
was rebuilt from this source. Unmatched backup binaries and unused alternate
filter sources/artifacts were removed rather than published as corresponding
source for this module.

Regression samples captured from the pre-change deployed binary are kept in
the repository's filter test fixtures. They cover cutoff and resonance sweeps,
impulses, tones, silence, parameter changes, and envelope controls. Tests run
the actual worklet loader and check that processing initializes and produces
filtered audio rather than falling through to its pass-through path. The
existing parameter ranges and sound are preserved; this is not a filter redesign.
