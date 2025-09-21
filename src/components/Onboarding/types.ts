export type OnboardingStep = {
  id: string;
  title: string;
  description: string;
  target?: string;
  position?: "top" | "bottom" | "left" | "right";
};

export type TooltipPosition = {
  top: string;
  left: string;
  width: string;
  height: string;
};

export type ViewportSize = {
  width: number;
  height: number;
};
