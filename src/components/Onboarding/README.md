# Onboarding Component

The Onboarding component provides a step-by-step guided tour for new users to learn about the Minimoog synthesizer interface.

## Features

- **Step-by-step guidance**: Walks users through each major section of the Minimoog
- **Progress tracking**: Visual progress dots show current step and completion status
- **Persistent state**: Remembers if user has completed onboarding using localStorage
- **Responsive design**: Adapts to different screen sizes
- **Vintage aesthetic**: Matches the Minimoog's classic design language
- **Accessible**: Full keyboard navigation and screen reader support

## Usage

The Onboarding component is automatically integrated into the main App component and will show for new users on their first visit.

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

### Components

#### Onboarding

The main onboarding overlay that displays the guided tour.

#### OnboardingTrigger

A floating button (?) that allows users to restart the onboarding flow.

### Hook

#### useOnboarding

Custom hook that manages onboarding state and provides navigation functions.

```tsx
const {
  isVisible,
  currentStep,
  nextStep,
  previousStep,
  skipOnboarding,
  completeOnboarding,
  resetOnboarding,
  hasCompletedOnboarding,
} = useOnboarding();
```

## Onboarding Steps

1. **Welcome** - Introduction to the Minimoog
2. **Oscillators** - Explanation of the three oscillators
3. **Mixer** - How to balance oscillator volumes
4. **Filter** - Understanding the Moog filter
5. **Envelopes** - How envelopes shape the sound
6. **Modulation** - Using LFO and modulation
7. **Keyboard** - Playing and controlling the synth
8. **Presets** - Loading and saving patches
9. **Complete** - Final encouragement to explore

## Data Attributes

The onboarding system uses data attributes to highlight specific components:

- `data-onboarding="oscillators"` - OscillatorBank component
- `data-onboarding="mixer"` - Mixer component
- `data-onboarding="filter"` - Filter component
- `data-onboarding="envelopes"` - Modifiers component (contains envelopes)
- `data-onboarding="modulation"` - Controllers component
- `data-onboarding="keyboard"` - Keyboard component
- `data-onboarding="presets"` - PresetsDropdown component

## Styling

The component uses CSS modules and follows the project's design system:

- Uses `var(--font-futura)` for typography
- Uses `var(--color-panel)`, `var(--color-black)` for colors
- Responsive design with mobile breakpoints
- Smooth animations and transitions

## Testing

The component includes comprehensive tests covering:

- Rendering states (visible/hidden)
- User interactions (next, previous, skip, complete)
- Progress tracking
- Button visibility logic

## Local Storage

The component uses localStorage to persist onboarding completion:

- Key: `"minimoog-onboarding-completed"`
- Value: `"true"` when completed

## Accessibility

- Full keyboard navigation support
- ARIA labels and descriptions
- Screen reader compatible
- High contrast design
- Focus management
