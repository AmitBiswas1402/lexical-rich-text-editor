import { create } from 'zustand';

/**
 * UI store — owns toolbar formatting indicators, modal visibility,
 * and math-editing state. Completely separate from the editor
 * content store so toolbar re-renders don't touch document state.
 */
const useUIStore = create((set) => ({
  /* ---- Text-format indicators (synced from Lexical selection) ---- */
  isBold: false,
  isItalic: false,
  isUnderline: false,
  isStrikethrough: false,

  /* ---- Modal visibility ---- */
  showTableModal: false,
  showMathModal: false,

  /* ---- Math edit context (non-null when editing existing node) ---- */
  mathEdit: null, // { nodeKey, latex, inline }

  /* ---- Page orientation ---- */
  pageOrientation: 'portrait', // 'portrait' | 'landscape'

  /* ---- Page margins ---- */
  pageMargin: 'normal', // 'narrow' | 'normal' | 'wide' | 'none'

  /* ---- Actions ---- */
  setFormatState: (formats) => set(formats),

  setPageOrientation: (orientation) => set({ pageOrientation: orientation }),

  setPageMargin: (margin) => set({ pageMargin: margin }),

  openTableModal: () => set({ showTableModal: true }),
  closeTableModal: () => set({ showTableModal: false }),

  openMathModal: (editData = null) =>
    set({ showMathModal: true, mathEdit: editData }),

  closeMathModal: () =>
    set({ showMathModal: false, mathEdit: null }),
}));

export default useUIStore;
