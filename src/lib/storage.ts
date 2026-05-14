/**
 * Shared localStorage utility functions for AeroMiles
 * Foundation module for all features
 */

/**
 * Parse and return JSON from localStorage
 * @param key - localStorage key
 * @returns Parsed data or empty array if null/invalid
 */
export function getFromStorage<T = any>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading from storage key "${key}":`, error);
    return [];
  }
}

/**
 * JSON.stringify and save to localStorage
 * @param key - localStorage key
 * @param data - Data to save
 */
export function saveToStorage(key: string, data: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to storage key "${key}":`, error);
  }
}


