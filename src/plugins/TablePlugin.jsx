/**
 * TableInsertPlugin — registers a custom command for inserting
 * a table with N rows × M columns.  The actual table nodes come
 * from @lexical/table; this plugin only owns the *insertion* logic.
 *
 * The built-in <TablePlugin /> from @lexical/react is still needed
 * alongside this for cell selection / keyboard navigation inside
 * tables — that is mounted separately in Editor.jsx.
 */
import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $createTableNode,
  $createTableRowNode,
  $createTableCellNode,
  TableCellHeaderStates,
} from '@lexical/table';
import {
  $createParagraphNode,
  $createTextNode,
  createCommand,
  COMMAND_PRIORITY_EDITOR,
} from 'lexical';
import { $insertNodeToNearestRoot } from '@lexical/utils';

/** Dispatch this command with { rows: number, columns: number } */
export const INSERT_TABLE_COMMAND = createCommand('INSERT_TABLE_COMMAND');

/**
 * Build a table node tree with the specified dimensions.
 * First row is treated as a header row.
 */
function $createTableWithDimensions(rows, columns) {
  const tableNode = $createTableNode();

  for (let r = 0; r < rows; r++) {
    const rowNode = $createTableRowNode();

    for (let c = 0; c < columns; c++) {
      const headerState =
        r === 0
          ? TableCellHeaderStates.ROW
          : TableCellHeaderStates.NO_STATUS;

      const cellNode = $createTableCellNode(headerState);
      const paragraph = $createParagraphNode();
      paragraph.append($createTextNode(''));
      cellNode.append(paragraph);
      rowNode.append(cellNode);
    }

    tableNode.append(rowNode);
  }

  return tableNode;
}

export default function TableInsertPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      INSERT_TABLE_COMMAND,
      ({ rows, columns }) => {
        editor.update(() => {
          const tableNode = $createTableWithDimensions(rows, columns);
          $insertNodeToNearestRoot(tableNode);
        });
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);

  return null;
}
