# Dropdown Component

A composable dropdown component that provides common dropdown functionality including click outside to close, keyboard navigation support, accessibility features, and flexible composition with multiple sub-components.

## 🗂️ Quick Overview

### Core Features

- **Composable** - Mix and match components as needed
- **Accessible** - Built-in ARIA attributes and keyboard navigation
- **Flexible** - Customizable styling and behavior
- **Type-safe** - Full TypeScript support
- **Responsive** - Works on mobile and desktop
- **Touch-friendly** - Optimized for touch devices
- **Performance optimized** - Efficient event handling and cleanup

### Key Components

- `Dropdown.Root` - Main container that manages state and context
- `Dropdown.Trigger` - Clickable trigger button with chevron icon
- `Dropdown.Content` - Dropdown menu container
- `Dropdown.Item` - Container for individual items
- `Dropdown.ItemButton` - Clickable button within items
- `Dropdown.Separator` - Visual separator between items
- `Dropdown.Group` - Groups related items together
- `Dropdown.Label` - Label for groups or sections
- `Dropdown.Listbox` - Listbox container for proper ARIA semantics
- `DropdownTrigger` - Also exported separately for direct import

## 🚀 Quick Start

### Basic Usage

```tsx
import { Dropdown } from "@/components/Dropdown";

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dropdown.Root isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)}>
      <Dropdown.Trigger>Select Option</Dropdown.Trigger>
      <Dropdown.Content>
        <Dropdown.Item>
          <Dropdown.ItemButton onClick={() => handleOption1()}>
            Option 1
          </Dropdown.ItemButton>
        </Dropdown.Item>
        <Dropdown.Item>
          <Dropdown.ItemButton onClick={() => handleOption2()}>
            Option 2
          </Dropdown.ItemButton>
        </Dropdown.Item>
      </Dropdown.Content>
    </Dropdown.Root>
  );
}
```

### With Groups and Accessibility

```tsx
<Dropdown.Root
  isOpen={isOpen}
  onToggle={() => setIsOpen(!isOpen)}
  ariaLabel="Select an option"
  ariaExpanded={isOpen}
  ariaHasPopup="listbox"
>
  <Dropdown.Trigger>Select Option</Dropdown.Trigger>
  <Dropdown.Content>
    <Dropdown.Group>
      <Dropdown.Label>Group 1</Dropdown.Label>
      <Dropdown.Item>
        <Dropdown.ItemButton onClick={handleSelect}>
          Option 1
        </Dropdown.ItemButton>
      </Dropdown.Item>
    </Dropdown.Group>
    <Dropdown.Separator />
    <Dropdown.Group>
      <Dropdown.Label>Group 2</Dropdown.Label>
      <Dropdown.Item>
        <Dropdown.ItemButton onClick={handleSelect}>
          Option 2
        </Dropdown.ItemButton>
      </Dropdown.Item>
    </Dropdown.Group>
  </Dropdown.Content>
</Dropdown.Root>
```

### Using Listbox for Better Semantics

```tsx
<Dropdown.Root
  isOpen={isOpen}
  onToggle={() => setIsOpen(!isOpen)}
  ariaLabel="Select a preset"
  ariaExpanded={isOpen}
  ariaHasPopup="listbox"
>
  <Dropdown.Trigger>Select Preset</Dropdown.Trigger>
  <Dropdown.Content>
    <Dropdown.Listbox aria-label="Available presets">
      <Dropdown.Item>
        <Dropdown.ItemButton onClick={() => handlePresetSelect("preset1")}>
          Preset 1
        </Dropdown.ItemButton>
      </Dropdown.Item>
      <Dropdown.Item>
        <Dropdown.ItemButton onClick={() => handlePresetSelect("preset2")}>
          Preset 2
        </Dropdown.ItemButton>
      </Dropdown.Item>
    </Dropdown.Listbox>
  </Dropdown.Content>
</Dropdown.Root>
```

## 🔧 API Reference

### Dropdown.Root

Main container that manages dropdown state and provides context to child components.

```tsx
type DropdownRootProps = {
  children: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  disabled?: boolean;
  onKeyDown?: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  ariaLabel?: string;
  ariaExpanded?: boolean;
  ariaHasPopup?: "listbox" | "menu" | "dialog" | "grid" | "tree";
  className?: string;
};
```

**Props:**
- `isOpen` - Controls dropdown visibility
- `onToggle` - Called when dropdown should open/close
- `disabled` - Disables the entire dropdown
- `ariaLabel` - Accessible label for screen readers
- `ariaExpanded` - Indicates expanded state
- `ariaHasPopup` - Specifies popup type for accessibility

### Dropdown.Trigger

Clickable button that opens/closes the dropdown.

```tsx
type DropdownTriggerProps = {
  children: ReactNode;
  className?: string;
};
```

**Features:**
- **Keyboard support**: Enter, Space, ArrowDown to open
- **Visual feedback**: Chevron icon that rotates when open
- **Accessibility**: Proper ARIA attributes and focus management
- **Touch optimized**: Touch event handling for mobile devices

### Dropdown.Content

Container for dropdown menu content.

```tsx
type DropdownContentProps = {
  children: ReactNode;
  className?: string;
};
```

**Features:**
- **Conditional rendering**: Only renders when `isOpen` is true
- **Positioning**: Absolute positioning with proper z-index
- **Responsive**: Adapts to mobile and desktop layouts

### Dropdown.Item

Container for individual dropdown items.

```tsx
type DropdownItemProps = {
  children: ReactNode;
  disabled?: boolean;
  className?: string;
  role?: string;
  "aria-selected"?: boolean;
  id?: string;
  index?: number;
};
```

