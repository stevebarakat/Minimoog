# Minimoog Model D Emulator

A web-based emulation of the classic Minimoog Model D analog synthesizer, leveraging the Web Audio API for authentic sound synthesis and performance.

[![Node.js](https://img.shields.io/badge/Node.js-18.0.0+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.1-646CFF.svg)](https://vitejs.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-3.1.4-green.svg)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Demo

Experience the Minimoog Model D emulator in your browser:

1. **Live Demo**: [minimoog.app](https://www.minimoog.app/)
2. **Local Development**: Follow the [Quick Start](#quick-start) guide below

<p align="center">
  <img src="public/images/minimoog-real.webp" alt="Original Minimoog Model D" width="100%"/><br/>
  <em>Actual Minimoog Model D (hardware)</em>
</p>

<p align="center">
  <img src="public/images/minimoog-screenshot.webp" alt="Minimoog Emulator Screenshot" width="100%"/><br/>
  <em>Web-based Minimoog Model D Emulator (this project)</em>
</p>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [Third-Party Credits](#third-party-credits)
- [References](#references)
- [License](#license)

---

## Overview

This project recreates the iconic Minimoog Model D synthesizer in the browser using modern web technologies. It provides an authentic recreation of the original instrument's sound and interface, making the legendary synthesizer accessible to anyone with a web browser.

- **Authentic Sound**: Faithful recreation of the synthesizer's oscillator characteristics and filter behavior
- **Real-time Performance**: Low-latency audio processing for live performance
- **MIDI Enabled**: Works out of the box with most MIDI keyboards (plug and play).
- **Modern Web Standards**: Built with React 19, TypeScript, and Web Audio API
- **Open Source**: Complete source code available for learning and modification

---

## Features

### Core Synthesis

- **Three-Oscillator Architecture**: Classic waveforms (sawtooth, triangle, square, reverse sawtooth, pulse)
- **Authentic Mixer**: Individual volume controls for oscillators, noise, and external input
- **4-Pole Ladder Filter**: Authentic Minimoog ladder filter using Huovilainen WASM implementation with resonance and key tracking
- **Dual Envelope Generators**: Filter and loudness contours with authentic response curves

### Modulation & Control

- **Modulation Sources**: LFO, noise, oscillator 3, and filter envelope
- **Performance Controls**: Glide, pitch bend, and modulation wheel
- **Virtual Keyboard**: On-screen keyboard with mouse and touch support
- **MIDI Support**: Connect your MIDI keyboard for real-time control

### Effects & Processing

- **Digital Delay**: Variable delay time with feedback control for echo effects
- **Convolution Reverb**: High-quality reverb with tone filtering and adjustable mix

### User Experience

- **Interactive Onboarding**: Step-by-step guided tour for new users with 13 comprehensive tutorial steps
- **Preset System**: Curated collection of classic Minimoog sounds
- **URL State Persistence**: Save and share your current settings via URL parameters
- **Responsive Design**: Works on desktop and mobile devices
- **Logarithmic Controls**: Natural-feeling frequency, filter, and volume controls

---

## Quick Start

### Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **npm** or **yarn**: Package manager
- **Web Browser**: Chrome, Firefox, Safari, Edge (any modern browser with Web Audio API support)

### Installation

```bash
# Clone the repository
git clone "https://github.com/stevebarakat/minimoog"
cd minimoog

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

---

### Development Scripts

#### Development & Build

```bash
npm run dev           # Start development server with hot reload (includes --host)
npm run build         # Build for production
npm run preview       # Preview production build locally
```

#### Testing

```bash
npm run test          # Run tests with Vitest
npm run test:ui       # Run tests with interactive UI
npm run test:coverage # Run tests with coverage report
```

#### Code Quality & Linting

```bash
npm run lint          # Run ESLint for JavaScript/TypeScript code quality
npm run lint:css      # Run Stylelint for CSS and auto-fix issues
npm run lint:css:check # Check CSS without auto-fixing
npm run analyze:css   # Analyze CSS structure and organization
```

---

## Contributing

Want to help improve the Minimoog Model D emulator?

### How to Contribute

1. **Fork the Repository**: Create your own fork of the project
2. **Create a Branch**: Make changes in a feature branch
3. **Follow Guidelines**: Adhere to coding standards and practices
4. **Test Changes**: Ensure all tests pass
5. **Submit PR**: Create a pull request with clear description

### Areas for Contribution

- **Accessibility**: Improve UX for tabbed navigation and keyboard controls
- **Design**: Improve UI for smaller screens
- **Misc**: Any other ideas are welcome!

---

## Third-Party Credits

This project incorporates several third-party libraries, algorithms, and research contributions:

### 🎵 Audio Filter Algorithms

#### Huovilainen Filter Implementation

- **Research**: Based on work by Antti Huovilainen (2004, 2010)
- **Implementation**: Adapted from CSound5 implementation by Victor Lazzarini
- **License**: LGPLv3 (original CSound5 implementation)
- **Reference**: "Digital Implementation of the Moog Ladder Filter" and "Improved Digital Implementation of the Moog Ladder Filter"

#### Filter Research Foundation

- **Repository**: Research inspired by [ddiakopoulos/MoogLadders](https://github.com/ddiakopoulos/MoogLadders)
- **Multiple Implementations**: Various filter models studied including Stilson, Krajeski, and others
- **Current Choice**: Huovilainen model selected for optimal authenticity and performance
- **License**: MIT (original research repository)

### 🛠️ Core Libraries

#### State Management

- **[Zustand](https://github.com/pmndrs/zustand)** - Lightweight state management
- **License**: MIT

#### UI Components

- **[Radix UI](https://www.radix-ui.com/)** - Accessible UI primitives
  - `@radix-ui/react-toast` - Toast notifications
  - `@radix-ui/react-tooltip` - Tooltip components
  - `@radix-ui/react-dialog` - Modal component
- **[react-rnd](https://github.com/bokuweb/react-rnd)** - Resizable and draggable component
- **License**: MIT

#### Utilities

- **[clsx](https://github.com/lukeed/clsx)** - Conditional className utility
- **[loglevel](https://github.com/pimterry/loglevel)** - Lightweight logging
- **[Lucide React](https://lucide.dev/)** - Icon library
- **License**: MIT

#### Development Tools

- **[React](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Vite](https://vitejs.dev/)** - Build tool
- **[Vitest](https://vitest.dev/)** - Testing framework
- **License**: MIT

### 🎛️ Audio Processing

#### Enhanced Tanh Saturation

- **Algorithm**: Standard Math.tanh() with enhanced WASM implementation for filter
- **Purpose**: Provides authentic analog saturation characteristics with harmonic enhancement
- **Implementation**: JavaScript Math.tanh() for effects, enhanced tanh in WASM for critical filter processing

#### Pink Noise Generation

- **Algorithm**: 1/f frequency distribution noise generation
- **Purpose**: Natural-sounding noise similar to ocean waves, rain, etc.
- **Implementation**: Multi-pole filtering of white noise

#### White Noise Generation

- **Algorithm**: Uniform frequency distribution noise
- **Purpose**: General noise generation for synthesizer effects
- **Implementation**: Simple random number generation

#### Web Audio API

- **Native Audio Processing**: Built-in browser audio processing capabilities for effects and synthesis
- **Purpose**: Provides additional audio processing capabilities and effects
- **License**: MIT

### 📚 Research References

- **Minimoog Model D**: Original hardware synthesizer by Moog Music Inc.
- **Web Audio API**: Standard for web-based audio processing
- **Audio Worklets**: Real-time audio processing in web browsers
- **WebAssembly**: For high-performance audio algorithms

### 📄 License Compliance

All third-party code is used in compliance with their respective licenses:

- **MIT License**: Most libraries and utilities
- **LGPLv3**: Huovilainen filter implementation (CSound5 derived)

---

## Documentation

### Core Documentation

- [Performance Optimization Guide](docs/performance-optimization-guide.md) - Comprehensive guide to performance optimizations
- [Audio Worklet Integration Guide](docs/audio-worklet-integration-guide.md) - Guide to integrating audio worklets
- [Effects Guide](docs/effects-guide.md) - Overview of available effects and their usage

### Implementation Guides

- [Audio Buffer Optimization](docs/audio-buffer-optimization-implementation.md) - Audio buffer optimization techniques
- [Audio Param Optimization](docs/audio-param-optimization-implementation.md) - Audio parameter optimization strategies
- [Audio Worklet Optimization](docs/audio-worklet-optimization-implementation.md) - Audio worklet performance optimization
- [Node Pooling Implementation](docs/node-pooling-implementation.md) - Audio node pooling for performance
- [Moog Filter Implementations](docs/moog-filter-implementations.md) - Different filter implementation approaches
- [Authentic Minimoog Filter Improvements](docs/authentic-minimoog-filter-improvements.md) - Filter authenticity improvements

### Component Documentation

- [Dropdown Component](docs/dropdown-readme.md) - Dropdown component implementation details
- [Onboarding Component](docs/onboarding-readme.md) - User onboarding system documentation
- [Configuration](docs/config-readme.md) - Project configuration and constants
- [CSS Modules Best Practices](docs/css-modules-best-practices.md) - CSS modules usage guidelines

### Audio System Documentation

- [Audio Processors](docs/audio-processors-readme.md) - Audio processor implementations
- [Noise Generators](docs/noise-generators-readme.md) - Noise generation algorithms
- [Development Storage](docs/development-storage.md) - Development data storage patterns
- [Aux Output](docs/aux-output.md) - Secondary audio output system
- [Moog Filters](docs/moog-filters-readme.md) - Filter algorithm implementations
- [Images](docs/images-readme.md) - Image assets and usage

---

## References

### Technical References

- [Web Audio API Performance and Debugging Notes](https://padenot.github.io/web-audio-perf/)
- [Minimoog Model D Manual](https://api.moogmusic.com/sites/default/files/2022-11/Minimoog_Model_D_Manual.pdf)
- [Web Audio API Documentation (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

### Project Configuration

- [Project Preferences](dev-preferences.json): Development preferences and guidelines
- [Vite Configuration](vite.config.ts): Build and development configuration
- [TypeScript Configuration](tsconfig.json): TypeScript compiler settings

### Audio Synthesis

- [4-Pole Ladder Filter](https://en.wikipedia.org/wiki/Ladder_filter): Minimoog's iconic ladder filter implementation
- [Analog Synthesizer Architecture](https://en.wikipedia.org/wiki/Analog_synthesizer): Overview of analog synthesis
- [Web Audio API Worklets](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet): Custom audio processing

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### License Summary

The MIT License allows you to:

- Use the software for any purpose
- Modify the software
- Distribute the software
- Distribute modified versions
- Use it commercially

The only requirement is that the original license and copyright notice be included in all copies or substantial portions of the software.

---

_Built by[ S.Barakat](https://stevebarakat.com)_
