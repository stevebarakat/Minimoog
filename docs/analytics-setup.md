# Google Analytics 4 Setup Guide

## Overview

Google Analytics 4 has been successfully integrated into your Minimoog synthesizer app with custom event tracking for synthesizer-specific interactions.

## Setup Steps

### 1. Get Your GA4 Measurement ID

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new GA4 property for your Minimoog app
3. Copy your Measurement ID (format: G-XXXXXXXXXX)

### 2. Replace Placeholder ID

In `index.html`, replace `GA_MEASUREMENT_ID` with your actual Measurement ID:

```html
<script
  async
  src="https://www.googletagmanager.com/gtag/js?id=YOUR_ACTUAL_MEASUREMENT_ID"
></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag("js", new Date());
  gtag("config", "YOUR_ACTUAL_MEASUREMENT_ID", {
    page_title: "Minimoog Synthesizer",
    page_location: window.location.href,
    send_page_view: true,
  });
</script>
```

## Tracked Events

The app now tracks the following synthesizer-specific events:

### Preset Events

- **preset_selected**: When users select a preset
  - Parameters: `preset_name`, `preset_category`

### Keyboard Events

- **keyboard_used**: When users play notes
  - Parameters: `key_pressed`

### Filter Events

- **filter_type_changed**: When users change filter type
  - Parameters: `filter_type`
- **filter_frequency_adjusted**: When users adjust filter cutoff
  - Parameters: `frequency_value`

### Modulation Events

- **lfo_rate_changed**: When users change LFO rate
  - Parameters: `lfo_rate`

## Analytics Functions Available

```typescript
import {
  trackEvent,
  trackPageView,
  trackUserEngagement,
  trackPerformance,
  trackError,
} from "@/utils";

// Track custom events
trackEvent("preset_selected", {
  preset_name: "Moog Bass",
  preset_category: "Bass",
});

// Track page views
trackPageView("Minimoog Synthesizer");

// Track user engagement
trackUserEngagement("session_start", 30000);

// Track performance metrics
trackPerformance("audio_latency", 15.2);

// Track errors
trackError(
  "audio_context_error",
  "Failed to create audio context",
  "initialization"
);
```

## Security Configuration

The following domains have been added to your Content Security Policy:

- `https://www.googletagmanager.com` (script loading)
- `https://www.google-analytics.com` (data sending)

## Testing

1. Replace the Measurement ID with your actual ID
2. Deploy your app
3. Visit your app and interact with the synthesizer
4. Check Google Analytics Real-time reports to see events coming in

## Privacy Considerations

- GA4 is GDPR compliant by default
- No personally identifiable information is tracked
- Users can opt out via browser settings or ad blockers
- Consider adding a privacy notice about analytics usage

## Next Steps

1. Set up custom goals in GA4 for synthesizer usage
2. Create custom reports for synthesizer-specific metrics
3. Set up conversion tracking for app installations
4. Monitor performance and user engagement patterns
