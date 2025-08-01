# Dropdown Component

A composable dropdown component that provides common dropdown functionality including:

- Click outside to close
- Keyboard navigation support
- Accessibility features
- Flexible composition with multiple sub-components

## Usage

### Basic Usage

```tsx
import { Dropdown } from "@/components/Dropdown";

function MyComponent() {
  // Using Zustand for state management
  const isOpen = useSynthStore((state) => state.dropdownOpen);
  const setIsOpen = useSynthStore((state) => state.setDropdownOpen);

  return (
    <Dropdown.Root isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)}>
      <Dropdown.Trigger>Select Option</Dropdown.Trigger>
      <Dropdown.Content>
        <Dropdown.Item>
          <Dropdown.ItemButton onClick={() => console.log("Option 1")}>
            Option 1
          </Dropdown.ItemButton>
        </Dropdown.Item>
        <Dropdown.Item>
          <Dropdown.ItemButton onClick={() => console.log("Option 2")}>
            Option 2
          </Dropdown.ItemButton>
        </Dropdown.Item>
      </Dropdown.Content>
    </Dropdown.Root>
  );
}
```

### With Groups and Separators

```tsx
<Dropdown.Root isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)}>
  <Dropdown.Trigger>Select Option</Dropdown.Trigger>
  <Dropdown.Content>
    <Dropdown.Group>
      <Dropdown.Label>Group 1</Dropdown.Label>
      <Dropdown.Item>
        <Dropdown.ItemButton onClick={handleSelect}>
          Option 1
        </Dropdown.ItemButton>
      </Dropdown.Item>
      <Dropdown.Item>
        <Dropdown.ItemButton onClick={handleSelect}>
          Option 2
        </Dropdown.ItemButton>
      </Dropdown.Item>
    </Dropdown.Group>

    <Dropdown.Separator />

    <Dropdown.Group>
      <Dropdown.Label>Group 2</Dropdown.Label>
      <Dropdown.Item>
        <Dropdown.ItemButton onClick={handleSelect}>
          Option 3
        </Dropdown.ItemButton>
      </Dropdown.Item>
    </Dropdown.Group>
  </Dropdown.Content>
</Dropdown.Root>
```

### With Accessibility Features

```tsx
<Dropdown.Root
  isOpen={isOpen}
  onToggle={() => setIsOpen(!isOpen)}
  disabled={false}
  ariaLabel="Select an option"
  ariaExpanded={isOpen}
  ariaHasPopup="listbox"
>
  <Dropdown.Trigger>Select Option</Dropdown.Trigger>
  <Dropdown.Content>
    <div role="listbox">
      <Dropdown.Item role="option" aria-selected={false}>
        <Dropdown.ItemButton onClick={handleSelect}>
          Option 1
        </Dropdown.ItemButton>
      </Dropdown.Item>
    </div>
  </Dropdown.Content>
</Dropdown.Root>
```

## Components

### Dropdown.Root

The main container that manages state and provides context to child components.

**Props:**

- `isOpen: boolean` - Controls whether the dropdown is open
- `onToggle: () => void` - Callback when dropdown should toggle
- `disabled?: boolean` - Disables the dropdown
- `onKeyDown?: (event: KeyboardEvent) => void` - Keyboard event handler
- `ariaLabel?: string` - Accessibility label
- `ariaExpanded?: boolean` - Accessibility expanded state
- `ariaHasPopup?: "listbox" | "menu" | "dialog" | "grid" | "tree"` - Accessibility popup type
- `className?: string` - Additional CSS classes

### Dropdown.Trigger

The clickable trigger button that opens/closes the dropdown.

**Props:**

- `children: React.ReactNode` - Trigger content
- `className?: string` - Additional CSS classes

### Dropdown.Content

The dropdown menu container that appears when open.

**Props:**

- `children: React.ReactNode` - Menu content
- `className?: string` - Additional CSS classes

### Dropdown.Item

Container for individual dropdown items.

**Props:**

- `children: React.ReactNode` - Item content
- `onClick?: () => void` - Click handler
- `disabled?: boolean` - Disables the item
- `className?: string` - Additional CSS classes
- `role?: string` - ARIA role (default: "option")
- `aria-selected?: boolean` - ARIA selected state

### Dropdown.ItemButton

Clickable button within a dropdown item.

**Props:**

- `children: React.ReactNode` - Button content
- `onClick?: () => void` - Click handler
- `disabled?: boolean` - Disables the button
- `className?: string` - Additional CSS classes

### Dropdown.Separator

Visual separator between items or groups.

**Props:**

- `className?: string` - Additional CSS classes

### Dropdown.Group

Groups related items together.

**Props:**

- `children: React.ReactNode` - Group content
- `className?: string` - Additional CSS classes

### Dropdown.Label

Label for groups or sections.

**Props:**

- `children: React.ReactNode` - Label content
- `className?: string` - Additional CSS classes

## Features

- **Composable**: Mix and match components as needed
- **Accessible**: Built-in ARIA attributes and keyboard navigation
- **Flexible**: Customizable styling and behavior
- **Type-safe**: Full TypeScript support
- **Responsive**: Works on mobile and desktop
- **Touch-friendly**: Optimized for touch devices
- **State Management**: Integrates with Zustand store for consistent state management
