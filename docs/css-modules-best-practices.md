# CSS Guidelines

## Naming

- **Files**: Use `.module.css` extension, match component name (`Button.module.css` for `Button.tsx`)
- **Classes**: Use camelCase, descriptive names (`.primaryButton` not `.btn1`)

## Usage

```typescript
// Import styles
import styles from "./Component.module.css";

// Use cn utility for conditional classes
import { cn } from "@/utils";
const className = cn(
  styles.button,
  isActive && styles.active,
  disabled && "disabled"
);

// Use cssModule for conditional CSS modules
import { cssModule } from "@/utils";
const className = cssModule(
  styles,
  "button",
  isActive && "active",
  disabled && "disabled"
);
```

## CSS Organization

1. Layout → Box model → Visual → Typography → Interactive states

## Tooling

```bash
npm run lint:css        # Lint and auto-fix CSS
npm run lint:css:check  # Check CSS without fixing
```

**Tools**: Stylelint (quality), PostCSS (processing), Vite (build optimization)

## TypeScript

```typescript
// Type-safe CSS module imports
import styles from "./Component.module.css";
const buttonClass: string = styles.primaryButton; // ✅ IntelliSense
const invalidClass = styles.primaryButon; // ❌ TypeScript error
```

## CSS Custom Properties

```css
/* Use custom properties for theming */
.button {
  --button-padding: var(--spacing-sm);
  --button-bg: var(--color-primary);

  padding: var(--button-padding);
  background: var(--button-bg);
}

/* Common tokens in @tokens.css */
--spacing-sm: 0.5rem;
--color-primary: hsl(220, 100%, 50%);
--transition-normal: 0.25s ease;
```

## Example

```typescript
// Component.tsx
import { cn, cssModule } from "@/utils";
import styles from "./Component.module.css";

export function Component({ variant, size, className }: Props) {
  const classes = cssModule(
    styles,
    "component",
    variant && `component${capitalize(variant)}`,
    size && `component${capitalize(size)}`
  );

  return <div className={cn(classes, className)} />;
}
```

```css
/* Component.module.css */
.component {
  --component-padding: var(--spacing-sm);

  display: flex;
  padding: var(--component-padding);
  border-radius: var(--radius-md);
  transition: var(--transition-normal);
}

.componentPrimary {
  background: var(--color-primary);
  color: var(--color-white);
}

.componentSmall {
  --component-padding: var(--spacing-xs);
}
```

## Best Practices

**✅ Do**: Use `.module.css`, camelCase classes, `cn`/`cssModule` utilities, CSS custom properties, semantic names

**❌ Don't**: Deep nesting (>3 levels), large modules, non-semantic names, mixing global/module styles

**🔧 Tools**: Stylelint, PostCSS, TypeScript, Vite
