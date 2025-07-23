# UI Logic Separation from Audio Processing

## Overview

This refactoring addresses the issue of UI logic being mixed with audio processing by creating focused hooks that separate concerns according to the Single Responsibility Principle.

## Issues Identified

### 1. `useAudio` Hook - Mixed Responsibilities

**Before:** Combined audio processing with UI logic (`useOverflowDirection`)
**After:** Separated into focused hooks:

- `useAudio` - Pure audio processing only
- `useUIState` - UI state management only

### 2. `Minimoog.tsx` Component - Mixed Concerns

**Before:** Mixed UI concerns (mobile detection, view types) with audio setup
**After:** Separated into focused hooks:

- `useUIState` - Handles UI state (mobile, view, container ref)
- `useAudioContextManagement` - Handles audio context lifecycle
- `useAudio` - Handles audio processing
- Component - Pure UI rendering

### 3. `Controls.tsx` Component - Mixed Responsibilities

**Before:** Mixed audio context management with UI rendering
**After:** Separated into focused hooks:

- `useAudioContextManagement` - Handles audio context lifecycle
- `useAudioNodes` - Handles audio node creation
- Component - Pure UI rendering

## New Hook Structure

### UI State Management

```
useUIState (orchestrator)
├── useOverflowDirection (container scrolling)
├── useIsMobile (responsive detection)
└── useViewType (view state)
```

### Audio Context Management

```
useAudioContextManagement (wrapper)
└── useAudioContext (core audio context)
```

### Audio Processing

```
useAudio (orchestrator)
├── useAudioNodes (node management)
├── useOscillators (oscillator management)
├── useModulation (modulation processing)
├── useEnvelopes (envelope processing)
├── useNoiseAndAux (noise and aux processing)
├── useVibratoCalculation (vibrato calculation)
└── useMidiHandling (MIDI processing)
```

## Benefits

1. **Single Responsibility**: Each hook has one clear purpose
2. **Testability**: UI logic can be tested independently from audio processing
3. **Reusability**: UI hooks can be reused in different contexts
4. **Maintainability**: Changes to UI don't affect audio processing
5. **Performance**: UI updates don't trigger audio processing re-renders
6. **Debugging**: Easier to isolate issues between UI and audio

## File Changes

### New Files Created:

- `src/components/Minimoog/hooks/useUIState.ts` - UI state management
- `src/components/Minimoog/hooks/useAudioContextManagement.ts` - Audio context wrapper

### Files Modified:

- `src/components/Minimoog/hooks/useAudio.ts` - Removed UI logic
- `src/components/Minimoog/Minimoog.tsx` - Uses separated hooks
- `src/components/Controls/Controls.tsx` - Uses separated hooks
- `src/components/Minimoog/hooks/index.ts` - Updated exports

## Design Principles Applied

1. **Single Responsibility Principle**: Each hook has one reason to change
2. **Separation of Concerns**: UI and audio logic are completely separated
3. **Dependency Inversion**: High-level components depend on abstractions
4. **Interface Segregation**: Components only depend on the hooks they need

## Testing Strategy

Each focused hook can now be tested independently:

- Test `useUIState` without audio processing
- Test `useAudio` without UI state management
- Test `useAudioContextManagement` as a pure wrapper
- Test components with mocked hooks

## Performance Benefits

1. **Reduced Re-renders**: UI state changes don't trigger audio processing
2. **Better Memoization**: Audio hooks can be memoized independently
3. **Cleaner Dependencies**: useEffect dependencies are more focused
4. **Optimized Bundling**: UI and audio code can be split if needed

This refactoring significantly improves the codebase's maintainability and follows React best practices for separation of concerns.
