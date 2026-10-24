/**
 * useFormDraft.ts
 * Generic hook to auto-save and restore form data using sessionStorage.
 *
 * Usage:
 *   const { draft, updateDraft, clearDraft } = useFormDraft('signin-form', { email: '', password: '' });
 *
 * Rules:
 * - Restores saved draft on mount (never overwrites newer input).
 * - Saves to sessionStorage on every field change (via updateDraft).
 * - clearDraft() must be called explicitly on successful submit.
 * - Password fields are never persisted (sensitive data safety).
 * - sessionStorage is cleared when the browser tab closes (natural lifecycle).
 */
import { useState, useCallback, useEffect, useRef } from 'react';

const SENSITIVE_KEYS = ['password', 'pin', 'secret', 'token', 'cvv', 'otp'];

function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEYS.some((s) => key.toLowerCase().includes(s));
}

function sanitize<T extends Record<string, any>>(data: T): Partial<T> {
  const safe: Partial<T> = {};
  for (const key in data) {
    if (!isSensitiveKey(key)) {
      safe[key] = data[key];
    }
  }
  return safe;
}

export function useFormDraft<T extends Record<string, any>>(
  draftKey: string,
  initialValues: T
): {
  draft: T;
  updateDraft: (updates: Partial<T>) => void;
  clearDraft: () => void;
} {
  // Load from sessionStorage on first render only
  const savedRef = useRef<Partial<T>>({});
  try {
    const raw = sessionStorage.getItem(`vv-draft:${draftKey}`);
    if (raw) savedRef.current = JSON.parse(raw);
  } catch {
    // sessionStorage unavailable or corrupt — ignore
  }

  const [draft, setDraft] = useState<T>({ ...initialValues, ...savedRef.current });

  // Persist to sessionStorage whenever draft changes, excluding sensitive fields
  useEffect(() => {
    try {
      const safe = sanitize(draft);
      sessionStorage.setItem(`vv-draft:${draftKey}`, JSON.stringify(safe));
    } catch {
      // Quota exceeded or unavailable — fail silently
    }
  }, [draft, draftKey]);

  const updateDraft = useCallback((updates: Partial<T>) => {
    setDraft((prev) => ({ ...prev, ...updates }));
  }, []);

  const clearDraft = useCallback(() => {
    try {
      sessionStorage.removeItem(`vv-draft:${draftKey}`);
    } catch {
      // ignore
    }
    setDraft(initialValues);
  }, [draftKey, initialValues]);

  return { draft, updateDraft, clearDraft };
}
