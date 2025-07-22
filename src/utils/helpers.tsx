import { clsx, type ClassValue } from "clsx";

/**
 * Utility function to convert a string to a slug
 */
export function slugify(str: string) {
  return str.toLowerCase().replace(/ /g, "-");
}

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

/**
 * Utility for combining multiple CSS module classes
 */
export function combineStyles(
  ...styleObjects: (Record<string, string> | undefined | null)[]
): Record<string, string> {
  return styleObjects
    .filter((styles): styles is Record<string, string> => styles != null)
    .reduce((acc, styles) => ({ ...acc, ...styles }), {});
}
