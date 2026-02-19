/**
 * PersistencePlugin — debounced auto-save of the editor state
 * to localStorage (via the persistence utility).
 *
 * It also keeps the Zustand editorStore in sync so other UI
 * (e.g. a "Saved ✓" indicator) can react to save events.
 */
import { useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { saveEditorState } from '../utils/persistence';
import useEditorStore from '../store/editorStore';

const SAVE_DELAY_MS = 1000; // debounce interval

export default function PersistencePlugin() {
  const [editor] = useLexicalComposerContext();
  const setSerializedState = useEditorStore((s) => s.setSerializedState);
  const markSaved = useEditorStore((s) => s.markSaved);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const unregister = editor.registerUpdateListener(
      ({ editorState, dirtyElements, dirtyLeaves }) => {
        // Skip no-op updates (e.g. selection-only changes)
        if (dirtyElements.size === 0 && dirtyLeaves.size === 0) return;

        const json = JSON.stringify(editorState.toJSON());
        setSerializedState(json);

        // Debounced write to storage
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(async () => {
          const result = await saveEditorState(json);
          if (result.success) markSaved();
        }, SAVE_DELAY_MS);
      },
    );

    return () => {
      unregister();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [editor, setSerializedState, markSaved]);

  return null;
}
