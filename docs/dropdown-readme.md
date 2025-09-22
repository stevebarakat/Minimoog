# Dropdown Component

A composable dropdown with click-outside-to-close, keyboard navigation, accessibility features, and flexible composition.

## 🗂️ Overview

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
- `Dropdown.Icon` - Icon component for dropdown elements
- `DropdownTrigger` - Also exported separately for direct import

## 🚀 Quick Start

### Basic Usage

```tsx
import { Dropdown } from "@/components/Dropdown";
import { Settings } from "lucide-react";

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dropdown.Root
      isOpen={isOpen}
      onToggle={() => setIsOpen(!isOpen)}
      ariaLabel="Select an option"
      ariaExpanded={isOpen}
      ariaHasPopup="listbox"
    >
      <Dropdown.Trigger segmented={true} icon={<Settings />}>
        Select Option
      </Dropdown.Trigger>
      <Dropdown.Content>
        <Dropdown.Listbox
          aria-label="Available options"
          options={[{ id: "option1" }, { id: "option2" }]}
          optionCount={2}
        >
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
        </Dropdown.Listbox>
      </Dropdown.Content>
    </Dropdown.Root>
  );
}
```

## 🔧 API

### Dropdown.Root

```tsx
type DropdownRootProps = {
  children: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  disabled?: boolean;
  ariaLabel?: string;
  ariaExpanded?: boolean;
  ariaHasPopup?: "listbox" | "menu" | "dialog" | "grid" | "tree";
  className?: string;
};
```

### Dropdown.Trigger

```tsx
type DropdownTriggerProps = {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  icon?: ReactNode;
  segmented?: boolean;
  iconPosition?: "left" | "right";
  textAlign?: "left" | "center" | "right";
  justifyContent?: "flex-start" | "center" | "flex-end" | "space-between";
  isActive?: boolean;
  isPulsating?: boolean;
};
```

### Dropdown.Listbox

```tsx
type DropdownListboxProps = {
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
  options?: Array<{ id: string; [key: string]: string | number | boolean }>;
  optionCount?: number;
};
```

### Dropdown.Item

```tsx
type DropdownItemProps = {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  role?: string;
  "aria-selected"?: boolean;
  id?: string;
  index?: number;
};
```

### Dropdown.ItemButton

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

## ⌨️ Keyboard Navigation

- **Enter/Space** - Opens dropdown or selects item
- **Arrow Down/Up** - Navigate between items
- **Home/End** - Jump to first/last item
- **Escape** - Closes dropdown

## ♿ Accessibility

- **ARIA attributes**: `aria-expanded`, `aria-haspopup`, `aria-label`
- **Focus management**: Proper focus trapping and restoration
- **Screen reader support**: Semantic HTML and ARIA roles
- **Active descendant**: Tracks focused item for screen readers

## 📝 Examples

### Simple Select

```tsx
<Dropdown.Root isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)}>
  <Dropdown.Trigger segmented={true} icon={<ChevronDown />}>
    {value || "Select..."}
  </Dropdown.Trigger>
  <Dropdown.Content>
    <Dropdown.Listbox options={options} optionCount={options.length}>
      {options.map((option) => (
        <Dropdown.Item key={option.value}>
          <Dropdown.ItemButton onClick={() => onChange(option.value)}>
            {option.label}
          </Dropdown.ItemButton>
        </Dropdown.Item>
      ))}
    </Dropdown.Listbox>
  </Dropdown.Content>
</Dropdown.Root>
```

### With Groups

```tsx
<Dropdown.Content>
  <Dropdown.Listbox>
    <Dropdown.Group>
      <Dropdown.Label>Basic</Dropdown.Label>
      <Dropdown.Item>
        <Dropdown.ItemButton onClick={handleBasic}>
          Basic Option
        </Dropdown.ItemButton>
      </Dropdown.Item>
    </Dropdown.Group>
    <Dropdown.Separator />
    <Dropdown.Group>
      <Dropdown.Label>Advanced</Dropdown.Label>
      <Dropdown.Item>
        <Dropdown.ItemButton onClick={handleAdvanced}>
          Advanced Option
        </Dropdown.ItemButton>
      </Dropdown.Item>
    </Dropdown.Group>
  </Dropdown.Listbox>
</Dropdown.Content>
```

## 📚 Best Practices

- Always provide `ariaLabel` for accessibility
- Use `ariaHasPopup` to specify popup type
- Use `Dropdown.Listbox` for complex option lists
- Test with screen readers
