/**
 * CSS Modules Performance Monitoring Utilities
 */

type CSSModuleStats = {
  moduleCount: number;
  totalClasses: number;
  averageClassesPerModule: number;
  largestModule: string;
  largestModuleClassCount: number;
};

/**
 * Analyze CSS modules for performance insights
 * This should be used in development only
 */
export function analyzeCSSModules(): CSSModuleStats {
  if (process.env.NODE_ENV !== "development") {
    return {
      moduleCount: 0,
      totalClasses: 0,
      averageClassesPerModule: 0,
      largestModule: "",
      largestModuleClassCount: 0,
    };
  }

  // This is a development-only utility
  // In a real implementation, you'd analyze the actual CSS modules
  console.warn("CSS Modules analysis is a development-only feature");

  return {
    moduleCount: 0,
    totalClasses: 0,
    averageClassesPerModule: 0,
    largestModule: "",
    largestModuleClassCount: 0,
  };
}

/**
 * Log CSS module usage warnings
 */
export function warnLargeCSSModule(
  moduleName: string,
  classCount: number
): void {
  if (process.env.NODE_ENV === "development" && classCount > 20) {
    console.warn(
      `⚠️ Large CSS module detected: ${moduleName} has ${classCount} classes. ` +
        `Consider splitting into smaller modules for better maintainability.`
    );
  }
}

/**
 * Check for unused CSS classes
 */
export function checkUnusedClasses(
  styles: Record<string, string>,
  usedClasses: string[]
): string[] {
  const allClasses = Object.keys(styles);
  return allClasses.filter((className) => !usedClasses.includes(className));
}
