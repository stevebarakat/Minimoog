# Project Preferences

This document outlines the coding standards, architectural decisions, and development preferences for the Minimoog Model D emulator project.

## Styling

- **Colors**: Use HSL color format for better maintainability
- **CSS Framework**: CSS Modules for component-scoped styling
- **Global Styles**: Respect and build upon global styles rather than overriding them

## Code Generation

### Avoid These Packages

- `tailwindcss` - We use CSS Modules instead

### Preferred Packages

- `postcss` - CSS processing
- `autoprefixer` - Automatic vendor prefixes
- `postcss-preset-env` - Modern CSS features
- `stylelint` - CSS linting
- `stylelint-order` - CSS property ordering
- `stylelint-config-standard` - Standard CSS linting rules
- `react-router-dom` - Client-side routing
- `zustand` - State management
- `zod` - Runtime type validation

## Documentation

- **Include Comments**: No - prefer self-documenting code over comments
- **Focus**: Write clear, readable code that explains itself

## TypeScript

- **Prefer Types**: Use type aliases over interfaces
- **Function Declarations**: Prefer function declarations over arrow functions for top-level functions

## React Guidelines

### Component Props

- Prefer explicit component props over implicit dependencies
- Use proper TypeScript typing for all props

### Event Handlers

- Prefer event handlers over useEffect for user interactions
- useEffect should only be used for syncing with external APIs (e.g., Web Audio API)

### useEffect Guidelines

- **One concern per useEffect**: If the dependency list is long or mixes unrelated values, split it into smaller effects
- **Meaningful dependencies**: Use useMemo/useCallback to reduce dependencies to only what's meaningful
- **Long dependency lists**: A long dependency list isn't bad if all values belong to the same concern and every change truly needs to trigger the effect

## UI

- **Icon Library**: Use Lucide icons for consistency

## Programming Paradigm

- **Functional Programming**: Prefer functional programming patterns
- **Immutability**: Prefer immutable data structures
- **Pure Functions**: Write pure functions whenever possible
- **Avoid Side Effects**: Minimize side effects in business logic

## Single Responsibility Principle

### Component Separation

- **Enforce**: Strictly enforce component separation
- **Max Component Lines**: 200 lines per component
- **Max Function Lines**: 50 lines per function
- **Pure Functions**: Prefer pure functions over methods

## Project Structure

### File Organization

- **Colocate Files**: Place related files (component, styles, tests, hooks, types, audio, store, utils, etc.) in the same directory
- **Improve Discoverability**: Related files should be easy to find together
- **Maintainability**: Keep related functionality together

### Index Files

- **Component Index**: Each component directory should include an index.ts file
- **Clean Imports**: Re-export the default component (e.g., `export { default } from './ComponentName';`)
- **Consistent Imports**: Enable cleaner and more consistent import statements

## Testing Strategy

### Focus Areas

- **Behavior Testing**: Focus on behavior, not implementation details
- **Avoid Implementation Details**: Don't test internal implementation unless it's part of the public API

### Layered Testing Approach

#### Unit Tests - DSP Layer

- Test oscillators, filters, envelopes, and mixer modules in isolation
- Assert Web Audio API node connections, parameter values, and range enforcement
- Use OfflineAudioContext where possible to render and inspect short audio buffers

#### Integration Tests - Audio Graph

- Create small synth patches and verify parameter changes propagate through the graph
- Confirm oscillator frequencies, filter cutoffs, and envelope shapes match expected outputs

#### UI Behavior Tests - User Interactions

- Use React Testing Library to simulate clicks, knob drags, and key presses
- Assert these actions trigger correct DSP parameter updates and start/stop audio as expected

### Testing Guidelines

- **UI State**: Avoid directly testing hooks or component internals — rely on user-observable changes
- **DSP State**: Testing 'internal details' is acceptable and required, because DSP internals are part of the app's public API to the UI
- **Test What, Not How**: Test what the component does, not how it does it, except where DSP internals are the public API

## Development Workflow

1. **Code Review**: All changes should be reviewed for adherence to these preferences
2. **Linting**: Use ESLint and Stylelint to enforce coding standards
3. **Testing**: Write tests following the layered testing strategy
4. **Documentation**: Update this file when preferences change
