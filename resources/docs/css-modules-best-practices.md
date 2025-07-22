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
import { cn } from "@/utils/helpers";

const className = cn(
  styles.button,
  isActive && styles.active,
  disabled && styles.disabled
);

// ✅ Good - Using cssModule utility for conditional CSS modules
import { cssModule } from "@/utils/helpers";

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

## Performance Tips

- Keep CSS modules small and focused
- Use CSS custom properties for shared values
- Avoid deep nesting (max 3 levels)
- Use the `composes` feature sparingly

## Example Component

```typescript
// Button.tsx
import { cn } from "@/utils/helpers";
import styles from "./Button.module.css";

type ButtonProps = {
  variant?: "primary" | "secondary";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  children: React.ReactNode;
};

export function Button({
  variant = "primary",
  size = "medium",
  disabled = false,
  children,
}: ButtonProps) {
  return (
    <button
      className={cn(
        styles.button,
        styles[variant],
        styles[size],
        disabled && styles.disabled
      )}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
```

```css
/* Button.module.css */
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-normal);
  font-family: var(--font-family-primary);
}

.primary {
  background: var(--color-primary);
  color: var(--color-secondary);
}

.secondary {
  background: var(--color-secondary);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.small {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-sm);
}

.medium {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-md);
}

.large {
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: var(--font-size-lg);
}

.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```
