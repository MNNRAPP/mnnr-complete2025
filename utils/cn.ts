/**
 * @module utils/cn
 * @description Utility for merging Tailwind CSS class names with conflict resolution.
 *
 * Combines `clsx` (conditional class joining) with `tailwind-merge` (conflict resolution)
 * to produce a single, deduplicated class string. This prevents Tailwind specificity
 * issues when composing component styles.
 *
 * @example
 * ```tsx
 * import { cn } from '@/utils/cn';
 *
 * // Merge conditional classes with conflict resolution
 * <div className={cn('px-4 py-2', isActive && 'bg-blue-500', 'px-6')} />
 * // Result: "py-2 bg-blue-500 px-6" (px-4 is resolved in favor of px-6)
 * ```
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges multiple class values into a single string with Tailwind conflict resolution.
 *
 * Accepts the same inputs as `clsx`: strings, objects, arrays, and falsy values.
 * Tailwind classes that conflict (e.g., `px-4` vs `px-6`) are resolved to the last one.
 *
 * @param inputs - Class values to merge (strings, conditionals, arrays, objects).
 * @returns A single, deduplicated class name string.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
