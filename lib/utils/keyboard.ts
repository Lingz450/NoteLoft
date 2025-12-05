/**
 * Keyboard Utilities
 * 
 * Helper functions for keyboard shortcuts and OS detection.
 */

/**
 * Detect if user is on Mac
 */
export function isMac(): boolean {
  if (typeof window === "undefined") return false;
  return /Mac|iPhone|iPod|iPad/i.test(navigator.platform) || 
         /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent);
}

/**
 * Get the modifier key symbol based on OS
 */
export function getModifierKey(): "⌘" | "Ctrl" {
  return isMac() ? "⌘" : "Ctrl";
}

/**
 * Get modifier key name for display
 */
export function getModifierKeyName(): "Cmd" | "Ctrl" {
  return isMac() ? "Cmd" : "Ctrl";
}

/**
 * Check if modifier key is pressed
 */
export function isModifierKey(e: KeyboardEvent | React.KeyboardEvent): boolean {
  return isMac() ? e.metaKey : e.ctrlKey;
}

/**
 * Format keyboard shortcut for display
 */
export function formatShortcut(keys: string[]): string[] {
  const modifier = getModifierKey();
  return keys.map(key => {
    if (key === "⌘" || key === "Cmd") return modifier;
    if (key === "Ctrl" && isMac()) return "⌘";
    return key;
  });
}

/**
 * Check if a keyboard event matches a shortcut
 */
export function matchesShortcut(
  e: KeyboardEvent | React.KeyboardEvent,
  keys: string[]
): boolean {
  const modifier = isMac() ? e.metaKey : e.ctrlKey;
  const shift = e.shiftKey;
  const alt = e.altKey;
  
  // Normalize key
  const key = e.key.toLowerCase();
  
  // Check each key in the shortcut
  for (const shortcutKey of keys) {
    const normalized = shortcutKey.toLowerCase();
    
    if (normalized === "⌘" || normalized === "cmd" || normalized === "ctrl") {
      if (!modifier) return false;
    } else if (normalized === "shift") {
      if (!shift) return false;
    } else if (normalized === "alt" || normalized === "option") {
      if (!alt) return false;
    } else {
      if (key !== normalized) return false;
    }
  }
  
  return true;
}