**Props:**
- `disabled` - Disables the item
- `role` - ARIA role (defaults to "option")
- `aria-selected` - Selection state for screen readers
- `id` - Unique identifier for focus management
- `index` - Position in the dropdown for keyboard navigation

### Dropdown.ItemButton

Clickable button within dropdown items.

```tsx
type DropdownItemButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  id?: string;
  index?: number;
};
```

**Features:**
- **Full keyboard navigation**: Arrow keys, Home, End, Enter, Escape
- **Focus management**: Automatic focus tracking and active descendant
- **Click handling**: Executes onClick and closes dropdown
- **Disabled state**: Proper disabled styling and behavior

### Dropdown.Listbox

Listbox container for proper ARIA semantics.

```tsx
type DropdownListboxProps = {
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
};
```

**Purpose:**
- Provides proper `listbox` role for screen readers
- Groups related options together
- Improves accessibility for complex dropdowns

### Dropdown.Group

Groups related items together.

```tsx
type DropdownGroupProps = {
  children: ReactNode;
  className?: string;
};
```

### Dropdown.Label

Label for groups or sections.

```tsx
type DropdownLabelProps = {
  children: ReactNode;
  className?: string;
  id?: string;
};
```

### Dropdown.Separator

Visual separator between items or groups.

```tsx
type DropdownSeparatorProps = {
  className?: string;
};
```

## ⌨️ Keyboard Navigation

The dropdown supports comprehensive keyboard navigation:

- **Enter/Space** - Opens dropdown (on trigger) or selects item (on item button)
- **Arrow Down/Up** - Navigate between items
- **Home/End** - Jump to first/last item
- **Escape** - Closes dropdown
- **Tab** - Normal tab navigation (focus management)

## ♿ Accessibility Features

- **ARIA attributes**: `aria-expanded`, `aria-haspopup`, `aria-label`
- **Focus management**: Proper focus trapping and restoration
- **Screen reader support**: Semantic HTML and ARIA roles
- **Keyboard navigation**: Full keyboard accessibility
- **Active descendant**: Tracks focused item for screen readers

## 🎨 Styling

The component uses CSS modules with the following key classes:

- `.container` - Main wrapper
- `.dropdown` - Dropdown positioning
- `.trigger` - Trigger button styling
- `.chevron` - Chevron icon with rotation
- `.menu` - Dropdown menu container
- `.dropdownItem` - Individual item container
- `.dropdownOption` - Clickable option button
- `.focused` - Focused state styling

## 🔄 State Management

The dropdown uses React Context to share state between components:

- **Open/closed state** - Controlled by parent component
- **Focus index** - Tracks currently focused item
- **Active descendant** - For screen reader announcements
- **Option count** - For keyboard navigation bounds

## 📱 Responsive Design

- **Mobile optimized**: Touch-friendly interactions
- **Responsive layout**: Adapts to different screen sizes
- **Viewport awareness**: Handles mobile viewport constraints
- **Touch events**: Proper touch event handling

## 🚀 Performance Features

- **Event listener cleanup**: Proper cleanup on unmount
- **Conditional rendering**: Content only renders when needed
- **Efficient focus management**: Minimal re-renders
- **Memory optimization**: Proper context usage

## 📝 Usage Examples

### Simple Select Dropdown

```tsx
function SimpleSelect({ options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dropdown.Root isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)}>
      <Dropdown.Trigger>{value || "Select..."}</Dropdown.Trigger>
      <Dropdown.Content>
        {options.map((option) => (
          <Dropdown.Item key={option.value}>
            <Dropdown.ItemButton onClick={() => onChange(option.value)}>
              {option.label}
            </Dropdown.ItemButton>
          </Dropdown.Item>
        ))}
      </Dropdown.Content>
    </Dropdown.Root>
  );
}
```

### Multi-Level Dropdown

```tsx
function MultiLevelDropdown({ categories }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dropdown.Root isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)}>
      <Dropdown.Trigger>Browse Categories</Dropdown.Trigger>
      <Dropdown.Content>
        {categories.map((category) => (
          <Dropdown.Group key={category.id}>
            <Dropdown.Label>{category.name}</Dropdown.Label>
            {category.items.map((item) => (
              <Dropdown.Item key={item.id}>
                <Dropdown.ItemButton onClick={() => handleSelect(item)}>
                  {item.name}
                </Dropdown.ItemButton>
              </Dropdown.Item>
            ))}
            <Dropdown.Separator />
          </Dropdown.Group>
        ))}
      </Dropdown.Content>
    </Dropdown.Root>
  );
}
```

## 🧪 Testing

The component includes comprehensive tests covering:

- **Rendering**: Proper component rendering
- **Interactions**: Click, keyboard, and touch events
- **State changes**: Open/close behavior
- **Accessibility**: ARIA attributes and keyboard navigation
- **Edge cases**: Disabled states, focus management

## 🔗 Related Components

- **PresetsDropdown** - Example implementation using this component
- **CategoryFilter** - Filter component that works with dropdowns
- **PresetList** - List component for dropdown content

## 📚 Best Practices

1. **Always provide `ariaLabel`** for screen reader accessibility
2. **Use `ariaHasPopup`** to specify the popup type
3. **Handle keyboard navigation** in your onClick handlers
4. **Provide meaningful labels** for groups and items
5. **Test with screen readers** to ensure accessibility
6. **Use `Dropdown.Listbox`** for complex option lists
7. **Implement proper focus management** in parent components
