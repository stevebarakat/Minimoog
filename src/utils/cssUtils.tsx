import { clsx, type ClassValue } from "clsx";

/**
 * Enhanced utility function to conditionally join class names together
 * Uses clsx for better conditional class handling
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/**
 * Utility for combining CSS module classes with conditional logic
 */
export function cssModule(
  styles: Record<string, string>,
  ...classes: (string | boolean | undefined | null)[]
): string {
  return classes
    .filter(Boolean)
    .map((className) => styles[className as string])
    .filter(Boolean)
    .join(" ");
}
