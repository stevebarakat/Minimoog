# Audio filter notices

## Huovilainen filter (Csound-derived)

- Original implementation: Copyright (c) Victor Lazzarini, 2004, for Csound.
- C++ adaptation: Dimitri Diakopoulos and MoogLadders contributors.
- Minimoog C/WASM adaptation: Steve Barakat; parameter/envelope handling,
  smoothing, DC blocking, and enhanced saturation, present since 2025-09-21.
- On 2026-11-21 the source coefficient values and side-module build flags were
  restored to match the previously deployed filter's processing behavior.
- License: **LGPL-2.1-or-later** for `huovilainen/huovilainenFilterKernel.c`
  and `huovilainen/huovilainenFilterKernel.wasm`. The full LGPL 2.1 is in
  [COPYING.LESSER](COPYING.LESSER). This component is not MIT-only or Unlicense.
- Original application/worklet code remains [MIT](LICENSE.MIT); the default MoogLadders
  [Unlicense](UNLICENSE) is preserved without overriding the LGPL grant.

This library is free software: you may redistribute it and/or modify it under
the GNU Lesser General Public License version 2.1 or, at your option, any later
version. It is distributed WITHOUT ANY WARRANTY, including the implied
warranties of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

## Upstream evidence

Verified on 2026-11-21:

1. Csound's [original `Opcodes/newfils.c`](https://github.com/csound/csound/blob/77394ba1f81557e0c6a054a7f193ac41aad5f035/Opcodes/newfils.c)
   identifies Victor Lazzarini, 2004, and explicitly grants LGPL **2.1 or any
   later version**. Its [COPYING](https://github.com/csound/csound/blob/77394ba1f81557e0c6a054a7f193ac41aad5f035/COPYING)
   supplies the full license reproduced here without changes.
2. MoogLadders' [Huovilainen header](https://github.com/ddiakopoulos/MoogLadders/blob/a968ec6ddfe1cf9b228faea277cb0e66a060639a/src/HuovilainenModel.h)
   identifies the Csound origin and LGPLv2.1. Its [README](https://github.com/ddiakopoulos/MoogLadders/blob/a968ec6ddfe1cf9b228faea277cb0e66a060639a/README.md)
   table instead says LGPLv3. Version 3 is a permitted later version; the
   original source grant is not LGPLv3-only. This project preserves the explicit
   LGPL-2.1-or-later grant, not a blanket MIT or Unlicense designation.

These pinned revisions document the upstream grants, not an assertion that
Minimoog imported those exact revisions without modifications.

## Corresponding source, rebuilding, and modification

The [readable notice page](NOTICE.html) links to the full license and sources.
Every current deployment includes the C source, `huovilainen/build.sh`, the
worklet interfaces, this notice, the full LGPL, and build checksums beside the
WASM. See [build instructions](huovilainen/README.md) for the exact compiler,
flags, exported interface, and verification command.

The filter is a separate imported-memory WebAssembly module. You can replace it
with an interface-compatible modified build and run a modified application.
Minimoog adds no restriction on modification or reverse engineering for debugging
those modifications. The original application's MIT source is available at
https://github.com/stevebarakat/Minimoog; use the revision corresponding to a
release rather than substituting a moving upstream version for matching source.

When redistributing, preserve these notices, the license, and complete matching
source, build instructions, and relevant interfaces under the LGPL's applicable
requirements. The current source and WASM are recorded in `SHA256SUMS` and the
build check recompiles and compares the module byte-for-byte.

## Removed material

The current tree no longer ships the unused MusicDSP, Simplified/DAFX, Oberheim,
Stilson, Microtracker, Krajeski, Improved, or improved-model filters, the reference
C++ collection and its dependencies, research PDFs, or backup WASM artifacts.
This removes the unresolved/custom-license and unmatched-source artifacts from
current distributions; it does not relicense those works or change past releases.
