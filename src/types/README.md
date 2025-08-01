# Types Organization

This folder contains global type declarations and re-exports for the project.

## Structure

### Global Type Declarations

- `css-modules.d.ts` - CSS modules type declaration for TypeScript
- `index.ts` - Global type re-exports for commonly used types

### Type Organization Principles

1. **Component-Specific Types**: Keep types close to their components

   - `src/components/ComponentName/types.ts` or `src/components/ComponentName/types/`
   - Export via component's `index.ts` barrel export

2. **Store Types**: Centralized in `src/store/types/`

   - Core application state and action types
   - Re-exported in global `index.ts` for convenience

3. **Utility Types**: Co-located with utility functions

   - `src/utils/utilityName.ts` contains related types
   - Re-exported in global `index.ts` if widely used

4. **Global Types**: Only truly shared types go here
   - Module declarations (like CSS modules)
   - Re-exports of commonly used types

## Usage Patterns

### Importing Component Types

```typescript
// Preferred: Import from component barrel export
import { ComponentProps } from "@/components/ComponentName";

// Alternative: Direct import if needed
import { ComponentProps } from "@/components/ComponentName/types";
```

### Importing Global Types

```typescript
// Import commonly used types from global index
import { SynthState, OscillatorWaveform, MIDINoteNumber } from "@/types";

// Or import directly from source for specific types
import { SynthState } from "@/store/types/synth";
```

### Importing Utility Types

```typescript
// Import utility types directly
import { AudioError } from "@/utils/audioUtils";

// Or from global index if commonly used
import { AudioError } from "@/types";
```

## Best Practices

1. **Prefer component barrel exports** for component types
2. **Use global index** for commonly shared types
3. **Keep types close to their usage** when possible
4. **Re-export in global index** only for widely used types
5. **Document complex types** with JSDoc comments
