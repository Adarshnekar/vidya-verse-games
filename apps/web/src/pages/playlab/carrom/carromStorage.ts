// =========================================================
// VIDYAVERSE NEWTON'S CARROM — LOCAL STORAGE PERSISTENCE
// =========================================================

import { CarromSavedGame, CarromMatchState } from './types';

const STORAGE_KEY_MATCH = 'vidyaverse_carrom_active_match';
const STORAGE_KEY_SOUND = 'vidyaverse_carrom_sound_pref';

export function saveCarromMatch(data: CarromSavedGame): void {
  try {
    localStorage.setItem(STORAGE_KEY_MATCH, JSON.stringify(data));
  } catch (err) {
    console.warn('[CarromStorage] Failed to save match state', err);
  }
}

export function loadCarromMatch(): CarromSavedGame | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MATCH);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CarromSavedGame;
    // Discard saved matches older than 24 hours
    if (Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) {
      clearCarromMatch();
      return null;
    }
    return parsed;
  } catch (err) {
    console.warn('[CarromStorage] Failed to parse saved match', err);
    return null;
  }
}

export function clearCarromMatch(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_MATCH);
  } catch (err) {
    console.warn('[CarromStorage] Failed to clear match', err);
  }
}

export function saveSoundPreference(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY_SOUND, enabled ? 'true' : 'false');
  } catch {}
}

export function loadSoundPreference(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SOUND);
    return raw !== 'false';
  } catch {
    return true;
  }
}
