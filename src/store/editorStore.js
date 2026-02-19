import { create } from 'zustand';

/**
 * Editor content store — tracks the serialized document state
 * and save status. Separated from Lexical's internal state
 * so UI components can react to save events without coupling
 * to the editor instance.
 */
const useEditorStore = create((set) => ({
  /** JSON string of the current editor state */
  serializedState: null,

  /** Whether there are unsaved changes */
  isDirty: false,

  /** Timestamp of last successful save */
  lastSaved: null,

  setSerializedState: (state) =>
    set({ serializedState: state, isDirty: true }),

  markSaved: () =>
    set({ isDirty: false, lastSaved: Date.now() }),
}));

export default useEditorStore;
