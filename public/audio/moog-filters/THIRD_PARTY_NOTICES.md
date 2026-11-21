# Third-party filter notices

Original Minimoog application code is MIT-licensed. The bundled filter collection
is not uniformly MIT-licensed. These notices do not replace upstream grants.
JavaScript/npm dependencies retain their package licenses; this document focuses
on the vendored filter code and its C/WebAssembly adaptations.

## Huovilainen filter (Csound-derived)

- Original filter implementation: Victor Lazzarini, 2004, for Csound.
- C++ adaptation: Dimitri Diakopoulos and MoogLadders contributors.
- Minimoog adaptations: C/WebAssembly interface, parameter/envelope handling,
  smoothing, DC blocking, and saturation changes; present in this repository
  from 2025-09-21. Licensing notices clarified 2026-11-21.
- License: **GNU Lesser General Public License version 2.1 or, at your option,
  any later version (`LGPL-2.1-or-later`)**. See `COPYING.LESSER` beside this file.
- Applies to `huovilainen/huovilainenFilterKernel.c`, its compiled `.wasm`
  artifacts (including the retained `.wasm.backup-working` artifact), and the
  corresponding source in `resources/moog-ladder-filters/huovilainen/`.
  The reference C++ `resources/moog-ladder-filters/src/HuovilainenModel.h`
  is also Csound-derived and is not covered by the collection's default Unlicense.
- `public/audio/moog-filters/improved-model/improvedModelFilterKernel.c` also
  reuses the Huovilainen stage/delay processing implementation. That derivative
  and its `.wasm` are covered by the same LGPL terms, despite the file's
  additional D'Angelo/Valimaki research attribution.

### Upstream evidence and version discrepancy

Verified on 2026-11-21:

