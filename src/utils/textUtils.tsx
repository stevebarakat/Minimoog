/**
 * Utility function to convert a string to a slug
 */
export function slugify(str: string) {
  return str.toLowerCase().replace(/ /g, "-");
}
