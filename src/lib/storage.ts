/**
 * Shared localStorage utility functions for AeroMiles
 * Foundation module for all features
 */

export interface Member {
  email: string;
  award_miles: number;
  total_miles: number;
  [key: string]: any;
}

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

/**
 * Update member miles by email
 * Modifies both "aeromiles_users" and "aeromiles_session" if email matches current session
 * @param email - Member email
 * @param awardDelta - Amount to add to award_miles
 * @param totalDelta - Amount to add to total_miles
 */
export function updateMemberMiles(
  email: string,
  awardDelta: number,
  totalDelta: number
): void {
  // Update aeromiles_users
  const users = getFromStorage<Member>("aeromiles_users");
  const userIndex = users.findIndex((u) => u.email === email);

  if (userIndex !== -1) {
    users[userIndex].award_miles = Math.max(
      0,
      (users[userIndex].award_miles || 0) + awardDelta
    );
    users[userIndex].total_miles = Math.max(
      0,
      (users[userIndex].total_miles || 0) + totalDelta
    );
    saveToStorage("aeromiles_users", users);
  }

  // Update aeromiles_session if email matches
  try {
    const sessionStr = localStorage.getItem("aeromiles_session");
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      if (session.email === email) {
        session.award_miles = Math.max(0, (session.award_miles || 0) + awardDelta);
        session.total_miles = Math.max(0, (session.total_miles || 0) + totalDelta);
        localStorage.setItem("aeromiles_session", JSON.stringify(session));

        // Emit session change event for navbar sync
        window.dispatchEvent(new Event("SESSION_CHANGED_EVENT"));
      }
    }
  } catch (error) {
    console.error("Error updating session miles:", error);
  }
}
