declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

type SynthesizerEvent =
  | "preset_selected"
  | "preset_saved"
  | "oscillator_waveform_changed"
  | "filter_type_changed"
  | "filter_frequency_adjusted"
  | "envelope_modified"
  | "lfo_rate_changed"
  | "modulation_applied"
  | "audio_generated"
  | "app_installed"
  | "keyboard_used"
  | "effect_enabled"
  | "app_loaded";

type EventParameters = {
  preset_name?: string;
  waveform_type?: string;
  filter_type?: string;
  frequency_value?: number;
  envelope_type?: string;
  lfo_rate?: number;
  modulation_source?: string;
  key_pressed?: string;
  effect_type?: string;
  session_duration?: number;
};

export const trackEvent = (
  eventName: SynthesizerEvent,
  parameters?: EventParameters
) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, {
      event_category: "Synthesizer",
      event_label:
        parameters?.preset_name ||
        parameters?.waveform_type ||
        parameters?.filter_type ||
        "",
      value: parameters?.frequency_value || parameters?.lfo_rate || 0,
      custom_parameters: parameters,
      timestamp: Date.now(),
    });
  }
};

export const trackPageView = (pageName: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "page_view", {
      page_title: pageName,
      page_location: window.location.href,
    });
  }
};

export const trackUserEngagement = (action: string, duration?: number) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "user_engagement", {
      event_category: "Engagement",
      event_label: action,
      value: duration || 0,
      engagement_time_msec: duration || 1000,
    });
  }
};

export const trackPerformance = (metric: string, value: number) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "performance_metric", {
      event_category: "Performance",
      event_label: metric,
      value: Math.round(value),
      custom_parameters: {
        metric_name: metric,
        metric_value: value,
      },
    });
  }
};

export const trackError = (
  errorType: string,
  errorMessage: string,
  context?: string
) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "exception", {
      description: `${errorType}: ${errorMessage}`,
      fatal: false,
      custom_parameters: {
        error_type: errorType,
        error_message: errorMessage,
        context: context || "unknown",
      },
    });
  }
};
