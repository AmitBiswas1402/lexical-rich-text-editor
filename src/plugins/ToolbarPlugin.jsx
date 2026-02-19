/**
 * ToolbarPlugin — a "headless" plugin with NO rendered UI.
 * It listens to Lexical selection changes and pushes the
 * current text-format flags into the Zustand UI store so
 * the <Toolbar /> component can read them without coupling
 * to the editor instance.
 */
import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_LOW,
} from 'lexical';
import useUIStore from '../store/uiStore';

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const setFormatState = useUIStore((s) => s.setFormatState);

  useEffect(() => {
    // Respond to selection change commands (arrow keys, clicks)
    const unregisterCommand = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        syncFormats();
        return false; // Don't swallow — let other listeners run
      },
      COMMAND_PRIORITY_LOW,
    );

    // Also respond to general updates (typing, formatting)
    const unregisterUpdate = editor.registerUpdateListener(
      ({ editorState }) => {
        editorState.read(() => {
          syncFormats();
        });
      },
    );

    function syncFormats() {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        setFormatState({
          isBold: selection.hasFormat('bold'),
          isItalic: selection.hasFormat('italic'),
          isUnderline: selection.hasFormat('underline'),
          isStrikethrough: selection.hasFormat('strikethrough'),
        });
      }
    }

    return () => {
      unregisterCommand();
      unregisterUpdate();
    };
  }, [editor, setFormatState]);

  return null; // Headless — no UI
}
