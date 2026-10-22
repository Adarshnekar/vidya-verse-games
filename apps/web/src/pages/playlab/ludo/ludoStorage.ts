import { SavedMatchState } from './types';

const STORAGE_KEY = 'vidyaverse_math_ludo_active_save_v1';

/**
 * Saves current in-progress match state to localStorage.
 */
export function saveMatch(state: SavedMatchState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Failed to persist Math Ludo game state:', err);
  }
}

/**
 * Loads saved match state from localStorage.
 */
export function loadSavedMatch(): SavedMatchState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedMatchState;

    // Validate that the game wasn't already finished and contains essential fields
    if (parsed && parsed.phase !== 'finished' && Array.isArray(parsed.tokens)) {
      return parsed;
    }
    return null;
  } catch (err) {
    console.warn('Failed to parse saved Math Ludo game state:', err);
    return null;
  }
}

/**
 * Removes the saved match state (e.g. on game completion or starting a fresh match).
 */
export function clearSavedMatch(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear Math Ludo game state:', err);
  }
}

/**
 * Returns true if a valid in-progress match is saved.
 */
export function hasSavedMatch(): boolean {
  return loadSavedMatch() !== null;
}
