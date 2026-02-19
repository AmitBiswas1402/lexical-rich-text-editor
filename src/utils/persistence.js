/**
 * Persistence layer — localStorage today, swap for a real API later.
 * Every function returns { success, data?, error?, timestamp? }
 * so callers already handle the async-result shape.
 */

const STORAGE_KEY = 'lexical-editor-state';

/**
 * Save the serialised editor state (JSON string).
 */
export async function saveEditorState(serializedState) {
  try {
    localStorage.setItem(STORAGE_KEY, serializedState);
    return { success: true, timestamp: Date.now() };
  } catch (err) {
    console.error('[persistence] save failed:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Load the last-saved editor state.
 * Returns { success: true, data: <json-string> } or { success: false }.
 */
export async function loadEditorState() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return { success: true, data };
    }
    return { success: false, data: null };
  } catch (err) {
    console.error('[persistence] load failed:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Clear saved state (useful for "New Document" flows).
 */
export async function clearEditorState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return { success: true };
  } catch (err) {
    console.error('[persistence] clear failed:', err);
    return { success: false, error: err.message };
  }
}
