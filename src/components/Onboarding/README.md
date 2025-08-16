# Onboarding Component

The Onboarding component provides a step-by-step guided tour for new users to learn about the Minimoog synthesizer interface. It uses Radix UI Tooltip for accessible tooltips and renders in a portal for proper positioning.

## 🗂️ Quick Overview

### Core Features

- **Step-by-step guidance** - Walks users through each major section of the Minimoog
- **Progress tracking** - Visual progress dots show current step and completion status
- **Persistent state** - Remembers if user has completed onboarding using localStorage
- **Responsive design** - Adapts to different screen sizes with mobile optimizations
- **Vintage aesthetic** - Matches the Minimoog's classic design language
- **Accessible** - Full keyboard navigation and screen reader support via Radix UI
- **Target highlighting** - Highlights specific UI elements with CSS selectors
- **Portal rendering** - Ensures proper tooltip positioning across the entire page

### Key Components

- **`Onboarding`** - Main onboarding overlay that displays the guided tour
- **`useOnboarding`** - Custom hook that manages onboarding state and navigation

## 🚀 Quick Start

### Basic Integration

```tsx
import Onboarding from "./components/Onboarding";

function App() {
  return (
    <div>
      <Minimoog />
      <Onboarding />
    </div>
  );
}
```

### Using the Hook

```tsx
const {
  isVisible,
  currentStep,
  isOnboardingEnabled,
  toggleOnboarding,
  nextStep,
  previousStep,
  skipOnboarding,
  completeOnboarding,
  resetOnboarding,
  goToStep,
} = useOnboarding(13); // Total steps: 13
```

## 📋 Onboarding Steps

The component includes **13 comprehensive steps** that guide users through the entire Minimoog interface:

1. **Welcome** - Introduction to the Minimoog synthesizer
2. **Power** - How to turn on the synthesizer
3. **Oscillators** - Understanding the three oscillators and their waveforms
4. **Mixer** - Balancing oscillator volumes, noise, and external input
5. **Filter** - The legendary Moog filter with cutoff and emphasis controls
6. **Filter Envelope** - Dynamic filter shaping with ADSR controls
7. **Loudness Envelope** - Volume shaping over time
8. **Modulation** - LFO and modulation wheel usage
9. **Keyboard** - Playing and controlling the synthesizer
10. **External Input** - Processing external audio sources
11. **Presets** - Loading and saving patches
12. **Advanced Features** - Additional synthesizer capabilities
13. **Complete** - Final encouragement and completion

### Step Configuration

Each step includes:

- **`id`** - Unique identifier for the step
- **`title`** - Step heading displayed to the user
- **`description`** - Detailed explanation of the feature
- **`target`** - CSS selector for highlighting specific UI elements
- **`position`** - Tooltip positioning relative to the target

## 🎯 Implementation Details

### Radix UI Integration

The component uses Radix UI Tooltip for accessible tooltips:

- **Tooltip.Provider** - Provides context for tooltip functionality
- **Tooltip.Root** - Main tooltip container
- **Tooltip.Portal** - Renders tooltip in a portal for proper positioning
- **Tooltip.Content** - Tooltip content with positioning logic
- **Tooltip.Arrow** - Visual arrow pointing to the target element

### Portal Rendering

Tooltips are rendered in a portal (`createPortal`) to ensure:

- **Proper positioning** across the entire page
- **Z-index management** above other content
- **Event handling** isolation from parent components

### Target Element Highlighting

The component can highlight specific UI elements:

- **CSS selector targeting** using `data-onboarding` attributes
- **Dynamic positioning** based on target element location
- **Scroll into view** functionality for off-screen elements
- **Responsive positioning** that adapts to viewport changes

### Mobile Optimizations

- **Touch-friendly controls** for mobile devices
- **Responsive positioning** that works on small screens
- **Viewport-aware rendering** that adapts to screen size changes
- **Mobile-specific step descriptions** when needed

## 🔧 Hook API Reference

### `useOnboarding(totalSteps: number = 13)`

#### Parameters

- **`totalSteps`** - Total number of onboarding steps (default: 13)

#### Return Values

