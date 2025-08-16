# CSS Modules Best Practices

## File Naming

- Use `.module.css` extension for all CSS modules
- Name files to match their component: `Button.module.css` for `Button.tsx`

## Class Naming

- Use camelCase for class names in CSS (they'll be converted to kebab-case)
- Use descriptive, semantic names: `.primaryButton` not `.btn1`

## Import Patterns

```typescript
// ✅ Good - Default import
import styles from "./Component.module.css";

// ✅ Good - Named import for specific classes
import { primaryButton, secondaryButton } from "./Component.module.css";

// ❌ Avoid - Importing all styles
import * as styles from "./Component.module.css";
```

## Class Name Utilities

```typescript
// ✅ Good - Using the cn utility
import { cn } from "@/utils";

const className = cn(
  styles.button,
  isActive && styles.active,
  disabled && "disabled"
);

// ✅ Good - Using cssModule utility for conditional CSS modules
import { cssModule } from "@/utils";

const className = cssModule(
  styles,
  "button",
  isActive && "active",
  disabled && "disabled"
);
```

## CSS Organization

1. **Layout properties** (position, display, flex, grid)
2. **Box model** (width, height, margin, padding)
3. **Visual properties** (background, border, box-shadow)
4. **Typography** (font, text, line-height)
5. **Interactive states** (cursor, transition, transform)

## CSS Tooling & Configuration

### Stylelint

The project uses Stylelint for CSS quality assurance:

```bash
npm run lint:css        # Run Stylelint and auto-fix issues
npm run lint:css:check  # Check CSS without fixing
npm run analyze:css     # Analyze CSS and report issues
```

**Configuration**: `.stylelintrc.json` extends standard and CSS modules configs with ordering rules.

### PostCSS

Advanced CSS processing with multiple plugins:

- **postcss-import**: Import CSS files
- **postcss-mixins**: CSS mixins support
- **postcss-nested**: Nested CSS rules
- **postcss-preset-env**: Modern CSS features
- **autoprefixer**: Vendor prefixing

### Vite Configuration

CSS modules are configured in `vite.config.ts`:

```typescript
css: {
  modules: {
    // Generate readable class names in development
    generateScopedName: process.env.NODE_ENV === "development"
      ? "[name]__[local]___[hash:base64:5]"
      : "[hash:base64:8]",
    // Enable CSS modules for all .module.css files
    localsConvention: "camelCase",
  },
  // Enable CSS source maps for better debugging
  devSourcemap: true,
}
```

**Development**: `Button__primary___abc12` (readable)
**Production**: `abc123def` (minimized)

## TypeScript Integration

### CSS Modules Type Definitions

The project includes TypeScript definitions for CSS modules:

```typescript
// src/types/css-modules.d.ts
declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}
```

This provides full IntelliSense and type safety when importing CSS modules.

### Type-Safe Usage

```typescript
import styles from "./Component.module.css";

// TypeScript knows this is a string
const buttonClass: string = styles.primaryButton;

// TypeScript will catch typos
const invalidClass = styles.primaryButon; // ❌ Error: Property doesn't exist
```

## CSS Custom Properties

### Usage Patterns

The project extensively uses CSS custom properties for theming and consistency:

```css
/* Define custom properties */
.button {
  --button-padding: var(--spacing-sm);
  --button-radius: var(--radius-md);
  --button-transition: var(--transition-normal);

  padding: var(--button-padding);
  border-radius: var(--button-radius);
  transition: var(--button-transition);
}

/* Component-specific overrides */
.button.primary {
  --button-bg: var(--color-primary);
  --button-color: var(--color-white);
}
```

### Common Custom Properties

```css
/* Spacing */
--spacing-xs: 0.25rem;
--spacing-sm: 0.5rem;
--spacing-md: 1rem;
--spacing-lg: 1.5rem;

/* Colors */
--color-primary: hsl(220, 100%, 50%);
--color-secondary: hsl(0, 0%, 90%);

/* Transitions */
--transition-fast: 0.15s ease;
--transition-normal: 0.25s ease;
--transition-slow: 0.35s ease;
```

## Performance Tips

- Keep CSS modules small and focused
- Use CSS custom properties for shared values
- Avoid deep nesting (max 3 levels)
- Use the `composes` feature sparingly
- Leverage CSS modules' automatic scoping for better performance

## Real-World Examples

### VintageLED Component

```typescript
// src/components/VintageLED/VintageLED.tsx
import { cn, cssModule } from "@/utils";
import styles from "./VintageLED.module.css";

const ledClasses = cssModule(
  styles,
  "vintageLed",
  `vintageLed${capitalizeFirstLetter(color)}`,
  `vintageLed${capitalizeFirstLetter(size)}`,
  isOn && "vintageLedOn",
  isWarmedUp && "vintageLedWarmedUp"
);

const containerClasses = cn(ledClasses, className);
```

```css
/* VintageLED.module.css */
.vintageLed {
  position: relative;
  display: inline-block;
  border-radius: 50%;
  cursor: pointer;
  transition: var(--transition-normal);
}

.vintageLedRed {
  background: var(--color-red);
  box-shadow: 0 0 10px var(--color-red);
}

.vintageLedOn {
  opacity: 1;
  transform: scale(1.1);
}

.vintageLedWarmedUp {
  animation: warmup 0.15s ease-in;
}
```

### OverloadIndicator Component

```typescript
// src/components/OverloadIndicator/OverloadIndicator.tsx
const ledClasses = cssModule(
  styles,
  "vintageLed",
  "vintageLedYellow",
  size === "large" && "vintageLedLarge",
  size === "medium" && "vintageLedMedium",
  size === "small" && "vintageLedSmall",
  isOn && "vintageLedOn",
  size
);

const containerClasses = cn(styles.container, style);
```

### Screw Component

```css
/* Screw.module.css */
.screw {
  --screw-size: 15px;

  position: relative;
  width: var(--screw-size);
  height: var(--screw-size);
  border-radius: 50%;
}

.screwHead {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: var(--screw-size);
  height: var(--screw-size);
  border-radius: 50%;
  box-shadow: inset 2px 2px 4px hsl(0deg 0% 100% / 20%), inset -2px -2px 4px hsl(0deg
          0% 0% / 30%);
}

.small {
  --screw-size: 8px;
}
.medium {
  --screw-size: 10px;
}
.large {
  --screw-size: 12px;
}
```

## Development Workflow

### 1. Create Component

```typescript
// MyComponent.tsx
import { cn, cssModule } from "@/utils";
import styles from "./MyComponent.module.css";

export function MyComponent({ variant, size, className }: MyComponentProps) {
  const componentClasses = cssModule(
    styles,
    "component",
    variant && `component${variant.charAt(0).toUpperCase() + variant.slice(1)}`,
    size && `component${size.charAt(0).toUpperCase() + size.slice(1)}`
  );

  return (
    <div className={cn(componentClasses, className)}>
      {/* Component content */}
    </div>
  );
}
```

### 2. Create CSS Module

```css
/* MyComponent.module.css */
.component {
  /* Base styles */
  display: flex;
  align-items: center;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  transition: var(--transition-normal);
}

.componentPrimary {
  background: var(--color-primary);
  color: var(--color-white);
}

.componentSecondary {
  background: var(--color-secondary);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.componentSmall {
  padding: var(--spacing-xs);
  font-size: var(--font-size-sm);
}

.componentLarge {
  padding: var(--spacing-md);
  font-size: var(--font-size-lg);
}
```

### 3. Test and Lint

```bash
# Check CSS quality
npm run lint:css:check

# Auto-fix issues
npm run lint:css

# Run tests
npm test
```

## Best Practices Summary

### ✅ **Do**

- Use `.module.css` extension for all CSS modules
- Use camelCase for class names
- Leverage `cn` and `cssModule` utilities
- Use CSS custom properties for theming
- Keep components and styles colocated
- Use descriptive, semantic class names
- Follow the established CSS organization pattern

### ❌ **Don't**

- Use deep CSS nesting (max 3 levels)
- Overuse the `composes` feature
- Create overly large CSS modules
- Use non-semantic class names
- Mix global and module styles unnecessarily
- Forget to run CSS linting

### 🔧 **Tools**

- **Stylelint**: CSS quality assurance
- **PostCSS**: Advanced CSS processing
- **CSS Modules**: Scoped styling
- **TypeScript**: Type safety
- **Vite**: Build optimization

## Conclusion

This CSS modules setup provides a robust, type-safe, and performant styling solution that scales with your application. The combination of CSS modules, PostCSS, Stylelint, and TypeScript ensures high-quality, maintainable CSS code.