1. [Historical Csound `Opcodes/newfils.c`](https://github.com/csound/csound/blob/77394ba1f81557e0c6a054a7f193ac41aad5f035/Opcodes/newfils.c)
   explicitly permits LGPL **2.1 or any later version**, and names Victor
   Lazzarini, 2004. Its [COPYING](https://github.com/csound/csound/blob/77394ba1f81557e0c6a054a7f193ac41aad5f035/COPYING)
   supplies the full LGPL 2.1 text reproduced here.
2. [MoogLadders `HuovilainenModel.h`](https://github.com/ddiakopoulos/MoogLadders/blob/a968ec6ddfe1cf9b228faea277cb0e66a060639a/src/HuovilainenModel.h)
   identifies the Csound origin and LGPLv2.1. Its
   [README](https://github.com/ddiakopoulos/MoogLadders/blob/a968ec6ddfe1cf9b228faea277cb0e66a060639a/README.md)
   table instead says LGPLv3. Version 3 is permitted by Csound's “or later”
   grant; the table is not evidence that the original grant was LGPLv3-only.
   This project preserves the explicit LGPL-2.1-or-later source grant.
3. MoogLadders' default Unlicense applies only where a file does not state
   different terms; it does not relicense the Csound-derived implementation.

These pinned upstream revisions are evidence of the grants, not a claim that
Minimoog imported those exact revisions without modifications.

## Other bundled material

Paths below are relative to the repository root. The deployed copies under
`public/audio/moog-filters/<model>/` and reference copies under
`resources/moog-ladder-filters/<model>/` retain the underlying model's terms.
Local adaptations do not turn third-party code into MIT-only code.

| Material | Upstream terms / scope |
| --- | --- |
| MoogLadders collection infrastructure | Default Unlicense, except file-specific notices. Original text remains at `resources/moog-ladder-filters/LICENSE`; a copy is supplied here as `UNLICENSE`. |
| Stilson, Microtracker, Krajeski models and their C/WASM adaptations | Unlicense/public-domain grants recorded by upstream; original author notices reproduced below. |
| `src/ImprovedModel.h` and `improved/improvedFilterKernel.c` adaptations | ISC, copyright 2012 Stefano D'Angelo; full notice below. This is distinct from the LGPL-derived `improved-model/` implementation. |
| `src/RKSimulationModel.h` | BSD-2-Clause, copyright 2015 Miller Puckette; full notice preserved in that header. |
| `src/RingBuffer.h` | BSD-style notice, copyright 2014 The Cinder Project; full notice preserved in that header. |
| `third_party/rtaudio/RtAudio.h` and `.cpp` | MIT-style notice, copyright 2001–2014 Gary P. Scavone; full notice preserved in the files. |
| `src/SimplifiedModel.h` and `simplified/` C/WASM adaptations | Custom DAFX/Wiley notice: educational purposes; commercial applications require further permission. Not MIT, Unlicense, or a general commercial-use grant. |
| `src/OberheimVariationModel.h` and `oberheim/` C/WASM adaptations | Custom Will Pirkle permission quoted below; retain the original notice. |
| `src/MusicDSPModel.h` and `musicdsp/` C/WASM adaptations | **Unresolved upstream licensing.** The header says “unlicensed and uncopyright” and suggests CC-BY-SA without a version or a verified grant. Neither a particular CC license nor MIT is asserted here. |
| `resources/moog-ladder-filters/research/*.pdf` | Research/reference papers; not covered by the application's MIT license or the collection's Unlicense. Redistribution rights must be checked separately. |

### Preserved model notices

#### Stilson

Copyright (c) 2003, David Lowenfels. Released as the moog~ pd extern.
Upstream records a 2019-06-14 email granting public-domain/Unlicense-style use.
See `resources/moog-ladder-filters/src/StilsonModel.h` for the original statement.

#### Microtracker

Based on an implementation by Magnus Jonsson:
https://github.com/magnusjonsson/microtracker (Unlicense, as recorded upstream).

#### Krajeski

Upstream records Aaron Krajeski's 2018-04-21 statement that the work is under
no copyright and may be used however desired. The original statement remains
in `resources/moog-ladder-filters/src/KrajeskiModel.h`.

#### Improved model — ISC notice

Copyright 2012 Stefano D'Angelo <zanga.mail@gmail.com>

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THIS SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

#### Simplified — custom notice

-------------------------------------------------------------------------
 * This source code is provided without any warranties as published in
 * DAFX book 2nd edition, copyright Wiley & Sons 2011, available at
 * http://www.dafx.de. It may be used for educational purposes and not
 * for commercial applications without further permission.
 * -------------------------------------------------------------------------

#### Oberheim — custom permission

Upstream links to:
http://www.willpirkle.com/forum/licensing-and-book-code/licensing-and-using-book-code/

The upstream header quotes permission to use code from the FX and Synth books
without licensing or fees, for personal or commercial plugin development.
This is a custom permission, not a grant by Minimoog to relicense that code MIT.
The original wording is preserved in `src/OberheimVariationModel.h` in the
reference collection.

## Source, rebuilding, and redistribution

The checked-in Huovilainen C source is served beside its WASM at
`/audio/moog-filters/huovilainen/huovilainenFilterKernel.c`.
The improved-model derivative source is similarly available at
`/audio/moog-filters/improved-model/improvedModelFilterKernel.c`.
The license and these notices are served at `/audio/moog-filters/COPYING.LESSER`
and `/audio/moog-filters/THIRD_PARTY_NOTICES.md`.

Source for the complete application, worklet interfaces, and build scripts:
https://github.com/stevebarakat/Minimoog
Use the revision corresponding to the deployment, not an unrelated latest copy.
The C source files contain their Emscripten compilation commands; from the
repository root, `bash scripts/build-filters.sh` rebuilds the Huovilainen and
improved-model modules. The worklets load separate WASM files that can be
replaced with interface-compatible modified builds. No restriction on modifying
these LGPL components or reverse engineering to debug those modifications is
added by Minimoog's license.

When redistributing binaries, supply the matching modified source, relevant
interfaces and build instructions, license text, and required notices under the
applicable LGPL provisions. A link to a moving upstream branch does not replace
matching source. The checked-in `huovilainen/huovilainenFilterKernel.wasm` was not reproduced
by the documented command with Emscripten 4.0.14 during this audit. Its code,
imports, and other sections differ from that build, so the difference cannot
be attributed just to metadata. This does not establish whether an older
compiler/configuration or a different source produced it. The retained
`huovilainenFilterKernel.wasm.backup-working` artifact likewise has no verified
matching source/build provenance. Establish matching source and build settings
or replace these binaries with tested builds before claiming the corresponding
source requirement is fully satisfied. The `improved-model/` binary, in contrast,
was reproduced byte-for-byte with the documented command and that compiler.
No precompiled binary was changed by this notice-only update.

## Remaining provenance questions

This notice records the evidence available in upstream source; it is not a
blanket certification that every bundled artifact has cleared permissions.
MusicDSP's suggested license, commercial permission for the DAFX Simplified
model, research PDF redistribution, and exact source/build provenance of
precompiled artifacts need separate confirmation before redistribution that
relies on those permissions. Unused files in `public/` are still shipped by
Vite. Their presence here does not make them MIT-licensed.
