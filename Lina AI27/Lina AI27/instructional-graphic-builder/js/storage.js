/**
 * Persistence layer — localStorage for settings and named presets.
 * All storage keys are versioned so future schema changes can migrate cleanly.
 */

import { STORAGE_KEY, PRESETS_KEY, DEFAULT_STATE } from './config.js';

/**
 * Load the last-used settings from localStorage.
 * Falls back to DEFAULT_STATE on any error or missing data.
 */
export function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw);
    // Shallow merge so new keys added in future versions still get defaults
    return { ...DEFAULT_STATE, ...parsed };
  } catch (e) {
    console.warn('Failed to load settings, using defaults.', e);
    return { ...DEFAULT_STATE };
  }
}

/**
 * Persist the current state.
 */
export function saveSettings(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save settings.', e);
  }
}

/**
 * Load all named presets.
 * Returns an array of { id, name, created, updated, state }
 */
export function loadPresets() {
  try {
    const raw = localStorage.getItem(PRESETS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Failed to load presets.', e);
    return [];
  }
}

/**
 * Save the full presets array.
 */
export function savePresets(presets) {
  try {
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
  } catch (e) {
    console.warn('Failed to save presets.', e);
  }
}

/**
 * Add or update a preset. If id is provided and exists, it is updated.
 * Returns the new/updated preset object.
 */
export function upsertPreset(name, state, id = null) {
  const presets = loadPresets();
  const now = new Date().toISOString();

  if (id) {
    const idx = presets.findIndex(p => p.id === id);
    if (idx !== -1) {
      presets[idx] = {
        ...presets[idx],
        name,
        state: { ...state },
        updated: now
      };
      savePresets(presets);
      return presets[idx];
    }
  }

  const newPreset = {
    id: id || `preset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    created: now,
    updated: now,
    state: { ...state }
  };
  presets.push(newPreset);
  savePresets(presets);
  return newPreset;
}

/**
 * Delete a preset by id.
 */
export function deletePreset(id) {
  const presets = loadPresets().filter(p => p.id !== id);
  savePresets(presets);
  return presets;
}

/**
 * Export current prompt text as a downloadable .txt file.
 */
export function downloadText(filename, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Copy text to clipboard with fallback for non-secure contexts.
 */
export async function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  // Fallback
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    return true;
  } catch (e) {
    return false;
  } finally {
    document.body.removeChild(ta);
  }
}
