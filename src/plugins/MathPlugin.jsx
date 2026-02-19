/**
 * MathPlugin — registers commands for inserting and updating
 * MathNode instances.  Keeps all math-mutation logic in one place.
 *
 * Commands:
 *   INSERT_MATH_COMMAND  { latex: string, inline: boolean }
 *   UPDATE_MATH_COMMAND  { nodeKey: string, latex: string }
 */
import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  $getNodeByKey,
  createCommand,
  COMMAND_PRIORITY_EDITOR,
} from 'lexical';
import { $insertNodeToNearestRoot } from '@lexical/utils';
import { $createMathNode, MathNode } from '../nodes/MathNode';

export const INSERT_MATH_COMMAND = createCommand('INSERT_MATH_COMMAND');
export const UPDATE_MATH_COMMAND = createCommand('UPDATE_MATH_COMMAND');

export default function MathPlugin() {
  const [editor] = useLexicalComposerContext();

  /* Validate that MathNode is registered in the editor config */
  useEffect(() => {
    if (!editor.hasNodes([MathNode])) {
      throw new Error(
        'MathPlugin: MathNode is not registered. ' +
          'Add it to the "nodes" array in your editor config.',
      );
    }
  }, [editor]);

  useEffect(() => {
    /* ---- Insert new math expression ---- */
    const unregisterInsert = editor.registerCommand(
      INSERT_MATH_COMMAND,
      ({ latex, inline }) => {
        editor.update(() => {
          const mathNode = $createMathNode(latex, inline);

          if (inline) {
            // Insert at the caret position inside the current paragraph
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              selection.insertNodes([mathNode]);
            }
          } else {
            // Block math — place at root level
            $insertNodeToNearestRoot(mathNode);
          }
        });
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );

    /* ---- Update existing math expression ---- */
    const unregisterUpdate = editor.registerCommand(
      UPDATE_MATH_COMMAND,
      ({ nodeKey, latex }) => {
        editor.update(() => {
          const node = $getNodeByKey(nodeKey);
          if (node instanceof MathNode) {
            node.setLatex(latex);
          }
        });
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );

    return () => {
      unregisterInsert();
      unregisterUpdate();
    };
  }, [editor]);

  return null;
}
