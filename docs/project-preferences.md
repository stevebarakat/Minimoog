# Project Preferences

This document outlines the coding standards, architectural decisions, and development preferences for the Minimoog project.

## Styling

- **Color Format**: Use HSL color values
- **CSS Framework**: CSS Modules
- **Global Styles**: Respect existing global styles

## Code Generation

### Avoided Packages

- `tailwindcss`

### Preferred Packages

- `postcss`
- `autoprefixer`
- `postcss-preset-env`
- `stylelint`
- `stylelint-order`
- `stylelint-config-standard`
- `react-router-dom`
- `zustand`

## Documentation

- **Comments**: Do not include comments in generated code

## TypeScript

- **Type Preferences**: Prefer type aliases over interfaces
- **Function Declarations**: Prefer function declarations over arrow functions

## React

- **Component Props**: Prefer component props pattern
- **Event Handlers**: Prefer event handlers over useEffect for React events
- **useEffect Guidelines**:
  - Prefer event handlers to useEffect
  - useEffect is not supposed to be used for working with events inside React - use event handlers for that
  - useEffect should only be used for syncing with APIs outside of React (e.g., Web Audio API)
- **useEffect Dependencies**:
  - One concern per useEffect
  - If the dependency list is long or mixes unrelated values, split it into smaller effects
  - Use useMemo/useCallback to reduce dependencies to only what's meaningful
  - A long dependency list isn't bad if all values belong to the same concern and every change truly needs to trigger the effect

## UI

- **Icon Library**: Lucide

## Programming Paradigm

- **Paradigm**: Functional programming
- **Immutability**: Prefer immutable data structures
- **Pure Functions**: Prefer pure functions
- **Side Effects**: Avoid side effects where possible

## Principles

### Single Responsibility

- **Component Separation**: Enforce component separation
- **Max Component Lines**: 200 lines
- **Max Function Lines**: 50 lines
- **Pure Functions**: Prefer pure functions

## Structure

### File Organization

- **Colocate Files**: Place related files (component, styles, tests, hooks, types, audio, store, utils, etc.) in the same directory to improve discoverability and maintainability
- **Index Files**: Each component directory should include an index.ts file that re-exports the default component (e.g., `export { default } from './ComponentName';`) to enable cleaner and more consistent imports

## Testing

### Focus Areas

- **Behavior Testing**: Focus on behavior rather than implementation details
- **Avoid Implementation Details**: Do not test internal implementation details

### Layered Testing Strategy

#### Unit Tests - DSP Layer

Test oscillators, filters, envelopes, and mixer modules in isolation. Assert Web Audio API node connections, parameter values, and range enforcement. Use OfflineAudioContext where possible to render and inspect short audio buffers.

#### Integration Tests - Audio Graph

Create small synth patches and verify that parameter changes propagate through the graph. Confirm oscillator frequencies, filter cutoffs, and envelope shapes match expected outputs.

#### UI Behavior Tests - User Interactions

Use React Testing Library to simulate clicks, knob drags, and key presses. Assert these actions trigger correct DSP parameter updates and start/stop audio as expected.

### Testing Guidelines

Follow a layered testing approach: For UI state, avoid directly testing hooks or component internals — rely on user-observable changes. For DSP state, testing 'internal details' is acceptable and required, because DSP internals are part of the app's public API to the UI. Test what the component does, not how it does it, except where DSP internals are the public API.