| Property              | Type                          | Description                                   |
| --------------------- | ----------------------------- | --------------------------------------------- |
| `isVisible`           | `boolean`                     | Whether the onboarding is currently visible   |
| `currentStep`         | `number`                      | Current step index (0-based)                  |
| `isOnboardingEnabled` | `boolean`                     | Whether onboarding is enabled in localStorage |
| `toggleOnboarding`    | `() => void`                  | Toggle onboarding enabled/disabled state      |
| `nextStep`            | `() => void`                  | Move to the next step                         |
| `previousStep`        | `() => void`                  | Move to the previous step                     |
| `skipOnboarding`      | `() => void`                  | Skip the entire onboarding flow               |
| `completeOnboarding`  | `() => void`                  | Complete and hide onboarding                  |
| `resetOnboarding`     | `() => void`                  | Reset to first step and show onboarding       |
| `goToStep`            | `(stepIndex: number) => void` | Jump to a specific step                       |

### State Management

The hook manages several pieces of state:

- **Current step tracking** with bounds checking
- **Visibility state** for showing/hiding the overlay
- **Onboarding preference** stored in localStorage
- **Viewport size** for responsive positioning

### localStorage Integration

Onboarding preferences are persisted:

- **Key**: `"minimoog-onboarding-enabled"`
- **Default**: `true` (enabled)
- **Fallback**: Graceful fallback if localStorage fails
- **Persistence**: Survives page reloads and browser sessions

## 🎨 Styling & CSS

### CSS Modules

The component uses CSS modules for scoped styling:

- **`Onboarding.module.css`** - Component-specific styles
- **Scoped class names** prevent style conflicts
- **Responsive design** with mobile-first approach

### Key Style Classes

- **`.tooltip`** - Main tooltip container
- **`.content`** - Tooltip content wrapper
- **`.progress`** - Progress indicator dots
- **`.navigation`** - Navigation buttons container
- **`.checkbox`** - "Don't show again" checkbox styling

## ♿ Accessibility Features

### ARIA Support

- **Proper tooltip semantics** via Radix UI
- **Screen reader announcements** for step changes
- **Keyboard navigation** for all interactive elements
- **Focus management** during step transitions

### Keyboard Navigation

- **Tab navigation** through all interactive elements
- **Arrow keys** for step navigation
- **Enter/Space** for button activation
- **Escape** to skip onboarding

## 🧪 Testing

### Test Coverage

The component includes comprehensive tests:

- **Component rendering** tests
- **Hook functionality** tests
- **User interaction** tests
- **Accessibility** tests

### Test Utilities

- **Mock implementations** for external dependencies
- **ResizeObserver mock** for viewport testing
- **Event simulation** for user interactions

## 🔗 Related Components

- **`Minimoog`** - Main synthesizer component that onboarding explains
- **`useMediaQuery`** - Hook for responsive behavior
- **`cn` utility** - Class name merging utility

## 📱 Responsive Behavior

### Desktop Experience

- **Full tooltip positioning** with arrows
- **Hover interactions** for better UX
- **Detailed step descriptions** with full context

### Mobile Experience

- **Touch-optimized controls** for navigation
- **Simplified positioning** for small screens
- **Adaptive step content** for mobile users

## 🚀 Performance Considerations

### Optimization Strategies

- **Portal rendering** prevents layout thrashing
- **Event listener cleanup** prevents memory leaks
- **Debounced resize handling** for smooth performance
- **Conditional rendering** only when needed

### Memory Management

- **Proper cleanup** of event listeners
- **State reset** when component unmounts
- **localStorage error handling** for robustness

## 💡 Best Practices

### Usage Guidelines

1. **Place at app root** for proper portal rendering
2. **Use data attributes** for target element highlighting
3. **Test on mobile** to ensure responsive behavior
4. **Handle localStorage errors** gracefully
5. **Provide clear step descriptions** for better UX

### Integration Tips

- **Coordinate with other modals** to prevent conflicts
- **Use consistent positioning** for step tooltips
- **Test keyboard navigation** for accessibility
- **Validate target selectors** before deployment

## 🔄 Future Enhancements

### Potential Improvements

- **Step customization** via props
- **Animation transitions** between steps
- **Progress persistence** across sessions
- **A/B testing** for different onboarding flows
- **Analytics integration** for user behavior tracking

## 📚 Conclusion

The Onboarding component provides a comprehensive, accessible, and responsive guided tour of the Minimoog synthesizer. It integrates seamlessly with the existing UI, uses modern React patterns, and provides an excellent user experience for new users learning the interface.

The component is production-ready with comprehensive testing, accessibility features, and responsive design that works across all device types.
