# Onboarding Component

The Onboarding component provides a step-by-step guided tour for new users to learn about the Minimoog synthesizer interface. It uses custom tooltip components with portal rendering for proper positioning and is automatically disabled on mobile devices.

## 🗂️ Quick Overview

### Core Features

- **Step-by-step guidance** - Walks users through each major section of the Minimoog
- **Progress tracking** - Visual progress dots show current step and completion status
- **Persistent state** - Remembers if user has completed onboarding using localStorage
- **Mobile-aware** - Automatically disabled on mobile devices for better UX
- **Vintage aesthetic** - Matches the Minimoog's classic design language
- **Accessible** - Full keyboard navigation and screen reader support
- **Target highlighting** - Highlights specific UI elements with CSS selectors
- **Portal rendering** - Ensures proper tooltip positioning across the entire page

### Key Components

- **`Onboarding`** - Main onboarding overlay that displays the guided tour
- **`useOnboarding`** - Custom hook that manages onboarding state and navigation
- **`OnboardingTooltip`** - Custom tooltip component with positioning logic
- **`OnboardingHighlight`** - Component for highlighting target elements
- **`OnboardingNavigation`** - Navigation controls with progress dots
- **`useTargetElement`** - Hook for finding and tracking target elements
- **`useViewportTracking`** - Hook for responsive positioning

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
  closeOnboarding,
  resetOnboarding,
  goToStep,
  hasCompletedOnboarding,
} = useOnboarding(14); // Total steps: 14
```

## 📋 Onboarding Steps

The component includes **14 comprehensive steps** that guide users through the entire Minimoog interface:

1. **Welcome** - Introduction to the Minimoog synthesizer
2. **Oscillators** - Understanding the three oscillators and their waveforms
3. **Mixer** - Balancing oscillator volumes, noise, and external input
4. **Filter** - The legendary Moog filter with cutoff and emphasis controls
5. **Filter Envelope** - Dynamic filter shaping with ADSR controls
6. **Loudness Envelope** - Volume shaping over time
7. **Controllers** - Fine-tuning with tune, glide, and modulation mix controls
8. **Modulation** - LFO and modulation wheel usage
9. **Keyboard** - Playing and controlling the synthesizer
10. **Options** - Tour settings, learning mode, and magnified knobs
11. **Presets** - Loading and saving patches
12. **Effects** - Built-in delay and reverb effects
13. **Copy Settings** - Sharing patches via URL generation
14. **Power** - Final step encouraging users to start creating

### Step Configuration

Each step includes:

- **`id`** - Unique identifier for the step
- **`title`** - Step heading displayed to the user
- **`description`** - Detailed explanation of the feature
- **`target`** - CSS selector for highlighting specific UI elements
- **`position`** - Tooltip positioning relative to the target

## 🎯 Implementation Details

### Custom Tooltip Implementation

The component uses custom tooltip components for accessible tooltips:

- **OnboardingTooltip** - Main tooltip component with positioning logic
- **Portal rendering** - Uses `createPortal` for proper positioning
- **Custom positioning** - Dynamic positioning based on target element location
- **Responsive design** - Adapts positioning based on viewport size

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

### Mobile Behavior

- **Automatic mobile detection** using `useIsMobile` hook
- **Disabled on mobile** - Onboarding is completely hidden on mobile devices
- **Desktop-only experience** - Optimized for desktop/laptop interactions
- **Viewport-aware rendering** that adapts to screen size changes

## 🔧 Hook API Reference

### `useOnboarding(totalSteps: number = 14)`

#### Parameters

- **`totalSteps`** - Total number of onboarding steps (default: 14)

#### Return Values

| Property                 | Type                          | Description                                 |
| ------------------------ | ----------------------------- | ------------------------------------------- |
| `isVisible`              | `boolean`                     | Whether the onboarding is currently visible |
| `currentStep`            | `number`                      | Current step index (0-based)                |
| `isOnboardingEnabled`    | `boolean`                     | Whether onboarding is enabled in store      |
| `toggleOnboarding`       | `() => void`                  | Toggle onboarding enabled/disabled state    |
| `nextStep`               | `() => void`                  | Move to the next step                       |
| `previousStep`           | `() => void`                  | Move to the previous step                   |
| `closeOnboarding`        | `() => void`                  | Complete and hide onboarding                |
| `resetOnboarding`        | `() => void`                  | Reset to first step and show onboarding     |
| `goToStep`               | `(stepIndex: number) => void` | Jump to a specific step                     |
| `hasCompletedOnboarding` | `boolean`                     | Whether user has completed onboarding       |

### State Management

The hook manages several pieces of state:

- **Current step tracking** with bounds checking
- **Visibility state** for showing/hiding the overlay
- **Onboarding preference** stored in the synth store
- **Viewport size** for responsive positioning

### Store Integration

Onboarding preferences are managed through the synth store:

- **Store key**: `options.welcomeTour` (boolean)
- **Store key**: `options.onboardingVisible` (boolean)
- **Default**: `welcomeTour: true`, `onboardingVisible: false`
- **Persistence**: Managed through typed storage system
- **Integration**: Uses `useSynthStore` for state management

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
- **`.highlight`** - Target element highlighting overlay
- **`.checkbox`** - "Don't show again" checkbox styling

## ♿ Accessibility Features

### ARIA Support

- **Custom tooltip semantics** with proper ARIA attributes
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
- **`useMediaQuery`** - Hook for responsive behavior (includes `useIsMobile`)
- **`cn` utility** - Class name merging utility
- **`useSynthStore`** - Store integration for state management
- **`Button`** - UI component used in navigation

## 📱 Responsive Behavior

### Desktop Experience

- **Full tooltip positioning** with arrows
- **Hover interactions** for better UX
- **Detailed step descriptions** with full context
- **Complete onboarding flow** with all 14 steps

### Mobile Experience

- **Completely disabled** - Onboarding is hidden on mobile devices
- **Automatic detection** - Uses `useIsMobile` hook to detect mobile
- **Better UX** - Avoids complex interactions on touch devices

## 🚀 Performance Considerations

### Optimization Strategies

- **Portal rendering** prevents layout thrashing
- **Event listener cleanup** prevents memory leaks
- **Debounced resize handling** for smooth performance
- **Conditional rendering** only when needed

### Memory Management

- **Proper cleanup** of event listeners
- **State reset** when component unmounts
- **Store error handling** for robustness

## 💡 Best Practices

### Usage Guidelines

1. **Place at app root** for proper portal rendering
2. **Use data attributes** for target element highlighting
3. **Test on desktop** - mobile automatically disabled
4. **Handle store state** properly with useSynthStore
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

The Onboarding component provides a comprehensive, accessible guided tour of the Minimoog synthesizer for desktop users. It integrates seamlessly with the existing UI through the synth store, uses modern React patterns with custom tooltip components, and provides an excellent user experience for new users learning the interface.

The component is production-ready with comprehensive testing, accessibility features, and intelligent mobile detection that automatically disables the tour on mobile devices for optimal user experience.
